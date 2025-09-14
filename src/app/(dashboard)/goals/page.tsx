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
} from 'lucide-react'
import { format, formatDistanceToNow, isAfter } from 'date-fns'

import { useGoalsWithProgress, useDeleteGoal, useContributeToGoal } from '@/hooks/use-goals'
import { useUser } from '@/hooks/use-user'
import { getIcon } from '@/lib/utils/icons'
import { GoalForm } from '@/components/forms/goal-form'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  const activeGoals = goals.filter(goal => goal.status === 'active')
  const completedGoals = goals.filter(goal => goal.status === 'completed')
  const overdueGoals = goals.filter(
    goal =>
      goal.status === 'active' &&
      goal.target_date &&
      isAfter(new Date(), new Date(goal.target_date))
  )

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Saving Goals</h1>
          <p className="text-gray-600">Track your progress toward important financial milestones</p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Goal
        </Button>
      </div>

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

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">No goals found</h3>
              <p className="mb-4 text-gray-600">
                Create your first saving goal to start tracking your financial milestones.
              </p>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Goal
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

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🎯 Saving Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm leading-relaxed text-gray-600">
            Set specific savings targets to stay motivated and track your progress. Whether it's an
            emergency fund, vacation, or major purchase, goals help you stay focused and achieve
            your financial dreams.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <h4 className="mb-1 text-sm font-semibold text-green-900">✅ Available Now</h4>
              <ul className="space-y-1 text-xs text-green-800">
                <li>• Set target amounts and dates</li>
                <li>• Track progress with visual indicators</li>
                <li>• Add manual contributions</li>
                <li>• Goal status management</li>
              </ul>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <h4 className="mb-1 text-sm font-semibold text-blue-900">🚧 Coming Soon</h4>
              <ul className="space-y-1 text-xs text-blue-800">
                <li>• Automatic savings from transactions</li>
                <li>• Goal sharing and collaboration</li>
                <li>• Smart savings recommendations</li>
                <li>• Milestone celebrations</li>
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
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
