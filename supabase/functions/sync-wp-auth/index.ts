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

    // 2. Identificazione Email
    // Proviamo a prenderla dalla risposta di WP, altrimenti se l'input era un'email usiamo quella
    const data = wpData.data || wpData;
    let email = data.user_email || data.email || (data.user ? data.user.user_email : null);
    
    if (!email && username.includes('@')) {
      email = username;
    }

    if (!email) {
      // Se non abbiamo l'email e l'utente ha usato uno username, dobbiamo dare errore
      // perché Supabase richiede l'email per l'account.
      throw new Error("Inserisci la tua EMAIL invece dello username per sincronizzare il cambio password.");
    }

    // 3. Sincronizzazione su Supabase (Admin Mode)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (existingUser) {
      console.log(`[sync-wp-auth] Allineamento password per: ${email}`);
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
        user_metadata: { username: username.split('@')[0] }
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