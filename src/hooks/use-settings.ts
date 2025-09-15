'use client'

/**
 * Settings management hooks for Moneytor V2
 * Handles user preferences, profile updates, and settings operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from './use-user'
import { useToast } from './use-toast'
import {
  getUserProfileWithSettings,
  updateUserSettings,
  updateUserProfile,
  resetUserSettings,
  deleteUserAccount,
  requestDataExport,
  getDataExportStatus,
  getTimezoneOptions,
} from '@/lib/supabase/settings'
import type {
  UserProfileWithSettings,
  SettingsUpdatePayload,
  DataExportRequest,
  DataExportResult,
} from '@/types/settings'
import type { UserProfile } from '@/types/supabase'

/**
 * Hook to manage user settings and preferences
 */
export function useSettings() {
  const { user } = useUser()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Query for user profile with settings
  const {
    data: profileWithSettings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user-profile-settings', user?.id],
    queryFn: () => getUserProfileWithSettings(user!.id),
    enabled: !!user?.id,
    select: data => data.data,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Mutation to update settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: SettingsUpdatePayload) => {
      if (!user?.id) throw new Error('User not authenticated')

      const result = await updateUserSettings(user.id, updates)
      if (result.error) throw new Error(result.error)

      return result.data
    },
    onSuccess: data => {
      queryClient.setQueryData(['user-profile-settings', user?.id], data)
      toast({
        title: 'Settings updated',
        description: 'Your preferences have been saved successfully.',
      })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to update settings',
        description: error.message,
      })
    },
  })

  // Mutation to update profile information
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: { fullName?: string; avatarUrl?: string }) => {
      if (!user?.id) throw new Error('User not authenticated')

      const result = await updateUserProfile(user.id, updates)
      if (result.error) throw new Error(result.error)

      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile-settings', user?.id] })
      toast({
        title: 'Profile updated',
        description: 'Your profile information has been saved.',
      })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to update profile',
        description: error.message,
      })
    },
  })

  // Mutation to reset settings to defaults
  const resetSettingsMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')

      const result = await resetUserSettings(user.id)
      if (result.error) throw new Error(result.error)

      return result.data
    },
    onSuccess: data => {
      queryClient.setQueryData(['user-profile-settings', user?.id], data)
      toast({
        title: 'Settings reset',
        description: 'All settings have been restored to defaults.',
      })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to reset settings',
        description: error.message,
      })
    },
  })

  return {
    // Data
    profile: profileWithSettings,
    settings: profileWithSettings?.preferences,
    isLoading,
    error,

    // Actions
    updateSettings: updateSettingsMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    resetSettings: resetSettingsMutation.mutateAsync,
    refresh: refetch,

    // Loading states
    isUpdatingSettings: updateSettingsMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isResettingSettings: resetSettingsMutation.isPending,
  }
}

/**
 * Hook to manage data export requests
 */
export function useDataExport() {
  const { user } = useUser()
  const { toast } = useToast()

  // Mutation to request data export
  const requestExportMutation = useMutation({
    mutationFn: async (request: DataExportRequest) => {
      if (!user?.id) throw new Error('User not authenticated')

      const result = await requestDataExport(user.id, request)
      if (result.error) throw new Error(result.error)

      return result.data
    },
    onSuccess: () => {
      toast({
        title: 'Export requested',
        description: "Your data export has been queued. You will be notified when it's ready.",
      })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Export failed',
        description: error.message,
      })
    },
  })

  // Query to check export status
  const useExportStatus = (exportId?: string) => {
    return useQuery({
      queryKey: ['export-status', exportId],
      queryFn: () => getDataExportStatus(user!.id, exportId!),
      enabled: !!user?.id && !!exportId,
      select: data => data.data,
      refetchInterval: query => {
        // Poll every 5 seconds if export is pending or processing
        const status = (query as any)?.state?.data?.data?.status
        return status === 'pending' || status === 'processing' ? 5000 : false
      },
    })
  }

  return {
    requestExport: requestExportMutation.mutateAsync,
    isRequesting: requestExportMutation.isPending,
    useExportStatus,
  }
}

/**
 * Hook to manage account deletion
 */
export function useAccountDeletion() {
  const { user } = useUser()
  const { toast } = useToast()

  const deleteAccountMutation = useMutation({
    mutationFn: async (confirmationToken: string) => {
      if (!user?.id) throw new Error('User not authenticated')

      const result = await deleteUserAccount(user.id, confirmationToken)
      if (result.error) throw new Error(result.error)

      return result
    },
    onSuccess: () => {
      toast({
        title: 'Account deleted',
        description: 'Your account and all associated data have been permanently deleted.',
      })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Deletion failed',
        description: error.message,
      })
    },
  })

  return {
    deleteAccount: deleteAccountMutation.mutateAsync,
    isDeleting: deleteAccountMutation.isPending,
  }
}

/**
 * Hook for timezone options
 */
export function useTimezones() {
  return useQuery({
    queryKey: ['timezone-options'],
    queryFn: getTimezoneOptions,
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Hook for settings form validation
 */
export function useSettingsValidation() {
  const validateCurrency = (currencyCode: string): boolean => {
    return /^[A-Z]{3}$/.test(currencyCode)
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateSessionTimeout = (minutes: number): boolean => {
    return minutes >= 15 && minutes <= 1440 // 15 minutes to 24 hours
  }

  const validateDataRetention = (days: number): boolean => {
    return days >= 30 && days <= 3650 // 30 days to 10 years
  }

  return {
    validateCurrency,
    validateEmail,
    validateSessionTimeout,
    validateDataRetention,
  }
}

/**
 * Hook for bulk settings update
 */
export function useBulkSettingsUpdate() {
  const { updateSettings } = useSettings()
  const { toast } = useToast()

  const updateBulkSettings = async (settingsGroups: {
    currency?: SettingsUpdatePayload
    preferences?: SettingsUpdatePayload
    notifications?: SettingsUpdatePayload
    security?: SettingsUpdatePayload
  }) => {
    try {
      const allUpdates: SettingsUpdatePayload = {
        ...settingsGroups.currency,
        ...settingsGroups.preferences,
        ...settingsGroups.notifications,
        ...settingsGroups.security,
      }

      await updateSettings(allUpdates)

      toast({
        title: 'Settings saved',
        description: 'All your preferences have been updated successfully.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'Some settings could not be saved. Please try again.',
      })
      throw error
    }
  }

  return {
    updateBulkSettings,
  }
}

/**
 * Hook for settings change tracking
 */
export function useSettingsTracker() {
  const { settings } = useSettings()

  const hasUnsavedChanges = (currentValues: Partial<SettingsUpdatePayload>): boolean => {
    if (!settings) return false

    return Object.keys(currentValues).some(key => {
      const settingsKey = key as keyof SettingsUpdatePayload
      return settings[settingsKey] !== currentValues[settingsKey]
    })
  }

  const getChangedFields = (currentValues: Partial<SettingsUpdatePayload>): string[] => {
    if (!settings) return []

    return Object.keys(currentValues).filter(key => {
      const settingsKey = key as keyof SettingsUpdatePayload
      return settings[settingsKey] !== currentValues[settingsKey]
    })
  }

  return {
    settings,
    hasUnsavedChanges,
    getChangedFields,
  }
}
