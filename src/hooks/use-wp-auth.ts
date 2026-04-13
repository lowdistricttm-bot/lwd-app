"use client";

import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

const WP_URL = "https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth";

export const useWpAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithWp = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("[Auth] Avvio verifica su WordPress per:", username);
      
      const response = await fetch(WP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("[Auth] Errore WordPress:", data);
        throw new Error(data.message || "Credenziali non valide sul sito ufficiale");
      }

      // Recupero flessibile del token (può essere in data.jwt o direttamente in jwt)
      const token = data.jwt || (data.data && data.data.jwt);
      
      if (token) {
        console.log("[Auth] Token WordPress ricevuto e salvato.");
        localStorage.setItem('wp-jwt', token);
      } else {
        console.warn("[Auth] Nessun token JWT ricevuto da WordPress.");
      }

      const userEmail = data.user_email || (data.data && data.data.user_email) || (username.includes('@') ? username : `${username}@lowdistrict.it`);
      
      // Tentativo di Login su Supabase
      let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: password,
      });

      // Se l'utente non esiste su Supabase, lo creiamo
      if (authError && (authError.message.includes("Invalid login credentials") || authError.status === 400)) {
        console.log("[Auth] Utente non trovato su App, creazione in corso...");
        
        const { error: signUpError } = await supabase.auth.signUp({
          email: userEmail,
          password: password,
          options: { data: { username } }
        });
        
        if (signUpError && !signUpError.message.includes("Email not confirmed")) {
          throw signUpError;
        }

        await new Promise(resolve => setTimeout(resolve, 1500));

        const retry = await supabase.auth.signInWithPassword({
          email: userEmail,
          password: password,
        });
        authError = retry.error;
        authData = retry.data;
      }

      if (authError) throw authError;

      return { success: true, user: data };
    } catch (error: any) {
      console.error("[Auth] Errore catturato:", error.message || error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { loginWithWp, isLoading };
};