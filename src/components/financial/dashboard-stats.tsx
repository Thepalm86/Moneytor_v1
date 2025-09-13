'use client'

import { useMemo } from 'react'
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react'

import { formatCurrency } from '@/lib/utils/currency'
import { useTransactionStats } from '@/hooks/use-transactions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardStatsProps {
  userId: string
  dateRange?: {
    from: Date
    to: Date
  }
}

export function DashboardStats({ userId, dateRange }: DashboardStatsProps) {
  const { data: statsData, isLoading } = useTransactionStats(
    userId,
    dateRange?.from,
    dateRange?.to
  )

  const stats = statsData?.data

  const statsCards = useMemo(() => {
    if (!stats) return []

    return [
      {
        title: 'Total Income',
        value: formatCurrency(stats.totalIncome),
        icon: TrendingUp,
        change: '+12.5%',
        trend: 'up' as const,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      },
      {
        title: 'Total Expenses',
        value: formatCurrency(stats.totalExpenses),
        icon: TrendingDown,
        change: '+8.2%',
        trend: 'up' as const,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
      },
      {
        title: 'Net Amount',
        value: formatCurrency(stats.netAmount),
        icon: DollarSign,
        change: stats.netAmount > 0 ? '+' : '',
        trend: stats.netAmount > 0 ? ('up' as const) : ('down' as const),
        color: stats.netAmount > 0 ? 'text-green-600' : 'text-red-600',
        bgColor: stats.netAmount > 0 ? 'bg-green-50' : 'bg-red-50',
      },
      {
        title: 'Transactions',
        value: stats.transactionCount.toString(),
        icon: CreditCard,
        change: '',
        trend: 'neutral' as const,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      },
    ]
  }, [stats])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              </CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-24 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Income', icon: TrendingUp, color: 'text-green-600' },
          { title: 'Total Expenses', icon: TrendingDown, color: 'text-red-600' },
          { title: 'Net Amount', icon: DollarSign, color: 'text-blue-600' },
          { title: 'Transactions', icon: CreditCard, color: 'text-blue-600' },
        ].map((item, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground">No data available</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.change && (
              <p className={`text-xs ${
                stat.trend === 'up' ? 'text-green-600' : 
                stat.trend === 'down' ? 'text-red-600' : 
                'text-muted-foreground'
              }`}>
                {stat.change} from last month
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}