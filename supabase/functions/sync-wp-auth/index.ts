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
      console.warn(`[sync-wp-auth] WP Auth negata per ${username}:`, wpData.message || wpData.data?.message);
      return new Response(JSON.stringify({ 
        error: "Credenziali Low District non valide. Verifica username e password sul sito ufficiale.",
        details: wpData.data?.message 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // 2. Estrazione dati (Email e ID WordPress)
    const data = wpData.data || wpData;
    let email = data.user_email || data.email || (data.user ? (data.user.user_email || data.user.email) : null);
    let wpId = data.user_id || data.id || (data.user ? data.user.id : null);

    // Se mancano, proviamo a decodificare il JWT
    const jwt = data.jwt || data.token;
    if ((!email || !wpId) && jwt) {
      try {
        const base64Url = jwt.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        email = email || payload.email || payload.user_email;
        wpId = wpId || payload.id || payload.user_id || payload.sub;
      } catch (e) {
        console.error("[sync-wp-auth] Errore decodifica JWT:", e.message);
      }
    }

    if (!email) {
      if (username.includes('@')) email = username;
      else throw new Error("Impossibile recuperare l'email. Usa l'indirizzo EMAIL per accedere.");
    }

    // 3. Sincronizzazione su Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (existingUser) {
      console.log(`[sync-wp-auth] Utente esistente trovato (${email}). Aggiornamento...`);
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { 
        password: password, 
        email_confirm: true,
        user_metadata: { 
          ...existingUser.user_metadata,
          wp_id: wpId?.toString(),
          last_sync: new Date().toISOString()
        }
      })
    } else {
      console.log(`[sync-wp-auth] Nuovo utente rilevato (${email}).`);
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { 
          username: username.includes('@') ? username.split('@')[0] : username,
          wp_id: wpId?.toString(),
          synced_at: new Date().toISOString()
        }
      })
    }

    return new Response(JSON.stringify({ success: true, email, wpId: wpId?.toString() }), {
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