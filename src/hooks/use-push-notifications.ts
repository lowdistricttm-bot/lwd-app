"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [isSyncing, setIsSyncing] = useState(false);
  const retryCount = useRef(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const registerToken = useCallback(async (force = false) => {
    if (isSyncing && !force) return null;
    setIsSyncing(true);

    try {
      const firebase = (window as any).firebase;
      
      // Se Firebase non è ancora caricato dai tag script, riproviamo tra 1 secondo
      if (!firebase || !firebase.messaging) {
        if (retryCount.current < 5) {
          retryCount.current++;
          setTimeout(() => registerToken(force), 1500);
        }
        setIsSyncing(false);
        return null;
      }

      if (firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
      }

      const messaging = firebase.messaging();
      
      // Recupero token da Firebase
      const currentToken = await messaging.getToken({
        vapidKey: 'BKOClir8CoHy_rYFSu5P4jbuH9rI6q99zeYSKPuZ2dLAvyT5boVZMxID9Tufm08rIXzoBKXihEHtyVPoo9lciG0'
      });

      if (currentToken) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Salvataggio nel profilo Supabase
          const { error } = await supabase
            .from('profiles')
            .update({ 
              fcm_token: currentToken,
              push_notifications: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
          
          if (error) throw error;

          setToken(currentToken);
          console.log("[Push] Token sincronizzato con successo");
          setIsSyncing(false);
          return currentToken;
        }
      }
      setIsSyncing(false);
      return null;
    } catch (err) {
      console.error("[Push] Errore registrazione:", err);
      setIsSyncing(false);
      return null;
    }
  }, [isSyncing]);

  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showError("Le notifiche non sono supportate su questo browser.");
      return 'denied';
    }
    
    const status = await Notification.requestPermission();
    setPermission(status);

    if (status === 'granted') {
      const t = await registerToken(true);
      if (t) showSuccess("Notifiche attivate correttamente!");
    } else if (status === 'denied') {
      showError("Hai negato i permessi. Abilitali nelle impostazioni del browser.");
    }
    return status;
  };

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

      // Se il token manca nel DB ma abbiamo il permesso, lo rigeneriamo
      if (!profile?.fcm_token) {
        console.log("[Push] Token mancante nel DB, avvio recupero automatico...");
        await registerToken();
      }
    }
  }, [registerToken]);

  return { permission, requestPermission, token, syncTokenIfMissing, isSyncing, registerToken };
};