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
  const [hasTokenInDb, setHasTokenInDb] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const retryCount = useRef(0);

  const checkDbToken = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('fcm_token')
      .eq('id', user.id)
      .maybeSingle();

    setHasTokenInDb(!!profile?.fcm_token);
    if (profile?.fcm_token) setToken(profile.fcm_token);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
      checkDbToken();
    }
  }, [checkDbToken]);

  const registerToken = useCallback(async (force = false) => {
    if (isSyncing && !force) return null;
    setIsSyncing(true);

    try {
      const firebase = (window as any).firebase;
      if (!firebase || !firebase.messaging) {
        throw new Error("Libreria Firebase non caricata correttamente.");
      }

      if (firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
      }

      const messaging = firebase.messaging();
      
      // Recuperiamo la registrazione del Service Worker esistente
      const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js') 
                         || await navigator.serviceWorker.ready;

      if (!registration) {
        throw new Error("Service Worker non trovato. Prova a ricaricare la pagina.");
      }

      console.log("[Push] Richiesta token a Firebase...");
      
      const currentToken = await messaging.getToken({
        vapidKey: 'BKOClir8CoHy_rYFSu5P4jbuH9rI6q99zeYSKPuZ2dLAvyT5boVZMxID9Tufm08rIXzoBKXihEHtyVPoo9lciG0',
        serviceWorkerRegistration: registration
      });

      if (currentToken) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
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
          setHasTokenInDb(true);
          console.log("[Push] Token salvato nel database.");
          setIsSyncing(false);
          return currentToken;
        }
      } else {
        throw new Error("Nessun token restituito da Firebase.");
      }
      
      setIsSyncing(false);
      return null;
    } catch (err: any) {
      const msg = err?.message || "Errore sconosciuto durante la generazione del token.";
      console.error("[Push] Errore critico:", msg, err);
      
      // Se siamo su iOS e non in modalità standalone, spieghiamo il motivo
      const isIos = /iPhone|iPad|iPod/.test(window.navigator.userAgent);
      const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
      
      if (isIos && !isStandalone) {
        showError("Su iPhone le notifiche funzionano solo se aggiungi l'app alla Home Screen.");
      } else {
        showError(msg);
      }
      
      setIsSyncing(false);
      return null;
    }
  }, [isSyncing]);

  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showError("Notifiche non supportate su questo dispositivo.");
      return 'denied';
    }
    
    const status = await Notification.requestPermission();
    setPermission(status);

    if (status === 'granted') {
      await registerToken(true);
    } else {
      showError("Permesso notifiche negato.");
    }
    return status;
  };

  const syncTokenIfMissing = useCallback(async () => {
    if (Notification.permission === 'granted' && !hasTokenInDb) {
      await registerToken();
    }
  }, [hasTokenInDb, registerToken]);

  return { permission, requestPermission, token, hasTokenInDb, syncTokenIfMissing, isSyncing, registerToken };
};