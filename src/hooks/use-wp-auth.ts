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
      
      if (!response.ok) {
        throw new Error(data.message || "Credenziali non valide sul sito ufficiale");
      }

      // Estrazione dati utente dal sito
      const jwt = data.jwt || (data.data && data.data.jwt);
      const userEmail = data.user_email || (username.includes('@') ? username : `${username}@lowdistrict.it`);
      
      // Tentiamo di estrarre nome e cognome se disponibili nella risposta WP
      // Spesso WP restituisce display_name o user_nicename
      const displayName = data.user_display_name || data.user_nicename || username;
      
      // Salvataggio locale per BuddyPress
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
              username: username,
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

      // 2. Sincronizzazione immediata del Profilo con i dati del sito
      if (authData?.user) {
        // Dividiamo il display name in nome e cognome se possibile
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        await supabase.from('profiles').upsert({
          id: authData.user.id,
          username: username,
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString()
        });
        
        console.log("[Auth] Profilo sincronizzato con i dati del sito web.");
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