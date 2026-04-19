"use client";

import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useBPMember } from './use-buddypress';

export const useProfileSync = (username?: string) => {
  const { data: bpMember, error } = useBPMember(username);

  useEffect(() => {
    const syncProfile = async () => {
      // Se l'API BuddyPress fallisce o non trova l'utente, usciamo silenziosamente
      if (!bpMember || error) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        // Recuperiamo il profilo attuale per confrontare i dati
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        const bpUsername = bpMember.user_login || bpMember.mention_name;
        const bpAvatar = bpMember.avatar_urls?.full || bpMember.avatar_urls?.thumb;

        // Aggiorniamo solo se ci sono differenze reali per evitare loop
        if (currentProfile && (currentProfile.username !== bpUsername || currentProfile.avatar_url !== bpAvatar)) {
          console.log(`[Sync] Aggiornamento profilo per ${user.id}: ${currentProfile.username} -> ${bpUsername}`);
          
          await supabase
            .from('profiles')
            .update({
              username: bpUsername,
              avatar_url: bpAvatar,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);
        }
      } catch (err) {
        // Errore silenzioso per non disturbare l'esperienza utente
      }
    };

    syncProfile();
  }, [bpMember, error]);
};