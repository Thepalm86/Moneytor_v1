'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getGoals,
  getGoalsWithProgress,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  contributeToGoal,
  getGoalOverview,
} from '@/lib/supabase/goals'
import type { GoalInput, GoalFilters, GoalContribution } from '@/lib/validations/goal'

export function useGoals(userId: string, filters?: GoalFilters) {
  return useQuery({
    queryKey: ['goals', userId, filters],
    queryFn: () => getGoals(userId, filters),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  })
}

export function useGoalsWithProgress(userId: string, filters?: GoalFilters) {
  return useQuery({
    queryKey: ['goals-with-progress', userId, filters],
    queryFn: () => getGoalsWithProgress(userId, filters),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds (more frequent updates for progress data)
    refetchOnWindowFocus: true,
  })
}

export function useGoal(id: string, userId: string) {
  return useQuery({
    queryKey: ['goal', id, userId],
    queryFn: () => getGoal(id, userId),
    enabled: !!id && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useGoalOverview(userId: string) {
  return useQuery({
    queryKey: ['goal-overview', userId],
    queryFn: () => getGoalOverview(userId),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, goal }: { userId: string; goal: GoalInput }) =>
      createGoal(userId, goal),
    onSuccess: (result, _variables) => {
      if (result.error) {
        toast.error('Failed to create goal', {
          description: result.error,
        })
        return
      }

      toast.success('Goal created successfully', {
        description: `Goal "${result.data?.name}" has been created.`,
      })
      
      // Invalidate and refetch goal-related queries
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['goals-with-progress'] })
      queryClient.invalidateQueries({ queryKey: ['goal-overview'] })
    },
    onError: (error) => {
      console.error('Mutation error:', error)
      toast.error('Failed to create goal', {
        description: 'An unexpected error occurred',
      })
    },
  })
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      id, 
      userId, 
      updates 
    }: { 
      id: string; 
      userId: string; 
      updates: Partial<GoalInput> 
    }) => updateGoal(id, userId, updates),
    onSuccess: (result, variables) => {
      if (result.error) {
        toast.error('Failed to update goal', {
          description: result.error,
        })
        return
      }

      toast.success('Goal updated successfully', {
        description: `Goal has been updated.`,
      })
      
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['goals-with-progress'] })
      queryClient.invalidateQueries({ queryKey: ['goal', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['goal-overview'] })
    },
    onError: (error) => {
      console.error('Mutation error:', error)
      toast.error('Failed to update goal', {
        description: 'An unexpected error occurred',
      })
    },
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      deleteGoal(id, userId),
    onSuccess: (result) => {
      if (result.error) {
        toast.error('Failed to delete goal', {
          description: result.error,
        })
        return
      }

      toast.success('Goal deleted successfully', {
        description: 'The goal has been removed.',
      })
      
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['goals-with-progress'] })
      queryClient.invalidateQueries({ queryKey: ['goal-overview'] })
    },
    onError: (error) => {
      console.error('Mutation error:', error)
      toast.error('Failed to delete goal', {
        description: 'An unexpected error occurred',
      })
    },
  })
}

export function useContributeToGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      id, 
      userId, 
      contribution 
    }: { 
      id: string; 
      userId: string; 
      contribution: GoalContribution 
    }) => contributeToGoal(id, userId, contribution),
    onSuccess: (result, variables) => {
      if (result.error) {
        toast.error('Failed to add contribution', {
          description: result.error,
        })
        return
      }

      const isCompleted = result.data?.status === 'completed'
      toast.success(
        isCompleted ? 'Goal completed!' : 'Contribution added successfully',
        {
          description: isCompleted 
            ? `Congratulations! You've reached your goal "${result.data?.name}".`
            : `$${variables.contribution.amount} has been added to your goal.`,
        }
      )
      
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['goals-with-progress'] })
      queryClient.invalidateQueries({ queryKey: ['goal', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['goal-overview'] })
    },
    onError: (error) => {
      console.error('Mutation error:', error)
      toast.error('Failed to add contribution', {
        description: 'An unexpected error occurred',
      })
    },
  })
}