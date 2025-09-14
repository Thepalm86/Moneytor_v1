'use client'

/**
 * Main Settings Page Component
 * Orchestrates all settings sections with navigation and layout
 */

import { useState } from 'react'
import { SettingsLayout, SettingsSidebar } from './settings-layout'
import { CurrencySettings } from './currency-settings'
import { ProfileSettings } from './profile-settings'
import { PreferencesSettings } from './preferences-settings'
import { NotificationSettings } from './notification-settings'
import { SecuritySettings } from './security-settings'
import { DataManagementSettings } from './data-management-settings'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/hooks/use-settings'
import type { SettingsCategory } from '@/types/settings'

interface SettingsPageProps {
  initialSection?: SettingsCategory
}

export function SettingsPage({ initialSection = 'currency' }: SettingsPageProps) {
  const [activeSection, setActiveSection] = useState<SettingsCategory>(initialSection)
  const { profile, settings, isLoading } = useSettings()

  const sections = [
    {
      id: 'currency' as const,
      title: 'Currency & Regional',
      description: 'Configure currency, timezone, and regional formats',
      icon: '💰',
      gradient: 'from-green-600 via-emerald-700 to-teal-700',
    },
    {
      id: 'profile' as const,
      title: 'Profile & Account',
      description: 'Manage your personal information and account details',
      icon: '👤',
      gradient: 'from-blue-600 via-blue-700 to-indigo-700',
    },
    {
      id: 'preferences' as const,
      title: 'App Preferences',
      description: 'Customize your Moneytor experience and interface',
      icon: '⚙️',
      gradient: 'from-purple-600 via-violet-700 to-indigo-700',
    },
    {
      id: 'notifications' as const,
      title: 'Notifications & Alerts',
      description: 'Control how you receive financial notifications',
      icon: '🔔',
      gradient: 'from-orange-600 via-amber-700 to-yellow-700',
    },
    {
      id: 'security' as const,
      title: 'Security & Privacy',
      description: 'Manage account security and privacy preferences',
      icon: '🔒',
      gradient: 'from-red-600 via-rose-700 to-pink-700',
    },
    {
      id: 'data' as const,
      title: 'Data Management',
      description: 'Export, import, and backup your financial data',
      icon: '💾',
      gradient: 'from-gray-600 via-slate-700 to-gray-800',
    },
  ]

  const currentSection = sections.find(section => section.id === activeSection)

  const renderSettingsContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      )
    }

    switch (activeSection) {
      case 'currency':
        return <CurrencySettings />
      case 'profile':
        return <ProfileSettings />
      case 'preferences':
        return <PreferencesSettings />
      case 'notifications':
        return <NotificationSettings />
      case 'security':
        return <SecuritySettings />
      case 'data':
        return <DataManagementSettings />
      default:
        return <CurrencySettings />
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Settings"
        subtitle="Manage your account preferences and application settings"
        gradient="blue"
        actions={
          <div className="flex space-x-3">
            <Button variant="outline" disabled>
              Import Settings
              <span className="text-xs ml-2">(Coming Soon)</span>
            </Button>
            <Button variant="outline" disabled>
              Export Settings
              <span className="text-xs ml-2">(Coming Soon)</span>
            </Button>
          </div>
        }
      >
        {/* Settings Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <span className="text-white text-lg">💰</span>
              </div>
              <div>
                <div className="font-medium text-white">Current Currency</div>
                <div className="text-sm text-white/80">
                  {settings?.currency || 'USD'} - {settings?.currency === 'ILS' ? 'Israeli Shekel' : 'US Dollar'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <span className="text-white text-lg">🌍</span>
              </div>
              <div>
                <div className="font-medium text-white">Timezone</div>
                <div className="text-sm text-white/80">
                  {settings?.timezone?.replace('_', ' ').split('/').pop() || 'System Default'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <span className="text-white text-lg">👤</span>
              </div>
              <div>
                <div className="font-medium text-white">Profile</div>
                <div className="text-sm text-white/80">
                  {profile?.full_name || 'Name not set'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageHeader>

      {/* Settings Layout */}
      <SettingsLayout
        sidebar={
          <SettingsSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            sections={sections}
          />
        }
      >
        {renderSettingsContent()}
      </SettingsLayout>

      {/* Settings Help Section */}
      <div className="rounded-2xl border border-gray-200/50 bg-white/60 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-start space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 text-xl">
            💡
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help with Settings?</h3>
            <p className="text-gray-600 mb-4">
              Our settings are designed to give you full control over your Moneytor experience. 
              Each section helps you customize different aspects of the application to match your preferences.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="outline" disabled>
                View Help Documentation
                <span className="text-xs ml-2">(Coming Soon)</span>
              </Button>
              <Button variant="outline" disabled>
                Contact Support
                <span className="text-xs ml-2">(Coming Soon)</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}