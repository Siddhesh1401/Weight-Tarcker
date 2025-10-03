// Service Worker for Weight Tracker PWA
const CACHE_NAME = 'weight-tracker-v1';
const STATIC_CACHE = 'weight-tracker-static-v1';

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

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
      .catch(() => {
        // Return offline page if available
        return caches.match('/index.html');
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Weight Tracker Reminder';
  const options = {
    body: data.body || 'Don\'t forget to log your progress!',
    icon: '/icon-192.png',
    badge: '/favicon.svg',
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
