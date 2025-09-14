// ==================================================
// GAMIFICATION SUPABASE SERVICE
// Database operations for gamification features
// ==================================================

import { supabase } from './client'
import type { 
  UserAchievement, 
  UserStat, 
  GameEvent, 
  AchievementId, 
  StatType, 
  GameEventType,
  GamificationApiResponse 
} from '@/types/gamification'

// ==================================================
// ACHIEVEMENT OPERATIONS
// ==================================================

export async function getUserAchievements(
  userId: string
): Promise<GamificationApiResponse<UserAchievement[]>> {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })

    if (error) {
      console.error('Error fetching user achievements:', error)
      return { data: null, error: error.message }
    }

    return { data: data || [], error: null }
  } catch (err) {
    console.error('Error in getUserAchievements:', err)
    return { data: null, error: 'Failed to fetch achievements' }
  }
}

export async function checkAndAwardAchievement(
  userId: string,
  achievementId: AchievementId,
  achievementType: string,
  metadata: Record<string, any> = {}
): Promise<GamificationApiResponse<boolean>> {
  try {
    const { data, error } = await supabase
      .rpc('check_achievement', {
        p_user_id: userId,
        p_achievement_id: achievementId,
        p_achievement_type: achievementType,
        p_metadata: metadata
      })

    if (error) {
      console.error('Error checking achievement:', error)
      return { data: null, error: error.message }
    }

    return { data: data as boolean, error: null }
  } catch (err) {
    console.error('Error in checkAndAwardAchievement:', err)
    return { data: null, error: 'Failed to check achievement' }
  }
}

export async function getRecentAchievements(
  userId: string,
  limit: number = 5
): Promise<GamificationApiResponse<UserAchievement[]>> {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent achievements:', error)
      return { data: null, error: error.message }
    }

    return { data: data || [], error: null }
  } catch (err) {
    console.error('Error in getRecentAchievements:', err)
    return { data: null, error: 'Failed to fetch recent achievements' }
  }
}

// ==================================================
// STATISTICS & STREAKS OPERATIONS
// ==================================================

export async function getUserStats(
  userId: string
): Promise<GamificationApiResponse<UserStat[]>> {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .order('last_updated', { ascending: false })

    if (error) {
      console.error('Error fetching user stats:', error)
      return { data: null, error: error.message }
    }

    return { data: data || [], error: null }
  } catch (err) {
    console.error('Error in getUserStats:', err)
    return { data: null, error: 'Failed to fetch user stats' }
  }
}

export async function updateUserStreak(
  userId: string,
  statType: StatType,
  increment: number = 1
): Promise<GamificationApiResponse<void>> {
  try {
    const { error } = await supabase
      .rpc('update_user_streak', {
        p_user_id: userId,
        p_stat_type: statType,
        p_increment_by: increment
      })

    if (error) {
      console.error('Error updating user streak:', error)
      return { data: null, error: error.message }
    }

    return { data: null, error: null }
  } catch (err) {
    console.error('Error in updateUserStreak:', err)
    return { data: null, error: 'Failed to update streak' }
  }
}

export async function getStreakStats(
  userId: string
): Promise<GamificationApiResponse<Record<StatType, { current: number; best: number }>>> {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('stat_type, streak_count, best_streak')
      .eq('user_id', userId)
      .in('stat_type', ['transaction_streak', 'budget_streak', 'goal_streak', 'login_streak'])

    if (error) {
      console.error('Error fetching streak stats:', error)
      return { data: null, error: error.message }
    }

    const streakStats: Record<StatType, { current: number; best: number }> = {}
    
    if (data) {
      data.forEach((stat: any) => {
        streakStats[stat.stat_type as StatType] = {
          current: stat.streak_count || 0,
          best: stat.best_streak || 0
        }
      })
    }

    return { data: streakStats, error: null }
  } catch (err) {
    console.error('Error in getStreakStats:', err)
    return { data: null, error: 'Failed to fetch streak stats' }
  }
}

// ==================================================
// GAMIFICATION EVENTS OPERATIONS
// ==================================================

