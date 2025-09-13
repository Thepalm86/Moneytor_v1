'use client'

import { useState } from 'react'
import { TransactionList } from '@/components/financial/transaction-list'
import { TransactionForm } from '@/components/forms/transaction-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useUser } from '@/hooks/use-user'
import type { Transaction } from '@/lib/validations/transaction'

export default function TransactionsPage() {
  const { user, isLoading } = useUser()
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const handleAddTransaction = () => {
    setEditingTransaction(null)
    setShowForm(true)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingTransaction(null)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingTransaction(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Please log in to view your transactions</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <TransactionList
        userId={user.id}
        onAddTransaction={handleAddTransaction}
        onEditTransaction={handleEditTransaction}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </DialogTitle>
          </DialogHeader>
          <TransactionForm
            userId={user.id}
            initialData={editingTransaction ? {
              id: editingTransaction.id,
              amount: editingTransaction.amount.toString(),
              description: editingTransaction.description || '',
              categoryId: editingTransaction.category_id || '',
              date: new Date(editingTransaction.date),
              type: editingTransaction.type,
            } : undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}