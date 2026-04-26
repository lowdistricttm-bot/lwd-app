"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';

const firebaseConfig = {
  apiKey: "AIzaSyAZdHvkdl-RWQzHODT58HG8TK-cZPZyXs8",
  authDomain: "lwdstrct-app.firebaseapp.com",
  projectId: "lwdstrct-app",
  storageBucket: "lwdstrct-app.firebasestorage.app",
  messagingSenderId: "345289653724",
  appId: "1:345289653724:web:0ae739a60a99abba37a319",
  measurementId: "G-Y4CRR1RK4F"
};

export const usePushNotifications = () => {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const registerToken = useCallback(async () => {
    try {
      const firebase = (window as any).firebase;
      if (!firebase) return null;

      if (firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
      }

      const messaging = firebase.messaging();
      const currentToken = await messaging.getToken({
        vapidKey: 'BKOClir8CoHy_rYFSu5P4jbuH9rI6q99zeYSKPuZ2dLAvyT5boVZMxID9Tufm08rIXzoBKXihEHtyVPoo9lciG0'
      });

      if (currentToken) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .update({ 
              fcm_token: currentToken,
              push_notifications: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
          
          setToken(currentToken);
          return currentToken;
        }
      }
      return null;
    } catch (err) {
      console.error("[Push] Errore registrazione:", err);
      return null;
    }
  }, []);

  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'default';
    
    const status = await Notification.requestPermission();
    setPermission(status);

    if (status === 'granted') {
      const t = await registerToken();
      if (t) showSuccess("Notifiche attivate con successo!");
    }
    return status;
  };

  // Funzione per sincronizzare il token se manca ma il permesso è già presente
  const syncTokenIfMissing = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('fcm_token')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile?.fcm_token) {
        console.log("[Push] Token mancante nel DB, avvio sincronizzazione...");
        await registerToken();
      }
    }
  }, [registerToken]);

  return { permission, requestPermission, token, syncTokenIfMissing };
};