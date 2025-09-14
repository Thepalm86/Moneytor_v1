'use client'

/**
 * App Preferences Settings Component
 * Manages application preferences and UI settings
 */

import { useState, useEffect } from 'react'
import { SettingsSection, SettingsFormGroup, SettingsToggle } from './settings-section'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { useSettings } from '@/hooks/use-settings'
import { cn } from '@/lib/utils'
import type { UserSettings } from '@/types/settings'

interface PreferencesSettingsProps {
  className?: string
}

export function PreferencesSettings({ className }: PreferencesSettingsProps) {
  const { settings, updateSettings, isUpdatingSettings } = useSettings()
  
  const [theme, setTheme] = useState<UserSettings['theme']>('system')
  const [defaultTransactionType, setDefaultTransactionType] = useState<UserSettings['defaultTransactionType']>('expense')
  const [dashboardLayout, setDashboardLayout] = useState<UserSettings['dashboardLayout']>('comfortable')
  const [startOfWeek, setStartOfWeek] = useState<UserSettings['startOfWeek']>('monday')
  const [autoCategorizationEnabled, setAutoCategorizationEnabled] = useState(true)
  const [duplicateDetectionEnabled, setDuplicateDetectionEnabled] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Update local state when settings change
  useEffect(() => {
    if (settings) {
      setTheme(settings.theme)
      setDefaultTransactionType(settings.defaultTransactionType)
      setDashboardLayout(settings.dashboardLayout)
      setStartOfWeek(settings.startOfWeek)
      setAutoCategorizationEnabled(settings.autoCategorizationEnabled)
      setDuplicateDetectionEnabled(settings.duplicateDetectionEnabled)
      setHasUnsavedChanges(false)
    }
  }, [settings])

  // Track changes
  useEffect(() => {
    if (!settings) return
    
    const hasChanges = 
      theme !== settings.theme ||
      defaultTransactionType !== settings.defaultTransactionType ||
      dashboardLayout !== settings.dashboardLayout ||
      startOfWeek !== settings.startOfWeek ||
      autoCategorizationEnabled !== settings.autoCategorizationEnabled ||
      duplicateDetectionEnabled !== settings.duplicateDetectionEnabled

    setHasUnsavedChanges(hasChanges)
  }, [
    theme, 
    defaultTransactionType, 
    dashboardLayout, 
    startOfWeek,
    autoCategorizationEnabled,
    duplicateDetectionEnabled,
    settings
  ])

  const handleSaveChanges = async () => {
    try {
      await updateSettings({
        theme,
        defaultTransactionType,
        dashboardLayout,
        startOfWeek,
        autoCategorizationEnabled,
        duplicateDetectionEnabled,
      })
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to save preferences:', error)
    }
  }

  const handleResetChanges = () => {
    if (!settings) return
    
    setTheme(settings.theme)
    setDefaultTransactionType(settings.defaultTransactionType)
    setDashboardLayout(settings.dashboardLayout)
    setStartOfWeek(settings.startOfWeek)
    setAutoCategorizationEnabled(settings.autoCategorizationEnabled)
    setDuplicateDetectionEnabled(settings.duplicateDetectionEnabled)
    setHasUnsavedChanges(false)
  }

  const themeOptions = [
    {
      value: 'light' as const,
      label: 'Light',
      description: 'Clean, bright interface',
      icon: '☀️',
    },
    {
      value: 'dark' as const,
      label: 'Dark',
      description: 'Easy on the eyes',
      icon: '🌙',
    },
    {
      value: 'system' as const,
      label: 'System',
      description: 'Match device setting',
      icon: '⚙️',
    },
  ]

  const layoutOptions = [
    {
      value: 'compact' as const,
      label: 'Compact',
      description: 'Dense information display',
      icon: '📱',
    },
    {
      value: 'comfortable' as const,
      label: 'Comfortable',
      description: 'Balanced spacing',
      icon: '💻',
    },
    {
      value: 'detailed' as const,
      label: 'Detailed',
      description: 'Maximum information',
      icon: '📊',
    },
  ]

  return (
    <SettingsSection
      title="App Preferences"
      description="Customize your Moneytor experience and interface preferences"
      icon="⚙️"
      gradient="purple"
      className={className}
      footerActions={
        hasUnsavedChanges ? (
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleResetChanges}
              disabled={isUpdatingSettings}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={isUpdatingSettings}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isUpdatingSettings ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        ) : null
      }
    >
      <div className="space-y-8">
        {/* Theme Settings */}
        <SettingsFormGroup
          title="Theme"
          description="Choose your preferred color scheme"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all duration-200 text-left',
                  theme === option.value
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                )}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
            <span className="font-medium">Note:</span> Dark theme is coming soon! Currently, all themes use the light interface.
          </p>
        </SettingsFormGroup>

        {/* Dashboard Layout */}
        <SettingsFormGroup
          title="Dashboard Layout"
          description="Choose how information is displayed on your dashboard"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {layoutOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setDashboardLayout(option.value)}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all duration-200 text-left',
                  dashboardLayout === option.value
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                )}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </SettingsFormGroup>

        {/* Transaction Defaults */}
        <SettingsFormGroup
          title="Transaction Defaults"
          description="Set default options for creating new transactions"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="default-transaction-type">Default Transaction Type</Label>
              <Select 
                value={defaultTransactionType} 
                onValueChange={(value: UserSettings['defaultTransactionType']) => setDefaultTransactionType(value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">↗️</span>
                      <span>Income</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="expense">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-600">↘️</span>
                      <span>Expense</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start-of-week">Start of Week</Label>
              <Select 
                value={startOfWeek} 
                onValueChange={(value: UserSettings['startOfWeek']) => setStartOfWeek(value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SettingsFormGroup>

        {/* Smart Features */}
        <SettingsFormGroup
          title="Smart Features"
          description="Enable AI-powered features to help manage your finances"
        >
          <div className="space-y-6">
            <SettingsToggle
              label="Auto-Categorization"
              description="Automatically suggest categories for new transactions based on description and amount"
              checked={autoCategorizationEnabled}
              onChange={setAutoCategorizationEnabled}
            />
            
            <SettingsToggle
              label="Duplicate Detection"
              description="Alert you when creating transactions that might be duplicates"
              checked={duplicateDetectionEnabled}
              onChange={setDuplicateDetectionEnabled}
            />
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex items-start space-x-3">
              <span className="text-blue-600 text-lg">💡</span>
              <div>
                <h4 className="font-medium text-blue-900">Smart Features Benefits</h4>
                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                  <li>• Save time with automatic category suggestions</li>
                  <li>• Avoid duplicate entries with intelligent detection</li>
                  <li>• Improve financial tracking accuracy</li>
                </ul>
              </div>
            </div>
          </div>
        </SettingsFormGroup>

        {/* Interface Preferences */}
        <SettingsFormGroup
          title="Interface Preferences"
          description="Additional interface and behavior settings"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-lg border border-gray-200 p-4">
                <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Show quick action buttons on the dashboard
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded p-2 text-sm text-amber-700">
                  Coming soon in a future update
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h4 className="font-medium text-gray-900 mb-2">Keyboard Shortcuts</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Enable keyboard shortcuts for faster navigation
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded p-2 text-sm text-amber-700">
                  Coming soon in a future update
                </div>
              </div>
            </div>
          </div>
        </SettingsFormGroup>
      </div>
    </SettingsSection>
  )
}