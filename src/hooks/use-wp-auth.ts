"use client";

import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

const WP_URL = "https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth";

export const useWpAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithWp = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // 1. Verifica credenziali su WordPress
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

      // 2. Tentativo di Login su Supabase
      let { error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: password,
      });

      // 3. Se l'utente non esiste, lo creiamo
      if (authError && authError.message.includes("Invalid login credentials")) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: userEmail,
          password: password,
          options: { data: { username } }
        });
        
        if (signUpError) {
          // Se l'errore è 'email_not_confirmed' qui, significa che l'utente è stato creato ma è bloccato
          if (signUpError.message.includes("Email not confirmed")) {
             // Procediamo comunque, il trigger nel DB lo sbloccherà al prossimo tentativo
          } else {
            throw signUpError;
          }
        }

        // Riprova il login
        const retry = await supabase.auth.signInWithPassword({
          email: userEmail,
          password: password,
        });
        authError = retry.error;
      }

      // 4. Gestione finale errore conferma (Bypass visivo)
      if (authError && authError.message.includes("Email not confirmed")) {
        // Se arriviamo qui, il DB è pigro. Diamo un messaggio positivo perché l'utente è comunque creato.
        throw new Error("Sincronizzazione completata! Clicca di nuovo su Accedi per entrare.");
      } else if (authError) {
        throw authError;
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