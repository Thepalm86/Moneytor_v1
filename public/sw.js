// Moneytor V2 Service Worker - Mobile Performance & Offline Support
const CACHE_NAME = 'moneytor-v2-cache-v1.0.0'
const RUNTIME_CACHE = 'moneytor-runtime'
const OFFLINE_URL = '/offline'

// Core app shell files to cache
const CORE_CACHE_FILES = [
  '/',
  '/dashboard',
  '/transactions', 
  '/analytics',
  '/offline',
  '/manifest.json',
  // Add CSS and JS bundles (Next.js will handle these dynamically)
]

// API endpoints to cache with different strategies
const API_CACHE_PATTERNS = [
  { pattern: /^\/api\/transactions/, strategy: 'networkFirst', maxAge: 5 * 60 * 1000 }, // 5 minutes
  { pattern: /^\/api\/categories/, strategy: 'staleWhileRevalidate', maxAge: 30 * 60 * 1000 }, // 30 minutes
  { pattern: /^\/api\/stats/, strategy: 'networkFirst', maxAge: 2 * 60 * 1000 }, // 2 minutes
]

// Static assets to cache
const STATIC_CACHE_PATTERNS = [
  /\.(js|css|woff2?|png|jpg|jpeg|svg|ico)$/,
  /^\/_next\/static\//,
]

// Install event - cache core files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      
      try {
        await cache.addAll(CORE_CACHE_FILES)
        console.log('[SW] Core files cached successfully')
      } catch (error) {
        console.error('[SW] Failed to cache core files:', error)
        // Cache files individually to avoid failing the entire installation
        for (const file of CORE_CACHE_FILES) {
          try {
            await cache.add(file)
          } catch (err) {
            console.warn(`[SW] Failed to cache ${file}:`, err)
          }
        }
      }
      
      // Force activation of new service worker
      self.skipWaiting()
    })()
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames
          .filter(cacheName => 
            cacheName.startsWith('moneytor-') && 
            cacheName !== CACHE_NAME && 
            cacheName !== RUNTIME_CACHE
          )
          .map(cacheName => {
            console.log(`[SW] Deleting old cache: ${cacheName}`)
            return caches.delete(cacheName)
          })
      )
      
      // Take control of all clients
      await clients.claim()
      console.log('[SW] Service worker activated')
    })()
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip cross-origin requests (except for our API)
  if (url.origin !== location.origin && !url.pathname.startsWith('/api/')) {
    return
  }
  
  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
  } else if (STATIC_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(handleStaticRequest(request))
  } else if (url.pathname.startsWith('/_next/')) {
    event.respondWith(handleNextJsRequest(request))
  } else {
    event.respondWith(handleNavigationRequest(request))
  }
})

// Handle API requests with different caching strategies
async function handleApiRequest(request) {
  const url = new URL(request.url)
  
  // Find matching API cache pattern
  const cachePattern = API_CACHE_PATTERNS.find(pattern => 
    pattern.pattern.test(url.pathname)
  )
  
  if (!cachePattern) {
    // Default: network first for API requests
    return networkFirst(request, RUNTIME_CACHE)
  }
  
  switch (cachePattern.strategy) {
    case 'networkFirst':
      return networkFirst(request, RUNTIME_CACHE, cachePattern.maxAge)
    case 'staleWhileRevalidate':
      return staleWhileRevalidate(request, RUNTIME_CACHE, cachePattern.maxAge)
    case 'cacheFirst':
      return cacheFirst(request, RUNTIME_CACHE, cachePattern.maxAge)
    default:
      return networkFirst(request, RUNTIME_CACHE)
  }
}

// Handle static asset requests
async function handleStaticRequest(request) {
  return cacheFirst(request, CACHE_NAME)
}

// Handle Next.js specific requests
async function handleNextJsRequest(request) {
  return staleWhileRevalidate(request, RUNTIME_CACHE)
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Ultimate fallback to offline page
    return caches.match(OFFLINE_URL)
  }
}

