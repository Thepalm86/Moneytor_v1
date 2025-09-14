'use client'

/**
 * Currency Settings Component
 * Manages currency selection and regional preferences with Israeli Shekel support
 */

import { useState, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { 
  getCurrencyOptions, 
  formatCurrency, 
  getCurrencyByCode,
  CURRENCIES 
} from '@/lib/utils/currency'
import { useCurrency } from '@/contexts/currency-context'
import { useSettings, useTimezones } from '@/hooks/use-settings'
import { cn } from '@/lib/utils'
import type { UserSettings } from '@/types/settings'

interface CurrencySettingsProps {
  className?: string
}

export function CurrencySettings({ className }: CurrencySettingsProps) {
  const { currency, setCurrency, isLoading: isCurrencyLoading } = useCurrency()
  const { settings, updateSettings, isUpdatingSettings } = useSettings()
  const { data: timezoneOptions, isLoading: isTimezonesLoading } = useTimezones()
  
  const [selectedCurrency, setSelectedCurrency] = useState(currency.code)
  const [selectedTimezone, setSelectedTimezone] = useState(settings?.timezone || '')
  const [selectedDateFormat, setSelectedDateFormat] = useState<UserSettings['dateFormat']>(
    settings?.dateFormat || 'MM/DD/YYYY'
  )
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Update local state when settings change
  useEffect(() => {
    if (settings) {
      setSelectedCurrency(currency.code)
      setSelectedTimezone(settings.timezone)
      setSelectedDateFormat(settings.dateFormat)
      setHasUnsavedChanges(false)
    }
  }, [settings, currency.code])

  // Track changes
  useEffect(() => {
    if (!settings) return
    
    const hasChanges = 
      selectedCurrency !== currency.code ||
      selectedTimezone !== settings.timezone ||
      selectedDateFormat !== settings.dateFormat

    setHasUnsavedChanges(hasChanges)
  }, [selectedCurrency, selectedTimezone, selectedDateFormat, currency.code, settings])

  const handleSaveChanges = async () => {
    if (!settings) return

    try {
      // Update currency through currency context
      if (selectedCurrency !== currency.code) {
        await setCurrency(selectedCurrency)
      }

      // Update other settings
      if (selectedTimezone !== settings.timezone || selectedDateFormat !== settings.dateFormat) {
        await updateSettings({
          timezone: selectedTimezone,
          dateFormat: selectedDateFormat,
        })
      }

      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to save currency settings:', error)
    }
  }

  const handleResetChanges = () => {
    if (!settings) return
    
    setSelectedCurrency(currency.code)
    setSelectedTimezone(settings.timezone)
    setSelectedDateFormat(settings.dateFormat)
    setHasUnsavedChanges(false)
  }

  const currencyOptions = getCurrencyOptions()
  const selectedCurrencyData = getCurrencyByCode(selectedCurrency)

  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '12/25/2023' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '25/12/2023' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2023-12-25' },
  ]

  const sampleAmount = 1234.56
  const previewAmount = formatCurrency(sampleAmount, selectedCurrency)

  return (
    <SettingsSection
      title="Currency & Regional Settings"
      description="Configure your preferred currency, timezone, and regional formats"
      icon="💰"
      gradient="green"
      className={className}
      footerActions={
        hasUnsavedChanges ? (
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleResetChanges}
              disabled={isCurrencyLoading || isUpdatingSettings}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={isCurrencyLoading || isUpdatingSettings}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCurrencyLoading || isUpdatingSettings ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        ) : null
      }
    >
      <div className="space-y-8">
        {/* Currency Selection */}
        <SettingsFormGroup
          title="Currency"
          description="Choose your preferred currency for all monetary displays"
          required
        >
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="flex-1">
                <Label htmlFor="currency-select">Currency</Label>
                <Select 
                  value={selectedCurrency} 
                  onValueChange={setSelectedCurrency}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {currencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{option.symbol}</span>
                          <span>{option.label}</span>
                          {option.position === 'right' && (
                            <Badge variant="secondary" className="text-xs">
                              Right-positioned
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="sm:w-auto">
                <Label className="text-sm text-gray-600">Preview</Label>
                <div className="mt-2 rounded-lg bg-gray-50 px-4 py-3 font-mono text-lg">
                  <span className={cn(
                    selectedCurrencyData?.position === 'right' 
                      ? 'text-green-600' 
                      : 'text-blue-600'
                  )}>
                    {previewAmount}
                  </span>
                </div>
              </div>
            </div>

            {/* Special note for Israeli Shekel */}
            {selectedCurrency === 'ILS' && (
              <SettingsCard
                title="Israeli Shekel Format"
                description="The Israeli Shekel (₪) will be displayed on the right side of amounts, as is standard practice."
                icon="🇮🇱"
                variant="success"
                className="mt-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Positive amounts:</span>
                    <div className="font-mono text-green-600 mt-1">1,234.56₪</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Negative amounts:</span>
                    <div className="font-mono text-red-600 mt-1">-1,234.56₪</div>
                  </div>
                </div>
              </SettingsCard>
            )}
          </div>
        </SettingsFormGroup>

        {/* Timezone Selection */}
        <SettingsFormGroup
          title="Timezone"
          description="Set your timezone for accurate date and time displays"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-4 space-y-4 sm:space-y-0">
            <div className="flex-1">
              <Label htmlFor="timezone-select">Timezone</Label>
              <Select 
                value={selectedTimezone} 
                onValueChange={setSelectedTimezone}
                disabled={isTimezonesLoading}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={isTimezonesLoading ? "Loading..." : "Select timezone"} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {timezoneOptions?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{option.label}</span>
                        <span className="text-gray-500 text-xs ml-2">{option.offset}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="sm:w-auto">
              <Label className="text-sm text-gray-600">Current Time</Label>
              <div className="mt-2 rounded-lg bg-gray-50 px-4 py-3 font-mono">
                {new Date().toLocaleString('en-US', { 
                  timeZone: selectedTimezone || undefined,
                  hour12: true,
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </SettingsFormGroup>

        {/* Date Format */}
        <SettingsFormGroup
          title="Date Format"
          description="Choose how dates are displayed throughout the application"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {dateFormatOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedDateFormat(option.value)}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all duration-200 text-left',
                  selectedDateFormat === option.value
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                )}
              >
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600 mt-1">{option.example}</div>
              </button>
            ))}
          </div>
        </SettingsFormGroup>

        {/* Currency Preview Grid */}
        <SettingsFormGroup
          title="Currency Display Preview"
          description="See how different amounts will appear with your selected currency"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-lg bg-green-50 p-4">
              <div className="text-sm text-gray-600 mb-1">Income</div>
              <div className="font-mono text-lg text-green-600">
                {formatCurrency(2500, selectedCurrency)}
              </div>
            </div>
            <div className="rounded-lg bg-red-50 p-4">
              <div className="text-sm text-gray-600 mb-1">Expense</div>
              <div className="font-mono text-lg text-red-600">
                {formatCurrency(-150.75, selectedCurrency)}
              </div>
            </div>
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="text-sm text-gray-600 mb-1">Balance</div>
              <div className="font-mono text-lg text-blue-600">
                {formatCurrency(12345.89, selectedCurrency)}
              </div>
            </div>
          </div>
        </SettingsFormGroup>

        {/* Supported Currencies Info */}
        <SettingsCard
          title="Supported Currencies"
          description="Moneytor supports major international currencies with proper localization"
          icon="🌍"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {CURRENCIES.slice(0, 8).map((curr) => (
              <div
                key={curr.code}
                className="flex items-center space-x-2 text-sm p-2 rounded-lg bg-gray-50"
              >
                <span className="font-medium">{curr.symbol}</span>
                <span>{curr.code}</span>
                {curr.position === 'right' && (
                  <Badge variant="outline" className="text-xs">R</Badge>
                )}
              </div>
            ))}
          </div>
          {CURRENCIES.length > 8 && (
            <p className="text-sm text-gray-600 mt-3">
              And {CURRENCIES.length - 8} more currencies...
            </p>
          )}
        </SettingsCard>
      </div>
    </SettingsSection>
  )
}