export async function logGameEvent(
  userId: string,
  eventType: GameEventType,
  triggerData: Record<string, any> = {}
): Promise<GamificationApiResponse<void>> {
  try {
    const { error } = await supabase
      .rpc('log_gamification_event', {
        p_user_id: userId,
        p_event_type: eventType,
        p_trigger_data: triggerData
      })

    if (error) {
      console.error('Error logging game event:', error)
      return { data: null, error: error.message }
    }

    return { data: null, error: null }
  } catch (err) {
    console.error('Error in logGameEvent:', err)
    return { data: null, error: 'Failed to log game event' }
  }
}

export async function getRecentGameEvents(
  userId: string,
  limit: number = 10
): Promise<GamificationApiResponse<GameEvent[]>> {
  try {
    const { data, error } = await supabase
      .from('gamification_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching game events:', error)
      return { data: null, error: error.message }
    }

    return { data: data || [], error: null }
  } catch (err) {
    console.error('Error in getRecentGameEvents:', err)
    return { data: null, error: 'Failed to fetch game events' }
  }
}

// ==================================================
// AGGREGATED STATISTICS
// ==================================================

export async function getUserGamificationSummary(
  userId: string
): Promise<GamificationApiResponse<{
  achievements: UserAchievement[]
  stats: UserStat[]
  recentEvents: GameEvent[]
  totalPoints: number
  level: number
  streaks: Record<StatType, { current: number; best: number }>
}>> {
  try {
    // Fetch all data in parallel
    const [achievementsResult, statsResult, eventsResult, streaksResult] = await Promise.all([
      getUserAchievements(userId),
      getUserStats(userId),
      getRecentGameEvents(userId, 5),
      getStreakStats(userId)
    ])

    if (achievementsResult.error || statsResult.error || eventsResult.error || streaksResult.error) {
      const error = achievementsResult.error || statsResult.error || eventsResult.error || streaksResult.error
      return { data: null, error }
    }

    const achievements = achievementsResult.data || []
    const stats = statsResult.data || []
    const recentEvents = eventsResult.data || []
    const streaks = streaksResult.data || {}

    // Calculate total points and level
    const totalPoints = achievements.reduce((sum, achievement) => {
      // Points will be calculated based on achievement definitions
      return sum + (achievement.metadata.points || 0)
    }, 0)

    // Simple level calculation: level = floor(totalPoints / 100) + 1
    const level = Math.floor(totalPoints / 100) + 1

    return {
      data: {
        achievements,
        stats,
        recentEvents,
        totalPoints,
        level,
        streaks
      },
      error: null
    }
  } catch (err) {
    console.error('Error in getUserGamificationSummary:', err)
    return { data: null, error: 'Failed to fetch gamification summary' }
  }
}

// ==================================================
// UTILITY FUNCTIONS
// ==================================================

export async function initializeUserGamification(
  userId: string
): Promise<GamificationApiResponse<void>> {
  try {
    // Initialize basic stats for new users
    const initialStats: { stat_type: StatType; stat_value: number }[] = [
      { stat_type: 'transaction_streak', stat_value: 0 },
      { stat_type: 'budget_streak', stat_value: 0 },
      { stat_type: 'goal_streak', stat_value: 0 },
      { stat_type: 'login_streak', stat_value: 0 },
      { stat_type: 'total_transactions', stat_value: 0 },
      { stat_type: 'goals_completed', stat_value: 0 },
      { stat_type: 'budgets_created', stat_value: 0 },
      { stat_type: 'categories_used', stat_value: 0 },
      { stat_type: 'categories_created', stat_value: 0 },
      { stat_type: 'categories_customized', stat_value: 0 },
      { stat_type: 'categories_used_monthly', stat_value: 0 },
      { stat_type: 'savings_contributions', stat_value: 0 }
    ]

    const { error } = await supabase
      .from('user_stats')
      .upsert(
        initialStats.map(stat => ({
          user_id: userId,
          stat_type: stat.stat_type,
          stat_value: stat.stat_value,
          streak_count: 0,
          best_streak: 0,
          last_updated: new Date().toISOString(),
          metadata: {}
        })),
        { onConflict: 'user_id,stat_type' }
      )

    if (error) {
      console.error('Error initializing user gamification:', error)
      return { data: null, error: error.message }
    }

    return { data: null, error: null }
  } catch (err) {
    console.error('Error in initializeUserGamification:', err)
    return { data: null, error: 'Failed to initialize user gamification' }
  }
}