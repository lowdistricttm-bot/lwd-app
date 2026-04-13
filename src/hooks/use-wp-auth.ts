"use client";

import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

const WP_URL = "https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth";

export const useWpAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithWp = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(WP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username,
          password: password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Credenziali WordPress non valide");
      }

      const token = data.jwt || data.token || data.data?.jwt;
      const userEmail = data.user_email || (username.includes('@') ? username : `${username}@lowdistrict.it`);

      // 1. Prova il login
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: password,
      });

      // 2. Se l'utente non esiste, crealo (verrà auto-confermato dal trigger SQL)
      if (authError && authError.message.includes("Invalid login credentials")) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: userEmail,
          password: password,
          options: {
            data: {
              username: username,
              wp_token: token
            }
          }
        });
        
        if (signUpError) {
          if (signUpError.message.includes("Email provider is disabled")) {
            throw new Error("DEVI ABILITARE IL PROVIDER EMAIL: Vai in Supabase -> Authentication -> Providers -> Email e attiva l'interruttore.");
          }
          throw signUpError;
        }

        // Dopo il signup, riprova il login immediatamente
        const { error: retryError } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password: password,
        });
        
        if (retryError) throw retryError;
      } else if (authError) {
        throw authError;
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