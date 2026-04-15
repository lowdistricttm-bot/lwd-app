// Service Worker per Low District - Versione v3 (Force Refresh)
const CACHE_NAME = 'low-district-v3';

self.addEventListener('install', (event) => {
  // Forza l'attivazione immediata del nuovo SW
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Elimina QUALSIASI vecchia cache che non sia la v3
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminazione vecchia cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Prende il controllo immediato di tutte le schede aperte
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Strategia Network First: prova sempre a scaricare l'ultima versione
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});