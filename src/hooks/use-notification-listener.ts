"use client";

import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { playNotificationSound } from '@/utils/sound';
import { useQueryClient } from '@tanstack/react-query';

export const useNotificationListener = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    let channel: any;

    const startListening = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Pulizia canale precedente se esistente
      if (channel) supabase.removeChannel(channel);

      const instanceId = Math.random().toString(36).substring(2, 9);

      // Ascoltiamo TUTTI i cambiamenti alla tabella messages che riguardano l'utente
      // sia come mittente che come ricevitore per tenere tutto sincronizzato
      channel = supabase
        .channel(`global-messaging-${user.id}-${instanceId}`)
        .on(
          'postgres_changes',
          {
            event: '*', // Ascolta INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            const isNewIncomingMessage = payload.eventType === 'INSERT' && payload.new.receiver_id === user.id;
            
            if (isNewIncomingMessage) {
              playNotificationSound();
            }

            // Invalida TUTTE le query legate ai messaggi per un aggiornamento istantaneo della UI
            console.log("[Realtime] Messaggio ricevuto/aggiornato, rinfresco UI...");
            
            // Aggiorna il badge nella Navbar
            queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
            
            // Aggiorna la lista delle conversazioni (Messages.tsx)
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            
            // Aggiorna la chat specifica se aperta (Chat.tsx)
            queryClient.invalidateQueries({ queryKey: ['chat'] });
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log("[Realtime] Sincronizzazione messaggi attiva");
          }
        });
    };

    // Gestione del ritorno in primo piano (fondamentale per iOS/PWA)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries();
        startListening();
      }
    };

    startListening();
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        startListening();
      }
      if (event === 'SIGNED_OUT') {
        if (channel) supabase.removeChannel(channel);
        queryClient.clear();
      }
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
      subscription.unsubscribe();
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [queryClient]);
};