import { supabase } from '@/lib/supabase/client'
import { differenceInDays, isAfter } from 'date-fns'
import type {
  Goal,
  GoalInput,
  GoalFilters,
  GoalWithProgress,
  GoalStatus,
  GoalContribution,
} from '@/lib/validations/goal'

export async function getGoals(
  userId: string,
  filters?: GoalFilters
): Promise<{ data: Goal[]; error: string | null }> {
  try {
    let query = supabase
      .from('saving_goals')
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
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId)
      }
      if (filters.completed !== undefined) {
        query = query.eq('status', filters.completed ? 'completed' : 'active')
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching goals:', error)
      return { data: [], error: error.message }
    }

    // Apply overdue filter if needed (client-side filtering for date logic)
    let filteredData = data || []
    if (filters?.overdue !== undefined) {
      const now = new Date()
      filteredData = filteredData.filter(goal => {
        if (!(goal as any).target_date) return false
        const targetDate = new Date((goal as any).target_date)
        const isOverdue = isAfter(now, targetDate) && (goal as any).status === 'active'
        return filters.overdue ? isOverdue : !isOverdue
      })
    }

    // Transform snake_case to match our type definitions
    const transformedData = filteredData.map(goal => ({
      ...(goal as any),
      // Ensure status field exists (fallback for old records)
      status: (goal as any).status || 'active',
    }))

    return { data: transformedData, error: null }
  } catch (err) {
    console.error('Unexpected error fetching goals:', err)
    return { data: [], error: 'Failed to fetch goals' }
  }
}

export async function getGoalsWithProgress(
  userId: string,
  filters?: GoalFilters
): Promise<{ data: GoalWithProgress[]; error: string | null }> {
  try {
    const { data: goals, error: goalError } = await getGoals(userId, filters)

    if (goalError) {
      return { data: [], error: goalError }
    }

    // Calculate progress for each goal
    const goalsWithProgress = goals.map((goal): GoalWithProgress => {
      const targetAmount = Number(goal.target_amount)
      const currentAmount = Number(goal.current_amount)
      const progressPercentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0
      const remainingAmount = Math.max(0, targetAmount - currentAmount)
      const isCompleted = currentAmount >= targetAmount || goal.status === 'completed'

      // Calculate days remaining and daily targets
      let daysRemaining: number | undefined
      let dailyTarget: number | undefined
      let projectedCompletion: string | undefined
      let isOnTrack = true
      let monthlyTarget: number | undefined

      if (goal.target_date) {
        const now = new Date()
        const targetDate = new Date(goal.target_date)
        daysRemaining = Math.max(0, differenceInDays(targetDate, now))

        // Calculate daily target needed to reach goal
        if (daysRemaining > 0 && remainingAmount > 0) {
          dailyTarget = remainingAmount / daysRemaining
          monthlyTarget = dailyTarget * 30
        }

        // Calculate if on track (simplified heuristic)
        if (daysRemaining > 0 && targetAmount > 0) {
          const expectedProgress =
            ((differenceInDays(targetDate, new Date(goal.created_at)) - daysRemaining) /
              differenceInDays(targetDate, new Date(goal.created_at))) *
            100
          isOnTrack = progressPercentage >= expectedProgress * 0.8 // 80% of expected progress
        }

        // Project completion date based on current progress
        if (dailyTarget && currentAmount > 0) {
          const daysToComplete =
            remainingAmount /
            (currentAmount / Math.max(1, differenceInDays(now, new Date(goal.created_at))))
          const projectedDate = new Date(now.getTime() + daysToComplete * 24 * 60 * 60 * 1000)
          projectedCompletion = projectedDate.toISOString().split('T')[0]
        }
      }

      return {
        ...goal,
        progress_percentage: Math.min(100, progressPercentage),
        remaining_amount: remainingAmount,
        is_completed: isCompleted,
        days_remaining: daysRemaining,
        daily_target: dailyTarget,
        projected_completion: projectedCompletion,
        is_on_track: isOnTrack,
        monthly_target: monthlyTarget,
      }
    })

    return { data: goalsWithProgress, error: null }
  } catch (err) {
    console.error('Unexpected error fetching goals with progress:', err)
    return { data: [], error: 'Failed to fetch goal progress' }
  }
}

export async function getGoal(
  id: string,
  userId: string
): Promise<{ data: Goal | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('saving_goals')
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
      console.error('Error fetching goal:', error)
      return { data: null, error: error.message }
    }

    // Ensure status field exists
    const transformedData = {
      ...(data as any),
      status: (data as any).status || 'active',
    }

    return { data: transformedData, error: null }
  } catch (err) {
    console.error('Unexpected error fetching goal:', err)
    return { data: null, error: 'Failed to fetch goal' }
  }
}

