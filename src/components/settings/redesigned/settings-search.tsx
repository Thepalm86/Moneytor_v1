'use client'

/**
 * Settings Search Component - Redesigned
 * Advanced search and filtering functionality for settings
 * Provides intelligent search with category filtering and suggestions
 */

import { useState, useMemo, useCallback } from 'react'
import { Search, X, Filter, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { SettingsCategory } from '@/types/settings'

export interface SearchableSettingItem {
  id: string
  title: string
  description?: string
  category: SettingsCategory
  keywords: string[]
  priority: 'high' | 'medium' | 'low'
}

interface SettingsSearchProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  categories: string[]
  onCategoriesChange: (categories: string[]) => void
  availableCategories: { id: string; label: string; count: number }[]
  placeholder?: string
  className?: string
}

const categoryLabels: Record<SettingsCategory, string> = {
  currency: 'Currency & Regional',
  profile: 'Profile & Account',
  preferences: 'App Preferences',
  notifications: 'Notifications',
  security: 'Security & Privacy',
  data: 'Data Management',
}

const categoryColors: Record<SettingsCategory, string> = {
  currency: 'bg-green-100 text-green-700 hover:bg-green-200',
  profile: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  preferences: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  notifications: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  security: 'bg-red-100 text-red-700 hover:bg-red-200',
  data: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
}

