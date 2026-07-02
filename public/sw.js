const CACHE_NAME = 'techbuddy-assets-v2';
const DYNAMIC_CACHE_NAME = 'techbuddy-dynamic-v2';

// Assets to pre-cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
];

// Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching core assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== DYNAMIC_CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper to determine if a request is an RSS reader proxy fetch
function isRssApiRequest(url) {
  return url.includes('api.rss2json.com') ||
         url.includes('api.allorigins.win') ||
         url.includes('api.codetabs.com');
}

// Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip tracking non-GET requests (Firebase Auth and Firestore sometimes use POST/PATCH)
  if (request.method !== 'GET') {
    return;
  }

  // Strategy 1: Network-First for RSS feeds and proxies (with offline cache fallback)
  if (isRssApiRequest(request.url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Check if response is valid before caching
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          console.log('[Service Worker] Feed offline fallback for:', request.url);
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return empty list or fallback response matching rss2json schema if completely uncached
            if (url.includes('api.rss2json.com')) {
              return new Response(JSON.stringify({ status: 'ok', items: [] }), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
            return new Response('offline', { status: 503, statusText: 'Offline' });
          });
        })
    );
    return;
  }

  // Strategy 2: Network-First for HTML navigation requests to prevent stale chunk 404s
  if (request.mode === 'navigate' || request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Strategy 3: Stale-While-Revalidate for application assets (Same-origin bundle JS and CSS files)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Silence network errors when completely offline
          });

        return cachedResponse || fetchPromise;
      })
    );
  }
});

