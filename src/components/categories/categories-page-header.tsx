'use client'

import { Plus, TrendingUp, Target, BarChart3 } from 'lucide-react'

import { useCategoriesWithStats, useCategoryUsageAnalytics } from '@/hooks/use-categories'
import { formatCurrency } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

interface CategoriesPageHeaderProps {
  userId: string
  onAddCategory: () => void
}

export function CategoriesPageHeader({ userId, onAddCategory }: CategoriesPageHeaderProps) {
  const { data: categoriesData, isLoading: categoriesLoading } = useCategoriesWithStats(userId)
  const { data: analyticsData, isLoading: analyticsLoading } = useCategoryUsageAnalytics(userId)

  const categories = categoriesData?.data || []
  const analytics = analyticsData?.data

  const incomeCategories = categories.filter(cat => cat.type === 'income')
  const expenseCategories = categories.filter(cat => cat.type === 'expense')
  
  const totalIncomeAmount = incomeCategories.reduce((sum, cat) => sum + (cat.total_amount || 0), 0)
  const totalExpenseAmount = expenseCategories.reduce((sum, cat) => sum + (cat.total_amount || 0), 0)
  
  const isLoading = categoriesLoading || analyticsLoading

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Categories
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your income and expense categories with detailed insights
          </p>
        </div>
        <Button 
          onClick={onAddCategory}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Categories */}
        <Card className="backdrop-blur-sm bg-gradient-to-br from-white/60 to-white/30 border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-green-100 text-green-700">
                      {incomeCategories.length} income
                    </Badge>
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-red-100 text-red-700">
                      {expenseCategories.length} expense
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Categories */}
        <Card className="backdrop-blur-sm bg-gradient-to-br from-white/60 to-white/30 border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Categories</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics?.categoryPerformance?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {analytics?.totalTransactions || 0} total transactions
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Income Categories Value */}
        <Card className="backdrop-blur-sm bg-gradient-to-br from-green-50/60 to-green-100/30 border-green-200/20 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">Income Categories</p>
                  <p className="text-2xl font-bold text-green-800">
                    {formatCurrency(totalIncomeAmount)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Across {incomeCategories.length} categories
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Categories Value */}
        <Card className="backdrop-blur-sm bg-gradient-to-br from-red-50/60 to-red-100/30 border-red-200/20 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <Target className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-700">Expense Categories</p>
                  <p className="text-2xl font-bold text-red-800">
                    {formatCurrency(totalExpenseAmount)}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Across {expenseCategories.length} categories
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      {!isLoading && analytics && (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Most Used Category */}
          {analytics.mostUsedCategory && (
            <Card className="backdrop-blur-sm bg-gradient-to-br from-blue-50/60 to-blue-100/30 border-blue-200/20 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Most Active Category</p>
                    <p className="text-lg font-bold text-blue-900 mt-1">
                      {analytics.mostUsedCategory.category.name}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {analytics.mostUsedCategory.count} transactions • {formatCurrency(analytics.mostUsedCategory.amount)}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-100">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Unused Categories Alert */}
          {analytics.unusedCategories.length > 0 && (
            <Card className="backdrop-blur-sm bg-gradient-to-br from-amber-50/60 to-amber-100/30 border-amber-200/20 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700">Unused Categories</p>
                    <p className="text-lg font-bold text-amber-900 mt-1">
                      {analytics.unusedCategories.length} categories
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Consider removing to keep things organized
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Target className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}