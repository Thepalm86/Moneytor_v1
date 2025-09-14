'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Loader2, Target, Sparkles, Trophy, Zap, Heart } from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'

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

  // Calculate motivation metrics
  const targetAmount = form.watch('targetAmount')
  const currentAmount = form.watch('currentAmount')
  const targetDate = form.watch('targetDate')
  const progressPercentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0
  const remainingAmount = Math.max(0, targetAmount - currentAmount)
  const daysUntilTarget = targetDate ? Math.max(0, Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : null
  const dailyTarget = daysUntilTarget && daysUntilTarget > 0 ? remainingAmount / daysUntilTarget : 0

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
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="w-full max-w-2xl mx-auto border-0 bg-white/80 backdrop-blur-xl shadow-2xl">
        {/* Glassmorphic Header */}
        <CardHeader className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <motion.div 
                className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Target className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-2xl">
                  {isEditing ? 'Edit Your Goal' : 'Create Your Dream Goal'}
                  <span className="ml-2">{isEditing ? '✨' : '🎯'}</span>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {isEditing 
                    ? 'Update your goal details and keep pushing forward!'
                    : 'Turn your financial dreams into achievable milestones'
                  }
                </p>
              </div>
            </div>
            
            {/* Motivation Cards */}
            {targetAmount > 0 && (
              <motion.div 
                className="grid grid-cols-3 gap-3 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="text-center p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20">
                  <div className="text-lg font-bold text-green-600">{progressPercentage.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">Complete</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20">
                  <div className="text-lg font-bold text-blue-600">${remainingAmount.toFixed(0)}</div>
                  <div className="text-xs text-gray-600">To Go</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20">
                  <div className="text-lg font-bold text-purple-600">
                    {daysUntilTarget ? `${daysUntilTarget}d` : '∞'}
                  </div>
                  <div className="text-xs text-gray-600">Remaining</div>
                </div>
              </motion.div>
            )}
          </div>
        </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Goal Name with Gamification */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      Goal Name
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="e.g., Emergency Fund, Dream Vacation, New Car"
                          className="pl-4 pr-10 bg-white/70 backdrop-blur-sm border-white/30 focus:border-blue-400 focus:ring-blue-400/20"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {field.value && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-green-500"
                            >
                              ✨
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-pink-400" />
                      Give your goal a name that sparks joy and motivation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Enhanced Description */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      Your Why (Optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Why is this goal important to you? Paint the picture of success..."
                        className="min-h-[90px] bg-white/70 backdrop-blur-sm border-white/30 focus:border-purple-400 focus:ring-purple-400/20 resize-none"
                      />
                    </FormControl>
                    <FormDescription className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-orange-400" />
                      Describe your dream and what achieving it will mean to you
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

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

            {/* Motivational Daily Target Card */}
            {dailyTarget > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-blue-50 border border-green-200/50 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Your Daily Mission</h4>
                    <p className="text-sm text-gray-600">
                      Save <span className="font-bold text-green-600">${dailyTarget.toFixed(2)}</span> daily to reach your goal!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Gamified Submit Buttons */}
            <motion.div 
              className="flex gap-3 pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <motion.div 
                className="flex-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {!isLoading && (
                    <motion.div
                      className="mr-2"
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <span>🚀</span>
                    </motion.div>
                  )}
                  {isEditing ? 'Update Your Goal' : 'Launch Your Goal'}
                </Button>
              </motion.div>
              
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="px-6 h-12 bg-white/70 backdrop-blur-sm border-white/30 hover:bg-white/80"
                >
                  Cancel
                </Button>
              )}
            </motion.div>
          </form>
        </Form>
      </CardContent>
    </Card>
    </motion.div>
  )
}