import { supabase } from '@/lib/supabase/client'
import {
  subMonths as _subMonths,
  subDays as _subDays,
  startOfMonth as _startOfMonth,
  endOfMonth as _endOfMonth,
  startOfWeek as _startOfWeek,
  endOfWeek as _endOfWeek,
  startOfYear as _startOfYear,
  endOfYear as _endOfYear,
} from 'date-fns'

export interface DateRange {
  from: Date
  to: Date
}

export interface FinancialKPI {
  netWorth: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlyNet: number
  savingsRate: number
  spendingVelocity: number
  financialHealthScore: number
  emergencyFundRatio: number
  topSpendingCategory: {
    name: string
    amount: number
    percentage: number
  } | null
  incomeGrowth: number
  expenseGrowth: number
}

export interface PeriodComparison {
  currentPeriod: {
    income: number
    expenses: number
    net: number
    transactionCount: number
  }
  previousPeriod: {
    income: number
    expenses: number
    net: number
    transactionCount: number
  }
  changes: {
    incomeChange: number
    expenseChange: number
    netChange: number
    transactionCountChange: number
    incomePercentChange: number
    expensePercentChange: number
    netPercentChange: number
  }
}

export interface SpendingTrend {
  date: string
  income: number
  expenses: number
  net: number
  cumulativeIncome: number
  cumulativeExpenses: number
  cumulativeNet: number
}

export interface CategoryInsight {
  categoryId: string
  categoryName: string
  categoryColor: string
  totalAmount: number
  transactionCount: number
  averageTransaction: number
  percentage: number
  monthlyAverage: number
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
}

