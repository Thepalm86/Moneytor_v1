'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TransactionForm } from '@/components/forms/transaction-form'
import { CategoryForm } from '@/components/forms/category-form'
import { BudgetForm } from '@/components/forms/budget-form'
import { GoalForm } from '@/components/forms/goal-form'
import { 
  CreditCard, 
  FolderOpen, 
  Target, 
  PiggyBank 
} from 'lucide-react'

interface QuickActionCardsProps {
  userId: string
}

type ModalType = 'transaction' | 'category' | 'budget' | 'goal' | null

export function QuickActionCards({ userId }: QuickActionCardsProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  const handleModalClose = () => {
    setActiveModal(null)
  }

  const handleSuccess = () => {
    setActiveModal(null)
  }

  const quickActions = [
    {
      id: 'transaction',
      title: 'Add Transaction',
      subtitle: 'Record income or expense',
      icon: CreditCard,
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50/30',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      onClick: () => setActiveModal('transaction')
    },
    {
      id: 'category',
      title: 'Add Category',
      subtitle: 'Create expense or income category',
      icon: FolderOpen,
      gradient: 'from-purple-500 to-indigo-600',
      bgGradient: 'from-purple-50 to-indigo-50/30',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      onClick: () => setActiveModal('category')
    },
    {
      id: 'budget',
      title: 'Create Budget',
      subtitle: 'Set spending limits',
      icon: Target,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50/30',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      onClick: () => setActiveModal('budget')
    },
    {
      id: 'goal',
      title: 'Add Savings Goal',
      subtitle: 'Set financial targets',
      icon: PiggyBank,
      gradient: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-50 to-red-50/30',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      onClick: () => setActiveModal('goal')
    }
  ]

  return (
    <>
      {/* Quick Actions Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-2 rounded-full bg-gradient-to-b from-blue-500 to-purple-600"></div>
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <p className="text-sm text-gray-600">Quickly add new financial data</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const IconComponent = action.icon
            
            return (
              <Card
                key={action.id}
                className={`group relative cursor-pointer border-gray-200/50 bg-gradient-to-br ${action.bgGradient} shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                onClick={action.onClick}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center space-y-4 text-center">
                    {/* Icon */}
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${action.iconBg} transition-all duration-300 group-hover:scale-110`}>
                      <IconComponent className={`h-6 w-6 ${action.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="space-y-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-gray-800">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 group-hover:text-gray-700">
                        {action.subtitle}
                      </p>
                    </div>

                    {/* Hover Effect Indicator */}
                    <div className={`h-1 w-0 rounded-full bg-gradient-to-r ${action.gradient} transition-all duration-300 group-hover:w-full`} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Transaction Modal */}
      <Dialog open={activeModal === 'transaction'} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-2xl border-gray-200/50 bg-white/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-xl font-semibold text-transparent">
              Add New Transaction
            </DialogTitle>
          </DialogHeader>
          <TransactionForm
            userId={userId}
            onSuccess={handleSuccess}
            onCancel={handleModalClose}
          />
        </DialogContent>
      </Dialog>

      {/* Category Modal */}
      <Dialog open={activeModal === 'category'} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-2xl border-gray-200/50 bg-white/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-xl font-semibold text-transparent">
              Create New Category
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            userId={userId}
            onSuccess={handleSuccess}
            onCancel={handleModalClose}
          />
        </DialogContent>
      </Dialog>

      {/* Budget Modal */}
      <Dialog open={activeModal === 'budget'} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-2xl border-gray-200/50 bg-white/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-xl font-semibold text-transparent">
              Create New Budget
            </DialogTitle>
          </DialogHeader>
          <BudgetForm
            userId={userId}
            onSuccess={handleSuccess}
            onCancel={handleModalClose}
          />
        </DialogContent>
      </Dialog>

      {/* Goal Modal */}
      <Dialog open={activeModal === 'goal'} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-2xl border-gray-200/50 bg-white/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-xl font-semibold text-transparent">
              Add New Savings Goal
            </DialogTitle>
          </DialogHeader>
          <GoalForm
            userId={userId}
            onSuccess={handleSuccess}
            onCancel={handleModalClose}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}