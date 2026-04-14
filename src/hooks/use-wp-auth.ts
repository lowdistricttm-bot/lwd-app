"use client";

import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

const WP_URL = "https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth";

export const useWpAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithWp = async (usernameInput: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("[Auth] Sincronizzazione con Low District in corso...");
      
      const response = await fetch(WP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Credenziali non valide sul sito ufficiale");
      }

      // Estrazione dati reali dal sito (Simple JWT Login structure)
      const jwt = data.jwt || (data.data && data.data.jwt);
      const userEmail = data.user_email || (usernameInput.includes('@') ? usernameInput : `${usernameInput}@lowdistrict.it`);
      
      // Recuperiamo l'username ufficiale dal sito (user_login o user_nicename)
      const officialUsername = data.user_login || data.user_nicename || usernameInput;
      const displayName = data.user_display_name || officialUsername;
      
      if (jwt) {
        localStorage.setItem('wp-jwt', jwt);
        localStorage.setItem('wp-user', JSON.stringify(data));
      }

      // 1. Accesso/Registrazione su Supabase
      let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: password,
      });

      // Se l'utente non esiste ancora nell'app, lo creiamo
      if (authError && (authError.message.includes("Invalid login credentials") || authError.status === 400)) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: userEmail,
          password: password,
          options: { 
            data: { 
              username: officialUsername,
              full_name: displayName
            } 
          }
        });
        
        if (!signUpError) {
          const retry = await supabase.auth.signInWithPassword({ email: userEmail, password: password });
          authData = retry.data;
          authError = retry.error;
        }
      }

      // 2. Sincronizzazione forzata del Profilo con l'username del sito
      if (authData?.user) {
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const { error: upsertError } = await supabase.from('profiles').upsert({
          id: authData.user.id,
          username: officialUsername, // Usiamo l'username ufficiale del sito
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString()
        });
        
        if (upsertError) console.error("[Auth] Errore upsert profilo:", upsertError.message);
        else console.log("[Auth] Profilo sincronizzato con username:", officialUsername);
      }

      return { success: true, user: data };
    } catch (error: any) {
      console.error("[Auth] Errore critico:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { loginWithWp, isLoading };
};