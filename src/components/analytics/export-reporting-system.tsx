'use client'

import { useState } from 'react'
import { Download, FileText, Settings, Loader2, BarChart3 } from 'lucide-react'
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { useCurrency } from '@/contexts/currency-context'
import { useFinancialKPIs } from '@/hooks/use-financial-kpis'
import { useTransactions } from '@/hooks/use-transactions'
import { useCategoryInsights } from '@/hooks/use-category-insights'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import type { DateRange } from '@/lib/supabase/analytics'

interface ExportReportingSystemProps {
  userId: string
  dateRange: DateRange
  className?: string
}

type ReportType =
  | 'financial-summary'
  | 'transaction-detail'
  | 'category-analysis'
  | 'kpi-dashboard'
  | 'custom'
type ExportFormat = 'pdf' | 'csv' | 'json' | 'excel'

interface ReportConfig {
  type: ReportType
  format: ExportFormat
  dateRange: DateRange
  includeCharts: boolean
  includeKPIs: boolean
  includeTransactions: boolean
  includeCategories: boolean
  customTitle?: string
  customDescription?: string
  email?: string
  scheduledDelivery?: boolean
}

// Generate CSV content
function generateCSV(
  data: Record<string, string | number | boolean | null>[],
  filename: string
): void {
  if (!data.length) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers
        .map(header => {
          let value = (row as Record<string, string | number | boolean | null>)[header]
          if (typeof value === 'string' && value.includes(',')) {
            value = `"${value}"`
          }
          return value
        })
        .join(',')
    ),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Define report data type
interface ReportData {
  summary: {
    totalIncome: number
    totalExpenses: number
    netIncome: number
    transactionCount: number
  }
  transactions: Array<{
    id: string
    description: string
    amount: number
    type: 'income' | 'expense'
    date: string
    category: string
  }>
  categories: Array<{
    name: string
    totalAmount: number
    transactionCount: number
  }>
}

