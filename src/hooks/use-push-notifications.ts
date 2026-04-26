"use client";

import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess } from '@/utils/toast';

// CONFIGURAZIONE FIREBASE REALE
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

  const requestPermission = async () => {
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) return 'default';

      const status = await Notification.permission;
      
      // Se il permesso non è già garantito, lo chiediamo
      const finalStatus = status === 'default' ? await Notification.requestPermission() : status;
      setPermission(finalStatus);

      if (finalStatus === 'granted') {
        const firebase = (window as any).firebase;
        if (!firebase) throw new Error("Firebase SDK non caricato. Verifica index.html");

        // Inizializza Firebase se non già fatto
        if (firebase.apps.length === 0) {
          firebase.initializeApp(firebaseConfig);
        }

        const messaging = firebase.messaging();
        
        // Gestione messaggi in primo piano (Foreground)
        messaging.onMessage((payload: any) => {
          console.log('[Push] Messaggio ricevuto in primo piano:', payload);
          if (payload.notification) {
            // Mostra un toast all'utente mentre usa l'app
            showSuccess(`${payload.notification.title}: ${payload.notification.body}`);
          }
        });

        // Recupera il token FCM usando la tua VAPID KEY
        const currentToken = await messaging.getToken({
          vapidKey: 'BKOClir8CoHy_rYFSu5P4jbuH9rI6q99zeYSKPuZ2dLAvyT5boVZMxID9Tufm08rIXzoBKXihEHtyVPoo9lciG0'
        });

        if (currentToken) {
          console.log("[Push] Token generato:", currentToken);
          setToken(currentToken);
          
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Salviamo il token nel profilo dell'utente su Supabase
            const { error } = await supabase
              .from('profiles')
              .update({ fcm_token: currentToken })
              .eq('id', user.id);
            
            if (error) console.error("[Push] Errore salvataggio token:", error);
            else showSuccess("Notifiche attivate con successo!");
          }
        } else {
          console.warn("[Push] Nessun token ricevuto. Controlla i premessi del browser.");
        }
      }
      return finalStatus;
    } catch (err: any) {
      console.error("[Push] Errore attivazione:", err);
      return 'default';
    }
  };

  return { permission, requestPermission, token };
};