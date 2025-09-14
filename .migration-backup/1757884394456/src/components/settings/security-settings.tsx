'use client'

/**
 * Security Settings Component
 * Manages security preferences and privacy settings
 */

import { useState, useEffect } from 'react'
import { SettingsSection, SettingsFormGroup, SettingsToggle, SettingsCard } from './settings-section'
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
import { useSettings } from '@/hooks/use-settings'
import { useUser } from '@/hooks/use-user'

interface SecuritySettingsProps {
  className?: string
}

export function SecuritySettings({ className }: SecuritySettingsProps) {
  const { user } = useUser()
  const { settings, updateSettings, isUpdatingSettings } = useSettings()
  
  const [dataRetentionDays, setDataRetentionDays] = useState(2555) // 7 years default
  const [analyticsConsent, setAnalyticsConsent] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState(480) // 8 hours
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Update local state when settings change
  useEffect(() => {
    if (settings) {
      setDataRetentionDays(settings.dataRetentionDays)
      setAnalyticsConsent(settings.analyticsConsent)
      setMarketingConsent(settings.marketingConsent)
      setTwoFactorEnabled(settings.twoFactorEnabled)
      setSessionTimeout(settings.sessionTimeout)
      setHasUnsavedChanges(false)
    }
  }, [settings])

  // Track changes
  useEffect(() => {
    if (!settings) return
    
    const hasChanges = 
      dataRetentionDays !== settings.dataRetentionDays ||
      analyticsConsent !== settings.analyticsConsent ||
      marketingConsent !== settings.marketingConsent ||
      twoFactorEnabled !== settings.twoFactorEnabled ||
      sessionTimeout !== settings.sessionTimeout

    setHasUnsavedChanges(hasChanges)
  }, [
    dataRetentionDays,
    analyticsConsent,
    marketingConsent,
    twoFactorEnabled,
    sessionTimeout,
    settings
  ])

  const handleSaveChanges = async () => {
    try {
      await updateSettings({
        dataRetentionDays,
        analyticsConsent,
        marketingConsent,
        twoFactorEnabled,
        sessionTimeout,
      })
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to save security settings:', error)
    }
  }

  const handleResetChanges = () => {
    if (!settings) return
    
    setDataRetentionDays(settings.dataRetentionDays)
    setAnalyticsConsent(settings.analyticsConsent)
    setMarketingConsent(settings.marketingConsent)
    setTwoFactorEnabled(settings.twoFactorEnabled)
    setSessionTimeout(settings.sessionTimeout)
    setHasUnsavedChanges(false)
  }

  const retentionOptions = [
    { value: 365, label: '1 Year', description: 'Data older than 1 year will be deleted' },
    { value: 1095, label: '3 Years', description: 'Data older than 3 years will be deleted' },
    { value: 2555, label: '7 Years', description: 'Data older than 7 years will be deleted (Recommended)' },
    { value: 3650, label: '10 Years', description: 'Data older than 10 years will be deleted' },
    { value: 0, label: 'Never', description: 'Keep all data permanently' },
  ]

  const sessionTimeoutOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 240, label: '4 hours' },
    { value: 480, label: '8 hours' },
    { value: 1440, label: '24 hours' },
  ]

  return (
    <SettingsSection
      title="Security & Privacy"
      description="Manage your account security, privacy preferences, and data handling"
      icon="🔒"
      gradient="red"
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
              className="bg-red-600 hover:bg-red-700"
            >
              {isUpdatingSettings ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        ) : null
      }
    >
      <div className="space-y-8">
        {/* Account Security */}
        <SettingsFormGroup
          title="Account Security"
          description="Protect your account with additional security measures"
        >
          <div className="space-y-6">
            <SettingsToggle
              label="Two-Factor Authentication"
              description="Add an extra layer of security to your account"
              checked={twoFactorEnabled}
              onChange={setTwoFactorEnabled}
              disabled={true}
            />
            
            {twoFactorEnabled && (
              <SettingsCard
                title="Two-Factor Setup"
                description="Configure your preferred 2FA method"
                icon="📱"
                variant="success"
              >
                <div className="space-y-3">
                  <Button variant="outline" disabled>
                    Setup Authenticator App
                  </Button>
                  <Button variant="outline" disabled>
                    Setup SMS Verification
                  </Button>
                </div>
              </SettingsCard>
            )}

            <div>
              <Label htmlFor="session-timeout">Session Timeout</Label>
              <Select 
                value={sessionTimeout.toString()} 
                onValueChange={(value) => setSessionTimeout(parseInt(value))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sessionTimeoutOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600 mt-1">
                Automatically log out after this period of inactivity
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
            <div className="flex items-start space-x-3">
              <span className="text-amber-600 text-lg">⚠️</span>
              <div>
                <h4 className="font-medium text-amber-900">Security Features Coming Soon</h4>
                <p className="text-sm text-amber-800 mt-1">
                  Two-factor authentication and advanced security features are currently in development.
                </p>
              </div>
            </div>
          </div>
        </SettingsFormGroup>

        {/* Password Management */}
        <SettingsFormGroup
          title="Password Management"
          description="Change your password and manage login security"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="outline" disabled>
                Change Password
                <span className="text-xs ml-2">(Coming Soon)</span>
              </Button>
              
              <Button variant="outline" disabled>
                View Login History
                <span className="text-xs ml-2">(Coming Soon)</span>
              </Button>
            </div>

            <SettingsCard
              title="Password Security Tips"
              description="Keep your account secure with these recommendations"
              icon="💡"
              variant="default"
            >
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use a unique password that you don't use elsewhere</li>
                <li>• Include uppercase, lowercase, numbers, and symbols</li>
                <li>• Make it at least 12 characters long</li>
                <li>• Consider using a password manager</li>
                <li>• Update your password regularly</li>
              </ul>
            </SettingsCard>
          </div>
        </SettingsFormGroup>

        {/* Data Retention */}
        <SettingsFormGroup
          title="Data Retention"
          description="Control how long your financial data is kept"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="data-retention">Data Retention Period</Label>
              <Select 
                value={dataRetentionDays.toString()} 
                onValueChange={(value) => setDataRetentionDays(parseInt(value))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {retentionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <SettingsCard
              title="Data Retention Impact"
              description="Understanding how data retention affects your experience"
              icon="📊"
              variant={dataRetentionDays === 0 ? "warning" : "default"}
            >
              <div className="text-sm">
                <p className="text-gray-600 mb-2">
                  {dataRetentionDays === 0 
                    ? "All your data will be kept permanently. This provides the most complete financial history but uses more storage."
                    : `Data older than ${Math.floor(dataRetentionDays / 365)} year${dataRetentionDays >= 730 ? 's' : ''} will be automatically deleted. This helps protect your privacy and reduce storage usage.`
                  }
                </p>
                <p className="text-gray-600">
                  You can always export your data before it's automatically deleted.
                </p>
              </div>
            </SettingsCard>
          </div>
        </SettingsFormGroup>

        {/* Privacy Preferences */}
        <SettingsFormGroup
          title="Privacy Preferences"
          description="Control how your data is used and shared"
        >
          <div className="space-y-6">
            <SettingsToggle
              label="Analytics & Usage Data"
              description="Help improve Moneytor by sharing anonymous usage statistics"
              checked={analyticsConsent}
              onChange={setAnalyticsConsent}
            />
            
            <SettingsToggle
              label="Marketing Communications"
              description="Receive updates about new features and financial tips"
              checked={marketingConsent}
              onChange={setMarketingConsent}
            />
          </div>

          <SettingsCard
            title="Your Privacy Matters"
            description="How we protect your personal information"
            icon="🛡️"
            variant="success"
            className="mt-4"
          >
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Your financial data is never shared with third parties</li>
              <li>• All data is encrypted in transit and at rest</li>
              <li>• You can export or delete your data at any time</li>
              <li>• We comply with GDPR, CCPA, and other privacy regulations</li>
              <li>• Anonymous analytics help us improve the product for everyone</li>
            </ul>
          </SettingsCard>
        </SettingsFormGroup>

        {/* Advanced Security */}
        <SettingsFormGroup
          title="Advanced Security"
          description="Additional security and privacy options"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <h4 className="font-medium text-gray-900 mb-2">Device Management</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Manage devices that have access to your account
                </p>
                <Button variant="outline" size="sm" disabled>
                  Manage Devices
                  <span className="text-xs ml-2">(Coming Soon)</span>
                </Button>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h4 className="font-medium text-gray-900 mb-2">API Access</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Generate API keys for third-party integrations
                </p>
                <Button variant="outline" size="sm" disabled>
                  Manage API Keys
                  <span className="text-xs ml-2">(Coming Soon)</span>
                </Button>
              </div>
            </div>
          </div>
        </SettingsFormGroup>
      </div>
    </SettingsSection>
  )
}