// Caching strategy: Network First
async function networkFirst(request, cacheName, maxAge = 5 * 60 * 1000) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      const responseToCache = networkResponse.clone()
      
      // Add timestamp for cache expiry
      const headers = new Headers(responseToCache.headers)
      headers.set('sw-cache-timestamp', Date.now().toString())
      
      cache.put(request, new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      }))
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error)
    
    const cachedResponse = await caches.match(request)
    if (cachedResponse && !isCacheExpired(cachedResponse, maxAge)) {
      return cachedResponse
    }
    
    throw error
  }
}

// Caching strategy: Cache First
async function cacheFirst(request, cacheName, maxAge = 24 * 60 * 60 * 1000) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse && !isCacheExpired(cachedResponse, maxAge)) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      const headers = new Headers(networkResponse.headers)
      headers.set('sw-cache-timestamp', Date.now().toString())
      
      cache.put(request, new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: headers
      }))
    }
    
    return networkResponse
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse
    }
    throw error
  }
}

// Caching strategy: Stale While Revalidate
async function staleWhileRevalidate(request, cacheName, maxAge = 30 * 60 * 1000) {
  const cachedResponse = await caches.match(request)
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      const cache = caches.open(cacheName).then(cache => {
        const headers = new Headers(networkResponse.headers)
        headers.set('sw-cache-timestamp', Date.now().toString())
        
        return cache.put(request, new Response(networkResponse.body, {
          status: networkResponse.status,
          statusText: networkResponse.statusText,
          headers: headers
        }))
      })
    }
    return networkResponse
  }).catch(error => {
    console.log('[SW] Background fetch failed:', error)
    return null
  })
  
  // Return cached version immediately if available
  if (cachedResponse && !isCacheExpired(cachedResponse, maxAge)) {
    // Trigger background update
    fetchPromise
    return cachedResponse
  }
  
  // Wait for network if cache is stale or missing
  try {
    return await fetchPromise
  } catch (error) {
    return cachedResponse || Promise.reject(error)
  }
}

// Check if cached response is expired
function isCacheExpired(response, maxAge) {
  const timestamp = response.headers.get('sw-cache-timestamp')
  if (!timestamp) return false
  
  const cacheTime = parseInt(timestamp, 10)
  const now = Date.now()
  
  return (now - cacheTime) > maxAge
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag)
  
  if (event.tag === 'background-transaction-sync') {
    event.waitUntil(syncOfflineTransactions())
  }
})

// Sync offline transactions when back online
async function syncOfflineTransactions() {
  try {
    // Get offline transactions from IndexedDB
    const offlineTransactions = await getOfflineTransactions()
    
    if (offlineTransactions.length === 0) {
      console.log('[SW] No offline transactions to sync')
      return
    }
    
    console.log(`[SW] Syncing ${offlineTransactions.length} offline transactions`)
    
    // Sync each transaction
    for (const transaction of offlineTransactions) {
      try {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transaction.data)
        })
        
        if (response.ok) {
          // Remove from offline storage
          await removeOfflineTransaction(transaction.id)
          console.log(`[SW] Synced offline transaction: ${transaction.id}`)
        }
      } catch (error) {
        console.error(`[SW] Failed to sync transaction ${transaction.id}:`, error)
      }
    }
    
    // Notify client about sync completion
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_COMPLETE',
        payload: { syncedCount: offlineTransactions.length }
      })
    })
    
  } catch (error) {
    console.error('[SW] Background sync failed:', error)
  }
}

// IndexedDB helpers (simplified - you might want to use a library)
async function getOfflineTransactions() {
  // Implementation would use IndexedDB to get offline transactions
  return []
}

async function removeOfflineTransaction(id) {
  // Implementation would remove transaction from IndexedDB
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: 'You have new financial activity to review',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/action-view-icon.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/action-close-icon.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Moneytor Update', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  }
})

// Message handling for client communication
self.addEventListener('message', (event) => {
  const { type, payload } = event.data
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
    case 'GET_CACHE_NAMES':
      event.ports[0].postMessage({
        type: 'CACHE_NAMES',
        payload: [CACHE_NAME, RUNTIME_CACHE]
      })
      break
    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.delete(payload.cacheName).then(success => {
          event.ports[0].postMessage({
            type: 'CACHE_CLEARED',
            payload: { success, cacheName: payload.cacheName }
          })
        })
      )
      break
  }
})