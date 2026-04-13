"use client";

import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

// Proviamo l'endpoint più comune per i plugin JWT su WordPress
const WP_URL = "https://www.lowdistrict.it/wp-json/jwt-auth/v1/token";

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
        // Se l'errore è 404, probabilmente l'endpoint è ancora sbagliato
        if (response.status === 404) {
          throw new Error("Endpoint di login non trovato sul server. Verifica la configurazione del plugin JWT.");
        }
        throw new Error(data.message || "Credenziali non valide");
      }

      // Sincronizzazione con Supabase
      // Usiamo l'email restituita da WP per creare/accedere alla sessione locale
      const userEmail = data.user_email || `${username}@lowdistrict.it`;

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: password,
      });

      if (authError) {
        // Se l'utente non esiste su Supabase, lo creiamo al volo
        const { error: signUpError } = await supabase.auth.signUp({
          email: userEmail,
          password: password,
          options: {
            data: {
              username: data.user_display_name || username,
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