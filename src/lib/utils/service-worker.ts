'use client'

import React from 'react'

// Service Worker registration and management utilities

export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager
  private registration: ServiceWorkerRegistration | null = null
  private updateAvailable = false
  private callbacks: { [key: string]: Function[] } = {}

  private constructor() {}

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager()
    }
    return ServiceWorkerManager.instance
  }

  // Register service worker
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('Service Workers not supported')
      return null
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      this.registration = registration

      console.log('SW registered successfully:', registration)

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.updateAvailable = true
            this.emit('updateAvailable', registration)
          }
        })
      })

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', event => {
        this.handleServiceWorkerMessage(event)
      })

      // Listen for controller change (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        this.emit('controllerChange')
        window.location.reload()
      })

      return registration
    } catch (error) {
      console.error('SW registration failed:', error)
      return null
    }
  }

  // Unregister service worker
  async unregister(): Promise<boolean> {
    if (!this.registration) return false

    try {
      const result = await this.registration.unregister()
      console.log('SW unregistered:', result)
      return result
    } catch (error) {
      console.error('SW unregistration failed:', error)
      return false
    }
  }

  // Update service worker
  async update(): Promise<void> {
    if (!this.registration) return

    try {
      await this.registration.update()
      console.log('SW update triggered')
    } catch (error) {
      console.error('SW update failed:', error)
    }
  }

  // Activate waiting service worker
  async activateUpdate(): Promise<void> {
    if (!this.registration?.waiting) return

    // Tell the waiting SW to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }

  // Check if update is available
  isUpdateAvailable(): boolean {
    return this.updateAvailable
  }

  // Get cache information
  async getCacheInfo(): Promise<{ names: string[]; sizes: { [key: string]: number } }> {
    if (!this.registration?.active) {
      return { names: [], sizes: {} }
    }

    return new Promise(resolve => {
      const messageChannel = new MessageChannel()

      messageChannel.port1.addEventListener('message', event => {
        if (event.data.type === 'CACHE_NAMES') {
          resolve({
            names: event.data.payload,
            sizes: {}, // Would need additional implementation to get sizes
          })
        }
      })

      this.registration!.active!.postMessage({ type: 'GET_CACHE_NAMES' }, [messageChannel.port2])
    })
  }

  // Clear specific cache
  async clearCache(cacheName: string): Promise<boolean> {
    if (!this.registration?.active) return false

    return new Promise(resolve => {
      const messageChannel = new MessageChannel()

      messageChannel.port1.addEventListener('message', event => {
        if (event.data.type === 'CACHE_CLEARED') {
          resolve(event.data.payload.success)
        }
      })

      this.registration!.active!.postMessage({ type: 'CLEAR_CACHE', payload: { cacheName } }, [
        messageChannel.port2,
      ])
    })
  }

  // Request background sync
  async requestBackgroundSync(tag: string): Promise<void> {
    if (!this.registration || !('sync' in this.registration)) {
      console.log('Background Sync not supported')
      return
    }

    try {
      await (this.registration as any).sync.register(tag)
      console.log(`Background sync registered: ${tag}`)
    } catch (error) {
      console.error('Background sync registration failed:', error)
    }
  }

  // Handle messages from service worker
  private handleServiceWorkerMessage(event: MessageEvent) {
    const { type, payload } = event.data

    switch (type) {
      case 'BACKGROUND_SYNC_COMPLETE':
        this.emit('backgroundSyncComplete', payload)
        break
      case 'CACHE_UPDATE':
        this.emit('cacheUpdate', payload)
        break
      default:
        console.log('Unknown SW message:', event.data)
    }
  }

  // Event emitter methods
  on(event: string, callback: Function) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = []
    }
    this.callbacks[event].push(callback)
  }

  off(event: string, callback: Function) {
    if (!this.callbacks[event]) return

    const index = this.callbacks[event].indexOf(callback)
    if (index > -1) {
      this.callbacks[event].splice(index, 1)
    }
  }

  private emit(event: string, data?: any) {
    if (!this.callbacks[event]) return

    this.callbacks[event].forEach(callback => callback(data))
  }
}

// React hook for service worker management
export function useServiceWorker() {
  const [swManager] = React.useState(() => ServiceWorkerManager.getInstance())
  const [isSupported, setIsSupported] = React.useState(false)
  const [isRegistered, setIsRegistered] = React.useState(false)
  const [updateAvailable, setUpdateAvailable] = React.useState(false)
  const [isOnline, setIsOnline] = React.useState(true)

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    setIsSupported('serviceWorker' in navigator)
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  React.useEffect(() => {
    if (!isSupported) return

    // Register service worker
    swManager.register().then(registration => {
      setIsRegistered(!!registration)
    })

    // Listen for updates
    const handleUpdateAvailable = () => setUpdateAvailable(true)
    const handleControllerChange = () => setUpdateAvailable(false)

    swManager.on('updateAvailable', handleUpdateAvailable)
    swManager.on('controllerChange', handleControllerChange)

    return () => {
      swManager.off('updateAvailable', handleUpdateAvailable)
      swManager.off('controllerChange', handleControllerChange)
    }
  }, [isSupported, swManager])

  const activateUpdate = React.useCallback(() => {
    swManager.activateUpdate()
  }, [swManager])

  const requestBackgroundSync = React.useCallback(
    (tag: string) => {
      return swManager.requestBackgroundSync(tag)
    },
    [swManager]
  )

  return {
    isSupported,
    isRegistered,
    updateAvailable,
    isOnline,
    activateUpdate,
    requestBackgroundSync,
    swManager,
  }
}

// Utility to check if app is running as PWA
export function isPWA(): boolean {
  if (typeof window === 'undefined') return false

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  )
}

// Utility to show install prompt
export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = React.useState<Event | null>(null)
  const [isInstalled, setIsInstalled] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    setIsInstalled(isPWA())

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const showInstallPrompt = React.useCallback(async () => {
    if (!installPrompt) return false

    const promptEvent = installPrompt as any
    promptEvent.prompt()

    const result = await promptEvent.userChoice
    setInstallPrompt(null)

    return result.outcome === 'accepted'
  }, [installPrompt])

  return {
    canInstall: !!installPrompt && !isInstalled,
    isInstalled,
    showInstallPrompt,
  }
}
