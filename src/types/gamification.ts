// ==================================================
// GAMIFICATION TYPE DEFINITIONS
// Core types for the gamification system
// ==================================================

// Achievement System Types
export type AchievementType = 'milestone' | 'streak' | 'learning' | 'premium'

export type AchievementId = 
  // Financial Milestones
  | 'first_steps' | 'getting_started' | 'saver' | 'big_saver' 
  | 'goal_crusher' | 'budget_master' | 'net_positive'
  // Behavioral Streaks  
  | 'consistent_tracker' | 'dedicated_user' | 'budget_champion'
  | 'financial_discipline' | 'savings_habit' | 'long_term_thinker'
  // Learning Achievements
  | 'organizer' | 'category_master' | 'color_coordinator' | 'spending_analyst'
  | 'planner' | 'dreamer' | 'explorer' | 'power_user' | 'financial_guru'
  // Premium Accomplishments
  | 'perfect_month' | 'growth_mindset' | 'smart_spender'
  | 'financial_wellness' | 'elite_user'

export interface Achievement {
  id: AchievementId
  type: AchievementType
  title: string
  description: string
  icon: string
  color: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  points: number
  requirements: {
    metric: string
    operator: '>=' | '>' | '=' | '<' | '<='
    value: number | string
    timeframe?: 'day' | 'week' | 'month' | 'year' | 'all_time'
  }[]
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_type: AchievementType
  achievement_id: AchievementId
  earned_at: string
  metadata: Record<string, any>
  achievement?: Achievement // Populated when joined
}

// Statistics & Streaks Types
export type StatType = 
  | 'transaction_streak' | 'budget_streak' | 'goal_streak' | 'login_streak'
  | 'net_positive_months' | 'goals_completed' | 'budgets_created'
  | 'categories_used' | 'categories_created' | 'categories_customized' | 'categories_used_monthly'
  | 'total_transactions' | 'savings_contributions'

export interface UserStat {
  id: string
  user_id: string
  stat_type: StatType
  stat_value: number
  streak_count: number
  last_updated: string
  best_streak: number
  metadata: Record<string, any>
}

// Gamification Events Types
export type GameEventType = 
  | 'transaction_logged' | 'budget_created' | 'budget_updated' | 'goal_created' 
  | 'goal_contribution' | 'goal_completed' | 'goal_updated' | 'budget_completed' 
  | 'goal_achieved' | 'category_created' | 'category_updated' | 'login'
  | 'achievement_earned' | 'streak_updated' | 'milestone_reached'

export interface GameEvent {
  id: string
  user_id: string
  event_type: GameEventType
  trigger_data: Record<string, any>
  created_at: string
}

// Challenge System Types (for future phases)
export type ChallengeType = 'weekly' | 'monthly' | 'seasonal'
export type ChallengeStatus = 'active' | 'completed' | 'failed' | 'paused'

export interface UserChallenge {
  id: string
  user_id: string
  challenge_id: string
  challenge_type: ChallengeType
  status: ChallengeStatus
  progress: number // 0-100 percentage
  target_value: number
  current_value: number
  started_at: string
  deadline: string | null
  completed_at: string | null
  metadata: Record<string, any>
}

// Progress Tracking Types
export interface ProgressUpdate {
  type: 'achievement' | 'streak' | 'milestone' | 'challenge'
  message: string
  icon?: string
  color?: string
  value?: number
  maxValue?: number
  celebration?: 'none' | 'subtle' | 'medium' | 'major'
}

// Celebration Types
export type CelebrationType = 'none' | 'subtle' | 'medium' | 'major' | 'epic'

export interface CelebrationConfig {
  type: CelebrationType
  title: string
  message: string
  icon?: string
  color?: string
  duration?: number // milliseconds
  showConfetti?: boolean
  showAnimation?: boolean
  soundEffect?: string
}

// Gamification Context State
export interface GamificationState {
  achievements: UserAchievement[]
  stats: UserStat[]
  recentEvents: GameEvent[]
  pendingCelebrations: CelebrationConfig[]
  isLoading: boolean
  error: string | null
}

// Hook Return Types
export interface UseAchievementsReturn {
  achievements: UserAchievement[]
  earnedCount: number
  totalCount: number
  recentAchievements: UserAchievement[]
  checkAchievement: (achievementId: AchievementId) => Promise<boolean>
  isLoading: boolean
  error: string | null
}

export interface UseStreaksReturn {
  streaks: UserStat[]
  currentStreaks: Record<StatType, number>
  bestStreaks: Record<StatType, number>
  updateStreak: (statType: StatType, increment?: number) => Promise<void>
  getHighestStreak: () => number
  isLoading: boolean
  error: string | null
}

export interface UseGamificationReturn extends GamificationState {
  triggerEvent: (eventType: GameEventType, data?: Record<string, any>) => Promise<void>
  showCelebration: (config: CelebrationConfig) => void
  dismissCelebration: (index: number) => void
  refreshData: () => Promise<void>
}

// API Response Types
export interface GamificationApiResponse<T> {
  data: T | null
  error: string | null
}

// Configuration Types
export interface GamificationConfig {
  enableSounds: boolean
  enableHaptics: boolean
  enableCelebrations: boolean
  celebrationIntensity: 'minimal' | 'standard' | 'full'
  enableNotifications: boolean
  privacyMode: boolean
}

// Theme Integration Types
export interface GamificationTheme {
  achievement: {
    colors: {
      common: string
      uncommon: string  
      rare: string
      epic: string
      legendary: string
    }
  }
  celebration: {
    background: string
    text: string
    accent: string
  }
  progress: {
    background: string
    fill: string
    text: string
  }
}