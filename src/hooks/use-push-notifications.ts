"use client";

import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          setSubscription(sub);
        });
      });
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) return;

    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      showSuccess("Notifiche attivate con successo!");
    }
    return result;
  };

  const subscribeUser = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = 'BEl627_5_2W-9ID99S3Y-9E2_7_5_2W-9ID99S3Y-9E2_7_5_2W-9ID99S3Y-9E2';
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      setSubscription(sub);
      setPermission('granted');
      return sub;
    } catch (error) {
      console.error('Errore durante la sottoscrizione:', error);
      return null;
    }
  };

  return { isSupported, permission, subscription, subscribeUser, requestPermission };
};

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