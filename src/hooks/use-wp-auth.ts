"use client";

import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';

const WP_AUTH_URL = "https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth";
const WP_USER_URL = "https://www.lowdistrict.it/wp-json/wp/v2/users/me";

export const useWpAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithWp = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(WP_AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Credenziali non valide sul sito ufficiale");
      }

      const jwt = data.jwt || (data.data && data.data.jwt);
      
      if (jwt) {
        localStorage.setItem('wp-jwt', jwt);
        localStorage.setItem('wp-user', JSON.stringify(data));
      }

      const userEmail = data.user_email || (username.includes('@') ? username : `${username}@lowdistrict.it`);

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

      if (authData?.user) {
        await supabase.from('profiles').upsert({
          id: authData.user.id,
          username: username,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      }

      return { success: true, user: data };
    } catch (error: any) {
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

      // 1. Aggiorniamo PRIMA Supabase (il nostro District Username)
      const { error: sbError } = await supabase
        .from('profiles')
        .update({ 
          username: newUsername,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (sbError) throw sbError;

      // 2. Proviamo a sincronizzare con WordPress (Nickname)
      const token = localStorage.getItem('wp-jwt');
      if (token) {
        try {
          await fetch(WP_USER_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              nickname: newUsername,
              display_name: newUsername
            })
          });
          console.log("[WP Sync] Nickname aggiornato sul sito");
        } catch (wpErr) {
          console.warn("[WP Sync] Impossibile aggiornare il sito, ma il profilo app è salvo.");
        }
      }

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