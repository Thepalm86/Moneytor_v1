'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'

import { useCategories, useDeleteCategory } from '@/hooks/use-categories'
import { useUser } from '@/hooks/use-user'
import { getIcon } from '@/lib/utils/icons'
import { CategoryForm } from '@/components/forms/category-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

  const categories = categoriesData?.data || []
  const incomeCategories = categories.filter(cat => cat.type === 'income')
  const expenseCategories = categories.filter(cat => cat.type === 'expense')

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">Manage your income and expense categories</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              Income Categories
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {incomeCategories.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incomeCategories.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No income categories found</p>
            ) : (
              <div className="space-y-3">
                {incomeCategories.map((category) => (
                  <CategoryCard
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              Expense Categories
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {expenseCategories.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenseCategories.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No expense categories found</p>
            ) : (
              <div className="space-y-3">
                {expenseCategories.map((category) => (
                  <CategoryCard
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

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📋 Category Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Categories help organize your transactions and provide better insights into your spending patterns. 
            Create custom categories with personalized colors and icons to match your financial workflow.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-1 text-sm">✅ Available Now</h4>
              <ul className="text-xs text-green-800 space-y-1">
                <li>• Create custom categories</li>
                <li>• Edit category names, colors, and icons</li>
                <li>• Delete unused categories</li>
                <li>• Income and expense categorization</li>
              </ul>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-1 text-sm">🚧 Coming Soon</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Category-based budgeting</li>
                <li>• Spending analysis by category</li>
                <li>• Category performance metrics</li>
                <li>• Advanced category rules</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const IconComponent = getIcon(category.icon)

  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: category.color }}
        >
          <IconComponent className="w-4 h-4 text-white" />
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{category.name}</h4>
          <p className="text-xs text-gray-500">
            {category.type === 'income' ? 'Income' : 'Expense'} • Created {new Date(category.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(category)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Category
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem
              onClick={() => onDelete(category)}
              className="text-red-600"
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