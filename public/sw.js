/**
 * Mwijay Tech Service Worker
 * Implements offline-first caching with background sync.
 */

'use strict'

const CACHE_VERSION = 'mwijay-v1.0.0'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const PAGE_CACHE = `${CACHE_VERSION}-pages`

const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
]

const NETWORK_ONLY_PATTERNS = [
  /\/api\//,
  /firestore\.googleapis\.com/,
  /identitytoolkit\.googleapis\.com/,
  /securetoken\.googleapis\.com/,
  /elevenlabs\.io/,
  /openrouter\.ai/,
  /api\.groq\.com/,
  /huggingface\.co\/api/,
  /cloudinary\.com/,
  /spline\.design/,
  /js\.puter\.com/,
]

function shouldCache(url) {
  const urlStr = typeof url === 'string' ? url : url.href
  return !NETWORK_ONLY_PATTERNS.some(pattern => pattern.test(urlStr))
}

self.addEventListener('install', (event) => {
  console.log('[SW] Installing Mwijay Tech service worker...')

  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(PRECACHE_ASSETS).catch(err => {
        console.warn('[SW] Pre-cache partial failure:', err)
      })
    }).then(() => {
      console.log('[SW] Pre-cache complete')
      return self.skipWaiting()
    })
  )
})

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Mwijay Tech service worker...')

  event.waitUntil(
    Promise.all([
      caches.keys().then(keys =>
        Promise.all(
          keys
            .filter(key => key !== STATIC_CACHE && key !== PAGE_CACHE)
            .map(key => {
              console.log('[SW] Deleting old cache:', key)
              return caches.delete(key)
            })
        )
      ),
      clients.claim(),
    ]).then(() => {
      console.log('[SW] Activation complete')
    })
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return
  if (!request.url.startsWith('http')) return

  if (!shouldCache(request.url)) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Offline', offline: true }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      })
    )
    return
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithOfflineFallback(request))
    return
  }

  event.respondWith(networkFirst(request, PAGE_CACHE))
})

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  if (cached) {
    fetch(request)
      .then(response => {
        if (response.ok) cache.put(request, response.clone())
      })
      .catch(() => {})

    return cached
  }

  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return cached || new Response('Asset not available offline', { status: 503 })
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)

  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await cache.match(request)
    return cached || new Response('Not available offline', { status: 503 })
  }
}

async function networkFirstWithOfflineFallback(request) {
  const cache = await caches.open(PAGE_CACHE)

  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached

    const rootCached = await cache.match('/')
    if (rootCached) return rootCached

    const offlinePage = await caches.match('/offline.html')
    return (
      offlinePage ||
      new Response(
        '<h1>Offline</h1><p>Mwijay Tech is offline. Please reconnect.</p>',
        { headers: { 'Content-Type': 'text/html' } }
      )
    )
  }
}

function isStaticAsset(url) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg',
    '.webp', '.svg', '.ico', '.woff', '.woff2',
    '.ttf', '.json',
  ]
  return (
    staticExtensions.some(ext => url.pathname.endsWith(ext)) ||
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/favicon.ico'
  )
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'mwijay-sync-queue') {
    event.waitUntil(replaySync())
  }
})

async function replaySync() {
  const allClients = await clients.matchAll({ type: 'window' })
  if (allClients.length > 0) {
    allClients.forEach(client => {
      client.postMessage({ type: 'REPLAY_SYNC_QUEUE' })
    })
  }
}

self.addEventListener('message', (event) => {
  switch (event.data?.type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break

    case 'GET_VERSION':
      event.source?.postMessage({
        type: 'SW_VERSION',
        version: CACHE_VERSION,
      })
      break

    case 'CLEAR_CACHE':
      caches
        .keys()
        .then(keys => Promise.all(keys.map(k => caches.delete(k))))
        .then(() => {
          event.source?.postMessage({ type: 'CACHE_CLEARED' })
        })
      break

    default:
      break
  }
})

console.log('[SW] Mwijay Tech service worker loaded — Tanzania 🇹🇿')
