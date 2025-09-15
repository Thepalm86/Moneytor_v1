'use client'

/**
 * Settings Page Redesigned - Main Orchestrator Component
 * Clean, simplified settings experience with progressive disclosure
 * Replaces complex hierarchy with task-oriented design
 */

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { SettingsHeader, SettingsGroup, SettingsItem, QuickActions } from './index'
import { SettingsSearch } from './settings-search-simple'
import { LoadingSpinner } from '@/components/layout/loading-spinner'
import { useSettings, useTimezones } from '@/hooks/use-settings'
import { useCurrency } from '@/contexts/currency-context'
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
    isUpdatingProfile,
  } = useSettings()

  const { data: timezoneOptions } = useTimezones()
  const { currency: _currency, setCurrency } = useCurrency()

  // Handle section changes with URL updates (for future navigation)
  const _handleSectionChange = (section: SettingsCategory) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('section', section)
    router.push(`/settings?${params.toString()}`, { scroll: false })
  }

  // Consolidated settings groups with unified structure
  const settingsGroups = useMemo(
    () => [
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
            value: settings?.emailNotifications || false,
            onChange: (value: boolean) => updateSettings({ emailNotifications: value }),
          },
          {
            id: 'two_factor_enabled',
            type: 'toggle' as const,
            label: 'Two-Factor Authentication',
            description: 'Add extra security to your account',
            value: settings?.twoFactorEnabled || false,
            onChange: (value: boolean) => updateSettings({ twoFactorEnabled: value }),
            badge: settings?.twoFactorEnabled ? 'Enabled' : 'Recommended',
            badgeVariant: settings?.twoFactorEnabled ? 'success' : 'warning',
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
            type: 'select' as const,
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
            type: 'select' as const,
            label: 'Timezone',
            description: 'Your local timezone for date and time display',
            value: settings?.timezone || 'UTC',
            options:
              timezoneOptions?.map(tz => ({
                value: tz.value,
                label: tz.label,
              })) || [],
            onChange: (value: string) => updateSettings({ timezone: value }),
          },
          {
            id: 'date_format',
            type: 'select' as const,
            label: 'Date Format',
            description: 'How dates are displayed throughout the app',
            value: settings?.dateFormat || 'MM/dd/yyyy',
            options: [
              { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY (US)' },
              { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY (EU)' },
              { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD (ISO)' },
              { value: 'MMM dd, yyyy', label: 'MMM DD, YYYY (Verbose)' },
            ],
            onChange: (value: string) => updateSettings({ dateFormat: value as any }),
          },
          {
            id: 'number_format',
            type: 'select' as const,
            label: 'Number Format',
            description: 'How numbers and amounts are formatted',
            value: settings?.numberFormat || 'en-US',
            options: [
              { value: 'en-US', label: '1,234.56 (US)' },
              { value: 'en-GB', label: '1,234.56 (UK)' },
              { value: 'de-DE', label: '1.234,56 (German)' },
              { value: 'fr-FR', label: '1 234,56 (French)' },
            ],
            onChange: (value: string) => updateSettings({ numberFormat: value as any }),
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
            value: settings?.pushNotifications || false,
            onChange: (value: boolean) => updateSettings({ pushNotifications: value }),
          },
          {
            id: 'budget_alerts',
            type: 'toggle' as const,
            label: 'Budget Alerts',
            description: 'Get notified when approaching budget limits',
            value: settings?.budgetAlerts || true,
            onChange: (value: boolean) => updateSettings({ budgetAlerts: value }),
          },
          {
            id: 'goal_reminders',
            type: 'toggle' as const,
            label: 'Goal Reminders',
            description: 'Reminders to contribute to your savings goals',
            value: (settings as any)?.goal_reminders || true,
            onChange: (value: boolean) => updateSettings({ goal_reminders: value } as any),
          },
          {
            id: 'weekly_reports',
            type: 'toggle' as const,
            label: 'Weekly Reports',
            description: 'Receive weekly spending and budget summaries',
            value: settings?.weeklyReports || false,
            onChange: (value: boolean) => updateSettings({ weeklyReports: value }),
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
            value: (settings as any)?.data_sharing || false,
            onChange: (value: boolean) => updateSettings({ data_sharing: value } as any),
          },
          {
            id: 'session_timeout',
            type: 'select' as const,
            label: 'Auto-Logout Timer',
            description: 'Automatically sign out after inactivity',
            value: settings?.sessionTimeout?.toString() || '60',
            options: [
              { value: '15', label: '15 minutes' },
              { value: '30', label: '30 minutes' },
              { value: '60', label: '1 hour' },
              { value: '120', label: '2 hours' },
              { value: '240', label: '4 hours' },
              { value: '0', label: 'Never (Not recommended)' },
            ],
            onChange: (value: string) => updateSettings({ sessionTimeout: parseInt(value) }),
          },
          {
            id: 'data_retention',
            type: 'select' as const,
            label: 'Data Retention Period',
            description: 'How long to keep your transaction data',
            value: settings?.dataRetentionDays?.toString() || '365',
            options: [
              { value: '90', label: '3 months' },
              { value: '180', label: '6 months' },
              { value: '365', label: '1 year' },
              { value: '730', label: '2 years' },
              { value: '1825', label: '5 years' },
              { value: '0', label: 'Keep forever' },
            ],
            onChange: (value: string) => updateSettings({ dataRetentionDays: parseInt(value) }),
          },
        ],
      },
    ],
    [profile, settings, timezoneOptions, updateSettings, updateProfile, setCurrency]
  )

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
          const filteredItems = group.items.filter(
            item =>
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
      <div className={cn('flex min-h-96 items-center justify-center', className)}>
        <div className="space-y-4 text-center">
          <LoadingSpinner />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-8 pb-8', className)}>
      {/* Header with search and breadcrumbs */}
      <SettingsHeader
        title="Settings"
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
              <div className="truncate font-medium text-green-700">Currency</div>
              <div className="truncate text-sm text-muted-foreground">
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
              <div className="truncate font-medium text-blue-700">Timezone</div>
              <div className="truncate text-sm text-muted-foreground">
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
              <div className="truncate font-medium text-purple-700">Profile</div>
              <div className="truncate text-sm text-muted-foreground">
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
              <div className="truncate font-medium text-orange-700">Notifications</div>
              <div className="truncate text-sm text-muted-foreground">
                {settings?.emailNotifications ? 'Enabled' : 'Disabled'}
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
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
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
          filteredGroups.map(group => (
            <SettingsGroup
              key={group.id}
              title={group.title}
              description={group.description}
              icon={group.icon}
              priority={group.priority}
              collapsible
            >
              <div className="space-y-4">
                {group.items.map(item => (
                  <SettingsItem
                    key={item.id}
                    {...(item as any)}
                    loading={isUpdatingSettings || isUpdatingProfile}
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
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-600">
            💡
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="mb-2 text-lg font-semibold">Need Help?</h3>
            <p className="mb-4 text-muted-foreground">
              Our settings are designed to give you full control over your Moneytor experience. Each
              section helps you customize different aspects of the application.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" disabled>
                View Documentation
                <Badge variant="secondary" className="ml-2 text-xs">
                  Soon
                </Badge>
              </Button>
              <Button variant="outline" disabled>
                Contact Support
                <Badge variant="secondary" className="ml-2 text-xs">
                  Soon
                </Badge>
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
    <Suspense
      fallback={
        <div className="flex min-h-96 items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <SettingsPageRedesigned {...props} />
    </Suspense>
  )
}
