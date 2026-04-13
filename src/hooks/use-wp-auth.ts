"use client";

import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

const WP_URL = "https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth";

export const useWpAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithWp = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("[Auth] Sincronizzazione con Low District in corso...");
      
      // 1. Chiediamo il permesso al sito ufficiale (WordPress)
      const response = await fetch(WP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Credenziali non valide sul sito ufficiale");
      }

      // 2. SALVIAMO LA CHIAVE (JWT) - Questo ti rende "online" sul sito ufficiale
      if (data.jwt) {
        localStorage.setItem('wp-jwt', data.jwt);
        localStorage.setItem('wp-user', JSON.stringify(data));
        console.log("[Auth] Chiave sincronizzata con successo.");
      }

      const userEmail = data.user_email || (username.includes('@') ? username : `${username}@lowdistrict.it`);

      // 3. Accediamo anche all'App (Supabase) per le funzioni social extra
      let {data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: password,
      });

      // Se l'utente non esiste su Supabase, lo creiamo al volo
      if (authError && (authError.message.includes("Invalid login credentials") || authError.status === 400)) {
        console.log("[Auth] Primo accesso all'App, creazione profilo...");
        
        const { error: signUpError } = await supabase.auth.signUp({
          email: userEmail,
          password: password,
          options: { data: { username } }
        });
        
        if (signUpError && !signUpError.message.includes("Email not confirmed")) {
          throw signUpError;
        }

        // Piccolo delay per permettere a Supabase di registrare l'utente
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
      console.error("[Auth] Errore sincronizzazione:", error.message || error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { loginWithWp, isLoading };
};