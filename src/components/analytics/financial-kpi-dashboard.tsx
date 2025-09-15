'use client'

import React from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Shield,
  Target,
  Activity,
  PieChart,
} from 'lucide-react'
import { useCurrency } from '@/contexts/currency-context'
import { useFinancialKPIs } from '@/hooks/use-financial-kpis'
import { usePeriodComparison } from '@/hooks/use-period-comparison'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { DateRange } from '@/lib/supabase/analytics'

interface FinancialKPIDashboardProps {
  userId: string
  dateRange: DateRange
  className?: string
}

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
    label: string
  }
  icon: React.ReactNode
  color: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'indigo'
  progress?: {
    value: number
    max: number
    label: string
  }
  className?: string
}

function KPICard({
  title,
  value,
  subtitle,
  trend,
  icon,
  color,
  progress,
  className,
}: KPICardProps) {
  const { formatCurrency } = useCurrency()
  const colorClasses = {
    blue: {
      card: 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30',
      icon: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/50',
      value: 'text-blue-900 dark:text-blue-100',
      trend: {
        positive: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
        negative: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
      },
    },
    green: {
      card: 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30',
      icon: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/50',
      value: 'text-green-900 dark:text-green-100',
      trend: {
        positive: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
        negative: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
      },
    },
    red: {
      card: 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/30',
      icon: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/50',
      value: 'text-red-900 dark:text-red-100',
      trend: {
        positive: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
        negative: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
      },
    },
    amber: {
      card: 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30',
      icon: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/50',
      value: 'text-amber-900 dark:text-amber-100',
      trend: {
        positive: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
        negative: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
      },
    },
    purple: {
      card: 'border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/30',
      icon: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/50',
      value: 'text-purple-900 dark:text-purple-100',
      trend: {
        positive: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
        negative: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
      },
    },
    indigo: {
      card: 'border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/30',
      icon: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/50',
      value: 'text-indigo-900 dark:text-indigo-100',
      trend: {
        positive: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
        negative: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
      },
    },
  }

  const colors = colorClasses[color]

  return (
    <Card
      className={cn(
        'glass-card border-premium interactive-card transition-all duration-200 hover:scale-[1.02]',
        colors.card,
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn('rounded-full p-2', colors.icon)}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className={cn('text-2xl font-bold', colors.value)}>
              {typeof value === 'number' ? formatCurrency(value) : value}
            </div>
            {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          </div>

          {trend && (
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  'flex items-center gap-1 text-xs',
                  trend.isPositive ? colors.trend.positive : colors.trend.negative
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(trend.value).toFixed(1)}%
              </Badge>
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            </div>
          )}

          {progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progress.label}</span>
                <span>{Math.round((progress.value / progress.max) * 100)}%</span>
              </div>
              <Progress value={(progress.value / progress.max) * 100} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const FinancialKPIDashboardComponent = React.memo(function FinancialKPIDashboard({
  dateRange,
  className,
}: FinancialKPIDashboardProps) {
  const { data: kpisData, isLoading: kpisLoading, error: kpisError } = useFinancialKPIs(dateRange)
  const { data: comparisonData, isLoading: comparisonLoading } = usePeriodComparison(
    dateRange,
    'previous'
  )

  if (kpisLoading || comparisonLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Financial Health Dashboard</h2>
          <p className="text-muted-foreground">
            Key performance indicators for your financial wellness
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="glass-card border-premium">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-8 w-full animate-pulse rounded bg-muted"></div>
                  <div className="h-4 w-1/2 animate-pulse rounded bg-muted"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (kpisError || !kpisData?.data) {
    return (
      <div className={cn('space-y-6', className)}>
        <Card className="glass-card border-premium">
          <CardContent className="pt-6">
            <div className="space-y-2 text-center">
              <div className="text-muted-foreground">Unable to load financial KPIs</div>
              <p className="text-sm text-muted-foreground">
                {kpisError instanceof Error
                  ? kpisError.message
                  : kpisError || 'An error occurred while calculating your financial metrics'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const kpis = kpisData.data
  const comparison = comparisonData?.data

  // Get trend information from comparison data
  const incomeTrend = comparison
    ? {
        value: comparison.changes.incomePercentChange,
        isPositive: comparison.changes.incomePercentChange >= 0,
        label: 'vs previous period',
      }
    : undefined

  const expenseTrend = comparison
    ? {
        value: Math.abs(comparison.changes.expensePercentChange),
        isPositive: comparison.changes.expensePercentChange <= 0, // Lower expenses are better
        label: 'vs previous period',
      }
    : undefined

  const netTrend = comparison
    ? {
        value: Math.abs(comparison.changes.netPercentChange),
        isPositive: comparison.changes.netPercentChange >= 0,
        label: 'vs previous period',
      }
    : undefined

  const healthScoreColor =
    kpis.financialHealthScore >= 80 ? 'green' : kpis.financialHealthScore >= 60 ? 'amber' : 'red'

  const savingsRateColor =
    kpis.savingsRate >= 20 ? 'green' : kpis.savingsRate >= 10 ? 'amber' : 'red'

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Financial Health Dashboard</h2>
        <p className="text-muted-foreground">
          Key performance indicators for your financial wellness
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Monthly Net Income"
          value={kpis.monthlyNet}
          subtitle="Projected monthly surplus"
          trend={netTrend}
          icon={<DollarSign className="h-4 w-4" />}
          color={kpis.monthlyNet >= 0 ? 'green' : 'red'}
        />

        <KPICard
          title="Savings Rate"
          value={`${kpis.savingsRate.toFixed(1)}%`}
          subtitle="Percentage of income saved"
          icon={<Target className="h-4 w-4" />}
          color={savingsRateColor}
          progress={{
            value: Math.max(0, kpis.savingsRate),
            max: 30,
            label: 'Target: 20-30%',
          }}
        />

        <KPICard
          title="Financial Health Score"
          value={`${Math.round(kpis.financialHealthScore)}/100`}
          subtitle="Overall financial wellness"
          icon={<Shield className="h-4 w-4" />}
          color={healthScoreColor}
          progress={{
            value: kpis.financialHealthScore,
            max: 100,
            label: 'Health Score',
          }}
        />

        <KPICard
          title="Daily Spending"
          value={kpis.spendingVelocity}
          subtitle="Average daily expenses"
          icon={<Zap className="h-4 w-4" />}
          color="blue"
        />

        <KPICard
          title="Monthly Income"
          value={kpis.monthlyIncome}
          subtitle="Projected monthly income"
          trend={incomeTrend}
          icon={<TrendingUp className="h-4 w-4" />}
          color="green"
        />

        <KPICard
          title="Monthly Expenses"
          value={kpis.monthlyExpenses}
          subtitle="Projected monthly expenses"
          trend={expenseTrend}
          icon={<TrendingDown className="h-4 w-4" />}
          color="red"
        />

        <KPICard
          title="Emergency Fund Ratio"
          value={`${Math.min(kpis.emergencyFundRatio * 100, 200).toFixed(0)}%`}
          subtitle="Coverage for 3 months expenses"
          icon={<Activity className="h-4 w-4" />}
          color={
            kpis.emergencyFundRatio >= 1
              ? 'green'
              : kpis.emergencyFundRatio >= 0.5
                ? 'amber'
                : 'red'
          }
          progress={{
            value: Math.min(kpis.emergencyFundRatio, 2),
            max: 2,
            label: 'Target: 3-6 months',
          }}
        />

        {kpis.topSpendingCategory && (
          <KPICard
            title="Top Spending Category"
            value={kpis.topSpendingCategory.amount}
            subtitle={`${kpis.topSpendingCategory.name} (${kpis.topSpendingCategory.percentage.toFixed(1)}%)`}
            icon={<PieChart className="h-4 w-4" />}
            color="purple"
          />
        )}
      </div>

      {/* Additional insights */}
      <Card className="glass-card border-premium">
        <CardHeader>
          <CardTitle className="text-lg">Financial Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Growth Trends</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Income Growth</span>
                  <Badge variant={kpis.incomeGrowth >= 0 ? 'default' : 'destructive'}>
                    {kpis.incomeGrowth >= 0 ? '+' : ''}
                    {kpis.incomeGrowth.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Expense Growth</span>
                  <Badge variant={kpis.expenseGrowth <= 0 ? 'default' : 'destructive'}>
                    {kpis.expenseGrowth >= 0 ? '+' : ''}
                    {kpis.expenseGrowth.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Recommendations</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                {kpis.savingsRate < 10 && (
                  <p>• Consider reducing expenses to improve your savings rate</p>
                )}
                {kpis.emergencyFundRatio < 0.5 && (
                  <p>• Build your emergency fund to cover 3-6 months of expenses</p>
                )}
                {kpis.expenseGrowth > 10 && (
                  <p>• Monitor expense growth - it's increasing faster than ideal</p>
                )}
                {kpis.financialHealthScore >= 80 && (
                  <p>• Great job! Your financial health is excellent</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

export { FinancialKPIDashboardComponent as FinancialKPIDashboard }
