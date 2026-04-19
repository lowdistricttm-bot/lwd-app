"use client";

import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';

// Placeholder predefiniti
const DEFAULT_AVATAR = "https://www.lowdistrict.it/wp-content/uploads/immagine-profilo-sito-new-scaled.jpg";
const DEFAULT_COVER = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop&sat=-100";

export const useWpAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithWp = async (usernameOrEmail: string, password: string) => {
    setIsLoading(true);
    try {
      // 1. Chiamata alla Edge Function per sincronizzare le password
      // Usiamo l'URL completo come richiesto dalle linee guida per le Edge Functions
      const response = await fetch('https://cxjqbxhhslxqpkfcwqhr.supabase.co/functions/v1/sync-wp-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4anFieGhoc2x4cXBrZmN3cWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMDQyMjcsImV4cCI6MjA5MTU4MDIyN30.O6UODSJpjjgcffUR8l4FDB5B28Qn1BdfQ3Cf2nprD88"
        },
        body: JSON.stringify({ username: usernameOrEmail, password }),
      });

      const syncData = await response.json();

      if (!response.ok) {
        throw new Error(syncData.error || "Errore durante la sincronizzazione dell'account.");
      }

      const realEmail = syncData.email;
      const wpId = syncData.wp_id;

      // 2. Ora che la password è sincronizzata, eseguiamo il login standard su Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: realEmail,
        password: password,
      });

      if (authError) throw authError;

      // 3. Creazione/Aggiornamento Profilo Pubblico
      if (authData?.user) {
        // Verifichiamo se il profilo esiste già per non sovrascrivere foto esistenti
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('avatar_url, cover_url')
          .eq('id', authData.user.id)
          .maybeSingle();

        await supabase.from('profiles').upsert({
          id: authData.user.id,
          username: usernameOrEmail.includes('@') ? (existingProfile as any)?.username || usernameOrEmail.split('@')[0] : usernameOrEmail,
          wp_id: wpId,
          avatar_url: existingProfile?.avatar_url || DEFAULT_AVATAR,
          cover_url: existingProfile?.cover_url || DEFAULT_COVER,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      }

      return { success: true };
    } catch (error: any) {
      console.error("[WP Auth Error]", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUsername = async (newUsername: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utente non autenticato");
      const { error } = await supabase.from('profiles').update({ username: newUsername }).eq('id', user.id);
      if (error) throw error;
      showSuccess("Username aggiornato!");
      return true;
    } catch (error: any) {
      showError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { loginWithWp, updateUsername, isLoading };
};