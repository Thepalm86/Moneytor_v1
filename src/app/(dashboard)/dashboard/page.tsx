'use client'

import { PageHeader } from '@/components/layout/page-header'
import { DashboardStats } from '@/components/financial/dashboard-stats'
import {
  SpendingTrendsChart,
  CategoryBreakdownChart,
  MonthlyOverviewChart,
} from '@/components/charts'
import { QuickActionCards } from '@/components/dashboard/quick-action-cards'
import { useUser } from '@/hooks/use-user'
import { getDateRange } from '@/lib/utils/date'
export default function DashboardPage() {
  const { user, isLoading } = useUser()

  // Current month date range for stats
  const currentMonthRange = getDateRange('month')

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
        <p className="text-gray-600">Please log in to view your dashboard</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Financial Dashboard"
        subtitle="Welcome back! Here's your financial overview"
      />

      {/* Statistics Cards */}
      <div className="mt-8">
        <DashboardStats userId={user.id} dateRange={currentMonthRange} />
      </div>

      {/* Charts Section */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200/50 bg-white/60 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
          <SpendingTrendsChart userId={user.id} />
        </div>
        <div className="rounded-2xl border border-gray-200/50 bg-white/60 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
          <CategoryBreakdownChart userId={user.id} type="expense" />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200/50 bg-white/60 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
        <MonthlyOverviewChart userId={user.id} monthsCount={6} />
      </div>

      {/* Quick Actions Section */}
      <QuickActionCards userId={user.id} />
    </div>
  )
}
