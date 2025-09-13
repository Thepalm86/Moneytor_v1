import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name must be less than 100 characters'),
  type: z.enum(['income', 'expense'], {
    required_error: 'Category type is required',
  }),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').default('#6366f1'),
  icon: z.string().optional(),
})

export const categoryUpdateSchema = categorySchema.partial()

export type Category = {
  id: string
  user_id: string
  name: string
  type: 'income' | 'expense'
  color: string
  icon: string | null
  created_at: string
}

export type CategoryInput = z.infer<typeof categorySchema>
export type CategoryUpdate = z.infer<typeof categoryUpdateSchema>

export type CategoryWithTransactions = Category & {
  transactions_count?: number
  total_amount?: number
}