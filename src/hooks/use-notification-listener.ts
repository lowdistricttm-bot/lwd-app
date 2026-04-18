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

      // Pulizia eventuale canale precedente
      if (channel) supabase.removeChannel(channel);

      const instanceId = Math.random().toString(36).substring(2, 9);

      // Listener per i MESSAGGI DIRETTI
      channel = supabase
        .channel(`global-messaging-${user.id}-${instanceId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`
          },
          (payload) => {
            console.log("[Direct] Nuovo messaggio ricevuto:", payload.new.id);
            
            // Riproduce il suono iOS e la vibrazione
            playNotificationSound();
            
            // Aggiorna i dati in tutta l'app
            queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.invalidateQueries({ queryKey: ['chat'] });
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log("[Direct] Listener messaggi attivo per l'utente:", user.id);
          }
        });
    };

    startListening();

    // Gestione cambi di sessione (Login/Logout)
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
    };
  }, [queryClient]);
};