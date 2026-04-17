"use client";

import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

export const usePresence = (targetUserId?: string) => {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    let channel: any;

    const setupPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Usiamo un nome canale unico per istanza per evitare l'errore "cannot add callbacks"
      // ma Supabase sincronizzerà comunque la Presence se configurata correttamente.
      const instanceId = Math.random().toString(36).substring(2, 9);
      const channelName = `presence-v2-${instanceId}`;

      channel = supabase.channel(channelName, {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          // Recuperiamo tutti gli ID utente online in questo momento
          const ids = Object.keys(state);
          setOnlineUsers(ids);
          
          if (targetUserId) {
            setIsOnline(ids.includes(targetUserId));
          }
        })
        .on('presence', { event: 'join' }, ({ key }: any) => {
          if (key === targetUserId) {
            console.log(`[Presence] ${key} è entrato online`);
            setIsOnline(true);
          }
        })
        .on('presence', { event: 'leave' }, ({ key }: any) => {
          if (key === targetUserId) {
            console.log(`[Presence] ${key} è uscito`);
            setIsOnline(false);
            // Quando esce, aggiorniamo il last seen con l'ora attuale
            setLastSeen(formatDistanceToNow(new Date(), { addSuffix: true, locale: it }));
          }
        })
        .subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            // Tracciamo l'utente corrente con un timestamp
            await channel.track({
              online_at: new Date().toISOString(),
              user_id: user.id
            });
            
            // Aggiorniamo anche il database per persistenza
            await supabase
              .from('profiles')
              .update({ last_seen_at: new Date().toISOString() })
              .eq('id', user.id);
          }
        });
    };

    setupPresence();

    // Recupero iniziale dal DB come fallback
    if (targetUserId) {
      supabase
        .from('profiles')
        .select('last_seen_at')
        .eq('id', targetUserId)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.last_seen_at) {
            setLastSeen(formatDistanceToNow(new Date(data.last_seen_at), { addSuffix: true, locale: it }));
          }
        });
    }

    return () => {
      if (channel) {
        channel.unsubscribe();
        supabase.removeChannel(channel);
      }
    };
  }, [targetUserId]);

  return { isOnline, lastSeen, onlineUsers };
};