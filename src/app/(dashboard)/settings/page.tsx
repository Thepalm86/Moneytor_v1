'use client'

/**
 * Settings Page Route
 * Main settings page for user preferences and configuration
 */

import { SettingsPage } from '@/components/settings'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/layout/loading-spinner'

export default function Settings() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <SettingsPage />
    </Suspense>
  )
}