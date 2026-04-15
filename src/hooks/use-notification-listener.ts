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
            
            // Riproduci il suono solo se il destinatario è l'utente corrente
            // e non è lui stesso ad aver inviato il messaggio (es. da un altro dispositivo)
            if (newMessage.receiver_id === currentUserId) {
              playNotificationSound();
              
              // Invalida le query per aggiornare i contatori e le liste ovunque
              queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
              queryClient.invalidateQueries({ queryKey: ['conversations'] });
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