"use client";

import { useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from '@tanstack/react-query';

const RealtimeNotifications = () => {
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Inizializza l'audio (suono "ping" discreto)
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    audioRef.current.volume = 0.5;

    let channel: any;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Definiamo il canale e i listener PRIMA di chiamare subscribe()
      channel = supabase
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
          
          // Controlliamo il percorso corrente tramite window.location per evitare dipendenze nell'useEffect
          const currentPath = window.location.pathname;
          const isCurrentChat = currentPath === `/chat/${payload.new.sender_id}`;
          
          if (!isCurrentChat) {
            audioRef.current?.play().catch(e => console.log("Audio play blocked by browser"));
          } else {
            // Se siamo nella chat, aggiorna i messaggi della chat
            queryClient.invalidateQueries({ queryKey: ['chat', payload.new.sender_id] });
          }
        });

      // Ora possiamo sottoscrivere in sicurezza
      channel.subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [queryClient]);

  return null;
};

export default RealtimeNotifications;