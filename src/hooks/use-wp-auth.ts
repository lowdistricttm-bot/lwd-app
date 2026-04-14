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

      const jwt = data.jwt || (data.data && data.data.jwt);
      
      if (jwt) {
        localStorage.setItem('wp-jwt', jwt);
        localStorage.setItem('wp-user', JSON.stringify(data));
      }

      const userEmail = data.user_email || (username.includes('@') ? username : `${username}@lowdistrict.it`);

      // Sincronizzazione con Supabase
      let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: password,
      });

      if (authError && (authError.message.includes("Invalid login credentials") || authError.status === 400)) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: userEmail,
          password: password,
          options: { data: { username } }
        });
        
        if (!signUpError || signUpError.message.includes("Email not confirmed")) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const retry = await supabase.auth.signInWithPassword({ email: userEmail, password: password });
          authError = retry.error;
          authData = retry.data;
        }
      }

      // Sincronizzazione forzata del profilo per garantire l'username aggiornato ovunque
      if (authData?.user) {
        await supabase.from('profiles').upsert({
          id: authData.user.id,
          username: username,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      }

      if (authError) console.error("[Auth] Errore Supabase:", authError.message);

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