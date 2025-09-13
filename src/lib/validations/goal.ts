import { z } from 'zod'

export const goalSchema = z.object({
  name: z.string().min(1, 'Goal name is required').max(100, 'Goal name too long'),
  description: z.string().optional(),
  targetAmount: z.number().positive('Target amount must be positive'),
  currentAmount: z.number().min(0, 'Current amount cannot be negative').default(0),
  targetDate: z.date().optional(),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  status: z.enum(['active', 'paused', 'completed', 'cancelled'], {
    required_error: 'Goal status is required',
  }).default('active'),
})

export const goalUpdateSchema = goalSchema.partial()

export const goalContributionSchema = z.object({
  amount: z.number().positive('Contribution amount must be positive'),
  description: z.string().optional(),
})

export type Goal = {
  id: string
  user_id: string
  name: string
  description: string | null
  target_amount: number
  current_amount: number
  target_date: string | null
  category_id: string | null
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  // Relations
  category?: {
    id: string
    name: string
    type: 'income' | 'expense'
    color: string
    icon: string
  }
}

export type GoalInput = z.infer<typeof goalSchema>
export type GoalUpdate = z.infer<typeof goalUpdateSchema>
export type GoalContribution = z.infer<typeof goalContributionSchema>

export type GoalWithProgress = Goal & {
  progress_percentage: number
  remaining_amount: number
  is_completed: boolean
  days_remaining?: number
  daily_target?: number
  projected_completion?: string
  is_on_track: boolean
  monthly_target?: number
}

export type GoalStatus = 'active' | 'paused' | 'completed' | 'cancelled'

export type GoalFilters = {
  status?: GoalStatus
  categoryId?: string
  completed?: boolean
  overdue?: boolean
}