// Calculate comprehensive financial KPIs
export async function getFinancialKPIs(
  userId: string,
  dateRange: DateRange
): Promise<{ data: FinancialKPI | null; error: string | null }> {
  try {
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select(
        `
        id,
        amount,
        type,
        date,
        category:categories (
          id,
          name,
          color
        )
      `
      )
      .eq('user_id', userId)
      .gte('date', dateRange.from.toISOString().split('T')[0])
      .lte('date', dateRange.to.toISOString().split('T')[0])

    if (transactionsError) {
      return { data: null, error: transactionsError.message }
    }

    const currentTransactions = transactions || []

    // Get previous period for comparison (same length as current period)
    const periodLength = dateRange.to.getTime() - dateRange.from.getTime()
    const previousDateRange = {
      from: new Date(dateRange.from.getTime() - periodLength),
      to: new Date(dateRange.to.getTime() - periodLength),
    }

    const { data: previousTransactions, error: previousError } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userId)
      .gte('date', previousDateRange.from.toISOString().split('T')[0])
      .lte('date', previousDateRange.to.toISOString().split('T')[0])

    if (previousError) {
      return { data: null, error: previousError.message }
    }

    // Calculate basic metrics
    const currentIncome = currentTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const currentExpenses = currentTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const currentNet = currentIncome - currentExpenses

    const previousIncome = (previousTransactions || [])
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const previousExpenses = (previousTransactions || [])
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    // Calculate growth rates
    const incomeGrowth =
      previousIncome > 0
        ? ((currentIncome - previousIncome) / previousIncome) * 100
        : currentIncome > 0
          ? 100
          : 0

    const expenseGrowth =
      previousExpenses > 0
        ? ((currentExpenses - previousExpenses) / previousExpenses) * 100
        : currentExpenses > 0
          ? 100
          : 0

    // Calculate days in period for monthly averages
    const daysInPeriod = Math.ceil(
      (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
    )
    const monthlyMultiplier = 30 / daysInPeriod

    const monthlyIncome = currentIncome * monthlyMultiplier
    const monthlyExpenses = currentExpenses * monthlyMultiplier
    const monthlyNet = monthlyIncome - monthlyExpenses

    // Savings rate (income - expenses) / income * 100
    const savingsRate = currentIncome > 0 ? (currentNet / currentIncome) * 100 : 0

    // Spending velocity (average daily spending)
    const spendingVelocity = daysInPeriod > 0 ? currentExpenses / daysInPeriod : 0

    // Emergency fund ratio (assume 3-6 months of expenses is ideal)
    // This is a simplified calculation - in practice, you'd need actual savings data
    const emergencyFundRatio =
      monthlyExpenses > 0 ? Math.max(0, currentNet) / (monthlyExpenses * 3) : 0

    // Financial health score (0-100 based on various factors)
    let healthScore = 50 // Base score

    // Positive savings rate increases score
    if (savingsRate > 20) healthScore += 30
    else if (savingsRate > 10) healthScore += 20
    else if (savingsRate > 0) healthScore += 10
    else healthScore -= 20

    // Income stability (positive income growth is good)
    if (incomeGrowth > 0) healthScore += 10
    else if (incomeGrowth < -10) healthScore -= 15

    // Expense control (stable or decreasing expenses is good)
    if (expenseGrowth < 0) healthScore += 10
    else if (expenseGrowth > 20) healthScore -= 15

    // Emergency fund adequacy
    if (emergencyFundRatio >= 1) healthScore += 10
    else if (emergencyFundRatio < 0.1) healthScore -= 10

    // Ensure score is between 0-100
    const financialHealthScore = Math.max(0, Math.min(100, healthScore))

    // Find top spending category
    const categorySpending = currentTransactions
      .filter(t => t.type === 'expense' && t.category)
      .reduce(
        (acc, transaction) => {
          const categoryId = transaction.category.id
          const categoryName = transaction.category.name
          if (!acc[categoryId]) {
            acc[categoryId] = {
              name: categoryName,
              amount: 0,
              count: 0,
            }
          }
          acc[categoryId].amount += Number(transaction.amount)
          acc[categoryId].count++
          return acc
        },
        {} as Record<string, { name: string; amount: number; count: number }>
      )

    const topSpendingCategory =
      Object.keys(categorySpending).length > 0
        ? Object.values(categorySpending).reduce((max, category) =>
            category.amount > max.amount ? category : max
          )
        : null

    const topSpendingCategoryData = topSpendingCategory
      ? {
          name: topSpendingCategory.name,
          amount: topSpendingCategory.amount,
          percentage:
            currentExpenses > 0 ? (topSpendingCategory.amount / currentExpenses) * 100 : 0,
        }
      : null

    const kpis: FinancialKPI = {
      netWorth: currentNet, // Simplified - would need actual asset/liability data
      monthlyIncome,
      monthlyExpenses,
      monthlyNet,
      savingsRate,
      spendingVelocity,
      financialHealthScore,
      emergencyFundRatio: Math.min(emergencyFundRatio, 2), // Cap at 200%
      topSpendingCategory: topSpendingCategoryData,
      incomeGrowth,
      expenseGrowth,
    }

    return { data: kpis, error: null }
  } catch (err) {
    console.error('Unexpected error calculating financial KPIs:', err)
    return { data: null, error: 'Failed to calculate financial KPIs' }
  }
}

