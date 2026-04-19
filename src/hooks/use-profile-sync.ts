"use client";

import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useBPMember } from './use-buddypress';

export const useProfileSync = (initialUsername?: string) => {
  const [syncData, setSyncData] = useState<{ id?: string, username?: string }>({ username: initialUsername });

  // 1. Recuperiamo i dati locali del profilo (incluso wp_id)
  useEffect(() => {
    const loadLocalData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, wp_id')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setSyncData({ 
          id: profile.wp_id || undefined, 
          username: profile.username || initialUsername 
        });
      }
    };
    loadLocalData();
  }, [initialUsername]);

  // 2. Interroghiamo BuddyPress usando l'ID (prioritario) o l'username
  const { data: bpMember, error } = useBPMember(
    syncData.id || syncData.username, 
    syncData.id ? 'id' : 'username'
  );

  // 3. Se i dati dal sito sono diversi, aggiorniamo Supabase
  useEffect(() => {
    const syncProfile = async () => {
      if (!bpMember || error) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('username, avatar_url, wp_id')
          .eq('id', user.id)
          .maybeSingle();

        const bpUsername = bpMember.user_login || bpMember.mention_name;
        const bpAvatar = bpMember.avatar_urls?.full || bpMember.avatar_urls?.thumb;
        const bpId = bpMember.id?.toString();

        // Verifichiamo se c'è qualcosa da aggiornare
        const needsUpdate = currentProfile && (
          currentProfile.username !== bpUsername || 
          currentProfile.avatar_url !== bpAvatar ||
          currentProfile.wp_id !== bpId
        );

        if (needsUpdate) {
          console.log(`[Sync] Rilevato cambiamento sul sito per ${user.id}. Aggiornamento in corso...`);
          
          await supabase
            .from('profiles')
            .update({
              username: bpUsername,
              avatar_url: bpAvatar,
              wp_id: bpId,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);
            
          // Aggiorniamo lo stato locale per riflettere il cambio immediatamente
          setSyncData({ id: bpId, username: bpUsername });
        }
      } catch (err) {
        console.error("[Sync] Errore durante l'aggiornamento:", err);
      }
    };

    syncProfile();
  }, [bpMember, error]);
};