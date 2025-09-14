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
import { Badge } from '@/components/ui/badge'
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
    <div className="space-y-6">
      {/* Smart tips banner */}
      <div className="rounded-2xl border border-blue-200/30 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/40 p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg ring-2 ring-blue-100/50">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-blue-900">Smart Budget Assistant</h3>
              <Badge
                variant="secondary"
                className="bg-blue-100/60 px-2 py-0.5 text-xs text-blue-800"
              >
                AI Powered
              </Badge>
            </div>
            <p className="text-sm leading-relaxed text-blue-700">
              💡 <strong>Pro Tip:</strong> Start with 80% of your average monthly spending in this
              category. Our intelligent alerts will help you stay on track and adjust as needed.
            </p>
          </div>
          {selectedCategory && (
            <div className="flex items-center gap-2 rounded-lg border border-blue-200/30 bg-white/60 px-3 py-1.5 backdrop-blur-sm">
              <div
                className="h-3 w-3 rounded-full shadow-sm"
                style={{ backgroundColor: selectedCategory.color }}
              />
              <span className="text-xs font-medium text-gray-700">{selectedCategory.name}</span>
            </div>
          )}
        </div>
      </div>
      {/* Main Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-sm">
                      <TrendingUp className="h-3 w-3 text-white" />
                    </div>
                    Category Selection
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-14 rounded-xl border-gray-200/60 bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:border-purple-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-100">
                        <SelectValue placeholder="🎯 Choose an expense category to budget" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-0 bg-white/95 shadow-2xl backdrop-blur-lg">
                      {categories.map(category => {
                        const IconComponent = getIcon(category.icon)
                        return (
                          <SelectItem
                            key={category.id}
                            value={category.id}
                            className="cursor-pointer rounded-lg py-3 hover:bg-purple-50/80 focus:bg-purple-50/80"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="flex h-6 w-6 items-center justify-center rounded-full shadow-md ring-1 ring-white/20"
                                style={{ backgroundColor: category.color }}
                              >
                                <IconComponent className="h-3.5 w-3.5 text-white" />
                              </div>
                              <span className="font-medium text-gray-800">{category.name}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <FormDescription className="rounded-lg border border-blue-200/30 bg-gradient-to-r from-blue-50/60 to-indigo-50/40 p-3 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">💡</span>
                      <span>
                        Only expense categories are available for budgeting. Track income separately
                        for better financial insights.
                      </span>
                    </div>
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
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-sm">
                      <Calculator className="h-3 w-3 text-white" />
                    </div>
                    Budget Amount
                  </FormLabel>
                  <FormControl>
                    <div className="group relative">
                      <div className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
                        <span className="text-lg font-semibold text-gray-400">$</span>
                      </div>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="h-14 rounded-xl border-gray-200/60 bg-white/90 pl-12 pr-20 text-xl font-semibold shadow-sm backdrop-blur-sm transition-all hover:border-green-300 focus:border-green-400 focus:ring-2 focus:ring-green-100 group-focus-within:shadow-lg"
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                      {field.value > 0 && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg border border-green-200 bg-green-50 px-2 py-1">
                          <span className="text-xs font-medium text-green-700">
                            ${field.value.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription className="rounded-lg border border-green-200/30 bg-gradient-to-r from-green-50/60 to-emerald-50/40 p-3 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">💰</span>
                      <span>
                        Set the maximum amount you want to spend in this category. Start
                        conservative and adjust as needed.
                      </span>
                    </div>
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
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm">
                      <CalendarIcon className="h-3 w-3 text-white" />
                    </div>
                    Budget Period
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-14 rounded-xl border-gray-200/60 bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:border-orange-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100">
                        <SelectValue placeholder="📅 Choose budget reset frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-0 bg-white/95 shadow-2xl backdrop-blur-lg">
                      <SelectItem
                        value="weekly"
                        className="cursor-pointer rounded-lg py-3 hover:bg-orange-50/80 focus:bg-orange-50/80"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">📅</span>
                          <div>
                            <div className="font-medium text-gray-800">Weekly</div>
                            <div className="text-xs text-gray-500">Resets every week</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="monthly"
                        className="cursor-pointer rounded-lg py-3 hover:bg-orange-50/80 focus:bg-orange-50/80"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">📅</span>
                          <div>
                            <div className="font-medium text-gray-800">Monthly</div>
                            <div className="text-xs text-gray-500">
                              Most common - resets monthly
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="yearly"
                        className="cursor-pointer rounded-lg py-3 hover:bg-orange-50/80 focus:bg-orange-50/80"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">📅</span>
                          <div>
                            <div className="font-medium text-gray-800">Yearly</div>
                            <div className="text-xs text-gray-500">Long-term planning</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="rounded-lg border border-orange-200/30 bg-gradient-to-r from-orange-50/60 to-amber-50/40 p-3 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600">🔄</span>
                      <span>
                        Choose how often this budget resets. Most people prefer monthly budgets for
                        better tracking.
                      </span>
                    </div>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Range */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-3">
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
                        <CalendarIcon className="h-3 w-3 text-white" />
                      </div>
                      Start Date
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'h-14 w-full justify-start rounded-xl border-gray-200/60 bg-white/90 text-left text-base font-normal shadow-sm backdrop-blur-sm transition-all hover:border-blue-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-3 h-4 w-4 text-blue-600" />
                            {field.value ? (
                              <span className="font-medium text-gray-900">
                                {format(field.value, 'PPP')}
                              </span>
                            ) : (
                              <span>Pick start date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-30" />
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
                          disabled={date => date < new Date('1900-01-01')}
                          initialFocus
                          className="rounded-xl border-0"
                          classNames={{
                            months: 'space-y-4',
                            month: 'space-y-4',
                            caption: 'flex justify-center pt-1 relative items-center',
                            caption_label: 'text-sm font-semibold text-gray-900',
                            nav: 'space-x-1 flex items-center',
                            nav_button: cn(
                              'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-lg hover:bg-blue-100 transition-colors'
                            ),
                            table: 'w-full border-collapse space-y-1',
                            head_row: 'flex',
                            head_cell: 'text-gray-500 rounded-md w-8 font-normal text-[0.8rem]',
                            row: 'flex w-full mt-2',
                            cell: 'text-center text-sm relative p-0 [&:has([aria-selected])]:bg-blue-100 [&:has([aria-selected])]:rounded-lg first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg focus-within:relative focus-within:z-20',
                            day: cn(
                              'h-8 w-8 p-0 font-normal text-gray-700 hover:bg-blue-50 hover:text-blue-900 rounded-lg transition-colors',
                              'aria-selected:bg-blue-600 aria-selected:text-white aria-selected:hover:bg-blue-700'
                            ),
                            day_selected:
                              'bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-600 focus:text-white',
                            day_today: 'bg-blue-100 text-blue-900 font-semibold',
                            day_outside: 'text-gray-300 opacity-50',
                            day_disabled: 'text-gray-300 opacity-25',
                            day_hidden: 'invisible',
                          }}
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
                  <FormItem className="flex flex-col space-y-3">
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600 shadow-sm">
                        <CalendarIcon className="h-3 w-3 text-white" />
                      </div>
                      End Date (Optional)
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'h-14 w-full justify-start rounded-xl border-gray-200/60 bg-white/90 text-left text-base font-normal shadow-sm backdrop-blur-sm transition-all hover:border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-3 h-4 w-4 text-red-600" />
                            {field.value ? (
                              <span className="font-medium text-gray-900">
                                {format(field.value, 'PPP')}
                              </span>
                            ) : (
                              <span>Ongoing budget (no end)</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-30" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="bg-white/98 w-auto rounded-2xl border border-red-200/30 p-4 shadow-2xl backdrop-blur-xl"
                        align="start"
                        sideOffset={8}
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={date => {
                            const startDate = form.getValues('startDate')
                            return date < new Date('1900-01-01') || (startDate && date <= startDate)
                          }}
                          initialFocus
                          className="rounded-xl border-0"
                          classNames={{
                            months: 'space-y-4',
                            month: 'space-y-4',
                            caption: 'flex justify-center pt-1 relative items-center',
                            caption_label: 'text-sm font-semibold text-gray-900',
                            nav: 'space-x-1 flex items-center',
                            nav_button: cn(
                              'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-lg hover:bg-red-100 transition-colors'
                            ),
                            table: 'w-full border-collapse space-y-1',
                            head_row: 'flex',
                            head_cell: 'text-gray-500 rounded-md w-8 font-normal text-[0.8rem]',
                            row: 'flex w-full mt-2',
                            cell: 'text-center text-sm relative p-0 [&:has([aria-selected])]:bg-red-100 [&:has([aria-selected])]:rounded-lg first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg focus-within:relative focus-within:z-20',
                            day: cn(
                              'h-8 w-8 p-0 font-normal text-gray-700 hover:bg-red-50 hover:text-red-900 rounded-lg transition-colors',
                              'aria-selected:bg-red-600 aria-selected:text-white aria-selected:hover:bg-red-700'
                            ),
                            day_selected:
                              'bg-red-600 text-white hover:bg-red-700 focus:bg-red-600 focus:text-white',
                            day_today: 'bg-red-100 text-red-900 font-semibold',
                            day_outside: 'text-gray-300 opacity-50',
                            day_disabled: 'text-gray-300 opacity-25',
                            day_hidden: 'invisible',
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription className="text-xs text-gray-600">
                      Leave empty for ongoing budget without end date
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Enhanced Budget Preview */}
          {selectedCategory && form.watch('amount') > 0 && (
            <div className="rounded-2xl border border-indigo-200/30 bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-pink-50/30 p-6 shadow-lg backdrop-blur-sm">
              <div className="mb-5 flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl shadow-lg ring-2 ring-white/50"
                  style={{ backgroundColor: selectedCategory.color }}
                >
                  <Target className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="flex items-center gap-2 font-semibold text-gray-900">
                    Budget Preview
                    <Badge variant="secondary" className="bg-indigo-100 text-xs text-indigo-800">
                      Live Preview
                    </Badge>
                  </h4>
                  <p className="text-xs text-gray-600">See how your budget will look</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Category
                  </p>
                  <p className="flex items-center gap-2 font-semibold text-gray-900">
                    {selectedCategory.name}
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: selectedCategory.color }}
                    />
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Budget Amount
                  </p>
                  <p className="text-lg font-bold text-green-700">
                    ${form.watch('amount').toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Period
                  </p>
                  <p className="flex items-center gap-1 font-semibold capitalize text-gray-900">
                    <CalendarIcon className="h-3 w-3" />
                    {form.watch('period')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Daily Average
                  </p>
                  <p className="font-bold text-blue-700">
                    $
                    {(
                      form.watch('amount') /
                      (form.watch('period') === 'weekly'
                        ? 7
                        : form.watch('period') === 'monthly'
                          ? 30
                          : 365)
                    ).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Quick Budget Health Indicator */}
              <div className="mt-4 border-t border-indigo-200/30 pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">
                    Budget looks good! This equals approximately
                    <span className="font-semibold text-gray-900">
                      $
                      {(
                        (form.watch('amount') /
                          (form.watch('period') === 'weekly'
                            ? 7
                            : form.watch('period') === 'monthly'
                              ? 30
                              : 365)) *
                        7
                      ).toFixed(2)}
                    </span>{' '}
                    per week
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Submit Buttons */}
          <div className="flex flex-col gap-4 border-t border-gray-200/50 pt-8 sm:flex-row">
            <Button
              type="submit"
              disabled={isLoading}
              className="h-14 flex-1 transform rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-base font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 hover:shadow-xl active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  <span>{isEditing ? 'Updating Budget...' : 'Creating Budget...'}</span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/20">
                      {isEditing ? '✏️' : '🎯'}
                    </div>
                    <span>{isEditing ? 'Update Budget' : 'Create Budget'}</span>
                  </div>
                </>
              )}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="h-14 rounded-xl border-gray-300/60 bg-white/90 px-8 font-medium backdrop-blur-sm transition-all duration-200 hover:bg-gray-50/90 hover:shadow-md active:scale-[0.98]"
              >
                <span>Cancel</span>
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
