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

      // Se esiste già un canale, lo rimuoviamo prima di crearne uno nuovo
      if (channel) supabase.removeChannel(channel);

      channel = supabase
        .channel(`global-msg-events-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`
          },
          () => {
            console.log("[Realtime] Nuovo messaggio ricevuto!");
            // 1. Feedback audio/vibrazione
            playNotificationSound();
            
            // 2. Forza il ricaricamento immediato dei contatori e delle liste
            queryClient.refetchQueries({ queryKey: ['unread-messages-count'] });
            queryClient.refetchQueries({ queryKey: ['conversations'] });
            queryClient.refetchQueries({ queryKey: ['chat'] });
          }
        )
        .subscribe();
    };

    startListening();

    // Ascoltiamo anche i cambi di stato auth per riattivare il listener se l'utente logga
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') startListening();
      if (event === 'SIGNED_OUT' && channel) {
        supabase.removeChannel(channel);
      }
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
      subscription.unsubscribe();
    };
  }, [queryClient]);
};