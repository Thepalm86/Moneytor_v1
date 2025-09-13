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
  ReferenceLine
} from 'recharts'
import { format, subDays, eachDayOfInterval, startOfDay, isEqual } from 'date-fns'

import { formatCurrency } from '@/lib/utils/currency'
import { useTransactions } from '@/hooks/use-transactions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Transaction } from '@/lib/validations/transaction'

interface SpendingTrendsChartProps {
  userId: string
  dateRange?: {
    from: Date
    to: Date
  }
  className?: string
}

export function SpendingTrendsChart({ 
  userId, 
  dateRange, 
  className 
}: SpendingTrendsChartProps) {
  // Default to last 30 days if no date range provided
  const defaultDateRange = useMemo(() => ({
    from: subDays(new Date(), 29),
    to: new Date()
  }), [])

  const finalDateRange = dateRange || defaultDateRange

  const { data: transactionsData, isLoading } = useTransactions(
    userId,
    {
      dateFrom: finalDateRange.from,
      dateTo: finalDateRange.to,
    }
  )

  const chartData = useMemo(() => {
    if (!transactionsData?.data) return []

    const transactions = transactionsData.data

    // Generate all days in the range
    const days = eachDayOfInterval({
      start: startOfDay(finalDateRange.from),
      end: startOfDay(finalDateRange.to)
    })

    // Group transactions by date
    const transactionsByDate = transactions.reduce((acc, transaction) => {
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
    }, {} as Record<string, { income: number; expenses: number }>)

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            {format(data.date, 'EEEE, MMM dd, yyyy')}
          </h4>
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
            <div className="pt-2 border-t text-xs text-gray-500">
              <div className="flex justify-between items-center gap-4">
                <span>Cumulative Net:</span>
                <span className={`font-medium ${data.cumulativeNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(data.cumulativeNet)}
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
      <Card className={className}>
        <CardHeader>
          <CardTitle>Spending Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Loading chart data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (chartDataWithCumulative.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Spending Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-2">No transaction data available</p>
              <p className="text-sm text-gray-500">
                Add some transactions to see your spending trends
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
        <CardTitle>Spending Trends</CardTitle>
        <p className="text-sm text-gray-600">
          {format(finalDateRange.from, 'MMM dd, yyyy')} - {format(finalDateRange.to, 'MMM dd, yyyy')}
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={chartDataWithCumulative}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="dateLabel"
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
            
            <Line
              type="monotone"
              dataKey="cumulativeIncome"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2 }}
              name="Cumulative Income"
            />
            <Line
              type="monotone"
              dataKey="cumulativeExpenses"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#ef4444', strokeWidth: 2 }}
              name="Cumulative Expenses"
            />
            <Line
              type="monotone"
              dataKey="cumulativeNet"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              name="Cumulative Net"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}