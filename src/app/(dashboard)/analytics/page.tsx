'use client'

import { useState } from 'react'
import { Calendar, BarChart3, PieChart, TrendingUp } from 'lucide-react'
import { format, subDays, subMonths } from 'date-fns'

import { useUser } from '@/hooks/use-user'
import {
  SpendingTrendsChart,
  CategoryBreakdownChart,
  MonthlyOverviewChart,
} from '@/components/charts'
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

export default function AnalyticsPage() {
  const { user, isLoading } = useUser()
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '6m' | '1y'>('30d')

  // Calculate date ranges
  const getDateRange = (range: string) => {
    const now = new Date()

    switch (range) {
      case '7d':
        return { from: subDays(now, 6), to: now }
      case '30d':
        return { from: subDays(now, 29), to: now }
      case '90d':
        return { from: subDays(now, 89), to: now }
      case '6m':
        return { from: subMonths(now, 6), to: now }
      case '1y':
        return { from: subMonths(now, 12), to: now }
      default:
        return { from: subDays(now, 29), to: now }
    }
  }

  const currentDateRange = getDateRange(dateRange)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Please log in to view analytics</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Analytics</h1>
          <p className="text-gray-600">
            Comprehensive insights into your spending patterns and trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {format(currentDateRange.from, 'MMM dd')} -{' '}
            {format(currentDateRange.to, 'MMM dd, yyyy')}
          </Badge>
          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Monthly
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6">
            {/* Trends and Categories side by side */}
            <div className="grid gap-6 lg:grid-cols-2">
              <SpendingTrendsChart userId={user.id} dateRange={currentDateRange} />
              <CategoryBreakdownChart
                userId={user.id}
                type="expense"
                dateRange={currentDateRange}
              />
            </div>

            {/* Monthly overview full width */}
            <MonthlyOverviewChart userId={user.id} monthsCount={6} />
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <SpendingTrendsChart userId={user.id} dateRange={currentDateRange} className="w-full" />

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Spending Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <h4 className="mb-2 text-sm font-semibold text-blue-900">💡 Analysis Tips</h4>
                    <ul className="space-y-1 text-xs text-blue-800">
                      <li>• Look for unusual spikes in spending</li>
                      <li>• Track if income is keeping up with expenses</li>
                      <li>• Identify patterns in your financial behavior</li>
                      <li>• Use cumulative trends to see overall progress</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Date Range Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="font-medium">Period:</span>{' '}
                    {format(currentDateRange.from, 'MMM dd, yyyy')} to{' '}
                    {format(currentDateRange.to, 'MMM dd, yyyy')}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Days:</span>{' '}
                    {Math.ceil(
                      (currentDateRange.to.getTime() - currentDateRange.from.getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    days
                  </div>
                  <p className="text-xs text-gray-600">
                    Adjust the date range using the selector above to analyze different time
                    periods.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-1">
            <CategoryBreakdownChart
              userId={user.id}
              type="all"
              dateRange={currentDateRange}
              className="w-full"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <CategoryBreakdownChart
              userId={user.id}
              type="expense"
              dateRange={currentDateRange}
              className="w-full"
            />
            <CategoryBreakdownChart
              userId={user.id}
              type="income"
              dateRange={currentDateRange}
              className="w-full"
            />
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          <MonthlyOverviewChart userId={user.id} monthsCount={12} className="w-full" />

          <div className="grid gap-6 lg:grid-cols-2">
            <MonthlyOverviewChart userId={user.id} monthsCount={6} className="w-full" />

            <Card>
              <CardHeader>
                <CardTitle>Monthly Analysis Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <h4 className="mb-2 text-sm font-semibold text-green-900">
                      📊 What to Look For
                    </h4>
                    <ul className="space-y-1 text-xs text-green-800">
                      <li>• Seasonal spending patterns</li>
                      <li>• Monthly income consistency</li>
                      <li>• Expense growth trends</li>
                      <li>• Best and worst performing months</li>
                      <li>• Average monthly net income</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                    <h4 className="mb-2 text-sm font-semibold text-orange-900">🎯 Action Items</h4>
                    <ul className="space-y-1 text-xs text-orange-800">
                      <li>• Set monthly budget targets</li>
                      <li>• Plan for seasonal expenses</li>
                      <li>• Identify months to save more</li>
                      <li>• Review expense categories</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