// Generate PDF content (simplified version - in production would use proper PDF library)
function generatePDFReport(
  reportData: ReportData,
  config: ReportConfig,
  onSuccess: () => void
): void {
  // For now, we'll generate HTML content that can be printed as PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${config.customTitle || 'Financial Report'}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .section { margin-bottom: 20px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .kpi-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        .transaction-table { width: 100%; border-collapse: collapse; }
        .transaction-table th, .transaction-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .transaction-table th { background-color: #f2f2f2; }
        .positive { color: green; } .negative { color: red; }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${config.customTitle || 'Financial Report'}</h1>
        <p>Period: ${format(config.dateRange.from, 'MMM dd, yyyy')} - ${format(config.dateRange.to, 'MMM dd, yyyy')}</p>
        <p>Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}</p>
        ${config.customDescription ? `<p>${config.customDescription}</p>` : ''}
      </div>
      ${
        reportData.summary
          ? `
        <div class="section">
          <h2>Summary</h2>
          <div class="kpi-grid">
            <div class="kpi-card">
              <h3>Total Income</h3>
              <p class="positive">$${reportData.summary.totalIncome.toLocaleString()}</p>
            </div>
            <div class="kpi-card">
              <h3>Total Expenses</h3>
              <p class="negative">$${reportData.summary.totalExpenses.toLocaleString()}</p>
            </div>
            <div class="kpi-card">
              <h3>Net Income</h3>
              <p class="${reportData.summary.netIncome >= 0 ? 'positive' : 'negative'}">$${reportData.summary.netIncome.toLocaleString()}</p>
            </div>
          </div>
        </div>
      `
          : ''
      }
      <div class="no-print">
        <button onclick="window.print()">Print Report</button>
      </div>
    </body>
    </html>
  `

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    onSuccess()
  }
}

export function ExportReportingSystem({
  userId,
  dateRange,
  className,
}: ExportReportingSystemProps) {
  const { formatCurrency } = useCurrency()
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: 'financial-summary',
    format: 'pdf',
    dateRange,
    includeCharts: true,
    includeKPIs: true,
    includeTransactions: true,
    includeCategories: true,
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  // Fetch data based on configuration
  const { data: kpisData } = useFinancialKPIs(reportConfig.dateRange)
  const { data: transactionsData } = useTransactions(userId, {
    dateFrom: reportConfig.dateRange.from,
    dateTo: reportConfig.dateRange.to,
  })
  const { data: categoryInsights } = useCategoryInsights(reportConfig.dateRange, 'all')

  const handleConfigChange = (key: keyof ReportConfig, value: unknown) => {
    setReportConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleDateRangeChange = (preset: string) => {
    let newDateRange: DateRange
    const now = new Date()

    switch (preset) {
      case 'last-7-days':
        newDateRange = { from: subDays(now, 6), to: now }
        break
      case 'last-30-days':
        newDateRange = { from: subDays(now, 29), to: now }
        break
      case 'this-month':
        newDateRange = { from: startOfMonth(now), to: endOfMonth(now) }
        break
      case 'last-3-months':
        newDateRange = { from: subMonths(now, 3), to: now }
        break
      case 'this-year':
        newDateRange = { from: new Date(now.getFullYear(), 0, 1), to: now }
        break
      default:
        newDateRange = dateRange
    }

    setReportConfig(prev => ({ ...prev, dateRange: newDateRange }))
  }

  const generateReport = async () => {
    setIsGenerating(true)

    try {
      const reportData: ReportData = {
        summary: {
          totalIncome: (kpisData?.data as any)?.totalIncome || 0,
          totalExpenses: (kpisData?.data as any)?.totalExpenses || 0,
          netIncome: (kpisData?.data as any)?.netIncome || 0,
          transactionCount: (transactionsData?.data || []).length,
        },
        transactions: (transactionsData?.data || []).map(t => ({
          id: t.id,
          description: t.description || 'No description',
          amount: t.amount,
          type: t.type,
          date: t.date,
          category: t.category?.name || 'Uncategorized',
        })),
        categories: (categoryInsights?.data || []).map(c => ({
          name: c.categoryName,
          totalAmount: c.totalAmount,
          transactionCount: c.transactionCount,
        })),
      }

      if (reportConfig.format === 'csv') {
        // Generate CSV based on report type
        if (reportConfig.type === 'transaction-detail') {
          const csvData = reportData.transactions.map(t => ({
            date: format(new Date(t.date), 'yyyy-MM-dd'),
            description: t.description,
            amount: t.amount,
            type: t.type,
            category: t.category,
          }))
          generateCSV(csvData, `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`)
        } else if (reportConfig.type === 'category-analysis') {
          const csvData = reportData.categories.map(c => ({
            category: c.name,
            totalAmount: c.totalAmount,
            transactionCount: c.transactionCount,
          }))
          generateCSV(csvData, `category-analysis-${format(new Date(), 'yyyy-MM-dd')}.csv`)
        }
      } else if (reportConfig.format === 'json') {
        // Generate JSON export
        const jsonData = JSON.stringify(reportData, null, 2)
        const blob = new Blob([jsonData], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `financial-report-${format(new Date(), 'yyyy-MM-dd')}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        // Generate PDF report
        let _htmlContent = ''

        if (reportConfig.includeKPIs && reportData.summary) {
          const kpis = reportData.summary
          _htmlContent += `
            <div class="section">
              <h2>Key Performance Indicators</h2>
              <div class="kpi-grid">
                <div class="kpi-card">
                  <h3>Total Income</h3>
                  <p class="large">${formatCurrency(kpis.totalIncome)}</p>
                </div>
                <div class="kpi-card">
                  <h3>Total Expenses</h3>
                  <p class="large">${formatCurrency(kpis.totalExpenses)}</p>
                </div>
                <div class="kpi-card">
                  <h3>Net Income</h3>
                  <p class="large ${kpis.netIncome >= 0 ? 'positive' : 'negative'}">${formatCurrency(kpis.netIncome)}</p>
                </div>
                <div class="kpi-card">
                  <h3>Total Transactions</h3>
                  <p class="large">${kpis.transactionCount}</p>
                </div>
              </div>
            </div>
          `
        }

        if (reportConfig.includeCategories && reportData.categories.length > 0) {
          _htmlContent += `
            <div class="section">
              <h2>Category Analysis</h2>
              <table class="transaction-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total Amount</th>
                    <th>Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  ${reportData.categories
                    .map(
                      c => `
                    <tr>
                      <td>${c.name}</td>
                      <td>${formatCurrency(c.totalAmount)}</td>
                      <td>${c.transactionCount}</td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          `
        }

        if (reportConfig.includeTransactions && reportData.transactions.length > 0) {
          _htmlContent += `
            <div class="section">
              <h2>Transaction Details</h2>
              <table class="transaction-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  ${reportData.transactions
                    .slice(0, 100)
                    .map(
                      t => `
                    <tr>
                      <td>${format(new Date(t.date), 'MMM dd, yyyy')}</td>
                      <td>${t.description}</td>
                      <td>${t.category}</td>
                      <td class="${t.type === 'income' ? 'positive' : 'negative'}">
                        ${formatCurrency(t.amount)}
                      </td>
                      <td>${t.type}</td>
                    </tr>
                  `
                    )
                    .join('')}
                  ${
                    reportData.transactions.length > 100
                      ? `<tr><td colspan="5" style="text-align: center; font-style: italic;">
                      ... and ${reportData.transactions.length - 100} more transactions
                    </td></tr>`
                      : ''
                  }
                </tbody>
              </table>
            </div>
          `
        }

        generatePDFReport(reportData, reportConfig, () => {
          toast({
            title: 'Report Generated Successfully',
            description: `Your ${reportConfig.type} report has been generated and downloaded.`,
          })
        })
      }
    } catch {
      toast({
        title: 'Error Generating Report',
        description: 'There was an error generating your report. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Export & Reporting</h2>
        <p className="text-muted-foreground">
          Generate comprehensive financial reports and export your data
        </p>
      </div>

      <Tabs defaultValue="configuration" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Report Type & Format */}
            <Card className="glass-card border-premium">
              <CardHeader>
                <CardTitle className="text-lg">Report Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select
                    value={reportConfig.type}
                    onValueChange={(value: ReportType) => handleConfigChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial-summary">Financial Summary</SelectItem>
                      <SelectItem value="transaction-detail">Transaction Detail</SelectItem>
                      <SelectItem value="category-analysis">Category Analysis</SelectItem>
                      <SelectItem value="kpi-dashboard">KPI Dashboard</SelectItem>
                      <SelectItem value="custom">Custom Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="export-format">Export Format</Label>
                  <Select
                    value={reportConfig.format}
                    onValueChange={(value: ExportFormat) => handleConfigChange('format', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="csv">CSV Data</SelectItem>
                      <SelectItem value="json">JSON Export</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-range">Date Range</Label>
                  <Select onValueChange={handleDateRangeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                      <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                      <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                      <SelectItem value="this-year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Current: {format(reportConfig.dateRange.from, 'MMM dd, yyyy')} -{' '}
                    {format(reportConfig.dateRange.to, 'MMM dd, yyyy')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Content Options */}
            <Card className="glass-card border-premium">
              <CardHeader>
                <CardTitle className="text-lg">Content Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-kpis"
                      checked={reportConfig.includeKPIs}
                      onCheckedChange={checked => handleConfigChange('includeKPIs', checked)}
                    />
                    <Label htmlFor="include-kpis" className="text-sm">
                      Include KPI Dashboard
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-transactions"
                      checked={reportConfig.includeTransactions}
                      onCheckedChange={checked =>
                        handleConfigChange('includeTransactions', checked)
                      }
                    />
                    <Label htmlFor="include-transactions" className="text-sm">
                      Include Transaction Details
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-categories"
                      checked={reportConfig.includeCategories}
                      onCheckedChange={checked => handleConfigChange('includeCategories', checked)}
                    />
                    <Label htmlFor="include-categories" className="text-sm">
                      Include Category Analysis
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-charts"
                      checked={reportConfig.includeCharts}
                      onCheckedChange={checked => handleConfigChange('includeCharts', checked)}
                    />
                    <Label htmlFor="include-charts" className="text-sm">
                      Include Charts (PDF only)
                    </Label>
                  </div>
                </div>

                {reportConfig.type === 'custom' && (
                  <div className="space-y-3 border-t border-border/50 pt-3">
                    <div className="space-y-2">
                      <Label htmlFor="custom-title">Custom Title</Label>
                      <Input
                        id="custom-title"
                        placeholder="Enter custom report title"
                        value={reportConfig.customTitle || ''}
                        onChange={e => handleConfigChange('customTitle', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom-description">Description</Label>
                      <Textarea
                        id="custom-description"
                        placeholder="Enter report description"
                        value={reportConfig.customDescription || ''}
                        onChange={e => handleConfigChange('customDescription', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Generate Report Button */}
          <Card className="glass-card border-premium">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">Generate Report</h3>
                  <p className="text-sm text-muted-foreground">
                    {reportConfig.format.toUpperCase()} report for{' '}
                    {format(reportConfig.dateRange.from, 'MMM dd')} -{' '}
                    {format(reportConfig.dateRange.to, 'MMM dd, yyyy')}
                  </p>
                </div>

                <Button
                  onClick={generateReport}
                  disabled={isGenerating}
                  size="lg"
                  className="min-w-[140px]"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {isGenerating ? 'Generating...' : 'Generate Report'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Pre-built report templates */}
            <Card
              className="glass-card border-premium interactive-card cursor-pointer transition-all duration-200 hover:scale-[1.02]"
              onClick={() => {
                setReportConfig({
                  type: 'financial-summary',
                  format: 'pdf',
                  dateRange: { from: subMonths(new Date(), 1), to: new Date() },
                  includeCharts: true,
                  includeKPIs: true,
                  includeTransactions: false,
                  includeCategories: true,
                  customTitle: 'Monthly Financial Summary',
                })
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Monthly Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-muted-foreground">
                  Comprehensive monthly overview with KPIs and category breakdown
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    KPIs
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Categories
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Charts
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card
              className="glass-card border-premium interactive-card cursor-pointer transition-all duration-200 hover:scale-[1.02]"
              onClick={() => {
                setReportConfig({
                  type: 'transaction-detail',
                  format: 'csv',
                  dateRange,
                  includeCharts: false,
                  includeKPIs: false,
                  includeTransactions: true,
                  includeCategories: false,
                  customTitle: 'Transaction Export',
                })
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Download className="h-4 w-4" />
                  Transaction Export
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-muted-foreground">
                  Detailed transaction data export for external analysis
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    Transactions
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    CSV Format
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card
              className="glass-card border-premium interactive-card cursor-pointer transition-all duration-200 hover:scale-[1.02]"
              onClick={() => {
                setReportConfig({
                  type: 'category-analysis',
                  format: 'pdf',
                  dateRange: { from: subMonths(new Date(), 3), to: new Date() },
                  includeCharts: true,
                  includeKPIs: false,
                  includeTransactions: false,
                  includeCategories: true,
                  customTitle: 'Quarterly Spending Analysis',
                })
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4" />
                  Spending Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-muted-foreground">
                  In-depth category analysis with trends and insights
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    Categories
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Trends
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    3 Months
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
