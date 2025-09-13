'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

import { cn } from '@/lib/utils'
import { transactionFormSchema, type TransactionFormData } from '@/lib/validations/transaction'
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/use-transactions'
import { useCategoriesByType } from '@/hooks/use-categories'
import { getIcon } from '@/lib/utils/icons'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  onCancel 
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
        onSuccess?.()
      }
    } else {
      const result = await createTransaction.mutateAsync({
        userId,
        transaction: transactionInput,
      })

      if (!result.error) {
        form.reset()
        onSuccess?.()
      }
    }
  }

  const handleTypeChange = (type: 'income' | 'expense') => {
    setTransactionType(type)
    form.setValue('type', type)
    form.setValue('categoryId', '') // Reset category when type changes
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Transaction Type Tabs */}
            <Tabs
              value={transactionType}
              onValueChange={handleTypeChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="expense" className="text-red-600 data-[state=active]:text-red-600">
                  Expense
                </TabsTrigger>
                <TabsTrigger value="income" className="text-green-600 data-[state=active]:text-green-600">
                  Income
                </TabsTrigger>
              </TabsList>

              <TabsContent value="expense" className="space-y-4 mt-6">
                <TransactionFormFields 
                  form={form}
                  categories={categories}
                  transactionType="expense"
                />
              </TabsContent>

              <TabsContent value="income" className="space-y-4 mt-6">
                <TransactionFormFields 
                  form={form}
                  categories={categories}
                  transactionType="income"
                />
              </TabsContent>
            </Tabs>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "flex-1",
                  transactionType === 'income' 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-red-600 hover:bg-red-700"
                )}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Transaction' : 'Add Transaction'}
              </Button>
              
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
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
    <>
      {/* Amount */}
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Amount</FormLabel>
            <FormControl>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-8"
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
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={
                  transactionType === 'income' 
                    ? "e.g., Salary payment, Freelance work" 
                    : "e.g., Grocery shopping, Coffee"
                }
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
            <FormLabel>Category</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories.map((category) => {
                  const IconComponent = getIcon(category.icon)
                  return (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: category.color }}
                        >
                          <IconComponent className="w-3 h-3 text-white" />
                        </div>
                        {category.name}
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
            <FormLabel>Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}