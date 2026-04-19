// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    // Pulizia input per evitare spazi accidentali
    const username = body.username?.trim()
    const password = body.password

    if (!username || !password) {
      throw new Error("Username e password sono obbligatori");
    }

    console.log(`[sync-wp-auth] Tentativo di sincronizzazione per: ${username}`);

    // 1. Autenticazione su WordPress
    const wpRes = await fetch("https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    const wpData = await wpRes.json()
    
    if (!wpRes.ok) {
      // Usiamo console.warn invece di error per i fallimenti di login "normali" (credenziali errate)
      // così non sporchiamo i log critici del server.
      console.warn(`[sync-wp-auth] WP Auth negata per ${username}:`, wpData.message || wpData.data?.message);
      return new Response(JSON.stringify({ 
        error: "Credenziali Low District non valide. Verifica username e password sul sito ufficiale.",
        details: wpData.data?.message 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // 2. Estrazione Email dal JWT o dalla risposta
    let email = null;
    const data = wpData.data || wpData;
    const jwt = data.jwt || data.token;

    email = data.user_email || data.email || (data.user ? (data.user.user_email || data.user.email) : null);

    if (!email && jwt) {
      try {
        const base64Url = jwt.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        email = payload.email || payload.user_email || (payload.user ? payload.user.email : null);
      } catch (e) {
        console.error("[sync-wp-auth] Errore decodifica JWT:", e.message);
      }
    }

    if (!email && username.includes('@')) {
      email = username;
    }

    if (!email) {
      console.error(`[sync-wp-auth] Email non trovata per l'utente ${username}`);
      throw new Error("Impossibile recuperare l'email. Prova ad accedere usando l'indirizzo EMAIL invece dello username.");
    }

    // 3. Sincronizzazione su Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Cerchiamo l'utente per email
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (existingUser) {
      console.log(`[sync-wp-auth] Utente esistente trovato (${email}). Aggiornamento password...`);
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { 
        password: password, 
        email_confirm: true 
      })
    } else {
      console.log(`[sync-wp-auth] Nuovo utente rilevato (${email}). Creazione account Supabase...`);
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { 
          username: username.includes('@') ? username.split('@')[0] : username,
          synced_at: new Date().toISOString()
        }
      })
    }

    console.log(`[sync-wp-auth] Sincronizzazione completata con successo per ${email}`);

    return new Response(JSON.stringify({ success: true, email }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("[sync-wp-auth] Errore critico:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})