export async function createGoal(
  userId: string,
  goal: GoalInput
): Promise<{ data: Goal | null; error: string | null }> {
  try {
    const insertData: any = {
      user_id: userId,
      name: goal.name,
      target_amount: goal.targetAmount,
      current_amount: goal.currentAmount || 0,
      // Add status if the schema supports it (fallback gracefully)
      ...(goal.status && { status: goal.status }),
      ...(goal.description && { description: goal.description }),
      ...(goal.categoryId && { category_id: goal.categoryId }),
      ...(goal.targetDate && { target_date: goal.targetDate.toISOString().split('T')[0] }),
    }

    const { data, error } = await supabase
      .from('saving_goals')
      .insert(insertData)
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
      console.error('Error creating goal:', error)
      return { data: null, error: error.message }
    }

    return { data: { ...(data as any), status: (data as any).status || 'active' }, error: null }
  } catch (err) {
    console.error('Unexpected error creating goal:', err)
    return { data: null, error: 'Failed to create goal' }
  }
}

export async function updateGoal(
  id: string,
  userId: string,
  updates: Partial<GoalInput>
): Promise<{ data: Goal | null; error: string | null }> {
  try {
    const updateData: any = {}

    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.targetAmount !== undefined) updateData.target_amount = updates.targetAmount
    if (updates.currentAmount !== undefined) updateData.current_amount = updates.currentAmount
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId
    if (updates.targetDate !== undefined) {
      updateData.target_date = updates.targetDate
        ? updates.targetDate.toISOString().split('T')[0]
        : null
    }

    const { data, error } = await (supabase as any)
      .from('saving_goals')
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
      console.error('Error updating goal:', error)
      return { data: null, error: error.message }
    }

    return { data: { ...data, status: data.status || 'active' }, error: null }
  } catch (err) {
    console.error('Unexpected error updating goal:', err)
    return { data: null, error: 'Failed to update goal' }
  }
}

export async function deleteGoal(id: string, userId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('saving_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting goal:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (err) {
    console.error('Unexpected error deleting goal:', err)
    return { error: 'Failed to delete goal' }
  }
}

export async function contributeToGoal(
  id: string,
  userId: string,
  contribution: GoalContribution
): Promise<{ data: Goal | null; error: string | null }> {
  try {
    // First, get the current goal
    const { data: currentGoal, error: fetchError } = await getGoal(id, userId)

    if (fetchError || !currentGoal) {
      return { data: null, error: fetchError || 'Goal not found' }
    }

    const newCurrentAmount = Number(currentGoal.current_amount) + contribution.amount
    const targetAmount = Number(currentGoal.target_amount)
    const newStatus = newCurrentAmount >= targetAmount ? 'completed' : currentGoal.status

    // Update the goal with the new amount
    const { data, error } = await updateGoal(id, userId, {
      currentAmount: newCurrentAmount,
      status: newStatus as GoalStatus,
    })

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error contributing to goal:', err)
    return { data: null, error: 'Failed to contribute to goal' }
  }
}

export async function getGoalOverview(userId: string): Promise<{
  data: {
    totalGoals: number
    activeGoals: number
    completedGoals: number
    totalTargetAmount: number
    totalCurrentAmount: number
    totalProgress: number
    overdue: number
  } | null
  error: string | null
}> {
  try {
    const { data: goalsWithProgress, error } = await getGoalsWithProgress(userId)

    if (error) {
      return { data: null, error }
    }

    const now = new Date()
    const overview = {
      totalGoals: goalsWithProgress.length,
      activeGoals: goalsWithProgress.filter(g => g.status === 'active').length,
      completedGoals: goalsWithProgress.filter(g => g.status === 'completed').length,
      totalTargetAmount: goalsWithProgress.reduce((sum, g) => sum + Number(g.target_amount), 0),
      totalCurrentAmount: goalsWithProgress.reduce((sum, g) => sum + Number(g.current_amount), 0),
      totalProgress:
        goalsWithProgress.length > 0
          ? goalsWithProgress.reduce((sum, g) => sum + g.progress_percentage, 0) /
            goalsWithProgress.length
          : 0,
      overdue: goalsWithProgress.filter(
        g => g.target_date && isAfter(now, new Date(g.target_date)) && g.status === 'active'
      ).length,
    }

    return { data: overview, error: null }
  } catch (err) {
    console.error('Unexpected error fetching goal overview:', err)
    return { data: null, error: 'Failed to fetch goal overview' }
  }
}
