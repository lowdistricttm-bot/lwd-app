// Service Worker per Low District - Versione v15
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAO695SEU4tcw1Cfy7zRakQ55K14tMG5jg",
  authDomain: "my-project-23-46087.firebaseapp.com",
  projectId: "my-project-23-46087",
  storageBucket: "my-project-23-46087.firebasestorage.app",
  messagingSenderId: "273028606272",
  appId: "1:273028606272:web:c6d476ba2b97e7f22bb2a5"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Gestione messaggi in background
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Notifica ricevuta:', payload);
  
  // Estraiamo i dati dal blocco 'data' (inviato dalla Edge Function)
  const data = payload.data || {};
  const notificationTitle = data.title || 'Low District';
  const notificationOptions = {
    body: data.body || 'Nuova attività nel Distretto',
    icon: '/icon-only.png',
    badge: '/icon-only.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gestione del click sulla notifica
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Recuperiamo l'URL dai dati della notifica
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Se c'è già una finestra aperta dell'app, mettila in focus
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // Altrimenti apri una nuova finestra
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));