"use client";

import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

// Endpoint specifico per il plugin "Simple JWT Login"
const WP_URL = "https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth";

export const useWpAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithWp = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Il plugin Simple JWT Login solitamente accetta username o email nel campo 'email' o 'username'
      // Proviamo a inviare entrambi per massima compatibilità
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
        if (response.status === 404) {
          throw new Error("L'endpoint di Simple JWT Login non è attivo. Verifica nelle impostazioni del plugin su WordPress che la REST API sia abilitata.");
        }
        throw new Error(data.message || data.error?.message || "Credenziali non valide");
      }

      // Se il login ha successo, il plugin restituisce un token
      const token = data.jwt || data.token || data.data?.jwt;
      if (!token) throw new Error("Token non ricevuto dal server");

      // Sincronizzazione con Supabase
      const userEmail = data.user_email || (username.includes('@') ? username : `${username}@lowdistrict.it`);

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: password,
      });

      if (authError) {
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