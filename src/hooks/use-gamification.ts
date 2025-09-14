// ==================================================
// GAMIFICATION HOOKS
// Convenient hooks for accessing gamification features
// ==================================================

import { useCallback } from 'react'
import { useGamification, useAchievements, useStreaks } from '@/contexts/gamification-context'
import type { GameEventType, StatType } from '@/types/gamification'

// ==================================================
// MAIN GAMIFICATION HOOK
// ==================================================

export { useGamification, useAchievements, useStreaks }

// ==================================================
// TRANSACTION GAMIFICATION HOOK
// ==================================================

export function useTransactionGamification() {
  const { triggerEvent } = useGamification()

  const logTransaction = useCallback(async (transactionData?: Record<string, any>) => {
    await triggerEvent('transaction_logged', transactionData)
  }, [triggerEvent])

  return {
    logTransaction
  }
}

// ==================================================
// BUDGET GAMIFICATION HOOK
// ==================================================

export function useBudgetGamification() {
  const { triggerEvent } = useGamification()

  const budgetCreated = useCallback(async (budgetData?: Record<string, any>) => {
    await triggerEvent('budget_created', budgetData)
  }, [triggerEvent])

  const budgetCompleted = useCallback(async (budgetData?: Record<string, any>) => {
    await triggerEvent('budget_completed', budgetData)
  }, [triggerEvent])

  return {
    budgetCreated,
    budgetCompleted
  }
}

// ==================================================
// GOALS GAMIFICATION HOOK
// ==================================================

export function useGoalGamification() {
  const { triggerEvent } = useGamification()

  const goalCreated = useCallback(async (goalData?: Record<string, any>) => {
    await triggerEvent('goal_created', goalData)
  }, [triggerEvent])

  const goalContribution = useCallback(async (contributionData?: Record<string, any>) => {
    await triggerEvent('goal_contribution', contributionData)
  }, [triggerEvent])

  const goalAchieved = useCallback(async (goalData?: Record<string, any>) => {
    await triggerEvent('goal_achieved', goalData)
  }, [triggerEvent])

  return {
    goalCreated,
    goalContribution,
    goalAchieved
  }
}

// ==================================================
// CATEGORY GAMIFICATION HOOK
// ==================================================

export function useCategoryGamification() {
  const { triggerEvent } = useGamification()

  const categoryCreated = useCallback(async (categoryData?: Record<string, any>) => {
    await triggerEvent('category_created', categoryData)
  }, [triggerEvent])

  return {
    categoryCreated
  }
}

// ==================================================
// STREAK TRACKING HOOK
// ==================================================

export function useStreakTracking() {
  const { streaks, currentStreaks, bestStreaks } = useStreaks()

  const getStreak = useCallback((type: StatType) => {
    return {
      current: currentStreaks[type] || 0,
      best: bestStreaks[type] || 0
    }
  }, [currentStreaks, bestStreaks])

  const getHighestStreak = useCallback(() => {
    const streakValues = Object.values(currentStreaks)
    return Math.max(...streakValues, 0)
  }, [currentStreaks])

  return {
    streaks,
    currentStreaks,
    bestStreaks,
    getStreak,
    getHighestStreak
  }
}

// ==================================================
// ACHIEVEMENT PROGRESS HOOK
// ==================================================

export function useAchievementProgress() {
  const { achievements } = useAchievements()

  const getProgressByType = useCallback((type: string) => {
    const typeAchievements = achievements.filter(achievement => 
      achievement.achievement_type === type
    )
    return {
      earned: typeAchievements.length,
      // Total will be calculated based on ACHIEVEMENTS constant
    }
  }, [achievements])

  const getTotalProgress = useCallback(() => {
    return {
      earned: achievements.length,
      // Total will be calculated based on ACHIEVEMENTS constant
    }
  }, [achievements])

  const hasAchievement = useCallback((achievementId: string) => {
    return achievements.some(achievement => 
      achievement.achievement_id === achievementId
    )
  }, [achievements])

  return {
    getProgressByType,
    getTotalProgress,
    hasAchievement
  }
}