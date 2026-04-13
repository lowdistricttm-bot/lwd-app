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

      // 1. Tentativo di Login
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: password,
      });

      if (authError) {
        // Se l'utente non esiste, lo creiamo
        if (authError.message.includes("Invalid login credentials")) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: userEmail,
            password: password,
            options: {
              data: { username, wp_token: token }
            }
          });
          
          if (signUpError) throw signUpError;

          // Dopo il signup, riproviamo il login (il trigger SQL dovrebbe averlo già confermato)
          const { error: retryError } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: password,
          });
          
          if (retryError) throw retryError;
        } 
        // Se l'email non è confermata nonostante il trigger, diamo un errore chiaro
        else if (authError.message.includes("Email not confirmed")) {
          throw new Error("L'account è in fase di attivazione. Riprova tra 5 secondi.");
        }
        else {
          throw authError;
        }
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