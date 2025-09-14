'use client'

/**
 * Notification Settings Component
 * Manages notification preferences and alert settings
 */

import { useState, useEffect } from 'react'
import { SettingsSection, SettingsFormGroup, SettingsToggle, SettingsCard } from './settings-section'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/hooks/use-settings'

interface NotificationSettingsProps {
  className?: string
}

export function NotificationSettings({ className }: NotificationSettingsProps) {
  const { settings, updateSettings, isUpdatingSettings } = useSettings()
  
  const [budgetAlerts, setBudgetAlerts] = useState(true)
  const [goalMilestones, setGoalMilestones] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(false)
  const [monthlyReports, setMonthlyReports] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Update local state when settings change
  useEffect(() => {
    if (settings) {
      setBudgetAlerts(settings.budgetAlerts)
      setGoalMilestones(settings.goalMilestones)
      setEmailNotifications(settings.emailNotifications)
      setPushNotifications(settings.pushNotifications)
      setWeeklyReports(settings.weeklyReports)
      setMonthlyReports(settings.monthlyReports)
      setHasUnsavedChanges(false)
    }
  }, [settings])

  // Track changes
  useEffect(() => {
    if (!settings) return
    
    const hasChanges = 
      budgetAlerts !== settings.budgetAlerts ||
      goalMilestones !== settings.goalMilestones ||
      emailNotifications !== settings.emailNotifications ||
      pushNotifications !== settings.pushNotifications ||
      weeklyReports !== settings.weeklyReports ||
      monthlyReports !== settings.monthlyReports

    setHasUnsavedChanges(hasChanges)
  }, [
    budgetAlerts,
    goalMilestones,
    emailNotifications,
    pushNotifications,
    weeklyReports,
    monthlyReports,
    settings
  ])

  const handleSaveChanges = async () => {
    try {
      await updateSettings({
        budgetAlerts,
        goalMilestones,
        emailNotifications,
        pushNotifications,
        weeklyReports,
        monthlyReports,
      })
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to save notification settings:', error)
    }
  }

  const handleResetChanges = () => {
    if (!settings) return
    
    setBudgetAlerts(settings.budgetAlerts)
    setGoalMilestones(settings.goalMilestones)
    setEmailNotifications(settings.emailNotifications)
    setPushNotifications(settings.pushNotifications)
    setWeeklyReports(settings.weeklyReports)
    setMonthlyReports(settings.monthlyReports)
    setHasUnsavedChanges(false)
  }

  return (
    <SettingsSection
      title="Notifications & Alerts"
      description="Control how and when you receive notifications about your finances"
      icon="🔔"
      gradient="orange"
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
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isUpdatingSettings ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        ) : null
      }
    >
      <div className="space-y-8">
        {/* Financial Alerts */}
        <SettingsFormGroup
          title="Financial Alerts"
          description="Get notified about important financial events"
        >
          <div className="space-y-6">
            <SettingsToggle
              label="Budget Alerts"
              description="Receive notifications when you approach or exceed budget limits"
              checked={budgetAlerts}
              onChange={setBudgetAlerts}
            />
            
            <SettingsToggle
              label="Goal Milestones"
              description="Get notified when you reach saving goal milestones or deadlines"
              checked={goalMilestones}
              onChange={setGoalMilestones}
            />
          </div>
          
          {(budgetAlerts || goalMilestones) && (
            <SettingsCard
              title="Alert Timing"
              description="When would you like to receive these alerts?"
              icon="⏰"
              variant="default"
              className="mt-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900">Budget Alerts:</span>
                  <ul className="text-gray-600 mt-1 space-y-1">
                    <li>• At 75% of budget limit</li>
                    <li>• At 90% of budget limit</li>
                    <li>• When budget is exceeded</li>
                  </ul>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Goal Milestones:</span>
                  <ul className="text-gray-600 mt-1 space-y-1">
                    <li>• Every 25% progress</li>
                    <li>• 30 days before deadline</li>
                    <li>• When goal is achieved</li>
                  </ul>
                </div>
              </div>
            </SettingsCard>
          )}
        </SettingsFormGroup>

        {/* Delivery Methods */}
        <SettingsFormGroup
          title="Delivery Methods"
          description="Choose how you want to receive notifications"
        >
          <div className="space-y-6">
            <SettingsToggle
              label="Email Notifications"
              description="Receive notifications via email to your registered address"
              checked={emailNotifications}
              onChange={setEmailNotifications}
            />
            
            <SettingsToggle
              label="Push Notifications"
              description="Receive browser push notifications (when available)"
              checked={pushNotifications}
              onChange={setPushNotifications}
              disabled={!('Notification' in window)}
            />
          </div>

          {!('Notification' in window) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <div className="flex items-start space-x-3">
                <span className="text-yellow-600 text-lg">⚠️</span>
                <div>
                  <h4 className="font-medium text-yellow-900">Browser Notifications Not Supported</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    Your browser doesn't support push notifications. Email notifications will be used instead.
                  </p>
                </div>
              </div>
            </div>
          )}
        </SettingsFormGroup>

        {/* Reports & Summaries */}
        <SettingsFormGroup
          title="Reports & Summaries"
          description="Receive periodic summaries of your financial activity"
        >
          <div className="space-y-6">
            <SettingsToggle
              label="Weekly Reports"
              description="Get a summary of your spending and income every week"
              checked={weeklyReports}
              onChange={setWeeklyReports}
            />
            
            <SettingsToggle
              label="Monthly Reports"
              description="Receive detailed monthly financial reports and insights"
              checked={monthlyReports}
              onChange={setMonthlyReports}
            />
          </div>

          {(weeklyReports || monthlyReports) && (
            <SettingsCard
              title="Report Contents"
              description="Your reports will include:"
              icon="📊"
              variant="success"
              className="mt-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900">Weekly Reports:</span>
                  <ul className="text-gray-600 mt-1 space-y-1">
                    <li>• Spending summary by category</li>
                    <li>• Budget performance</li>
                    <li>• Top expenses</li>
                  </ul>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Monthly Reports:</span>
                  <ul className="text-gray-600 mt-1 space-y-1">
                    <li>• Comprehensive financial overview</li>
                    <li>• Trends and insights</li>
                    <li>• Goal progress updates</li>
                    <li>• Recommendations</li>
                  </ul>
                </div>
              </div>
            </SettingsCard>
          )}
        </SettingsFormGroup>

        {/* Notification Testing */}
        <SettingsFormGroup
          title="Test Notifications"
          description="Send test notifications to verify your settings"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              variant="outline"
              disabled={!emailNotifications}
              onClick={() => {
                // This would trigger a test email
                console.log('Test email notification')
              }}
            >
              Send Test Email
            </Button>
            
            <Button
              variant="outline"
              disabled={!pushNotifications || !('Notification' in window)}
              onClick={() => {
                // This would trigger a test push notification
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('Moneytor Test', {
                    body: 'This is a test notification from Moneytor.',
                    icon: '/favicon.ico',
                  })
                }
              }}
            >
              Send Test Push
            </Button>
          </div>
        </SettingsFormGroup>

        {/* Advanced Settings */}
        <SettingsFormGroup
          title="Advanced Notification Settings"
          description="Fine-tune your notification experience"
        >
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <h4 className="font-medium text-gray-900 mb-2">Quiet Hours</h4>
              <p className="text-sm text-gray-600 mb-3">
                Set times when you don't want to receive notifications
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded p-2 text-sm text-amber-700">
                Coming soon in a future update
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <h4 className="font-medium text-gray-900 mb-2">Smart Bundling</h4>
              <p className="text-sm text-gray-600 mb-3">
                Group multiple notifications to reduce interruptions
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded p-2 text-sm text-amber-700">
                Coming soon in a future update
              </div>
            </div>
          </div>
        </SettingsFormGroup>
      </div>
    </SettingsSection>
  )
}