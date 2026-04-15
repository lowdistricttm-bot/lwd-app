"use client";

import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useBPMember } from './use-buddypress';

export const useProfileSync = (username?: string) => {
  const { data: bpMember } = useBPMember(username);

  useEffect(() => {
    const syncProfile = async () => {
      if (!bpMember) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Recuperiamo il profilo attuale per confrontare i dati
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      const bpUsername = bpMember.user_login || bpMember.mention_name;
      const bpAvatar = bpMember.avatar_urls?.full || bpMember.avatar_urls?.thumb;

      // Aggiorniamo solo se ci sono differenze reali per evitare loop
      if (currentProfile && (currentProfile.username !== bpUsername || currentProfile.avatar_url !== bpAvatar)) {
        console.log(`[Sync] Aggiornamento profilo per ${user.id}: ${currentProfile.username} -> ${bpUsername}`);
        
        const { error } = await supabase
          .from('profiles')
          .update({
            username: bpUsername,
            avatar_url: bpAvatar,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) console.error("[Sync] Errore sincronizzazione:", error.message);
      }
    };

    syncProfile();
  }, [bpMember]);
};