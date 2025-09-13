'use client'

import { AlertTriangle, TrendingDown, Clock, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useBudgetsWithStats } from '@/hooks/use-budgets'
import { getIcon } from '@/lib/utils/icons'
import { cn } from '@/lib/utils'
import type { BudgetWithStats } from '@/lib/validations/budget'

interface BudgetAlertsProps {
  userId: string
  onManageBudgets?: () => void
}

export function BudgetAlerts({ userId, onManageBudgets }: BudgetAlertsProps) {
  const { data: budgetsData, isLoading } = useBudgetsWithStats(userId)

  const budgets = budgetsData?.data || []
  
  // Filter budgets by alert level
  const overBudgetBudgets = budgets.filter(b => b.is_over_budget)
  const nearLimitBudgets = budgets.filter(b => 
    b.spent_percentage >= 80 && !b.is_over_budget
  )
  const upcomingBudgets = budgets.filter(b => 
    b.days_remaining !== undefined && b.days_remaining <= 7 && b.days_remaining > 0
  )

  const totalAlerts = overBudgetBudgets.length + nearLimitBudgets.length + upcomingBudgets.length

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="w-full h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (totalAlerts === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-medium text-green-900 mb-1">All budgets on track!</h3>
          <p className="text-sm text-green-700">
            Great job managing your spending. Keep it up!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Budget Alerts
            <Badge variant="secondary" className="ml-2">
              {totalAlerts}
            </Badge>
          </CardTitle>
          {onManageBudgets && (
            <Button variant="outline" size="sm" onClick={onManageBudgets}>
              Manage
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Over Budget Alerts */}
        {overBudgetBudgets.map((budget) => (
          <BudgetAlert
            key={`over-${budget.id}`}
            budget={budget}
            type="over-budget"
          />
        ))}

        {/* Near Limit Alerts */}
        {nearLimitBudgets.map((budget) => (
          <BudgetAlert
            key={`near-${budget.id}`}
            budget={budget}
            type="near-limit"
          />
        ))}

        {/* Upcoming End Date Alerts */}
        {upcomingBudgets.map((budget) => (
          <BudgetAlert
            key={`upcoming-${budget.id}`}
            budget={budget}
            type="upcoming-end"
          />
        ))}

        {totalAlerts > 3 && onManageBudgets && (
          <div className="pt-2 border-t border-gray-200">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onManageBudgets}
              className="w-full text-center"
            >
              View All Budget Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface BudgetAlertProps {
  budget: BudgetWithStats
  type: 'over-budget' | 'near-limit' | 'upcoming-end'
}

function BudgetAlert({ budget, type }: BudgetAlertProps) {
  const IconComponent = getIcon(budget.category?.icon || 'DollarSign')

  const getAlertConfig = () => {
    switch (type) {
      case 'over-budget':
        return {
          icon: TrendingDown,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          badgeVariant: 'destructive' as const,
          title: 'Over Budget',
          description: `Exceeded by $${Math.abs(budget.remaining_amount).toFixed(2)}`,
        }
      case 'near-limit':
        return {
          icon: AlertTriangle,
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          badgeVariant: 'secondary' as const,
          title: 'Near Limit',
          description: `${budget.spent_percentage.toFixed(0)}% spent`,
        }
      case 'upcoming-end':
        return {
          icon: Clock,
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          badgeVariant: 'secondary' as const,
          title: 'Ending Soon',
          description: `${budget.days_remaining} days remaining`,
        }
    }
  }

  const config = getAlertConfig()
  const AlertIcon = config.icon

  return (
    <Alert className={cn(config.bgColor, config.borderColor)}>
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: budget.category?.color || '#6b7280' }}
        >
          <IconComponent className="w-4 h-4 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <AlertTitle className="text-sm font-medium m-0">
              {budget.category?.name || 'Unknown Category'}
            </AlertTitle>
            <Badge variant={config.badgeVariant} className="text-xs">
              {config.title}
            </Badge>
          </div>
          <AlertDescription className="text-xs text-gray-600 m-0">
            {config.description} • {budget.period} budget
          </AlertDescription>
        </div>
        
        <AlertIcon className={cn("w-4 h-4", config.iconColor)} />
      </div>
    </Alert>
  )
}