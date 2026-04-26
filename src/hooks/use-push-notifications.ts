"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';

const firebaseConfig = {
  apiKey: "AIzaSyAO695SEU4tcw1Cfy7zRakQ55K14tMG5jg",
  authDomain: "my-project-23-46087.firebaseapp.com",
  projectId: "my-project-23-46087",
  storageBucket: "my-project-23-46087.firebasestorage.app",
  messagingSenderId: "273028606272",
  appId: "1:273028606272:web:c6d476ba2b97e7f22bb2a5"
};

export const usePushNotifications = () => {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [hasTokenInDb, setHasTokenInDb] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState(false);

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
        throw new Error("Libreria Firebase non pronta.");
      }

      if (firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
      }

      const messaging = firebase.messaging();
      const registration = await navigator.serviceWorker.ready;

      console.log("[Push] Generazione token con nuovo progetto...");
      
      const currentToken = await messaging.getToken({
        vapidKey: 'BASj2TpxGmTE-HehOnwkCI4vsEsj2k76Q8t4uIG-i14yIyBZ-1a5bf-c0zO0wo36feRidv6P_hqyk24DPjDDagA',
        serviceWorkerRegistration: registration
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
          setHasTokenInDb(true);
          setIsSyncing(false);
          return currentToken;
        }
      }
      
      setIsSyncing(false);
      return null;
    } catch (err: any) {
      console.error("[Push] Errore:", err);
      showError("Impossibile attivare le notifiche. Riprova più tardi.");
      setIsSyncing(false);
      return null;
    }
  }, [isSyncing]);

  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
    const status = await Notification.requestPermission();
    setPermission(status);
    if (status === 'granted') await registerToken(true);
    return status;
  };

  const syncTokenIfMissing = useCallback(async () => {
    if (Notification.permission === 'granted' && !hasTokenInDb) {
      await registerToken();
    }
  }, [hasTokenInDb, registerToken]);

  return { permission, requestPermission, token, hasTokenInDb, syncTokenIfMissing, isSyncing, registerToken };
};