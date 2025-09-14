'use client'

import { useState } from 'react'
import { 
  BookOpen,
  Calculator,
  PieChart,
  Target,
  Zap,
  DollarSign
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
// import type { Category } from '@/lib/validations/category'

interface BudgetTemplatesProps {
  monthlyIncome?: number
  onApplyTemplate: (template: BudgetTemplate) => void
}

interface BudgetTemplate {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  budgetAllocations: BudgetAllocation[]
}

interface BudgetAllocation {
  categoryName: string
  categoryIcon: string
  percentage: number
  amount?: number
  description: string
  priority: 'essential' | 'important' | 'optional'
}

const BUDGET_TEMPLATES: BudgetTemplate[] = [
  {
    id: '50-30-20',
    name: '50/30/20 Rule',
    description: 'Simple and balanced: 50% needs, 30% wants, 20% savings',
    icon: PieChart,
    difficulty: 'beginner',
    budgetAllocations: [
      {
        categoryName: 'Housing',
        categoryIcon: 'Home',
        percentage: 25,
        description: 'Rent, mortgage, utilities',
        priority: 'essential'
      },
      {
        categoryName: 'Food',
        categoryIcon: 'Coffee',
        percentage: 15,
        description: 'Groceries and dining',
        priority: 'essential'
      },
      {
        categoryName: 'Transportation',
        categoryIcon: 'Car',
        percentage: 10,
        description: 'Car payments, gas, transit',
        priority: 'essential'
      },
      {
        categoryName: 'Shopping',
        categoryIcon: 'ShoppingBag',
        percentage: 15,
        description: 'Clothes, personal items',
        priority: 'important'
      },
      {
        categoryName: 'Entertainment',
        categoryIcon: 'Gamepad2',
        percentage: 15,
        description: 'Movies, dining out, hobbies',
        priority: 'important'
      },
      {
        categoryName: 'Savings',
        categoryIcon: 'Target',
        percentage: 20,
        description: 'Emergency fund, investments',
        priority: 'essential'
      }
    ]
  },
  {
    id: 'zero-based',
    name: 'Zero-Based Budgeting',
    description: 'Assign every dollar a purpose - income minus expenses equals zero',
    icon: Calculator,
    difficulty: 'intermediate',
    budgetAllocations: [
      {
        categoryName: 'Housing',
        categoryIcon: 'Home',
        percentage: 30,
        description: 'Fixed housing costs',
        priority: 'essential'
      },
      {
        categoryName: 'Food',
        categoryIcon: 'Coffee',
        percentage: 12,
        description: 'Planned grocery budget',
        priority: 'essential'
      },
      {
        categoryName: 'Transportation',
        categoryIcon: 'Car',
        percentage: 8,
        description: 'Vehicle and commute costs',
        priority: 'essential'
      },
      {
        categoryName: 'Utilities',
        categoryIcon: 'Phone',
        percentage: 8,
        description: 'Phone, internet, insurance',
        priority: 'essential'
      },
      {
        categoryName: 'Debt Payment',
        categoryIcon: 'CreditCard',
        percentage: 15,
        description: 'Credit cards, loans',
        priority: 'essential'
      },
      {
        categoryName: 'Emergency Fund',
        categoryIcon: 'Target',
        percentage: 10,
        description: '3-6 months expenses',
        priority: 'essential'
      },
      {
        categoryName: 'Investments',
        categoryIcon: 'Target',
        percentage: 10,
        description: '401k, IRA, stocks',
        priority: 'important'
      },
      {
        categoryName: 'Personal',
        categoryIcon: 'Heart',
        percentage: 7,
        description: 'Healthcare, personal care',
        priority: 'important'
      }
    ]
  },
  {
    id: 'envelope',
    name: 'Envelope Method',
    description: 'Digital envelopes for each spending category with strict limits',
    icon: BookOpen,
    difficulty: 'beginner',
    budgetAllocations: [
      {
        categoryName: 'Groceries',
        categoryIcon: 'ShoppingBag',
        percentage: 20,
        description: 'Weekly grocery envelope',
        priority: 'essential'
      },
      {
        categoryName: 'Gas',
        categoryIcon: 'Car',
        percentage: 8,
        description: 'Fuel envelope',
        priority: 'essential'
      },
      {
        categoryName: 'Dining Out',
        categoryIcon: 'Coffee',
        percentage: 10,
        description: 'Restaurant envelope',
        priority: 'important'
      },
      {
        categoryName: 'Entertainment',
        categoryIcon: 'Gamepad2',
        percentage: 8,
        description: 'Fun money envelope',
        priority: 'optional'
      },
      {
        categoryName: 'Shopping',
        categoryIcon: 'ShoppingBag',
        percentage: 12,
        description: 'Clothing and misc envelope',
        priority: 'important'
      },
      {
        categoryName: 'Personal Care',
        categoryIcon: 'Heart',
        percentage: 5,
        description: 'Health and beauty envelope',
        priority: 'important'
      },
      {
        categoryName: 'Emergency Fund',
        categoryIcon: 'Target',
        percentage: 15,
        description: 'Emergency envelope',
        priority: 'essential'
      },
      {
        categoryName: 'Long-term Savings',
        categoryIcon: 'Target',
        percentage: 22,
        description: 'Goals and investments envelope',
        priority: 'essential'
      }
    ]
  },
  {
    id: 'aggressive-savings',
    name: 'Aggressive Savings',
    description: 'Maximize savings and investments - for high earners or minimal spenders',
    icon: Target,
    difficulty: 'advanced',
    budgetAllocations: [
      {
        categoryName: 'Housing',
        categoryIcon: 'Home',
        percentage: 20,
        description: 'Minimal housing costs',
        priority: 'essential'
      },
      {
        categoryName: 'Food',
        categoryIcon: 'Coffee',
        percentage: 8,
        description: 'Frugal eating plan',
        priority: 'essential'
      },
      {
        categoryName: 'Transportation',
        categoryIcon: 'Car',
        percentage: 5,
        description: 'Public transit or cycling',
        priority: 'essential'
      },
      {
        categoryName: 'Utilities',
        categoryIcon: 'Phone',
        percentage: 5,
        description: 'Basic services only',
        priority: 'essential'
      },
      {
        categoryName: 'Personal',
        categoryIcon: 'Heart',
        percentage: 4,
        description: 'Minimal personal spending',
        priority: 'important'
      },
      {
        categoryName: 'Entertainment',
        categoryIcon: 'Gamepad2',
        percentage: 3,
        description: 'Low-cost entertainment',
        priority: 'optional'
      },
      {
        categoryName: 'Emergency Fund',
        categoryIcon: 'Target',
        percentage: 15,
        description: '6-12 months expenses',
        priority: 'essential'
      },
      {
        categoryName: 'Investments',
        categoryIcon: 'Target',
        percentage: 40,
        description: 'Retirement and growth',
        priority: 'essential'
      }
    ]
  }
]

export function BudgetTemplates({ monthlyIncome, onApplyTemplate }: BudgetTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<BudgetTemplate | null>(null)
  const [customIncome, setCustomIncome] = useState<string>(monthlyIncome?.toString() || '')
  const [showPreview, setShowPreview] = useState(false)

  const handlePreviewTemplate = (template: BudgetTemplate) => {
    setSelectedTemplate(template)
    setShowPreview(true)
  }

  const handleApplyTemplate = () => {
    if (selectedTemplate) {
      const income = parseFloat(customIncome) || monthlyIncome || 0
      const templateWithAmounts = {
        ...selectedTemplate,
        budgetAllocations: selectedTemplate.budgetAllocations.map(allocation => ({
          ...allocation,
          amount: (income * allocation.percentage) / 100
        }))
      }
      onApplyTemplate(templateWithAmounts)
      setShowPreview(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Budget Templates</h2>
          <p className="text-sm text-gray-600">Quick start with proven budgeting methods</p>
        </div>
      </div>

      {/* Income Input */}
      {!monthlyIncome && (
        <Card className="glass-card bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <Label htmlFor="income" className="text-sm font-medium text-blue-900">
                  Monthly Income (optional)
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="income"
                    type="number"
                    placeholder="Enter your monthly income"
                    value={customIncome}
                    onChange={(e) => setCustomIncome(e.target.value)}
                    className="max-w-xs"
                  />
                  <span className="text-sm text-blue-700">
                    This helps calculate specific budget amounts
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {BUDGET_TEMPLATES.map((template) => (
          <Card key={template.id} className="glass-card hover:shadow-lg transition-all cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200">
                    <template.icon className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge className={`text-xs mt-1 ${getDifficultyColor(template.difficulty)}`}>
                      {template.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {template.description}
              </p>
              
              {/* Key Allocations Preview */}
              <div className="space-y-2 mb-4">
                {template.budgetAllocations.slice(0, 3).map((allocation, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-300" />
                      <span className="text-gray-700">{allocation.categoryName}</span>
                    </div>
                    <span className="font-medium">{allocation.percentage}%</span>
                  </div>
                ))}
                {template.budgetAllocations.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{template.budgetAllocations.length - 3} more categories
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreviewTemplate(template)}
                  className="flex-1"
                >
                  Preview
                </Button>
                <Button
                  size="sm"
                  onClick={() => handlePreviewTemplate(template)}
                  className="flex-1 group-hover:bg-primary"
                >
                  Apply Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Template Section */}
      <Card className="glass-card border-dashed">
        <CardContent className="p-6 text-center">
          <Zap className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Custom Template</h3>
          <p className="text-sm text-gray-600 mb-4">
            Design your own budgeting method based on your unique financial situation
          </p>
          <Button variant="outline" className="mb-2">
            <Calculator className="h-4 w-4 mr-2" />
            Build Custom Template
          </Button>
          <p className="text-xs text-gray-500">Coming soon - advanced template builder</p>
        </CardContent>
      </Card>

      {/* Template Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedTemplate && <selectedTemplate.icon className="h-5 w-5" />}
              {selectedTemplate?.name} Preview
            </DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                {selectedTemplate.description}
              </p>

              {/* Income Display */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Monthly Income:</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={customIncome}
                      onChange={(e) => setCustomIncome(e.target.value)}
                      className="w-32 h-8 text-sm"
                      placeholder="Enter income"
                    />
                  </div>
                </div>
              </div>

              <Tabs defaultValue="allocations" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="allocations">Budget Breakdown</TabsTrigger>
                  <TabsTrigger value="priorities">Priority Levels</TabsTrigger>
                </TabsList>

                <TabsContent value="allocations" className="space-y-3">
                  {selectedTemplate.budgetAllocations.map((allocation, index) => {
                    const amount = customIncome ? (parseFloat(customIncome) * allocation.percentage) / 100 : 0
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs">{allocation.categoryIcon.slice(0, 2)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900">{allocation.categoryName}</p>
                            <p className="text-xs text-gray-600">{allocation.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{allocation.percentage}%</p>
                          {amount > 0 && (
                            <p className="text-xs text-gray-600">${amount.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </TabsContent>

                <TabsContent value="priorities" className="space-y-4">
                  {['essential', 'important', 'optional'].map(priority => (
                    <div key={priority}>
                      <h4 className="font-medium text-sm mb-2 capitalize flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          priority === 'essential' ? 'bg-red-400' :
                          priority === 'important' ? 'bg-yellow-400' : 'bg-green-400'
                        }`} />
                        {priority} ({selectedTemplate.budgetAllocations.filter(a => a.priority === priority).length})
                      </h4>
                      <div className="space-y-2">
                        {selectedTemplate.budgetAllocations
                          .filter(allocation => allocation.priority === priority)
                          .map((allocation, index) => (
                            <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                              <span>{allocation.categoryName}</span>
                              <span className="font-medium">{allocation.percentage}%</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleApplyTemplate} 
                  className="flex-1"
                  disabled={!customIncome && !monthlyIncome}
                >
                  Apply This Template
                </Button>
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}