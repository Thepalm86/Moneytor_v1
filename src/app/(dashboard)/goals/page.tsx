'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Target, TrendingUp, DollarSign, AlertTriangle, Coins } from 'lucide-react'
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
    status: statusFilter !== 'all' ? statusFilter as any : undefined,
    completed: completionFilter === 'completed' ? true : completionFilter === 'active' ? false : undefined,
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
  const overdueGoals = goals.filter(goal => 
    goal.status === 'active' && 
    goal.target_date && 
    isAfter(new Date(), new Date(goal.target_date))
  )

  const handleDeleteClick = (goal: GoalWithProgress) => {
    setGoalToDelete(goal)
    setDeleteDialogOpen(true)
  }

  const handleEditClick = (goal: GoalWithProgress) => {
    const editData = {
      id: goal.id,
      name: goal.name,
      description: goal.description || undefined,
      categoryId: goal.category_id || undefined,
      targetAmount: goal.target_amount,
      currentAmount: goal.current_amount,
      targetDate: goal.target_date ? new Date(goal.target_date) : undefined,
      status: goal.status,
    }
    setGoalToEdit(editData)
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Please log in to view your goals</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Saving Goals</h1>
          <p className="text-gray-600">Track your progress toward important financial milestones</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Target className="w-4 h-4 text-green-600" />
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
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
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
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Coins className="w-4 h-4 text-purple-600" />
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
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
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
      <div className="flex flex-col sm:flex-row gap-4">
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
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No goals found</h3>
              <p className="text-gray-600 mb-4">
                Create your first saving goal to start tracking your financial milestones.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          goals.map((goal) => (
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
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Set specific savings targets to stay motivated and track your progress. 
            Whether it's an emergency fund, vacation, or major purchase, goals help you stay focused and achieve your financial dreams.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-1 text-sm">✅ Available Now</h4>
              <ul className="text-xs text-green-800 space-y-1">
                <li>• Set target amounts and dates</li>
                <li>• Track progress with visual indicators</li>
                <li>• Add manual contributions</li>
                <li>• Goal status management</li>
              </ul>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-1 text-sm">🚧 Coming Soon</h4>
              <ul className="text-xs text-blue-800 space-y-1">
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
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteGoal.isPending}
            >
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
            <DialogDescription>
              Add money to "{goalToContribute?.name}" goal.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Amount</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-8"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                  />
                </div>
              </div>
              {goalToContribute && (
                <div className="text-sm text-gray-600">
                  Current progress: ${goalToContribute.current_amount.toFixed(2)} of ${goalToContribute.target_amount.toFixed(2)}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setContributeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmContribution}
              disabled={contributeToGoal.isPending || !contributionAmount || parseFloat(contributionAmount) <= 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {contributeToGoal.isPending ? 'Adding...' : 'Add Contribution'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Goal Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {user && goalToEdit && (
            <GoalForm
              userId={user.id}
              initialData={goalToEdit}
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
  const isOverdue = goal.target_date && isAfter(new Date(), new Date(goal.target_date)) && !isCompleted
  const isNearTarget = goal.progress_percentage >= 80 && !isCompleted

  const statusColor = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-gray-100 text-gray-800',
  }

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      isCompleted && "border-green-200 bg-green-50",
      isOverdue && "border-red-200 bg-red-50",
      isNearTarget && "border-blue-200 bg-blue-50"
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: goal.category?.color || '#16a34a' }}
            >
              <IconComponent className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{goal.name}</h3>
              {goal.description && (
                <p className="text-sm text-gray-500">{goal.description}</p>
              )}
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
            {isCompleted && (
              <Badge className="bg-purple-100 text-purple-800">
                🎉 Complete
              </Badge>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isCompleted && onContribute && (
                  <DropdownMenuItem onClick={() => onContribute(goal)}>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Add Contribution
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(goal)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Goal
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(goal)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
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
              <span className={cn(
                "font-medium",
                isCompleted ? "text-green-600" : 
                isNearTarget ? "text-blue-600" : "text-gray-900"
              )}>
                {progressValue.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={progressValue}
              className={cn(
                "h-2",
                isCompleted && "[&>div]:bg-green-500",
                isNearTarget && "[&>div]:bg-blue-500"
              )}
            />
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Remaining</p>
              <p className={cn(
                "font-medium",
                isCompleted ? "text-green-600" : "text-gray-900"
              )}>
                ${goal.remaining_amount.toFixed(2)}
                {isCompleted ? " saved!" : " to go"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">
                {goal.target_date ? "Days Left" : "Category"}
              </p>
              <p className="font-medium">
                {goal.target_date ? (
                  isOverdue ? "Overdue" : 
                  goal.days_remaining !== undefined ? 
                    `${goal.days_remaining} days` : 
                    "No deadline"
                ) : (
                  goal.category?.name || "None"
                )}
              </p>
            </div>
          </div>

          {/* Timeline Info */}
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
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
            {goal.daily_target && (
              <span> • Daily target: ${goal.daily_target.toFixed(2)}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}