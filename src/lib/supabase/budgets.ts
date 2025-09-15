import { supabase } from '@/lib/supabase/client'
import { endOfMonth, endOfWeek, endOfYear, differenceInDays, isAfter, isBefore } from 'date-fns'
import type {
  Budget,
  BudgetInput,
  BudgetFilters,
  BudgetWithStats,
  BudgetPeriod,
} from '@/lib/validations/budget'

export async function getBudgets(
  userId: string,
  filters?: BudgetFilters
): Promise<{ data: Budget[]; error: string | null }> {
  try {
    let query = supabase
      .from('budgets')
      .select(
        `
        *,
        category:categories (
          id,
          name,
          type,
          color,
          icon
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters) {
      if (filters.period) {
        query = query.eq('period', filters.period)
      }
      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId)
      }

      // Status filter requires date logic - we'll handle this in the results
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching budgets:', error)
      return { data: [], error: error.message }
    }

    // Apply status filter if needed
    let filteredData = data || []
    if (filters?.status) {
      const now = new Date()
      filteredData = filteredData.filter((budget: any) => {
        const startDate = new Date(budget.start_date)
        const endDate = budget.end_date
          ? new Date(budget.end_date)
          : getPeriodEndDate(startDate, budget.period)

        switch (filters.status) {
          case 'active':
            return !isBefore(now, startDate) && !isAfter(now, endDate)
          case 'expired':
            return isAfter(now, endDate)
          case 'upcoming':
            return isBefore(now, startDate)
          default:
            return true
        }
      })
    }

    return { data: filteredData, error: null }
  } catch (err) {
    console.error('Unexpected error fetching budgets:', err)
    return { data: [], error: 'Failed to fetch budgets' }
  }
}

export async function getBudgetsWithStats(
  userId: string,
  filters?: BudgetFilters
): Promise<{ data: BudgetWithStats[]; error: string | null }> {
  try {
    const { data: budgets, error: budgetError } = await getBudgets(userId, filters)

    if (budgetError) {
      return { data: [], error: budgetError }
    }

    // Get spending data for each budget
    const budgetsWithStats = await Promise.all(
      budgets.map(async (budget): Promise<BudgetWithStats> => {
        const periodRange = getBudgetPeriodRange(budget)

        // Get transactions for this budget's category and period
        const { data: transactions, error: transactionsError } = await supabase
          .from('transactions')
          .select('amount, date')
          .eq('user_id', userId)
          .eq('category_id', budget.category_id)
          .eq('type', 'expense') // Budgets are for expenses only
          .gte('date', periodRange.start.toISOString().split('T')[0])
          .lte('date', periodRange.end.toISOString().split('T')[0])

        let spentAmount = 0
        let transactionCount = 0

        if (!transactionsError && transactions) {
          spentAmount = transactions.reduce((sum, t: any) => sum + Number(t.amount), 0)
          transactionCount = transactions.length
        }

        const budgetAmount = Number(budget.amount)
        const remainingAmount = budgetAmount - spentAmount
        const spentPercentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0
        const isOverBudget = spentAmount > budgetAmount

        // Calculate days remaining in period
        const now = new Date()
        const daysRemaining = Math.max(0, differenceInDays(periodRange.end, now))

        // Calculate daily average and projection
        const totalDays = differenceInDays(periodRange.end, periodRange.start) + 1
        const daysPassed = totalDays - daysRemaining
        const dailyAverage = daysPassed > 0 ? spentAmount / daysPassed : 0
        const projectedSpending = dailyAverage * totalDays

        return {
          ...budget,
          spent_amount: spentAmount,
          remaining_amount: remainingAmount,
          spent_percentage: spentPercentage,
          transaction_count: transactionCount,
          is_over_budget: isOverBudget,
          days_remaining: daysRemaining,
          daily_average: dailyAverage,
          projected_spending: projectedSpending,
        }
      })
    )

    // Apply over budget filter if specified
    const finalData = filters?.overBudget
      ? budgetsWithStats.filter(b => b.is_over_budget === filters.overBudget)
      : budgetsWithStats

    return { data: finalData, error: null }
  } catch (err) {
    console.error('Unexpected error fetching budgets with stats:', err)
    return { data: [], error: 'Failed to fetch budget statistics' }
  }
}

export async function getBudget(
  id: string,
  userId: string
): Promise<{ data: Budget | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .select(
        `
        *,
        category:categories (
          id,
          name,
          type,
          color,
          icon
        )
      `
      )
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching budget:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error fetching budget:', err)
    return { data: null, error: 'Failed to fetch budget' }
  }
}

export async function createBudget(
  userId: string,
  budget: BudgetInput
): Promise<{ data: Budget | null; error: string | null }> {
  try {
    const endDate = budget.endDate || getPeriodEndDate(budget.startDate, budget.period)

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        user_id: userId,
        category_id: budget.categoryId,
        amount: budget.amount,
        period: budget.period,
        start_date: budget.startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      } as any)
      .select(
        `
        *,
        category:categories (
          id,
          name,
          type,
          color,
          icon
        )
      `
      )
      .single()

    if (error) {
      console.error('Error creating budget:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error creating budget:', err)
    return { data: null, error: 'Failed to create budget' }
  }
}

export async function updateBudget(
  id: string,
  userId: string,
  updates: Partial<BudgetInput>
): Promise<{ data: Budget | null; error: string | null }> {
  try {
    const updateData: any = {}

    if (updates.amount !== undefined) updateData.amount = updates.amount
    if (updates.period !== undefined) updateData.period = updates.period
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId
    if (updates.startDate !== undefined) {
      updateData.start_date = updates.startDate.toISOString().split('T')[0]

      // If start date is updated and no explicit end date, recalculate end date
      if (!updates.endDate) {
        const period = updates.period || 'monthly' // Default period
        updateData.end_date = getPeriodEndDate(updates.startDate, period)
          .toISOString()
          .split('T')[0]
      }
    }
    if (updates.endDate !== undefined) {
      updateData.end_date = updates.endDate.toISOString().split('T')[0]
    }

    const { data, error } = await (supabase as any)
      .from('budgets')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select(
        `
        *,
        category:categories (
          id,
          name,
          type,
          color,
          icon
        )
      `
      )
      .single()

    if (error) {
      console.error('Error updating budget:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error updating budget:', err)
    return { data: null, error: 'Failed to update budget' }
  }
}

export async function deleteBudget(id: string, userId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from('budgets').delete().eq('id', id).eq('user_id', userId)

    if (error) {
      console.error('Error deleting budget:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (err) {
    console.error('Unexpected error deleting budget:', err)
    return { error: 'Failed to delete budget' }
  }
}

// Helper functions
function getPeriodEndDate(startDate: Date, period: BudgetPeriod): Date {
  switch (period) {
    case 'weekly':
      return endOfWeek(startDate)
    case 'monthly':
      return endOfMonth(startDate)
    case 'yearly':
      return endOfYear(startDate)
    default:
      return endOfMonth(startDate)
  }
}

function getBudgetPeriodRange(budget: Budget): { start: Date; end: Date } {
  const startDate = new Date(budget.start_date)
  const endDate = budget.end_date
    ? new Date(budget.end_date)
    : getPeriodEndDate(startDate, budget.period)

  return { start: startDate, end: endDate }
}

export async function getBudgetOverview(userId: string): Promise<{
  data: {
    totalBudgets: number
    totalBudgetAmount: number
    totalSpent: number
    overBudgetCount: number
    activeBudgets: number
  } | null
  error: string | null
}> {
  try {
    const { data: budgetsWithStats, error } = await getBudgetsWithStats(userId, {
      status: 'active',
    })

    if (error) {
      return { data: null, error }
    }

    const overview = {
      totalBudgets: budgetsWithStats.length,
      totalBudgetAmount: budgetsWithStats.reduce((sum, b) => sum + Number(b.amount), 0),
      totalSpent: budgetsWithStats.reduce((sum, b) => sum + b.spent_amount, 0),
      overBudgetCount: budgetsWithStats.filter(b => b.is_over_budget).length,
      activeBudgets: budgetsWithStats.length,
    }

    return { data: overview, error: null }
  } catch (err) {
    console.error('Unexpected error fetching budget overview:', err)
    return { data: null, error: 'Failed to fetch budget overview' }
  }
}
