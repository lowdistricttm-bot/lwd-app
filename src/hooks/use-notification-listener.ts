"use client";

import { useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { playNotificationSound } from '@/utils/sound';
import { useQueryClient } from '@tanstack/react-query';

export const useNotificationListener = () => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const setupMessageListener = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Pulizia eventuale canale precedente
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      console.log("[NotificationListener] Avvio ascolto messaggi per:", user.id);

      // Creiamo un canale unico per i messaggi in entrata
      const channel = supabase
        .channel(`global-messages-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`
          },
          (payload) => {
            console.log("[NotificationListener] Nuovo messaggio ricevuto!");
            
            // Riproduce il suono (lo stesso delle notifiche)
            playNotificationSound();
            
            // Invalida le query per aggiornare i pallini rossi e le liste in tempo reale
            queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.invalidateQueries({ queryKey: ['chat'] });
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log("[NotificationListener] Sottoscrizione messaggi attiva.");
          }
        });

      channelRef.current = channel;
    };

    setupMessageListener();

    // Gestione cambi di sessione (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setupMessageListener();
      } else if (event === 'SIGNED_OUT') {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      }
    });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      subscription.unsubscribe();
    };
  }, [queryClient]);
};