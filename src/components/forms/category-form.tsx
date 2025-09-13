'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Palette } from 'lucide-react'

import { cn } from '@/lib/utils'
import { categorySchema, type CategoryInput, type Category } from '@/lib/validations/category'
import { useCreateCategory, useUpdateCategory } from '@/hooks/use-categories'
import { getIcon, AVAILABLE_ICONS } from '@/lib/utils/icons'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// Predefined color palette
const CATEGORY_COLORS = [
  '#6366f1', // Indigo (default)
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#84cc16', // Lime
  '#eab308', // Yellow
  '#f59e0b', // Amber
  '#f97316', // Orange
  '#ef4444', // Red
  '#ec4899', // Pink
  '#a855f7', // Purple
  '#6b7280', // Gray
]

interface CategoryFormProps {
  userId: string
  initialData?: Partial<Category>
  onSuccess?: () => void
  onCancel?: () => void
}

export function CategoryForm({ 
  userId, 
  initialData, 
  onSuccess, 
  onCancel 
}: CategoryFormProps) {
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>(
    initialData?.type || 'expense'
  )

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || 'expense',
      color: initialData?.color || '#6366f1',
      icon: initialData?.icon || 'ShoppingCart',
    },
  })

  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()

  const isEditing = !!initialData?.id
  const isLoading = createCategory.isPending || updateCategory.isPending

  const onSubmit = async (data: CategoryInput) => {
    if (isEditing && initialData?.id) {
      const result = await updateCategory.mutateAsync({
        id: initialData.id,
        userId,
        updates: data,
      })

      if (!result.error) {
        onSuccess?.()
      }
    } else {
      const result = await createCategory.mutateAsync({
        userId,
        category: data,
      })

      if (!result.error) {
        form.reset()
        onSuccess?.()
      }
    }
  }

  const handleTypeChange = (type: 'income' | 'expense') => {
    setCategoryType(type)
    form.setValue('type', type)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Category' : 'Create New Category'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Category Type Tabs */}
            <Tabs
              value={categoryType}
              onValueChange={handleTypeChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="expense" 
                  className="text-red-600 data-[state=active]:text-red-600"
                >
                  Expense Category
                </TabsTrigger>
                <TabsTrigger 
                  value="income" 
                  className="text-green-600 data-[state=active]:text-green-600"
                >
                  Income Category
                </TabsTrigger>
              </TabsList>

              <TabsContent value="expense" className="space-y-4 mt-6">
                <CategoryFormFields 
                  form={form}
                  categoryType="expense"
                />
              </TabsContent>

              <TabsContent value="income" className="space-y-4 mt-6">
                <CategoryFormFields 
                  form={form}
                  categoryType="income"
                />
              </TabsContent>
            </Tabs>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "flex-1",
                  categoryType === 'income' 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-red-600 hover:bg-red-700"
                )}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Category' : 'Create Category'}
              </Button>
              
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

interface CategoryFormFieldsProps {
  form: any
  categoryType: 'income' | 'expense'
}

function CategoryFormFields({ form, categoryType }: CategoryFormFieldsProps) {
  const watchedColor = form.watch('color')
  const watchedIcon = form.watch('icon')
  const IconComponent = getIcon(watchedIcon)

  // Filter icons appropriate for category type
  const getRelevantIcons = (type: 'income' | 'expense') => {
    if (type === 'income') {
      return AVAILABLE_ICONS.filter(icon => 
        ['DollarSign', 'TrendingUp', 'Briefcase', 'CreditCard', 'PiggyBank', 'Coins'].includes(icon.name)
      )
    } else {
      return AVAILABLE_ICONS.filter(icon => 
        !['DollarSign', 'TrendingUp', 'Briefcase'].includes(icon.name)
      )
    }
  }

  const relevantIcons = getRelevantIcons(categoryType)

  return (
    <>
      {/* Category Name */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category Name</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={
                  categoryType === 'income' 
                    ? "e.g., Salary, Freelance, Investment Returns" 
                    : "e.g., Groceries, Transportation, Entertainment"
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Preview */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm"
          style={{ backgroundColor: watchedColor }}
        >
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="font-medium text-gray-900">
            {form.watch('name') || 'Category Name'}
          </h4>
          <p className="text-sm text-gray-500 capitalize">
            {categoryType} Category
          </p>
        </div>
      </div>

      {/* Color Selection */}
      <FormField
        control={form.control}
        name="color"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Color
            </FormLabel>
            <FormControl>
              <div className="grid grid-cols-6 gap-2">
                {CATEGORY_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      field.value === color 
                        ? "border-gray-400 ring-2 ring-offset-1 ring-gray-300" 
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => field.onChange(color)}
                  />
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Icon Selection */}
      <FormField
        control={form.control}
        name="icon"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Icon</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-60">
                {relevantIcons.map((iconInfo) => {
                  const IconComponent = iconInfo.component
                  return (
                    <SelectItem key={iconInfo.name} value={iconInfo.name}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        {iconInfo.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}