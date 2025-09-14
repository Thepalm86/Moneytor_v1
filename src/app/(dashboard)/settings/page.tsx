'use client'

/**
 * Settings Page Route - Migrated to Redesigned Version
 * Uses feature flags for gradual rollout
 */

import { SettingsPageWrapper } from '@/components/settings/settings-page-wrapper'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/layout/loading-spinner'

export default function Settings() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <SettingsPageWrapper />
    </Suspense>
  )
}
