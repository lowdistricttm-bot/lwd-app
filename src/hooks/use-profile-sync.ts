"use client";

import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useBPMember } from './use-buddypress';

export const useProfileSync = (username?: string) => {
  const { data: bpMember } = useBPMember(username);

  useEffect(() => {
    const syncProfile = async () => {
      if (!bpMember || !username) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const avatarUrl = bpMember.avatar_urls?.full || bpMember.avatar_urls?.thumb;
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) console.error("[Sync] Errore sincronizzazione profilo:", error.message);
      else console.log("[Sync] Profilo sincronizzato con BuddyPress");
    };

    syncProfile();
  }, [bpMember, username]);
};