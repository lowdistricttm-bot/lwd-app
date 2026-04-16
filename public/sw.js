// Service Worker per Low District - Versione v4 (Lock Fix)
const CACHE_NAME = 'low-district-v4';

self.addEventListener('install', (event) => {
  // Forza l'attivazione immediata del nuovo SW
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Eliminazione vecchia cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Prende il controllo immediato di tutte le schede aperte
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Strategia Network First per evitare lock su risorse stale
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});