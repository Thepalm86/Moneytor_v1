'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Search } from 'lucide-react'

import { useCategories, useDeleteCategory } from '@/hooks/use-categories'
import { useUser } from '@/hooks/use-user'
import { getIcon } from '@/lib/utils/icons'
import { CategoryForm } from '@/components/forms/category-form'
import { PageHeader, PageHeaderAction } from '@/components/layout/page-header'
import { CategoryUsageAnalytics } from '@/components/categories/category-usage-analytics'
import { useCategoriesWithStats } from '@/hooks/use-categories'
import { formatCurrency } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import type { Category } from '@/lib/validations/category'

export default function CategoriesPage() {
  const { user, isLoading: userLoading } = useUser()
  const { data: categoriesData, isLoading } = useCategories(user?.id || '')
  const { data: categoriesStatsData } = useCategoriesWithStats(user?.id || '')
  const deleteCategory = useDeleteCategory()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')

  const categories = categoriesData?.data || []
  const categoriesWithStats = categoriesStatsData?.data || []

  // Filter categories based on search and type filter
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || category.type === filterType
    return matchesSearch && matchesType
  })

  const incomeCategories = filteredCategories.filter(cat => cat.type === 'income')
  const expenseCategories = filteredCategories.filter(cat => cat.type === 'expense')

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const handleEditClick = (category: Category) => {
    setCategoryToEdit(category)
    setEditDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (categoryToDelete && user) {
      await deleteCategory.mutateAsync({
        id: categoryToDelete.id,
        userId: user.id,
      })
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  const handleFormSuccess = () => {
    setCreateDialogOpen(false)
    setEditDialogOpen(false)
    setCategoryToEdit(null)
  }

  if (userLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Please log in to view your categories</p>
      </div>
    )
  }

  // Calculate stats for header
  const headerIncomeCategories = categoriesWithStats.filter(cat => cat.type === 'income')
  const headerExpenseCategories = categoriesWithStats.filter(cat => cat.type === 'expense')
  const totalIncomeAmount = headerIncomeCategories.reduce(
    (sum, cat) => sum + ((cat as any).total_amount || 0),
    0
  )
  const totalExpenseAmount = headerExpenseCategories.reduce(
    (sum, cat) => sum + ((cat as any).total_amount || 0),
    0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Category Management"
        subtitle="Organize your finances with custom categories and detailed insights"
        actions={
          <PageHeaderAction onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </PageHeaderAction>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/20 bg-white/60 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {headerIncomeCategories.length} income • {headerExpenseCategories.length} expense
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200/20 bg-gradient-to-br from-green-50/60 to-green-100/30 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-green-100 p-2">
                <span className="text-2xl">📈</span>
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Income Categories</p>
                <p className="text-2xl font-bold text-green-800">
                  {formatCurrency(totalIncomeAmount)}
                </p>
                <p className="mt-1 text-xs text-green-600">
                  {headerIncomeCategories.length} categories active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200/20 bg-gradient-to-br from-red-50/60 to-red-100/30 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-red-100 p-2">
                <span className="text-2xl">📉</span>
              </div>
              <div>
                <p className="text-sm font-medium text-red-700">Expense Categories</p>
                <p className="text-2xl font-bold text-red-800">
                  {formatCurrency(totalExpenseAmount)}
                </p>
                <p className="mt-1 text-xs text-red-600">
                  {headerExpenseCategories.length} categories active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200/20 bg-gradient-to-br from-blue-50/60 to-blue-100/30 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Net Flow</p>
                <p
                  className={`text-2xl font-bold ${
                    totalIncomeAmount - totalExpenseAmount >= 0 ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {formatCurrency(totalIncomeAmount - totalExpenseAmount)}
                </p>
                <p className="mt-1 text-xs text-blue-600">This period</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-white/20 bg-white/40 shadow-lg backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="border-white/20 bg-white/50 pl-10 backdrop-blur-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
                className="backdrop-blur-sm"
              >
                All ({categories.length})
              </Button>
              <Button
                variant={filterType === 'income' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('income')}
                className={`backdrop-blur-sm ${filterType === 'income' ? 'bg-green-600 hover:bg-green-700' : 'text-green-600 hover:bg-green-50'}`}
              >
                Income ({categories.filter(c => c.type === 'income').length})
              </Button>
              <Button
                variant={filterType === 'expense' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('expense')}
                className={`backdrop-blur-sm ${filterType === 'expense' ? 'bg-red-600 hover:bg-red-700' : 'text-red-600 hover:bg-red-50'}`}
              >
                Expense ({categories.filter(c => c.type === 'expense').length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income Categories */}
        <Card className="border-green-200/20 bg-gradient-to-br from-green-50/60 to-green-100/30 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              💰 Income Categories
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {incomeCategories.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incomeCategories.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Plus className="h-8 w-8 text-green-600" />
                </div>
                <p className="mb-2 text-gray-500">
                  {searchQuery
                    ? 'No income categories match your search'
                    : 'No income categories found'}
                </p>
                <p className="text-sm text-gray-400">
                  Create your first income category to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {incomeCategories.map(category => (
                  <EnhancedCategoryCard
                    key={category.id}
                    category={category}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card className="border-red-200/20 bg-gradient-to-br from-red-50/60 to-red-100/30 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              💸 Expense Categories
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {expenseCategories.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenseCategories.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <Plus className="h-8 w-8 text-red-600" />
                </div>
                <p className="mb-2 text-gray-500">
                  {searchQuery
                    ? 'No expense categories match your search'
                    : 'No expense categories found'}
                </p>
                <p className="text-sm text-gray-400">
                  Create your first expense category to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {expenseCategories.map(category => (
                  <EnhancedCategoryCard
                    key={category.id}
                    category={category}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Usage Analytics */}
      <CategoryUsageAnalytics userId={user?.id || ''} />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone. Any
              transactions using this category will need to be reassigned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteCategory.isPending}
            >
              {deleteCategory.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Create New Category
            </DialogTitle>
            <DialogDescription>
              Organize your transactions with custom categories and icons.
            </DialogDescription>
          </DialogHeader>
          {user && (
            <CategoryForm
              userId={user.id}
              onSuccess={handleFormSuccess}
              onCancel={() => setCreateDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Edit Category
            </DialogTitle>
            <DialogDescription>
              Update your category details, icon, and color scheme.
            </DialogDescription>
          </DialogHeader>
          {user && categoryToEdit && (
            <CategoryForm
              userId={user.id}
              initialData={categoryToEdit}
              onSuccess={handleFormSuccess}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface CategoryCardProps {
  category: Category
  onEdit?: (category: Category) => void
  onDelete?: (category: Category) => void
}

function EnhancedCategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const IconComponent = getIcon(category.icon)

  return (
    <div className="group flex items-center justify-between rounded-xl border border-white/40 bg-white/30 p-4 backdrop-blur-sm transition-all duration-200 hover:bg-white/50 hover:shadow-lg">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full shadow-lg ring-2 ring-white/50 transition-transform duration-200 group-hover:scale-110"
          style={{ backgroundColor: category.color }}
        >
          <IconComponent className="h-5 w-5 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 group-hover:text-gray-800">{category.name}</h4>
          <div className="mt-1 flex items-center gap-2">
            <Badge
              variant={category.type === 'income' ? 'secondary' : 'destructive'}
              className="px-2 py-0.5 text-xs"
            >
              {category.type === 'income' ? '💰' : '💸'} {category.type}
            </Badge>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">
              Created {new Date(category.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 transition-opacity duration-200 hover:bg-white/60 group-hover:opacity-100"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border-white/20 bg-white/95 backdrop-blur-sm">
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(category)} className="hover:bg-white/60">
              <Edit className="mr-2 h-4 w-4" />
              Edit Category
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem
              onClick={() => onDelete(category)}
              className="text-red-600 hover:bg-red-50/60"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Category
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
