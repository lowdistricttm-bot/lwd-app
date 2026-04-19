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
    console.log(`[sync-wp-auth] Inizio sincronizzazione per: ${username}`);

    // 1. Autenticazione su WordPress per ottenere il JWT
    const wpRes = await fetch("https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    const wpData = await wpRes.json()
    
    if (!wpRes.ok) {
      console.error("[sync-wp-auth] WP Auth fallita:", wpData);
      return new Response(JSON.stringify({ error: wpData.message || "Credenziali WordPress non valide" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Estraiamo il token JWT
    const jwt = wpData.jwt || wpData.data?.jwt;
    if (!jwt) {
      throw new Error("Token JWT non ricevuto da WordPress");
    }

    // 2. Recupero dati utente completi (Email) usando il JWT appena ottenuto
    console.log("[sync-wp-auth] Recupero dettagli utente tramite /users/me...");
    const meRes = await fetch("https://www.lowdistrict.it/wp-json/wp/v2/users/me", {
      headers: { 'Authorization': `Bearer ${jwt}` }
    });

    if (!meRes.ok) {
      throw new Error("Impossibile recuperare i dettagli del profilo da WordPress");
    }

    const meData = await meRes.ok ? await meRes.json() : null;
    const email = meData?.email;
    const wpId = meData?.id?.toString();

    if (!email) {
      console.error("[sync-wp-auth] Email non trovata nei dati /me:", meData);
      throw new Error("L'account WordPress non ha un'email valida associata");
    }

    // 3. Inizializza Supabase Admin per sincronizzare
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 4. Sincronizzazione password e utente
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) throw listError

    const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (existingUser) {
      console.log(`[sync-wp-auth] Aggiornamento password per utente esistente: ${email}`);
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        { password: password, email_confirm: true }
      )
      if (updateError) throw updateError
    } else {
      console.log(`[sync-wp-auth] Creazione nuovo utente Supabase: ${email}`);
      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username: username }
      })
      if (createError) throw createError
    }

    return new Response(JSON.stringify({ success: true, email, wp_id: wpId }), {
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