// Get period-over-period comparison data
export async function getPeriodComparison(
  userId: string,
  currentPeriod: DateRange,
  comparisonType: 'previous' | 'year-over-year' = 'previous'
): Promise<{ data: PeriodComparison | null; error: string | null }> {
  try {
    // Calculate comparison period
    let previousPeriod: DateRange

    if (comparisonType === 'year-over-year') {
      previousPeriod = {
        from: new Date(
          currentPeriod.from.getFullYear() - 1,
          currentPeriod.from.getMonth(),
          currentPeriod.from.getDate()
        ),
        to: new Date(
          currentPeriod.to.getFullYear() - 1,
          currentPeriod.to.getMonth(),
          currentPeriod.to.getDate()
        ),
      }
    } else {
      const periodLength = currentPeriod.to.getTime() - currentPeriod.from.getTime()
      previousPeriod = {
        from: new Date(currentPeriod.from.getTime() - periodLength),
        to: new Date(currentPeriod.to.getTime() - periodLength),
      }
    }

    // Fetch current period data
    const { data: currentData, error: currentError } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userId)
      .gte('date', currentPeriod.from.toISOString().split('T')[0])
      .lte('date', currentPeriod.to.toISOString().split('T')[0])

    if (currentError) {
      return { data: null, error: currentError.message }
    }

    // Fetch previous period data
    const { data: previousData, error: previousError } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userId)
      .gte('date', previousPeriod.from.toISOString().split('T')[0])
      .lte('date', previousPeriod.to.toISOString().split('T')[0])

    if (previousError) {
      return { data: null, error: previousError.message }
    }

    // Calculate current period metrics
    const currentIncome = (currentData || [])
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const currentExpenses = (currentData || [])
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const currentNet = currentIncome - currentExpenses
    const currentCount = (currentData || []).length

    // Calculate previous period metrics
    const previousIncome = (previousData || [])
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const previousExpenses = (previousData || [])
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const previousNet = previousIncome - previousExpenses
    const previousCount = (previousData || []).length

    // Calculate changes
    const incomeChange = currentIncome - previousIncome
    const expenseChange = currentExpenses - previousExpenses
    const netChange = currentNet - previousNet
    const transactionCountChange = currentCount - previousCount

    const incomePercentChange = previousIncome > 0 ? (incomeChange / previousIncome) * 100 : 0
    const expensePercentChange = previousExpenses > 0 ? (expenseChange / previousExpenses) * 100 : 0
    const netPercentChange = previousNet !== 0 ? (netChange / Math.abs(previousNet)) * 100 : 0

    const comparison: PeriodComparison = {
      currentPeriod: {
        income: currentIncome,
        expenses: currentExpenses,
        net: currentNet,
        transactionCount: currentCount,
      },
      previousPeriod: {
        income: previousIncome,
        expenses: previousExpenses,
        net: previousNet,
        transactionCount: previousCount,
      },
      changes: {
        incomeChange,
        expenseChange,
        netChange,
        transactionCountChange,
        incomePercentChange,
        expensePercentChange,
        netPercentChange,
      },
    }

    return { data: comparison, error: null }
  } catch (err) {
    console.error('Unexpected error calculating period comparison:', err)
    return { data: null, error: 'Failed to calculate period comparison' }
  }
}

// Get detailed spending trends with daily breakdown
export async function getSpendingTrends(
  userId: string,
  dateRange: DateRange
): Promise<{ data: SpendingTrend[]; error: string | null }> {
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount, type, date')
      .eq('user_id', userId)
      .gte('date', dateRange.from.toISOString().split('T')[0])
      .lte('date', dateRange.to.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) {
      return { data: [], error: error.message }
    }

    // Group transactions by date
    const dailyData: Record<string, { income: number; expenses: number }> = {}

    ;(transactions || []).forEach(transaction => {
      const date = transaction.date
      if (!dailyData[date]) {
        dailyData[date] = { income: 0, expenses: 0 }
      }

      if (transaction.type === 'income') {
        dailyData[date].income += Number(transaction.amount)
      } else {
        dailyData[date].expenses += Number(transaction.amount)
      }
    })

    // Generate daily trends with cumulative data
    let cumulativeIncome = 0
    let cumulativeExpenses = 0

    const trends: SpendingTrend[] = []
    const startDate = new Date(dateRange.from)
    const endDate = new Date(dateRange.to)

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0]
      const dayData = dailyData[dateStr] || { income: 0, expenses: 0 }

      cumulativeIncome += dayData.income
      cumulativeExpenses += dayData.expenses

      trends.push({
        date: dateStr,
        income: dayData.income,
        expenses: dayData.expenses,
        net: dayData.income - dayData.expenses,
        cumulativeIncome,
        cumulativeExpenses,
        cumulativeNet: cumulativeIncome - cumulativeExpenses,
      })
    }

    return { data: trends, error: null }
  } catch (err) {
    console.error('Unexpected error calculating spending trends:', err)
    return { data: [], error: 'Failed to calculate spending trends' }
  }
}

