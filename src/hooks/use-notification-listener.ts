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
        
        // 1. Avvia il listener realtime per i messaggi
        startListening();
        
        // 2. Invalida TUTTE le query (Bacheca, Messaggi, Ordini, etc.) 
        // per forzare il ricaricamento dei dati ora che l'utente è autenticato
        queryClient.invalidateQueries();
        
        // 3. Forza il refetch immediato delle query vitali
        queryClient.refetchQueries({ queryKey: ['social-posts'] });
        queryClient.refetchQueries({ queryKey: ['conversations'] });
        queryClient.refetchQueries({ queryKey: ['user-role'] });
      }
      
      if (event === 'SIGNED_OUT') {
        if (channel) supabase.removeChannel(channel);
        // Pulisce i dati privati al logout
        queryClient.clear();
      }
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
      subscription.unsubscribe();
    };
  }, [queryClient]);
};