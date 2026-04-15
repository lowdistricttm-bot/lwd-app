// Service Worker per Low District - Versione v4 (Auto-Update)
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
          // Elimina QUALSIASI vecchia cache
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
  // Strategia Network First per i file dell'app, Cache First per i media
  const url = new URL(event.request.url);
  
  if (url.origin === self.location.origin) {
    // Per i file dell'app (JS, CSS, HTML), prova sempre il network prima
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
  } else {
    // Per risorse esterne (immagini Supabase, etc), usa cache se disponibile
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});