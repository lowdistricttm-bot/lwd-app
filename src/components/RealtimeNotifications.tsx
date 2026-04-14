"use client";

import { useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';

const RealtimeNotifications = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Inizializza l'audio (suono "ping" discreto)
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    audioRef.current.volume = 0.5;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('global-notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        }, (payload) => {
          console.log("[Realtime] Nuovo messaggio ricevuto:", payload.new);
          
          // Aggiorna i contatori e le liste ovunque
          queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          
          // Se non siamo nella chat specifica del mittente, riproduci il suono
          const isCurrentChat = location.pathname === `/chat/${payload.new.sender_id}`;
          if (!isCurrentChat) {
            audioRef.current?.play().catch(e => console.log("Audio play blocked by browser"));
          } else {
            // Se siamo nella chat, aggiorna i messaggi della chat
            queryClient.invalidateQueries({ queryKey: ['chat', payload.new.sender_id] });
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtime();
  }, [queryClient, location.pathname]);

  return null; // Componente invisibile
};

export default RealtimeNotifications;