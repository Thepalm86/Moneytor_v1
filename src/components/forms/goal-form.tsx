'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Loader2, Target } from 'lucide-react'
import { format } from 'date-fns'

import { cn } from '@/lib/utils'
import { goalSchema, type GoalInput } from '@/lib/validations/goal'
import { useCreateGoal, useUpdateGoal } from '@/hooks/use-goals'
import { useCategories } from '@/hooks/use-categories'
import { getIcon } from '@/lib/utils/icons'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

interface GoalFormProps {
  userId: string
  initialData?: Partial<GoalInput> & { id?: string }
  onSuccess?: () => void
  onCancel?: () => void
}

export function GoalForm({ 
  userId, 
  initialData, 
  onSuccess, 
  onCancel 
}: GoalFormProps) {
  const form = useForm<GoalInput>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      targetAmount: initialData?.targetAmount || 0,
      currentAmount: initialData?.currentAmount || 0,
      targetDate: initialData?.targetDate || undefined,
      categoryId: initialData?.categoryId || undefined,
      status: initialData?.status || 'active',
    },
  })

  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()
  const { data: categoriesData } = useCategories(userId)
  const categories = categoriesData?.data || []

  const isEditing = !!initialData?.id
  const isLoading = createGoal.isPending || updateGoal.isPending

  const onSubmit = async (data: GoalInput) => {
    if (isEditing && initialData?.id) {
      const result = await updateGoal.mutateAsync({
        id: initialData.id,
        userId,
        updates: data,
      })

      if (!result.error) {
        onSuccess?.()
      }
    } else {
      const result = await createGoal.mutateAsync({
        userId,
        goal: data,
      })

      if (!result.error) {
        form.reset()
        onSuccess?.()
      }
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <CardTitle>
            {isEditing ? 'Edit Goal' : 'Create New Saving Goal'}
          </CardTitle>
        </div>
        <p className="text-sm text-gray-600">
          Set savings targets to track your progress toward important financial goals.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Goal Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Emergency Fund, Vacation, New Car"
                    />
                  </FormControl>
                  <FormDescription>
                    Give your goal a clear, motivating name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description (Optional) */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add details about your goal..."
                      className="min-h-[80px]"
                    />
                  </FormControl>
                  <FormDescription>
                    Describe what you're saving for and why it's important
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Target Amount */}
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount</FormLabel>
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
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      How much do you want to save?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Current Amount */}
              <FormField
                control={form.control}
                name="currentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Amount</FormLabel>
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
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      How much have you already saved?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Target Date (Optional) */}
              <FormField
                control={form.control}
                name="targetDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Target Date (Optional)</FormLabel>
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
                              <span>Pick target date</span>
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
                            date < new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When do you want to reach your goal?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category (Optional) */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category (Optional)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)} value={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Category</SelectItem>
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
                    <FormDescription>
                      Associate with a spending/income category
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Goal Status */}
            {isEditing && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select goal status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Change your goal status
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Goal' : 'Create Goal'}
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