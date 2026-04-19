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
      const isEmail = usernameOrEmail.includes('@');
      let finalEmail = usernameOrEmail;

      // 1. Se è un'email, proviamo il login DIRETTO (veloce)
      if (isEmail) {
        const { data: initialAuth, error: initialError } = await supabase.auth.signInWithPassword({
          email: usernameOrEmail,
          password: password,
        });

        if (!initialError) {
          await updateProfile(initialAuth.user, usernameOrEmail);
          return { success: true };
        }
      }

      // 2. Se è uno username o se il login diretto è fallito (password cambiata)
      console.log("[Auth] Avvio sincronizzazione con WordPress...");
      
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

      // 3. Login finale con l'email ottenuta
      const { data: finalAuth, error: finalError } = await supabase.auth.signInWithPassword({
        email: syncData.email,
        password: password,
      });

      if (finalError) throw finalError;
      await updateProfile(finalAuth.user, usernameOrEmail);

      return { success: true };
    } catch (error: any) {
      console.error("[WP Auth Error]", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (user: any, inputName: string) => {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('username, avatar_url, cover_url')
      .eq('id', user.id)
      .maybeSingle();

    await supabase.from('profiles').upsert({
      id: user.id,
      username: existingProfile?.username || (inputName.includes('@') ? inputName.split('@')[0] : inputName),
      avatar_url: existingProfile?.avatar_url || DEFAULT_AVATAR,
      cover_url: existingProfile?.cover_url || DEFAULT_COVER,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
  };

  return { loginWithWp, isLoading };
};