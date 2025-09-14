'use client'

import { useState } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Target,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Coins,
  Trophy,
  Sparkles,
  Users,
  Lightbulb,
  BarChart3,
} from 'lucide-react'
import { format, formatDistanceToNow, isAfter } from 'date-fns'

import { useGoalsWithProgress, useDeleteGoal, useContributeToGoal } from '@/hooks/use-goals'
import { useTransactions } from '@/hooks/use-transactions'
import { useUser } from '@/hooks/use-user'
import { getIcon } from '@/lib/utils/icons'
import { GoalForm } from '@/components/forms/goal-form'
import { GoalAchievements } from '@/components/goals/goal-achievements'
import { GoalVisualization } from '@/components/goals/goal-visualization'
import { SmartSavingsEngine } from '@/components/goals/smart-savings-engine'
import { GoalSocialFeatures } from '@/components/goals/goal-social-features'
import { PageHeader, PageHeaderAction } from '@/components/layout/page-header'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { GoalWithProgress } from '@/lib/validations/goal'

export default function GoalsPage() {
  const { user, isLoading: userLoading } = useUser()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [completionFilter, setCompletionFilter] = useState<string>('all')

  const { data: goalsData, isLoading } = useGoalsWithProgress(user?.id || '', {
    status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
    completed:
      completionFilter === 'completed' ? true : completionFilter === 'active' ? false : undefined,
  })
  const { data: transactionsData } = useTransactions(user?.id || '')
  const deleteGoal = useDeleteGoal()
  const contributeToGoal = useContributeToGoal()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [goalToDelete, setGoalToDelete] = useState<GoalWithProgress | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [goalToEdit, setGoalToEdit] = useState<GoalWithProgress | null>(null)
  const [contributeDialogOpen, setContributeDialogOpen] = useState(false)
  const [goalToContribute, setGoalToContribute] = useState<GoalWithProgress | null>(null)
  const [contributionAmount, setContributionAmount] = useState('')

  const goals = goalsData?.data || []
  const transactions = transactionsData?.data || []
  const activeGoals = goals.filter(goal => goal.status === 'active')
  const completedGoals = goals.filter(goal => goal.status === 'completed')
  const overdueGoals = goals.filter(
    goal =>
      goal.status === 'active' &&
      goal.target_date &&
      isAfter(new Date(), new Date(goal.target_date))
  )

  const handleShareGoal = (
    goal: GoalWithProgress,
    options: {
      privacy: string
      includeProgress: boolean
      includeAmount: boolean
      customMessage?: string
    }
  ) => {
    // Handle goal sharing logic
    console.log('Sharing goal:', goal, options)
  }

  const handleDeleteClick = (goal: GoalWithProgress) => {
    setGoalToDelete(goal)
    setDeleteDialogOpen(true)
  }

  const handleEditClick = (goal: GoalWithProgress) => {
    setGoalToEdit(goal)
    setEditDialogOpen(true)
  }

  const handleContributeClick = (goal: GoalWithProgress) => {
    setGoalToContribute(goal)
    setContributeDialogOpen(true)
    setContributionAmount('')
  }

  const confirmDelete = async () => {
    if (goalToDelete && user) {
      await deleteGoal.mutateAsync({
        id: goalToDelete.id,
        userId: user.id,
      })
      setDeleteDialogOpen(false)
      setGoalToDelete(null)
    }
  }

  const confirmContribution = async () => {
    if (goalToContribute && user && contributionAmount) {
      const amount = parseFloat(contributionAmount)
      if (amount > 0) {
        await contributeToGoal.mutateAsync({
          id: goalToContribute.id,
          userId: user.id,
          contribution: { amount },
        })
        setContributeDialogOpen(false)
        setGoalToContribute(null)
        setContributionAmount('')
      }
    }
  }

  const handleFormSuccess = () => {
    setCreateDialogOpen(false)
    setEditDialogOpen(false)
    setGoalToEdit(null)
  }

  if (userLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Please log in to view your goals</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Saving Goals 🎯"
        subtitle="Transform your financial dreams into achievable milestones with smart tracking and insights"
        actions={
          <PageHeaderAction onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Goal
          </PageHeaderAction>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <Target className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Goals</p>
                <p className="text-lg font-semibold">{goals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Goals</p>
                <p className="text-lg font-semibold">{activeGoals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                <Coins className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-lg font-semibold text-purple-600">{completedGoals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-lg font-semibold text-red-600">{overdueGoals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Progress:</span>
          <Select value={completionFilter} onValueChange={setCompletionFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Enhanced Tabs with Gamification */}
      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-white/50 backdrop-blur-sm">
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            My Goals
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="smart-savings" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Smart Savings
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Social
          </TabsTrigger>
        </TabsList>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <div className="space-y-4">
            {goals.length === 0 ? (
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-purple-100">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm" />
                <CardContent className="relative p-8 text-center">
                  <div className="mb-6">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                      <Target className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-gray-900">
                      Start Your Savings Journey! 🚀
                    </h3>
                    <p className="mx-auto mb-6 max-w-md text-gray-600">
                      Every great achievement starts with a single step. Create your first goal and
                      watch your dreams become reality!
                    </p>
                  </div>
                  <Button
                    onClick={() => setCreateDialogOpen(true)}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-blue-600 shadow-lg transition-all duration-200 hover:from-green-600 hover:to-blue-700 hover:shadow-xl"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Create Your First Goal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              goals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onContribute={handleContributeClick}
                />
              ))
            )}
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements">
          <GoalAchievements goals={goals} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          {goals.length > 0 ? (
            <div className="space-y-6">
              {goals.map(goal => (
                <GoalVisualization key={goal.id} goal={goal} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">No Analytics Yet</h3>
                <p className="text-gray-600">
                  Create some goals to see detailed analytics and projections.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Smart Savings Tab */}
        <TabsContent value="smart-savings">
          <SmartSavingsEngine transactions={transactions} goals={goals} />
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social">
          {goals.length > 0 ? (
            <div className="space-y-6">
              {goals.map(goal => (
                <GoalSocialFeatures key={goal.id} goal={goal} onShare={handleShareGoal} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">No Social Features Yet</h3>
                <p className="text-gray-600">
                  Create some goals to share your progress and connect with others.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Enhanced Features Card */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm" />
        <CardContent className="relative p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Supercharge Your Savings 💫</h3>
              <p className="text-sm text-gray-600">
                Powerful features to help you reach your financial goals faster
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-emerald-200/50 bg-white/50 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h4 className="text-sm font-semibold text-gray-900">🎖️ Achievements</h4>
              </div>
              <ul className="space-y-1 text-xs text-gray-700">
                <li>• Unlock progress badges</li>
                <li>• Track milestone celebrations</li>
                <li>• Earning achievement points</li>
                <li>• Compete with friends</li>
              </ul>
            </div>
            <div className="rounded-xl border border-blue-200/50 bg-white/50 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-500" />
                <h4 className="text-sm font-semibold text-gray-900">🧠 Smart AI</h4>
              </div>
              <ul className="space-y-1 text-xs text-gray-700">
                <li>• Personalized recommendations</li>
                <li>• Spending pattern analysis</li>
                <li>• Auto-savings suggestions</li>
                <li>• Goal completion predictions</li>
              </ul>
            </div>
            <div className="rounded-xl border border-purple-200/50 bg-white/50 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                <h4 className="text-sm font-semibold text-gray-900">👥 Social</h4>
              </div>
              <ul className="space-y-1 text-xs text-gray-700">
                <li>• Share goals with friends</li>
                <li>• Accountability partners</li>
                <li>• Community challenges</li>
                <li>• Motivational support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Goal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{goalToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteGoal.isPending}>
              {deleteGoal.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contribute to Goal Dialog */}
      <Dialog open={contributeDialogOpen} onOpenChange={setContributeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
            <DialogDescription>Add money to "{goalToContribute?.name}" goal.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Amount</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-8"
                    value={contributionAmount}
                    onChange={e => setContributionAmount(e.target.value)}
                  />
                </div>
              </div>
              {goalToContribute && (
                <div className="text-sm text-gray-600">
                  Current progress: ${goalToContribute.current_amount.toFixed(2)} of $
                  {goalToContribute.target_amount.toFixed(2)}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContributeDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmContribution}
              disabled={
                contributeToGoal.isPending ||
                !contributionAmount ||
                parseFloat(contributionAmount) <= 0
              }
              className="bg-green-600 hover:bg-green-700"
            >
              {contributeToGoal.isPending ? 'Adding...' : 'Add Contribution'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Goal Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Create New Goal 🎯
            </DialogTitle>
            <DialogDescription>
              Set a savings goal and track your progress towards achieving it.
            </DialogDescription>
          </DialogHeader>
          {user && (
            <GoalForm
              userId={user.id}
              onSuccess={handleFormSuccess}
              onCancel={() => setCreateDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Edit Saving Goal
            </DialogTitle>
            <DialogDescription>
              Update your goal details and adjust your target amount or timeline.
            </DialogDescription>
          </DialogHeader>
          {user && goalToEdit && (
            <GoalForm
              userId={user.id}
              initialData={
                goalToEdit
                  ? {
                      id: goalToEdit.id,
                      name: goalToEdit.name,
                      description: goalToEdit.description || undefined,
                      categoryId: goalToEdit.category_id || undefined,
                      targetAmount: goalToEdit.target_amount,
                      currentAmount: goalToEdit.current_amount,
                      targetDate: goalToEdit.target_date
                        ? new Date(goalToEdit.target_date)
                        : undefined,
                      status: goalToEdit.status,
                    }
                  : undefined
              }
              onSuccess={handleFormSuccess}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface GoalCardProps {
  goal: GoalWithProgress
  onEdit?: (goal: GoalWithProgress) => void
  onDelete?: (goal: GoalWithProgress) => void
  onContribute?: (goal: GoalWithProgress) => void
}

function GoalCard({ goal, onEdit, onDelete, onContribute }: GoalCardProps) {
  const IconComponent = getIcon(goal.category?.icon || 'Target')
  const progressValue = Math.min(goal.progress_percentage, 100)
  const isCompleted = goal.is_completed
  const isOverdue =
    goal.target_date && isAfter(new Date(), new Date(goal.target_date)) && !isCompleted
  const isNearTarget = goal.progress_percentage >= 80 && !isCompleted

  const statusColor = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-gray-100 text-gray-800',
  }

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        isCompleted && 'border-green-200 bg-green-50',
        isOverdue && 'border-red-200 bg-red-50',
        isNearTarget && 'border-blue-200 bg-blue-50'
      )}
    >
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: goal.category?.color || '#16a34a' }}
            >
              <IconComponent className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{goal.name}</h3>
              {goal.description && <p className="text-sm text-gray-500">{goal.description}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={statusColor[goal.status]}>
              {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="bg-red-100 text-red-800">
                Overdue
              </Badge>
            )}
            {isCompleted && <Badge className="bg-purple-100 text-purple-800">🎉 Complete</Badge>}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isCompleted && onContribute && (
                  <DropdownMenuItem onClick={() => onContribute(goal)}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Add Contribution
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(goal)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Goal
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={() => onDelete(goal)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Goal
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-3">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                ${goal.current_amount.toFixed(2)} of ${goal.target_amount.toFixed(2)}
              </span>
              <span
                className={cn(
                  'font-medium',
                  isCompleted ? 'text-green-600' : isNearTarget ? 'text-blue-600' : 'text-gray-900'
                )}
              >
                {progressValue.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={progressValue}
              className={cn(
                'h-2',
                isCompleted && '[&>div]:bg-green-500',
                isNearTarget && '[&>div]:bg-blue-500'
              )}
            />
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Remaining</p>
              <p className={cn('font-medium', isCompleted ? 'text-green-600' : 'text-gray-900')}>
                ${goal.remaining_amount.toFixed(2)}
                {isCompleted ? ' saved!' : ' to go'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">{goal.target_date ? 'Days Left' : 'Category'}</p>
              <p className="font-medium">
                {goal.target_date
                  ? isOverdue
                    ? 'Overdue'
                    : goal.days_remaining !== undefined
                      ? `${goal.days_remaining} days`
                      : 'No deadline'
                  : goal.category?.name || 'None'}
              </p>
            </div>
          </div>

          {/* Timeline Info */}
          <div className="border-t border-gray-200 pt-2 text-xs text-gray-500">
            Created {format(new Date(goal.created_at), 'PP')}
            {goal.target_date && (
              <span>
                {' • Target: '}
                {format(new Date(goal.target_date), 'PP')}
                {!isCompleted && !isOverdue && (
                  <span> ({formatDistanceToNow(new Date(goal.target_date))} left)</span>
                )}
              </span>
            )}
            {goal.daily_target && <span> • Daily target: ${goal.daily_target.toFixed(2)}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
