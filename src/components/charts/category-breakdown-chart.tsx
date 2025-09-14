'use client'

import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

import { formatCurrency } from '@/lib/utils/currency'
import { useTransactions } from '@/hooks/use-transactions'
import { getIcon } from '@/lib/utils/icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/lib/validations/transaction'

interface CategoryBreakdownChartProps {
  userId: string
  type?: 'all' | 'income' | 'expense'
  dateRange?: {
    from: Date
    to: Date
  }
  className?: string
}

// Premium gradient color palette for categories
const CHART_COLORS = [
  { solid: 'hsl(var(--primary-500))', gradient: 'url(#gradient-primary)' },
  { solid: 'hsl(var(--error-500))', gradient: 'url(#gradient-error)' },
  { solid: 'hsl(var(--success-500))', gradient: 'url(#gradient-success)' },
  { solid: 'hsl(var(--warning-500))', gradient: 'url(#gradient-warning)' },
  { solid: '#8b5cf6', gradient: 'url(#gradient-purple)' },
  { solid: '#06b6d4', gradient: 'url(#gradient-cyan)' },
  { solid: '#84cc16', gradient: 'url(#gradient-lime)' },
  { solid: '#f97316', gradient: 'url(#gradient-orange)' },
  { solid: '#ec4899', gradient: 'url(#gradient-pink)' },
  { solid: '#6366f1', gradient: 'url(#gradient-indigo)' },
  { solid: '#14b8a6', gradient: 'url(#gradient-teal)' },
  { solid: '#f43f5e', gradient: 'url(#gradient-rose)' },
  { solid: '#a855f7', gradient: 'url(#gradient-violet)' },
  { solid: '#22c55e', gradient: 'url(#gradient-green)' },
  { solid: '#eab308', gradient: 'url(#gradient-yellow)' },
]

