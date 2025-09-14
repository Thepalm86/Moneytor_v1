'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getCategories,
  getCategoriesByType,
  getCategoriesWithStats,
  getCategoryUsageAnalytics,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/supabase/categories'
import type { CategoryInput } from '@/lib/validations/category'

export function useCategories(userId: string) {
  return useQuery({
    queryKey: ['categories', userId],
    queryFn: () => getCategories(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCategoriesByType(userId: string, type: 'income' | 'expense') {
  return useQuery({
    queryKey: ['categories', userId, type],
    queryFn: () => getCategoriesByType(userId, type),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCategoriesWithStats(userId: string) {
  return useQuery({
    queryKey: ['categories-with-stats', userId],
    queryFn: () => getCategoriesWithStats(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  })
}

export function useCategory(id: string, userId: string) {
  return useQuery({
    queryKey: ['category', id, userId],
    queryFn: () => getCategory(id, userId),
    enabled: !!id && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, category }: { userId: string; category: CategoryInput }) =>
      createCategory(userId, category),
    onSuccess: (result) => {
      if (result.error) {
        toast.error('Failed to create category', {
          description: result.error,
        })
        return
      }

      toast.success('Category created successfully')
      
      // Invalidate and refetch category-related queries
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories-with-stats'] })
    },
    onError: (error) => {
      console.error('Mutation error:', error)
      toast.error('Failed to create category', {
        description: 'An unexpected error occurred',
      })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      id, 
      userId, 
      updates 
    }: { 
      id: string; 
      userId: string; 
      updates: Partial<CategoryInput> 
    }) => updateCategory(id, userId, updates),
    onSuccess: (result, variables) => {
      if (result.error) {
        toast.error('Failed to update category', {
          description: result.error,
        })
        return
      }

      toast.success('Category updated successfully')
      
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['category', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['categories-with-stats'] })
    },
    onError: (error) => {
      console.error('Mutation error:', error)
      toast.error('Failed to update category', {
        description: 'An unexpected error occurred',
      })
    },
  })
}

export function useCategoryUsageAnalytics(userId: string, dateRange?: { from: Date; to: Date }) {
  return useQuery({
    queryKey: ['category-usage-analytics', userId, dateRange],
    queryFn: () => getCategoryUsageAnalytics(userId, dateRange),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      deleteCategory(id, userId),
    onSuccess: (result) => {
      if (result.error) {
        toast.error('Failed to delete category', {
          description: result.error,
        })
        return
      }

      toast.success('Category deleted successfully')
      
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories-with-stats'] })
      queryClient.invalidateQueries({ queryKey: ['category-usage-analytics'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
    onError: (error) => {
      console.error('Mutation error:', error)
      toast.error('Failed to delete category', {
        description: 'An unexpected error occurred',
      })
    },
  })
}