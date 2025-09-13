'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getBudgets,
  getBudgetsWithStats,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetOverview,
} from '@/lib/supabase/budgets'
import type { BudgetInput, BudgetFilters } from '@/lib/validations/budget'

export function useBudgets(userId: string, filters?: BudgetFilters) {
  return useQuery({
    queryKey: ['budgets', userId, filters],
    queryFn: () => getBudgets(userId, filters),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  })
}

export function useBudgetsWithStats(userId: string, filters?: BudgetFilters) {
  return useQuery({
    queryKey: ['budgets-with-stats', userId, filters],
    queryFn: () => getBudgetsWithStats(userId, filters),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds (more frequent updates for spending data)
    refetchOnWindowFocus: true,
  })
}

export function useBudget(id: string, userId: string) {
  return useQuery({
    queryKey: ['budget', id, userId],
    queryFn: () => getBudget(id, userId),
    enabled: !!id && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useBudgetOverview(userId: string) {
  return useQuery({
    queryKey: ['budget-overview', userId],
    queryFn: () => getBudgetOverview(userId),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, budget }: { userId: string; budget: BudgetInput }) =>
      createBudget(userId, budget),
    onSuccess: (result, _variables) => {
      if (result.error) {
        toast.error('Failed to create budget', {
          description: result.error,
        })
        return
      }

      toast.success('Budget created successfully', {
        description: `Budget for ${result.data?.category?.name} has been set up.`,
      })
      
      // Invalidate and refetch budget-related queries
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budgets-with-stats'] })
      queryClient.invalidateQueries({ queryKey: ['budget-overview'] })
    },
    onError: (error) => {
      console.error('Mutation error:', error)
      toast.error('Failed to create budget', {
        description: 'An unexpected error occurred',
      })
    },
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      id, 
      userId, 
      updates 
    }: { 
      id: string; 
      userId: string; 
      updates: Partial<BudgetInput> 
    }) => updateBudget(id, userId, updates),
    onSuccess: (result, variables) => {
      if (result.error) {
        toast.error('Failed to update budget', {
          description: result.error,
        })
        return
      }

      toast.success('Budget updated successfully', {
        description: `Budget has been updated.`,
      })
      
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budgets-with-stats'] })
      queryClient.invalidateQueries({ queryKey: ['budget', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['budget-overview'] })
    },
    onError: (error) => {
      console.error('Mutation error:', error)
      toast.error('Failed to update budget', {
        description: 'An unexpected error occurred',
      })
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      deleteBudget(id, userId),
    onSuccess: (result) => {
      if (result.error) {
        toast.error('Failed to delete budget', {
          description: result.error,
        })
        return
      }

      toast.success('Budget deleted successfully', {
        description: 'The budget has been removed.',
      })
      
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budgets-with-stats'] })
      queryClient.invalidateQueries({ queryKey: ['budget-overview'] })
    },
    onError: (error) => {
      console.error('Mutation error:', error)
      toast.error('Failed to delete budget', {
        description: 'An unexpected error occurred',
      })
    },
  })
}