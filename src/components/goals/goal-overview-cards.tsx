'use client'

import { Target, TrendingUp, CheckCircle, AlertTriangle, Clock, Coins } from 'lucide-react'
import { format, isAfter } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useGoalsWithProgress } from '@/hooks/use-goals'
import { getIcon } from '@/lib/utils/icons'
import { cn } from '@/lib/utils'
import type { GoalWithProgress } from '@/lib/validations/goal'

interface GoalOverviewCardsProps {
  userId: string
  showHeader?: boolean
  onManageGoals?: () => void
}

export function GoalOverviewCards({ 
  userId, 
  showHeader = true, 
  onManageGoals 
}: GoalOverviewCardsProps) {
  const { data: goalsData, isLoading } = useGoalsWithProgress(userId)

  const goals = goalsData?.data || []

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No saving goals yet</h3>
          <p className="text-gray-600 mb-4">
            Create saving goals to track your progress toward important financial milestones.
          </p>
          {onManageGoals && (
            <Button onClick={onManageGoals} className="bg-green-600 hover:bg-green-700">
              <Target className="w-4 h-4 mr-2" />
              Create Goal
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')
  const nearTargetGoals = goals.filter(g => 
    g.progress_percentage >= 80 && g.status === 'active' && !g.is_completed
  )
  const overdueGoals = goals.filter(g => 
    g.status === 'active' && 
    g.target_date && 
    isAfter(new Date(), new Date(g.target_date))
  )

  const totalProgress = goals.length > 0 
    ? goals.reduce((sum, g) => sum + g.progress_percentage, 0) / goals.length 
    : 0

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Saving Goals Overview</h2>
            <p className="text-gray-600">Track your progress toward financial milestones</p>
          </div>
          {onManageGoals && (
            <Button variant="outline" onClick={onManageGoals}>
              Manage Goals
            </Button>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-lg font-semibold text-blue-600">{activeGoals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-purple-600" />
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
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Coins className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Progress</p>
                <p className="text-lg font-semibold text-yellow-600">{totalProgress.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(overdueGoals.length > 0 || nearTargetGoals.length > 0) && (
        <div className="space-y-3">
          {overdueGoals.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-red-900">
                      {overdueGoals.length} goal{overdueGoals.length > 1 ? 's' : ''} overdue
                    </p>
                    <p className="text-sm text-red-700">
                      Consider adjusting target dates or increasing contributions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {nearTargetGoals.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-900">
                      {nearTargetGoals.length} goal{nearTargetGoals.length > 1 ? 's' : ''} nearly complete!
                    </p>
                    <p className="text-sm text-green-700">
                      You're doing great! Keep it up to reach your target
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Goal Progress Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Goal Progress</h3>
        <div className="grid gap-4">
          {goals.slice(0, 4).map((goal) => (
            <GoalProgressCard key={goal.id} goal={goal} />
          ))}
        </div>

        {goals.length > 4 && onManageGoals && (
          <div className="text-center pt-4">
            <Button variant="outline" onClick={onManageGoals}>
              View All Goals ({goals.length})
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

interface GoalProgressCardProps {
  goal: GoalWithProgress
}

function GoalProgressCard({ goal }: GoalProgressCardProps) {
  const IconComponent = getIcon(goal.category?.icon || 'Target')
  const progressValue = Math.min(goal.progress_percentage, 100)
  const isCompleted = goal.is_completed
  const isNearTarget = goal.progress_percentage >= 80 && !isCompleted
  const isOverdue = goal.target_date && isAfter(new Date(), new Date(goal.target_date)) && !isCompleted

  return (
    <Card className={cn(
      "transition-all duration-200",
      isCompleted && "border-green-200 bg-green-50",
      isOverdue && "border-red-200 bg-red-50",
      isNearTarget && "border-blue-200 bg-blue-50"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: goal.category?.color || '#16a34a' }}
            >
              <IconComponent className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{goal.name}</h4>
              <p className="text-sm text-gray-500 capitalize">
                {goal.status}
                {goal.target_date && (
                  <span> • Target: {format(new Date(goal.target_date), 'MMM dd')}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCompleted && (
              <Badge className="bg-green-100 text-green-800 text-xs">
                🎉 Complete
              </Badge>
            )}
            {isOverdue && (
              <Badge variant="destructive" className="bg-red-100 text-red-800 text-xs">
                Overdue
              </Badge>
            )}
            {isNearTarget && (
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                Almost there!
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {/* Progress Bar */}
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">
              ${goal.current_amount.toFixed(2)} / ${goal.target_amount.toFixed(2)}
            </span>
            <span className={cn(
              "font-medium",
              isCompleted ? "text-green-600" : 
              isNearTarget ? "text-blue-600" : "text-gray-900"
            )}>
              {progressValue.toFixed(0)}%
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

          {/* Remaining Amount and Timeline */}
          <div className="flex justify-between items-center text-sm pt-1">
            <div className="flex items-center gap-1">
              <span className="text-gray-600">
                {isCompleted ? 'Goal reached!' : `$${goal.remaining_amount.toFixed(2)} to go`}
              </span>
            </div>
            {goal.days_remaining !== undefined && goal.days_remaining >= 0 && !isCompleted && (
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="w-3 h-3" />
                <span className="text-xs">
                  {goal.days_remaining === 0 ? 'Due today' : `${goal.days_remaining}d left`}
                </span>
              </div>
            )}
          </div>

          {/* Daily Target (if applicable) */}
          {goal.daily_target && goal.daily_target > 0 && !isCompleted && (
            <div className="text-xs text-gray-500 pt-1">
              Daily target: ${goal.daily_target.toFixed(2)} to reach goal on time
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}