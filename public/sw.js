// Service Worker per Low District - Versione v4 (Aggiornamento Forzato)
const CACHE_NAME = 'low-district-v4';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Strategia Network First per tutte le richieste API e navigazione
  if (event.request.mode === 'navigate' || event.request.url.includes('/wp-json/') || event.request.url.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Per gli asset statici (immagini, stili), usiamo Cache First
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Non cacheare le risposte di Supabase o API qui
          if (!event.request.url.includes('supabase.co') && !event.request.url.includes('/wp-json/')) {
            cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    })
  );
});