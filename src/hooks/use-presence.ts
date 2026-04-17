"use client";

import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

export const usePresence = (userId?: string) => {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  // 1. Heartbeat: Aggiorna il proprio stato ogni 30 secondi se l'app è aperta
  useEffect(() => {
    const updateMyPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', user.id);
    };

    updateMyPresence(); // Al montaggio
    const interval = setInterval(updateMyPresence, 30000); // Ogni 30 secondi

    return () => clearInterval(interval);
  }, []);

  // 2. Monitoraggio stato di un altro utente
  useEffect(() => {
    if (!userId) return;

    const fetchUserStatus = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('last_seen_at')
        .eq('id', userId)
        .maybeSingle();

      if (data?.last_seen_at) {
        const lastSeenDate = new Date(data.last_seen_at);
        const now = new Date();
        // Consideriamo "Online" se l'ultimo segnale è di meno di 2 minuti fa
        const diffMinutes = (now.getTime() - lastSeenDate.getTime()) / 1000 / 60;
        
        setIsOnline(diffMinutes < 2);
        setLastSeen(formatDistanceToNow(lastSeenDate, { addSuffix: true, locale: it }));
      }
    };

    fetchUserStatus();
    
    // Sottoscrizione ai cambiamenti del profilo dell'altro utente
    const channel = supabase
      .channel(`presence-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          const lastSeenDate = new Date(payload.new.last_seen_at);
          const now = new Date();
          const diffMinutes = (now.getTime() - lastSeenDate.getTime()) / 1000 / 60;
          setIsOnline(diffMinutes < 2);
          setLastSeen(formatDistanceToNow(lastSeenDate, { addSuffix: true, locale: it }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { isOnline, lastSeen };
};