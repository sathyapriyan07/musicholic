const CACHE_NAME = 'musicholic-v1'
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/favicon.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

function safeCachePut(cache, request, response) {
  if (response.ok) {
    cache.put(request, response)
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return

  // API requests - network only, don't cache
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(fetch(request))
    return
  }

  // Images - cache first, fallback to network
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached ||
        fetch(request).then((response) => {
          const r = response.clone()
          caches.open(CACHE_NAME).then((cache) => safeCachePut(cache, request, r))
          return response
        })
      )
    )
    return
  }

  // Navigation - network first
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const r = response.clone()
          caches.open(CACHE_NAME).then((cache) => safeCachePut(cache, request, r))
          return response
        })
        .catch(() => caches.match('/'))
    )
    return
  }

  // Everything else - network first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        const r = response.clone()
        caches.open(CACHE_NAME).then((cache) => safeCachePut(cache, request, r))
        return response
      })
      .catch(() => caches.match(request))
  )
})
