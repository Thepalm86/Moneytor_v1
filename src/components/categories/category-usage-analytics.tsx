'use client'

import { useMemo } from 'react'
import { TrendingUp, TrendingDown, BarChart3, PieChart, AlertTriangle, Calendar } from 'lucide-react'
import { Bar, BarChart, Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

import { useCategoryUsageAnalytics } from '@/hooks/use-categories'
import { getIcon } from '@/lib/utils/icons'
import { formatCurrency } from '@/lib/utils'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface CategoryUsageAnalyticsProps {
  userId: string
}

export function CategoryUsageAnalytics({ userId }: CategoryUsageAnalyticsProps) {
  const { data: analyticsData, isLoading, error } = useCategoryUsageAnalytics(userId)

  const chartData = useMemo(() => {
    if (!analyticsData?.data) return []
    
    return analyticsData.data.categoryPerformance.slice(0, 8).map(item => ({
      name: item.category.name.length > 12 
        ? item.category.name.substring(0, 12) + '...' 
        : item.category.name,
      fullName: item.category.name,
      transactions: item.transactionCount,
      amount: item.totalAmount,
      color: item.category.color,
    }))
  }, [analyticsData])

  const pieData = useMemo(() => {
    if (!analyticsData?.data) return []
    
    return analyticsData.data.categoryPerformance.slice(0, 6).map(item => ({
      name: item.category.name,
      value: item.totalAmount,
      color: item.category.color,
    }))
  }, [analyticsData])

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Card key={i} className="backdrop-blur-sm bg-white/40 border-white/20">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !analyticsData?.data) {
    return (
      <Card className="backdrop-blur-sm bg-white/40 border-white/20">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-gray-600">Failed to load analytics data</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const analytics = analyticsData.data

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="backdrop-blur-sm bg-white/40 border-white/20 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/40 border-white/20 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Most Used</p>
                {analytics.mostUsedCategory ? (
                  <>
                    <p className="text-lg font-bold text-gray-900">{analytics.mostUsedCategory.category.name}</p>
                    <p className="text-xs text-gray-500">{analytics.mostUsedCategory.count} transactions</p>
                  </>
                ) : (
                  <p className="text-lg font-medium text-gray-500">No data</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/40 border-white/20 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Least Used</p>
                {analytics.leastUsedCategory ? (
                  <>
                    <p className="text-lg font-bold text-gray-900">{analytics.leastUsedCategory.category.name}</p>
                    <p className="text-xs text-gray-500">{analytics.leastUsedCategory.count} transactions</p>
                  </>
                ) : (
                  <p className="text-lg font-medium text-gray-500">No data</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/40 border-white/20 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Unused Categories</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.unusedCategories.length}</p>
                {analytics.unusedCategories.length > 0 && (
                  <p className="text-xs text-amber-600">Consider removing</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Transaction Count Chart */}
        <Card className="backdrop-blur-sm bg-white/40 border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Transaction Count by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [value, 'Transactions']}
                    labelFormatter={(label) => {
                      const item = chartData.find(d => d.name === label)
                      return item?.fullName || label
                    }}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Bar dataKey="transactions" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">No category usage data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Amount Distribution Chart */}
        <Card className="backdrop-blur-sm bg-white/40 border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-green-600" />
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(value), 'Amount']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">No spending data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Performance Table */}
      <Card className="backdrop-blur-sm bg-white/40 border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Category Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.categoryPerformance.slice(0, 10).map((performance, index) => {
              const IconComponent = getIcon(performance.category.icon)
              const lastUsedDate = performance.lastUsed 
                ? new Date(performance.lastUsed).toLocaleDateString()
                : 'Never'

              return (
                <div
                  key={performance.category.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/50 hover:bg-white/70 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: performance.category.color }}
                      >
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{performance.category.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        Last used: {lastUsedDate}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-right">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {performance.transactionCount} transactions
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(performance.totalAmount)}
                      </p>
                    </div>
                    <Badge 
                      variant={performance.category.type === 'income' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {performance.category.type}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>

          {analytics.categoryPerformance.length === 0 && (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No category usage data available</p>
              <p className="text-sm text-gray-400 mt-1">
                Start by adding some transactions to see analytics
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unused Categories Alert */}
      {analytics.unusedCategories.length > 0 && (
        <Card className="backdrop-blur-sm bg-amber-50/40 border-amber-200/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Unused Categories ({analytics.unusedCategories.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-700 mb-4">
              These categories haven't been used in any transactions yet. Consider using them or removing them to keep your category list organized.
            </p>
            <div className="flex flex-wrap gap-2">
              {analytics.unusedCategories.map((category) => {
                const IconComponent = getIcon(category.icon)
                return (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/60 border border-amber-200"
                  >
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: category.color }}
                    >
                      <IconComponent className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-amber-800">{category.name}</span>
                    <Badge 
                      variant={category.type === 'income' ? 'secondary' : 'destructive'}
                      className="text-xs px-1.5 py-0.5"
                    >
                      {category.type}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}