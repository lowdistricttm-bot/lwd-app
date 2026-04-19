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

    // 1. Verifica su WordPress
    const wpRes = await fetch("https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    const wpData = await wpRes.json()
    console.log("[sync-wp-auth] Risposta WP ricevuta:", JSON.stringify(wpData));

    if (!wpRes.ok) {
      return new Response(JSON.stringify({ error: wpData.message || "Credenziali WordPress non valide" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Estrazione sicura dell'email e ID
    const data = wpData.data || wpData;
    const email = data.user_email || data.email || (data.user ? data.user.user_email : null);
    const wpId = (data.user_id || data.id || (data.user ? data.user.ID : null))?.toString();

    if (!email) {
      console.error("[sync-wp-auth] Struttura dati WP non riconosciuta:", wpData);
      throw new Error("Impossibile recuperare l'email dal profilo WordPress");
    }

    // 2. Inizializza Supabase Admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Sincronizzazione Utente
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) throw listError

    const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (existingUser) {
      console.log(`[sync-wp-auth] Aggiornamento password per: ${email}`);
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        { password: password, email_confirm: true }
      )
      if (updateError) throw updateError
    } else {
      console.log(`[sync-wp-auth] Creazione nuovo utente: ${email}`);
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