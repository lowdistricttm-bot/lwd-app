"use client";

import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useBPMember } from './use-buddypress';

export const useProfileSync = (currentUsername?: string) => {
  // Proviamo a cercare l'utente sul sito usando l'username attuale dell'app
  const { data: bpMember, error } = useBPMember(currentUsername);

  useEffect(() => {
    const syncProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Se BuddyPress non trova l'utente per nome (perché è cambiato), 
      // proviamo a cercarlo per email (che è più stabile)
      let finalBPMember = bpMember;

      if (!finalBPMember && user.email) {
        try {
          const BP_API_URL = "https://www.lowdistrict.it/wp-json/buddypress/v1";
          const res = await fetch(`${BP_API_URL}/members?search=${encodeURIComponent(user.email)}`);
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            finalBPMember = data[0];
          }
        } catch (e) {
          console.error("[Sync] Errore ricerca per email");
        }
      }

      if (!finalBPMember) return;

      try {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        const bpUsername = finalBPMember.user_login || finalBPMember.mention_name;
        const bpAvatar = finalBPMember.avatar_urls?.full || finalBPMember.avatar_urls?.thumb;

        // Se i dati sul sito sono diversi da quelli nell'app, aggiorniamo l'app
        if (currentProfile && (currentProfile.username !== bpUsername || currentProfile.avatar_url !== bpAvatar)) {
          console.log(`[Sync] Aggiornamento dati da sito: ${currentProfile.username} -> ${bpUsername}`);
          
          await supabase
            .from('profiles')
            .update({
              username: bpUsername,
              avatar_url: bpAvatar,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);
            
          // Forza un ricaricamento leggero per aggiornare la UI ovunque
          if (currentProfile.username !== bpUsername) {
            window.location.reload();
          }
        }
      } catch (err) {
        // Silenzioso
      }
    };

    syncProfile();
  }, [bpMember, currentUsername]);
};