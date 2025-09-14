'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Loader2, Target, Lightbulb, TrendingUp, Calculator } from 'lucide-react'
import { format } from 'date-fns'

import { cn } from '@/lib/utils'
import { budgetSchema, type BudgetInput } from '@/lib/validations/budget'
import { useCreateBudget, useUpdateBudget } from '@/hooks/use-budgets'
import { useCategoriesByType } from '@/hooks/use-categories'
import { getIcon } from '@/lib/utils/icons'

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'

interface BudgetFormProps {
  userId: string
  initialData?: Partial<BudgetInput> & { id?: string }
  onSuccess?: () => void
  onCancel?: () => void
}

export function BudgetForm({ userId, initialData, onSuccess, onCancel }: BudgetFormProps) {
  const form = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      categoryId: initialData?.categoryId || '',
      amount: initialData?.amount || 0,
      period: initialData?.period || 'monthly',
      startDate: initialData?.startDate || new Date(),
      endDate: initialData?.endDate || undefined,
    },
  })

  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()
  const { data: categoriesData } = useCategoriesByType(userId, 'expense')
  const categories = categoriesData?.data || []

  const isEditing = !!initialData?.id
  const isLoading = createBudget.isPending || updateBudget.isPending

  const onSubmit = async (data: BudgetInput) => {
    if (isEditing && initialData?.id) {
      const result = await updateBudget.mutateAsync({
        id: initialData.id,
        userId,
        updates: data,
      })

      if (!result.error) {
        onSuccess?.()
      }
    } else {
      const result = await createBudget.mutateAsync({
        userId,
        budget: data,
      })

      if (!result.error) {
        form.reset()
        onSuccess?.()
      }
    }
  }

  const selectedCategory = categories.find(c => c.id === form.watch('categoryId'))

  return (
    <div className="relative">
      {/* Glassmorphic backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
      
      <Card className="relative z-50 glass-card mx-auto w-full max-w-2xl animate-fade-in border-0 shadow-2xl">
        {/* Dynamic theme based on form state */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-50/50 to-indigo-50/50 backdrop-blur-xl" />
        
        <CardHeader className="relative space-y-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg ring-4 ring-blue-100">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-gray-900">
                {isEditing ? '✏️ Edit Budget' : '🎯 Create New Budget'}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                Set intelligent spending limits and track your progress with smart insights.
              </p>
            </div>
            {selectedCategory && (
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: selectedCategory.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {selectedCategory.name}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Selected Category</p>
              </div>
            )}
          </div>
          
          {/* Smart tips banner */}
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Smart Budgeting Tips</span>
            </div>
            <p className="text-xs text-blue-700 leading-relaxed">
              Start with 80% of your average monthly spending in this category. You can always adjust based on your progress.
            </p>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Category Selection */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Category
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-gray-200 hover:border-blue-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all">
                        <SelectValue placeholder="🎯 Select an expense category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white/95 backdrop-blur-lg border-0 shadow-xl">
                      {categories.map(category => {
                        const IconComponent = getIcon(category.icon)
                        return (
                          <SelectItem 
                            key={category.id} 
                            value={category.id}
                            className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="flex h-5 w-5 items-center justify-center rounded-full shadow-sm"
                                style={{ backgroundColor: category.color }}
                              >
                                <IconComponent className="h-3 w-3 text-white" />
                              </div>
                              <span className="font-medium">{category.name}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-100">
                    💡 Only expense categories are available for budgeting. Income categories are tracked separately.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Budget Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Budget Amount
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 transform text-gray-500 font-medium text-lg">
                        $
                      </span>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="h-12 pl-10 pr-4 text-lg font-semibold bg-white/80 backdrop-blur-sm border-gray-200 hover:border-green-300 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all group-focus-within:shadow-lg"
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                      {field.value > 0 && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                          💰 ${field.value.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-gray-600 bg-green-50 p-2 rounded border border-green-100">
                    💡 Set the maximum amount you want to spend in this category. Start conservative and adjust as needed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Budget Period */}
            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Period</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>How often should this budget reset?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick start date</span>
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
                          disabled={date => date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date (Optional) */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick end date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={date => {
                            const startDate = form.getValues('startDate')
                            return date < new Date('1900-01-01') || (startDate && date <= startDate)
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>Leave empty for ongoing budget</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Budget Preview */}
            {selectedCategory && form.watch('amount') > 0 && (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: selectedCategory.color }}>
                    <Target className="w-3 h-3 text-white" />
                  </div>
                  <h4 className="font-medium text-gray-900">Budget Preview</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Category</p>
                    <p className="font-semibold">{selectedCategory.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Amount</p>
                    <p className="font-semibold text-green-600">${form.watch('amount').toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Period</p>
                    <p className="font-semibold capitalize">{form.watch('period')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Daily Average</p>
                    <p className="font-semibold text-blue-600">
                      ${(form.watch('amount') / (form.watch('period') === 'weekly' ? 7 : form.watch('period') === 'monthly' ? 30 : 365)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all font-semibold text-base"
              >
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {isEditing ? '✅ Update Budget' : '🚀 Create Budget'}
              </Button>

              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel} 
                  disabled={isLoading}
                  className="h-12 px-6 bg-white/80 backdrop-blur-sm hover:bg-gray-50 border-gray-300 font-medium"
                >
                  Cancel
                </Button>
              )}
            </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
