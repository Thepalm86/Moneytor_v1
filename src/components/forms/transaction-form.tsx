'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Loader2, DollarSign, FileText, Tag, TrendingDown, TrendingUp, Sparkles, Edit, Lightbulb, Command } from 'lucide-react'
import { format } from 'date-fns'

import { cn } from '@/lib/utils'
import { transactionFormSchema, type TransactionFormData } from '@/lib/validations/transaction'
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/use-transactions'
import { useCategoriesByType } from '@/hooks/use-categories'
import { getIcon } from '@/lib/utils/icons'
import { useGamification } from '@/contexts/gamification-context'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface TransactionFormProps {
  userId: string
  initialData?: Partial<TransactionFormData> & { id?: string }
  onSuccess?: () => void
  onCancel?: () => void
}

export function TransactionForm({
  userId,
  initialData,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(
    initialData?.type || 'expense'
  )

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: initialData?.amount || '',
      description: initialData?.description || '',
      categoryId: initialData?.categoryId || '',
      date: initialData?.date || new Date(),
      type: initialData?.type || 'expense',
    },
  })

  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()
  const { data: categoriesData } = useCategoriesByType(userId, transactionType)
  const categories = categoriesData?.data || []
  const { triggerEvent, showCelebration } = useGamification()

  const isEditing = !!initialData?.id
  const isLoading = createTransaction.isPending || updateTransaction.isPending

  const onSubmit = async (data: TransactionFormData) => {
    const transactionInput = {
      amount: parseFloat(data.amount),
      description: data.description,
      categoryId: data.categoryId,
      date: data.date,
      type: data.type,
    }

    if (isEditing && initialData?.id) {
      const result = await updateTransaction.mutateAsync({
        id: initialData.id,
        userId,
        updates: transactionInput,
      })

      if (!result.error) {
        // Trigger gamification event for transaction update
        await triggerEvent('transaction_logged', {
          amount: transactionInput.amount,
          type: transactionInput.type,
          categoryId: transactionInput.categoryId,
          action: 'update'
        })

        // Show micro-celebration for edit
        showCelebration({
          type: 'subtle',
          title: 'Transaction Updated!',
          message: 'Your transaction has been successfully updated.',
          color: '#3b82f6',
          duration: 2000
        })

        onSuccess?.()
      }
    } else {
      const result = await createTransaction.mutateAsync({
        userId,
        transaction: transactionInput,
      })

      if (!result.error) {
        // Trigger gamification event for new transaction
        await triggerEvent('transaction_logged', {
          amount: transactionInput.amount,
          type: transactionInput.type,
          categoryId: transactionInput.categoryId,
          action: 'create'
        })

        // Show micro-celebration for new transaction
        showCelebration({
          type: 'subtle',
          title: transactionType === 'income' ? 'Income Added!' : 'Expense Logged!',
          message: `Successfully tracked your ${transactionInput.type} of $${Math.round(transactionInput.amount)}`,
          color: transactionType === 'income' ? '#10b981' : '#ef4444',
          duration: 3000
        })

        form.reset()
        onSuccess?.()
      }
    }
  }

  const handleTypeChange = (type: string) => {
    const validType = type as 'income' | 'expense'
    setTransactionType(validType)
    form.setValue('type', validType)
    form.setValue('categoryId', '') // Reset category when type changes
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + Enter to submit form
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault()
        form.handleSubmit(onSubmit)()
      }
      // Escape to cancel
      if (event.key === 'Escape' && onCancel) {
        event.preventDefault()
        onCancel()
      }
      // Tab + I to switch to income
      if (event.key === 'i' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        handleTypeChange('income')
      }
      // Tab + E to switch to expense  
      if (event.key === 'e' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        handleTypeChange('expense')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [form, onCancel, onSubmit, handleTypeChange])

  return (
    <Card className="mx-auto w-full max-w-2xl border-0 shadow-none bg-transparent">
      <CardHeader className="text-center pb-6">
        <CardTitle className={cn(
          "text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-2",
          transactionType === 'income' 
            ? "from-emerald-600 to-teal-600" 
            : "from-red-600 to-rose-600"
        )}>
          {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
        </CardTitle>
        <p className="text-gray-600 text-sm">
          {isEditing ? 'Update your transaction details' : 'Enter your transaction information below'}
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Transaction Type Tabs */}
            <div className="bg-gray-100/60 backdrop-blur-sm rounded-xl p-1 mb-6">
              <Tabs value={transactionType} onValueChange={handleTypeChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-transparent h-12">
                  <TabsTrigger
                    value="expense"
                    className={cn(
                      "text-red-600 font-semibold transition-all duration-300 rounded-lg",
                      "data-[state=active]:bg-white/80 data-[state=active]:shadow-lg data-[state=active]:text-red-700",
                      "hover:bg-white/40"
                    )}
                  >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Expense
                  </TabsTrigger>
                  <TabsTrigger
                    value="income"
                    className={cn(
                      "text-green-600 font-semibold transition-all duration-300 rounded-lg",
                      "data-[state=active]:bg-white/80 data-[state=active]:shadow-lg data-[state=active]:text-green-700",
                      "hover:bg-white/40"
                    )}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Income
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="expense" className="mt-6 space-y-4">
                  <TransactionFormFields
                    form={form}
                    categories={categories}
                    transactionType="expense"
                  />
                </TabsContent>

                <TabsContent value="income" className="mt-6 space-y-4">
                  <TransactionFormFields
                    form={form}
                    categories={categories}
                    transactionType="income"
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'flex-1 h-12 text-base font-semibold transition-all duration-300 shadow-lg',
                  transactionType === 'income'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
                    : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white',
                  'hover:shadow-xl hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-50'
                )}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Update Transaction
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Add Transaction
                  </>
                )}
              </Button>

              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel} 
                  disabled={isLoading}
                  className="h-12 px-6 bg-white/60 backdrop-blur-sm border-gray-300 hover:bg-white/80 transition-all duration-300"
                >
                  Cancel
                </Button>
              )}
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="pt-4 border-t border-gray-200/60">
              <div className="text-xs text-gray-500 text-center space-y-1">
                <p className="font-medium flex items-center justify-center gap-2">
                  <Lightbulb className="w-3 h-3" />
                  Keyboard Shortcuts:
                </p>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                  <span><kbd className="px-1 py-0.5 bg-gray-200/60 rounded text-xs flex items-center gap-1"><Command className="w-2 h-2" />+Enter</kbd> Submit</span>
                  <span><kbd className="px-1 py-0.5 bg-gray-200/60 rounded text-xs">Esc</kbd> Cancel</span>
                  <span><kbd className="px-1 py-0.5 bg-gray-200/60 rounded text-xs flex items-center gap-1"><Command className="w-2 h-2" />+E</kbd> Expense</span>
                  <span><kbd className="px-1 py-0.5 bg-gray-200/60 rounded text-xs flex items-center gap-1"><Command className="w-2 h-2" />+I</kbd> Income</span>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

