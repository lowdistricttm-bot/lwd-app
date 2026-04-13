"use client";

import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

const WP_URL = "https://www.lowdistrict.it/wp-json/jwt-auth/v1/token";

export const useWpAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithWp = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // 1. Tenta il login su WordPress
      const response = await fetch(WP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Credenziali WordPress non valide");
      }

      // 2. Se il login WP ha successo, creiamo/logghiamo l'utente su Supabase
      // Usiamo l'email di WP per creare un account "ombra" su Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.user_email,
        password: password, // Nota: In produzione useremmo un sistema di link più complesso
      });

      // Se l'utente non esiste su Supabase, lo registriamo al volo
      if (authError) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: data.user_email,
          password: password,
          options: {
            data: {
              username: data.user_display_name,
              wp_id: data.user_id
            }
          }
        });
        if (signUpError) throw signUpError;
      }

      return { success: true, user: data };
    } catch (error: any) {
      console.error("WP Auth Error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { loginWithWp, isLoading };
};