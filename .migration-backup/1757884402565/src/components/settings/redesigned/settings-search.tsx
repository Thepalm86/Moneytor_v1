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
  items: SearchableSettingItem[]
  onSearch: (results: SearchableSettingItem[], query: string) => void
  onFilter: (categories: SettingsCategory[]) => void
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
  items,
  onSearch,
  onFilter,
  placeholder = 'Search settings...',
  className,
}: SettingsSearchProps) {
  const [query, setQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<SettingsCategory[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Intelligent search algorithm
  const searchResults = useMemo(() => {
    if (!query.trim() && selectedCategories.length === 0) {
      return items
    }

    let filtered = items

    // Filter by categories first
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(item => 
        selectedCategories.includes(item.category)
      )
    }

    // Search by query
    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim()
      
      filtered = filtered
        .map(item => {
          let score = 0
          
          // Exact title match (highest priority)
          if (item.title.toLowerCase().includes(searchTerm)) {
            score += 100
          }
          
          // Description match
          if (item.description?.toLowerCase().includes(searchTerm)) {
            score += 50
          }
          
          // Keywords match
          const keywordMatches = item.keywords.filter(keyword =>
            keyword.toLowerCase().includes(searchTerm)
          ).length
          score += keywordMatches * 30
          
          // Priority boost
          if (item.priority === 'high') score += 20
          else if (item.priority === 'medium') score += 10
          
          return { ...item, searchScore: score }
        })
        .filter(item => item.searchScore > 0)
        .sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0))
    }

    return filtered
  }, [query, selectedCategories, items])

  // Handle search query change
  const handleSearchChange = useCallback((newQuery: string) => {
    setQuery(newQuery)
    onSearch(searchResults, newQuery)
  }, [searchResults, onSearch])

  // Handle category filter change
  const handleCategoryToggle = useCallback((category: SettingsCategory) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category]
    
    setSelectedCategories(newCategories)
    onFilter(newCategories)
  }, [selectedCategories, onFilter])

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setQuery('')
    setSelectedCategories([])
    onSearch(items, '')
    onFilter([])
  }, [items, onSearch, onFilter])

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
    
    return suggestions.filter(suggestion =>
      !query || suggestion.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5)
  }, [query])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-12 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
        />
        
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 p-0 hover:bg-gray-100"
            onClick={() => handleSearchChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters and Results Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Category Filters */}
        <div className="flex items-center space-x-2">
          <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 border-gray-200 hover:bg-gray-50"
              >
                <Filter className="h-3 w-3 mr-2" />
                Filters
                {selectedCategories.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-xs">
                    {selectedCategories.length}
                  </Badge>
                )}
                <ChevronDown className="h-3 w-3 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(categoryLabels).map(([key, label]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={selectedCategories.includes(key as SettingsCategory)}
                  onCheckedChange={() => handleCategoryToggle(key as SettingsCategory)}
                >
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
              {selectedCategories.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 px-2 text-xs"
                    onClick={handleClearFilters}
                  >
                    Clear All Filters
                  </Button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Active Category Filters */}
          {selectedCategories.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className={cn('text-xs cursor-pointer', categoryColors[category])}
              onClick={() => handleCategoryToggle(category)}
            >
              {categoryLabels[category]}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>

        {/* Results Summary */}
        <div className="text-sm text-gray-600">
          {query || selectedCategories.length > 0 ? (
            <span>
              {searchResults.length} of {items.length} settings
              {query && ` matching "${query}"`}
            </span>
          ) : (
            <span>{items.length} total settings</span>
          )}
        </div>
      </div>

      {/* Search Suggestions */}
      {query.length > 0 && query.length < 3 && (
        <div className="space-y-2">
          <div className="text-xs text-gray-500">Popular searches:</div>
          <div className="flex flex-wrap gap-2">
            {searchSuggestions.map((suggestion) => (
              <Button
                key={suggestion}
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs bg-gray-50 hover:bg-gray-100"
                onClick={() => handleSearchChange(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {(query || selectedCategories.length > 0) && searchResults.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Search className="h-8 w-8 mx-auto mb-3 text-gray-300" />
          <div className="text-sm">
            No settings found
            {query && ` for "${query}"`}
            {selectedCategories.length > 0 && ' in selected categories'}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-xs"
            onClick={handleClearFilters}
          >
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