interface TransactionFormFieldsProps {
  form: any
  categories: any[]
  transactionType: 'income' | 'expense'
}

function TransactionFormFields({ form, categories, transactionType }: TransactionFormFieldsProps) {
  return (
    <div className="space-y-6">
      {/* Amount */}
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Amount
            </FormLabel>
            <FormControl>
              <div className="relative">
                <span className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 transform font-semibold text-lg",
                  transactionType === 'income' ? "text-green-600" : "text-red-600"
                )}>
                  $
                </span>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={cn(
                    "pl-8 h-12 text-lg font-semibold bg-white/60 backdrop-blur-sm border-gray-300",
                    "focus:border-2 transition-all duration-300",
                    transactionType === 'income' 
                      ? "focus:border-green-500 focus:ring-green-100" 
                      : "focus:border-red-500 focus:ring-red-100"
                  )}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Description
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={
                  transactionType === 'income'
                    ? 'e.g., Salary payment, Freelance work'
                    : 'e.g., Grocery shopping, Coffee'
                }
                className="h-12 bg-white/60 backdrop-blur-sm border-gray-300 focus:border-2 focus:border-blue-500 focus:ring-blue-100 transition-all duration-300"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Category */}
      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Category
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="h-12 bg-white/60 backdrop-blur-sm border-gray-300 focus:border-2 focus:border-purple-500 focus:ring-purple-100 transition-all duration-300">
                  <SelectValue placeholder="Select a category">
                    {field.value && (
                      <div className="flex items-center gap-2">
                        {(() => {
                          const selectedCategory = categories.find(cat => cat.id === field.value)
                          if (!selectedCategory) return null
                          const IconComponent = getIcon(selectedCategory.icon)
                          return (
                            <>
                              <div
                                className="flex h-5 w-5 items-center justify-center rounded-full"
                                style={{ backgroundColor: selectedCategory.color }}
                              >
                                <IconComponent className="h-3 w-3 text-white" />
                              </div>
                              <span className="font-medium text-gray-900">{selectedCategory.name}</span>
                            </>
                          )
                        })()}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-white/95 backdrop-blur-xl border border-gray-200 shadow-xl max-h-60 overflow-y-auto">
                {categories.map(category => {
                  const IconComponent = getIcon(category.icon)
                  return (
                    <SelectItem 
                      key={category.id} 
                      value={category.id}
                      className="hover:bg-gray-50/80 cursor-pointer p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-6 w-6 items-center justify-center rounded-full shadow-sm"
                          style={{ backgroundColor: category.color }}
                        >
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Date */}
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Date
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full h-12 pl-3 text-left font-medium bg-white/60 backdrop-blur-sm border-gray-300',
                      'hover:bg-white/80 focus:border-2 focus:border-blue-500 transition-all duration-300',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent
                className="bg-white/98 w-auto rounded-2xl border border-blue-200/30 p-4 shadow-2xl backdrop-blur-xl"
                align="start"
                sideOffset={8}
              >
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={date => date > new Date() || date < new Date('1900-01-01')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
