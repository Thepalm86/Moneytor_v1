import { z } from 'zod'

export const budgetSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  amount: z.number().positive('Budget amount must be positive'),
  period: z.enum(['monthly', 'weekly', 'yearly'], {
    required_error: 'Budget period is required',
  }).default('monthly'),
  startDate: z.date(),
  endDate: z.date().optional(),
})

export const budgetUpdateSchema = budgetSchema.partial()

export type Budget = {
  id: string
  user_id: string
  category_id: string
  amount: number
  period: 'monthly' | 'weekly' | 'yearly'
  start_date: string
  end_date: string | null
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

export type BudgetInput = z.infer<typeof budgetSchema>
export type BudgetUpdate = z.infer<typeof budgetUpdateSchema>

export type BudgetWithStats = Budget & {
  spent_amount: number
  remaining_amount: number
  spent_percentage: number
  transaction_count: number
  is_over_budget: boolean
  days_remaining?: number
  daily_average?: number
  projected_spending?: number
}

export type BudgetPeriod = 'monthly' | 'weekly' | 'yearly'

export type BudgetFilters = {
  period?: BudgetPeriod
  categoryId?: string
  overBudget?: boolean
  status?: 'active' | 'expired' | 'upcoming'
}