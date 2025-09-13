'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
} from '@/lib/supabase/transactions'
import type { 
  TransactionInput, 
  TransactionFilters, 
  TransactionSortBy, 
  TransactionSortOrder 
} from '@/lib/validations/transaction'

export function useTransactions(
  userId: string,
  filters?: TransactionFilters,
  sortBy: TransactionSortBy = 'date',
  sortOrder: TransactionSortOrder = 'desc',
  limit?: number,
  offset?: number
) {
  return useQuery({
    queryKey: ['transactions', userId, filters, sortBy, sortOrder, limit, offset],
    queryFn: () => getTransactions(userId, filters, sortBy, sortOrder, limit, offset),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  })
}

export function useTransaction(id: string, userId: string) {
  return useQuery({
    queryKey: ['transaction', id, userId],
    queryFn: () => getTransaction(id, userId),
    enabled: !!id && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useTransactionStats(userId: string, dateFrom?: Date, dateTo?: Date) {
  return useQuery({
    queryKey: ['transaction-stats', userId, dateFrom, dateTo],
    queryFn: () => getTransactionStats(userId, dateFrom, dateTo),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, transaction }: { userId: string; transaction: TransactionInput }) =>
      createTransaction(userId, transaction),
    onSuccess: (result) => {
      if (result.error) {
        toast.error('Failed to create transaction', {
          description: result.error,
        })
        return
      }

      toast.success('Transaction created successfully')
      
      // Invalidate and refetch transaction-related queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (error) => {
      console.error('Mutation error:', error)
      toast.error('Failed to create transaction', {
        description: 'An unexpected error occurred',
      })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      id, 
      userId, 
      updates 
    }: { 
      id: string; 
      userId: string; 
      updates: Partial<TransactionInput> 
    }) => updateTransaction(id, userId, updates),
    onSuccess: (result, variables) => {
      if (result.error) {
        toast.error('Failed to update transaction', {
          description: result.error,
        })
        return
      }

      toast.success('Transaction updated successfully')
      
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transaction', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] })
    },
    onError: (error) => {
      console.error('Mutation error:', error)
      toast.error('Failed to update transaction', {
        description: 'An unexpected error occurred',
      })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      deleteTransaction(id, userId),
    onSuccess: (result) => {
      if (result.error) {
        toast.error('Failed to delete transaction', {
          description: result.error,
        })
        return
      }

      toast.success('Transaction deleted successfully')
      
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] })
    },
    onError: (error) => {
      console.error('Mutation error:', error)
      toast.error('Failed to delete transaction', {
        description: 'An unexpected error occurred',
      })
    },
  })
}