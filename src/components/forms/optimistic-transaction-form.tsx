'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Check, X, Loader2, Plus, Minus } from 'lucide-react'
import { useUser } from '@/contexts/user-context'
import { useCategories } from '@/hooks/use-categories'
import { useOptimisticCreateTransaction } from '@/hooks/use-optimistic-transactions'
import { transactionSchema, type TransactionInput } from '@/lib/validations/transaction'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MobileFloatingInput, MobileAmountInput } from '@/components/forms/mobile-form-components'
import { cn } from '@/lib/utils'

interface OptimisticTransactionFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  defaultType?: 'income' | 'expense'
  className?: string
}

export function OptimisticTransactionForm({
  onSuccess,
  onCancel,
  defaultType = 'expense',
  className,
}: OptimisticTransactionFormProps) {
  const { user } = useUser()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [optimisticFeedback, setOptimisticFeedback] = useState<'pending' | 'success' | 'error' | null>(null)

  const form = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: defaultType,
      amount: '',
      description: '',
      category_id: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  })

  const { data: categoriesData } = useCategories(user?.id || '')
  const createMutation = useOptimisticCreateTransaction()

  const categories = categoriesData?.data || []
  const watchedType = form.watch('type')

  const onSubmit = async (data: TransactionInput) => {
    if (!user?.id || isSubmitted) return

    setIsSubmitted(true)
    setOptimisticFeedback('pending')

    try {
      // Show immediate optimistic feedback
      setTimeout(() => {
        setOptimisticFeedback('success')
      }, 100)

      await createMutation.mutateAsync({
        userId: user.id,
        transaction: data,
      })

      // Keep success feedback visible briefly
      setTimeout(() => {
        setOptimisticFeedback(null)
        setIsSubmitted(false)
        form.reset()
        onSuccess?.()
      }, 1200)
    } catch (error) {
      setOptimisticFeedback('error')
      setTimeout(() => {
        setOptimisticFeedback(null)
        setIsSubmitted(false)
      }, 2000)
    }
  }

  const getOptimisticButtonContent = () => {
    switch (optimisticFeedback) {
      case 'pending':
        return (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </div>
        )
      case 'success':
        return (
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4" />
            <span>Added!</span>
          </div>
        )
      case 'error':
        return (
          <div className="flex items-center space-x-2">
            <X className="h-4 w-4" />
            <span>Failed</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center space-x-2">
            {watchedType === 'income' ? (
              <Plus className="h-4 w-4" />
            ) : (
              <Minus className="h-4 w-4" />
            )}
            <span>Add {watchedType === 'income' ? 'Income' : 'Expense'}</span>
          </div>
        )
    }
  }

  const getButtonStyles = () => {
    const baseStyles = "h-14 text-base font-medium transition-all duration-200 touch-manipulation"
    
    switch (optimisticFeedback) {
      case 'pending':
        return cn(baseStyles, "bg-blue-500 hover:bg-blue-600 text-white cursor-wait")
      case 'success':
        return cn(baseStyles, "bg-green-500 hover:bg-green-600 text-white animate-pulse")
      case 'error':
        return cn(baseStyles, "bg-red-500 hover:bg-red-600 text-white")
      default:
        return cn(
          baseStyles,
          watchedType === 'income'
            ? "bg-green-500 hover:bg-green-600 active:bg-green-700 text-white shadow-lg"
            : "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-lg"
        )
    }
  }

  return (
    <Card className={cn("p-6 space-y-6", className)}>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          Quick Add {watchedType === 'income' ? 'Income' : 'Expense'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Add transactions instantly with optimistic updates
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Transaction Type Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={watchedType === 'expense' ? 'default' : 'outline'}
              size="lg"
              onClick={() => form.setValue('type', 'expense')}
              className={cn(
                "h-12 text-base font-medium",
                watchedType === 'expense' && "bg-red-500 hover:bg-red-600 text-white"
              )}
            >
              <Minus className="h-4 w-4 mr-2" />
              Expense
            </Button>
            <Button
              type="button"
              variant={watchedType === 'income' ? 'default' : 'outline'}
              size="lg"
              onClick={() => form.setValue('type', 'income')}
              className={cn(
                "h-12 text-base font-medium",
                watchedType === 'income' && "bg-green-500 hover:bg-green-600 text-white"
              )}
            >
              <Plus className="h-4 w-4 mr-2" />
              Income
            </Button>
          </div>

          {/* Amount Input */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Amount</FormLabel>
                <FormControl>
                  <MobileAmountInput
                    placeholder="0.00"
                    className="h-16 text-xl font-semibold text-center"
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description Input */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Description</FormLabel>
                <FormControl>
                  <MobileFloatingInput
                    placeholder="What was this for?"
                    className="h-12 text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category Selection */}
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories
                      .filter(cat => cat.type === watchedType)
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center space-x-2">
                            {category.icon && <span>{category.icon}</span>}
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Input */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Date</FormLabel>
                <FormControl>
                  <MobileFloatingInput
                    type="date"
                    className="h-12 text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitted || createMutation.isPending}
              className={getButtonStyles()}
              size="lg"
            >
              {getOptimisticButtonContent()}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onCancel}
                disabled={isSubmitted}
                className="w-full h-12 text-base"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Form>
    </Card>
  )
}