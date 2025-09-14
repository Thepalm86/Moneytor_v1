'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useCategories } from '@/hooks/use-categories'
import { useUpdateTransaction, useDeleteTransaction } from '@/hooks/use-transactions'
import { useCurrency } from '@/contexts/currency-context'
import type { Transaction } from '@/lib/validations/transaction'
import { 
  CheckSquare,
  Square,
  Trash2,
  FolderOpen,
  Download,
  Archive,
  AlertTriangle,
  X
} from 'lucide-react'
import { toast } from 'sonner'

interface BulkOperationsProps {
  userId: string
  transactions: Transaction[]
  selectedTransactions: string[]
  onSelectionChange: (selectedIds: string[]) => void
  onExport: (transactionIds: string[]) => void
}

type BulkAction = 'categorize' | 'delete' | 'archive' | 'export' | null

export function BulkOperations({
  userId,
  transactions,
  selectedTransactions,
  onSelectionChange,
  onExport
}: BulkOperationsProps) {
  const { formatCurrency } = useCurrency()
  const [activeAction, setActiveAction] = useState<BulkAction>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const { data: categoriesData } = useCategories(userId)
  const updateTransaction = useUpdateTransaction()
  const deleteTransaction = useDeleteTransaction()

  const categories = categoriesData?.data || []
  const selectedCount = selectedTransactions.length
  const selectedTransactionObjects = transactions.filter(t => selectedTransactions.includes(t.id))

  const totalSelectedAmount = selectedTransactionObjects.reduce(
    (sum, transaction) => sum + Number(transaction.amount), 
    0
  )

  const handleSelectAll = () => {
    if (selectedTransactions.length === transactions.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(transactions.map(t => t.id))
    }
  }

  const handleBulkAction = (action: BulkAction) => {
    if (selectedCount === 0) {
      toast.error('Please select transactions first')
      return
    }
    
    if (action === 'delete' || action === 'archive') {
      setActiveAction(action)
      setShowConfirmDialog(true)
    } else if (action === 'export') {
      onExport(selectedTransactions)
    } else {
      setActiveAction(action)
    }
  }

  const confirmBulkAction = async () => {
    if (!activeAction) return

    try {
      if (activeAction === 'delete') {
        // Delete transactions one by one
        for (const transactionId of selectedTransactions) {
          await deleteTransaction.mutateAsync({ id: transactionId, userId })
        }
        toast.success(`Deleted ${selectedCount} transactions`)
        onSelectionChange([])
      } else if (activeAction === 'categorize' && selectedCategoryId) {
        // Update category for selected transactions
        for (const transactionId of selectedTransactions) {
          await updateTransaction.mutateAsync({
            id: transactionId,
            userId,
            updates: { categoryId: selectedCategoryId }
          })
        }
        toast.success(`Updated category for ${selectedCount} transactions`)
        setSelectedCategoryId('')
        onSelectionChange([])
      }
      
      setActiveAction(null)
      setShowConfirmDialog(false)
    } catch (error) {
      toast.error(`Failed to perform bulk action: ${error}`)
    }
  }

  const cancelBulkAction = () => {
    setActiveAction(null)
    setSelectedCategoryId('')
    setShowConfirmDialog(false)
  }

  if (selectedCount === 0) {
    return null
  }

  return (
    <>
      <Card className="border-orange-200/50 bg-gradient-to-r from-orange-50 to-amber-50/30 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-100">
                <CheckSquare className="h-4 w-4 text-orange-600" />
              </div>
              Bulk Operations
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {selectedCount} selected
              </Badge>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectionChange([])}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Selection Summary */}
          <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-orange-200/30">
            <div className="space-y-1">
              <div className="font-semibold text-gray-900">
                {selectedCount} transactions selected
              </div>
              <div className="text-sm text-gray-600">
                Total value: {formatCurrency(totalSelectedAmount)}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="border-orange-200 hover:border-orange-300"
            >
              {selectedTransactions.length === transactions.length ? (
                <>
                  <Square className="h-4 w-4 mr-1" />
                  Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4 mr-1" />
                  Select All ({transactions.length})
                </>
              )}
            </Button>
          </div>

          {/* Bulk Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('categorize')}
              className="flex items-center gap-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
            >
              <FolderOpen className="h-4 w-4 text-blue-600" />
              Categorize
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('export')}
              className="flex items-center gap-2 border-green-200 hover:border-green-300 hover:bg-green-50"
            >
              <Download className="h-4 w-4 text-green-600" />
              Export
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('archive')}
              className="flex items-center gap-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
              disabled
            >
              <Archive className="h-4 w-4 text-purple-600" />
              Archive
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('delete')}
              className="flex items-center gap-2 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>

          {/* Category Selection (when categorize is active) */}
          {activeAction === 'categorize' && (
            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200/30">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-blue-900">
                  Select category for {selectedCount} transactions:
                </Label>
                <div className="flex gap-2">
                  <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Choose category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={confirmBulkAction}
                    disabled={!selectedCategoryId || updateTransaction.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {updateTransaction.isPending ? 'Updating...' : 'Apply'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cancelBulkAction}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Selected Transactions Preview */}
          <div className="max-h-32 overflow-y-auto space-y-1">
            {selectedTransactionObjects.slice(0, 3).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-2 bg-white/50 rounded border border-orange-200/20 text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: transaction.category?.color || '#94a3b8' }}
                  />
                  <span className="truncate max-w-32">
                    {transaction.description || 'No description'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={transaction.type === 'income' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {transaction.type}
                  </Badge>
                  <span className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              </div>
            ))}
            
            {selectedCount > 3 && (
              <div className="text-center text-sm text-gray-500 py-2">
                ... and {selectedCount - 3} more transactions
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Confirm Bulk Action
            </DialogTitle>
            <DialogDescription>
              {activeAction === 'delete' && (
                <>
                  Are you sure you want to delete {selectedCount} selected transactions? 
                  This action cannot be undone.
                </>
              )}
              {activeAction === 'archive' && (
                <>
                  Are you sure you want to archive {selectedCount} selected transactions? 
                  They will be moved to your archived transactions.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelBulkAction}
            >
              Cancel
            </Button>
            <Button
              variant={activeAction === 'delete' ? 'destructive' : 'default'}
              onClick={confirmBulkAction}
              disabled={deleteTransaction.isPending}
            >
              {deleteTransaction.isPending 
                ? 'Processing...' 
                : activeAction === 'delete' 
                  ? 'Delete Transactions' 
                  : 'Archive Transactions'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}