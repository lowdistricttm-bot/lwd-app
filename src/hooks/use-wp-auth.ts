"use client";

import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

const WP_URL = "https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth";

export const useWpAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithWp = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // 1. Verifichiamo le credenziali sul sito ufficiale (WordPress)
      const response = await fetch(WP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Credenziali non valide sul sito ufficiale");
      }

      const userEmail = data.user_email || (username.includes('@') ? username : `${username}@lowdistrict.it`);

      // 2. Accediamo o creiamo l'account "mirror" nell'app
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: password,
      });

      if (authError) {
        // Se l'account non esiste ancora nell'app, lo creiamo al volo
        if (authError.message.includes("Invalid login credentials")) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: userEmail,
            password: password,
            options: { data: { username } }
          });
          
          if (signUpError) throw signUpError;

          // Riprova il login dopo la creazione automatica
          const { error: retryError } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: password,
          });
          
          if (retryError) throw retryError;
        } else {
          throw authError;
        }
      }

      return { success: true, user: data };
    } catch (error: any) {
      console.error("Auth Sync Error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { loginWithWp, isLoading };
};