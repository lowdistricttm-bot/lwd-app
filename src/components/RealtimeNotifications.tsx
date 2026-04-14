"use client";

import { useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from '@tanstack/react-query';
import { showSuccess } from '@/utils/toast';

const RealtimeNotifications = () => {
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Inizializza l'audio
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    audioRef.current.volume = 0.4;

    const subscribeToMessages = (userId: string) => {
      // Pulizia canale precedente se esiste
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      console.log("[Realtime] Sottoscrizione notifiche per l'utente:", userId);

      channelRef.current = supabase
        .channel(`user-notifications-${userId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        }, async (payload) => {
          console.log("[Realtime] Messaggio ricevuto in tempo reale!", payload.new);
          
          // 1. Forza il rinfresco immediato dei dati in tutta l'app
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] }),
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
          ]);
          
          // 2. Gestione feedback visivo e sonoro
          const currentPath = window.location.pathname;
          const isCurrentChat = currentPath === `/chat/${payload.new.sender_id}`;
          
          if (isCurrentChat) {
            // Se l'utente è già nella chat, aggiorna solo i messaggi della conversazione
            queryClient.invalidateQueries({ queryKey: ['chat', payload.new.sender_id] });
          } else {
            // Se l'utente è altrove (Home, Shop, etc), feedback completo
            audioRef.current?.play().catch(() => console.log("Audio blocked by browser policy"));
            
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', payload.new.sender_id)
              .single();
              
            showSuccess(`Nuovo messaggio da ${senderProfile?.username || 'un membro'}`);
          }
        })
        .subscribe((status) => {
          console.log("[Realtime] Stato connessione:", status);
        });
    };

    // Gestione dinamica della sessione: si attiva/disattiva al login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        subscribeToMessages(session.user.id);
      } else {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      }
    });

    // Controllo iniziale
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) subscribeToMessages(user.id);
    });

    return () => {
      subscription.unsubscribe();
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [queryClient]);

  return null;
};

export default RealtimeNotifications;