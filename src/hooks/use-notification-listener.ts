"use client";

import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { playNotificationSound } from '@/utils/sound';
import { useQueryClient } from '@tanstack/react-query';

export const useNotificationListener = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    let currentUserId: string | null = null;

    const setupListener = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      currentUserId = user.id;

      // Ascolta nuovi messaggi in tutta l'applicazione
      const channel = supabase
        .channel('global-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            const newMessage = payload.new;
            
            // Se il messaggio è per me
            if (newMessage.receiver_id === currentUserId) {
              // 1. Riproduci suono
              playNotificationSound();
              
              // 2. Invalida TUTTE le query relative ai messaggi per forzare il refresh
              queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
              queryClient.invalidateQueries({ queryKey: ['conversations'] });
              
              // 3. Se sono in una chat specifica, invalida anche quella
              queryClient.invalidateQueries({ queryKey: ['chat'] });
            }
          }
        )
        .subscribe();

      return channel;
    };

    const listenerPromise = setupListener();

    return () => {
      listenerPromise.then(channel => {
        if (channel) supabase.removeChannel(channel);
      });
    };
  }, [queryClient]);
};