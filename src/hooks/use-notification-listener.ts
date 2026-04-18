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
            // Invalida immediatamente le query per aggiornare UI e badge
            queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.invalidateQueries({ queryKey: ['chat'] });
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log("[Realtime] Sottoscritto con successo ai messaggi");
          }
        });
    };

    // Gestione del ritorno in primo piano (fondamentale per iOS)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("[App] Ripristino visibilità: refresh dati...");
        queryClient.invalidateQueries();
        // Re-inizializza il listener se necessario
        startListening();
      }
    };

    startListening();
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
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
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [queryClient]);
};