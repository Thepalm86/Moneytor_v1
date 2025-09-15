'use client'

import { useState } from 'react'
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowUpDown,
  ArrowRight,
} from 'lucide-react'
import { format } from 'date-fns'
import { useCurrency } from '@/contexts/currency-context'
import { usePeriodComparison } from '@/hooks/use-period-comparison'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { DateRange } from '@/lib/supabase/analytics'

interface ComparisonToolsProps {
  userId: string
  currentPeriod: DateRange
  className?: string
}

interface ComparisonMetricProps {
  title: string
  currentValue: number
  previousValue: number
  change: number
  percentChange: number
  isPositive?: boolean
  icon: React.ReactNode
  subtitle?: string
}

function ComparisonMetric({
  title,
  currentValue,
  previousValue,
  change,
  percentChange,
  isPositive,
  icon,
  subtitle,
}: ComparisonMetricProps) {
  const { formatCurrency } = useCurrency()
  const isIncrease = change >= 0
  const isGoodChange =
    isPositive !== undefined ? (isPositive ? isIncrease : !isIncrease) : isIncrease

  return (
    <Card className="glass-card border-premium interactive-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="rounded-full bg-muted/50 p-2">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">{formatCurrency(currentValue)}</div>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant={isGoodChange ? 'default' : 'destructive'}
                className="flex items-center gap-1"
              >
                {isIncrease ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(percentChange).toFixed(1)}%
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(Math.abs(change))}
              </span>
            </div>
          </div>

          <div className="border-t border-border/50 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Previous:</span>
              <span className="font-medium">{formatCurrency(previousValue)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface PeriodSelectorProps {
  currentPeriod: DateRange
  comparisonType: 'previous' | 'year-over-year'
  onComparisonTypeChange: (type: 'previous' | 'year-over-year') => void
}

function PeriodSelector({
  currentPeriod,
  comparisonType,
  onComparisonTypeChange,
}: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border bg-muted/20 p-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Comparing:</span>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {format(currentPeriod.from, 'MMM dd')} - {format(currentPeriod.to, 'MMM dd, yyyy')}
        </Badge>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <Select value={comparisonType} onValueChange={onComparisonTypeChange}>
          <SelectTrigger className="h-8 w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="previous">Previous Period</SelectItem>
            <SelectItem value="year-over-year">Year over Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

interface VarianceAnalysisProps {
  comparison: {
    currentPeriod: {
      income: number
      expenses: number
      net: number
      transactionCount: number
    }
    previousPeriod: {
      income: number
      expenses: number
      net: number
      transactionCount: number
    }
    changes: {
      incomeChange: number
      expenseChange: number
      netChange: number
      transactionCountChange: number
      incomePercentChange: number
      expensePercentChange: number
      netPercentChange: number
    }
  }
  comparisonType: 'previous' | 'year-over-year'
}

function VarianceAnalysis({ comparison, comparisonType }: VarianceAnalysisProps) {
  const { formatCurrency } = useCurrency()
  const { currentPeriod, previousPeriod, changes } = comparison

  // Calculate variance insights
  const totalCurrentActivity = currentPeriod.income + currentPeriod.expenses
  const totalPreviousActivity = previousPeriod.income + previousPeriod.expenses
  const activityChange = totalCurrentActivity - totalPreviousActivity
  const activityPercentChange =
    totalPreviousActivity > 0 ? (activityChange / totalPreviousActivity) * 100 : 0

  const insights = []

  // Generate insights based on changes
  if (Math.abs(changes.incomePercentChange) > 10) {
    insights.push({
      type: changes.incomePercentChange > 0 ? 'positive' : 'negative',
      message: `Income ${changes.incomePercentChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(changes.incomePercentChange).toFixed(1)}%`,
    })
  }

  if (Math.abs(changes.expensePercentChange) > 10) {
    insights.push({
      type: changes.expensePercentChange < 0 ? 'positive' : 'negative',
      message: `Expenses ${changes.expensePercentChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(changes.expensePercentChange).toFixed(1)}%`,
    })
  }

  if (Math.abs(activityPercentChange) > 15) {
    insights.push({
      type: 'neutral',
      message: `Overall financial activity ${activityPercentChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(activityPercentChange).toFixed(1)}%`,
    })
  }

  const netImprovement = changes.netChange > 0
  if (Math.abs(changes.netChange) > 100) {
    insights.push({
      type: netImprovement ? 'positive' : 'negative',
      message: `Net position ${netImprovement ? 'improved' : 'declined'} by ${formatCurrency(Math.abs(changes.netChange))}`,
    })
  }

  return (
    <Card className="glass-card border-premium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5" />
          Variance Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Current Period</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Total Activity:</span>
                  <span className="font-medium">{formatCurrency(totalCurrentActivity)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Transactions:</span>
                  <span className="font-medium">{currentPeriod.transactionCount}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                {comparisonType === 'year-over-year' ? 'Same Period Last Year' : 'Previous Period'}
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Total Activity:</span>
                  <span className="font-medium">{formatCurrency(totalPreviousActivity)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Transactions:</span>
                  <span className="font-medium">{previousPeriod.transactionCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          {insights.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Key Insights</h4>
              <div className="space-y-2">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className={cn(
                      'rounded-lg border p-3 text-sm',
                      insight.type === 'positive'
                        ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300'
                        : insight.type === 'negative'
                          ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300'
                          : 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300'
                    )}
                  >
                    {insight.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Detailed Breakdown</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-border/50 py-2">
                <span className="text-sm">Activity Change:</span>
                <div className="flex items-center gap-2">
                  <Badge variant={activityPercentChange >= 0 ? 'default' : 'destructive'}>
                    {activityPercentChange >= 0 ? '+' : ''}
                    {activityPercentChange.toFixed(1)}%
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(activityChange)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm">Transaction Count Change:</span>
                <div className="flex items-center gap-2">
                  <Badge variant={changes.transactionCountChange >= 0 ? 'default' : 'destructive'}>
                    {changes.transactionCountChange >= 0 ? '+' : ''}
                    {changes.transactionCountChange}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ComparisonTools({ currentPeriod, className }: ComparisonToolsProps) {
  const [comparisonType, setComparisonType] = useState<'previous' | 'year-over-year'>('previous')

  const {
    data: comparisonData,
    isLoading,
    error,
  } = usePeriodComparison(currentPeriod, comparisonType)

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Period Comparison</h2>
          <p className="text-muted-foreground">
            Compare financial performance across different time periods
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
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

  if (error || !comparisonData?.data) {
    return (
      <div className={cn('space-y-6', className)}>
        <Card className="glass-card border-premium">
          <CardContent className="pt-6">
            <div className="space-y-2 text-center">
              <div className="text-muted-foreground">Unable to load comparison data</div>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : error || 'An error occurred while calculating the comparison'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const comparison = comparisonData.data

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Period Comparison</h2>
          <p className="text-muted-foreground">
            Compare financial performance across different time periods
          </p>
        </div>

        <PeriodSelector
          currentPeriod={currentPeriod}
          comparisonType={comparisonType}
          onComparisonTypeChange={setComparisonType}
        />
      </div>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            Key Metrics
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Variance Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ComparisonMetric
              title="Income"
              currentValue={comparison.currentPeriod.income}
              previousValue={comparison.previousPeriod.income}
              change={comparison.changes.incomeChange}
              percentChange={comparison.changes.incomePercentChange}
              isPositive={true}
              icon={<TrendingUp className="h-4 w-4 text-green-600" />}
              subtitle="Total income received"
            />

            <ComparisonMetric
              title="Expenses"
              currentValue={comparison.currentPeriod.expenses}
              previousValue={comparison.previousPeriod.expenses}
              change={comparison.changes.expenseChange}
              percentChange={comparison.changes.expensePercentChange}
              isPositive={false}
              icon={<TrendingDown className="h-4 w-4 text-red-600" />}
              subtitle="Total expenses paid"
            />

            <ComparisonMetric
              title="Net Position"
              currentValue={comparison.currentPeriod.net}
              previousValue={comparison.previousPeriod.net}
              change={comparison.changes.netChange}
              percentChange={comparison.changes.netPercentChange}
              isPositive={true}
              icon={<BarChart3 className="h-4 w-4 text-blue-600" />}
              subtitle="Income minus expenses"
            />
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <VarianceAnalysis comparison={comparison} comparisonType={comparisonType} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
