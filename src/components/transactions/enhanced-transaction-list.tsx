'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils/currency'
import { formatTransactionDate } from '@/lib/utils/date'
import { getIcon } from '@/lib/utils/icons'
import { useTransactions, useDeleteTransaction } from '@/hooks/use-transactions'
import type { Transaction, TransactionFilters, TransactionSortBy, TransactionSortOrder } from '@/lib/validations/transaction'
import { 
  Plus,
  Edit, 
  Trash2, 
  MoreHorizontal
} from 'lucide-react'

interface EnhancedTransactionListProps {
  userId: string
  filters?: TransactionFilters
  sortBy?: TransactionSortBy
  sortOrder?: TransactionSortOrder
  selectedTransactionIds: string[]
  onSelectionChange: (selectedIds: string[]) => void
  onAddTransaction?: () => void
  onEditTransaction?: (transaction: Transaction) => void
  showBulkSelect?: boolean
}

interface TransactionCardProps {
  transaction: Transaction
  isSelected: boolean
  onSelect: (selected: boolean) => void
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transaction: Transaction) => void
  showBulkSelect: boolean
}

function TransactionCard({ 
  transaction, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete, 
  showBulkSelect 
}: TransactionCardProps) {
  const category = transaction.category
  const IconComponent = getIcon(category?.icon || null)

  return (
    <Card className={cn(
      "hover:shadow-sm transition-all duration-200 border-gray-200/60",
      isSelected && "ring-2 ring-blue-500 border-blue-300 shadow-md"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Selection Checkbox */}
          {showBulkSelect && (
            <div className="flex items-center">
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
            </div>
          )}

          {/* Category Icon */}
          {category && (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
              style={{ backgroundColor: category.color }}
            >
              <IconComponent className="w-5 h-5 text-white" />
            </div>
          )}

          {/* Transaction Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-gray-900 truncate">
                  {transaction.description || 'No description'}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-500">
                    {category?.name || 'No category'}
                  </p>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-400">
                    {format(new Date(transaction.date), 'MMM d, h:mm a')}
                  </span>
                </div>
              </div>

              {/* Amount and Actions */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div
                    className={cn(
                      "font-semibold",
                      transaction.type === 'income' ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </div>
                  <Badge
                    variant={transaction.type === 'income' ? 'default' : 'secondary'}
                    className={cn(
                      "text-xs mt-1",
                      transaction.type === 'income'
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-red-100 text-red-800 hover:bg-red-100"
                    )}
                  >
                    {transaction.type}
                  </Badge>
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(transaction)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(transaction)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function EnhancedTransactionList({ 
  userId,
  filters,
  sortBy = 'date',
  sortOrder = 'desc',
  selectedTransactionIds,
  onSelectionChange,
  onAddTransaction, 
  onEditTransaction,
  showBulkSelect = false
}: EnhancedTransactionListProps) {
  // Delete confirmation state (unused in current implementation)

  const { data: transactionsData, isLoading } = useTransactions(
    userId, 
    filters, 
    sortBy, 
    sortOrder
  )
  const deleteTransaction = useDeleteTransaction()

  const transactions = useMemo(() => transactionsData?.data || [], [transactionsData?.data])

  const handleTransactionSelect = (transactionId: string, selected: boolean) => {
    if (selected) {
      onSelectionChange([...selectedTransactionIds, transactionId])
    } else {
      onSelectionChange(selectedTransactionIds.filter(id => id !== transactionId))
    }
  }

  const handleSelectAll = () => {
    if (selectedTransactionIds.length === transactions.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(transactions.map(t => t.id))
    }
  }

  const handleDeleteClick = (transaction: Transaction) => {
    deleteTransaction.mutate({
      id: transaction.id,
      userId,
    })
  }

  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {}
    
    transactions.forEach(transaction => {
      const date = format(new Date(transaction.date), 'yyyy-MM-dd')
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(transaction)
    })

    return Object.entries(groups).sort(([a], [b]) => 
      new Date(b).getTime() - new Date(a).getTime()
    )
  }, [transactions])

  if (isLoading) {
    return (
      <Card className="border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading transactions...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card className="border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600 mb-6">
              {filters && (filters.search || filters.type !== 'all' || filters.categoryId)
                ? 'No transactions match your current filters. Try adjusting your search or filter settings.'
                : 'Start tracking your finances by adding your first transaction.'}
            </p>
            {onAddTransaction && (
              <Button 
                onClick={onAddTransaction}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Transaction
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bulk Select Header */}
      {showBulkSelect && (
        <Card className="border-gray-200/50 bg-blue-50/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedTransactionIds.length === transactions.length && transactions.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  {selectedTransactionIds.length > 0
                    ? `${selectedTransactionIds.length} of ${transactions.length} selected`
                    : 'Select transactions for bulk operations'
                  }
                </span>
              </div>
              
              {selectedTransactionIds.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectionChange([])}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                >
                  Clear Selection
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grouped Transaction List */}
      <div className="space-y-8">
        {groupedTransactions.map(([date, dateTransactions]) => (
          <div key={date} className="space-y-3">
            {/* Date Header */}
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-gray-500">
                {formatTransactionDate(new Date(date))}
              </h3>
              <div className="h-px bg-gradient-to-r from-gray-300 to-transparent flex-1" />
              <span className="text-xs text-gray-400">
                {dateTransactions.length} transaction{dateTransactions.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Transaction Cards */}
            <div className="space-y-2">
              {dateTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  isSelected={selectedTransactionIds.includes(transaction.id)}
                  onSelect={(selected) => handleTransactionSelect(transaction.id, selected)}
                  onEdit={onEditTransaction}
                  onDelete={handleDeleteClick}
                  showBulkSelect={showBulkSelect}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}