'use client'

import { Target, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useBudgetsWithStats } from '@/hooks/use-budgets'
import { getIcon } from '@/lib/utils/icons'
import { cn } from '@/lib/utils'
import type { BudgetWithStats } from '@/lib/validations/budget'

interface BudgetOverviewCardsProps {
  userId: string
  showHeader?: boolean
  onManageBudgets?: () => void
}

export function BudgetOverviewCards({ 
  userId, 
  showHeader = true, 
  onManageBudgets 
}: BudgetOverviewCardsProps) {
  const { data: budgetsData, isLoading } = useBudgetsWithStats(userId)

  const budgets = budgetsData?.data || []

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

  if (budgets.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No budgets yet</h3>
          <p className="text-gray-600 mb-4">
            Create budgets to track your spending and stay on target with your financial goals.
          </p>
          {onManageBudgets && (
            <Button onClick={onManageBudgets}>
              <Target className="w-4 h-4 mr-2" />
              Create Budget
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const overBudgetCount = budgets.filter(b => b.is_over_budget).length
  const nearLimitCount = budgets.filter(b => 
    b.spent_percentage >= 80 && !b.is_over_budget
  ).length

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Budget Overview</h2>
            <p className="text-gray-600">Track your spending against your budget limits</p>
          </div>
          {onManageBudgets && (
            <Button variant="outline" onClick={onManageBudgets}>
              Manage Budgets
            </Button>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Budgets</p>
                <p className="text-lg font-semibold">{budgets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">On Track</p>
                <p className="text-lg font-semibold text-green-600">
                  {budgets.length - overBudgetCount - nearLimitCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Near Limit</p>
                <p className="text-lg font-semibold text-yellow-600">{nearLimitCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Over Budget</p>
                <p className="text-lg font-semibold text-red-600">{overBudgetCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Budget Progress</h3>
        <div className="grid gap-4">
          {budgets.slice(0, 4).map((budget) => (
            <BudgetProgressCard key={budget.id} budget={budget} />
          ))}
        </div>

        {budgets.length > 4 && onManageBudgets && (
          <div className="text-center pt-4">
            <Button variant="outline" onClick={onManageBudgets}>
              View All Budgets ({budgets.length})
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

interface BudgetProgressCardProps {
  budget: BudgetWithStats
}

function BudgetProgressCard({ budget }: BudgetProgressCardProps) {
  const IconComponent = getIcon(budget.category?.icon || 'DollarSign')
  const progressValue = Math.min(budget.spent_percentage, 100)
  const isOverBudget = budget.is_over_budget
  const isNearLimit = budget.spent_percentage >= 80 && !isOverBudget

  return (
    <Card className={cn(
      "transition-all duration-200",
      isOverBudget && "border-red-200 bg-red-50",
      isNearLimit && "border-yellow-200 bg-yellow-50"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: budget.category?.color || '#6b7280' }}
            >
              <IconComponent className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">
                {budget.category?.name || 'Unknown Category'}
              </h4>
              <p className="text-sm text-gray-500 capitalize">
                {budget.period}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOverBudget && (
              <Badge variant="destructive" className="bg-red-100 text-red-800 text-xs">
                Over
              </Badge>
            )}
            {isNearLimit && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                Near Limit
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {/* Progress Bar */}
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">
              ${budget.spent_amount.toFixed(2)} / ${budget.amount.toFixed(2)}
            </span>
            <span className={cn(
              "font-medium",
              isOverBudget ? "text-red-600" : 
              isNearLimit ? "text-yellow-600" : "text-gray-900"
            )}>
              {progressValue.toFixed(0)}%
            </span>
          </div>
          <Progress
            value={progressValue}
            className={cn(
              "h-2",
              isOverBudget && "[&>div]:bg-red-500",
              isNearLimit && "[&>div]:bg-yellow-500"
            )}
          />

          {/* Remaining Amount */}
          <div className="flex justify-between items-center text-sm pt-1">
            <span className="text-gray-600">
              {budget.remaining_amount >= 0 ? 'Remaining' : 'Over by'}
            </span>
            <span className={cn(
              "font-medium",
              budget.remaining_amount < 0 ? "text-red-600" : "text-green-600"
            )}>
              ${Math.abs(budget.remaining_amount).toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}