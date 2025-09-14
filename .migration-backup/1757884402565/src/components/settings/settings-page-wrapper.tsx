'use client'

/**
 * Settings Page Wrapper - Feature Flag Migration Controller
 * Safely switches between old and new settings implementations
 */

import { useUser } from '@/hooks/use-user'
import { useFeatureFlags, logFeatureFlags } from '@/lib/feature-flags'
import { SettingsPage } from '@/components/settings'
import SettingsPageRedesigned from '@/components/settings/redesigned/settings-page-redesigned'
import { useEffect } from 'react'
import type { SettingsCategory } from '@/types/settings'

interface SettingsPageWrapperProps {
  initialSection?: SettingsCategory
  className?: string
}

export function SettingsPageWrapper({ 
  initialSection = 'currency',
  className 
}: SettingsPageWrapperProps) {
  const { user } = useUser()
  const flags = useFeatureFlags(user?.id, user?.user_metadata?.groups || [])

  // Log feature flags in development
  useEffect(() => {
    logFeatureFlags(user?.id, user?.user_metadata?.groups || [])
  }, [user?.id, user?.user_metadata?.groups])

  // Use redesigned settings if feature flag is enabled
  if (flags.SETTINGS_REDESIGN) {
    return (
      <SettingsPageRedesigned 
        initialSection={initialSection}
        className={className}
      />
    )
  }

  // Fallback to original settings implementation
  return <SettingsPage />
}

export default SettingsPageWrapper