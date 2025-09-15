import { supabase } from '@/lib/supabase/client'
import type { Category, CategoryInput, CategoryWithTransactions } from '@/lib/validations/category'

export async function getCategories(
  userId: string
): Promise<{ data: Category[]; error: string | null }> {
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

export async function getCategoriesWithStats(
  userId: string
): Promise<{ data: CategoryWithTransactions[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select(
        `
        *,
        transactions (
          amount
        )
      `
      )
      .eq('user_id', userId)
      .order('name')

    if (error) {
      console.error('Error fetching categories with stats:', error)
      return { data: [], error: error.message }
    }

    // Calculate stats for each category
    const categoriesWithStats =
      data?.map(category => {
        const transactions = category.transactions || []
        const transactions_count = transactions.length
        const total_amount = transactions.reduce(
          (sum: number, t: { amount: number }) => sum + Number(t.amount),
          0
        )

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

export async function getCategory(
  id: string,
  userId: string
): Promise<{ data: Category | null; error: string | null }> {
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

export async function getCategoryUsageAnalytics(
  userId: string,
  _dateRange?: { from: Date; to: Date }
): Promise<{
  data: {
    totalTransactions: number
    mostUsedCategory: { category: Category; count: number; amount: number } | null
    leastUsedCategory: { category: Category; count: number; amount: number } | null
    unusedCategories: Category[]
    categoryPerformance: Array<{
      category: Category
      transactionCount: number
      totalAmount: number
      averageAmount: number
      lastUsed: string | null
    }>
    monthlyTrends: Array<{
      month: string
      categories: Array<{ categoryId: string; categoryName: string; count: number; amount: number }>
    }>
  }
  error: string | null
}> {
  try {
    // Note: dateRange parameter reserved for future filtering functionality

    // Get categories with transaction stats
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select(
        `
        *,
        transactions!inner(
          id,
          amount,
          date,
          created_at
        )
      `
      )
      .eq('user_id', userId)
      .order('name')

    if (categoriesError) {
      console.error('Error fetching category analytics:', categoriesError)
      return { data: null as any, error: categoriesError.message }
    }

    // Get all categories (including unused ones)
    const { data: allCategories, error: allCategoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name')

    if (allCategoriesError) {
      console.error('Error fetching all categories:', allCategoriesError)
      return { data: null as any, error: allCategoriesError.message }
    }

    const usedCategoryIds = new Set(categoriesData?.map(c => c.id) || [])
    const unusedCategories = allCategories?.filter(c => !usedCategoryIds.has(c.id)) || []

    // Process category performance
    const categoryPerformance =
      categoriesData
        ?.map(category => {
          const transactions = category.transactions || []
          const transactionCount = transactions.length
          const totalAmount = transactions.reduce(
            (sum: number, t: any) => sum + Math.abs(Number(t.amount)),
            0
          )
          const averageAmount = transactionCount > 0 ? totalAmount / transactionCount : 0

          // Find last used date
          const lastUsed =
            transactions.length > 0
              ? transactions.reduce((latest: any, t: any) =>
                  new Date(t.date) > new Date(latest.date) ? t : latest
                ).date
              : null

          return {
            category: {
              id: category.id,
              user_id: category.user_id,
              name: category.name,
              type: category.type,
              color: category.color,
              icon: category.icon,
              created_at: category.created_at,
            },
            transactionCount,
            totalAmount,
            averageAmount,
            lastUsed,
          }
        })
        .sort((a, b) => b.transactionCount - a.transactionCount) || []

    const totalTransactions = categoryPerformance.reduce((sum, cp) => sum + cp.transactionCount, 0)
    const mostUsedCategory =
      categoryPerformance.length > 0
        ? {
            category: categoryPerformance[0].category,
            count: categoryPerformance[0].transactionCount,
            amount: categoryPerformance[0].totalAmount,
          }
        : null
    const leastUsedCategory =
      categoryPerformance.length > 0
        ? {
            category: categoryPerformance[categoryPerformance.length - 1].category,
            count: categoryPerformance[categoryPerformance.length - 1].transactionCount,
            amount: categoryPerformance[categoryPerformance.length - 1].totalAmount,
          }
        : null

    // Generate monthly trends (last 6 months)
    const monthlyTrends = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)

      const { data: monthlyTransactions, error: monthlyError } = await supabase
        .from('transactions')
        .select(
          `
          category_id,
          amount,
          categories!inner(name)
        `
        )
        .eq('user_id', userId)
        .gte('date', monthStart.toISOString().split('T')[0])
        .lte('date', monthEnd.toISOString().split('T')[0])

      if (!monthlyError && monthlyTransactions) {
        const categoryStats = new Map()

        monthlyTransactions.forEach((transaction: any) => {
          const categoryId = transaction.category_id
          const categoryName = transaction.categories.name
          const amount = Math.abs(Number(transaction.amount))

          if (categoryStats.has(categoryId)) {
            const existing = categoryStats.get(categoryId)
            categoryStats.set(categoryId, {
              ...existing,
              count: existing.count + 1,
              amount: existing.amount + amount,
            })
          } else {
            categoryStats.set(categoryId, {
              categoryId,
              categoryName,
              count: 1,
              amount,
            })
          }
        })

        monthlyTrends.push({
          month: month.toLocaleDateString('default', { month: 'short', year: 'numeric' }),
          categories: Array.from(categoryStats.values()),
        })
      }
    }

    return {
      data: {
        totalTransactions,
        mostUsedCategory,
        leastUsedCategory,
        unusedCategories,
        categoryPerformance,
        monthlyTrends,
      },
      error: null,
    }
  } catch (err) {
    console.error('Unexpected error fetching category analytics:', err)
    return { data: null as any, error: 'Failed to fetch category analytics' }
  }
}

export async function deleteCategory(
  id: string,
  userId: string
): Promise<{ error: string | null }> {
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
      return {
        error:
          'Cannot delete category with existing transactions. Please reassign or delete transactions first.',
      }
    }

    const { error } = await supabase.from('categories').delete().eq('id', id).eq('user_id', userId)

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