// Get category insights with trend analysis
export async function getCategoryInsights(
  userId: string,
  dateRange: DateRange,
  type: 'income' | 'expense' | 'all' = 'all'
): Promise<{ data: CategoryInsight[]; error: string | null }> {
  try {
    let query = supabase
      .from('transactions')
      .select(
        `
        amount,
        type,
        date,
        category:categories (
          id,
          name,
          color
        )
      `
      )
      .eq('user_id', userId)
      .gte('date', dateRange.from.toISOString().split('T')[0])
      .lte('date', dateRange.to.toISOString().split('T')[0])

    if (type !== 'all') {
      query = query.eq('type', type)
    }

    const { data: transactions, error } = await query

    if (error) {
      return { data: [], error: error.message }
    }

    // Get previous period for trend comparison
    const periodLength = dateRange.to.getTime() - dateRange.from.getTime()
    const previousDateRange = {
      from: new Date(dateRange.from.getTime() - periodLength),
      to: new Date(dateRange.to.getTime() - periodLength),
    }

    let previousQuery = supabase
      .from('transactions')
      .select(
        `
        amount,
        type,
        category:categories (
          id,
          name,
          color
        )
      `
      )
      .eq('user_id', userId)
      .gte('date', previousDateRange.from.toISOString().split('T')[0])
      .lte('date', previousDateRange.to.toISOString().split('T')[0])

    if (type !== 'all') {
      previousQuery = previousQuery.eq('type', type)
    }

    const { data: previousTransactions, error: previousError } = await previousQuery

    if (previousError) {
      return { data: [], error: previousError.message }
    }

    // Process current period data
    const categoryData: Record<
      string,
      {
        categoryId: string
        categoryName: string
        categoryColor: string
        totalAmount: number
        transactionCount: number
      }
    > = {}

    ;(transactions || []).forEach(transaction => {
      if (!transaction.category) return

      const categoryId = transaction.category.id
      if (!categoryData[categoryId]) {
        categoryData[categoryId] = {
          categoryId,
          categoryName: transaction.category.name,
          categoryColor: transaction.category.color,
          totalAmount: 0,
          transactionCount: 0,
        }
      }

      categoryData[categoryId].totalAmount += Number(transaction.amount)
      categoryData[categoryId].transactionCount++
    })

    // Process previous period data for trend calculation
    const previousCategoryData: Record<string, number> = {}
    ;(previousTransactions || []).forEach(transaction => {
      if (!transaction.category) return
      const categoryId = transaction.category.id
      previousCategoryData[categoryId] =
        (previousCategoryData[categoryId] || 0) + Number(transaction.amount)
    })

    // Calculate total for percentage calculations
    const totalAmount = Object.values(categoryData).reduce((sum, cat) => sum + cat.totalAmount, 0)

    // Calculate monthly average (assuming current period length)
    const daysInPeriod = Math.ceil(
      (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
    )
    const monthlyMultiplier = 30 / daysInPeriod

    // Generate insights
    const insights: CategoryInsight[] = Object.values(categoryData).map(category => {
      const previousAmount = previousCategoryData[category.categoryId] || 0
      const trendPercentage =
        previousAmount > 0
          ? ((category.totalAmount - previousAmount) / previousAmount) * 100
          : category.totalAmount > 0
            ? 100
            : 0

      let trend: 'up' | 'down' | 'stable'
      if (Math.abs(trendPercentage) < 5) {
        trend = 'stable'
      } else if (trendPercentage > 0) {
        trend = 'up'
      } else {
        trend = 'down'
      }

      return {
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        categoryColor: category.categoryColor,
        totalAmount: category.totalAmount,
        transactionCount: category.transactionCount,
        averageTransaction:
          category.transactionCount > 0 ? category.totalAmount / category.transactionCount : 0,
        percentage: totalAmount > 0 ? (category.totalAmount / totalAmount) * 100 : 0,
        monthlyAverage: category.totalAmount * monthlyMultiplier,
        trend,
        trendPercentage,
      }
    })

    // Sort by total amount descending
    insights.sort((a, b) => b.totalAmount - a.totalAmount)

    return { data: insights, error: null }
  } catch (err) {
    console.error('Unexpected error calculating category insights:', err)
    return { data: [], error: 'Failed to calculate category insights' }
  }
}
