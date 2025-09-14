'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Cell,
} from 'recharts'
import { format, subMonths, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns'

import { formatCurrency } from '@/lib/utils/currency'
import { useTransactions } from '@/hooks/use-transactions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/lib/validations/transaction'

interface MonthlyOverviewChartProps {
  userId: string
  monthsCount?: number
  className?: string
}

export function MonthlyOverviewChart({
  userId,
  monthsCount = 12,
  className,
}: MonthlyOverviewChartProps) {
  const dateRange = useMemo(
    () => ({
      from: subMonths(startOfMonth(new Date()), monthsCount - 1),
      to: endOfMonth(new Date()),
    }),
    [monthsCount]
  )

  const { data: transactionsData, isLoading } = useTransactions(userId, {
    dateFrom: dateRange.from,
    dateTo: dateRange.to,
  })

  const chartData = useMemo(() => {
    if (!transactionsData?.data) return []

    const transactions = transactionsData.data

    // Generate all months in the range
    const months = eachMonthOfInterval({
      start: dateRange.from,
      end: dateRange.to,
    })

    // Group transactions by month
    const transactionsByMonth = transactions.reduce(
      (acc, transaction) => {
        const transactionDate = new Date(transaction.date)
        const monthKey = format(startOfMonth(transactionDate), 'yyyy-MM')

        if (!acc[monthKey]) {
          acc[monthKey] = { income: 0, expenses: 0, transactions: [] }
        }

        acc[monthKey].transactions.push(transaction)

        if (transaction.type === 'income') {
          acc[monthKey].income += Number(transaction.amount)
        } else {
          acc[monthKey].expenses += Number(transaction.amount)
        }

        return acc
      },
      {} as Record<string, { income: number; expenses: number; transactions: Transaction[] }>
    )

    // Create chart data for each month
    return months.map(month => {
      const monthKey = format(month, 'yyyy-MM')
      const monthData = transactionsByMonth[monthKey] || {
        income: 0,
        expenses: 0,
        transactions: [],
      }

      return {
        month,
        monthLabel: format(month, 'MMM yyyy'),
        monthShort: format(month, 'MMM'),
        income: monthData.income,
        expenses: monthData.expenses,
        net: monthData.income - monthData.expenses,
        transactionCount: monthData.transactions.length,
        averageTransaction:
          monthData.transactions.length > 0
            ? (monthData.income + monthData.expenses) / monthData.transactions.length
            : 0,
      }
    })
  }, [transactionsData?.data, dateRange])

  const summaryStats = useMemo(() => {
    if (chartData.length === 0) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        totalNet: 0,
        averageMonthlyIncome: 0,
        averageMonthlyExpenses: 0,
        averageMonthlyNet: 0,
        bestMonth: null,
        worstMonth: null,
      }
    }

    const totalIncome = chartData.reduce((sum, item) => sum + item.income, 0)
    const totalExpenses = chartData.reduce((sum, item) => sum + item.expenses, 0)
    const totalNet = totalIncome - totalExpenses

    const bestMonth = chartData.reduce((best, current) =>
      current.net > (best?.net || -Infinity) ? current : best
    )

    const worstMonth = chartData.reduce((worst, current) =>
      current.net < (worst?.net || Infinity) ? current : worst
    )

    return {
      totalIncome,
      totalExpenses,
      totalNet,
      averageMonthlyIncome: totalIncome / chartData.length,
      averageMonthlyExpenses: totalExpenses / chartData.length,
      averageMonthlyNet: totalNet / chartData.length,
      bestMonth,
      worstMonth,
    }
  }, [chartData])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload

      return (
        <div className="glass-card border-premium max-w-xs animate-fade-in p-4">
          <h4 className="text-display-sm mb-3 font-semibold text-foreground">{data.monthLabel}</h4>
          <div className="text-body-sm space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-success-400 to-success-600"></div>
                <span className="font-medium text-success-700 dark:text-success-300">Income:</span>
              </div>
              <span className="text-currency-sm font-semibold">{formatCurrency(data.income)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-error-400 to-error-600"></div>
                <span className="font-medium text-error-700 dark:text-error-300">Expenses:</span>
              </div>
              <span className="text-currency-sm font-semibold">
                {formatCurrency(data.expenses)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border/50 pt-2">
              <div className="flex items-center gap-2">
                <div className="from-primary-400 to-primary-600 h-3 w-3 rounded-full bg-gradient-to-r"></div>
                <span className="text-primary-700 dark:text-primary-300 font-medium">Net:</span>
              </div>
              <span
                className={`text-currency-sm font-bold ${data.net >= 0 ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}
              >
                {formatCurrency(data.net)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border/30 pt-2">
              <span className="text-caption font-medium text-muted-foreground">Transactions:</span>
              <span className="font-semibold">{data.transactionCount}</span>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  if (isLoading) {
    return (
      <Card className={cn('glass-card border-premium', className)}>
        <CardHeader>
          <CardTitle className="text-display-md">Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center">
            <div className="space-y-4 text-center">
              <div className="relative">
                <div className="border-primary-200 border-t-primary-600 mx-auto h-12 w-12 animate-spin rounded-full border-4"></div>
                <div className="from-primary-400 to-primary-600 absolute inset-0 animate-pulse rounded-full bg-gradient-to-r opacity-20"></div>
              </div>
              <p className="text-body-sm font-medium text-muted-foreground">
                Loading chart data...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card className={cn('glass-card border-premium', className)}>
        <CardHeader>
          <CardTitle className="text-display-md">Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center">
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/50">
                <div className="from-primary-400 to-primary-600 h-8 w-8 rounded-full bg-gradient-to-br opacity-60"></div>
              </div>
              <div className="space-y-1">
                <p className="text-body-md font-medium text-foreground">
                  No transaction data available
                </p>
                <p className="text-body-sm text-muted-foreground">
                  Add some transactions to see monthly overview
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('glass-card border-premium interactive-card', className)}>
      <CardHeader className="space-y-2">
        <CardTitle className="text-display-md">Monthly Overview</CardTitle>
        <p className="text-body-sm text-muted-foreground">
          Last {monthsCount} months • Total Net:
          <span
            className={cn(
              'ml-1 font-semibold',
              summaryStats.totalNet >= 0
                ? 'text-success-600 dark:text-success-400'
                : 'text-error-600 dark:text-error-400'
            )}
          >
            {formatCurrency(summaryStats.totalNet)}
          </span>
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="comparison" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="net">Net Trend</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="comparison" className="space-y-4">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <defs>
                  <linearGradient id="incomeBarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--success-400))" />
                    <stop offset="100%" stopColor="hsl(var(--success-600))" />
                  </linearGradient>
                  <linearGradient id="expenseBarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--error-400))" />
                    <stop offset="100%" stopColor="hsl(var(--error-600))" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="monthShort"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  dy={10}
                />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={value => formatCurrency(value)}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="income"
                  fill="url(#incomeBarGradient)"
                  name="Income"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
                  fill="url(#expenseBarGradient)"
                  name="Expenses"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="net" className="space-y-4">
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <defs>
                  <linearGradient id="netPositiveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--success-400))" />
                    <stop offset="100%" stopColor="hsl(var(--success-600))" />
                  </linearGradient>
                  <linearGradient id="netNegativeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--error-400))" />
                    <stop offset="100%" stopColor="hsl(var(--error-600))" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="monthShort"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  dy={10}
                />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={value => formatCurrency(value)}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={0}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="4 4"
                  opacity={0.5}
                />
                <Bar dataKey="net" name="Net Amount" radius={[4, 4, 4, 4]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.net >= 0 ? 'url(#netPositiveGradient)' : 'url(#netNegativeGradient)'
                      }
                    />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="glass-card border-success-200/50 bg-gradient-to-br from-success-50/50 to-success-100/50 p-6">
                <h4 className="text-overline mb-2 text-success-700 dark:text-success-300">
                  Average Monthly Income
                </h4>
                <p className="text-currency-lg text-success-800 dark:text-success-200">
                  {formatCurrency(summaryStats.averageMonthlyIncome)}
                </p>
              </div>

              <div className="glass-card border-error-200/50 bg-gradient-to-br from-error-50/50 to-error-100/50 p-6">
                <h4 className="text-overline mb-2 text-error-700 dark:text-error-300">
                  Average Monthly Expenses
                </h4>
                <p className="text-currency-lg text-error-800 dark:text-error-200">
                  {formatCurrency(summaryStats.averageMonthlyExpenses)}
                </p>
              </div>

              <div
                className={cn(
                  'glass-card p-6',
                  summaryStats.averageMonthlyNet >= 0
                    ? 'border-success-200/50 bg-gradient-to-br from-success-50/50 to-success-100/50'
                    : 'border-error-200/50 bg-gradient-to-br from-error-50/50 to-error-100/50'
                )}
              >
                <h4
                  className={cn(
                    'text-overline mb-2',
                    summaryStats.averageMonthlyNet >= 0
                      ? 'text-success-700 dark:text-success-300'
                      : 'text-error-700 dark:text-error-300'
                  )}
                >
                  Average Monthly Net
                </h4>
                <p
                  className={cn(
                    'text-currency-lg',
                    summaryStats.averageMonthlyNet >= 0
                      ? 'text-success-800 dark:text-success-200'
                      : 'text-error-800 dark:text-error-200'
                  )}
                >
                  {formatCurrency(summaryStats.averageMonthlyNet)}
                </p>
              </div>
            </div>

            {summaryStats.bestMonth && summaryStats.worstMonth && (
              <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2">
                <div className="glass-card border-success-200/50 bg-gradient-to-br from-success-50/50 to-success-100/50 p-6">
                  <h4 className="text-overline mb-2 text-success-700 dark:text-success-300">
                    Best Month
                  </h4>
                  <p className="text-display-sm font-bold text-success-800 dark:text-success-200">
                    {summaryStats.bestMonth.monthLabel}
                  </p>
                  <p className="text-body-sm mt-1 text-success-600 dark:text-success-400">
                    Net: {formatCurrency(summaryStats.bestMonth.net)}
                  </p>
                </div>

                <div className="glass-card border-error-200/50 bg-gradient-to-br from-error-50/50 to-error-100/50 p-6">
                  <h4 className="text-overline mb-2 text-error-700 dark:text-error-300">
                    Worst Month
                  </h4>
                  <p className="text-display-sm font-bold text-error-800 dark:text-error-200">
                    {summaryStats.worstMonth.monthLabel}
                  </p>
                  <p className="text-body-sm mt-1 text-error-600 dark:text-error-400">
                    Net: {formatCurrency(summaryStats.worstMonth.net)}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
