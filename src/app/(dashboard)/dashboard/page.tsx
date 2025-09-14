'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader, PageHeaderAction } from '@/components/layout/page-header'
import { DashboardStats } from '@/components/financial/dashboard-stats'
import { TransactionList } from '@/components/financial/transaction-list'
import { TransactionForm } from '@/components/forms/transaction-form'
import {
  SpendingTrendsChart,
  CategoryBreakdownChart,
  MonthlyOverviewChart,
} from '@/components/charts'
import { BudgetOverviewCards } from '@/components/budget/budget-overview-cards'
import { BudgetAlerts } from '@/components/budget/budget-alerts'
import { GoalOverviewCards } from '@/components/goals/goal-overview-cards'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useUser } from '@/hooks/use-user'
import { getDateRange } from '@/lib/utils/date'
import type { Transaction } from '@/lib/validations/transaction'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  // Current month date range for stats
  const currentMonthRange = getDateRange('month')

  const handleAddTransaction = () => {
    setEditingTransaction(null)
    setShowTransactionForm(true)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowTransactionForm(true)
  }

  const handleFormSuccess = () => {
    setShowTransactionForm(false)
    setEditingTransaction(null)
  }

  const handleFormCancel = () => {
    setShowTransactionForm(false)
    setEditingTransaction(null)
  }

  const handleManageBudgets = () => {
    router.push('/budgets')
  }

  const handleManageGoals = () => {
    router.push('/goals')
  }

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
        gradient="blue"
        actions={
          <PageHeaderAction onClick={handleAddTransaction} variant="primary" size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Add Transaction
          </PageHeaderAction>
        }
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

      {/* Budget & Goals Section */}
      <div className="grid gap-8 xl:grid-cols-2">
        <div className="space-y-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-8 w-2 rounded-full bg-gradient-to-b from-green-500 to-emerald-600"></div>
            <h2 className="text-xl font-semibold text-gray-900">Budget Overview</h2>
          </div>
          <BudgetOverviewCards userId={user.id} onManageBudgets={handleManageBudgets} />
        </div>

        <div className="space-y-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-8 w-2 rounded-full bg-gradient-to-b from-purple-500 to-indigo-600"></div>
            <h2 className="text-xl font-semibold text-gray-900">Savings Goals</h2>
          </div>
          <GoalOverviewCards userId={user.id} onManageGoals={handleManageGoals} />
        </div>
      </div>

      {/* Activity & Insights Section */}
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-8 w-2 rounded-full bg-gradient-to-b from-blue-500 to-cyan-600"></div>
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <TransactionList
            userId={user.id}
            onAddTransaction={handleAddTransaction}
            onEditTransaction={handleEditTransaction}
          />
        </div>

        <div className="space-y-6 lg:col-span-4">
          {/* Budget Alerts */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500"></div>
              Alerts & Notifications
            </h3>
            <BudgetAlerts userId={user.id} onManageBudgets={handleManageBudgets} />
          </div>

          {/* Quick Actions */}
          <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50 to-blue-50/30 shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100">
                  <Plus className="h-4 w-4 text-blue-600" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleAddTransaction}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </CardContent>
          </Card>

          {/* Progress Showcase */}
          <Card className="border-green-200/50 bg-gradient-to-br from-green-50 via-emerald-50/50 to-cyan-50/30 shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-100">
                  <span className="text-sm">🚀</span>
                </div>
                UI/UX Redesign Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Phase 2: Layout & Navigation</span>
                  <span className="text-sm font-semibold text-green-600">In Progress</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div className="h-2 w-3/4 animate-pulse rounded-full bg-gradient-to-r from-green-500 to-emerald-600"></div>
                </div>
                <p className="text-sm leading-relaxed text-gray-600">
                  Enhanced sidebar navigation with glass morphism effects, improved dashboard layout
                  with responsive grids, and premium visual hierarchy.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transaction Form Dialog */}
      <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
        <DialogContent className="max-w-2xl border-gray-200/50 bg-white/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-semibold text-transparent">
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </DialogTitle>
          </DialogHeader>
          <TransactionForm
            userId={user.id}
            initialData={
              editingTransaction
                ? {
                    id: editingTransaction.id,
                    amount: editingTransaction.amount.toString(),
                    description: editingTransaction.description || '',
                    categoryId: editingTransaction.category_id || '',
                    date: new Date(editingTransaction.date),
                    type: editingTransaction.type,
                  }
                : undefined
            }
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
