// ==================================================
// GAMIFICATION CONTEXT
// Centralized state management for gamification features
// ==================================================

'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { useUser } from '@/hooks/use-user'
import {
  getUserGamificationSummary,
  logGameEvent,
  checkAndAwardAchievement,
  updateUserStreak,
  initializeUserGamification,
} from '@/lib/supabase/gamification'
import { ACHIEVEMENTS, validateAchievementRequirements } from '@/lib/gamification/achievements'
import type {
  GamificationState,
  GameEventType,
  AchievementId,
  StatType,
  CelebrationConfig,
  UseGamificationReturn,
} from '@/types/gamification'

// ==================================================
// CONTEXT TYPES
// ==================================================

type GamificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DATA'; payload: Partial<GamificationState> }
  | { type: 'ADD_CELEBRATION'; payload: CelebrationConfig }
  | { type: 'REMOVE_CELEBRATION'; payload: number }
  | { type: 'UPDATE_STREAK'; payload: { statType: StatType; value: number } }
  | { type: 'ADD_ACHIEVEMENT'; payload: any }
  | { type: 'RESET_STATE' }

// ==================================================
// REDUCER
// ==================================================

function gamificationReducer(
  state: GamificationState,
  action: GamificationAction
): GamificationState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }

    case 'SET_DATA':
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: null,
      }

    case 'ADD_CELEBRATION':
      return {
        ...state,
        pendingCelebrations: [...state.pendingCelebrations, action.payload],
      }

    case 'REMOVE_CELEBRATION':
      return {
        ...state,
        pendingCelebrations: state.pendingCelebrations.filter(
          (_, index) => index !== action.payload
        ),
      }

    case 'UPDATE_STREAK':
      return {
        ...state,
        stats: state.stats.map(stat =>
          stat.stat_type === action.payload.statType
            ? { ...stat, streak_count: action.payload.value }
            : stat
        ),
      }

    case 'ADD_ACHIEVEMENT':
      return {
        ...state,
        achievements: [action.payload, ...state.achievements],
      }

    case 'RESET_STATE':
      return initialState

    default:
      return state
  }
}

// ==================================================
// INITIAL STATE
// ==================================================

const initialState: GamificationState = {
  achievements: [],
  stats: [],
  recentEvents: [],
  pendingCelebrations: [],
  isLoading: false,
  error: null,
}

// ==================================================
// CONTEXT SETUP
// ==================================================

const GamificationContext = createContext<UseGamificationReturn | null>(null)

// ==================================================
// PROVIDER COMPONENT
// ==================================================

interface GamificationProviderProps {
  children: React.ReactNode
}

