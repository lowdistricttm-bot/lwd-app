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

      const userEmail = data.user_email || (username.includes('@') ? username : `${username}@lowdistrict.it`);
      console.log("[Auth] WordPress OK. Email:", userEmail);

      // Tentativo di Login
      let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: password,
      });

      // Se l'utente non esiste, lo creiamo
      if (authError && (authError.message.includes("Invalid login credentials") || authError.status === 400)) {
        console.log("[Auth] Utente non trovato su App, creazione in corso...");
        
        const { error: signUpError } = await supabase.auth.signUp({
          email: userEmail,
          password: password,
          options: { data: { username } }
        });
        
        if (signUpError && !signUpError.message.includes("Email not confirmed")) {
          console.error("[Auth] Errore SignUp:", signUpError);
          throw signUpError;
        }

        console.log("[Auth] SignUp completato, attesa sincronizzazione...");
        
        // Aspettiamo 1.5 secondi per permettere al trigger SQL di confermare l'utente
        await new Promise(resolve => setTimeout(resolve, 1500));

        const retry = await supabase.auth.signInWithPassword({
          email: userEmail,
          password: password,
        });
        authError = retry.error;
        authData = retry.data;
      }

      if (authError) {
        console.error("[Auth] Errore finale Supabase:", {
          message: authError.message,
          status: authError.status,
          code: (authError as any).code
        });
        
        if (authError.message.includes("Email not confirmed")) {
          throw new Error("Sincronizzazione in corso. Clicca di nuovo su Accedi tra un istante.");
        }
        throw authError;
      }

      console.log("[Auth] Login App completato con successo");
      return { success: true, user: data };
    } catch (error: any) {
      // Logghiamo l'errore in modo che sia leggibile anche se è un oggetto complesso
      console.error("[Auth] Errore catturato:", error.message || error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { loginWithWp, isLoading };
};