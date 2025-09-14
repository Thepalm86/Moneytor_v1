'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { Search, ArrowUpDown, Edit, Trash2, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useCurrency } from '@/contexts/currency-context'
import { formatTransactionDate } from '@/lib/utils/date'
import { getIcon } from '@/lib/utils/icons'
import { useTransactions, useDeleteTransaction } from '@/hooks/use-transactions'
import { useCategories } from '@/hooks/use-categories'
import type { Transaction, TransactionFilters, TransactionSortBy, TransactionSortOrder } from '@/lib/validations/transaction'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TransactionListProps {
  userId: string
  onAddTransaction?: () => void
  onEditTransaction?: (transaction: Transaction) => void
}

export function TransactionList({ 
  userId, 
  onAddTransaction, 
  onEditTransaction 
}: TransactionListProps) {
  const { formatCurrency } = useCurrency()
  const [filters, setFilters] = useState<TransactionFilters>({
    type: 'all',
    search: '',
  })
  const [sortBy, setSortBy] = useState<TransactionSortBy>('date')
  const [sortOrder, setSortOrder] = useState<TransactionSortOrder>('desc')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)

  const { data: transactionsData, isLoading } = useTransactions(userId, filters, sortBy, sortOrder)
  const { data: categoriesData } = useCategories(userId)
  const deleteTransaction = useDeleteTransaction()

  const transactions = transactionsData?.data || []
  const categories = categoriesData?.data || []

  const handleFilterChange = (key: keyof TransactionFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }))
  }

  const handleSort = (newSortBy: TransactionSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('desc')
    }
  }

  const handleDeleteClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (transactionToDelete) {
      await deleteTransaction.mutateAsync({
        id: transactionToDelete.id,
        userId,
      })
      setDeleteDialogOpen(false)
      setTransactionToDelete(null)
    }
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
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading transactions...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Transactions</h2>
          <p className="text-gray-600">Manage your income and expenses</p>
        </div>
        {onAddTransaction && (
          <Button onClick={onAddTransaction}>
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search transactions..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <Select
              value={filters.type || 'all'}
              onValueChange={(value) => handleFilterChange('type', value)}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expenses</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select
              value={filters.categoryId || 'all'}
              onValueChange={(value) => handleFilterChange('categoryId', value)}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleSort('date')}>
                  Date {sortBy === 'date' && `(${sortOrder === 'asc' ? '↑' : '↓'})`}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('amount')}>
                  Amount {sortBy === 'amount' && `(${sortOrder === 'asc' ? '↑' : '↓'})`}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('description')}>
                  Description {sortBy === 'description' && `(${sortOrder === 'asc' ? '↑' : '↓'})`}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      {transactions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600 mb-4">
                {filters.search || filters.type !== 'all' || filters.categoryId
                  ? 'Try adjusting your filters or search terms'
                  : 'Start by adding your first transaction'}
              </p>
              {onAddTransaction && (
                <Button onClick={onAddTransaction}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedTransactions.map(([date, dateTransactions]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">
                {formatTransactionDate(new Date(date))}
              </h3>
              <div className="space-y-2">
                {dateTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={onEditTransaction}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
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
              disabled={deleteTransaction.isPending}
            >
              {deleteTransaction.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface TransactionCardProps {
  transaction: Transaction
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transaction: Transaction) => void
}

function TransactionCard({ transaction, onEdit, onDelete }: TransactionCardProps) {
  const { formatCurrency } = useCurrency()
  const category = transaction.category
  const IconComponent = getIcon(category?.icon || null)

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {category && (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: category.color }}
              >
                <IconComponent className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h4 className="font-semibold text-gray-900">
                {transaction.description || 'No description'}
              </h4>
              <p className="text-sm text-gray-500">
                {category?.name || 'No category'}
              </p>
            </div>
          </div>

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
                  "text-xs",
                  transaction.type === 'income'
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : "bg-red-100 text-red-800 hover:bg-red-100"
                )}
              >
                {transaction.type}
              </Badge>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ArrowUpDown className="w-4 h-4" />
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
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}