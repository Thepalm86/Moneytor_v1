// ==================================================
// DASHBOARD CELEBRATIONS COMPONENT
// Handles celebration management within dashboard context
// ==================================================

'use client'

import React from 'react'
import { CelebrationManager } from '@/components/gamification/celebration-modal'
import { useGamification } from '@/contexts/gamification-context'

export function DashboardCelebrations() {
  const { pendingCelebrations, dismissCelebration } = useGamification()

  return (
    <CelebrationManager
      celebrations={pendingCelebrations}
      onDismiss={dismissCelebration}
    />
  )
}