export function GamificationProvider({ children }: GamificationProviderProps) {
  const [state, dispatch] = useReducer(gamificationReducer, initialState)
  const { user } = useUser()

  // ==================================================
  // DATA FETCHING
  // ==================================================

  const refreshData = useCallback(async () => {
    if (!user?.id) return

    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const summaryResult = await getUserGamificationSummary(user.id)

      if (summaryResult.error) {
        dispatch({ type: 'SET_ERROR', payload: summaryResult.error })
        return
      }

      if (summaryResult.data) {
        dispatch({
          type: 'SET_DATA',
          payload: {
            achievements: summaryResult.data.achievements,
            stats: summaryResult.data.stats,
            recentEvents: summaryResult.data.recentEvents,
          },
        })
      }
    } catch (err) {
      console.error('Error refreshing gamification data:', err)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load gamification data' })
    }
  }, [user?.id])

  // ==================================================
  // EVENT TRIGGERING
  // ==================================================

  const triggerEvent = useCallback(
    async (eventType: GameEventType, data: Record<string, any> = {}) => {
      if (!user?.id) return

      try {
        // Log the event
        await logGameEvent(user.id, eventType, data)

        // Handle specific event types
        switch (eventType) {
          case 'transaction_logged':
            await handleTransactionLogged()
            break
          case 'budget_created':
            await handleBudgetCreated()
            break
          case 'goal_created':
            await handleGoalCreated()
            break
          case 'goal_contribution':
            await handleGoalContribution()
            break
          case 'login':
            await handleLogin()
            break
        }

        // Refresh data to get updated stats and check for new achievements
        await refreshData()
      } catch (err) {
        console.error('Error triggering game event:', err)
      }
    },
    [user?.id, refreshData]
  )

  // ==================================================
  // EVENT HANDLERS
  // ==================================================

  const handleTransactionLogged = useCallback(async () => {
    if (!user?.id) return

    // Update transaction streak
    await updateUserStreak(user.id, 'transaction_streak', 1)

    // Check for transaction-related achievements
    await checkAchievements([
      'first_steps',
      'getting_started',
      'consistent_tracker',
      'dedicated_user',
    ])
  }, [user?.id])

  const handleBudgetCreated = useCallback(async () => {
    if (!user?.id) return

    // Check for budget-related achievements
    await checkAchievements(['planner', 'organizer'])
  }, [user?.id])

  const handleGoalCreated = useCallback(async () => {
    if (!user?.id) return

    // Check for goal-related achievements
    await checkAchievements(['dreamer'])
  }, [user?.id])

  const handleGoalContribution = useCallback(async () => {
    if (!user?.id) return

    // Update goal contribution streak
    await updateUserStreak(user.id, 'goal_streak', 1)

    // Check for savings-related achievements
    await checkAchievements(['saver', 'big_saver', 'savings_habit', 'long_term_thinker'])
  }, [user?.id])

  const handleLogin = useCallback(async () => {
    if (!user?.id) return

    // Update login streak
    await updateUserStreak(user.id, 'login_streak', 1)
  }, [user?.id])

  // ==================================================
  // ACHIEVEMENT CHECKING
  // ==================================================

  const checkAchievements = useCallback(
    async (achievementIds: AchievementId[]) => {
      if (!user?.id) return

      // Get current user stats for validation
      const userStatsMap: Record<string, number> = {}
      state.stats.forEach(stat => {
        userStatsMap[stat.stat_type] = stat.stat_value
        if (stat.stat_type.includes('streak')) {
          userStatsMap[stat.stat_type] = stat.streak_count
        }
      })

      for (const achievementId of achievementIds) {
        const achievement = ACHIEVEMENTS[achievementId]
        if (!achievement) continue

        // Check if user meets requirements
        if (validateAchievementRequirements(achievement, userStatsMap)) {
          const result = await checkAndAwardAchievement(user.id, achievementId, achievement.type, {
            points: achievement.points,
            rarity: achievement.rarity,
          })

          // If achievement was newly awarded, show celebration
          if (result.data === true) {
            showCelebration({
              type: getCelebrationType(achievement.rarity),
              title: `Achievement Unlocked!`,
              message: `${achievement.icon} ${achievement.title}`,
              color: achievement.color,
              duration: 4000,
              showConfetti: achievement.rarity === 'epic' || achievement.rarity === 'legendary',
            })

            // Add to local state immediately for UI responsiveness
            dispatch({
              type: 'ADD_ACHIEVEMENT',
              payload: {
                id: `temp-${Date.now()}`,
                user_id: user.id,
                achievement_type: achievement.type,
                achievement_id: achievementId,
                earned_at: new Date().toISOString(),
                metadata: { points: achievement.points, rarity: achievement.rarity },
              },
            })
          }
        }
      }
    },
    [user?.id, state.stats]
  )

  // ==================================================
  // CELEBRATION MANAGEMENT
  // ==================================================

  const showCelebration = useCallback(
    (config: CelebrationConfig) => {
      dispatch({ type: 'ADD_CELEBRATION', payload: config })

      // Auto-dismiss celebration after duration
      if (config.duration) {
        setTimeout(() => {
          dispatch({ type: 'REMOVE_CELEBRATION', payload: state.pendingCelebrations.length })
        }, config.duration)
      }
    },
    [state.pendingCelebrations.length]
  )

  const dismissCelebration = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_CELEBRATION', payload: index })
  }, [])

  // ==================================================
  // HELPER FUNCTIONS
  // ==================================================

  const getCelebrationType = (rarity: string): CelebrationConfig['type'] => {
    switch (rarity) {
      case 'legendary':
        return 'epic'
      case 'epic':
        return 'major'
      case 'rare':
        return 'medium'
      case 'uncommon':
        return 'subtle'
      default:
        return 'subtle'
    }
  }

  // ==================================================
  // INITIALIZATION EFFECT
  // ==================================================

  useEffect(() => {
    if (user?.id) {
      // Initialize user gamification if needed
      initializeUserGamification(user.id)

      // Load initial data
      refreshData()

      // Trigger login event
      triggerEvent('login')
    } else {
      // Reset state when user logs out
      dispatch({ type: 'RESET_STATE' })
    }
  }, [user?.id, refreshData, triggerEvent])

  // ==================================================
  // CONTEXT VALUE
  // ==================================================

  const contextValue: UseGamificationReturn = {
    ...state,
    triggerEvent,
    showCelebration,
    dismissCelebration,
    refreshData,
  }

  return (
    <GamificationContext.Provider value={contextValue}>{children}</GamificationContext.Provider>
  )
}

// ==================================================
// CUSTOM HOOK
// ==================================================

export function useGamification(): UseGamificationReturn {
  const context = useContext(GamificationContext)

  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider')
  }

  return context
}

// ==================================================
// CONVENIENCE HOOKS
// ==================================================

export function useAchievements() {
  const { achievements, isLoading, error } = useGamification()

  return {
    achievements,
    earnedCount: achievements.length,
    totalCount: Object.keys(ACHIEVEMENTS).length,
    recentAchievements: achievements.slice(0, 3),
    isLoading,
    error,
  }
}

export function useStreaks() {
  const { stats, isLoading, error } = useGamification()

  const streakStats = stats.filter(stat => stat.stat_type.includes('streak'))
  const currentStreaks: Record<StatType, number> = {} as any
  const bestStreaks: Record<StatType, number> = {} as any

  streakStats.forEach(stat => {
    currentStreaks[stat.stat_type as StatType] = stat.streak_count
    bestStreaks[stat.stat_type as StatType] = stat.best_streak
  })

  const getHighestStreak = () => {
    return Math.max(...Object.values(currentStreaks), 0)
  }

  const updateStreak = async (statType: StatType, increment: number = 1) => {
    try {
      // Implementation would call the gamification API to update streak
      console.log(`Updating ${statType} streak by ${increment}`)
    } catch (error) {
      console.error('Error updating streak:', error)
    }
  }

  return {
    streaks: streakStats,
    currentStreaks,
    bestStreaks,
    getHighestStreak,
    updateStreak,
    isLoading,
    error,
  }
}
