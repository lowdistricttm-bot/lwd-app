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

      // 3. Se l'utente non esiste su Supabase, lo creiamo
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

      // 4. LOGICA DI RICONNESSIONE PROFILO (MIGRAZIONE)
      if (authData?.user) {
        const newUserId = authData.user.id;

        // Controlliamo se esiste già un profilo con questo ID WordPress
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('wp_id', wpId)
          .maybeSingle();

        if (existingProfile && existingProfile.id !== newUserId) {
          console.log("[Auth] Trovato vecchio profilo, avvio migrazione dati...");
          
          // Se esiste un profilo "nuovo" vuoto appena creato dal trigger, lo eliminiamo per far spazio a quello vecchio
          await supabase.from('profiles').delete().eq('id', newUserId);

          // Aggiorniamo il vecchio profilo con il nuovo ID di autenticazione
          // Nota: Questo richiede che le tabelle collegate (posts, vehicles) abbiano ON UPDATE CASCADE 
          // o che vengano aggiornate manualmente. Per ora aggiorniamo il profilo.
          const { error: migrateError } = await supabase
            .from('profiles')
            .update({ id: newUserId, updated_at: new Date().toISOString() })
            .eq('wp_id', wpId);

          if (migrateError) {
            // Se l'update fallisce (es. vincoli FK), facciamo un upsert standard
            await supabase.from('profiles').upsert({
              id: newUserId,
              username: wpUsername,
              wp_id: wpId,
              updated_at: new Date().toISOString()
            });
          }
        } else {
          // Upsert normale se è tutto sincronizzato o se è un nuovo utente
          await supabase.from('profiles').upsert({
            id: newUserId,
            username: wpUsername,
            wp_id: wpId,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
        }
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