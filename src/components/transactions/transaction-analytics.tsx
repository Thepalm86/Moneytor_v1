'use client'

import { useMemo } from 'react'
import { format, eachWeekOfInterval, endOfWeek } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar } from 'recharts'
import { formatCurrency } from '@/lib/utils/currency'
import type { Transaction } from '@/lib/validations/transaction'
import { 
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Calendar
} from 'lucide-react'

interface TransactionAnalyticsProps {
  transactions: Transaction[]
  dateRange: { from: Date; to: Date }
}

// Type interfaces for the chart data

export function TransactionAnalytics({ transactions, dateRange }: TransactionAnalyticsProps) {
  // Weekly spending trend data
  const weeklyTrendData = useMemo(() => {
    const weeks = eachWeekOfInterval({ start: dateRange.from, end: dateRange.to })
    
    return weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart)
      const weekTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate >= weekStart && transactionDate <= weekEnd
      })
      
      const income = weekTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      
      const expense = weekTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      
      return {
        week: format(weekStart, 'MMM dd'),
        income,
        expense,
        net: income - expense
      }
    })
  }, [transactions, dateRange])

  // Category distribution for expenses
  const categoryDistribution = useMemo(() => {
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

    return Array.from(categoryTotals.values())
      .map(({ amount, category }) => ({
        name: category?.name || 'Unknown',
        value: amount,
        color: category?.color || '#94a3b8'
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // Top 5 categories
  }, [transactions])

  // Income vs expense comparison
  const incomeVsExpense = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    return [
      { type: 'Income', amount: income, color: '#10b981' },
      { type: 'Expenses', amount: expense, color: '#ef4444' }
    ]
  }, [transactions])

  // Daily averages and patterns
  const dailyAverages = useMemo(() => {
    const daysDiff = Math.max(1, Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)))
    
    const incomeTransactions = transactions.filter(t => t.type === 'income')
    const expenseTransactions = transactions.filter(t => t.type === 'expense')
    
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0)
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0)
    
    return {
      dailyIncome: totalIncome / daysDiff,
      dailyExpenses: totalExpenses / daysDiff,
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length,
      avgIncomeAmount: incomeTransactions.length > 0 ? totalIncome / incomeTransactions.length : 0,
      avgExpenseAmount: expenseTransactions.length > 0 ? totalExpenses / expenseTransactions.length : 0
    }
  }, [transactions, dateRange])

  // Spending pattern analysis
  const spendingPattern = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense')
    if (expenses.length === 0) return null

    const amounts = expenses.map(t => Number(t.amount))
    amounts.sort((a, b) => a - b)
    
    const median = amounts.length % 2 === 0 
      ? (amounts[amounts.length / 2 - 1] + amounts[amounts.length / 2]) / 2
      : amounts[Math.floor(amounts.length / 2)]
    
    const average = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
    
    return {
      median,
      average,
      largest: Math.max(...amounts),
      smallest: Math.min(...amounts),
      total: amounts.reduce((sum, amount) => sum + amount, 0)
    }
  }, [transactions])

  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
      {/* Weekly Trend Chart */}
      <Card className="lg:col-span-2 xl:col-span-2 border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100">
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
            Weekly Financial Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrendData}>
                <XAxis 
                  dataKey="week" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
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
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Daily Averages */}
      <Card className="border-gray-200/50 bg-gradient-to-br from-violet-50 via-purple-50/50 to-indigo-50/30 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100">
              <Calendar className="h-4 w-4 text-violet-600" />
            </div>
            Daily Averages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Daily Income</span>
              <div className="text-right">
                <div className="font-semibold text-green-600">
                  {formatCurrency(dailyAverages.dailyIncome)}
                </div>
                <div className="text-xs text-gray-500">
                  {dailyAverages.incomeCount} transactions
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Daily Expenses</span>
              <div className="text-right">
                <div className="font-semibold text-red-600">
                  {formatCurrency(dailyAverages.dailyExpenses)}
                </div>
                <div className="text-xs text-gray-500">
                  {dailyAverages.expenseCount} transactions
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg. Income Size</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(dailyAverages.avgIncomeAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg. Expense Size</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(dailyAverages.avgExpenseAmount)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      {categoryDistribution.length > 0 && (
        <Card className="lg:col-span-2 border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100">
                <PieChartIcon className="h-4 w-4 text-purple-600" />
              </div>
              Top Expense Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="h-40 w-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex-1 space-y-2">
                {categoryDistribution.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm text-gray-700">{category.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(category.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Income vs Expenses Comparison */}
      <Card className="border-gray-200/50 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50/30 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
            </div>
            Income vs Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpense} layout="horizontal">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="type" tick={{ fontSize: 12 }} width={60} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {incomeVsExpense.map((entry) => (
                    <Cell key={entry.type} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {spendingPattern && (
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Median Expense:</span>
                <span className="font-semibold">{formatCurrency(spendingPattern.median)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Largest Expense:</span>
                <span className="font-semibold">{formatCurrency(spendingPattern.largest)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}