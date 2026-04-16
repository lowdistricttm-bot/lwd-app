// Service Worker per Low District - Versione v5 (Cloudinary SWR Optimization)
const CACHE_NAME = 'low-district-v5';
const MEDIA_CACHE = 'low-district-media-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== MEDIA_CACHE) {
            console.log('[SW] Eliminazione vecchia cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strategia Stale-While-Revalidate per Cloudinary
  if (url.host === 'res.cloudinary.com') {
    event.respondWith(
      caches.open(MEDIA_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            // Aggiorna la cache con la nuova risposta dal network
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Fallback silenzioso se il network fallisce
          });

          // Restituisce la versione in cache se esiste, altrimenti aspetta il network
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Strategia Network First per le navigazioni (per evitare lock su risorse stale)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Strategia Cache First per gli altri asset statici locali
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});