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

      // Creiamo un nome canale unico per questa istanza dell'hook per evitare collisioni
      // ma usiamo lo stesso "topic" per il tracciamento se necessario.
      // In Supabase, canali con nomi diversi sono isolati, quindi usiamo un ID unico.
      const instanceId = Math.random().toString(36).substring(2, 9);
      const channelName = `presence-tracker-${targetUserId || 'global'}-${instanceId}`;

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
          const ids = Object.keys(state);
          setOnlineUsers(ids);
          
          if (targetUserId) {
            setIsOnline(ids.includes(targetUserId));
          }
        })
        .on('presence', { event: 'join' }, ({ key }: any) => {
          if (key === targetUserId) setIsOnline(true);
        })
        .on('presence', { event: 'leave' }, ({ key }: any) => {
          if (key === targetUserId) setIsOnline(false);
        })
        .subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            // Tracciamo l'utente corrente
            await channel.track({
              online_at: new Date().toISOString(),
            });
            
            // Aggiorniamo il DB per il Last Seen persistente
            await supabase
              .from('profiles')
              .update({ last_seen_at: new Date().toISOString() })
              .eq('id', user.id);
          }
        });
    };

    setupPresence();

    // Recupero fallback dal DB
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
      }
    };
  }, [targetUserId]);

  return { isOnline, lastSeen, onlineUsers };
};