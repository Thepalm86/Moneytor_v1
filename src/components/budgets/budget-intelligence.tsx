'use client'

import { useMemo } from 'react'
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Calendar, 
  PiggyBank,
  Lightbulb,
  Clock
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { BudgetWithStats } from '@/lib/validations/budget'

interface BudgetIntelligenceProps {
  userId: string
  budgets: BudgetWithStats[]
}

interface BudgetInsight {
  id: string
  type: 'recommendation' | 'alert' | 'celebration' | 'optimization'
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  priority: 'low' | 'medium' | 'high'
  actionable?: boolean
  value?: number
}

export function BudgetIntelligence({ budgets }: BudgetIntelligenceProps) {
  const insights = useMemo(() => generateBudgetInsights(budgets), [budgets])
  const highPriorityInsights = insights.filter(insight => insight.priority === 'high')
  const recommendations = insights.filter(insight => insight.type === 'recommendation')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Budget Intelligence</h2>
          <p className="text-sm text-gray-600">Smart insights and recommendations for your budgets</p>
        </div>
      </div>

      {/* High Priority Alerts */}
      {highPriorityInsights.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              Requires Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highPriorityInsights.slice(0, 2).map((insight) => (
                <div key={insight.id} className="flex items-start gap-3">
                  <insight.icon className="h-4 w-4 mt-0.5 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900">{insight.title}</p>
                    <p className="text-xs text-amber-700">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Smart Recommendations */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              Smart Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((insight) => (
                <div key={insight.id} className="flex items-start gap-3">
                  <insight.icon className="h-4 w-4 mt-0.5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-900">{insight.title}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{insight.description}</p>
                  </div>
                </div>
              ))}
              {recommendations.length === 0 && (
                <p className="text-xs text-gray-500">No recommendations available. Create more budgets to get insights.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetPerformanceSummary budgets={budgets} />
          </CardContent>
        </Card>
      </div>

      {/* Seasonal Adjustments */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4 text-purple-600" />
            Seasonal Budget Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SeasonalInsights budgets={budgets} />
        </CardContent>
      </Card>

    </div>
  )
}

function BudgetPerformanceSummary({ budgets }: { budgets: BudgetWithStats[] }) {
  const stats = useMemo(() => {
    const onTrackBudgets = budgets.filter(b => b.spent_percentage <= 80 && !b.is_over_budget).length
    const overBudgets = budgets.filter(b => b.is_over_budget).length
    const averageSpent = budgets.length > 0 
      ? budgets.reduce((sum, b) => sum + b.spent_percentage, 0) / budgets.length
      : 0

    return {
      onTrack: onTrackBudgets,
      overBudget: overBudgets,
      averageSpent: Math.round(averageSpent),
      totalSavings: budgets.reduce((sum, b) => sum + Math.max(0, b.remaining_amount), 0)
    }
  }, [budgets])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center">
          <p className="text-xs text-gray-600">On Track</p>
          <p className="text-lg font-semibold text-green-600">{stats.onTrack}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">Over Budget</p>
          <p className="text-lg font-semibold text-red-600">{stats.overBudget}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Average Spent</span>
          <span className="font-medium">{stats.averageSpent}%</span>
        </div>
        <Progress value={stats.averageSpent} className="h-1.5" />
      </div>

      <div className="pt-2 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Total Remaining</span>
          <span className="text-sm font-semibold text-green-600">
            ${stats.totalSavings.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}

function SeasonalInsights({ budgets }: { budgets: BudgetWithStats[] }) {
  const currentMonth = new Date().getMonth()
  const seasonalTips = getSeasonalTips(currentMonth, budgets)

  return (
    <div className="space-y-3">
      {seasonalTips.map((tip, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
          <p className="text-xs text-gray-700 leading-relaxed">{tip}</p>
        </div>
      ))}
    </div>
  )
}

function generateBudgetInsights(budgets: BudgetWithStats[]): BudgetInsight[] {
  const insights: BudgetInsight[] = []

  // Alert: Over budget
  budgets.forEach(budget => {
    if (budget.is_over_budget) {
      insights.push({
        id: `over-budget-${budget.id}`,
        type: 'alert',
        title: `${budget.category?.name} over budget`,
        description: `You've spent $${budget.spent_amount.toFixed(2)} of $${budget.amount.toFixed(2)}`,
        icon: AlertTriangle,
        priority: 'high'
      })
    }
  })

  // Alert: Near budget limit
  budgets.forEach(budget => {
    if (budget.spent_percentage >= 80 && !budget.is_over_budget) {
      insights.push({
        id: `near-limit-${budget.id}`,
        type: 'alert',
        title: `${budget.category?.name} near limit`,
        description: `${budget.spent_percentage.toFixed(0)}% of budget used`,
        icon: Clock,
        priority: 'medium'
      })
    }
  })

  // Recommendation: Increase well-performing budgets
  budgets.forEach(budget => {
    if (budget.spent_percentage < 50 && budget.remaining_amount > 0) {
      insights.push({
        id: `increase-budget-${budget.id}`,
        type: 'recommendation',
        title: `Consider increasing ${budget.category?.name} budget`,
        description: `Only ${budget.spent_percentage.toFixed(0)}% used. You could allocate more for this category.`,
        icon: TrendingUp,
        priority: 'low'
      })
    }
  })

  // Recommendation: Unused budget categories
  if (budgets.length < 5) {
    insights.push({
      id: 'more-budgets',
      type: 'recommendation',
      title: 'Create more budget categories',
      description: 'Track more spending categories to get better insights and control.',
      icon: Target,
      priority: 'medium'
    })
  }

  // Recommendation: Budget templates
  if (budgets.length === 0) {
    insights.push({
      id: 'budget-templates',
      type: 'recommendation',
      title: 'Try budget templates',
      description: 'Use the 50/30/20 rule or other proven budgeting methods.',
      icon: PiggyBank,
      priority: 'medium'
    })
  }

  return insights
}

function getSeasonalTips(month: number, budgets: BudgetWithStats[]): string[] {
  const tips: string[] = []
  
  // Seasonal spending patterns
  if ([11, 0].includes(month)) { // November, December
    tips.push("Holiday season: Consider creating special budgets for gifts and entertainment.")
    tips.push("Monitor dining and shopping categories more closely during holiday months.")
  } else if ([5, 6, 7].includes(month)) { // Summer months
    tips.push("Summer spending: Travel and entertainment budgets typically increase.")
    tips.push("Energy costs may be higher - adjust utilities budget accordingly.")
  } else if ([2, 3].includes(month)) { // Spring
    tips.push("Spring cleaning season: Home improvement budgets may need adjustment.")
    tips.push("Tax season: Remember to budget for tax preparation or payments.")
  } else if ([8, 9, 10].includes(month)) { // Back to school season
    tips.push("Back-to-school season: Education and supplies budgets may need increases.")
    tips.push("Fall preparation: Consider seasonal shopping and home maintenance.")
  }

  // Budget performance tips
  const overBudgetCount = budgets.filter(b => b.is_over_budget).length
  if (overBudgetCount > 0) {
    tips.push(`${overBudgetCount} budget${overBudgetCount > 1 ? 's are' : ' is'} over limit. Consider adjusting amounts or spending habits.`)
  }

  // If no budgets exist
  if (budgets.length === 0) {
    tips.push("Start with 3-5 key spending categories to build effective budgeting habits.")
    tips.push("Review your spending patterns over the past 3 months to set realistic budget amounts.")
  }

  return tips.slice(0, 3) // Limit to 3 tips
}