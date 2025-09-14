'use client'

/**
 * Data Management Settings Component
 * Handles data export, import, backup, and account deletion
 */

import { useState } from 'react'
import { SettingsSection, SettingsFormGroup, SettingsCard } from './settings-section'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { useDataExport, useAccountDeletion } from '@/hooks/use-settings'
import { useUser } from '@/hooks/use-user'
import type { DataExportRequest } from '@/types/settings'

interface DataManagementSettingsProps {
  className?: string
}

export function DataManagementSettings({ className }: DataManagementSettingsProps) {
  const { user } = useUser()
  const { requestExport, isRequesting } = useDataExport()
  const { deleteAccount, isDeleting } = useAccountDeletion()
  
  const [exportFormat, setExportFormat] = useState<'CSV' | 'JSON' | 'PDF'>('CSV')
  const [includeCategories, setIncludeCategories] = useState(true)
  const [includeTransactions, setIncludeTransactions] = useState(true)
  const [includeBudgets, setIncludeBudgets] = useState(true)
  const [includeGoals, setIncludeGoals] = useState(true)
  const [dateRangeStart, setDateRangeStart] = useState('')
  const [dateRangeEnd, setDateRangeEnd] = useState('')
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleExportData = async () => {
    const exportRequest: DataExportRequest = {
      format: exportFormat,
      includeCategories,
      includeTransactions,
      includeBudgets,
      includeGoals,
      ...(dateRangeStart && dateRangeEnd && {
        dateRange: {
          start: dateRangeStart,
          end: dateRangeEnd,
        }
      }),
    }

    try {
      await requestExport(exportRequest)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmationToken = `DELETE_${user?.id}`
    
    if (deleteConfirmText !== confirmationToken) {
      return
    }

    try {
      await deleteAccount(confirmationToken)
      setIsDeleteDialogOpen(false)
      // Redirect or handle successful deletion
    } catch (error) {
      console.error('Account deletion failed:', error)
    }
  }

  return (
    <SettingsSection
      title="Data Management"
      description="Export, import, backup, and manage your financial data"
      icon="💾"
      gradient="gray"
      className={className}
    >
      <div className="space-y-8">
        {/* Data Export */}
        <SettingsFormGroup
          title="Data Export"
          description="Download your financial data in various formats"
        >
          <SettingsCard
            title="Export Your Data"
            description="Create a complete backup of your financial information"
            icon="📤"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="export-format">Export Format</Label>
                  <Select 
                    value={exportFormat} 
                    onValueChange={(value: 'CSV' | 'JSON' | 'PDF') => setExportFormat(value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CSV">
                        <div className="flex items-center space-x-2">
                          <span>📊</span>
                          <div>
                            <div className="font-medium">CSV</div>
                            <div className="text-sm text-gray-600">Spreadsheet compatible</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="JSON">
                        <div className="flex items-center space-x-2">
                          <span>📋</span>
                          <div>
                            <div className="font-medium">JSON</div>
                            <div className="text-sm text-gray-600">Structured data format</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="PDF">
                        <div className="flex items-center space-x-2">
                          <span>📄</span>
                          <div>
                            <div className="font-medium">PDF</div>
                            <div className="text-sm text-gray-600">Report format</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Include in Export</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="include-transactions"
                        checked={includeTransactions}
                        onCheckedChange={(checked) => setIncludeTransactions(!!checked)}
                      />
                      <Label htmlFor="include-transactions" className="text-sm">
                        Transactions
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="include-categories"
                        checked={includeCategories}
                        onCheckedChange={(checked) => setIncludeCategories(!!checked)}
                      />
                      <Label htmlFor="include-categories" className="text-sm">
                        Categories
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="include-budgets"
                        checked={includeBudgets}
                        onCheckedChange={(checked) => setIncludeBudgets(!!checked)}
                      />
                      <Label htmlFor="include-budgets" className="text-sm">
                        Budgets
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="include-goals"
                        checked={includeGoals}
                        onCheckedChange={(checked) => setIncludeGoals(!!checked)}
                      />
                      <Label htmlFor="include-goals" className="text-sm">
                        Saving Goals
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label>Date Range (Optional)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="date-start" className="text-sm text-gray-600">Start Date</Label>
                    <Input
                      id="date-start"
                      type="date"
                      value={dateRangeStart}
                      onChange={(e) => setDateRangeStart(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date-end" className="text-sm text-gray-600">End Date</Label>
                    <Input
                      id="date-end"
                      type="date"
                      value={dateRangeEnd}
                      onChange={(e) => setDateRangeEnd(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Leave empty to export all data
                </p>
              </div>

              <Button
                onClick={handleExportData}
                disabled={isRequesting || (!includeTransactions && !includeCategories && !includeBudgets && !includeGoals)}
                className="w-full sm:w-auto"
              >
                {isRequesting ? 'Preparing Export...' : 'Export Data'}
              </Button>
            </div>
          </SettingsCard>
        </SettingsFormGroup>

        {/* Data Import */}
        <SettingsFormGroup
          title="Data Import"
          description="Import data from other financial applications"
        >
          <SettingsCard
            title="Import Financial Data"
            description="Bring your data from other apps into Moneytor"
            icon="📥"
            variant="default"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button variant="outline" disabled>
                  Import from CSV
                  <span className="text-xs ml-2">(Coming Soon)</span>
                </Button>
                
                <Button variant="outline" disabled>
                  Import from Mint
                  <span className="text-xs ml-2">(Coming Soon)</span>
                </Button>
                
                <Button variant="outline" disabled>
                  Import from YNAB
                  <span className="text-xs ml-2">(Coming Soon)</span>
                </Button>
                
                <Button variant="outline" disabled>
                  Import from Excel
                  <span className="text-xs ml-2">(Coming Soon)</span>
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <span className="text-blue-600 text-lg">💡</span>
                  <div>
                    <h4 className="font-medium text-blue-900">Import Guidelines</h4>
                    <ul className="text-sm text-blue-800 mt-2 space-y-1">
                      <li>• Ensure your CSV file has headers for Date, Amount, Description, and Category</li>
                      <li>• Dates should be in YYYY-MM-DD format for best compatibility</li>
                      <li>• Amounts should be positive for income, negative for expenses</li>
                      <li>• Large imports may take several minutes to process</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </SettingsCard>
        </SettingsFormGroup>

        {/* Automatic Backups */}
        <SettingsFormGroup
          title="Automatic Backups"
          description="Configure automatic data backups for peace of mind"
        >
          <SettingsCard
            title="Backup Settings"
            description="Automatically backup your data at regular intervals"
            icon="🔄"
            variant="default"
          >
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <h4 className="font-medium text-gray-900 mb-2">Backup Frequency</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Choose how often your data should be automatically backed up
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded p-2 text-sm text-amber-700">
                  Automatic backups coming soon in a future update
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h4 className="font-medium text-gray-900 mb-2">Backup Storage</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Backups will be stored securely and encrypted
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Backups are encrypted using industry-standard encryption</li>
                  <li>• You can restore from any backup within the last 30 days</li>
                  <li>• Backups do not count against your data retention limits</li>
                </ul>
              </div>
            </div>
          </SettingsCard>
        </SettingsFormGroup>

        {/* Account Deletion */}
        <SettingsFormGroup
          title="Account Deletion"
          description="Permanently delete your account and all associated data"
        >
          <SettingsCard
            title="Delete Your Account"
            description="This action cannot be undone. All your data will be permanently deleted."
            icon="⚠️"
            variant="error"
          >
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900">Warning: This action is irreversible</h4>
                <ul className="text-sm text-red-800 mt-2 space-y-1">
                  <li>• All your transactions, categories, budgets, and goals will be deleted</li>
                  <li>• Your account cannot be recovered after deletion</li>
                  <li>• Any active subscriptions will be cancelled</li>
                  <li>• We recommend exporting your data first</li>
                </ul>
              </div>

              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    Delete My Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Account</DialogTitle>
                    <DialogDescription>
                      This will permanently delete your account and all associated data. 
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="delete-confirm">
                        Type <code className="bg-gray-100 px-1 rounded">DELETE_{user?.id}</code> to confirm:
                      </Label>
                      <Input
                        id="delete-confirm"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder={`DELETE_${user?.id}`}
                        className="mt-2 font-mono"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDeleteDialogOpen(false)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== `DELETE_${user?.id}` || isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Account'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </SettingsCard>
        </SettingsFormGroup>
      </div>
    </SettingsSection>
  )
}