export function CategoryBreakdownChart({
  userId,
  type = 'all',
  dateRange,
  className,
}: CategoryBreakdownChartProps) {
  const { data: transactionsData, isLoading } = useTransactions(userId, {
    type: type === 'all' ? undefined : type,
    dateFrom: dateRange?.from,
    dateTo: dateRange?.to,
  })

  const { chartData, totalAmount } = useMemo(() => {
    if (!transactionsData?.data) {
      return { chartData: [], totalAmount: 0 }
    }

    const transactions = transactionsData.data

    // Group transactions by category
    const categoryGroups = transactions.reduce(
      (acc, transaction) => {
        const categoryId = transaction.category_id || 'uncategorized'
        const categoryName = transaction.category?.name || 'Uncategorized'
        const categoryColor = transaction.category?.color || '#6b7280'
        const categoryIcon = transaction.category?.icon || 'plus-circle'

        if (!acc[categoryId]) {
          acc[categoryId] = {
            id: categoryId,
            name: categoryName,
            color: categoryColor,
            icon: categoryIcon,
            amount: 0,
            count: 0,
            transactions: [],
          }
        }

        acc[categoryId].amount += Number(transaction.amount)
        acc[categoryId].count += 1
        acc[categoryId].transactions.push(transaction)

        return acc
      },
      {} as Record<
        string,
        {
          id: string
          name: string
          color: string
          icon: string
          amount: number
          count: number
          transactions: Transaction[]
        }
      >
    )

    const data = Object.values(categoryGroups)
      .sort((a, b) => b.amount - a.amount)
      .map((category, index) => ({
        ...category,
        chartColor: CHART_COLORS[index % CHART_COLORS.length].solid,
        chartGradient: CHART_COLORS[index % CHART_COLORS.length].gradient,
        percentage: 0, // Will be calculated below
      }))

    const total = data.reduce((sum, item) => sum + item.amount, 0)

    // Calculate percentages
    data.forEach(item => {
      item.percentage = total > 0 ? (item.amount / total) * 100 : 0
    })

    return { chartData: data, totalAmount: total }
  }, [transactionsData?.data])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload

      return (
        <div className="glass-card border-premium max-w-xs animate-fade-in p-4">
          <div className="mb-3 flex items-center gap-3">
            <div
              className="h-4 w-4 rounded-full shadow-sm"
              style={{ backgroundColor: data.chartColor }}
            />
            <h4 className="text-display-sm font-semibold text-foreground">{data.name}</h4>
          </div>
          <div className="text-body-sm space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium text-muted-foreground">Amount:</span>
              <span className="text-currency-sm font-bold">{formatCurrency(data.amount)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium text-muted-foreground">Transactions:</span>
              <span className="font-semibold">{data.count}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border/50 pt-2">
              <span className="font-medium text-muted-foreground">Percentage:</span>
              <span className="text-primary-600 dark:text-primary-400 font-bold">
                {data.percentage.toFixed(1)}%
              </span>
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
          <CardTitle className="text-display-md">Category Breakdown</CardTitle>
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
          <CardTitle className="text-display-md">Category Breakdown</CardTitle>
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
                  Add some transactions to see category breakdown
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
      <CardHeader className="space-y-3">
        <CardTitle className="text-display-md flex items-center justify-between">
          Category Breakdown
          <Badge
            variant="outline"
            className="from-primary-50 to-primary-100 text-primary-700 border-primary-200 bg-gradient-to-r"
          >
            Total: {formatCurrency(totalAmount)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pie" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pie">Pie Chart</TabsTrigger>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          </TabsList>

          <TabsContent value="pie" className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* Pie Chart */}
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <defs>
                      <linearGradient id="gradient-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--primary-400))" />
                        <stop offset="100%" stopColor="hsl(var(--primary-600))" />
                      </linearGradient>
                      <linearGradient id="gradient-error" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--error-400))" />
                        <stop offset="100%" stopColor="hsl(var(--error-600))" />
                      </linearGradient>
                      <linearGradient id="gradient-success" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--success-400))" />
                        <stop offset="100%" stopColor="hsl(var(--success-600))" />
                      </linearGradient>
                      <linearGradient id="gradient-warning" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--warning-400))" />
                        <stop offset="100%" stopColor="hsl(var(--warning-600))" />
                      </linearGradient>
                      <linearGradient id="gradient-purple" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                      <linearGradient id="gradient-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#0891b2" />
                      </linearGradient>
                      <linearGradient id="gradient-lime" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a3e635" />
                        <stop offset="100%" stopColor="#65a30d" />
                      </linearGradient>
                      <linearGradient id="gradient-orange" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#ea580c" />
                      </linearGradient>
                      <linearGradient id="gradient-pink" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f472b6" />
                        <stop offset="100%" stopColor="#db2777" />
                      </linearGradient>
                      <linearGradient id="gradient-indigo" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                      <linearGradient id="gradient-teal" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#2dd4bf" />
                        <stop offset="100%" stopColor="#0f766e" />
                      </linearGradient>
                      <linearGradient id="gradient-rose" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fb7185" />
                        <stop offset="100%" stopColor="#e11d48" />
                      </linearGradient>
                      <linearGradient id="gradient-violet" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#c084fc" />
                        <stop offset="100%" stopColor="#9333ea" />
                      </linearGradient>
                      <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4ade80" />
                        <stop offset="100%" stopColor="#16a34a" />
                      </linearGradient>
                      <linearGradient id="gradient-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#facc15" />
                        <stop offset="100%" stopColor="#ca8a04" />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={125}
                      paddingAngle={3}
                      dataKey="amount"
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.chartGradient}
                          stroke="white"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="space-y-2 lg:w-1/3">
                <h4 className="text-overline mb-4 text-muted-foreground">Categories</h4>
                <div className="custom-scrollbar max-h-[250px] space-y-3 overflow-y-auto">
                  {chartData.map(item => {
                    const IconComponent = getIcon(item.icon)

                    return (
                      <div
                        key={item.id}
                        className="text-body-sm flex items-center justify-between rounded-lg bg-muted/30 p-2 transition-colors duration-200 hover:bg-muted/50"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div
                            className="h-4 w-4 flex-shrink-0 rounded-full shadow-sm"
                            style={{ backgroundColor: item.chartColor }}
                          />
                          <div
                            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full shadow-sm"
                            style={{ backgroundColor: item.color }}
                          >
                            <IconComponent className="h-3 w-3 text-white" />
                          </div>
                          <span className="truncate font-medium text-foreground">{item.name}</span>
                        </div>
                        <div className="ml-2 text-right">
                          <div className="text-currency-sm font-semibold">
                            {formatCurrency(item.amount)}
                          </div>
                          <div className="text-caption text-muted-foreground">
                            {item.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bar" className="space-y-4">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 80,
                }}
              >
                <defs>
                  {/* Reuse gradient definitions */}
                  <linearGradient id="bar-gradient-primary" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary-400))" />
                    <stop offset="100%" stopColor="hsl(var(--primary-600))" />
                  </linearGradient>
                  <linearGradient id="bar-gradient-error" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--error-400))" />
                    <stop offset="100%" stopColor="hsl(var(--error-600))" />
                  </linearGradient>
                  <linearGradient id="bar-gradient-success" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--success-400))" />
                    <stop offset="100%" stopColor="hsl(var(--success-600))" />
                  </linearGradient>
                  <linearGradient id="bar-gradient-warning" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--warning-400))" />
                    <stop offset="100%" stopColor="hsl(var(--warning-600))" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
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
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.chartGradient} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
