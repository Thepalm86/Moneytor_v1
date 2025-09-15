'use client'

import React, { useState, useMemo, useCallback } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
  Area,
  ComposedChart,
  Bar,
} from 'recharts'
import { format, subDays, eachDayOfInterval, startOfDay } from 'date-fns'
import { Download, RotateCcw, TrendingUp, Calendar, BarChart3 } from 'lucide-react'
import { useCurrency } from '@/contexts/currency-context'
import { useTransactions } from '@/hooks/use-transactions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { MobileChartWrapper, MobileChartTooltip, mobileChartConfig } from './mobile-chart-wrapper'
import { useProgressiveLoading, PerformanceMonitor } from '@/lib/utils/performance'
import { ChartSkeleton, ProgressiveSkeleton } from '@/components/ui/enhanced-skeleton'

interface InteractiveSpendingTrendsChartProps {
  userId: string
  dateRange?: {
    from: Date
    to: Date
  }
  className?: string
}

interface ChartDataPoint {
  date: Date
  dateLabel: string
  dateKey: string
  income: number
  expenses: number
  net: number
  cumulativeIncome: number
  cumulativeExpenses: number
  cumulativeNet: number
  transactionCount: number
  averageTransaction: number
}

type ChartMode = 'daily' | 'cumulative' | 'comparison'
type ZoomLevel = 'all' | '30d' | '7d'

