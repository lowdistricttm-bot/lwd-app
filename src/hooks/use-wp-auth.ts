"use client";

import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';

const DEFAULT_AVATAR = "https://www.lowdistrict.it/wp-content/uploads/immagine-profilo-sito-new-scaled.jpg";
const DEFAULT_COVER = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop&sat=-100";

export const useWpAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithWp = async (usernameOrEmail: string, password: string) => {
    // Pulizia input
    const cleanUsername = usernameOrEmail.trim();
    const cleanPassword = password; // Non facciamo il trim della password perché gli spazi potrebbero farne parte

    setIsLoading(true);
    try {
      const isEmail = cleanUsername.includes('@');
      
      // 1. Se è un'email, proviamo il login DIRETTO su Supabase (molto più veloce)
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

      // 2. Se è uno username o se il login diretto è fallito (es. password cambiata su WP)
      console.log("[Auth] Sincronizzazione con WordPress in corso...");
      
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

      // 3. Login finale su Supabase con l'email ottenuta dalla sincronizzazione
      const { data: finalAuth, error: finalError } = await supabase.auth.signInWithPassword({
        email: syncData.email,
        password: cleanPassword,
      });

      if (finalError) throw finalError;
      await updateProfile(finalAuth.user, cleanUsername);

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

    // Aggiorniamo il profilo locale assicurandoci di non sovrascrivere dati esistenti se non necessario
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