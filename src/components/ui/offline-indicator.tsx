'use client'

import React from 'react'
import { Wifi, WifiOff, Upload, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNetworkStatus, useOfflineStorage } from '@/lib/utils/offline-storage'
import { useServiceWorker } from '@/lib/utils/service-worker'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// Tooltip components temporarily disabled for build compatibility

interface OfflineIndicatorProps {
  className?: string
  showDetails?: boolean
}

export function OfflineIndicator({ className, showDetails = false }: OfflineIndicatorProps) {
  const { isOnline, connectionType, isSlowConnection } = useNetworkStatus()
  const { isInitialized, storageManager } = useOfflineStorage()
  const { isRegistered } = useServiceWorker()
  const [offlineQueueCount, setOfflineQueueCount] = React.useState(0)
  const [syncInProgress, setSyncInProgress] = React.useState(false)

  // Check offline queue periodically
  React.useEffect(() => {
    if (!isInitialized) return

    const checkOfflineQueue = async () => {
      try {
        const queue = await storageManager.getOfflineQueue()
        setOfflineQueueCount(queue.length)
      } catch (error) {
        console.error('Failed to check offline queue:', error)
      }
    }

    checkOfflineQueue()
    const interval = setInterval(checkOfflineQueue, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [isInitialized, storageManager])

  // Trigger sync when coming online
  React.useEffect(() => {
    if (isOnline && offlineQueueCount > 0 && isRegistered) {
      handleSync()
    }
  }, [isOnline, offlineQueueCount, isRegistered])

  const handleSync = async () => {
    if (!isOnline || syncInProgress) return

    setSyncInProgress(true)
    try {
      // Request background sync
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_OFFLINE_DATA',
        })
      }

      // Wait a bit for sync to potentially complete
      setTimeout(() => {
        setSyncInProgress(false)
      }, 3000)
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncInProgress(false)
    }
  }

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500'
    if (syncInProgress) return 'bg-yellow-500'
    if (isSlowConnection) return 'bg-orange-500'
    if (offlineQueueCount > 0) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getStatusText = () => {
    if (!isOnline) return 'Offline'
    if (syncInProgress) return 'Syncing...'
    if (isSlowConnection) return 'Slow connection'
    if (offlineQueueCount > 0) return `${offlineQueueCount} pending`
    return 'Online'
  }

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />
    if (syncInProgress) return <Upload className="h-4 w-4 animate-spin" />
    if (isSlowConnection) return <AlertTriangle className="h-4 w-4" />
    if (offlineQueueCount > 0) return <Upload className="h-4 w-4" />
    return <Wifi className="h-4 w-4" />
  }

  if (showDetails) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        {/* Status Badge */}
        <Badge
          variant={isOnline ? 'secondary' : 'destructive'}
          className={cn(
            'flex items-center space-x-1 transition-all duration-200',
            getStatusColor().replace('bg-', 'border- bg-opacity-10')
          )}
        >
          {getStatusIcon()}
          <span className="text-xs font-medium">{getStatusText()}</span>
        </Badge>

        {/* Sync Button */}
        {isOnline && offlineQueueCount > 0 && !syncInProgress && (
          <Button size="sm" variant="outline" onClick={handleSync} className="h-6 px-2 text-xs">
            <Upload className="mr-1 h-3 w-3" />
            Sync Now
          </Button>
        )}

        {/* Connection Type */}
        {isOnline && connectionType !== 'unknown' && (
          <span className="text-xs text-muted-foreground">{connectionType.toUpperCase()}</span>
        )}
      </div>
    )
  }

  // Compact indicator
  return (
    <div
      className={cn(
        'flex h-8 w-8 cursor-default items-center justify-center rounded-full transition-all duration-200',
        getStatusColor(),
        'hover:scale-105',
        className
      )}
      title={getStatusText()} // Simple title tooltip instead of complex Tooltip component
    >
      <div className="text-white">{getStatusIcon()}</div>

      {/* Pulse animation for sync */}
      {syncInProgress && (
        <div className="absolute h-8 w-8 animate-ping rounded-full bg-current opacity-20"></div>
      )}

      {/* Queue count badge */}
      {offlineQueueCount > 0 && !syncInProgress && (
        <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
          <span className="text-xs font-bold text-white">
            {offlineQueueCount > 9 ? '9+' : offlineQueueCount}
          </span>
        </div>
      )}
    </div>
  )
}

// Mobile-specific offline banner
export function MobileOfflineBanner() {
  const { isOnline } = useNetworkStatus()
  const [isDismissed, setIsDismissed] = React.useState(false)

  // Auto-show when going offline, hide when online
  React.useEffect(() => {
    if (isOnline) {
      setIsDismissed(false)
    }
  }, [isOnline])

  if (isOnline || isDismissed) return null

  return (
    <div className="fixed left-0 right-0 top-0 z-50 lg:hidden">
      <div className="flex items-center justify-between bg-amber-500 p-3 text-white shadow-lg">
        <div className="flex items-center space-x-2">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">
            You're offline. Limited functionality available.
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-white hover:bg-white/20"
          onClick={() => setIsDismissed(true)}
        >
          ×
        </Button>
      </div>
    </div>
  )
}

// Connection quality indicator
export function ConnectionQualityIndicator({ className }: { className?: string }) {
  const { isOnline, connectionType } = useNetworkStatus()

  if (!isOnline) return null

  const getConnectionBars = () => {
    switch (connectionType) {
      case 'slow-2g':
        return 1
      case '2g':
        return 2
      case '3g':
        return 3
      case '4g':
      case 'fast':
        return 4
      default:
        return 3
    }
  }

  const bars = getConnectionBars()

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'w-1 bg-current transition-opacity duration-200',
            i < bars ? 'opacity-100' : 'opacity-30',
            i === 0 && 'h-2',
            i === 1 && 'h-3',
            i === 2 && 'h-4',
            i === 3 && 'h-5'
          )}
        />
      ))}
    </div>
  )
}
