'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Target, TrendingUp, TrendingDown, AlertTriangle, BarChart3, Trophy, Brain } from 'lucide-react'

import { useBudgetsWithStats, useDeleteBudget } from '@/hooks/use-budgets'
import { useUser } from '@/hooks/use-user'
// import { useCategoriesByType } from '@/hooks/use-categories'
import { useBudgetInsights } from '@/hooks/use-budget-insights'
import { getIcon } from '@/lib/utils/icons'
import { BudgetForm } from '@/components/forms/budget-form'
import { BudgetIntelligence } from '@/components/budgets/budget-intelligence'
import { BudgetPerformanceCharts } from '@/components/budgets/budget-performance-charts'
import { BudgetTemplates } from '@/components/budgets/budget-templates'
import { BudgetCelebrations } from '@/components/budgets/budget-celebrations'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { BudgetWithStats } from '@/lib/validations/budget'

export default function BudgetsPage() {
  const { user, isLoading: userLoading } = useUser()
  const [periodFilter, setPeriodFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  const { data: budgetsData, isLoading } = useBudgetsWithStats(user?.id || '', {
    period: periodFilter !== 'all' ? periodFilter as any : undefined,
    overBudget: statusFilter === 'over' ? true : statusFilter === 'under' ? false : undefined,
  })
  // const { data: categoriesData } = useCategoriesByType(user?.id || '', 'expense')
  const deleteBudget = useDeleteBudget()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [budgetToDelete, setBudgetToDelete] = useState<BudgetWithStats | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [budgetToEdit, setBudgetToEdit] = useState<BudgetWithStats | null>(null)

  const budgets = budgetsData?.data || []
  // const categories = categoriesData?.data || []
  const activeBudgets = budgets.filter(budget => !budget.end_date || new Date(budget.end_date) > new Date())
  const overBudgetCount = budgets.filter(budget => budget.is_over_budget).length
  const { analytics } = useBudgetInsights(budgets)

  const handleDeleteClick = (budget: BudgetWithStats) => {
    setBudgetToDelete(budget)
    setDeleteDialogOpen(true)
  }

  const handleEditClick = (budget: BudgetWithStats) => {
    const editData = {
      ...budget,
      categoryId: budget.category_id,
      startDate: new Date(budget.start_date),
      endDate: budget.end_date ? new Date(budget.end_date) : undefined,
    }
    setBudgetToEdit(editData)
    setEditDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (budgetToDelete && user) {
      await deleteBudget.mutateAsync({
        id: budgetToDelete.id,
        userId: user.id,
      })
      setDeleteDialogOpen(false)
      setBudgetToDelete(null)
    }
  }

  const handleFormSuccess = () => {
    setCreateDialogOpen(false)
    setEditDialogOpen(false)
    setBudgetToEdit(null)
  }

  const handleApplyTemplate = (template: { id: string; name: string; budgetAllocations: Array<{ categoryName: string; amount?: number }> }) => {
    // This would create multiple budgets based on template
    console.log('Applying template:', template)
    // For now, just show a placeholder
  }

  if (userLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Please log in to view your budgets</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-600">Track and manage your spending limits with intelligent insights</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Budget
        </Button>
      </div>

      {/* Enhanced Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Budgets</p>
                <p className="text-lg font-semibold">{budgets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Budgets</p>
                <p className="text-lg font-semibold">{activeBudgets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Over Budget</p>
                <p className="text-lg font-semibold text-red-600">{overBudgetCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Savings</p>
                <p className="text-lg font-semibold text-green-600">
                  ${analytics.savingsTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Budget Management Interface */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Intelligence
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Achievements
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Period:</span>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="under">Under Budget</SelectItem>
                  <SelectItem value="over">Over Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Budgets List */}
          <div className="space-y-4">
            {budgets.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No budgets found</h3>
                  <p className="text-gray-600 mb-4">
                    Create your first budget to start tracking your spending limits.
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Budget
                  </Button>
                </CardContent>
              </Card>
            ) : (
              budgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ))
            )}
          </div>
        </TabsContent>

        {/* Budget Intelligence Tab */}
        <TabsContent value="intelligence">
          <BudgetIntelligence userId={user?.id || ''} budgets={budgets} />
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <BudgetPerformanceCharts budgets={budgets} />
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <BudgetTemplates 
            onApplyTemplate={handleApplyTemplate}
          />
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements">
          <BudgetCelebrations budgets={budgets} />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Budget</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this budget? This action cannot be undone.
              Your transaction history will remain unchanged.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteBudget.isPending}
            >
              {deleteBudget.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Budget Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {user && (
            <BudgetForm
              userId={user.id}
              onSuccess={handleFormSuccess}
              onCancel={() => setCreateDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Budget Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {user && budgetToEdit && (
            <BudgetForm
              userId={user.id}
              initialData={budgetToEdit}
              onSuccess={handleFormSuccess}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface BudgetCardProps {
  budget: BudgetWithStats
  onEdit?: (budget: BudgetWithStats) => void
  onDelete?: (budget: BudgetWithStats) => void
}

function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const IconComponent = getIcon(budget.category?.icon || 'DollarSign')
  const progressValue = Math.min(budget.spent_percentage, 100)
  const isOverBudget = budget.is_over_budget
  const isNearLimit = budget.spent_percentage >= 80 && !isOverBudget

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      isOverBudget && "border-red-200 bg-red-50",
      isNearLimit && "border-yellow-200 bg-yellow-50"
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: budget.category?.color || '#6b7280' }}
            >
              <IconComponent className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {budget.category?.name || 'Unknown Category'}
              </h3>
              <p className="text-sm text-gray-500 capitalize">
                {budget.period} budget
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOverBudget && (
              <Badge variant="destructive" className="bg-red-100 text-red-800">
                Over Budget
              </Badge>
            )}
            {isNearLimit && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Near Limit
              </Badge>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(budget)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Budget
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(budget)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Budget
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-3">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                ${budget.spent_amount.toFixed(2)} of ${budget.amount.toFixed(2)}
              </span>
              <span className={cn(
                "font-medium",
                isOverBudget ? "text-red-600" : 
                isNearLimit ? "text-yellow-600" : "text-gray-900"
              )}>
                {progressValue.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={progressValue}
              className={cn(
                "h-2",
                isOverBudget && "[&>div]:bg-red-500",
                isNearLimit && "[&>div]:bg-yellow-500"
              )}
            />
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Remaining</p>
              <p className={cn(
                "font-medium",
                budget.remaining_amount < 0 ? "text-red-600" : "text-green-600"
              )}>
                ${Math.abs(budget.remaining_amount).toFixed(2)}
                {budget.remaining_amount < 0 ? " over" : " left"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Transactions</p>
              <p className="font-medium">{budget.transaction_count}</p>
            </div>
          </div>

          {/* Period Info */}
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
            Started {new Date(budget.start_date).toLocaleDateString()}
            {budget.end_date && (
              <span> • Ends {new Date(budget.end_date).toLocaleDateString()}</span>
            )}
            {budget.days_remaining !== undefined && budget.days_remaining > 0 && (
              <span> • {budget.days_remaining} days remaining</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}