'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Search } from 'lucide-react'

import { useCategories, useDeleteCategory } from '@/hooks/use-categories'
import { useUser } from '@/hooks/use-user'
import { getIcon } from '@/lib/utils/icons'
import { CategoryForm } from '@/components/forms/category-form'
import { CategoriesPageHeader } from '@/components/categories/categories-page-header'
import { CategoryUsageAnalytics } from '@/components/categories/category-usage-analytics'

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
  const deleteCategory = useDeleteCategory()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')

  const categories = categoriesData?.data || []
  
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Please log in to view your categories</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <CategoriesPageHeader 
        userId={user?.id || ''} 
        onAddCategory={() => setCreateDialogOpen(true)} 
      />
      
      {/* Search and Filter */}
      <Card className="backdrop-blur-sm bg-white/40 border-white/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/50 border-white/20 backdrop-blur-sm"
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
        <Card className="backdrop-blur-sm bg-gradient-to-br from-green-50/60 to-green-100/30 border-green-200/20 shadow-lg">
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
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-gray-500 mb-2">
                  {searchQuery ? 'No income categories match your search' : 'No income categories found'}
                </p>
                <p className="text-sm text-gray-400">
                  Create your first income category to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {incomeCategories.map((category) => (
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
        <Card className="backdrop-blur-sm bg-gradient-to-br from-red-50/60 to-red-100/30 border-red-200/20 shadow-lg">
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
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-gray-500 mb-2">
                  {searchQuery ? 'No expense categories match your search' : 'No expense categories found'}
                </p>
                <p className="text-sm text-gray-400">
                  Create your first expense category to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {expenseCategories.map((category) => (
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
              Are you sure you want to delete this category? This action cannot be undone.
              Any transactions using this category will need to be reassigned.
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
              disabled={deleteCategory.isPending}
            >
              {deleteCategory.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto backdrop-blur-lg bg-white/95 border-white/20">
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto backdrop-blur-lg bg-white/95 border-white/20">
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
    <div className="group flex items-center justify-between p-4 border border-white/40 rounded-xl bg-white/30 backdrop-blur-sm hover:bg-white/50 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/50 group-hover:scale-110 transition-transform duration-200"
          style={{ backgroundColor: category.color }}
        >
          <IconComponent className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 group-hover:text-gray-800">{category.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge 
              variant={category.type === 'income' ? 'secondary' : 'destructive'}
              className="text-xs px-2 py-0.5"
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
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/60"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="backdrop-blur-sm bg-white/95 border-white/20">
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(category)} className="hover:bg-white/60">
              <Edit className="w-4 h-4 mr-2" />
              Edit Category
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem
              onClick={() => onDelete(category)}
              className="text-red-600 hover:bg-red-50/60"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Category
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}