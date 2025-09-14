'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/lib/supabase/transactions'
import { useOptimisticUpdate } from '@/lib/utils/performance'
import type { 
  TransactionInput, 
  Transaction 
} from '@/lib/validations/transaction'

// Optimistic create transaction for mobile UX
export function useOptimisticCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, transaction }: { userId: string; transaction: TransactionInput }) => {
      // Create optimistic transaction
      const optimisticTransaction: Transaction = {
        id: `temp-${Date.now()}`,
        user_id: userId,
        amount: transaction.amount,
        description: transaction.description,
        type: transaction.type,
        category_id: transaction.category_id,
        date: transaction.date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Add any other required fields
      }

      // Optimistically update the cache
      queryClient.setQueryData(['transactions', userId], (oldData: any) => {
        if (!oldData?.data) return oldData
        
        return {
          ...oldData,
          data: [optimisticTransaction, ...oldData.data]
        }
      })

      // Update stats optimistically
      queryClient.setQueryData(['transaction-stats', userId], (oldStats: any) => {
        if (!oldStats?.data) return oldStats

        const isIncome = transaction.type === 'income'
        const amount = Number(transaction.amount)

        return {
          ...oldStats,
          data: {
            ...oldStats.data,
            total_income: oldStats.data.total_income + (isIncome ? amount : 0),
            total_expenses: oldStats.data.total_expenses + (!isIncome ? amount : 0),
            net_worth: oldStats.data.net_worth + (isIncome ? amount : -amount),
            transaction_count: oldStats.data.transaction_count + 1,
          }
        }
      })

      // Return actual API call
      return createTransaction(userId, transaction)
    },
    onSuccess: (result, variables) => {
      if (result.error) {
        // Revert optimistic update on error
        queryClient.invalidateQueries({ queryKey: ['transactions'] })
        queryClient.invalidateQueries({ queryKey: ['transaction-stats'] })
        
        toast.error('Failed to create transaction', {
          description: result.error,
        })
        return
      }

      // Replace optimistic transaction with real data
      queryClient.setQueryData(['transactions', variables.userId], (oldData: any) => {
        if (!oldData?.data) return oldData
        
        return {
          ...oldData,
          data: oldData.data.map((t: Transaction) => 
            t.id.startsWith('temp-') ? result.data : t
          )
        }
      })

      // Update all related queries with real data
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      
      toast.success('Transaction created successfully', {
        duration: 2000,
      })
    },
    onError: (error, variables) => {
      // Revert optimistic updates
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] })
      
      console.error('Create transaction error:', error)
      toast.error('Failed to create transaction', {
        description: 'Please check your connection and try again',
        duration: 4000,
      })
    },
  })
}

// Optimistic update transaction
export function useOptimisticUpdateTransaction() {
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
    }) => {
      // Store original data for potential rollback
      const originalData = queryClient.getQueryData(['transactions', userId])
      
      // Apply optimistic update
      queryClient.setQueryData(['transactions', userId], (oldData: any) => {
        if (!oldData?.data) return oldData
        
        return {
          ...oldData,
          data: oldData.data.map((t: Transaction) => 
            t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
          )
        }
      })

      // Store original data for rollback
      queryClient.setQueryData(['optimistic-rollback', id], originalData)

      return updateTransaction(id, userId, updates)
    },
    onSuccess: (result, variables) => {
      if (result.error) {
        // Rollback on error
        const rollbackData = queryClient.getQueryData(['optimistic-rollback', variables.id])
        if (rollbackData) {
          queryClient.setQueryData(['transactions', variables.userId], rollbackData)
        }
        
        toast.error('Failed to update transaction', {
          description: result.error,
        })
        return
      }

      // Clean up rollback data
      queryClient.removeQueries({ queryKey: ['optimistic-rollback', variables.id] })
      
      // Ensure we have the latest server data
      queryClient.invalidateQueries({ queryKey: ['transaction', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] })
      
      toast.success('Transaction updated successfully', {
        duration: 2000,
      })
    },
    onError: (error, variables) => {
      // Rollback optimistic update
      const rollbackData = queryClient.getQueryData(['optimistic-rollback', variables.id])
      if (rollbackData) {
        queryClient.setQueryData(['transactions', variables.userId], rollbackData)
      }
      
      queryClient.removeQueries({ queryKey: ['optimistic-rollback', variables.id] })
      
      console.error('Update transaction error:', error)
      toast.error('Failed to update transaction', {
        description: 'Please check your connection and try again',
        duration: 4000,
      })
    },
  })
}

