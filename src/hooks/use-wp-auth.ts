"use client";

import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';

const DEFAULT_AVATAR = "https://www.lowdistrict.it/wp-content/uploads/immagine-profilo-sito-new-scaled.jpg";
const DEFAULT_COVER = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop&sat=-100";

export const useWpAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithWp = async (usernameOrEmail: string, password: string) => {
    setIsLoading(true);
    try {
      let authData = null;
      let finalEmail = usernameOrEmail;

      // 1. Se l'utente inserisce un'email, proviamo il login DIRETTO (veloce)
      const isEmail = usernameOrEmail.includes('@');
      
      if (isEmail) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: usernameOrEmail,
          password: password,
        });
        
        if (!error) {
          authData = data;
        }
      }

      // 2. Se il login diretto fallisce (password cambiata) o se è stato usato uno username
      if (!authData) {
        console.log("[Auth] Login diretto non possibile o fallito, avvio sincronizzazione...");
        
        const response = await fetch('https://cxjqbxhhslxqpkfcwqhr.supabase.co/functions/v1/sync-wp-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4anFieGhoc2x4cXBrZmN3cWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMDQyMjcsImV4cCI6MjA5MTU4MDIyN30.O6UODSJpjjgcffUR8l4FDB5B28Qn1BdfQ3Cf2nprD88"
          },
          body: JSON.stringify({ username: usernameOrEmail, password }),
        });

        const syncData = await response.json();
        if (!response.ok) throw new Error(syncData.error || "Credenziali non valide");

        // 3. Riprova il login con l'email reale ottenuta dalla sincronizzazione
        const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
          email: syncData.email,
          password: password,
        });

        if (retryError) throw retryError;
        authData = retryData;
        finalEmail = syncData.email;
      }

      // 4. Aggiornamento Profilo
      if (authData?.user) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('avatar_url, cover_url, username')
          .eq('id', authData.user.id)
          .maybeSingle();

        await supabase.from('profiles').upsert({
          id: authData.user.id,
          username: existingProfile?.username || (isEmail ? usernameOrEmail.split('@')[0] : usernameOrEmail),
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

  return { loginWithWp, isLoading };
};