import { useState, useEffect } from 'react';
import { showSuccess, showError } from '@/utils/toast';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          setSubscription(sub);
        });
      });
    }
  }, []);

  const subscribeUser = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Nota: In produzione dovrai sostituire questa chiave con la tua VAPID Public Key reale
      const vapidPublicKey = 'BEl627_5_2W-9ID99S3Y-9E2_7_5_2W-9ID99S3Y-9E2_7_5_2W-9ID99S3Y-9E2';
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      setSubscription(sub);
      setPermission('granted');
      
      // Qui invieremo il token al database (Supabase)
      console.log('Push Subscription:', JSON.stringify(sub));
      showSuccess('Notifiche attivate con successo!');
      
      return sub;
    } catch (error) {
      console.error('Errore durante la sottoscrizione:', error);
      showError('Impossibile attivare le notifiche.');
      return null;
    }
  };

  return { isSupported, permission, subscription, subscribeUser };
};

// Utility per convertire la chiave VAPID
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}