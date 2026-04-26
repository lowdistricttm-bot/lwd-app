// Service Worker per Low District - Versione v14
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

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Notifica ricevuta:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-only.png',
    badge: '/icon-only.png',
    data: payload.data
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));