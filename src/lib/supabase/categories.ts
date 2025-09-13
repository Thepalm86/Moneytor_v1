import { supabase } from '@/lib/supabase/client'
import type { Category, CategoryInput, CategoryWithTransactions } from '@/lib/validations/category'

export async function getCategories(userId: string): Promise<{ data: Category[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name')

    if (error) {
      console.error('Error fetching categories:', error)
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (err) {
    console.error('Unexpected error fetching categories:', err)
    return { data: [], error: 'Failed to fetch categories' }
  }
}

export async function getCategoriesByType(
  userId: string, 
  type: 'income' | 'expense'
): Promise<{ data: Category[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('name')

    if (error) {
      console.error('Error fetching categories by type:', error)
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (err) {
    console.error('Unexpected error fetching categories by type:', err)
    return { data: [], error: 'Failed to fetch categories' }
  }
}

export async function getCategoriesWithStats(userId: string): Promise<{ data: CategoryWithTransactions[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        transactions (
          amount
        )
      `)
      .eq('user_id', userId)
      .order('name')

    if (error) {
      console.error('Error fetching categories with stats:', error)
      return { data: [], error: error.message }
    }

    // Calculate stats for each category
    const categoriesWithStats = data?.map(category => {
      const transactions = category.transactions || []
      const transactions_count = transactions.length
      const total_amount = transactions.reduce((sum: number, t: any) => sum + Number(t.amount), 0)

      return {
        id: category.id,
        user_id: category.user_id,
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
        created_at: category.created_at,
        transactions_count,
        total_amount,
      }
    }) || []

    return { data: categoriesWithStats, error: null }
  } catch (err) {
    console.error('Unexpected error fetching categories with stats:', err)
    return { data: [], error: 'Failed to fetch category statistics' }
  }
}

export async function getCategory(id: string, userId: string): Promise<{ data: Category | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching category:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error fetching category:', err)
    return { data: null, error: 'Failed to fetch category' }
  }
}

export async function createCategory(
  userId: string,
  category: CategoryInput
): Promise<{ data: Category | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error creating category:', err)
    return { data: null, error: 'Failed to create category' }
  }
}

export async function updateCategory(
  id: string,
  userId: string,
  updates: Partial<CategoryInput>
): Promise<{ data: Category | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating category:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error updating category:', err)
    return { data: null, error: 'Failed to update category' }
  }
}

export async function deleteCategory(id: string, userId: string): Promise<{ error: string | null }> {
  try {
    // First check if category has transactions
    const { data: transactions, error: checkError } = await supabase
      .from('transactions')
      .select('id')
      .eq('category_id', id)
      .eq('user_id', userId)
      .limit(1)

    if (checkError) {
      console.error('Error checking category transactions:', checkError)
      return { error: checkError.message }
    }

    if (transactions && transactions.length > 0) {
      return { error: 'Cannot delete category with existing transactions. Please reassign or delete transactions first.' }
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting category:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (err) {
    console.error('Unexpected error deleting category:', err)
    return { error: 'Failed to delete category' }
  }
}