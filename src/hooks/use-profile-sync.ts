"use client";

import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useBPMember } from './use-buddypress';
import { useAuth } from './use-auth';

export const useProfileSync = (initialUsername?: string) => {
  const { user } = useAuth();
  const [syncData, setSyncData] = useState<{ id?: string, username?: string }>({ username: initialUsername });

  useEffect(() => {
    const loadLocalData = async () => {
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
  }, [initialUsername, user]);

  const { data: bpMember, error } = useBPMember(
    syncData.id || syncData.username, 
    syncData.id ? 'id' : 'username'
  );

  useEffect(() => {
    const syncProfile = async () => {
      if (!bpMember || error || !user) return;

      try {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('username, avatar_url, wp_id')
          .eq('id', user.id)
          .maybeSingle();

        const bpUsername = bpMember.user_login || bpMember.mention_name;
        const bpAvatar = bpMember.avatar_urls?.full || bpMember.avatar_urls?.thumb;
        const bpId = bpMember.id?.toString();

        // Priorità ai dati locali: sincronizziamo l'avatar solo se quello locale è vuoto o è quello di default
        const isDefaultAvatar = !currentProfile?.avatar_url || currentProfile.avatar_url.includes('immagine-profilo-sito-new-scaled.jpg');
        const shouldSyncAvatar = bpAvatar && isDefaultAvatar && currentProfile?.avatar_url !== bpAvatar;

        const needsUpdate = currentProfile && (
          currentProfile.username !== bpUsername || 
          shouldSyncAvatar ||
          currentProfile.wp_id !== bpId
        );

        if (needsUpdate) {
          console.log(`[Sync] Rilevato cambiamento sul sito per ${user.id}. Aggiornamento selettivo...`);
          
          const updateData: any = {
            username: bpUsername,
            wp_id: bpId,
            updated_at: new Date().toISOString(),
          };

          // Aggiorniamo l'avatar solo se necessario (priorità ai dati locali dell'app)
          if (shouldSyncAvatar) {
            updateData.avatar_url = bpAvatar;
          }

          await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id);
            
          setSyncData({ id: bpId, username: bpUsername });
        }
      } catch (err) {
        console.error("[Sync] Errore durante l'aggiornamento:", err);
      }
    };

    syncProfile();
  }, [bpMember, error, user]);
};