export function SettingsSearch({
  searchQuery,
  onSearchChange,
  categories,
  onCategoriesChange,
  availableCategories,
  placeholder = 'Search settings...',
  className,
}: SettingsSearchProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Search is handled by parent component - this is just for UI display
  const hasActiveFilters = useMemo(() => {
    return searchQuery.trim().length > 0 || categories.length > 0
  }, [searchQuery, categories])

  // Handle search query change
  const handleSearchChange = useCallback(
    (newQuery: string) => {
      onSearchChange(newQuery)
    },
    [onSearchChange]
  )

  // Handle category filter change
  const handleCategoryToggle = useCallback(
    (category: string) => {
      const newCategories = categories.includes(category)
        ? categories.filter(c => c !== category)
        : [...categories, category]

      onCategoriesChange(newCategories)
    },
    [categories, onCategoriesChange]
  )

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    onSearchChange('')
    onCategoriesChange([])
  }, [onSearchChange, onCategoriesChange])

  // Get popular search suggestions
  const searchSuggestions = useMemo(() => {
    const suggestions = [
      'currency',
      'notifications',
      'password',
      'privacy',
      'export',
      'timezone',
      'theme',
      'alerts',
    ]

    return suggestions
      .filter(
        suggestion => !searchQuery || suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5)
  }, [searchQuery])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={e => handleSearchChange(e.target.value)}
          className="h-11 border-gray-200 pl-10 pr-12 focus:border-blue-500 focus:ring-blue-500/20"
        />

        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 p-0 hover:bg-gray-100"
            onClick={() => handleSearchChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters and Results Summary */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Filters */}
        <div className="flex items-center space-x-2">
          <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-gray-200 px-3 hover:bg-gray-50"
              >
                <Filter className="mr-2 h-3 w-3" />
                Filters
                {categories.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-xs">
                    {categories.length}
                  </Badge>
                )}
                <ChevronDown className="ml-2 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(categoryLabels).map(([key, label]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={categories.includes(key)}
                  onCheckedChange={() => handleCategoryToggle(key)}
                >
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
              {categories.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-full justify-start px-2 text-xs"
                    onClick={handleClearFilters}
                  >
                    Clear All Filters
                  </Button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Active Category Filters */}
          {categories.map(category => (
            <Badge
              key={category}
              variant="secondary"
              className={cn('cursor-pointer text-xs', categoryColors[category as SettingsCategory])}
              onClick={() => handleCategoryToggle(category)}
            >
              {categoryLabels[category as SettingsCategory]}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
        </div>

        {/* Results Summary */}
        <div className="text-sm text-gray-600">
          {searchQuery || categories.length > 0 ? (
            <span>
              Searching settings
              {searchQuery && ` for "${searchQuery}"`}
            </span>
          ) : (
            <span>
              {availableCategories.reduce((total, cat) => total + cat.count, 0)} total settings
            </span>
          )}
        </div>
      </div>

      {/* Search Suggestions */}
      {searchQuery.length > 0 && searchQuery.length < 3 && (
        <div className="space-y-2">
          <div className="text-xs text-gray-500">Popular searches:</div>
          <div className="flex flex-wrap gap-2">
            {searchSuggestions.map(suggestion => (
              <Button
                key={suggestion}
                variant="ghost"
                size="sm"
                className="h-7 bg-gray-50 px-2 text-xs hover:bg-gray-100"
                onClick={() => handleSearchChange(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {(searchQuery || categories.length > 0) && (
        <div className="py-8 text-center text-gray-500">
          <Search className="mx-auto mb-3 h-8 w-8 text-gray-300" />
          <div className="text-sm">
            No settings found
            {searchQuery && ` for "${searchQuery}"`}
            {categories.length > 0 && ' in selected categories'}
          </div>
          <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={handleClearFilters}>
            Clear filters and try again
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * Hook to create searchable settings items from existing settings structure
 */
export function useSearchableSettings() {
  const searchableItems: SearchableSettingItem[] = [
    // Currency & Regional
    {
      id: 'currency-selection',
      title: 'Currency',
      description: 'Choose your preferred currency for all monetary displays',
      category: 'currency',
      keywords: ['currency', 'money', 'dollar', 'shekel', 'euro', 'format'],
      priority: 'high',
    },
    {
      id: 'timezone-settings',
      title: 'Timezone',
      description: 'Set your timezone for accurate date and time displays',
      category: 'currency',
      keywords: ['timezone', 'time', 'date', 'region', 'utc'],
      priority: 'medium',
    },
    {
      id: 'date-format',
      title: 'Date Format',
      description: 'Choose how dates are displayed throughout the application',
      category: 'currency',
      keywords: ['date', 'format', 'display', 'mm/dd/yyyy', 'dd/mm/yyyy'],
      priority: 'low',
    },

    // Profile & Account
    {
      id: 'profile-info',
      title: 'Profile Information',
      description: 'Manage your personal information and account details',
      category: 'profile',
      keywords: ['profile', 'name', 'email', 'personal', 'account'],
      priority: 'high',
    },
    {
      id: 'avatar-settings',
      title: 'Profile Picture',
      description: 'Upload and manage your profile picture',
      category: 'profile',
      keywords: ['avatar', 'picture', 'photo', 'image', 'profile'],
      priority: 'low',
    },

    // Security & Privacy
    {
      id: 'password-change',
      title: 'Change Password',
      description: 'Update your account password for security',
      category: 'security',
      keywords: ['password', 'security', 'change', 'update', 'login'],
      priority: 'high',
    },
    {
      id: 'two-factor',
      title: 'Two-Factor Authentication',
      description: 'Enable additional security with 2FA',
      category: 'security',
      keywords: ['2fa', 'two-factor', 'security', 'authentication', 'totp'],
      priority: 'high',
    },
    {
      id: 'session-timeout',
      title: 'Session Timeout',
      description: 'Automatically log out after period of inactivity',
      category: 'security',
      keywords: ['session', 'timeout', 'logout', 'security', 'inactivity'],
      priority: 'medium',
    },

    // Notifications
    {
      id: 'budget-alerts',
      title: 'Budget Alerts',
      description: 'Get notified when approaching budget limits',
      category: 'notifications',
      keywords: ['budget', 'alerts', 'notifications', 'spending', 'limits'],
      priority: 'high',
    },
    {
      id: 'email-notifications',
      title: 'Email Notifications',
      description: 'Control which notifications are sent via email',
      category: 'notifications',
      keywords: ['email', 'notifications', 'alerts', 'reports'],
      priority: 'medium',
    },
    {
      id: 'push-notifications',
      title: 'Push Notifications',
      description: 'Enable browser push notifications',
      category: 'notifications',
      keywords: ['push', 'notifications', 'browser', 'alerts'],
      priority: 'medium',
    },

    // App Preferences
    {
      id: 'theme-settings',
      title: 'Theme',
      description: 'Choose between light, dark, or system theme',
      category: 'preferences',
      keywords: ['theme', 'dark', 'light', 'appearance', 'mode'],
      priority: 'medium',
    },
    {
      id: 'dashboard-layout',
      title: 'Dashboard Layout',
      description: 'Customize your dashboard appearance',
      category: 'preferences',
      keywords: ['dashboard', 'layout', 'appearance', 'customize'],
      priority: 'low',
    },

    // Data Management
    {
      id: 'data-export',
      title: 'Export Data',
      description: 'Download your financial data in various formats',
      category: 'data',
      keywords: ['export', 'download', 'backup', 'data', 'csv', 'json'],
      priority: 'high',
    },
    {
      id: 'data-retention',
      title: 'Data Retention',
      description: 'Control how long your data is stored',
      category: 'data',
      keywords: ['retention', 'storage', 'data', 'delete', 'privacy'],
      priority: 'medium',
    },
    {
      id: 'account-deletion',
      title: 'Delete Account',
      description: 'Permanently delete your account and all data',
      category: 'data',
      keywords: ['delete', 'account', 'remove', 'permanent', 'data'],
      priority: 'high',
    },
  ]

  return { searchableItems }
}
