// Service Worker for Weight Tracker PWA
const CACHE_VERSION = 'v2'; // Increment this when you want to force cache refresh
const CACHE_NAME = `weight-tracker-${CACHE_VERSION}`;
const STATIC_CACHE = `weight-tracker-static-${CACHE_VERSION}`;

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - Network first for HTML, cache first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // For HTML files and API calls, always use network first
  if (request.method === 'GET' && 
      (request.headers.get('accept')?.includes('text/html') || 
       url.pathname.startsWith('/api/'))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache the response
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request).then((response) => {
            return response || caches.match('/index.html');
          });
        })
    );
  } else {
    // For other assets (JS, CSS, images), use cache first
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request).then((fetchResponse) => {
            // Cache new assets
            const responseClone = fetchResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
            return fetchResponse;
          });
        })
        .catch(() => {
          // Return offline page if available
          return caches.match('/index.html');
        })
    );
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: event.data.text() };
    }
  }
  
  const title = data.title || 'Weight Tracker Reminder';
  const options = {
    body: data.body || 'Don\'t forget to log your progress!',
    icon: data.icon || '/favicon.svg',
    badge: data.badge || '/favicon.svg',
    vibrate: [200, 100, 200],
    tag: data.tag || 'reminder',
    requireInteraction: false,
    actions: data.actions || [
      {
        action: 'open',
        title: 'Open App',
        icon: '/favicon.svg'
      },
      {
        action: 'close',
        title: 'Dismiss',
        icon: '/favicon.svg'
      }
    ],
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync event (for offline data sync)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-logs') {
    event.waitUntil(syncLogs());
  }
});

// Helper function to sync offline logs
async function syncLogs() {
  try {
    // Get offline logs from IndexedDB or cache
    // Send to backend when online
    console.log('[SW] Syncing offline logs...');
    // Implementation would go here
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Sync failed:', error);
    return Promise.reject(error);
  }
}

// Periodic background sync (experimental)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'daily-reminder') {
    event.waitUntil(sendDailyReminder());
  }
});

async function sendDailyReminder() {
  const permission = await self.registration.permissions?.query({ name: 'notifications' });
  
  if (permission?.state === 'granted') {
    return self.registration.showNotification('Daily Check-in', {
      body: 'Time to log your weight and meals!',
      icon: '/icon-192.png',
      badge: '/favicon.svg',
      tag: 'daily-reminder'
    });
  }
}
