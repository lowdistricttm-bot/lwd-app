"use client";

import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';

const WP_AUTH_URL = "https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth";

export const useWpAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithWp = async (usernameOrEmail: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("[WP Auth] Tentativo login per:", usernameOrEmail);
      
      // 1. Autenticazione su WordPress
      const response = await fetch(WP_AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameOrEmail, password }),
      });

      const rawData = await response.json();

      if (!response.ok) {
        console.error("[WP Auth] Errore risposta WordPress:", rawData);
        throw new Error(rawData.message || "Credenziali non valide sul sito ufficiale. Nota: prova a usare lo Username se l'email non funziona.");
      }

      // Gestione struttura dati flessibile
      const data = rawData.data || rawData;
      const jwt = data.jwt;
      
      // Tentiamo di estrarre l'email da ogni possibile posizione
      let realEmail = data.user_email || data.email;
      if (!realEmail && data.user) {
        realEmail = data.user.user_email || data.user.email;
      }

      // Fallback 1: Se l'utente ha inserito un'email nel campo login, usiamo quella
      if (!realEmail && usernameOrEmail.includes('@')) {
        realEmail = usernameOrEmail;
      }

      // Fallback 2: Se abbiamo il JWT ma ancora niente email, interroghiamo il profilo WP
      if (!realEmail && jwt) {
        try {
          const meRes = await fetch("https://www.lowdistrict.it/wp-json/wp/v2/users/me", {
            headers: { 'Authorization': `Bearer ${jwt}` }
          });
          if (meRes.ok) {
            const meData = await meRes.ok ? await meRes.json() : null;
            if (meData?.email) realEmail = meData.email;
          }
        } catch (e) {
          console.error("[WP Auth] Errore recupero email da /me:", e);
        }
      }
      
      const wpUsername = data.user_login || data.user_nicename || (usernameOrEmail.includes('@') ? usernameOrEmail.split('@')[0] : usernameOrEmail);
      
      if (!realEmail) {
        console.error("[WP Auth] Email non trovata nella risposta:", data);
        throw new Error("Impossibile recuperare l'email dal profilo WordPress. Assicurati che l'email sia pubblica o prova a loggarti con lo Username.");
      }

      if (jwt) {
        localStorage.setItem('wp-jwt', jwt);
        localStorage.setItem('wp-user', JSON.stringify(data));
      }

      // 2. Login su Supabase
      let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: realEmail,
        password: password,
      });

      // 3. Gestione nuovo utente o errore credenziali
      if (authError && (authError.message.includes("Invalid login credentials") || authError.status === 400 || authError.status === 422)) {
        console.log("[WP Auth] Utente non trovato su Supabase, procedo al SignUp...");
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: realEmail,
          password: password,
          options: { 
            data: { 
              username: wpUsername,
              full_name: data.user_display_name || wpUsername
            } 
          }
        });
        
        if (!signUpError || signUpError.message.includes("Email not confirmed")) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          const retry = await supabase.auth.signInWithPassword({ email: realEmail, password: password });
          authError = retry.error;
          authData = retry.data;
        } else {
          throw signUpError;
        }
      }

      if (authError) throw authError;

      // 4. Sincronizzazione Profilo
      if (authData?.user) {
        await supabase.from('profiles').upsert({
          id: authData.user.id,
          username: wpUsername,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      }

      return { success: true, user: data };
    } catch (error: any) {
      console.error("[WP Auth Error]", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUsername = async (newUsername: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utente non autenticato");

      const { error: sbError } = await supabase
        .from('profiles')
        .update({ 
          username: newUsername,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (sbError) throw sbError;

      showSuccess("District Username aggiornato!");
      return true;
    } catch (error: any) {
      showError(error.message || "Errore durante l'aggiornamento");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { loginWithWp, updateUsername, isLoading };
};