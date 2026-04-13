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

      // 2. Se l'utente non esiste su Supabase, crealo
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
          if (signUpError.status === 429) {
            throw new Error("Supabase sta limitando l'invio di email. Disabilita 'Confirm Email' nel pannello Supabase o attendi qualche minuto.");
          }
          throw signUpError;
        }
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