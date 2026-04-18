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

      if (channel) supabase.removeChannel(channel);

      // Listener per i MESSAGGI DIRETTI (Solo per SUONO e CONTEGGIO GLOBALE)
      channel = supabase
        .channel(`global-messaging-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`
          },
          () => {
            // 1. Riproduce il suono
            playNotificationSound();
            
            // 2. Invalida i conteggi globali (Navbar)
            queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            // Invalida tutte le chat attive
            queryClient.invalidateQueries({ queryKey: ['chat'] });
          }
        )
        .subscribe();
    };

    startListening();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') startListening();
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