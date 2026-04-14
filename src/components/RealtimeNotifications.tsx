"use client";

import { useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from '@tanstack/react-query';
import { showSuccess } from '@/utils/toast';

const RealtimeNotifications = () => {
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Inizializza l'audio con un suono di notifica pulito
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    audioRef.current.volume = 0.4;

    let channel: any;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel('global-notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        }, async (payload) => {
          console.log("[Realtime] Nuovo messaggio ricevuto:", payload.new);
          
          // 1. Aggiorna i contatori globali e la lista conversazioni
          queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          
          // 2. Controlla se l'utente è nella chat specifica
          const currentPath = window.location.pathname;
          const isCurrentChat = currentPath === `/chat/${payload.new.sender_id}`;
          
          if (isCurrentChat) {
            // Se è nella chat, aggiorna i messaggi
            queryClient.invalidateQueries({ queryKey: ['chat', payload.new.sender_id] });
          } else {
            // Se non è nella chat, riproduce il suono e mostra un toast
            audioRef.current?.play().catch(() => console.log("Audio blocked by browser"));
            
            // Recupera il profilo del mittente per il toast
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', payload.new.sender_id)
              .single();
              
            showSuccess(`Nuovo messaggio da ${senderProfile?.username || 'un membro'}`);
          }
        })
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return null;
};

export default RealtimeNotifications;