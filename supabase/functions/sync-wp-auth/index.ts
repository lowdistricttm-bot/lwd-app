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
    const { username, password } = await req.json()
    console.log(`[sync-wp-auth] Verifica credenziali per: ${username}`);

    // 1. Autenticazione su WordPress
    const wpRes = await fetch("https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    const wpData = await wpRes.json()
    
    if (!wpRes.ok) {
      console.error("[sync-wp-auth] WP Auth fallita:", wpData);
      return new Response(JSON.stringify({ error: wpData.message || "Credenziali non valide su WordPress" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // 2. Estrazione Email
    let email = null;
    const data = wpData.data || wpData;
    const jwt = data.jwt || data.token;

    // Prova 1: Cerca nei campi comuni della risposta
    email = data.user_email || data.email || (data.user ? (data.user.user_email || data.user.email) : null);

    // Prova 2: Se abbiamo un JWT, proviamo a decodificarlo (l'email è spesso nel payload)
    if (!email && jwt) {
      try {
        const base64Url = jwt.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        email = payload.email || payload.user_email || (payload.user ? payload.user.email : null);
        console.log("[sync-wp-auth] Email estratta da JWT:", email);
      } catch (e) {
        console.error("[sync-wp-auth] Errore decodifica JWT:", e.message);
      }
    }

    // Prova 3: Se l'input dell'utente era già un'email, usiamo quella
    if (!email && username.includes('@')) {
      email = username;
    }

    if (!email) {
      throw new Error("Impossibile trovare l'email associata. Per favore, effettua il primo accesso usando l'EMAIL invece dello username.");
    }

    // 3. Sincronizzazione su Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (existingUser) {
      console.log(`[sync-wp-auth] Aggiornamento password per: ${email}`);
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { 
        password: password, 
        email_confirm: true 
      })
    } else {
      console.log(`[sync-wp-auth] Creazione nuovo utente: ${email}`);
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username: username.includes('@') ? username.split('@')[0] : username }
      })
    }

    return new Response(JSON.stringify({ success: true, email }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("[sync-wp-auth] Errore:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})