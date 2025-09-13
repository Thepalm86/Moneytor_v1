import { z } from 'zod'

export const transactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(255, 'Description must be less than 255 characters'),
  categoryId: z.string().uuid('Invalid category'),
  date: z.date(),
  type: z.enum(['income', 'expense'], {
    required_error: 'Transaction type is required',
  }),
})

export const transactionFormSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Amount must be a positive number'),
  description: z.string().min(1, 'Description is required').max(255, 'Description must be less than 255 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  date: z.date({
    required_error: 'Date is required',
  }),
  type: z.enum(['income', 'expense'], {
    required_error: 'Transaction type is required',
  }),
})

export const transactionUpdateSchema = transactionFormSchema.partial()

export type Transaction = {
  id: string
  user_id: string
  category_id: string | null
  amount: number
  description: string | null
  date: string
  type: 'income' | 'expense'
  created_at: string
  updated_at: string
  category?: {
    id: string
    name: string
    type: 'income' | 'expense'
    color: string
    icon: string | null
  }
}

export type TransactionInput = z.infer<typeof transactionSchema>
export type TransactionFormData = z.infer<typeof transactionFormSchema>
export type TransactionUpdate = z.infer<typeof transactionUpdateSchema>

export type TransactionFilters = {
  type?: 'income' | 'expense' | 'all'
  categoryId?: string
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

export type TransactionSortBy = 'date' | 'amount' | 'description' | 'category'
export type TransactionSortOrder = 'asc' | 'desc'