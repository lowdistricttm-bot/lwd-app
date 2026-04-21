// Service Worker per Low District - Versione v6 (API Exclusion & Lock Fix)
const CACHE_NAME = 'low-district-v6';
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

  // 1. ESCLUSIONE API: Non intercettare mai le chiamate a Supabase o altri endpoint API
  // Questo previene l'errore "Lock broken by another request with the 'steal' option"
  if (url.host.includes('supabase.co') || url.pathname.includes('/wp-json/')) {
    return; // Lascia che la richiesta vada direttamente al network senza passare dal SW
  }

  // 2. Strategia Stale-While-Revalidate per Cloudinary (Media)
  if (url.host === 'res.cloudinary.com') {
    event.respondWith(
      caches.open(MEDIA_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Fallback silenzioso
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 3. Strategia Network First per le navigazioni
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // 4. Strategia Cache First per gli asset statici locali (JS, CSS, Immagini locali)
  // Intercettiamo solo file statici per evitare di bloccare richieste dinamiche
  const isStaticAsset = /\.(js|css|png|jpg|jpeg|svg|woff2|json)$/.test(url.pathname);
  
  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});