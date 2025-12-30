// Service Worker for SleepCycle PWA
// Strategy: Stale-While-Revalidate

const CACHE_NAME = 'sleep-cycle-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/image.svg',
  '/android/android-launchericon-192-192.png',
  '/android/android-launchericon-512-512.png',
  '/android/android-launchericon-96-96.png'
];

// Install event - cache all initial resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Stale-While-Revalidate strategy
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        // Fetch from network in background
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Only cache successful responses
            if (networkResponse && networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Network failed, return cached response if available
            return cachedResponse;
          });

        // Return cached response immediately, or wait for network
        return cachedResponse || fetchPromise;
      });
    })
  );
});

// Background Sync event
self.addEventListener('sync', event => {
  if (event.tag === 'sync-sleep-history') {
    event.waitUntil(syncSleepHistory());
  }
});

// Sync sleep history data
async function syncSleepHistory() {
  try {
    // Get pending data from IndexedDB (when backend is implemented)
    console.log('[SW] Syncing sleep history...');
    // For now, just log - actual sync will be implemented with backend
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Sync failed:', error);
    throw error;
  }
}

// Push notification event
self.addEventListener('push', event => {
  let data = { title: 'SleepCycle', body: 'Hora de dormir!' };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.error('[SW] Error parsing push data:', e);
  }

  const options = {
    body: data.body,
    icon: '/android/android-launchericon-192-192.png',
    badge: '/android/android-launchericon-96-96.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Fechar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // If a window client is already open, focus it
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
