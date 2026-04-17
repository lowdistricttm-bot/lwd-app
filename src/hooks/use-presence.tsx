"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface PresenceContextType {
  onlineUsers: string[];
  isUserOnline: (userId: string | undefined) => boolean;
  getLastSeen: (userId: string | undefined) => string | null;
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export const PresenceProvider = ({ children }: { children: ReactNode }): React.JSX.Element => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [lastSeenMap, setLastSeenMap] = useState<Record<string, string>>({});

  useEffect(() => {
    let channel: any;

    const setupPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Canale globale unico per tutti gli utenti dell'app
      const channelName = 'global-presence-v3';

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
        })
        .on('presence', { event: 'join' }, ({ key }: any) => {
          setOnlineUsers(prev => Array.from(new Set([...prev, key])));
        })
        .on('presence', { event: 'leave' }, ({ key }: any) => {
          setOnlineUsers(prev => prev.filter(id => id !== key));
          setLastSeenMap(prev => ({
            ...prev,
            [key]: formatDistanceToNow(new Date(), { addSuffix: true, locale: it })
          }));
        })
        .subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              online_at: new Date().toISOString(),
              user_id: user.id
            });
            
            // Aggiornamento DB per persistenza
            await supabase
              .from('profiles')
              .update({ last_seen_at: new Date().toISOString() })
              .eq('id', user.id);
          }
        });
    };

    setupPresence();

    // Listener per il cambio di stato Auth (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setupPresence();
      } else if (event === 'SIGNED_OUT') {
        if (channel) {
          channel.unsubscribe();
          supabase.removeChannel(channel);
        }
        setOnlineUsers([]);
      }
    });

    return () => {
      if (channel) {
        channel.unsubscribe();
        supabase.removeChannel(channel);
      }
      subscription.unsubscribe();
    };
  }, []);

  const isUserOnline = (userId: string | undefined) => {
    if (!userId) return false;
    return onlineUsers.includes(userId);
  };

  const getLastSeen = (userId: string | undefined) => {
    if (!userId) return null;
    return lastSeenMap[userId] || null;
  };

  return (
    <PresenceContext.Provider value={{ onlineUsers, isUserOnline, getLastSeen }}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = () => {
  const context = useContext(PresenceContext);
  if (context === undefined) {
    // Fallback silenzioso se usato fuori dal provider (evita crash)
    return {
      onlineUsers: [],
      isUserOnline: () => false,
      getLastSeen: () => null
    };
  }
  return context;
};