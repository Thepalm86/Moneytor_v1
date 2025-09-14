'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Loader2, Target, Sparkles, Trophy, Heart, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { goalSchema, type GoalInput } from '@/lib/validations/goal'
import { useCreateGoal, useUpdateGoal } from '@/hooks/use-goals'
import { useCategories } from '@/hooks/use-categories'
import { getIcon } from '@/lib/utils/icons'
import { useGamification } from '@/contexts/gamification-context'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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

interface GoalFormProps {
  userId: string
  initialData?: Partial<GoalInput> & { id?: string }
  onSuccess?: () => void
  onCancel?: () => void
}

export function GoalForm({ userId, initialData, onSuccess, onCancel }: GoalFormProps) {
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
  const { triggerEvent, showCelebration } = useGamification()

  const isEditing = !!initialData?.id
  const isLoading = createGoal.isPending || updateGoal.isPending

  // Calculate motivation metrics
  const targetAmount = form.watch('targetAmount')
  const currentAmount = form.watch('currentAmount')
  const targetDate = form.watch('targetDate')
  const progressPercentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0
  const remainingAmount = Math.max(0, targetAmount - currentAmount)
  const daysUntilTarget = targetDate
    ? Math.max(0, Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null
  const dailyTarget = daysUntilTarget && daysUntilTarget > 0 ? remainingAmount / daysUntilTarget : 0

  const onSubmit = async (data: GoalInput) => {
    if (isEditing && initialData?.id) {
      const result = await updateGoal.mutateAsync({
        id: initialData.id,
        userId,
        updates: data,
      })

      if (!result.error) {
        // Check if goal was completed
        if (data.status === 'completed' && initialData?.status !== 'completed') {
          // Trigger goal completion event
          await triggerEvent('goal_completed', {
            goalId: initialData.id,
            targetAmount: data.targetAmount,
            currentAmount: data.currentAmount,
            action: 'completed'
          })

          // Show major celebration for goal completion
          showCelebration({
            type: 'major',
            title: 'Goal Completed! 🎉🏆',
            message: `Congratulations! You've achieved your "${data.name}" goal!`,
            color: '#ffd700',
            duration: 6000,
            showConfetti: true
          })
        } else if (data.currentAmount > (initialData?.currentAmount || 0)) {
          // Trigger goal contribution event for amount increases
          await triggerEvent('goal_contribution', {
            goalId: initialData.id,
            previousAmount: initialData?.currentAmount || 0,
            newAmount: data.currentAmount,
            contributionAmount: data.currentAmount - (initialData?.currentAmount || 0),
            action: 'contribution'
          })

          // Show subtle celebration for contribution
          showCelebration({
            type: 'subtle',
            title: 'Goal Progress Updated! 💪',
            message: `Added $${(data.currentAmount - (initialData?.currentAmount || 0)).toFixed(2)} to your goal!`,
            color: '#10b981',
            duration: 3000
          })
        } else {
          // Regular goal update
          await triggerEvent('goal_updated', {
            goalId: initialData.id,
            targetAmount: data.targetAmount,
            currentAmount: data.currentAmount,
            action: 'update'
          })

          showCelebration({
            type: 'subtle',
            title: 'Goal Updated! ✨',
            message: 'Your goal has been successfully updated.',
            color: '#3b82f6',
            duration: 2500
          })
        }

        onSuccess?.()
      }
    } else {
      const result = await createGoal.mutateAsync({
        userId,
        goal: data,
      })

      if (!result.error) {
        // Trigger gamification event for new goal creation
        await triggerEvent('goal_created', {
          targetAmount: data.targetAmount,
          currentAmount: data.currentAmount,
          categoryId: data.categoryId,
          hasTargetDate: !!data.targetDate,
          action: 'create'
        })

        // Show celebration for new goal creation
        showCelebration({
          type: 'medium',
          title: 'Goal Created! 🚀✨',
          message: `Your "${data.name}" goal is ready to launch! Time to start saving!`,
          color: '#8b5cf6',
          duration: 4000,
          showConfetti: false
        })

        form.reset()
        onSuccess?.()
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Smart Goal Assistant Banner */}
      <div className="rounded-2xl border border-teal-200/30 bg-gradient-to-r from-teal-50/80 via-cyan-50/60 to-blue-50/40 p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg ring-2 ring-teal-100/50"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Target className="h-5 w-5 text-white" />
          </motion.div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-teal-900">Goal Achievement Assistant</h3>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                <Badge
                  variant="secondary"
                  className="bg-teal-100/60 px-2 py-0.5 text-xs text-teal-800"
                >
                  AI Powered
                </Badge>
              </motion.div>
            </div>
            <p className="text-sm leading-relaxed text-teal-700">
              🎯 <strong>Dream Big:</strong> Set ambitious but achievable goals. Our smart system
              will help you break them down into manageable daily targets and celebrate every
              milestone along the way!
            </p>
          </div>
        </div>

        {/* Live Progress Indicators */}
        {targetAmount > 0 && (
          <motion.div
            className="mt-4 grid grid-cols-3 gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="rounded-xl border border-teal-200/30 bg-white/60 p-3 text-center shadow-sm backdrop-blur-sm">
              <motion.div
                className="text-lg font-bold text-green-600"
                key={progressPercentage}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {progressPercentage.toFixed(1)}%
              </motion.div>
              <div className="text-xs font-medium text-gray-600">Progress</div>
            </div>
            <div className="rounded-xl border border-teal-200/30 bg-white/60 p-3 text-center shadow-sm backdrop-blur-sm">
              <motion.div
                className="text-lg font-bold text-blue-600"
                key={remainingAmount}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                ${remainingAmount.toFixed(0)}
              </motion.div>
              <div className="text-xs font-medium text-gray-600">Remaining</div>
            </div>
            <div className="rounded-xl border border-teal-200/30 bg-white/60 p-3 text-center shadow-sm backdrop-blur-sm">
              <motion.div
                className="text-lg font-bold text-purple-600"
                key={daysUntilTarget}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {daysUntilTarget ? `${daysUntilTarget}d` : '∞'}
              </motion.div>
              <div className="text-xs font-medium text-gray-600">Days Left</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Enhanced Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Goal Name Section */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 shadow-sm">
                        <Sparkles className="h-3 w-3 text-white" />
                      </div>
                      Goal Name
                    </FormLabel>
                    <FormControl>
                      <div className="group relative">
                        <Input
                          {...field}
                          placeholder="e.g., Emergency Fund, Dream Vacation, New Car"
                          className="h-14 rounded-xl border-gray-200/60 bg-white/90 pl-4 pr-12 text-base font-medium shadow-sm backdrop-blur-sm transition-all hover:border-yellow-300 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 group-focus-within:shadow-lg"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          {field.value && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className="text-lg"
                            >
                              ✨
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription className="rounded-lg border border-pink-200/30 bg-gradient-to-r from-pink-50/60 to-rose-50/40 p-3 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="text-pink-600">💖</span>
                        <span>
                          Give your goal a name that sparks joy and motivation - make it personal
                          and inspiring!
                        </span>
                      </div>
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
                  <FormItem className="space-y-3">
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 shadow-sm">
                        <Trophy className="h-3 w-3 text-white" />
                      </div>
                      Your Why (Optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Why is this goal important to you? Paint the picture of success..."
                        className="min-h-[100px] resize-none rounded-xl border-gray-200/60 bg-white/90 text-base shadow-sm backdrop-blur-sm transition-all hover:border-purple-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                      />
                    </FormControl>
                    <FormDescription className="rounded-lg border border-orange-200/30 bg-gradient-to-r from-orange-50/60 to-amber-50/40 p-3 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-600">⚡</span>
                        <span>
                          Describe your dream and what achieving it will mean to you - motivation is
                          everything!
                        </span>
                      </div>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          </div>

          {/* Amount Fields */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Target Amount */}
            <FormField
              control={form.control}
              name="targetAmount"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-sm">
                      <Target className="h-3 w-3 text-white" />
                    </div>
                    Target Amount
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
                        className="h-14 rounded-xl border-gray-200/60 bg-white/90 pl-12 pr-4 text-xl font-semibold shadow-sm backdrop-blur-sm transition-all hover:border-green-300 focus:border-green-400 focus:ring-2 focus:ring-green-100 group-focus-within:shadow-lg"
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="rounded-lg border border-green-200/30 bg-gradient-to-r from-green-50/60 to-emerald-50/40 p-3 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">🎯</span>
                      <span>How much do you want to save? Dream big but be realistic!</span>
                    </div>
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
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-sm">
                      <DollarSign className="h-3 w-3 text-white" />
                    </div>
                    Current Amount
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
                        className="h-14 rounded-xl border-gray-200/60 bg-white/90 pl-12 pr-4 text-xl font-semibold shadow-sm backdrop-blur-sm transition-all hover:border-blue-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 group-focus-within:shadow-lg"
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="rounded-lg border border-blue-200/30 bg-gradient-to-r from-blue-50/60 to-cyan-50/40 p-3 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">💰</span>
                      <span>How much have you already saved? Every dollar counts!</span>
                    </div>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Date and Category Fields */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Target Date (Optional) */}
            <FormField
              control={form.control}
              name="targetDate"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-3">
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
                      <CalendarIcon className="h-3 w-3 text-white" />
                    </div>
                    Target Date (Optional)
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'h-14 w-full justify-start rounded-xl border-gray-200/60 bg-white/90 text-left text-base font-normal shadow-sm backdrop-blur-sm transition-all hover:border-indigo-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-3 h-4 w-4 text-indigo-600" />
                          {field.value ? (
                            <span className="font-medium text-gray-900">
                              {format(field.value, 'PPP')}
                            </span>
                          ) : (
                            <span>Pick target date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-30" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="bg-white/98 w-auto rounded-2xl border border-indigo-200/30 p-4 shadow-2xl backdrop-blur-xl"
                      align="start"
                      sideOffset={8}
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={date => date < new Date()}
                        initialFocus
                        className="rounded-xl border-0"
                        classNames={{
                          months: 'space-y-4',
                          month: 'space-y-4',
                          caption: 'flex justify-center pt-1 relative items-center',
                          caption_label: 'text-sm font-semibold text-gray-900',
                          nav: 'space-x-1 flex items-center',
                          nav_button: cn(
                            'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-lg hover:bg-indigo-100 transition-colors'
                          ),
                          table: 'w-full border-collapse space-y-1',
                          head_row: 'flex',
                          head_cell: 'text-gray-500 rounded-md w-8 font-normal text-[0.8rem]',
                          row: 'flex w-full mt-2',
                          cell: 'text-center text-sm relative p-0 [&:has([aria-selected])]:bg-indigo-100 [&:has([aria-selected])]:rounded-lg first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg focus-within:relative focus-within:z-20',
                          day: cn(
                            'h-8 w-8 p-0 font-normal text-gray-700 hover:bg-indigo-50 hover:text-indigo-900 rounded-lg transition-colors',
                            'aria-selected:bg-indigo-600 aria-selected:text-white aria-selected:hover:bg-indigo-700'
                          ),
                          day_selected:
                            'bg-indigo-600 text-white hover:bg-indigo-700 focus:bg-indigo-600 focus:text-white',
                          day_today: 'bg-indigo-100 text-indigo-900 font-semibold',
                          day_outside: 'text-gray-300 opacity-50',
                          day_disabled: 'text-gray-300 opacity-25',
                          day_hidden: 'invisible',
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription className="rounded-lg border border-indigo-200/30 bg-gradient-to-r from-indigo-50/60 to-purple-50/40 p-3 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-600">🗓️</span>
                      <span>When do you want to reach your goal? Setting a deadline helps!</span>
                    </div>
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
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 shadow-sm">
                      <Heart className="h-3 w-3 text-white" />
                    </div>
                    Category (Optional)
                  </FormLabel>
                  <Select
                    onValueChange={value => field.onChange(value === 'none' ? undefined : value)}
                    value={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl border-gray-200/60 bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100">
                        <SelectValue placeholder="🏷️ Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-0 bg-white/95 shadow-2xl backdrop-blur-lg">
                      <SelectItem
                        value="none"
                        className="cursor-pointer rounded-lg py-3 hover:bg-rose-50/80 focus:bg-rose-50/80"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
                            <span className="text-xs">∅</span>
                          </div>
                          <span className="font-medium">No Category</span>
                        </div>
                      </SelectItem>
                      {categories.map(category => {
                        const IconComponent = getIcon(category.icon)
                        return (
                          <SelectItem
                            key={category.id}
                            value={category.id}
                            className="cursor-pointer rounded-lg py-3 hover:bg-rose-50/80 focus:bg-rose-50/80"
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
                  <FormDescription className="rounded-lg border border-rose-200/30 bg-gradient-to-r from-rose-50/60 to-pink-50/40 p-3 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-rose-600">🏷️</span>
                      <span>Associate with a spending/income category for better tracking.</span>
                    </div>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Goal Status (Edit Mode Only) */}
          {isEditing && (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br from-gray-500 to-slate-600 shadow-sm">
                      <Target className="h-3 w-3 text-white" />
                    </div>
                    Goal Status
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl border-gray-200/60 bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-100">
                        <SelectValue placeholder="🔄 Select goal status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-0 bg-white/95 shadow-2xl backdrop-blur-lg">
                      <SelectItem
                        value="active"
                        className="cursor-pointer rounded-lg py-3 hover:bg-green-50/80 focus:bg-green-50/80"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🟢</span>
                          <div>
                            <div className="font-medium text-gray-800">Active</div>
                            <div className="text-xs text-gray-500">
                              Currently working on this goal
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="paused"
                        className="cursor-pointer rounded-lg py-3 hover:bg-yellow-50/80 focus:bg-yellow-50/80"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">⏸️</span>
                          <div>
                            <div className="font-medium text-gray-800">Paused</div>
                            <div className="text-xs text-gray-500">Temporarily on hold</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="completed"
                        className="cursor-pointer rounded-lg py-3 hover:bg-emerald-50/80 focus:bg-emerald-50/80"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🎉</span>
                          <div>
                            <div className="font-medium text-gray-800">Completed</div>
                            <div className="text-xs text-gray-500">Successfully achieved!</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="cancelled"
                        className="cursor-pointer rounded-lg py-3 hover:bg-red-50/80 focus:bg-red-50/80"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">❌</span>
                          <div>
                            <div className="font-medium text-gray-800">Cancelled</div>
                            <div className="text-xs text-gray-500">
                              No longer pursuing this goal
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="rounded-lg border border-gray-200/30 bg-gradient-to-r from-gray-50/60 to-slate-50/40 p-3 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">🔄</span>
                      <span>Update your goal's current status to keep track of your progress.</span>
                    </div>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Enhanced Daily Target Card */}
          {dailyTarget > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-2xl border border-emerald-200/30 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-cyan-50/30 p-6 shadow-lg backdrop-blur-sm"
            >
              <div className="flex items-start gap-4">
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg ring-2 ring-emerald-100/50"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  animate={{
                    y: [0, -2, 0],
                    rotate: [0, 1, -1, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Target className="h-6 w-6 text-white" />
                </motion.div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h4 className="font-bold text-gray-900">Daily Mission 🎯</h4>
                    <Badge variant="secondary" className="bg-emerald-100 text-xs text-emerald-800">
                      Smart Target
                    </Badge>
                  </div>
                  <p className="mb-3 text-sm text-gray-700">
                    Save{' '}
                    <span className="text-2xl font-bold text-emerald-600">
                      ${dailyTarget.toFixed(2)}
                    </span>{' '}
                    each day to reach your goal on time!
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span>{daysUntilTarget} days remaining</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                      <span>${(dailyTarget * 7).toFixed(2)} per week</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Enhanced Submit Buttons */}
          <motion.div
            className="flex flex-col gap-4 border-t border-gray-200/50 pt-8 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-14 w-full transform rounded-xl bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-700 font-semibold text-white shadow-lg transition-all duration-300 hover:from-emerald-700 hover:via-teal-800 hover:to-cyan-800 hover:shadow-xl active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    <span>{isEditing ? 'Updating Goal...' : 'Creating Goal...'}</span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="text-lg"
                        animate={{
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                        }}
                      >
                        {isEditing ? '✨' : '🚀'}
                      </motion.div>
                      <span>{isEditing ? 'Update Your Goal' : 'Launch Your Goal'}</span>
                    </div>
                  </>
                )}
              </Button>
            </motion.div>

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
          </motion.div>
        </form>
      </Form>
    </motion.div>
  )
}
