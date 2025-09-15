'use client'

import { useState } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Palette } from 'lucide-react'

import { cn } from '@/lib/utils'
import { categorySchema, type CategoryInput, type Category } from '@/lib/validations/category'
import { useCreateCategory, useUpdateCategory } from '@/hooks/use-categories'
import { getIcon, AVAILABLE_ICONS } from '@/lib/utils/icons'
import { useGamification } from '@/contexts/gamification-context'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

export function CategoryForm({ userId, initialData, onSuccess, onCancel }: CategoryFormProps) {
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
  const { triggerEvent, showCelebration } = useGamification()

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
        // Trigger gamification event for category update
        await triggerEvent('category_updated', {
          categoryId: initialData.id,
          categoryName: data.name,
          categoryType: data.type,
          customizedColor: data.color !== '#6366f1',
          customizedIcon: data.icon !== 'ShoppingCart',
          action: 'update',
        })

        // Show micro-celebration for category update
        showCelebration({
          type: 'subtle',
          title: 'Category Updated! 🏷️',
          message: `Your "${data.name}" category has been successfully updated.`,
          color: data.color,
          duration: 2500,
        })

        onSuccess?.()
      }
    } else {
      const result = await createCategory.mutateAsync({
        userId,
        category: data,
      })

      if (!result.error) {
        // Trigger gamification event for new category creation
        await triggerEvent('category_created', {
          categoryName: data.name,
          categoryType: data.type,
          customizedColor: data.color !== '#6366f1',
          customizedIcon: data.icon !== 'ShoppingCart',
          action: 'create',
        })

        // Show celebration for new category creation
        showCelebration({
          type: 'medium',
          title: 'Category Created! 🎨✨',
          message: `Your new "${data.name}" category is ready to organize your ${data.type}s!`,
          color: data.color,
          duration: 4000,
          showConfetti: false,
        })

        form.reset()
        onSuccess?.()
      }
    }
  }

  const handleTypeChange = (type: string) => {
    const validType = type as 'income' | 'expense'
    setCategoryType(validType)
    form.setValue('type', validType)
  }

  return (
    <Card className="mx-auto w-full max-w-2xl border-white/20 bg-white/90 shadow-xl backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-2xl font-bold text-transparent">
          {isEditing ? 'Edit Category' : 'Create New Category'}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {isEditing
            ? 'Update your category details and settings'
            : 'Create a new category to organize your transactions'}
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Category Type Tabs */}
            <Tabs value={categoryType} onValueChange={handleTypeChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 backdrop-blur-sm">
                <TabsTrigger
                  value="expense"
                  className="text-red-600 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  💸 Expense Category
                </TabsTrigger>
                <TabsTrigger
                  value="income"
                  className="text-green-600 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  💰 Income Category
                </TabsTrigger>
              </TabsList>

              <TabsContent value="expense" className="mt-6 space-y-4">
                <CategoryFormFields form={form} categoryType="expense" />
              </TabsContent>

              <TabsContent value="income" className="mt-6 space-y-4">
                <CategoryFormFields form={form} categoryType="income" />
              </TabsContent>
            </Tabs>

            {/* Submit Buttons */}
            <div className="flex gap-3 border-t border-gray-200/50 pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'flex-1 font-medium shadow-lg transition-all duration-200 hover:shadow-xl',
                  categoryType === 'income'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                    : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
                )}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? '✏️ Update Category' : '✨ Create Category'}
              </Button>

              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="border-white/20 bg-white/50 backdrop-blur-sm transition-all duration-200 hover:bg-white/70"
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
  form: UseFormReturn<CategoryInput>
  categoryType: 'income' | 'expense'
}

function CategoryFormFields({ form, categoryType }: CategoryFormFieldsProps) {
  const watchedColor = form.watch('color')
  const watchedIcon = form.watch('icon')
  const IconComponent = getIcon(watchedIcon || null)

  // Filter icons appropriate for category type
  const getRelevantIcons = (type: 'income' | 'expense') => {
    if (type === 'income') {
      return AVAILABLE_ICONS.filter(icon =>
        ['DollarSign', 'TrendingUp', 'Briefcase', 'CreditCard', 'PiggyBank', 'Coins'].includes(
          icon.name
        )
      )
    } else {
      return AVAILABLE_ICONS.filter(
        icon => !['DollarSign', 'TrendingUp', 'Briefcase'].includes(icon.name)
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
                    ? 'e.g., Salary, Freelance, Investment Returns'
                    : 'e.g., Groceries, Transportation, Entertainment'
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Preview */}
      <div className="flex items-center gap-4 rounded-xl border bg-gradient-to-r from-gray-50/80 to-white/80 p-4 shadow-inner backdrop-blur-sm">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg ring-2 ring-white/50 transition-transform hover:scale-105"
          style={{ backgroundColor: watchedColor }}
        >
          <IconComponent className="h-6 w-6 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{form.watch('name') || 'Category Name'}</h4>
          <p className="flex items-center gap-1 text-sm capitalize text-gray-500">
            {categoryType === 'income' ? '💰' : '💸'} {categoryType} Category
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
              <Palette className="h-4 w-4" />
              Color
            </FormLabel>
            <FormControl>
              <div className="grid grid-cols-6 gap-3">
                {CATEGORY_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      'h-10 w-10 rounded-xl border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg',
                      field.value === color
                        ? 'scale-110 border-white shadow-lg ring-4 ring-gray-300/50'
                        : 'border-gray-200/60 shadow-md hover:border-white'
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
                {relevantIcons.map(iconInfo => {
                  const IconComponent = iconInfo.component
                  return (
                    <SelectItem key={iconInfo.name} value={iconInfo.name}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
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
