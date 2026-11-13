// YTC Campus Navigator - Service Worker
// Version: 1.0.1
const CACHE_NAME = 'ytc-navigator-v2';

// Install Event - Precache App Shell
self.addEventListener('install', (event) => {
  const scope = self.registration.scope;
  const base = scope.endsWith('/') ? scope : `${scope}/`;
  const STATIC_ASSETS = [
    base,
    `${base}index.html`,
    `${base}manifest.webmanifest`,
    `${base}icons/ytc-logo.svg`,
    `${base}floor-plans/eng-floor-2.svg`,
    `${base}floor-plans/admin-floor-0.svg`
  ];

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching App Shell and Offline Assets at:', base);
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean Up Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-While-Revalidate for Assets, Network-First for API
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API Requests: Network-First with cache fallback
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response(
            JSON.stringify({ offline: true, message: 'Campus Navigator Offline Mode' }),
            { headers: { 'Content-Type': 'application/json' }, status: 200 }
          );
        })
    );
    return;
  }

  // Handle Static Assets & Navigation: Cache-First with Network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
          }
        }).catch(() => { /* ignore background update errors */ });

        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          return networkResponse;
        })
        .catch(async () => {
          if (request.mode === 'navigate') {
            const scope = self.registration.scope;
            const index = await caches.match(`${scope}index.html`) || await caches.match(scope);
            if (index) return index;
          }
          return new Response('Offline - YTC Campus Navigator', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        });
    })
  );
});
