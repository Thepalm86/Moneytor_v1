export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          timezone: string
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          color: string
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          color?: string
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'income' | 'expense'
          color?: string
          icon?: string | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          amount: number
          description: string | null
          date: string
          type: 'income' | 'expense'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          amount: number
          description?: string | null
          date: string
          type: 'income' | 'expense'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          amount?: number
          description?: string | null
          date?: string
          type?: 'income' | 'expense'
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          amount: number
          period: 'monthly' | 'weekly' | 'yearly'
          start_date: string
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          amount: number
          period?: 'monthly' | 'weekly' | 'yearly'
          start_date: string
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          amount?: number
          period?: 'monthly' | 'weekly' | 'yearly'
          start_date?: string
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      saving_goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: number
          current_amount: number
          target_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount: number
          current_amount?: number
          target_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target_amount?: number
          current_amount?: number
          target_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_type: string
          achievement_id: string
          earned_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          user_id: string
          achievement_type: string
          achievement_id: string
          earned_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          achievement_type?: string
          achievement_id?: string
          earned_at?: string
          metadata?: Json
        }
      }
      user_stats: {
        Row: {
          id: string
          user_id: string
          stat_type: string
          stat_value: number
          streak_count: number
          last_updated: string
          best_streak: number
          metadata: Json
        }
        Insert: {
          id?: string
          user_id: string
          stat_type: string
          stat_value?: number
          streak_count?: number
          last_updated?: string
          best_streak?: number
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          stat_type?: string
          stat_value?: number
          streak_count?: number
          last_updated?: string
          best_streak?: number
          metadata?: Json
        }
      }
      gamification_events: {
        Row: {
          id: string
          user_id: string
          event_type: string
          trigger_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          trigger_data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          trigger_data?: Json
          created_at?: string
        }
      }
      user_challenges: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          challenge_type: string
          status: 'active' | 'completed' | 'failed' | 'paused'
          progress: number
          target_value: number | null
          current_value: number
          started_at: string
          deadline: string | null
          completed_at: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          user_id: string
          challenge_id: string
          challenge_type: string
          status?: 'active' | 'completed' | 'failed' | 'paused'
          progress?: number
          target_value?: number | null
          current_value?: number
          started_at?: string
          deadline?: string | null
          completed_at?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          challenge_id?: string
          challenge_type?: string
          status?: 'active' | 'completed' | 'failed' | 'paused'
          progress?: number
          target_value?: number | null
          current_value?: number
          started_at?: string
          deadline?: string | null
          completed_at?: string | null
          metadata?: Json
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      achievement_type: 'milestone' | 'streak' | 'learning' | 'premium'
      challenge_status: 'active' | 'completed' | 'failed' | 'paused'
      celebration_type: 'none' | 'subtle' | 'medium' | 'major' | 'epic'
      stat_type: 'transaction_streak' | 'budget_streak' | 'goal_streak' | 'login_streak'
    }
    CompositeTypes: {}
  }
}

// Type helpers for easier usage
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Budget = Database['public']['Tables']['budgets']['Row']
export type SavingGoal = Database['public']['Tables']['saving_goals']['Row']
export type UserAchievement = Database['public']['Tables']['user_achievements']['Row']
export type UserStats = Database['public']['Tables']['user_stats']['Row']
export type GamificationEvent = Database['public']['Tables']['gamification_events']['Row']
export type UserChallenge = Database['public']['Tables']['user_challenges']['Row']

export type TransactionWithCategory = Transaction & {
  category?: Category
}

export type TransactionType = 'income' | 'expense'
export type BudgetPeriod = 'monthly' | 'weekly' | 'yearly'
export type CelebrationType = Database['public']['Enums']['celebration_type']
export type AchievementType = Database['public']['Enums']['achievement_type']
export type ChallengeStatus = Database['public']['Enums']['challenge_status']
export type StatType = Database['public']['Enums']['stat_type']
