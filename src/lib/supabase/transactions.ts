import { supabase } from '@/lib/supabase/client'
import type {
  Transaction,
  TransactionInput,
  TransactionFilters,
  TransactionSortBy,
  TransactionSortOrder,
} from '@/lib/validations/transaction'

export async function getTransactions(
  userId: string,
  filters?: TransactionFilters,
  sortBy: TransactionSortBy = 'date',
  sortOrder: TransactionSortOrder = 'desc',
  limit?: number,
  offset?: number
): Promise<{ data: Transaction[]; count: number; error: string | null }> {
  try {
    let query = supabase
      .from('transactions')
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
      `,
        { count: 'exact' }
      )
      .eq('user_id', userId)

    // Apply filters
    if (filters) {
      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type)
      }
      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId)
      }
      if (filters.dateFrom) {
        query = query.gte('date', filters.dateFrom.toISOString().split('T')[0])
      }
      if (filters.dateTo) {
        query = query.lte('date', filters.dateTo.toISOString().split('T')[0])
      }
      if (filters.search) {
        query = query.ilike('description', `%${filters.search}%`)
      }
    }

    // Apply sorting
    if (sortBy === 'category') {
      query = query.order('category_id', { ascending: sortOrder === 'asc' })
    } else {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    }

    // Apply pagination
    if (limit) {
      query = query.limit(limit)
    }
    if (offset) {
      query = query.range(offset, offset + (limit || 10) - 1)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching transactions:', error)
      return { data: [], count: 0, error: error.message }
    }

    return { data: data || [], count: count || 0, error: null }
  } catch (err) {
    console.error('Unexpected error fetching transactions:', err)
    return { data: [], count: 0, error: 'Failed to fetch transactions' }
  }
}

export async function getTransaction(
  id: string,
  userId: string
): Promise<{ data: Transaction | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('transactions')
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
      console.error('Error fetching transaction:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error fetching transaction:', err)
    return { data: null, error: 'Failed to fetch transaction' }
  }
}

export async function createTransaction(
  userId: string,
  transaction: TransactionInput
): Promise<{ data: Transaction | null; error: string | null }> {
  try {
    const { data, error } = await (supabase as any)
      .from('transactions')
      .insert({
        user_id: userId,
        category_id: transaction.categoryId,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date.toISOString().split('T')[0],
        type: transaction.type,
      })
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
      console.error('Error creating transaction:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error creating transaction:', err)
    return { data: null, error: 'Failed to create transaction' }
  }
}

export async function updateTransaction(
  id: string,
  userId: string,
  updates: Partial<TransactionInput>
): Promise<{ data: Transaction | null; error: string | null }> {
  try {
    const updateData: any = {}

    if (updates.amount !== undefined) updateData.amount = updates.amount
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId
    if (updates.date !== undefined) updateData.date = updates.date.toISOString().split('T')[0]
    if (updates.type !== undefined) updateData.type = updates.type

    const { data, error } = await (supabase as any)
      .from('transactions')
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
      console.error('Error updating transaction:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error updating transaction:', err)
    return { data: null, error: 'Failed to update transaction' }
  }
}

export async function deleteTransaction(
  id: string,
  userId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting transaction:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (err) {
    console.error('Unexpected error deleting transaction:', err)
    return { error: 'Failed to delete transaction' }
  }
}

export async function getTransactionStats(
  userId: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<{
  data: {
    totalIncome: number
    totalExpenses: number
    netAmount: number
    transactionCount: number
  } | null
  error: string | null
}> {
  try {
    let query = supabase.from('transactions').select('amount, type').eq('user_id', userId)

    if (dateFrom) {
      query = query.gte('date', dateFrom.toISOString().split('T')[0])
    }
    if (dateTo) {
      query = query.lte('date', dateTo.toISOString().split('T')[0])
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching transaction stats:', error)
      return { data: null, error: error.message }
    }

    const stats = data.reduce(
      (acc, transaction) => {
        acc.transactionCount++
        if ((transaction as any).type === 'income') {
          acc.totalIncome += Number((transaction as any).amount)
        } else {
          acc.totalExpenses += Number((transaction as any).amount)
        }
        return acc
      },
      { totalIncome: 0, totalExpenses: 0, transactionCount: 0, netAmount: 0 }
    )

    stats.netAmount = stats.totalIncome - stats.totalExpenses

    return { data: stats, error: null }
  } catch (err) {
    console.error('Unexpected error fetching transaction stats:', err)
    return { data: null, error: 'Failed to fetch transaction statistics' }
  }
}
