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

    // 2. Estrazione Email (Cerchiamo ovunque nella risposta di WP)
    const data = wpData.data || wpData;
    const userObj = data.user || data;
    
    let email = userObj.user_email || userObj.email || userObj.user_login;
    
    // Se l'input dell'utente era già un'email, usiamo quella come fallback sicuro
    if ((!email || !email.includes('@')) && username.includes('@')) {
      email = username;
    }

    // Se ancora non abbiamo l'email (perché l'utente ha usato lo username), 
    // dobbiamo recuperarla usando il token JWT appena ottenuto
    if (!email || !email.includes('@')) {
      const jwt = data.jwt || data.token;
      if (jwt) {
        console.log("[sync-wp-auth] Email non trovata, provo recupero via /me...");
        const meRes = await fetch("https://www.lowdistrict.it/wp-json/wp/v2/users/me", {
          headers: { 'Authorization': `Bearer ${jwt}` }
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          email = meData.email;
        }
      }
    }

    if (!email || !email.includes('@')) {
      throw new Error("Impossibile determinare l'email associata a questo account. Prova ad accedere usando l'email invece dello username.");
    }

    // 3. Sincronizzazione su Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (existingUser) {
      console.log(`[sync-wp-auth] Sincronizzazione password per: ${email}`);
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