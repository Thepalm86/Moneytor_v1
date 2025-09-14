'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { format, subDays, eachDayOfInterval, startOfDay } from 'date-fns'

import { useCurrency } from '@/contexts/currency-context'
import { useTransactions } from '@/hooks/use-transactions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SpendingTrendsChartProps {
  userId: string
  dateRange?: {
    from: Date
    to: Date
  }
  className?: string
}

export function SpendingTrendsChart({ userId, dateRange, className }: SpendingTrendsChartProps) {
  const { formatCurrency } = useCurrency()
  
  // Default to last 30 days if no date range provided
  const defaultDateRange = useMemo(
    () => ({
      from: subDays(new Date(), 29),
      to: new Date(),
    }),
    []
  )

  const finalDateRange = dateRange || defaultDateRange

  const { data: transactionsData, isLoading } = useTransactions(userId, {
    dateFrom: finalDateRange.from,
    dateTo: finalDateRange.to,
  })

  const chartData = useMemo(() => {
    if (!transactionsData?.data) return []

    const transactions = transactionsData.data

    // Generate all days in the range
    const days = eachDayOfInterval({
      start: startOfDay(finalDateRange.from),
      end: startOfDay(finalDateRange.to),
    })

    // Group transactions by date
    const transactionsByDate = transactions.reduce(
      (acc, transaction) => {
        const transactionDate = startOfDay(new Date(transaction.date))
        const dateKey = transactionDate.toISOString()

        if (!acc[dateKey]) {
          acc[dateKey] = { income: 0, expenses: 0 }
        }

        if (transaction.type === 'income') {
          acc[dateKey].income += Number(transaction.amount)
        } else {
          acc[dateKey].expenses += Number(transaction.amount)
        }

        return acc
      },
      {} as Record<string, { income: number; expenses: number }>
    )

    // Create chart data for each day
    return days.map(day => {
      const dayKey = day.toISOString()
      const dayData = transactionsByDate[dayKey] || { income: 0, expenses: 0 }

      return {
        date: day,
        dateLabel: format(day, 'MMM dd'),
        income: dayData.income,
        expenses: dayData.expenses,
        net: dayData.income - dayData.expenses,
        // Cumulative values
        cumulativeIncome: 0, // Will be calculated in the next step
        cumulativeExpenses: 0,
        cumulativeNet: 0,
      }
    })
  }, [transactionsData?.data, finalDateRange])

  // Calculate cumulative values
  const chartDataWithCumulative = useMemo(() => {
    let cumulativeIncome = 0
    let cumulativeExpenses = 0

    return chartData.map(item => {
      cumulativeIncome += item.income
      cumulativeExpenses += item.expenses

      return {
        ...item,
        cumulativeIncome,
        cumulativeExpenses,
        cumulativeNet: cumulativeIncome - cumulativeExpenses,
      }
    })
  }, [chartData])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload

      return (
        <div className="glass-card border-premium max-w-xs animate-fade-in p-4">
          <h4 className="text-display-sm mb-3 font-semibold text-foreground">
            {format(data.date, 'EEEE, MMM dd, yyyy')}
          </h4>
          <div className="text-body-sm space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-success-400 to-success-600"></div>
                <span className="font-medium text-success-700 dark:text-success-300">Income:</span>
              </div>
              <span className="text-currency-sm font-semibold">{formatCurrency(data.income, { decimals: 0 })}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-error-400 to-error-600"></div>
                <span className="font-medium text-error-700 dark:text-error-300">Expenses:</span>
              </div>
              <span className="text-currency-sm font-semibold">
                {formatCurrency(data.expenses, { decimals: 0 })}
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
                {formatCurrency(data.net, { decimals: 0 })}
              </span>
            </div>
            <div className="border-t border-border/30 pt-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-caption font-medium text-muted-foreground">
                  Cumulative Net:
                </span>
                <span
                  className={`text-currency-sm font-bold ${data.cumulativeNet >= 0 ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}
                >
                  {formatCurrency(data.cumulativeNet, { decimals: 0 })}
                </span>
              </div>
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
          <CardTitle className="text-display-md">Spending Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[350px] items-center justify-center">
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

  if (chartDataWithCumulative.length === 0) {
    return (
      <Card className={cn('glass-card border-premium', className)}>
        <CardHeader>
          <CardTitle className="text-display-md">Spending Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[350px] items-center justify-center">
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/50">
                <div className="from-primary-400 to-primary-600 h-8 w-8 rounded-full bg-gradient-to-br opacity-60"></div>
              </div>
              <div className="space-y-1">
                <p className="text-body-md font-medium text-foreground">
                  No transaction data available
                </p>
                <p className="text-body-sm text-muted-foreground">
                  Add some transactions to see your spending trends
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
        <CardTitle className="text-display-md">Spending Trends</CardTitle>
        <p className="text-body-sm text-muted-foreground">
          {format(finalDateRange.from, 'MMM dd, yyyy')} -{' '}
          {format(finalDateRange.to, 'MMM dd, yyyy')}
        </p>
      </CardHeader>
      <CardContent>
        {/* Chart Legend */}
        <div className="mb-4 flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-success-600 to-success-400"></div>
            <span className="font-medium text-success-700 dark:text-success-300">Cumulative Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-error-600 to-error-400"></div>
            <span className="font-medium text-error-700 dark:text-error-300">Cumulative Expenses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-primary-600 to-primary-400"></div>
            <span className="font-medium text-primary-700 dark:text-primary-300">Cumulative Net</span>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={chartDataWithCumulative}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <defs>
              <linearGradient id="incomeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--success-600))" />
                <stop offset="100%" stopColor="hsl(var(--success-400))" />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--error-600))" />
                <stop offset="100%" stopColor="hsl(var(--error-400))" />
              </linearGradient>
              <linearGradient id="netGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary-600))" />
                <stop offset="50%" stopColor="hsl(var(--primary-500))" />
                <stop offset="100%" stopColor="hsl(var(--primary-400))" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="dateLabel"
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
              tickFormatter={value => formatCurrency(value, { decimals: 0 })}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={0}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="4 4"
              opacity={0.5}
            />

            <Line
              type="monotone"
              dataKey="cumulativeIncome"
              stroke="url(#incomeGradient)"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--success-500))', strokeWidth: 2, r: 4 }}
              activeDot={{
                r: 6,
                stroke: 'hsl(var(--success-500))',
                strokeWidth: 3,
                fill: 'hsl(var(--success-400))',
              }}
              name="Cumulative Income"
            />
            <Line
              type="monotone"
              dataKey="cumulativeExpenses"
              stroke="url(#expenseGradient)"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--error-500))', strokeWidth: 2, r: 4 }}
              activeDot={{
                r: 6,
                stroke: 'hsl(var(--error-500))',
                strokeWidth: 3,
                fill: 'hsl(var(--error-400))',
              }}
              name="Cumulative Expenses"
            />
            <Line
              type="monotone"
              dataKey="cumulativeNet"
              stroke="url(#netGradient)"
              strokeWidth={4}
              dot={{ fill: 'hsl(var(--primary-500))', strokeWidth: 2, r: 5 }}
              activeDot={{
                r: 8,
                stroke: 'hsl(var(--primary-500))',
                strokeWidth: 3,
                fill: 'hsl(var(--primary-400))',
              }}
              name="Cumulative Net"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
