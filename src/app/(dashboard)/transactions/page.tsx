'use client'

import { useState, useMemo } from 'react'
import { startOfMonth, endOfMonth } from 'date-fns'
import { TransactionForm } from '@/components/forms/transaction-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useUser } from '@/hooks/use-user'
import { useTransactions } from '@/hooks/use-transactions'
import { TransactionPageHeader } from '@/components/transactions/transaction-page-header'
import { TransactionInsights } from '@/components/transactions/transaction-insights'
import { AdvancedTransactionFilters } from '@/components/transactions/advanced-transaction-filters'
import { TransactionAnalytics } from '@/components/transactions/transaction-analytics'
import { EnhancedTransactionList } from '@/components/transactions/enhanced-transaction-list'
import { BulkOperations } from '@/components/transactions/bulk-operations'
import { ExportTools } from '@/components/transactions/export-tools'
import type { Transaction, TransactionFilters, TransactionSortBy, TransactionSortOrder } from '@/lib/validations/transaction'
import { 
  Eye, 
  CheckSquare,
  BarChart3,
  Filter,
  Settings,
  ChevronDown,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ViewMode = 'list' | 'analytics' | 'insights'

export default function TransactionsPage() {
  const { user, isLoading } = useUser()
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [showBulkOperations, setShowBulkOperations] = useState(false)
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>([])
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false)
  
  // Filter and sort state
  const [filters, setFilters] = useState<TransactionFilters & { 
    amountFrom?: number; 
    amountTo?: number 
  }>({
    type: 'all',
    search: '',
    dateFrom: startOfMonth(new Date()),
    dateTo: endOfMonth(new Date())
  })
  const [sortBy, setSortBy] = useState<TransactionSortBy>('date')
  const [sortOrder, setSortOrder] = useState<TransactionSortOrder>('desc')

  const { data: transactionsData } = useTransactions(
    user?.id || '', 
    filters, 
    sortBy, 
    sortOrder
  )
  const transactions = useMemo(() => transactionsData?.data || [], [transactionsData?.data])

  const dateRange = useMemo(() => ({
    from: filters.dateFrom || startOfMonth(new Date()),
    to: filters.dateTo || endOfMonth(new Date())
  }), [filters.dateFrom, filters.dateTo])

  const filteredTransactions = useMemo(() => {
    let result = transactions

    // Apply amount range filter if set
    if (filters.amountFrom !== undefined || filters.amountTo !== undefined) {
      result = result.filter(transaction => {
        const amount = Number(transaction.amount)
        if (filters.amountFrom !== undefined && amount < filters.amountFrom) return false
        if (filters.amountTo !== undefined && amount > filters.amountTo) return false
        return true
      })
    }

    return result
  }, [transactions, filters.amountFrom, filters.amountTo])

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

  const handleFiltersChange = (newFilters: TransactionFilters & { 
    amountFrom?: number; 
    amountTo?: number 
  }) => {
    setFilters(newFilters)
    // Clear selections when filters change
    setSelectedTransactionIds([])
  }

  const handleSortChange = (newSortBy: TransactionSortBy, newSortOrder: TransactionSortOrder) => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
  }

  const handleResetFilters = () => {
    setFilters({
      type: 'all',
      search: '',
      dateFrom: startOfMonth(new Date()),
      dateTo: endOfMonth(new Date())
    })
    setSortBy('date')
    setSortOrder('desc')
    setSelectedTransactionIds([])
  }

  const handleExportTransactions = (transactionIds: string[]) => {
    // This will be handled by the ExportTools component
    console.log('Exporting transactions:', transactionIds)
  }

  const toggleBulkOperations = () => {
    setShowBulkOperations(!showBulkOperations)
    if (showBulkOperations) {
      setSelectedTransactionIds([])
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading your transactions...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please log in to view your transactions</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header with Statistics */}
      <TransactionPageHeader 
        userId={user.id}
        onAddTransaction={handleAddTransaction}
      />

      {/* View Mode Toggle */}
      <Card className="border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* View Mode Buttons */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "rounded-md transition-all duration-200",
                    viewMode === 'list' 
                      ? "bg-blue-500 text-white shadow-md hover:bg-blue-600" 
                      : "hover:bg-white/60"
                  )}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  List View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('analytics')}
                  className={cn(
                    "rounded-md transition-all duration-200",
                    viewMode === 'analytics' 
                      ? "bg-purple-500 text-white shadow-md hover:bg-purple-600" 
                      : "hover:bg-white/60"
                  )}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Analytics
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('insights')}
                  className={cn(
                    "rounded-md transition-all duration-200",
                    viewMode === 'insights' 
                      ? "bg-green-500 text-white shadow-md hover:bg-green-600" 
                      : "hover:bg-white/60"
                  )}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Insights
                </Button>
              </div>

              {/* Active Filters Display */}
              {Object.values(filters).some(value => 
                value !== undefined && value !== 'all' && value !== ''
              ) && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Filter className="h-3 w-3 mr-1" />
                  Filters Active
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Bulk Operations Toggle */}
              {viewMode === 'list' && (
                <Button
                  variant={showBulkOperations ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleBulkOperations}
                  className={cn(
                    showBulkOperations && "bg-orange-600 hover:bg-orange-700 text-white"
                  )}
                >
                  <CheckSquare className="h-4 w-4 mr-1" />
                  Bulk Select
                  {selectedTransactionIds.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedTransactionIds.length}
                    </Badge>
                  )}
                </Button>
              )}

              {/* Export Tools */}
              <ExportTools
                transactions={filteredTransactions}
                selectedTransactionIds={selectedTransactionIds}
                dateRange={dateRange}
              />

              {/* Advanced Analytics Toggle */}
              {viewMode === 'analytics' && (
                <Button
                  variant={showAdvancedAnalytics ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Advanced
                  <ChevronDown className={cn(
                    "h-3 w-3 ml-1 transition-transform", 
                    showAdvancedAnalytics && "rotate-180"
                  )} />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <AdvancedTransactionFilters
        userId={user.id}
        filters={filters}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onFiltersChange={handleFiltersChange}
        onSortChange={handleSortChange}
        onReset={handleResetFilters}
      />

      {/* Bulk Operations */}
      {showBulkOperations && selectedTransactionIds.length > 0 && (
        <BulkOperations
          userId={user.id}
          transactions={filteredTransactions}
          selectedTransactions={selectedTransactionIds}
          onSelectionChange={setSelectedTransactionIds}
          onExport={handleExportTransactions}
        />
      )}

      {/* Main Content Based on View Mode */}
      {viewMode === 'list' && (
        <EnhancedTransactionList
          userId={user.id}
          filters={filters}
          sortBy={sortBy}
          sortOrder={sortOrder}
          selectedTransactionIds={selectedTransactionIds}
          onSelectionChange={setSelectedTransactionIds}
          onAddTransaction={handleAddTransaction}
          onEditTransaction={handleEditTransaction}
          showBulkSelect={showBulkOperations}
        />
      )}

      {viewMode === 'analytics' && (
        <div className="space-y-8">
          <TransactionAnalytics
            transactions={filteredTransactions}
            dateRange={dateRange}
          />
          
          {showAdvancedAnalytics && filteredTransactions.length > 0 && (
            <Card className="border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                  <p>Additional advanced analytics features coming soon!</p>
                  <p className="text-sm mt-2">Including correlation analysis, spending predictions, and custom reports.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Financial Insights Section */}
      {viewMode === 'insights' && (
        <TransactionInsights 
          userId={user.id}
          dateRange={dateRange}
        />
      )}

      {/* Transaction Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] border-gray-200/50 bg-white/95 backdrop-blur-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={cn(
              "text-xl font-semibold bg-gradient-to-r bg-clip-text text-transparent",
              editingTransaction 
                ? "from-orange-600 to-amber-600" 
                : "from-blue-600 to-cyan-600"
            )}>
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