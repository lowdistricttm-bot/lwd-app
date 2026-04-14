"use client";

import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

const WP_URL = "https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth";

export const useWpAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithWp = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("[Auth] Tentativo di sincronizzazione con Low District...");
      
      const response = await fetch(WP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log("[Auth] Risposta ricevuta dal server:", data);

      if (!response.ok) {
        throw new Error(data.message || "Credenziali non valide sul sito ufficiale");
      }

      // Estrazione dati utente dal sito WP
      const jwt = data.jwt || (data.data && data.data.jwt);
      const userEmail = data.user_email || (username.includes('@') ? username : `${username}@lowdistrict.it`);
      
      // Tentiamo di estrarre nome e cognome (spesso presenti in user_display_name o meta)
      const displayName = data.user_display_name || username;
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      if (jwt) {
        localStorage.setItem('wp-jwt', jwt);
        localStorage.setItem('wp-user', JSON.stringify(data));
      }

      // 1. Tentativo di Login su Supabase
      let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: password,
      });

      // 2. Se l'utente non esiste nell'app, lo creiamo con i dati del sito
      if (authError && (authError.message.includes("Invalid login credentials") || authError.status === 400)) {
        console.log("[Auth] Creazione profilo App con dati sincronizzati...");
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: userEmail,
          password: password,
          options: { 
            data: { 
              username: username,
              first_name: firstName,
              last_name: lastName,
              full_name: displayName
            } 
          }
        });
        
        if (!signUpError) {
          // Login automatico dopo registrazione
          const retry = await supabase.auth.signInWithPassword({ email: userEmail, password: password });
          authData = retry.data;
          authError = retry.error;
        } else {
          authError = signUpError;
        }
      }

      // 3. Sincronizzazione forzata del profilo (per utenti già esistenti)
      if (authData?.user) {
        await supabase.from('profiles').upsert({
          id: authData.user.id,
          username: username,
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString()
        });
      }

      if (authError) throw authError;

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