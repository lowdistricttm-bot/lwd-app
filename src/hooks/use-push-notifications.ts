"use client";

import { useState, useEffect } from 'react';
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
        const firebase = (window as any).firebase;
        if (!firebase) throw new Error("Firebase SDK non caricato");

        // Inizializza se non già fatto
        if (firebase.apps.length === 0) {
          firebase.initializeApp(firebaseConfig);
        }

        const messaging = firebase.messaging();
        
        // Recupera il token FCM
        const currentToken = await messaging.getToken({
          vapidKey: 'BKOClir8CoHy_rYFSu5P4jbuH9rI6q99zeYSKPuZ2dLAvyT5boVZMxID9Tufm08rIXzoBKXihEHtyVPoo9lciG0'
        });

        if (currentToken) {
          setToken(currentToken);
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
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