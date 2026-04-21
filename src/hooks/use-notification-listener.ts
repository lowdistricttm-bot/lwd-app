"use client";

import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { playNotificationSound } from '@/utils/sound';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';

export const useNotificationListener = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    let channel: any;

    const startListening = async () => {
      if (!user) return;

      if (channel) supabase.removeChannel(channel);

      const instanceId = Math.random().toString(36).substring(2, 9);

      channel = supabase
        .channel(`global-messaging-${user.id}-${instanceId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            const isNewIncomingMessage = payload.eventType === 'INSERT' && payload.new.receiver_id === user.id;
            
            if (isNewIncomingMessage) {
              playNotificationSound();
            }

            console.log("[Realtime] Messaggio ricevuto/aggiornato, rinfresco UI...");
            queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.invalidateQueries({ queryKey: ['chat'] });
          }
        )
        .subscribe();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries();
        startListening();
      }
    };

    startListening();
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      if (channel) supabase.removeChannel(channel);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [queryClient, user]);
};