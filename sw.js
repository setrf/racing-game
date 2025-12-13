// Service Worker for Highway Racer PWA
const CACHE_NAME = 'highway-racer-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/utils.js',
  '/js/audio.js',
  '/js/visual-effects.js',
  '/js/graphics.js',
  '/js/powerups.js',
  '/js/player.js',
  '/js/obstacles.js',
  '/js/game.js',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('All resources cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache resources:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          (response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone response for caching
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                console.log('Caching new resource:', event.request.url);
                cache.put(event.request, responseToCache);
              })
              .catch((error) => {
                console.error('Failed to cache resource:', error);
              });

            return response;
          }
        ).catch((error) => {
          console.error('Network request failed:', error);

          // If it's an HTML request, serve the offline page
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }

          // For other requests, just fail
          throw error;
        });
      })
  );
});

// Background sync for high scores (future feature)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-high-scores') {
    event.waitUntil(syncHighScores());
  }
});

// Handle push notifications (future feature)
self.addEventListener('push', (event) => {
  const options = {
    body: 'New challenge available in Highway Racer!',
    icon: '/data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiByeD0iMjQiIGZpbGw9IiMxYTFhMmUiLz4KPHBhdGggZD0iTTE2MCAxNkgyOEMyNS4wNjEzIDE2IDEyIDI5LjA2MTMgMTIgNDRWMTQ4QzEyIDE2Mi45MzkgMjUuMDYxMyAxNzYgNDAgMTc2SDE2MEMxNzQuOTM5IDE3NiAxODggMTYyLjkzOSAxODggMTQ4VjQ0Qzg4IDI5LjA2MTMgMTc0LjkzOSAxNiAxNjAgMTZaIiBmaWxsPSIjMzMzMzMzIi8+CjxwYXRoIGQ9Ik00MCA3MkwxNTIgNzJWMTIwTDQwIDEyMFY3MloiIGZpbGw9IiM0ZDc5ZmYiLz4KPGNpcmNsZSBjeD0iODAiIGN5PSI5NiIgcj0iOCIgZmlsbD0iI2ZmZmY5OSIvPgo8Y2lyY2xlIGN4PSIxMTIiIGN5PSI5NiIgcj0iOCIgZmlsbD0iI2ZmZmY5OSIvPgo8cGF0aCBkPSJNNzYgODRIMTE2VjEwOEg3NlY4NFoiIGZpbGw9IiMzMzMzMzMiLz4KPC9zdmc+',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification('Highway Racer', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

// Function to sync high scores (placeholder for future leaderboard feature)
function syncHighScores() {
  return new Promise((resolve) => {
    // TODO: Implement high score synchronization with server
    console.log('Syncing high scores...');

    // For now, just resolve immediately
    setTimeout(resolve, 1000);
  });
}