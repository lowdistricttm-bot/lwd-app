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

      // 1. Prova il login su Supabase
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: password,
      });

      // 2. Gestione errori specifici di Supabase
      if (authError) {
        // Errore: Provider disabilitato
        if (authError.message.includes("Email provider is disabled")) {
          throw new Error("Il provider Email è disabilitato su Supabase. Vai in Auth -> Providers e abilita 'Email'.");
        }

        // Errore: Email non confermata
        if (authError.message.includes("Email not confirmed")) {
          throw new Error("Email non confermata. Controlla la tua posta o disabilita 'Confirm Email' in Supabase.");
        }

        // Errore: Utente non esiste (proviamo a crearlo)
        if (authError.message.includes("Invalid login credentials")) {
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
              throw new Error("Impossibile creare l'account: abilita il provider 'Email' nella dashboard di Supabase.");
            }
            throw signUpError;
          }

          throw new Error("Account creato! Se non riesci ad accedere, controlla l'email o disabilita la conferma obbligatoria.");
        }

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