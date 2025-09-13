'use client'

import { useMemo } from 'react'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'

import { formatCurrency } from '@/lib/utils/currency'
import { useTransactions } from '@/hooks/use-transactions'
import { getIcon } from '@/lib/utils/icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
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

// Predefined colors for categories
const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
  '#14b8a6', '#f43f5e', '#a855f7', '#22c55e', '#eab308'
]

export function CategoryBreakdownChart({ 
  userId, 
  type = 'all',
  dateRange,
  className 
}: CategoryBreakdownChartProps) {
  const { data: transactionsData, isLoading } = useTransactions(
    userId,
    {
      type: type === 'all' ? undefined : type,
      dateFrom: dateRange?.from,
      dateTo: dateRange?.to,
    }
  )

  const { chartData, totalAmount } = useMemo(() => {
    if (!transactionsData?.data) {
      return { chartData: [], totalAmount: 0 }
    }

    const transactions = transactionsData.data

    // Group transactions by category
    const categoryGroups = transactions.reduce((acc, transaction) => {
      const categoryId = transaction.category_id
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
          transactions: []
        }
      }
      
      acc[categoryId].amount += Number(transaction.amount)
      acc[categoryId].count += 1
      acc[categoryId].transactions.push(transaction)
      
      return acc
    }, {} as Record<string, {
      id: string
      name: string
      color: string
      icon: string
      amount: number
      count: number
      transactions: Transaction[]
    }>)

    const data = Object.values(categoryGroups)
      .sort((a, b) => b.amount - a.amount)
      .map((category, index) => ({
        ...category,
        chartColor: CHART_COLORS[index % CHART_COLORS.length],
        percentage: 0 // Will be calculated below
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
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.chartColor }}
            />
            <h4 className="font-medium text-gray-900">{data.name}</h4>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center gap-4">
              <span>Amount:</span>
              <span className="font-medium">{formatCurrency(data.amount)}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span>Transactions:</span>
              <span className="font-medium">{data.count}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span>Percentage:</span>
              <span className="font-medium">{data.percentage.toFixed(1)}%</span>
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
          <CardTitle>Category Breakdown</CardTitle>
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
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-2">No transaction data available</p>
              <p className="text-sm text-gray-500">
                Add some transactions to see category breakdown
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
        <CardTitle className="flex items-center justify-between">
          Category Breakdown
          <Badge variant="outline">
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
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Pie Chart */}
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="amount"
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.chartColor}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend */}
              <div className="lg:w-1/3 space-y-2">
                <h4 className="font-medium text-sm text-gray-700 mb-3">Categories</h4>
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {chartData.map((item, index) => {
                    const IconComponent = getIcon(item.icon)
                    
                    return (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.chartColor }}
                          />
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          >
                            <IconComponent className="w-3 h-3 text-white" />
                          </div>
                          <span className="font-medium truncate">{item.name}</span>
                        </div>
                        <div className="text-right ml-2">
                          <div className="font-medium">{formatCurrency(item.amount)}</div>
                          <div className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</div>
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
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 80,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="amount" 
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.chartColor}
                    />
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