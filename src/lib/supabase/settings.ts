/**
 * Settings database operations for Moneytor V2
 * Handles user preferences, profile updates, and settings management
 */

import { supabase } from './client'
import type {
  UserSettings,
  UserPreferences,
  SettingsUpdatePayload,
  DataExportRequest,
  DataExportResult,
  UserProfileWithSettings,
} from '@/types/settings'
import type { UserProfile } from '@/types/supabase'
import { getDefaultCurrency } from '@/lib/utils/currency'

/**
 * Get default settings for new users
 */
export function getDefaultSettings(): UserSettings {
  const defaultCurrency = getDefaultCurrency()

  return {
    // Currency & Regional
    currency: defaultCurrency.code,
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'US',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',

    // App Preferences
    theme: 'system',
    defaultTransactionType: 'expense',
    dashboardLayout: 'comfortable',
    startOfWeek: 'monday',

    // Notifications
    budgetAlerts: true,
    goalMilestones: true,
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: false,
    monthlyReports: true,

    // Privacy & Security
    dataRetentionDays: 2555, // 7 years
    analyticsConsent: false,
    marketingConsent: false,
    twoFactorEnabled: false,
    sessionTimeout: 480, // 8 hours

    // Advanced
    autoCategorizationEnabled: true,
    duplicateDetectionEnabled: true,
    exportFormat: 'CSV',
    backupFrequency: 'monthly',
  }
}

/**
 * Get user profile with settings
 */
export async function getUserProfileWithSettings(
  userId: string
): Promise<{ data: UserProfileWithSettings | null; error: string | null }> {
  try {
    // First get the profile from user_profiles table
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const defaultSettings = getDefaultSettings()
        const { data: newProfile, error: createError } = await (supabase as any)
          .from('user_profiles')
          .insert({
            id: userId,
            currency: defaultSettings.currency,
            timezone: defaultSettings.timezone,
          })
          .select()
          .single()

        if (createError) {
          return { data: null, error: `Failed to create profile: ${createError.message}` }
        }

        // Create default preferences
        const { error: prefsError } = await createUserPreferences(userId, defaultSettings)
        if (prefsError) {
          console.warn('Failed to create default preferences:', prefsError)
        }

        return {
          data: {
            ...newProfile,
            preferences: {
              ...defaultSettings,
              id: userId,
              userId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
          error: null,
        }
      }
      return { data: null, error: profileError.message }
    }

    // Try to get preferences from a potential user_preferences table
    // For now, we'll store preferences in user_profiles or derive from profile
    const preferences: UserPreferences = {
      ...getDefaultSettings(),
      id: (profile as any).id,
      userId: (profile as any).id,
      currency: (profile as any).currency || getDefaultSettings().currency,
      timezone: (profile as any).timezone || getDefaultSettings().timezone,
      createdAt: (profile as any).created_at,
      updatedAt: (profile as any).updated_at,
    }

    return {
      data: {
        ...(profile as any),
        preferences,
      },
      error: null,
    }
  } catch (err) {
    console.error('Unexpected error getting user profile:', err)
    return { data: null, error: 'Failed to fetch user profile' }
  }
}

/**
 * Create user preferences (for future use when we add a preferences table)
 */
