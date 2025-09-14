'use client'

/**
 * Settings Page Redesigned - Main Orchestrator Component
 * Clean, simplified settings experience with progressive disclosure
 * Replaces complex hierarchy with task-oriented design
 */

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import {
  SettingsHeader,
  SettingsGroup,
  SettingsItem,
  SettingsSearch,
  QuickActions,
} from './index'
import { LoadingSpinner } from '@/components/layout/loading-spinner'
import { useSettings, useTimezones } from '@/hooks/use-settings'
import { useCurrencyContext } from '@/contexts/currency-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { SettingsCategory } from '@/types/settings'

interface SettingsPageRedesignedProps {
  initialSection?: SettingsCategory
  className?: string
}

export function SettingsPageRedesigned({
  initialSection = 'currency',
  className,
}: SettingsPageRedesignedProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchCategories, setSearchCategories] = useState<string[]>([])
  
  // Get section from URL params or use initial (for future navigation)
  const _activeSection = (searchParams?.get('section') as SettingsCategory) || initialSection
  
  const { 
    profile, 
    settings, 
    isLoading, 
    updateSettings, 
    updateProfile,
    isUpdatingSettings,
    isUpdatingProfile 
  } = useSettings()
  
  const { data: timezoneOptions } = useTimezones()
  const { currency: _currency, setCurrency } = useCurrencyContext()

  // Handle section changes with URL updates (for future navigation)
  const _handleSectionChange = (section: SettingsCategory) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('section', section)
    router.push(`/settings?${params.toString()}`, { scroll: false })
  }

  // Consolidated settings groups with unified structure
  const settingsGroups = useMemo(() => [
    {
      id: 'account',
      title: 'Account & Profile',
      description: 'Personal information and account security',
      icon: '👤',
      priority: 'high' as const,
      items: [
        {
          id: 'full_name',
          type: 'input' as const,
          label: 'Full Name',
          description: 'Your display name in the application',
          value: profile?.full_name || '',
          placeholder: 'Enter your full name',
          required: true,
          onChange: (value: string) => updateProfile({ fullName: value }),
        },
        {
          id: 'avatar_url',
          type: 'input' as const,
          label: 'Profile Picture URL',
          description: 'Link to your profile image (optional)',
          value: profile?.avatar_url || '',
          placeholder: 'https://example.com/image.jpg',
          onChange: (value: string) => updateProfile({ avatarUrl: value }),
        },
        {
          id: 'email_notifications',
          type: 'toggle' as const,
          label: 'Email Notifications',
          description: 'Receive important updates via email',
          value: settings?.email_notifications || false,
          onChange: (value: boolean) => updateSettings({ email_notifications: value }),
        },
        {
          id: 'two_factor_enabled',
          type: 'toggle' as const,
          label: 'Two-Factor Authentication',
          description: 'Add extra security to your account',
          value: settings?.two_factor_enabled || false,
          onChange: (value: boolean) => updateSettings({ two_factor_enabled: value }),
          badge: settings?.two_factor_enabled ? 'Enabled' : 'Recommended',
          badgeVariant: settings?.two_factor_enabled ? 'success' : 'warning',
        },
      ],
    },
    {
      id: 'preferences',
      title: 'App Preferences',
      description: 'Currency, timezone, and display settings',
      icon: '⚙️',
      priority: 'high' as const,
      items: [
        {
          id: 'currency',
          type: 'dropdown' as const,
          label: 'Currency',
          description: 'Primary currency for transactions and reports',
          value: settings?.currency || 'USD',
          options: [
            { value: 'USD', label: 'USD - US Dollar' },
            { value: 'EUR', label: 'EUR - Euro' },
            { value: 'GBP', label: 'GBP - British Pound' },
            { value: 'ILS', label: 'ILS - Israeli Shekel' },
            { value: 'CAD', label: 'CAD - Canadian Dollar' },
            { value: 'AUD', label: 'AUD - Australian Dollar' },
          ],
          onChange: (value: string) => {
            updateSettings({ currency: value })
            setCurrency(value)
          },
        },
        {
          id: 'timezone',
          type: 'dropdown' as const,
          label: 'Timezone',
          description: 'Your local timezone for date and time display',
          value: settings?.timezone || 'UTC',
          options: timezoneOptions?.data?.map(tz => ({
            value: tz.value,
            label: tz.label
          })) || [],
          onChange: (value: string) => updateSettings({ timezone: value }),
        },
        {
          id: 'date_format',
          type: 'dropdown' as const,
          label: 'Date Format',
          description: 'How dates are displayed throughout the app',
          value: settings?.date_format || 'MM/dd/yyyy',
          options: [
            { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY (US)' },
            { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY (EU)' },
            { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD (ISO)' },
            { value: 'MMM dd, yyyy', label: 'MMM DD, YYYY (Verbose)' },
          ],
          onChange: (value: string) => updateSettings({ date_format: value }),
        },
        {
          id: 'number_format',
          type: 'dropdown' as const,
          label: 'Number Format',
          description: 'How numbers and amounts are formatted',
          value: settings?.number_format || 'en-US',
          options: [
            { value: 'en-US', label: '1,234.56 (US)' },
            { value: 'en-GB', label: '1,234.56 (UK)' },
            { value: 'de-DE', label: '1.234,56 (German)' },
            { value: 'fr-FR', label: '1 234,56 (French)' },
          ],
          onChange: (value: string) => updateSettings({ number_format: value }),
        },
      ],
    },
    {
      id: 'notifications',
      title: 'Notifications & Alerts',
      description: 'Control how you receive updates and alerts',
      icon: '🔔',
      priority: 'medium' as const,
      items: [
        {
          id: 'push_notifications',
          type: 'toggle' as const,
          label: 'Push Notifications',
          description: 'Receive real-time notifications in your browser',
          value: settings?.push_notifications || false,
          onChange: (value: boolean) => updateSettings({ push_notifications: value }),
        },
        {
          id: 'budget_alerts',
          type: 'toggle' as const,
          label: 'Budget Alerts',
          description: 'Get notified when approaching budget limits',
          value: settings?.budget_alerts || true,
          onChange: (value: boolean) => updateSettings({ budget_alerts: value }),
        },
        {
          id: 'goal_reminders',
          type: 'toggle' as const,
          label: 'Goal Reminders',
          description: 'Reminders to contribute to your savings goals',
          value: settings?.goal_reminders || true,
          onChange: (value: boolean) => updateSettings({ goal_reminders: value }),
        },
        {
          id: 'weekly_reports',
          type: 'toggle' as const,
          label: 'Weekly Reports',
          description: 'Receive weekly spending and budget summaries',
          value: settings?.weekly_reports || false,
          onChange: (value: boolean) => updateSettings({ weekly_reports: value }),
        },
      ],
    },
    {
      id: 'privacy',
      title: 'Privacy & Data',
      description: 'Data management and privacy controls',
      icon: '🛡️',
      priority: 'medium' as const,
      items: [
        {
          id: 'data_sharing',
          type: 'toggle' as const,
          label: 'Anonymous Usage Analytics',
          description: 'Help improve the app by sharing anonymous usage data',
          value: settings?.data_sharing || false,
          onChange: (value: boolean) => updateSettings({ data_sharing: value }),
        },
        {
          id: 'session_timeout',
          type: 'dropdown' as const,
          label: 'Auto-Logout Timer',
          description: 'Automatically sign out after inactivity',
          value: settings?.session_timeout?.toString() || '60',
          options: [
            { value: '15', label: '15 minutes' },
            { value: '30', label: '30 minutes' },
            { value: '60', label: '1 hour' },
            { value: '120', label: '2 hours' },
            { value: '240', label: '4 hours' },
            { value: '0', label: 'Never (Not recommended)' },
          ],
          onChange: (value: string) => updateSettings({ session_timeout: parseInt(value) }),
        },
        {
          id: 'data_retention',
          type: 'dropdown' as const,
          label: 'Data Retention Period',
          description: 'How long to keep your transaction data',
          value: settings?.data_retention?.toString() || '365',
          options: [
            { value: '90', label: '3 months' },
            { value: '180', label: '6 months' },
            { value: '365', label: '1 year' },
            { value: '730', label: '2 years' },
            { value: '1825', label: '5 years' },
            { value: '0', label: 'Keep forever' },
          ],
          onChange: (value: string) => updateSettings({ data_retention: parseInt(value) }),
        },
      ],
    },
  ], [profile, settings, timezoneOptions, updateSettings, updateProfile, setCurrency])

  // Filter settings based on search
  const filteredGroups = useMemo(() => {
    if (!searchQuery && searchCategories.length === 0) {
      return settingsGroups
    }

    return settingsGroups
      .map(group => {
        // Filter by category if specified
        if (searchCategories.length > 0 && !searchCategories.includes(group.id)) {
          return null
        }

        // Filter items by search query
        if (searchQuery) {
          const filteredItems = group.items.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
          )

          if (filteredItems.length === 0) {
            return null
          }

          return { ...group, items: filteredItems }
        }

        return group
      })
      .filter(Boolean) as typeof settingsGroups
  }, [settingsGroups, searchQuery, searchCategories])

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("min-h-96 flex items-center justify-center", className)}>
        <div className="space-y-4 text-center">
          <LoadingSpinner />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-8 pb-8", className)}>
      {/* Header with search and breadcrumbs */}
      <SettingsHeader
        title="Settings"
        description="Manage your account preferences and application settings"
        actions={
          <QuickActions
            onResetSettings={async () => {
              // TODO: Implement reset confirmation dialog
              console.log('Reset settings clicked')
            }}
            onExportData={async () => {
              // TODO: Implement data export
              console.log('Export data clicked')
            }}
            onImportSettings={async () => {
              // TODO: Implement settings import
              console.log('Import settings clicked')
            }}
          />
        }
      />

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-green-100 p-2">
              <span className="text-2xl">💰</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-green-700 truncate">Currency</div>
              <div className="text-sm text-muted-foreground truncate">
                {settings?.currency || 'USD'}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <span className="text-2xl">🌍</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-blue-700 truncate">Timezone</div>
              <div className="text-sm text-muted-foreground truncate">
                {settings?.timezone?.replace('_', ' ').split('/').pop() || 'UTC'}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <span className="text-2xl">👤</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-purple-700 truncate">Profile</div>
              <div className="text-sm text-muted-foreground truncate">
                {profile?.full_name || 'Not set'}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-orange-100 p-2">
              <span className="text-2xl">🔔</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-orange-700 truncate">Notifications</div>
              <div className="text-sm text-muted-foreground truncate">
                {settings?.email_notifications ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <SettingsSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={searchCategories}
        onCategoriesChange={setSearchCategories}
        availableCategories={settingsGroups.map(group => ({
          id: group.id,
          label: group.title,
          count: group.items.length,
        }))}
      />

      {/* Settings Groups */}
      <div className="space-y-6">
        {filteredGroups.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">No settings found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setSearchCategories([])
                }}
                className="mt-4"
              >
                Clear filters
              </Button>
            </div>
          </Card>
        ) : (
          filteredGroups.map((group) => (
            <SettingsGroup
              key={group.id}
              title={group.title}
              description={group.description}
              icon={group.icon}
              priority={group.priority}
              collapsible
              defaultCollapsed={group.priority === 'medium'}
            >
              <div className="space-y-4">
                {group.items.map((item) => (
                  <SettingsItem
                    key={item.id}
                    type={item.type}
                    label={item.label}
                    description={item.description}
                    value={item.value}
                    placeholder={item.placeholder}
                    options={item.options}
                    required={item.required}
                    loading={
                      isUpdatingSettings || isUpdatingProfile
                    }
                    onChange={item.onChange}
                    badge={item.badge}
                    badgeVariant={item.badgeVariant}
                  />
                ))}
              </div>
            </SettingsGroup>
          ))
        )}
      </div>

      {/* Help Section */}
      <Card className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-600 shrink-0">
            💡
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="mb-2 text-lg font-semibold">Need Help?</h3>
            <p className="mb-4 text-muted-foreground">
              Our settings are designed to give you full control over your Moneytor experience. 
              Each section helps you customize different aspects of the application.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" disabled>
                View Documentation
                <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
              </Button>
              <Button variant="outline" disabled>
                Contact Support
                <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Wrapper component with Suspense for search params
export default function SettingsPageRedesignedWrapper(props: SettingsPageRedesignedProps) {
  return (
    <Suspense fallback={
      <div className="min-h-96 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <SettingsPageRedesigned {...props} />
    </Suspense>
  )
}