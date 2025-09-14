'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTransactionStats } from '@/hooks/use-transactions'
import { useCurrency } from '@/contexts/currency-context'
import { 
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface TransactionPageHeaderProps {
  userId: string
  onAddTransaction: () => void
}

type DatePeriod = 'week' | 'month' | 'quarter' | 'year'

const DATE_PERIODS = {
  week: { 
    label: 'This Week',
    getRange: () => ({ from: startOfWeek(new Date()), to: endOfWeek(new Date()) })
  },
  month: { 
    label: 'This Month',
    getRange: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })
  },
  quarter: { 
    label: 'This Quarter',
    getRange: () => ({ from: startOfQuarter(new Date()), to: endOfQuarter(new Date()) })
  },
  year: { 
    label: 'This Year',
    getRange: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) })
  }
}

export function TransactionPageHeader({ userId, onAddTransaction }: TransactionPageHeaderProps) {
  const { formatCurrency } = useCurrency()
  const [selectedPeriod, setSelectedPeriod] = useState<DatePeriod>('month')
  
  const dateRange = DATE_PERIODS[selectedPeriod].getRange()
  const { data: stats } = useTransactionStats(userId, dateRange.from, dateRange.to)
  
  const statsData = stats?.data || {
    totalIncome: 0,
    totalExpenses: 0,
    netAmount: 0,
    transactionCount: 0
  }

  const formatPeriodDisplay = () => {
    const { from, to } = dateRange
    if (selectedPeriod === 'week' || selectedPeriod === 'month') {
      return format(from, 'MMM d') + ' - ' + format(to, 'MMM d, yyyy')
    }
    return format(from, 'MMM d') + ' - ' + format(to, 'MMM d, yyyy')
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-3 rounded-full bg-gradient-to-b from-blue-500 via-purple-600 to-cyan-600"></div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
              <p className="text-gray-600 mt-1">Track and manage all your financial activity</p>
            </div>
          </div>
          
          {/* Period Display */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{formatPeriodDisplay()}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Period Selector */}
          <Select value={selectedPeriod} onValueChange={(value: DatePeriod) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-40 border-gray-200/50 bg-white/60 backdrop-blur-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DATE_PERIODS).map(([key, period]) => (
                <SelectItem key={key} value={key}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Add Transaction Button */}
          <Button 
            onClick={onAddTransaction}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {/* Total Income */}
        <Card className="group border-gray-200/50 bg-gradient-to-br from-emerald-50 via-green-50/50 to-teal-50/30 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 min-h-[120px]">
          <CardContent className="p-6 h-full flex items-center">
            <div className="flex items-center justify-between w-full">
              <div className="space-y-2">
                <p className="text-sm font-medium text-emerald-700">Total Income</p>
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                  <span className="text-2xl font-bold text-emerald-900">
                    {formatCurrency(statsData.totalIncome)}
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 transition-all duration-300 group-hover:scale-110">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card className="group border-gray-200/50 bg-gradient-to-br from-red-50 via-rose-50/50 to-pink-50/30 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 min-h-[120px]">
          <CardContent className="p-6 h-full flex items-center">
            <div className="flex items-center justify-between w-full">
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-700">Total Expenses</p>
                <div className="flex items-center gap-1">
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                  <span className="text-2xl font-bold text-red-900">
                    {formatCurrency(statsData.totalExpenses)}
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 transition-all duration-300 group-hover:scale-110">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net Amount */}
        <Card className={`group border-gray-200/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 min-h-[120px] ${
          statsData.netAmount >= 0 
            ? 'bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30' 
            : 'bg-gradient-to-br from-orange-50 via-amber-50/50 to-yellow-50/30'
        }`}>
          <CardContent className="p-6 h-full flex items-center">
            <div className="flex items-center justify-between w-full">
              <div className="space-y-2">
                <p className={`text-sm font-medium ${
                  statsData.netAmount >= 0 ? 'text-blue-700' : 'text-orange-700'
                }`}>
                  Net Flow
                </p>
                <div className="flex items-center gap-1">
                  {statsData.netAmount >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-orange-600" />
                  )}
                  <span className={`text-2xl font-bold ${
                    statsData.netAmount >= 0 ? 'text-blue-900' : 'text-orange-900'
                  }`}>
                    {statsData.netAmount >= 0 ? '+' : ''}{formatCurrency(statsData.netAmount)}
                  </span>
                </div>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110 ${
                statsData.netAmount >= 0 ? 'bg-blue-100' : 'bg-orange-100'
              }`}>
                <DollarSign className={`h-6 w-6 ${
                  statsData.netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Count */}
        <Card className="group border-gray-200/50 bg-gradient-to-br from-violet-50 via-purple-50/50 to-indigo-50/30 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 min-h-[120px]">
          <CardContent className="p-6 h-full flex items-center">
            <div className="flex items-center justify-between w-full">
              <div className="space-y-2">
                <p className="text-sm font-medium text-violet-700">Total Transactions</p>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-violet-900">
                    {statsData.transactionCount.toLocaleString()}
                  </span>
                  <span className="text-sm text-violet-600 ml-1">
                    {DATE_PERIODS[selectedPeriod].label.toLowerCase()}
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 transition-all duration-300 group-hover:scale-110">
                <Calendar className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}