"use client";

import { useState, useEffect } from 'react';
import { initializeApp, getApp, getApps } from "firebase/app";
import { getMessaging, getToken, Messaging } from "firebase/messaging";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess } from '@/utils/toast';

// CONFIGURAZIONE FIREBASE (Sostituisci con i tuoi dati reali dalla console Firebase)
const firebaseConfig = {
  apiKey: "INSERISCI_API_KEY",
  authDomain: "IL_TUO_PROGETTO.firebaseapp.com",
  projectId: "IL_TUO_PROGETTO",
  storageBucket: "IL_TUO_PROGETTO.appspot.com",
  messagingSenderId: "IL_TUO_SENDER_ID",
  appId: "IL_TUO_APP_ID"
};

export const usePushNotifications = () => {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) return 'default';

      const status = await Notification.requestPermission();
      setPermission(status);

      if (status === 'granted') {
        // Inizializza Firebase solo se non è già stato fatto
        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        const messaging: Messaging = getMessaging(app);
        
        // Recupera il token FCM
        const currentToken = await getToken(messaging, {
          vapidKey: 'LA_TUA_VAPID_KEY_PUBBLICA_DA_FIREBASE'
        });

        if (currentToken) {
          setToken(currentToken);
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            // Salva il token su Supabase nel profilo utente
            await supabase
              .from('profiles')
              .update({ fcm_token: currentToken })
              .eq('id', user.id);
            
            showSuccess("Notifiche attivate con successo!");
          }
        }
      }
      return status;
    } catch (err) {
      console.error("Errore attivazione notifiche:", err);
      return 'default';
    }
  };

  return { permission, requestPermission, token };
};