'use client'

import { useState, useMemo, useCallback } from 'react'
import { format } from 'date-fns'
import { Search, Edit, Trash2, Plus, Filter, MoreVertical, ArrowUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useCurrency } from '@/contexts/currency-context'
import { formatTransactionDate } from '@/lib/utils/date'
import { getIcon } from '@/lib/utils/icons'
import { useTransactions, useDeleteTransaction } from '@/hooks/use-transactions'
import { useCategories } from '@/hooks/use-categories'
import type {
  Transaction,
  TransactionFilters,
  TransactionSortBy,
  TransactionSortOrder,
} from '@/lib/validations/transaction'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  SwipeAction,
  usePullToRefresh,
  PullToRefreshIndicator,
} from '@/components/ui/mobile-gestures'
import { MobileSearchBar, MobileTabNavigation } from '@/components/ui/mobile-navigation-enhanced'
import { MobileCard, MobileList, MobileSection } from '@/components/ui/mobile-card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface MobileTransactionListProps {
  userId: string
  onAddTransaction?: () => void
  onEditTransaction?: (transaction: Transaction) => void
  enablePullToRefresh?: boolean
  className?: string
}

export function MobileTransactionList({
  userId,
  onAddTransaction,
  onEditTransaction,
  enablePullToRefresh = true,
  className,
}: MobileTransactionListProps) {
  const [filters, setFilters] = useState<TransactionFilters>({
    type: 'all',
    search: '',
  })
  const [sortBy, setSortBy] = useState<TransactionSortBy>('date')
  const [sortOrder, setSortOrder] = useState<TransactionSortOrder>('desc')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [searchMode, setSearchMode] = useState(false)

  const {
    data: transactionsData,
    isLoading,
    refetch,
  } = useTransactions(userId, filters, sortBy, sortOrder)
  const { data: categoriesData } = useCategories(userId)
  const deleteTransaction = useDeleteTransaction()

  const transactions = useMemo(() => transactionsData?.data || [], [transactionsData?.data])
  const categories = categoriesData?.data || []

  // Pull to refresh functionality
  const handleRefresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  const pullToRefreshHandlers = usePullToRefresh({
    onRefresh: handleRefresh,
    enabled: enablePullToRefresh && !isLoading,
  })

  const handleFilterChange = (key: keyof TransactionFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }))
  }

  const handleSort = (newSortBy: TransactionSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
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

  // Tab navigation for transaction types
  const typeTabs = [
    { id: 'all', label: 'All', count: transactions.length },
    {
      id: 'income',
      label: 'Income',
      count: transactions.filter(t => t.type === 'income').length,
    },
    {
      id: 'expense',
      label: 'Expenses',
      count: transactions.filter(t => t.type === 'expense').length,
    },
  ]

  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {}

    transactions.forEach(transaction => {
      const date = format(new Date(transaction.date), 'yyyy-MM-dd')
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(transaction)
    })

    return Object.entries(groups).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
  }, [transactions])

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.type && filters.type !== 'all') count++
    if (filters.categoryId) count++
    if (filters.search) count++
    return count
  }, [filters])

  if (isLoading && !pullToRefreshHandlers.isRefreshing) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)} {...pullToRefreshHandlers}>
      {/* Pull to refresh indicator */}
      {enablePullToRefresh && (
        <PullToRefreshIndicator
          distance={pullToRefreshHandlers.pullDistance}
          isRefreshing={pullToRefreshHandlers.isRefreshing}
          threshold={80}
        />
      )}

      <MobileSection
        title="Transactions"
        description="Manage your income and expenses"
        action={
          <div className="flex items-center gap-2">
            {/* Search toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchMode(!searchMode)}
              className={searchMode ? 'bg-blue-100 text-blue-700' : ''}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Filter button with badge */}
            <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Filter className="h-5 w-5" />
                  {activeFiltersCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[400px]">
                <SheetHeader>
                  <SheetTitle>Filter & Sort</SheetTitle>
                  <SheetDescription>Customize how transactions are displayed</SheetDescription>
                </SheetHeader>

                <div className="space-y-6 py-6">
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <Select
                      value={filters.categoryId || 'all'}
                      onValueChange={value => handleFilterChange('categoryId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Options */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Sort by</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['date', 'amount', 'description'] as TransactionSortBy[]).map(sort => (
                        <Button
                          key={sort}
                          variant={sortBy === sort ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleSort(sort)}
                          className="justify-center"
                        >
                          {sort.charAt(0).toUpperCase() + sort.slice(1)}
                          {sortBy === sort && <ArrowUpDown className="ml-2 h-4 w-4" />}
                        </Button>
                      ))}
                    </div>

                    {/* Sort Order */}
                    <div className="flex gap-2">
                      <Button
                        variant={sortOrder === 'desc' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortOrder('desc')}
                        className="flex-1"
                      >
                        Newest First
                      </Button>
                      <Button
                        variant={sortOrder === 'asc' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortOrder('asc')}
                        className="flex-1"
                      >
                        Oldest First
                      </Button>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFilters({ type: 'all', search: '' })
                        setSortBy('date')
                        setSortOrder('desc')
                      }}
                      className="w-full"
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Add transaction button */}
            {onAddTransaction && (
              <Button size="sm" onClick={onAddTransaction}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            )}
          </div>
        }
      />

      {/* Search Bar */}
      {searchMode && (
        <MobileSearchBar
          value={filters.search || ''}
          onValueChange={value => handleFilterChange('search', value)}
          placeholder="Search transactions..."
          onCancel={() => setSearchMode(false)}
          autoFocus
          className="border-b border-gray-200/50"
        />
      )}

      {/* Type Filter Tabs */}
      <MobileTabNavigation
        tabs={typeTabs}
        activeTab={filters.type || 'all'}
        onTabChange={type => handleFilterChange('type', type)}
        enableSwipe
        className="border-b border-gray-200/50"
      />

      {/* Transaction List */}
      {transactions.length === 0 ? (
        <MobileCard variant="flat" className="my-8">
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">No transactions found</h3>
            <p className="mb-6 text-gray-600">
              {filters.search || filters.type !== 'all' || filters.categoryId
                ? 'Try adjusting your filters'
                : 'Start by adding your first transaction'}
            </p>
            {onAddTransaction && (
              <Button onClick={onAddTransaction}>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            )}
          </div>
        </MobileCard>
      ) : (
        <div className="space-y-6 pb-6">
          {groupedTransactions.map(([date, dateTransactions]) => (
            <div key={date} className="space-y-3">
              <div className="sticky top-0 -mx-4 bg-gray-50/80 px-4 py-2 backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-gray-600">
                  {formatTransactionDate(new Date(date))}
                </h3>
              </div>

              <MobileList spacing="sm">
                {dateTransactions.map(transaction => (
                  <MobileTransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={onEditTransaction}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </MobileList>
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
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
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

interface MobileTransactionCardProps {
  transaction: Transaction
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transaction: Transaction) => void
}

function MobileTransactionCard({ transaction, onEdit, onDelete }: MobileTransactionCardProps) {
  const { formatCurrency } = useCurrency()
  const category = transaction.category
  const IconComponent = getIcon(category?.icon || null)

  // Swipe actions
  const swipeActions = []

  if (onEdit) {
    swipeActions.push({
      icon: Edit,
      label: 'Edit',
      onClick: () => onEdit(transaction),
      color: 'primary' as const,
    })
  }

  if (onDelete) {
    swipeActions.push({
      icon: Trash2,
      label: 'Delete',
      onClick: () => onDelete(transaction),
      color: 'destructive' as const,
    })
  }

  return (
    <SwipeAction rightActions={swipeActions} threshold={80} className="overflow-hidden rounded-xl">
      <MobileCard variant="interactive" size="sm" touchOptimized>
        <div className="flex items-center gap-4">
          {/* Category Icon */}
          {category && (
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl shadow-sm"
              style={{ backgroundColor: category.color }}
            >
              <IconComponent className="h-6 w-6 text-white" />
            </div>
          )}

          {/* Transaction Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-base font-semibold text-gray-900">
                  {transaction.description || 'No description'}
                </h4>
                <p className="truncate text-sm text-gray-500">{category?.name || 'No category'}</p>
              </div>

              <div className="ml-4 shrink-0 text-right">
                <div
                  className={cn(
                    'text-base font-bold',
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </div>

                <Badge
                  variant={transaction.type === 'income' ? 'default' : 'secondary'}
                  className={cn(
                    'mt-1 text-xs font-medium',
                    transaction.type === 'income'
                      ? 'bg-green-100 text-green-800 hover:bg-green-100'
                      : 'bg-red-100 text-red-800 hover:bg-red-100'
                  )}
                >
                  {transaction.type}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Swipe indicator hint */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30">
          <MoreVertical className="h-4 w-4 text-gray-400" />
        </div>
      </MobileCard>
    </SwipeAction>
  )
}

export type { MobileTransactionListProps }