async function createUserPreferences(
  userId: string,
  settings: UserSettings
): Promise<{ error: string | null }> {
  // For now, we'll store basic preferences in the user_profiles table
  // In the future, this could create a separate user_preferences record
  try {
    const { error } = await (supabase as any)
      .from('user_profiles')
      .update({
        currency: settings.currency,
        timezone: settings.timezone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (err) {
    console.error('Error creating user preferences:', err)
    return { error: 'Failed to create preferences' }
  }
}

/**
 * Update user settings
 */
export async function updateUserSettings(
  userId: string,
  updates: SettingsUpdatePayload
): Promise<{ data: UserProfileWithSettings | null; error: string | null }> {
  try {
    // Update the user_profiles table with relevant settings
    const profileUpdates: Partial<UserProfile> = {}

    if (updates.currency !== undefined) {
      profileUpdates.currency = updates.currency
    }

    if (updates.timezone !== undefined) {
      profileUpdates.timezone = updates.timezone
    }

    if (Object.keys(profileUpdates).length > 0) {
      profileUpdates.updated_at = new Date().toISOString()

      const { error: updateError } = await (supabase as any)
        .from('user_profiles')
        .update(profileUpdates)
        .eq('id', userId)

      if (updateError) {
        return { data: null, error: updateError.message }
      }
    }

    // Get the updated profile
    return await getUserProfileWithSettings(userId)
  } catch (err) {
    console.error('Unexpected error updating settings:', err)
    return { data: null, error: 'Failed to update settings' }
  }
}

/**
 * Update user profile information
 */
export async function updateUserProfile(
  userId: string,
  updates: {
    fullName?: string
    avatarUrl?: string
  }
): Promise<{ data: UserProfile | null; error: string | null }> {
  try {
    const profileUpdates: any = {
      updated_at: new Date().toISOString(),
    }

    if (updates.fullName !== undefined) {
      profileUpdates.full_name = updates.fullName
    }

    if (updates.avatarUrl !== undefined) {
      profileUpdates.avatar_url = updates.avatarUrl
    }

    const { data, error } = await (supabase as any)
      .from('user_profiles')
      .update(profileUpdates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error updating profile:', err)
    return { data: null, error: 'Failed to update profile' }
  }
}

/**
 * Reset settings to defaults
 */
export async function resetUserSettings(
  userId: string
): Promise<{ data: UserProfileWithSettings | null; error: string | null }> {
  const defaultSettings = getDefaultSettings()
  return await updateUserSettings(userId, defaultSettings)
}

/**
 * Delete user account and all data
 */
export async function deleteUserAccount(
  userId: string,
  confirmationToken: string
): Promise<{ error: string | null }> {
  try {
    // Verify confirmation token (in a real app, this would be more secure)
    if (confirmationToken !== `DELETE_${userId}`) {
      return { error: 'Invalid confirmation token' }
    }

    // Delete in order due to foreign key constraints
    const tables = ['transactions', 'budgets', 'saving_goals', 'categories', 'user_profiles']

    for (const table of tables) {
      const { error } = await supabase.from(table).delete().eq('user_id', userId)

      if (error && table === 'user_profiles') {
        // For user_profiles, use 'id' instead of 'user_id'
        const { error: profileError } = await supabase
          .from('user_profiles')
          .delete()
          .eq('id', userId)

        if (profileError) {
          console.error(`Error deleting from ${table}:`, profileError)
          return { error: `Failed to delete ${table}: ${profileError.message}` }
        }
      } else if (error) {
        console.error(`Error deleting from ${table}:`, error)
        return { error: `Failed to delete ${table}: ${error.message}` }
      }
    }

    return { error: null }
  } catch (err) {
    console.error('Unexpected error deleting account:', err)
    return { error: 'Failed to delete account' }
  }
}

/**
 * Export user data
 */
export async function requestDataExport(
  userId: string,
  _request: DataExportRequest
): Promise<{ data: DataExportResult | null; error: string | null }> {
  try {
    // This would typically queue a background job
    // For now, we'll return a mock export result
    const exportResult: DataExportResult = {
      id: `export_${userId}_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    }

    return { data: exportResult, error: null }
  } catch (err) {
    console.error('Error requesting data export:', err)
    return { data: null, error: 'Failed to request data export' }
  }
}

/**
 * Get data export status
 */
export async function getDataExportStatus(
  userId: string,
  exportId: string
): Promise<{ data: DataExportResult | null; error: string | null }> {
  try {
    // This would fetch from an exports table
    // For now, return a mock completed export
    const exportResult: DataExportResult = {
      id: exportId,
      status: 'completed',
      downloadUrl: `/api/exports/${exportId}/download`,
      fileName: `moneytor-data-${userId}.zip`,
      fileSize: 1024 * 1024, // 1MB
      createdAt: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }

    return { data: exportResult, error: null }
  } catch (err) {
    console.error('Error getting export status:', err)
    return { data: null, error: 'Failed to get export status' }
  }
}

/**
 * Get user's timezone options based on current settings
 */
export function getTimezoneOptions(): Array<{ value: string; label: string; offset: string }> {
  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Jerusalem',
    'Asia/Tokyo',
    'Australia/Sydney',
    'America/Toronto',
    'America/Vancouver',
  ]

  return timezones.map(tz => {
    const now = new Date()
    const offset =
      new Intl.DateTimeFormat('en', {
        timeZone: tz,
        timeZoneName: 'short',
      })
        .formatToParts(now)
        .find(part => part.type === 'timeZoneName')?.value || ''

    return {
      value: tz,
      label: tz.replace(/_/g, ' ').replace('/', ' / '),
      offset,
    }
  })
}