// Optimistic delete transaction
export function useOptimisticDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => {
      // Store original data for potential rollback
      const originalData = queryClient.getQueryData(['transactions', userId])
      const transactionToDelete = originalData?.data?.find((t: Transaction) => t.id === id)
      
      // Optimistically remove from UI
      queryClient.setQueryData(['transactions', userId], (oldData: any) => {
        if (!oldData?.data) return oldData
        
        return {
          ...oldData,
          data: oldData.data.filter((t: Transaction) => t.id !== id)
        }
      })

      // Update stats optimistically
      if (transactionToDelete) {
        queryClient.setQueryData(['transaction-stats', userId], (oldStats: any) => {
          if (!oldStats?.data) return oldStats

          const isIncome = transactionToDelete.type === 'income'
          const amount = Number(transactionToDelete.amount)

          return {
            ...oldStats,
            data: {
              ...oldStats.data,
              total_income: oldStats.data.total_income - (isIncome ? amount : 0),
              total_expenses: oldStats.data.total_expenses - (!isIncome ? amount : 0),
              net_worth: oldStats.data.net_worth - (isIncome ? amount : -amount),
              transaction_count: oldStats.data.transaction_count - 1,
            }
          }
        })
      }

      // Store for rollback
      queryClient.setQueryData(['optimistic-rollback', id], { 
        originalData, 
        deletedTransaction: transactionToDelete 
      })

      return deleteTransaction(id, userId)
    },
    onSuccess: (result, variables) => {
      if (result.error) {
        // Rollback on error
        const rollbackInfo = queryClient.getQueryData(['optimistic-rollback', variables.id]) as any
        if (rollbackInfo?.originalData) {
          queryClient.setQueryData(['transactions', variables.userId], rollbackInfo.originalData)
          queryClient.invalidateQueries({ queryKey: ['transaction-stats'] })
        }
        
        toast.error('Failed to delete transaction', {
          description: result.error,
        })
        return
      }

      // Clean up rollback data
      queryClient.removeQueries({ queryKey: ['optimistic-rollback', variables.id] })
      
      // Refresh related data
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] })
      
      toast.success('Transaction deleted successfully', {
        duration: 2000,
        action: {
          label: 'Undo',
          onClick: () => {
            // TODO: Implement undo functionality
            toast.info('Undo functionality coming soon')
          }
        }
      })
    },
    onError: (error, variables) => {
      // Rollback optimistic delete
      const rollbackInfo = queryClient.getQueryData(['optimistic-rollback', variables.id]) as any
      if (rollbackInfo?.originalData) {
        queryClient.setQueryData(['transactions', variables.userId], rollbackInfo.originalData)
        queryClient.invalidateQueries({ queryKey: ['transaction-stats'] })
      }
      
      queryClient.removeQueries({ queryKey: ['optimistic-rollback', variables.id] })
      
      console.error('Delete transaction error:', error)
      toast.error('Failed to delete transaction', {
        description: 'Please check your connection and try again',
        duration: 4000,
      })
    },
  })
}

// Bulk operations with optimistic updates
export function useOptimisticBulkDelete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ids, userId }: { ids: string[]; userId: string }) => {
      // Store original data
      const originalData = queryClient.getQueryData(['transactions', userId])
      
      // Optimistically remove transactions
      queryClient.setQueryData(['transactions', userId], (oldData: any) => {
        if (!oldData?.data) return oldData
        
        return {
          ...oldData,
          data: oldData.data.filter((t: Transaction) => !ids.includes(t.id))
        }
      })

      // Store for rollback
      queryClient.setQueryData(['bulk-rollback', userId], originalData)

      // Execute bulk delete (implement in your backend)
      const results = await Promise.allSettled(
        ids.map(id => deleteTransaction(id, userId))
      )

      // Check if any failed
      const failures = results.filter(r => r.status === 'rejected')
      if (failures.length > 0) {
        throw new Error(`Failed to delete ${failures.length} transactions`)
      }

      return { success: true, deletedCount: ids.length }
    },
    onSuccess: (result, variables) => {
      // Clean up rollback data
      queryClient.removeQueries({ queryKey: ['bulk-rollback', variables.userId] })
      
      // Refresh stats
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] })
      
      toast.success(`Successfully deleted ${variables.ids.length} transactions`, {
        duration: 3000,
      })
    },
    onError: (error, variables) => {
      // Rollback optimistic changes
      const rollbackData = queryClient.getQueryData(['bulk-rollback', variables.userId])
      if (rollbackData) {
        queryClient.setQueryData(['transactions', variables.userId], rollbackData)
      }
      
      queryClient.removeQueries({ queryKey: ['bulk-rollback', variables.userId] })
      
      console.error('Bulk delete error:', error)
      toast.error('Failed to delete transactions', {
        description: 'Some transactions could not be deleted. Please try again.',
        duration: 4000,
      })
    },
  })
}