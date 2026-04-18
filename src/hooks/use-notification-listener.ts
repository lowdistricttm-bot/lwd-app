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

      // Aggiungiamo un ID casuale per evitare conflitti durante i re-render
      const instanceId = Math.random().toString(36).substring(2, 9);

      channel = supabase
        .channel(`global-msg-events-${user.id}-${instanceId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`
          },
          () => {
            playNotificationSound();
            // Ricarica contatori e liste messaggi
            queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.invalidateQueries({ queryKey: ['chat'] });
          }
        )
        .subscribe();
    };

    startListening();

    // Gestione transizioni di stato Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        console.log("[Auth] Utente loggato, reset cache e avvio listener...");
        startListening();
        queryClient.invalidateQueries();
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