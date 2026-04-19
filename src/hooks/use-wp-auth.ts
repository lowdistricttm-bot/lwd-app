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
    const cleanPassword = password;

    setIsLoading(true);
    try {
      const isEmail = cleanUsername.includes('@');
      
      // 1. Tentativo login diretto
      if (isEmail) {
        const { data: initialAuth, error: initialError } = await supabase.auth.signInWithPassword({
          email: cleanUsername,
          password: cleanPassword,
        });

        if (!initialError) {
          await updateProfile(initialAuth.user, cleanUsername);
          return { success: true };
        }
      }

      // 2. Sincronizzazione con WordPress (Edge Function)
      console.log("[Auth] Sincronizzazione con WordPress...");
      
      const response = await fetch('https://cxjqbxhhslxqpkfcwqhr.supabase.co/functions/v1/sync-wp-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4anFieGhoc2x4cXBrZmN3cWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMDQyMjcsImV4cCI6MjA5MTU4MDIyN30.O6UODSJpjjgcffUR8l4FDB5B28Qn1BdfQ3Cf2nprD88"
        },
        body: JSON.stringify({ username: cleanUsername, password: cleanPassword }),
      });

      const syncData = await response.json();
      if (!response.ok) throw new Error(syncData.error || "Credenziali non valide");

      // 3. Login finale su Supabase
      const { data: finalAuth, error: finalError } = await supabase.auth.signInWithPassword({
        email: syncData.email,
        password: cleanPassword,
      });

      if (finalError) throw finalError;
      
      // Passiamo anche il wpId ricevuto dalla funzione
      await updateProfile(finalAuth.user, cleanUsername, syncData.wpId);

      return { success: true };
    } catch (error: any) {
      console.error("[WP Auth Error]", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (user: any, inputName: string, wpId?: string) => {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('username, avatar_url, cover_url, wp_id')
      .eq('id', user.id)
      .maybeSingle();

    // Determiniamo il nuovo username: 
    // Se l'utente ha inserito uno username (non email) nel login, usiamo quello per forzare l'aggiornamento
    const isEmailInput = inputName.includes('@');
    const newUsername = isEmailInput ? (existingProfile?.username || inputName.split('@')[0]) : inputName;

    console.log(`[Auth] Aggiornamento profilo per ${user.id}. Username: ${newUsername}, WP ID: ${wpId || existingProfile?.wp_id}`);

    await supabase.from('profiles').upsert({
      id: user.id,
      username: newUsername,
      wp_id: wpId || existingProfile?.wp_id,
      avatar_url: existingProfile?.avatar_url || DEFAULT_AVATAR,
      cover_url: existingProfile?.cover_url || DEFAULT_COVER,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
  };

  return { loginWithWp, isLoading };
};