'use client'

import React from 'react'

// Offline-first data storage and synchronization utilities

interface OfflineTransaction {
  id: string
  data: any
  timestamp: number
  action: 'create' | 'update' | 'delete'
  synced: boolean
}

interface OfflineQueueItem {
  id: string
  type: 'transaction' | 'category' | 'budget'
  action: 'create' | 'update' | 'delete'
  data: any
  timestamp: number
  retryCount: number
}

export class OfflineStorageManager {
  private static instance: OfflineStorageManager
  private dbName = 'MonetorOfflineDB'
  private dbVersion = 1
  private db: IDBDatabase | null = null

  private constructor() {}

  static getInstance(): OfflineStorageManager {
    if (!OfflineStorageManager.instance) {
      OfflineStorageManager.instance = new OfflineStorageManager()
    }
    return OfflineStorageManager.instance
  }

  // Initialize IndexedDB
  async initialize(): Promise<boolean> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      console.log('IndexedDB not supported')
      return false
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error)
        reject(false)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log('IndexedDB initialized successfully')
        resolve(true)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains('offlineQueue')) {
          const queueStore = db.createObjectStore('offlineQueue', { keyPath: 'id' })
          queueStore.createIndex('timestamp', 'timestamp', { unique: false })
          queueStore.createIndex('type', 'type', { unique: false })
        }

        if (!db.objectStoreNames.contains('cachedData')) {
          const cacheStore = db.createObjectStore('cachedData', { keyPath: 'id' })
          cacheStore.createIndex('type', 'type', { unique: false })
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        if (!db.objectStoreNames.contains('offlineTransactions')) {
          const transactionStore = db.createObjectStore('offlineTransactions', { keyPath: 'id' })
          transactionStore.createIndex('timestamp', 'timestamp', { unique: false })
          transactionStore.createIndex('synced', 'synced', { unique: false })
        }

        console.log('IndexedDB stores created')
      }
    })
  }

  // Add item to offline queue
  async addToOfflineQueue(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    if (!this.db) await this.initialize()

    const queueItem: OfflineQueueItem = {
      ...item,
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineQueue'], 'readwrite')
      const store = transaction.objectStore('offlineQueue')
      const request = store.add(queueItem)

      request.onsuccess = () => {
        console.log('Added to offline queue:', queueItem)
        resolve()
      }

      request.onerror = () => {
        console.error('Failed to add to offline queue:', request.error)
        reject(request.error)
      }
    })
  }

  // Get all items from offline queue
  async getOfflineQueue(): Promise<OfflineQueueItem[]> {
    if (!this.db) await this.initialize()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineQueue'], 'readonly')
      const store = transaction.objectStore('offlineQueue')
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        console.error('Failed to get offline queue:', request.error)
        reject(request.error)
      }
    })
  }

  // Remove item from offline queue
  async removeFromOfflineQueue(id: string): Promise<void> {
    if (!this.db) await this.initialize()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineQueue'], 'readwrite')
      const store = transaction.objectStore('offlineQueue')
      const request = store.delete(id)

      request.onsuccess = () => {
        console.log('Removed from offline queue:', id)
        resolve()
      }

      request.onerror = () => {
        console.error('Failed to remove from offline queue:', request.error)
        reject(request.error)
      }
    })
  }

  // Cache data for offline access
  async cacheData(type: string, id: string, data: any): Promise<void> {
    if (!this.db) await this.initialize()

    const cacheItem = {
      id: `${type}-${id}`,
      type,
      data,
      timestamp: Date.now(),
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readwrite')
      const store = transaction.objectStore('cachedData')
      const request = store.put(cacheItem)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        console.error('Failed to cache data:', request.error)
        reject(request.error)
      }
    })
  }

  // Get cached data
  async getCachedData(type: string, id?: string): Promise<any[]> {
    if (!this.db) await this.initialize()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readonly')
      const store = transaction.objectStore('cachedData')

      if (id) {
        const request = store.get(`${type}-${id}`)
        request.onsuccess = () => {
          resolve(request.result ? [request.result.data] : [])
        }
        request.onerror = () => reject(request.error)
      } else {
        const index = store.index('type')
        const request = index.getAll(type)
        request.onsuccess = () => {
          const results = request.result || []
          resolve(results.map(item => item.data))
        }
        request.onerror = () => reject(request.error)
      }
    })
  }

  // Store offline transaction
  async storeOfflineTransaction(transaction: Omit<OfflineTransaction, 'id' | 'timestamp'>): Promise<string> {
    if (!this.db) await this.initialize()

    const offlineTransaction: OfflineTransaction = {
      ...transaction,
      id: `offline-tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    }

    return new Promise((resolve, reject) => {
      const dbTransaction = this.db!.transaction(['offlineTransactions'], 'readwrite')
      const store = dbTransaction.objectStore('offlineTransactions')
      const request = store.add(offlineTransaction)

      request.onsuccess = () => {
        console.log('Stored offline transaction:', offlineTransaction)
        resolve(offlineTransaction.id)
      }

      request.onerror = () => {
        console.error('Failed to store offline transaction:', request.error)
        reject(request.error)
      }
    })
  }

  // Get offline transactions
  async getOfflineTransactions(): Promise<OfflineTransaction[]> {
    if (!this.db) await this.initialize()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineTransactions'], 'readonly')
      const store = transaction.objectStore('offlineTransactions')
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        console.error('Failed to get offline transactions:', request.error)
        reject(request.error)
      }
    })
  }

  // Mark offline transaction as synced
  async markTransactionSynced(id: string): Promise<void> {
    if (!this.db) await this.initialize()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineTransactions'], 'readwrite')
      const store = transaction.objectStore('offlineTransactions')
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const offlineTransaction = getRequest.result
        if (offlineTransaction) {
          offlineTransaction.synced = true
          const updateRequest = store.put(offlineTransaction)
          
          updateRequest.onsuccess = () => {
            console.log('Marked transaction as synced:', id)
            resolve()
          }
          
          updateRequest.onerror = () => reject(updateRequest.error)
        } else {
          resolve() // Transaction not found, consider it already synced
        }
      }

      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  // Clean up old cached data
  async cleanupOldCache(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) await this.initialize()

    const cutoffTime = Date.now() - maxAge

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readwrite')
      const store = transaction.objectStore('cachedData')
      const index = store.index('timestamp')
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime))

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          console.log('Cleaned up old cached data')
          resolve()
        }
      }

      request.onerror = () => {
        console.error('Failed to cleanup old cache:', request.error)
        reject(request.error)
      }
    })
  }
}

// React hook for offline storage
export function useOfflineStorage() {
  const [storageManager] = React.useState(() => OfflineStorageManager.getInstance())
  const [isInitialized, setIsInitialized] = React.useState(false)
  const [isOnline, setIsOnline] = React.useState(true)

  React.useEffect(() => {
    if (typeof window === 'undefined') return

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
    storageManager.initialize().then(success => {
      setIsInitialized(success)
    })
  }, [storageManager])

  const addToQueue = React.useCallback((item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retryCount'>) => {
    return storageManager.addToOfflineQueue(item)
  }, [storageManager])

  const cacheData = React.useCallback((type: string, id: string, data: any) => {
    return storageManager.cacheData(type, id, data)
  }, [storageManager])

  const getCachedData = React.useCallback((type: string, id?: string) => {
    return storageManager.getCachedData(type, id)
  }, [storageManager])

  const storeOfflineTransaction = React.useCallback((transaction: Omit<OfflineTransaction, 'id' | 'timestamp'>) => {
    return storageManager.storeOfflineTransaction(transaction)
  }, [storageManager])

  return {
    isInitialized,
    isOnline,
    addToQueue,
    cacheData,
    getCachedData,
    storeOfflineTransaction,
    storageManager,
  }
}

// Network status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(true)
  const [connectionType, setConnectionType] = React.useState<string>('unknown')

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    setIsOnline(navigator.onLine)

    // Get connection info if available
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    if (connection) {
      setConnectionType(connection.effectiveType || connection.type || 'unknown')
      
      connection.addEventListener('change', () => {
        setConnectionType(connection.effectiveType || connection.type || 'unknown')
      })
    }

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return {
    isOnline,
    connectionType,
    isSlowConnection: connectionType === 'slow-2g' || connectionType === '2g',
  }
}

