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
  Line,
  LineChart
} from 'recharts'
import { format, subMonths, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns'

import { formatCurrency } from '@/lib/utils/currency'
import { useTransactions } from '@/hooks/use-transactions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Transaction } from '@/lib/validations/transaction'

interface MonthlyOverviewChartProps {
  userId: string
  monthsCount?: number
  className?: string
}

export function MonthlyOverviewChart({ 
  userId, 
  monthsCount = 12,
  className 
}: MonthlyOverviewChartProps) {
  const dateRange = useMemo(() => ({
    from: subMonths(startOfMonth(new Date()), monthsCount - 1),
    to: endOfMonth(new Date())
  }), [monthsCount])

  const { data: transactionsData, isLoading } = useTransactions(
    userId,
    {
      dateFrom: dateRange.from,
      dateTo: dateRange.to,
    }
  )

  const chartData = useMemo(() => {
    if (!transactionsData?.data) return []

    const transactions = transactionsData.data

    // Generate all months in the range
    const months = eachMonthOfInterval({
      start: dateRange.from,
      end: dateRange.to
    })

    // Group transactions by month
    const transactionsByMonth = transactions.reduce((acc, transaction) => {
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
    }, {} as Record<string, { income: number; expenses: number; transactions: Transaction[] }>)

    // Create chart data for each month
    return months.map(month => {
      const monthKey = format(month, 'yyyy-MM')
      const monthData = transactionsByMonth[monthKey] || { income: 0, expenses: 0, transactions: [] }
      
      return {
        month,
        monthLabel: format(month, 'MMM yyyy'),
        monthShort: format(month, 'MMM'),
        income: monthData.income,
        expenses: monthData.expenses,
        net: monthData.income - monthData.expenses,
        transactionCount: monthData.transactions.length,
        averageTransaction: monthData.transactions.length > 0 
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <h4 className="font-medium text-gray-900 mb-2">{data.monthLabel}</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center gap-4">
              <span className="text-green-600">Income:</span>
              <span className="font-medium">{formatCurrency(data.income)}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-red-600">Expenses:</span>
              <span className="font-medium">{formatCurrency(data.expenses)}</span>
            </div>
            <div className="flex justify-between items-center gap-4 pt-1 border-t">
              <span className="text-blue-600">Net:</span>
              <span className={`font-medium ${data.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.net)}
              </span>
            </div>
            <div className="flex justify-between items-center gap-4 text-gray-500">
              <span>Transactions:</span>
              <span>{data.transactionCount}</span>
            </div>
          </div>
        </div>
      )
    }
    
    return null
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Loading chart data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-2">No transaction data available</p>
              <p className="text-sm text-gray-500">
                Add some transactions to see monthly overview
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Monthly Overview</CardTitle>
        <p className="text-sm text-gray-600">
          Last {monthsCount} months • Total Net: {formatCurrency(summaryStats.totalNet)}
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
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="monthShort"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="income" 
                  fill="#10b981"
                  name="Income"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="expenses" 
                  fill="#ef4444"
                  name="Expenses"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="net" className="space-y-4">
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="monthShort"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="2 2" />
                <Bar 
                  dataKey="net" 
                  name="Net Amount"
                  radius={[2, 2, 2, 2]}
                >
                  {chartData.map((entry, index) => (
                    <Bar 
                      key={`bar-${index}`}
                      fill={entry.net >= 0 ? '#10b981' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-1">Average Monthly Income</h4>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(summaryStats.averageMonthlyIncome)}
                </p>
              </div>
              
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-900 mb-1">Average Monthly Expenses</h4>
                <p className="text-2xl font-bold text-red-700">
                  {formatCurrency(summaryStats.averageMonthlyExpenses)}
                </p>
              </div>
              
              <div className={`p-4 rounded-lg border ${
                summaryStats.averageMonthlyNet >= 0 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <h4 className={`font-medium mb-1 ${
                  summaryStats.averageMonthlyNet >= 0 ? 'text-green-900' : 'text-red-900'
                }`}>
                  Average Monthly Net
                </h4>
                <p className={`text-2xl font-bold ${
                  summaryStats.averageMonthlyNet >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {formatCurrency(summaryStats.averageMonthlyNet)}
                </p>
              </div>
            </div>
            
            {summaryStats.bestMonth && summaryStats.worstMonth && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-1">Best Month</h4>
                  <p className="text-lg font-bold text-green-700">
                    {summaryStats.bestMonth.monthLabel}
                  </p>
                  <p className="text-sm text-green-600">
                    Net: {formatCurrency(summaryStats.bestMonth.net)}
                  </p>
                </div>
                
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-900 mb-1">Worst Month</h4>
                  <p className="text-lg font-bold text-red-700">
                    {summaryStats.worstMonth.monthLabel}
                  </p>
                  <p className="text-sm text-red-600">
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