const InteractiveSpendingTrendsChartComponent = React.memo(function InteractiveSpendingTrendsChart({
  userId,
  dateRange,
  className,
}: InteractiveSpendingTrendsChartProps) {
  const { formatCurrency } = useCurrency()
  const [chartMode, setChartMode] = useState<ChartMode>('daily')
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('all')
  const [selectedDataPoint, setSelectedDataPoint] = useState<ChartDataPoint | null>(null)
  const [brushDomain, setBrushDomain] = useState<[number, number] | null>(null)

  // Progressive loading for better mobile experience
  const progressiveStage = useProgressiveLoading(3, 300)

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
          acc[dateKey] = { income: 0, expenses: 0, transactions: [] }
        }

        if (transaction.type === 'income') {
          acc[dateKey].income += Number(transaction.amount)
        } else {
          acc[dateKey].expenses += Number(transaction.amount)
        }

        acc[dateKey].transactions.push(transaction)

        return acc
      },
      {} as Record<string, { income: number; expenses: number; transactions: unknown[] }>
    )

    // Create chart data for each day
    const dailyData = days.map(day => {
      const dayKey = day.toISOString()
      const dayData = transactionsByDate[dayKey] || { income: 0, expenses: 0, transactions: [] }

      return {
        date: day,
        dateLabel: format(day, 'MMM dd'),
        dateKey: dayKey,
        income: dayData.income,
        expenses: dayData.expenses,
        net: dayData.income - dayData.expenses,
        transactionCount: dayData.transactions.length,
        averageTransaction:
          dayData.transactions.length > 0
            ? (dayData.income + dayData.expenses) / dayData.transactions.length
            : 0,
        cumulativeIncome: 0, // Will be calculated next
        cumulativeExpenses: 0,
        cumulativeNet: 0,
      }
    })

    // Calculate cumulative values
    let cumulativeIncome = 0
    let cumulativeExpenses = 0

    return dailyData.map(item => {
      cumulativeIncome += item.income
      cumulativeExpenses += item.expenses

      return {
        ...item,
        cumulativeIncome,
        cumulativeExpenses,
        cumulativeNet: cumulativeIncome - cumulativeExpenses,
      }
    })
  }, [transactionsData?.data, finalDateRange])

  // CSV download function
  const downloadCSV = useCallback(() => {
    if (!chartData || chartData.length === 0) return

    const headers = [
      'Date',
      'Income',
      'Expenses',
      'Net',
      'Cumulative Income',
      'Cumulative Expenses',
      'Cumulative Net',
    ]
    const csvContent = [
      headers.join(','),
      ...chartData.map(row =>
        [
          row.dateLabel,
          row.income.toString(),
          row.expenses.toString(),
          row.net.toString(),
          row.cumulativeIncome.toString(),
          row.cumulativeExpenses.toString(),
          row.cumulativeNet.toString(),
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `spending-trends-${format(finalDateRange.from, 'yyyy-MM-dd')}-to-${format(finalDateRange.to, 'yyyy-MM-dd')}.csv`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [chartData, finalDateRange])

  // Performance monitoring
  React.useEffect(() => {
    PerformanceMonitor.startTiming('chart-render')
    return () => {
      PerformanceMonitor.endTiming('chart-render')
    }
  }, [chartData])

  // Filter data based on zoom level and brush selection
  const displayData = useMemo(() => {
    if (!chartData.length) return []

    let filteredData = chartData

    // Apply zoom level filter
    if (zoomLevel === '30d') {
      filteredData = chartData.slice(-30)
    } else if (zoomLevel === '7d') {
      filteredData = chartData.slice(-7)
    }

    // Apply brush selection if available
    if (brushDomain && brushDomain[0] !== brushDomain[1]) {
      const startIndex = Math.max(0, Math.floor(brushDomain[0]))
      const endIndex = Math.min(filteredData.length - 1, Math.ceil(brushDomain[1]))
      filteredData = filteredData.slice(startIndex, endIndex + 1)
    }

    return filteredData
  }, [chartData, zoomLevel, brushDomain])

  const handleDataPointClick = useCallback(
    (data: { activePayload?: Array<{ payload: ChartDataPoint }> }) => {
      if (data && data.activePayload && data.activePayload[0]) {
        setSelectedDataPoint(data.activePayload[0].payload)
      }
    },
    []
  )

  const handleBrushChange = useCallback((domain: { startIndex?: number; endIndex?: number }) => {
    if (domain && domain.startIndex !== undefined && domain.endIndex !== undefined) {
      setBrushDomain([domain.startIndex, domain.endIndex])
    }
  }, [])

  const resetZoom = useCallback(() => {
    setZoomLevel('all')
    setBrushDomain(null)
  }, [])

  const exportChart = useCallback(() => {
    // Create CSV data
    const csvData = displayData.map(point => ({
      date: format(point.date, 'yyyy-MM-dd'),
      income: point.income,
      expenses: point.expenses,
      net: point.net,
      cumulativeIncome: point.cumulativeIncome,
      cumulativeExpenses: point.cumulativeExpenses,
      cumulativeNet: point.cumulativeNet,
      transactionCount: point.transactionCount,
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spending-trends-${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [displayData])

  const InteractiveTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: { payload: ChartDataPoint }[]
    label?: string
  }) => {
    if (active && payload && payload.length && label) {
      const data = payload[0].payload as ChartDataPoint

      return (
        <div
          className="glass-card border-premium max-w-sm animate-fade-in cursor-pointer p-4"
          onClick={() => setSelectedDataPoint(data)}
        >
          <div className="space-y-3">
            <h4 className="text-display-sm font-semibold text-foreground">
              {format(data.date, 'EEEE, MMM dd, yyyy')}
            </h4>

            <div className="text-body-sm grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success-500"></div>
                    <span className="text-success-700 dark:text-success-300">Income:</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(data.income)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-error-500"></div>
                    <span className="text-error-700 dark:text-error-300">Expenses:</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(data.expenses)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border/50 pt-2">
                  <span className="text-primary-700 dark:text-primary-300 font-medium">Net:</span>
                  <span
                    className={cn(
                      'font-bold',
                      data.net >= 0
                        ? 'text-success-600 dark:text-success-400'
                        : 'text-error-600 dark:text-error-400'
                    )}
                  >
                    {formatCurrency(data.net)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Transactions:</span>
                  <span className="font-medium">{data.transactionCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Average:</span>
                  <span className="font-medium">{formatCurrency(data.averageTransaction)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border/50 pt-2">
                  <span className="text-muted-foreground">Cumulative:</span>
                  <span
                    className={cn(
                      'font-medium',
                      data.cumulativeNet >= 0 ? 'text-success-600' : 'text-error-600'
                    )}
                  >
                    {formatCurrency(data.cumulativeNet)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-border/30 pt-2 text-xs text-muted-foreground">
              Click to view detailed breakdown for this day
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  // Progressive loading states
  if (isLoading) {
    return (
      <>
        {/* Mobile progressive loading */}
        <div className="block lg:hidden">
          <ProgressiveSkeleton stage={progressiveStage} maxStages={3} />
        </div>

        {/* Desktop progressive loading */}
        <div className="hidden lg:block">
          <ChartSkeleton className={className} />
        </div>
      </>
    )
  }

  if (displayData.length === 0) {
    return (
      <Card className={cn('glass-card border-premium', className)}>
        <CardHeader>
          <CardTitle className="text-display-md">Interactive Spending Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[450px] items-center justify-center">
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/50">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-body-md font-medium text-foreground">
                  No transaction data available
                </p>
                <p className="text-body-sm text-muted-foreground">
                  Add some transactions to see your interactive spending trends
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Mobile optimized tooltip
  const MobileTooltipContent = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: Array<{ value: number; name: string }>
    label?: string
  }) => (
    <MobileChartTooltip
      active={active}
      payload={payload}
      label={label}
      formatter={(value: string | number, name: string) => [formatCurrency(Number(value)), name]}
      labelFormatter={(label: string) => format(new Date(label), 'MMM dd, yyyy')}
    />
  )

  // Desktop version
  const DesktopChart = () => (
    <div className={cn('space-y-4', className)}>
      <Card className="glass-card border-premium interactive-card">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-display-md">Interactive Spending Trends</CardTitle>
              <p className="text-body-sm mt-1 text-muted-foreground">
                {format(finalDateRange.from, 'MMM dd, yyyy')} -{' '}
                {format(finalDateRange.to, 'MMM dd, yyyy')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Select value={zoomLevel} onValueChange={(value: ZoomLevel) => setZoomLevel(value)}>
                <SelectTrigger className="h-8 w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Data</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={resetZoom}
                disabled={zoomLevel === 'all' && !brushDomain}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <Button variant="outline" size="sm" onClick={exportChart}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs
            value={chartMode}
            onValueChange={(value: string) => setChartMode(value as ChartMode)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Daily View
              </TabsTrigger>
              <TabsTrigger value="cumulative" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Cumulative
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Comparison
              </TabsTrigger>
            </TabsList>

            <TabsContent value="daily">
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart
                  data={displayData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  onClick={handleDataPointClick}
                >
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success-500))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--success-500))" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--error-500))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--error-500))" stopOpacity={0.1} />
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
                    tickFormatter={value => formatCurrency(value)}
                    dx={-10}
                  />
                  <Tooltip content={<InteractiveTooltip />} />

                  <Bar
                    dataKey="income"
                    fill="url(#incomeGradient)"
                    radius={[2, 2, 0, 0]}
                    name="Daily Income"
                  />
                  <Bar
                    dataKey="expenses"
                    fill="url(#expenseGradient)"
                    radius={[2, 2, 0, 0]}
                    name="Daily Expenses"
                  />
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="hsl(var(--primary-500))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary-500))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--primary-500))', strokeWidth: 2 }}
                    name="Daily Net"
                  />

                  <ReferenceLine
                    y={0}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="2 2"
                  />

                  <Brush
                    dataKey="dateLabel"
                    height={30}
                    stroke="hsl(var(--primary-500))"
                    onChange={handleBrushChange}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="cumulative">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={displayData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  onClick={handleDataPointClick}
                >
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
                    tickFormatter={value => formatCurrency(value)}
                    dx={-10}
                  />
                  <Tooltip content={<InteractiveTooltip />} />

                  <Line
                    type="monotone"
                    dataKey="cumulativeIncome"
                    stroke="hsl(var(--success-500))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--success-500))', strokeWidth: 2, r: 4 }}
                    name="Cumulative Income"
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulativeExpenses"
                    stroke="hsl(var(--error-500))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--error-500))', strokeWidth: 2, r: 4 }}
                    name="Cumulative Expenses"
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulativeNet"
                    stroke="hsl(var(--primary-500))"
                    strokeWidth={4}
                    dot={{ fill: 'hsl(var(--primary-500))', strokeWidth: 2, r: 5 }}
                    name="Cumulative Net"
                  />

                  <ReferenceLine
                    y={0}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="2 2"
                  />

                  <Brush
                    dataKey="dateLabel"
                    height={30}
                    stroke="hsl(var(--primary-500))"
                    onChange={handleBrushChange}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="comparison">
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart
                  data={displayData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  onClick={handleDataPointClick}
                >
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
                    tickFormatter={value => formatCurrency(value)}
                    dx={-10}
                  />
                  <Tooltip content={<InteractiveTooltip />} />

                  <Area
                    type="monotone"
                    dataKey="income"
                    stackId="1"
                    stroke="hsl(var(--success-500))"
                    fill="hsl(var(--success-500))"
                    fillOpacity={0.6}
                    name="Income"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stackId="2"
                    stroke="hsl(var(--error-500))"
                    fill="hsl(var(--error-500))"
                    fillOpacity={0.6}
                    name="Expenses"
                  />

                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="hsl(var(--primary-500))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary-500))', strokeWidth: 2, r: 4 }}
                    name="Net Flow"
                  />

                  <ReferenceLine
                    y={0}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="2 2"
                  />

                  <Brush
                    dataKey="dateLabel"
                    height={30}
                    stroke="hsl(var(--primary-500))"
                    onChange={handleBrushChange}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Selected Data Point Details */}
      {selectedDataPoint && (
        <Card className="glass-card border-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Detailed Breakdown - {format(selectedDataPoint.date, 'EEEE, MMMM dd, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="space-y-1 text-center">
                <p className="text-sm text-muted-foreground">Income</p>
                <p className="text-xl font-bold text-success-600">
                  {formatCurrency(selectedDataPoint.income)}
                </p>
              </div>
              <div className="space-y-1 text-center">
                <p className="text-sm text-muted-foreground">Expenses</p>
                <p className="text-xl font-bold text-error-600">
                  {formatCurrency(selectedDataPoint.expenses)}
                </p>
              </div>
              <div className="space-y-1 text-center">
                <p className="text-sm text-muted-foreground">Net Flow</p>
                <p
                  className={cn(
                    'text-xl font-bold',
                    selectedDataPoint.net >= 0 ? 'text-success-600' : 'text-error-600'
                  )}
                >
                  {formatCurrency(selectedDataPoint.net)}
                </p>
              </div>
              <div className="space-y-1 text-center">
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-xl font-bold text-foreground">
                  {selectedDataPoint.transactionCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  // Mobile optimized version
  const MobileChart = () => (
    <div className={cn('space-y-4', className)}>
      <MobileChartWrapper
        title="Spending Trends"
        subtitle={`${format(finalDateRange.from, 'MMM dd')} - ${format(finalDateRange.to, 'MMM dd')}`}
        height={280}
        expandable
        downloadable
        onDownload={downloadCSV}
        loading={isLoading}
      >
        <ComposedChart data={displayData} margin={mobileChartConfig.margin}>
          <defs>
            <linearGradient id="mobileIncomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={mobileChartConfig.colors.secondary} stopOpacity={0.8} />
              <stop offset="95%" stopColor={mobileChartConfig.colors.secondary} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="mobileExpenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={mobileChartConfig.colors.danger} stopOpacity={0.8} />
              <stop offset="95%" stopColor={mobileChartConfig.colors.danger} stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke={mobileChartConfig.colors.muted}
            opacity={0.3}
          />
          <XAxis
            dataKey="dateLabel"
            {...mobileChartConfig.tickConfig}
            tick={{ fill: mobileChartConfig.colors.muted }}
          />
          <YAxis
            {...mobileChartConfig.tickConfig}
            tick={{ fill: mobileChartConfig.colors.muted }}
            tickFormatter={value => formatCurrency(value)}
            width={60}
          />
          <Tooltip content={<MobileTooltipContent />} />

          {/* Mobile optimized bars and lines */}
          <Bar
            dataKey="income"
            fill="url(#mobileIncomeGradient)"
            radius={[2, 2, 0, 0]}
            name="Income"
          />
          <Bar
            dataKey="expenses"
            fill="url(#mobileExpenseGradient)"
            radius={[2, 2, 0, 0]}
            name="Expenses"
          />
          <Line
            type="monotone"
            dataKey="net"
            stroke={mobileChartConfig.colors.primary}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: mobileChartConfig.colors.primary }}
            name="Net"
          />

          <ReferenceLine y={0} stroke={mobileChartConfig.colors.muted} strokeDasharray="2 2" />
        </ComposedChart>
      </MobileChartWrapper>

      {/* Mobile chart mode selector */}
      <div className="flex justify-center">
        <div className="flex rounded-lg bg-gray-100 p-1">
          {(['daily', 'cumulative', 'comparison'] as ChartMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setChartMode(mode)}
              className={cn(
                'rounded-md px-4 py-2 text-sm font-medium transition-all',
                chartMode === mode
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile cumulative view */}
      {chartMode === 'cumulative' && (
        <MobileChartWrapper
          title="Cumulative Trends"
          subtitle="Running totals over time"
          height={240}
        >
          <LineChart data={displayData} margin={mobileChartConfig.margin}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={mobileChartConfig.colors.muted}
              opacity={0.3}
            />
            <XAxis
              dataKey="dateLabel"
              {...mobileChartConfig.tickConfig}
              tick={{ fill: mobileChartConfig.colors.muted }}
            />
            <YAxis
              {...mobileChartConfig.tickConfig}
              tick={{ fill: mobileChartConfig.colors.muted }}
              tickFormatter={value => formatCurrency(value)}
              width={60}
            />
            <Tooltip content={<MobileTooltipContent />} />

            <Line
              type="monotone"
              dataKey="cumulativeIncome"
              stroke={mobileChartConfig.colors.secondary}
              strokeWidth={2}
              dot={false}
              name="Cumulative Income"
            />
            <Line
              type="monotone"
              dataKey="cumulativeExpenses"
              stroke={mobileChartConfig.colors.danger}
              strokeWidth={2}
              dot={false}
              name="Cumulative Expenses"
            />
            <Line
              type="monotone"
              dataKey="cumulativeNet"
              stroke={mobileChartConfig.colors.primary}
              strokeWidth={3}
              dot={false}
              name="Cumulative Net"
            />
          </LineChart>
        </MobileChartWrapper>
      )}
    </div>
  )

  // Return responsive version
  return (
    <>
      {/* Mobile version */}
      <div className="block lg:hidden">
        <MobileChart />
      </div>

      {/* Desktop version */}
      <div className="hidden lg:block">
        <DesktopChart />
      </div>
    </>
  )
})

export { InteractiveSpendingTrendsChartComponent as InteractiveSpendingTrendsChart }
