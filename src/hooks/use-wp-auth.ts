"use client";

import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';

const DEFAULT_AVATAR = "https://www.lowdistrict.it/wp-content/uploads/immagine-profilo-sito-new-scaled.jpg";
const DEFAULT_COVER = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop&sat=-100";

export const useWpAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithWp = async (usernameOrEmail: string, password: string) => {
    const cleanUsername = usernameOrEmail.trim();
    setIsLoading(true);

    try {
      // 1. Chiamata alla Edge Function per sincronizzare i dati reali dal sito
      const response = await fetch('https://cxjqbxhhslxqpkfcwqhr.supabase.co/functions/v1/sync-wp-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4anFieGhoc2x4cXBrZmN3cWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMDQyMjcsImV4cCI6MjA5MTU4MDIyN30.O6UODSJpjjgcffUR8l4FDB5B28Qn1BdfQ3Cf2nprD88"
        },
        body: JSON.stringify({ username: cleanUsername, password }),
      });

      const syncData = await response.json();
      if (!response.ok) throw new Error(syncData.error || "Credenziali non valide");

      // 2. Login su Supabase
      const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
        email: syncData.email,
        password: password,
      });

      if (authError) throw authError;

      // 3. Aggiornamento FORZATO del profilo con i dati appena ricevuti dal sito
      await supabase.from('profiles').upsert({
        id: auth.user.id,
        username: syncData.username, // Usiamo il nome REALE che arriva dal sito
        avatar_url: syncData.avatar_url || DEFAULT_AVATAR,
        wp_id: syncData.wp_id?.toString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

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