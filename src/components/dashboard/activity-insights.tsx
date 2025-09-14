'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TransactionList } from '@/components/financial/transaction-list'
import { BudgetAlerts } from '@/components/budget/budget-alerts'
import { 
  TrendingUp, 
  AlertTriangle,
  BarChart3,
  Clock
} from 'lucide-react'
import type { Transaction } from '@/lib/validations/transaction'

interface ActivityInsightsProps {
  userId: string
  onAddTransaction: () => void
  onEditTransaction: (transaction: Transaction) => void
  onManageBudgets: () => void
}

export function ActivityInsights({ 
  userId, 
  onAddTransaction, 
  onEditTransaction, 
  onManageBudgets 
}: ActivityInsightsProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Recent Activity - Main Column */}
      <div className="lg:col-span-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-8 w-2 rounded-full bg-gradient-to-b from-blue-500 to-cyan-600"></div>
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            Last 30 days
          </div>
        </div>
        
        <div className="rounded-2xl border border-gray-200/50 bg-white/60 p-1 shadow-xl backdrop-blur-sm">
          <TransactionList
            userId={userId}
            onAddTransaction={onAddTransaction}
            onEditTransaction={onEditTransaction}
          />
        </div>
      </div>

      {/* Insights Sidebar */}
      <div className="space-y-6 lg:col-span-4">
        {/* Budget Alerts */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-100">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
            Budget Alerts
          </h3>
          <BudgetAlerts userId={userId} onManageBudgets={onManageBudgets} />
        </div>

        {/* Financial Insights Widget */}
        <Card className="border-gray-200/50 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50/30 shadow-lg transition-all duration-300 hover:shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              Financial Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">This Month's Trend</span>
                <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  +12.5%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"></div>
              </div>
              <p className="text-sm leading-relaxed text-gray-600">
                Your spending efficiency has improved compared to last month. Great job staying within budget!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics Widget */}
        <Card className="border-gray-200/50 bg-gradient-to-br from-violet-50 via-purple-50/50 to-indigo-50/30 shadow-lg transition-all duration-300 hover:shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100">
                <BarChart3 className="h-4 w-4 text-violet-600" />
              </div>
              Monthly Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-violet-600">24</div>
                <div className="text-xs text-gray-600">Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">8</div>
                <div className="text-xs text-gray-600">Categories Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">3</div>
                <div className="text-xs text-gray-600">Budgets Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">2</div>
                <div className="text-xs text-gray-600">Goals Tracked</div>
              </div>
            </div>
            <div className="pt-2 text-center">
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 px-3 py-1 text-xs font-medium text-violet-700">
                <BarChart3 className="h-3 w-3" />
                Very Active
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}