'use client'

import { useMemo } from 'react'
import { format, eachDayOfInterval } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { useTransactions } from '@/hooks/use-transactions'
import { useBudgets } from '@/hooks/use-budgets'
import { useCurrency } from '@/contexts/currency-context'
import { 
  AlertTriangle,
  Target,
  PieChart as PieChartIcon,
  BarChart3
} from 'lucide-react'

interface TransactionInsightsProps {
  userId: string
  dateRange: { from: Date; to: Date }
}

interface DailySpending {
  date: string
  amount: number
  income: number
  expense: number
}

// Type interfaces for the insights data

export function TransactionInsights({ userId, dateRange }: TransactionInsightsProps) {
  const { formatCurrency } = useCurrency()
  const { data: transactionsData } = useTransactions(userId, {
    dateFrom: dateRange.from,
    dateTo: dateRange.to
  })
  // Categories data (currently unused but available for future enhancements)
  const { data: budgetsData } = useBudgets(userId)

  const transactions = useMemo(() => transactionsData?.data || [], [transactionsData?.data])
  const budgets = useMemo(() => budgetsData?.data || [], [budgetsData?.data])

  // Calculate daily spending trend
  const dailySpendingData = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to })
    const dailyData: DailySpending[] = days.map(day => ({
      date: format(day, 'MMM dd'),
      amount: 0,
      income: 0,
      expense: 0
    }))

    transactions.forEach(transaction => {
      const transactionDate = format(new Date(transaction.date), 'MMM dd')
      const dayIndex = dailyData.findIndex(day => day.date === transactionDate)
      
      if (dayIndex !== -1) {
        if (transaction.type === 'income') {
          dailyData[dayIndex].income += Number(transaction.amount)
          dailyData[dayIndex].amount += Number(transaction.amount)
        } else {
          dailyData[dayIndex].expense += Number(transaction.amount)
          dailyData[dayIndex].amount -= Number(transaction.amount)
        }
      }
    })

    return dailyData
  }, [transactions, dateRange])

  // Calculate category spending distribution
  const categorySpendingData = useMemo(() => {
    const categoryTotals = new Map<string, { amount: number; category: any }>()
    
    transactions
      .filter(t => t.type === 'expense' && t.category)
      .forEach(transaction => {
        const categoryId = transaction.category_id!
        const existing = categoryTotals.get(categoryId) || { amount: 0, category: transaction.category }
        categoryTotals.set(categoryId, {
          amount: existing.amount + Number(transaction.amount),
          category: transaction.category
        })
      })

    const totalSpending = Array.from(categoryTotals.values()).reduce((sum, cat) => sum + cat.amount, 0)
    
    return Array.from(categoryTotals.values())
      .map(({ amount, category }) => ({
        name: category?.name || 'Unknown',
        amount,
        color: category?.color || '#94a3b8',
        percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6) // Top 6 categories
  }, [transactions])

  // Calculate budget utilization alerts
  const budgetAlerts = useMemo(() => {
    return budgets
      .map(budget => {
        const categorySpending = transactions
          .filter(t => 
            t.type === 'expense' && 
            t.category_id === budget.category_id &&
            new Date(t.date) >= dateRange.from &&
            new Date(t.date) <= dateRange.to
          )
          .reduce((sum, t) => sum + Number(t.amount), 0)

        const utilization = budget.amount > 0 ? (categorySpending / budget.amount) * 100 : 0
        
        return {
          ...budget,
          spent: categorySpending,
          utilization,
          isOverBudget: utilization > 100,
          isNearLimit: utilization > 80 && utilization <= 100
        }
      })
      .filter(budget => budget.isOverBudget || budget.isNearLimit)
      .sort((a, b) => b.utilization - a.utilization)
  }, [budgets, transactions, dateRange])

  // Calculate spending velocity (average daily spending)
  const spendingVelocity = useMemo(() => {
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    const daysDiff = Math.max(1, Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)))
    return totalExpenses / daysDiff
  }, [transactions, dateRange])

  // Calculate financial health score
  const financialHealthScore = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0)
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0)
    
    if (totalIncome === 0) return 0
    
    const savingsRate = Math.max(0, (totalIncome - totalExpenses) / totalIncome) * 100
    
    if (savingsRate >= 20) return 100
    if (savingsRate >= 10) return 80
    if (savingsRate >= 5) return 60
    if (savingsRate >= 0) return 40
    return 20
  }, [transactions])

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Spending Trend Chart */}
      <Card className="lg:col-span-2 border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
            Daily Financial Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailySpendingData}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => formatCurrency(Math.abs(value))}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number, name: string) => [
                    formatCurrency(Math.abs(value)),
                    name === 'income' ? 'Income' : name === 'expense' ? 'Expenses' : 'Net'
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#10b981' }}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#ef4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Financial Health Score */}
      <Card className="border-gray-200/50 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50/30 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100">
              <Target className="h-4 w-4 text-emerald-600" />
            </div>
            Financial Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Health Score</span>
              <Badge 
                variant="outline"
                className={`${
                  financialHealthScore >= 80 
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    : financialHealthScore >= 60
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    : 'bg-red-100 text-red-700 border-red-200'
                }`}
              >
                {financialHealthScore}/100
              </Badge>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  financialHealthScore >= 80 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                    : financialHealthScore >= 60
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-r from-red-500 to-rose-600'
                }`}
                style={{ width: `${financialHealthScore}%` }}
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Daily Average</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(spendingVelocity)}
              </span>
            </div>
            
            {budgetAlerts.length > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-orange-700">
                  {budgetAlerts.length} budget alert{budgetAlerts.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Categories Chart */}
      <Card className="lg:col-span-2 border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100">
              <PieChartIcon className="h-4 w-4 text-purple-600" />
            </div>
            Top Spending Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpendingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="amount"
                    stroke="none"
                  >
                    {categorySpendingData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex-1 space-y-3">
              {categorySpendingData.slice(0, 5).map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(category.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {category.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Alerts */}
      <Card className="border-gray-200/50 bg-gradient-to-br from-orange-50 via-amber-50/50 to-yellow-50/30 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-100">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
            Budget Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {budgetAlerts.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-4">
              <Target className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              All budgets are on track
            </div>
          ) : (
            budgetAlerts.slice(0, 3).map((budget) => (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {budget.category?.name || 'Unknown Category'}
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      budget.isOverBudget
                        ? 'bg-red-100 text-red-700 border-red-200'
                        : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    }
                  >
                    {budget.utilization.toFixed(0)}%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{formatCurrency(budget.spent)}</span>
                    <span>{formatCurrency(budget.amount)}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        budget.isOverBudget
                          ? 'bg-gradient-to-r from-red-500 to-rose-600'
                          : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                      }`}
                      style={{ width: `${Math.min(100, budget.utilization)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}