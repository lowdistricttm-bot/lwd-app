"use client";

import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';

const WP_AUTH_URL = "https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth";

const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const useWpAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithWp = async (usernameOrEmail: string, password: string) => {
    setIsLoading(true);
    try {
      // 1. Autenticazione su WordPress
      const response = await fetch(WP_AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameOrEmail, password }),
      });

      const rawData = await response.json();
      if (!response.ok) throw new Error(rawData.message || "Credenziali non valide.");

      const data = rawData.data || rawData;
      const jwt = data.jwt;
      const decoded = decodeJwt(jwt);
      
      const wpId = decoded?.id?.toString() || data.user_id?.toString();
      const realEmail = decoded?.email || data.user_email || data.email;
      const wpUsername = decoded?.username || data.user_login || usernameOrEmail;

      if (!realEmail || !wpId) throw new Error("Dati incompleti da WordPress.");

      localStorage.setItem('wp-jwt', jwt);

      // 2. Login su Supabase
      let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: realEmail,
        password: password,
      });

      // 3. Se l'utente non esiste (perché abbiamo resettato il DB), lo creiamo
      if (authError && (authError.status === 400 || authError.status === 422)) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: realEmail,
          password: password,
          options: { data: { username: wpUsername } }
        });
        
        if (!signUpError) {
          const retry = await supabase.auth.signInWithPassword({ email: realEmail, password: password });
          authData = retry.data;
          authError = retry.error;
        } else {
          throw signUpError;
        }
      }

      if (authError) throw authError;

      // 4. Creazione/Aggiornamento Profilo
      if (authData?.user) {
        await supabase.from('profiles').upsert({
          id: authData.user.id,
          username: wpUsername,
          wp_id: wpId,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      }

      return { success: true };
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
      const { error } = await supabase.from('profiles').update({ username: newUsername }).eq('id', user.id);
      if (error) throw error;
      showSuccess("Username aggiornato!");
      return true;
    } catch (error: any) {
      showError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { loginWithWp, updateUsername, isLoading };
};