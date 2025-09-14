'use client'

import { useMemo } from 'react'
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react'

import { useTransactionStats } from '@/hooks/use-transactions'
import { FinancialCard } from '@/components/ui/financial-card'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { useCurrency } from '@/contexts/currency-context'

interface DashboardStatsProps {
  userId: string
  dateRange?: {
    from: Date
    to: Date
  }
}

export function DashboardStats({ userId, dateRange }: DashboardStatsProps) {
  const { data: statsData, isLoading } = useTransactionStats(userId, dateRange?.from, dateRange?.to)
  const { formatCurrency } = useCurrency()

  const stats = statsData?.data

  const statsCards = useMemo(() => {
    if (!stats) return []

    return [
      {
        title: 'Total Income',
        value: <AnimatedCounter value={stats.totalIncome} formatter={formatCurrency} />,
        icon: <TrendingUp className="h-6 w-6" />,
        change: '+12.5%',
        changeType: 'positive' as const,
        trend: 'up' as const,
        variant: 'income' as const,
        subtitle: 'This month',
        formatAsCurrency: false,
      },
      {
        title: 'Total Expenses',
        value: <AnimatedCounter value={stats.totalExpenses} formatter={formatCurrency} />,
        icon: <TrendingDown className="h-6 w-6" />,
        change: '+8.2%',
        changeType: 'negative' as const,
        trend: 'up' as const,
        variant: 'expense' as const,
        subtitle: 'This month',
        formatAsCurrency: false,
      },
      {
        title: 'Net Amount',
        value: <AnimatedCounter value={stats.netAmount} formatter={formatCurrency} />,
        icon: <DollarSign className="h-6 w-6" />,
        change: stats.netAmount > 0 ? '+5.3%' : '-2.1%',
        changeType: stats.netAmount > 0 ? ('positive' as const) : ('negative' as const),
        trend: stats.netAmount > 0 ? ('up' as const) : ('down' as const),
        variant: stats.netAmount > 0 ? ('income' as const) : ('expense' as const),
        subtitle: 'vs last month',
        formatAsCurrency: false,
      },
      {
        title: 'Transactions',
        value: <AnimatedCounter value={stats.transactionCount} />,
        icon: <CreditCard className="h-6 w-6" />,
        change: '+15 this month',
        changeType: 'neutral' as const,
        trend: 'up' as const,
        variant: 'primary' as const,
        subtitle: 'Total count',
        formatAsCurrency: false,
      },
    ]
  }, [stats])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Total Income',
            variant: 'income' as const,
            icon: <TrendingUp className="h-6 w-6" />,
          },
          {
            title: 'Total Expenses',
            variant: 'expense' as const,
            icon: <TrendingDown className="h-6 w-6" />,
          },
          {
            title: 'Net Amount',
            variant: 'primary' as const,
            icon: <DollarSign className="h-6 w-6" />,
          },
          {
            title: 'Transactions',
            variant: 'neutral' as const,
            icon: <CreditCard className="h-6 w-6" />,
          },
        ].map((item, i) => (
          <FinancialCard
            key={i}
            title={item.title}
            value="Loading..."
            icon={item.icon}
            variant={item.variant}
            formatAsCurrency={false}
            className="animate-pulse opacity-75"
          />
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Total Income',
            variant: 'income' as const,
            icon: <TrendingUp className="h-6 w-6" />,
            formatAsCurrency: true,
          },
          {
            title: 'Total Expenses',
            variant: 'expense' as const,
            icon: <TrendingDown className="h-6 w-6" />,
            formatAsCurrency: true,
          },
          {
            title: 'Net Amount',
            variant: 'primary' as const,
            icon: <DollarSign className="h-6 w-6" />,
            formatAsCurrency: true,
          },
          {
            title: 'Transactions',
            variant: 'neutral' as const,
            icon: <CreditCard className="h-6 w-6" />,
            formatAsCurrency: false,
          },
        ].map((item, i) => (
          <FinancialCard
            key={i}
            title={item.title}
            value={0}
            icon={item.icon}
            variant={item.variant}
            subtitle="No data available"
            formatAsCurrency={item.formatAsCurrency}
            className="opacity-60"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat, index) => (
        <FinancialCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          variant={stat.variant}
          change={stat.change}
          changeType={stat.changeType}
          trend={stat.trend}
          subtitle={stat.subtitle}
          formatAsCurrency={stat.formatAsCurrency}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        />
      ))}
    </div>
  )
}
