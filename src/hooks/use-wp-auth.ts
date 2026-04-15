"use client";

import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';

const WP_AUTH_URL = "https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth";

// Helper per decodificare il payload di un JWT senza librerie esterne
const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("[JWT Decode] Errore decodifica:", e);
    return null;
  }
};

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
        throw new Error(rawData.message || "Credenziali non valide sul sito ufficiale. Usa lo Username (es. mario.rossi) invece dell'email.");
      }

      // Gestione struttura dati flessibile (WordPress può rispondere in vari modi)
      const data = rawData.data || rawData;
      const jwt = data.jwt;
      
      if (!jwt) {
        throw new Error("Token non ricevuto da WordPress.");
      }

      // 2. Recupero Email (Strategia Multi-livello)
      let realEmail = data.user_email || data.email;
      
      // Se l'email non è nel corpo della risposta, la estraiamo dal JWT
      if (!realEmail) {
        const decoded = decodeJwt(jwt);
        console.log("[WP Auth] Payload JWT decodificato:", decoded);
        realEmail = decoded?.email || decoded?.user_email;
      }

      // Fallback estremo: se l'input era un'email, usiamo quella
      if (!realEmail && usernameOrEmail.includes('@')) {
        realEmail = usernameOrEmail;
      }

      if (!realEmail) {
        console.error("[WP Auth] Email non trovata nemmeno nel JWT:", data);
        throw new Error("Impossibile recuperare l'email dal profilo WordPress.");
      }

      const wpUsername = data.user_login || data.user_nicename || decodeJwt(jwt)?.username || (usernameOrEmail.includes('@') ? usernameOrEmail.split('@')[0] : usernameOrEmail);
      
      localStorage.setItem('wp-jwt', jwt);
      localStorage.setItem('wp-user', JSON.stringify(data));

      // 3. Login su Supabase
      let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: realEmail,
        password: password,
      });

      // 4. Gestione nuovo utente o errore credenziali
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

      // 5. Sincronizzazione Profilo
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