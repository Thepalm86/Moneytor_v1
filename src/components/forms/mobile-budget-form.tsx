'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Target, Calendar, CheckCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import { budgetSchema, type BudgetInput } from '@/lib/validations/budget'
import { useCreateBudget, useUpdateBudget } from '@/hooks/use-budgets'
import { useCategoriesByType } from '@/hooks/use-categories'
import { getIcon } from '@/lib/utils/icons'
import { useCurrency } from '@/contexts/currency-context'

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MobileFormWizard, MobileFormStep, type MobileFormWizardStep } from './mobile-form-wizard'
import { MobileAmountInput, MobileDatePicker, MobileFormSection } from './mobile-form-components'
import { MobileCard } from '@/components/ui/mobile-card'

interface MobileBudgetFormProps {
  userId: string
  initialData?: Partial<BudgetInput> & { id?: string }
  onSuccess?: () => void
  onCancel?: () => void
}

export function MobileBudgetForm({
  userId,
  initialData,
  onSuccess,
  onCancel,
}: MobileBudgetFormProps) {
  const { formatCurrency } = useCurrency()
  const [currentStep, setCurrentStep] = React.useState('category')
  const [selectedCategory, setSelectedCategory] = React.useState<{
    id: string
    name: string
    type: string
    color: string
    icon: string | null
  } | null>(null)

  const form = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      categoryId: initialData?.categoryId || '',
      amount: initialData?.amount || 0,
      period: initialData?.period || 'monthly',
      startDate: initialData?.startDate || new Date(),
      endDate: initialData?.endDate || new Date(),
    },
  })

  const { data: categoriesData } = useCategoriesByType(userId, 'expense')
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()

  const categories = categoriesData?.data || []
  const isUpdating = !!initialData?.id

  const onSubmit = async (data: BudgetInput) => {
    try {
      if (isUpdating) {
        await updateBudget.mutateAsync({
          id: initialData!.id!,
          userId,
          updates: data,
        })
      } else {
        await createBudget.mutateAsync({ userId, budget: data })
      }
      onSuccess?.()
    } catch {
      // Error handling is done by the mutations
    }
  }

  // Form validation for each step
  const validateStep = (stepId: string): boolean => {
    const values = form.getValues()

    switch (stepId) {
      case 'category':
        return !!values.categoryId
      case 'details':
        return values.amount > 0
      case 'period':
        return !!values.period && !!values.startDate
      case 'review':
        return form.formState.isValid
      default:
        return true
    }
  }

  // Get selected category details
  React.useEffect(() => {
    const categoryId = form.watch('categoryId')
    if (categoryId) {
      const category = categories.find(c => c.id === categoryId)
      setSelectedCategory(category || null)
    }
  }, [form, categories])

  const steps: MobileFormWizardStep[] = [
    {
      id: 'category',
      title: 'Choose Category',
      description: 'Select the expense category for your budget',
      isValid: validateStep('category'),
      component: (
        <MobileFormStep
          title="Which category do you want to budget for?"
          description="Choose an expense category to track spending against your budget"
        >
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="grid gap-3">
                    {categories.map(category => {
                      const IconComponent = getIcon(category.icon)
                      const isSelected = field.value === category.id

                      return (
                        <Button
                          key={category.id}
                          type="button"
                          variant="outline"
                          size="lg"
                          onClick={() => field.onChange(category.id)}
                          className={cn(
                            'h-auto justify-start p-4 transition-all',
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'hover:bg-gray-50'
                          )}
                        >
                          <div
                            className="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                            style={{ backgroundColor: category.color }}
                          >
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold">{category.name}</div>
                            <div className="text-sm text-gray-500">{category.type} category</div>
                          </div>
                          {isSelected && <CheckCircle className="ml-auto h-5 w-5 text-blue-600" />}
                        </Button>
                      )
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </MobileFormStep>
      ),
    },
    {
      id: 'details',
      title: 'Budget Amount',
      description: 'Set your spending limit for this category',
      isValid: validateStep('details'),
      component: (
        <MobileFormStep
          title="Set your budget amount"
          description="Set the spending limit for this category"
        >
          <MobileFormSection>
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MobileAmountInput
                      label="Budget Amount"
                      currency="$"
                      onChange={value => field.onChange(value || 0)}
                      error={form.formState.errors.amount?.message}
                      helperText="Set your spending limit for this category"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedCategory && (
              <MobileCard variant="glass" size="sm">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: selectedCategory.color }}
                  >
                    {React.createElement(getIcon(selectedCategory.icon || 'Package'), {
                      className: 'w-4 h-4 text-white',
                    })}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedCategory.name}</p>
                    <p className="text-sm text-gray-500">Selected category</p>
                  </div>
                </div>
              </MobileCard>
            )}
          </MobileFormSection>
        </MobileFormStep>
      ),
    },
    {
      id: 'period',
      title: 'Time Period',
      description: 'Set the budget period and dates',
      isValid: validateStep('period'),
      component: (
        <MobileFormStep
          title="When does this budget apply?"
          description="Set the time period for your budget tracking"
        >
          <MobileFormSection>
            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Budget Period</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['weekly', 'monthly'] as const).map(period => (
                          <Button
                            key={period}
                            type="button"
                            variant={field.value === period ? 'default' : 'outline'}
                            size="lg"
                            onClick={() => field.onChange(period)}
                            className="justify-center"
                          >
                            {period === 'weekly' && <Calendar className="mr-2 h-4 w-4" />}
                            {period === 'monthly' && <Target className="mr-2 h-4 w-4" />}
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MobileDatePicker
                      label="Start Date"
                      value={field.value}
                      onChange={field.onChange}
                      error={form.formState.errors.startDate?.message}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MobileDatePicker
                      label="End Date"
                      value={field.value}
                      onChange={field.onChange}
                      error={form.formState.errors.endDate?.message}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </MobileFormSection>
        </MobileFormStep>
      ),
    },
    {
      id: 'review',
      title: 'Review & Create',
      description: 'Review your budget settings before creating',
      isValid: validateStep('review'),
      component: (
        <MobileFormStep
          title="Review your budget"
          description="Make sure everything looks correct before creating your budget"
        >
          <MobileFormSection>
            <MobileCard variant="elevated">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Category:</span>
                  <div className="flex items-center gap-2">
                    {selectedCategory && (
                      <>
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: selectedCategory.color }}
                        />
                        <span className="font-medium">{selectedCategory.name}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Budget Name:</span>
                  <span className="font-medium">
                    {selectedCategory?.name + ' Budget' || 'Not set'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(form.watch('amount') || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Period:</span>
                  <Badge variant="secondary">
                    {form.watch('period')?.charAt(0).toUpperCase() + form.watch('period')?.slice(1)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {form.watch('startDate') && form.watch('endDate')
                      ? `${new Date(form.watch('startDate')!).toLocaleDateString()} - ${new Date(form.watch('endDate')!).toLocaleDateString()}`
                      : 'Not set'}
                  </span>
                </div>
              </div>
            </MobileCard>
          </MobileFormSection>
        </MobileFormStep>
      ),
    },
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="h-full">
        <MobileFormWizard
          steps={steps}
          currentStepId={currentStep}
          onStepChange={setCurrentStep}
          onComplete={form.handleSubmit(onSubmit)}
          onCancel={onCancel}
          enableSwipeNavigation
          showProgress
        />
      </form>
    </Form>
  )
}

export type { MobileBudgetFormProps }
