"use client";

import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

// Proviamo l'endpoint standard di JWT Simple
const WP_URL = "https://www.lowdistrict.it/wp-json/jwt-simple/v1/token";

export const useWpAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithWp = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(WP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Credenziali non valide");
      }

      // Sincronizzazione con Supabase per gestire la sessione nell'app
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.user_email,
        password: password,
      });

      if (authError) {
        await supabase.auth.signUp({
          email: data.user_email,
          password: password,
          options: {
            data: {
              username: data.user_display_name,
              wp_id: data.user_id
            }
          }
        });
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