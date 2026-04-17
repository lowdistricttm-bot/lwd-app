"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
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
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const channelName = 'global-presence-v3';

    const cleanup = async () => {
      if (channelRef.current) {
        console.log("[Presence] Cleanup canale esistente...");
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };

    const setupPresence = async (user: any) => {
      if (!user) return;

      // Rimuoviamo eventuali canali con lo stesso nome prima di crearne uno nuovo
      await cleanup();

      console.log("[Presence] Avvio sottoscrizione per:", user.id);

      const channel = supabase.channel(channelName, {
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
        });

      channel.subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
            user_id: user.id
          });
          
          await supabase
            .from('profiles')
            .update({ last_seen_at: new Date().toISOString() })
            .eq('id', user.id);
        }
      });

      channelRef.current = channel;
    };

    // Gestione iniziale
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setupPresence(user);
    });

    // Listener per cambi di stato Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setupPresence(session.user);
      } else if (event === 'SIGNED_OUT') {
        cleanup();
        setOnlineUsers([]);
      }
    });

    return () => {
      cleanup();
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
    return {
      onlineUsers: [],
      isUserOnline: () => false,
      getLastSeen: () => null
    };
  }
  return context;
};