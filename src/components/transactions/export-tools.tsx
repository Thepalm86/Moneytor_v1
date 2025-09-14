'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useCurrency } from '@/contexts/currency-context'
import type { Transaction } from '@/lib/validations/transaction'
import { 
  Download,
  FileText,
  FileSpreadsheet,
  Check,
  X
} from 'lucide-react'
import { toast } from 'sonner'

interface ExportToolsProps {
  transactions: Transaction[]
  selectedTransactionIds?: string[]
  dateRange: { from: Date; to: Date }
}

type ExportFormat = 'csv' | 'pdf'
type ExportScope = 'all' | 'filtered' | 'selected'

interface ExportColumn {
  key: keyof Transaction | 'category_name' | 'category_color'
  label: string
  enabled: boolean
}

const EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'date', label: 'Date', enabled: true },
  { key: 'description', label: 'Description', enabled: true },
  { key: 'amount', label: 'Amount', enabled: true },
  { key: 'type', label: 'Type', enabled: true },
  { key: 'category_name', label: 'Category', enabled: true },
  { key: 'category_color', label: 'Category Color', enabled: false },
  { key: 'created_at', label: 'Created Date', enabled: false },
  { key: 'updated_at', label: 'Updated Date', enabled: false }
]

export function ExportTools({
  transactions, 
  selectedTransactionIds = [],
  dateRange 
}: ExportToolsProps) {
  const { formatCurrency } = useCurrency()
  const [showDialog, setShowDialog] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv')
  const [exportScope, setExportScope] = useState<ExportScope>('filtered')
  const [columns, setColumns] = useState<ExportColumn[]>(EXPORT_COLUMNS)
  const [isExporting, setIsExporting] = useState(false)

  const selectedTransactions = selectedTransactionIds.length > 0 
    ? transactions.filter(t => selectedTransactionIds.includes(t.id))
    : []

  const getExportData = (): Transaction[] => {
    switch (exportScope) {
      case 'selected':
        return selectedTransactions
      case 'filtered':
        return transactions
      case 'all':
      default:
        return transactions
    }
  }

  const handleColumnToggle = (index: number, enabled: boolean) => {
    setColumns(prev => prev.map((col, i) => 
      i === index ? { ...col, enabled } : col
    ))
  }

  const generateCSV = (data: Transaction[]): string => {
    const enabledColumns = columns.filter(col => col.enabled)
    const headers = enabledColumns.map(col => col.label)
    
    const rows = data.map(transaction => {
      return enabledColumns.map(col => {
        switch (col.key) {
          case 'date':
            return format(new Date(transaction.date), 'yyyy-MM-dd')
          case 'description':
            return `"${(transaction.description || '').replace(/"/g, '""')}"`
          case 'amount':
            return transaction.amount.toString()
          case 'type':
            return transaction.type
          case 'category_name':
            return `"${(transaction.category?.name || 'Uncategorized').replace(/"/g, '""')}"`
          case 'category_color':
            return transaction.category?.color || '#94a3b8'
          case 'created_at':
            return format(new Date(transaction.created_at), 'yyyy-MM-dd HH:mm:ss')
          case 'updated_at':
            return format(new Date(transaction.updated_at), 'yyyy-MM-dd HH:mm:ss')
          default:
            return ''
        }
      })
    })

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      const exportData = getExportData()
      
      if (exportData.length === 0) {
        toast.error('No transactions to export')
        return
      }

      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss')
      const scopeLabel = exportScope === 'selected' 
        ? 'selected' 
        : exportScope === 'filtered' 
          ? 'filtered' 
          : 'all'
      
      if (exportFormat === 'csv') {
        const csvContent = generateCSV(exportData)
        const filename = `transactions_${scopeLabel}_${timestamp}.csv`
        downloadFile(csvContent, filename, 'text/csv')
        
        toast.success(`Exported ${exportData.length} transactions to CSV`)
      } else if (exportFormat === 'pdf') {
        // For now, show a message that PDF export is coming soon
        toast.info('PDF export feature coming soon! Use CSV export for now.')
        return
      }

      setShowDialog(false)
    } catch (error) {
      toast.error(`Export failed: ${error}`)
    } finally {
      setIsExporting(false)
    }
  }

  const exportStats = getExportData()
  const incomeAmount = exportStats.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0)
  const expenseAmount = exportStats.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0)

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowDialog(true)}
        className="border-green-200 hover:border-green-300 hover:bg-green-50 text-green-700"
      >
        <Download className="h-4 w-4 mr-2" />
        Export Data
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-green-600" />
              Export Transactions
            </DialogTitle>
            <DialogDescription>
              Export your transaction data in various formats with customizable options.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Export Format */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Export Format</Label>
              <div className="grid grid-cols-2 gap-3">
                <Card className={`cursor-pointer transition-all ${exportFormat === 'csv' ? 'ring-2 ring-green-500' : 'hover:shadow-md'}`}>
                  <CardContent className="p-4" onClick={() => setExportFormat('csv')}>
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-6 w-6 text-green-600" />
                      <div>
                        <div className="font-medium">CSV</div>
                        <div className="text-xs text-gray-500">Spreadsheet format</div>
                      </div>
                      {exportFormat === 'csv' && <Check className="h-4 w-4 text-green-600 ml-auto" />}
                    </div>
                  </CardContent>
                </Card>

                <Card className={`cursor-pointer transition-all ${exportFormat === 'pdf' ? 'ring-2 ring-green-500' : 'hover:shadow-md'}`}>
                  <CardContent className="p-4" onClick={() => setExportFormat('pdf')}>
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-red-600" />
                      <div>
                        <div className="font-medium">PDF</div>
                        <div className="text-xs text-gray-500">Document format</div>
                      </div>
                      {exportFormat === 'pdf' && <Check className="h-4 w-4 text-green-600 ml-auto" />}
                      <Badge variant="outline" className="ml-auto text-xs">Soon</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Export Scope */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Export Scope</Label>
              <Select value={exportScope} onValueChange={(value: ExportScope) => setExportScope(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="filtered">
                    Current Filter ({transactions.length} transactions)
                  </SelectItem>
                  {selectedTransactionIds.length > 0 && (
                    <SelectItem value="selected">
                      Selected Only ({selectedTransactionIds.length} transactions)
                    </SelectItem>
                  )}
                  <SelectItem value="all">
                    All Transactions
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Column Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Columns to Include</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3 bg-gray-50/50">
                {columns.map((column, index) => (
                  <div key={column.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`column-${column.key}`}
                      checked={column.enabled}
                      onCheckedChange={(checked) => handleColumnToggle(index, checked as boolean)}
                    />
                    <Label
                      htmlFor={`column-${column.key}`}
                      className="text-sm cursor-pointer"
                    >
                      {column.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Preview */}
            <Card className="bg-blue-50/50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                  Export Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Transactions:</span>
                    <span className="font-semibold ml-2">{exportStats.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date Range:</span>
                    <span className="font-semibold ml-2 text-xs">
                      {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Income:</span>
                    <span className="font-semibold ml-2 text-green-600">
                      {formatCurrency(incomeAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Expenses:</span>
                    <span className="font-semibold ml-2 text-red-600">
                      {formatCurrency(expenseAmount)}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Net Amount:</span>
                    <span className={`font-semibold ${
                      (incomeAmount - expenseAmount) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(incomeAmount - expenseAmount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || exportStats.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export {exportFormat.toUpperCase()}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}