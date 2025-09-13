'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DashboardStats } from '@/components/financial/dashboard-stats'
import { TransactionList } from '@/components/financial/transaction-list'
import { TransactionForm } from '@/components/forms/transaction-form'
import { SpendingTrendsChart, CategoryBreakdownChart, MonthlyOverviewChart } from '@/components/charts'
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Please log in to view your dashboard</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your financial overview</p>
        </div>
        <Button onClick={handleAddTransaction}>
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Statistics Cards */}
      <DashboardStats userId={user.id} dateRange={currentMonthRange} />

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SpendingTrendsChart userId={user.id} />
        <CategoryBreakdownChart userId={user.id} type="expense" />
      </div>

      <MonthlyOverviewChart userId={user.id} monthsCount={6} />

      {/* Budget Overview Section */}
      <BudgetOverviewCards 
        userId={user.id} 
        onManageBudgets={handleManageBudgets}
      />

      {/* Goals Overview Section */}
      <GoalOverviewCards 
        userId={user.id} 
        onManageGoals={handleManageGoals}
      />

      {/* Recent Transactions Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TransactionList
            userId={user.id}
            onAddTransaction={handleAddTransaction}
            onEditTransaction={handleEditTransaction}
          />
        </div>
        
        <div className="space-y-6">
          {/* Budget Alerts */}
          <BudgetAlerts 
            userId={user.id} 
            onManageBudgets={handleManageBudgets}
          />

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleAddTransaction}
                className="w-full"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </CardContent>
          </Card>

          {/* Welcome Message */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                🚀 Phase 2 Complete + Charts!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed">
                Financial management with beautiful charts is now live! Track your spending trends, analyze categories, and get monthly insights.
              </p>
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-1 text-sm">✅ Phase 2 Features</h4>
                <ul className="text-xs text-green-800 space-y-1">
                  <li>• Transaction CRUD with TanStack Query</li>
                  <li>• Premium form with validation</li>
                  <li>• Advanced filtering & search</li>
                  <li>• Financial dashboard with charts</li>
                  <li>• Category management (full CRUD)</li>
                  <li>• Spending trends & analytics</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transaction Form Dialog */}
      <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </DialogTitle>
          </DialogHeader>
          <TransactionForm
            userId={user.id}
            initialData={editingTransaction ? {
              id: editingTransaction.id,
              amount: editingTransaction.amount.toString(),
              description: editingTransaction.description || '',
              categoryId: editingTransaction.category_id || '',
              date: new Date(editingTransaction.date),
              type: editingTransaction.type,
            } : undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}