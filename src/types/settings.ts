/**
 * Settings and preferences types for Moneytor V2
 */

import type { Currency as _Currency } from '@/lib/utils/currency'
import type { UserProfile } from './supabase'

export interface UserSettings {
  // Currency & Regional
  currency: string
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  numberFormat: 'US' | 'EU' | 'UK'
  timezone: string

  // App Preferences
  theme: 'light' | 'dark' | 'system'
  defaultTransactionType: 'income' | 'expense'
  dashboardLayout: 'compact' | 'comfortable' | 'detailed'
  startOfWeek: 'monday' | 'sunday'

  // Notifications
  budgetAlerts: boolean
  goalMilestones: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  weeklyReports: boolean
  monthlyReports: boolean

  // Privacy & Security
  dataRetentionDays: number
  analyticsConsent: boolean
  marketingConsent: boolean
  twoFactorEnabled: boolean
  sessionTimeout: number // minutes

  // Advanced
  autoCategorizationEnabled: boolean
  duplicateDetectionEnabled: boolean
  exportFormat: 'CSV' | 'JSON' | 'PDF'
  backupFrequency: 'daily' | 'weekly' | 'monthly' | 'never'
}

export interface UserPreferences extends UserSettings {
  id: string
  userId: string
  createdAt: string
  updatedAt: string
}

export type SettingsCategory =
  | 'currency'
  | 'profile'
  | 'preferences'
  | 'notifications'
  | 'security'
  | 'data'

export interface SettingsSection {
  id: SettingsCategory
  title: string
  description: string
  icon: string
  gradient: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray'
}

export interface CurrencyOption {
  value: string
  label: string
  symbol: string
  position: 'left' | 'right'
}

export interface TimezoneOption {
  value: string
  label: string
  offset: string
}

export interface ThemeOption {
  value: UserSettings['theme']
  label: string
  description: string
  icon: string
}

export interface DateFormatOption {
  value: UserSettings['dateFormat']
  label: string
  example: string
}

export interface DashboardLayoutOption {
  value: UserSettings['dashboardLayout']
  label: string
  description: string
  icon: string
}

export interface ExportFormatOption {
  value: UserSettings['exportFormat']
  label: string
  description: string
  icon: string
}

export interface BackupFrequencyOption {
  value: UserSettings['backupFrequency']
  label: string
  description: string
}

// Extended user profile with settings
export interface UserProfileWithSettings extends UserProfile {
  preferences?: UserPreferences
}

// Settings update payload types
export type SettingsUpdatePayload = Partial<UserSettings>

// Settings validation schemas
export interface SettingsValidation {
  field: keyof UserSettings
  required: boolean
  type: 'string' | 'number' | 'boolean' | 'select'
  options?: Array<{ value: any; label: string }>
  min?: number
  max?: number
}

// Settings change event
export interface SettingsChangeEvent {
  field: keyof UserSettings
  oldValue: any
  newValue: any
  timestamp: Date
}

// Data export types
export interface DataExportRequest {
  format: UserSettings['exportFormat']
  dateRange?: {
    start: string
    end: string
  }
  includeCategories: boolean
  includeTransactions: boolean
  includeBudgets: boolean
  includeGoals: boolean
}

export interface DataExportResult {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  downloadUrl?: string
  fileName?: string
  fileSize?: number
  createdAt: string
  expiresAt: string
}

// Security settings
export interface SecuritySettings {
  twoFactorEnabled: boolean
  lastPasswordChange: string
  activeSessions: number
  loginAttempts: number
  accountLocked: boolean
  securityQuestions: boolean
}

// Notification preferences
export interface NotificationSettings {
  budgetAlerts: boolean
  goalMilestones: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  weeklyReports: boolean
  monthlyReports: boolean
  transactionReminders: boolean
  categorySpendingAlerts: boolean
}

// Privacy settings
export interface PrivacySettings {
  dataRetentionDays: number
  analyticsConsent: boolean
  marketingConsent: boolean
  profileVisibility: 'private' | 'public'
  dataSharing: boolean
  cookieConsent: boolean
}

// Settings migration type for future updates
export interface SettingsMigration {
  version: number
  changes: Array<{
    field: string
    action: 'add' | 'remove' | 'rename' | 'update'
    oldValue?: any
    newValue?: any
  }>
}
