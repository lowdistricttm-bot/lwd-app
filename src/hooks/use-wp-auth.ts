"use client";

import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';

const WP_AUTH_URL = "https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth";
const WP_USER_URL = "https://www.lowdistrict.it/wp-json/wp/v2/users/me";

export const useWpAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithWp = async (usernameOrEmail: string, password: string) => {
    setIsLoading(true);
    try {
      // 1. Autenticazione su WordPress (accetta sia username che email nativamente)
      const response = await fetch(WP_AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameOrEmail, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Credenziali non valide sul sito ufficiale");
      }

      // Recuperiamo i dati reali dal payload di WordPress
      const jwt = data.jwt || (data.data && data.data.jwt);
      const realEmail = data.user_email;
      // WordPress restituisce spesso lo username nel campo user_login o user_nicename
      const realUsername = data.user_login || data.user_nicename || (usernameOrEmail.includes('@') ? usernameOrEmail.split('@')[0] : usernameOrEmail);
      
      if (jwt) {
        localStorage.setItem('wp-jwt', jwt);
        localStorage.setItem('wp-user', JSON.stringify(data));
      }

      // 2. Tentativo di login su Supabase usando l'email reale restituita da WP
      let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: realEmail,
        password: password,
      });

      // 3. Se l'utente non esiste su Supabase, lo creiamo al volo
      if (authError && (authError.message.includes("Invalid login credentials") || authError.status === 400)) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: realEmail,
          password: password,
          options: { 
            data: { 
              username: realUsername,
              full_name: data.user_display_name || realUsername
            } 
          }
        });
        
        // Se la registrazione ha successo o l'email deve essere confermata (ma noi abbiamo l'autoconfirm)
        if (!signUpError || signUpError.message.includes("Email not confirmed")) {
          // Piccolo delay per permettere ai trigger del DB di finire
          await new Promise(resolve => setTimeout(resolve, 1000));
          const retry = await supabase.auth.signInWithPassword({ email: realEmail, password: password });
          authError = retry.error;
          authData = retry.data;
        } else {
          throw signUpError;
        }
      }

      // 4. Sincronizziamo il profilo con lo username ufficiale (non l'email inserita)
      if (authData?.user) {
        await supabase.from('profiles').upsert({
          id: authData.user.id,
          username: realUsername,
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
        } catch (wpErr) {
          console.warn("[WP Sync] Impossibile aggiornare il sito");
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