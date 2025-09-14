'use client'

import { useState } from 'react'
import { 
  Calendar, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Activity, 
  ArrowUpDown, 
  Download,
  Zap
} from 'lucide-react'
import { format, subDays, subMonths } from 'date-fns'

import { useUser } from '@/hooks/use-user'
import {
  SpendingTrendsChart,
  CategoryBreakdownChart,
  MonthlyOverviewChart,
} from '@/components/charts'
import { InteractiveSpendingTrendsChart } from '@/components/charts/interactive-spending-trends-chart'
import {
  FinancialKPIDashboard,
  ComparisonTools,
  ExportReportingSystem
} from '@/components/analytics'
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
        <div className="space-y-4 text-center">
          <div className="relative">
            <div className="border-primary-200 border-t-primary-600 mx-auto h-12 w-12 animate-spin rounded-full border-4"></div>
            <div className="from-primary-400 to-primary-600 absolute inset-0 animate-pulse rounded-full bg-gradient-to-r opacity-20"></div>
          </div>
          <p className="text-body-sm font-medium text-muted-foreground">
            Loading advanced analytics...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/50">
            <Activity className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-body-md font-medium text-foreground">Authentication Required</p>
            <p className="text-body-sm text-muted-foreground">Please log in to view your financial analytics</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Analytics</h1>
          <p className="text-muted-foreground">
            Advanced insights, KPIs, and interactive analysis of your financial data
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

      {/* Advanced Analytics Tabs */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="interactive" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Interactive
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            Compare
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </TabsTrigger>
        </TabsList>

        {/* Financial KPI Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <FinancialKPIDashboard 
            userId={user.id} 
            dateRange={currentDateRange} 
          />
        </TabsContent>

        {/* Interactive Charts */}
        <TabsContent value="interactive" className="space-y-6">
          <InteractiveSpendingTrendsChart 
            userId={user.id} 
            dateRange={currentDateRange} 
          />
          
          <div className="grid gap-6 lg:grid-cols-2">
            <CategoryBreakdownChart
              userId={user.id}
              type="expense"
              dateRange={currentDateRange}
              className="w-full"
            />
            <MonthlyOverviewChart userId={user.id} monthsCount={6} className="w-full" />
          </div>
        </TabsContent>

        {/* Period Comparison */}
        <TabsContent value="comparison" className="space-y-6">
          <ComparisonTools 
            userId={user.id} 
            currentPeriod={currentDateRange} 
          />
        </TabsContent>

        {/* Enhanced Trends View */}
        <TabsContent value="trends" className="space-y-6">
          <SpendingTrendsChart userId={user.id} dateRange={currentDateRange} className="w-full" />

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass-card border-premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Advanced Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                    <h4 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
                      📊 Trend Analysis
                    </h4>
                    <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
                      <li>• Identify spending patterns and anomalies</li>
                      <li>• Track income stability and growth</li>
                      <li>• Monitor financial velocity and momentum</li>
                      <li>• Analyze cumulative wealth building</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-green-200 bg-green-50/50 p-4 dark:border-green-800 dark:bg-green-950/30">
                    <h4 className="mb-2 text-sm font-semibold text-green-900 dark:text-green-100">
                      🎯 Optimization Tips
                    </h4>
                    <ul className="space-y-1 text-xs text-green-800 dark:text-green-200">
                      <li>• Use brush selection to zoom into specific periods</li>
                      <li>• Click data points for detailed breakdowns</li>
                      <li>• Compare different chart modes for insights</li>
                      <li>• Export data for external analysis</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-premium">
              <CardHeader>
                <CardTitle>Period Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="font-medium">Analysis Period:</span>{' '}
                    {format(currentDateRange.from, 'MMM dd, yyyy')} to{' '}
                    {format(currentDateRange.to, 'MMM dd, yyyy')}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Duration:</span>{' '}
                    {Math.ceil(
                      (currentDateRange.to.getTime() - currentDateRange.from.getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    days
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
                    <p className="text-xs text-amber-800 dark:text-amber-200">
                      💡 Tip: Use different time ranges to identify seasonal patterns and long-term trends in your financial behavior.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Enhanced Categories View */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-6">
            <CategoryBreakdownChart
              userId={user.id}
              type="all"
              dateRange={currentDateRange}
              className="w-full"
            />

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
          </div>

          <Card className="glass-card border-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Category Analysis Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">Understanding Your Categories</h4>
                  <div className="space-y-2 text-sm">
                    <p>• <strong>Expense Categories:</strong> Track where your money goes</p>
                    <p>• <strong>Income Sources:</strong> Monitor revenue streams</p>
                    <p>• <strong>Percentage View:</strong> Identify spending distribution</p>
                    <p>• <strong>Hover Details:</strong> See exact amounts and percentages</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">Optimization Strategies</h4>
                  <div className="space-y-2 text-sm">
                    <p>• <strong>Largest Slices:</strong> Focus optimization efforts here</p>
                    <p>• <strong>Small Categories:</strong> Consider merging similar ones</p>
                    <p>• <strong>Income Diversity:</strong> Reduce dependency on single sources</p>
                    <p>• <strong>Seasonal Patterns:</strong> Plan for category fluctuations</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export & Reporting */}
        <TabsContent value="export" className="space-y-6">
          <ExportReportingSystem 
            userId={user.id} 
            dateRange={currentDateRange} 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
