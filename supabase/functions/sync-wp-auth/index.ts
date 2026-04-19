// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gestione CORS per le chiamate dal browser
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { username, password } = await req.json()

    console.log(`[sync-wp-auth] Tentativo di sincronizzazione per l'utente: ${username}`);

    // 1. Verifica le credenziali su WordPress
    const wpRes = await fetch("https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    const wpData = await wpRes.json()

    if (!wpRes.ok) {
      console.error("[sync-wp-auth] WordPress Auth fallita:", wpData);
      return new Response(JSON.stringify({ error: wpData.message || "Credenziali WordPress non valide" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Estrazione dati da WordPress
    const data = wpData.data || wpData
    const email = data.user_email || data.email
    const wpId = data.user_id?.toString() || data.id?.toString()

    if (!email) {
      throw new Error("Email non ricevuta da WordPress")
    }

    // 2. Inizializza Supabase con Service Role Key (Permessi Admin)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 3. Gestione Utente in Supabase
    // Cerchiamo l'utente per email
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) throw listError

    const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (existingUser) {
      console.log(`[sync-wp-auth] Utente trovato. Aggiornamento password per: ${email}`);
      // Se l'utente esiste, aggiorniamo la password per allinearla a quella di WP
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        { password: password, email_confirm: true }
      )
      if (updateError) throw updateError
    } else {
      console.log(`[sync-wp-auth] Nuovo utente. Creazione account per: ${email}`);
      // Se non esiste, lo creiamo direttamente con la password di WP
      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username: username }
      })
      if (createError) throw createError
    }

    return new Response(JSON.stringify({ 
      success: true, 
      email: email,
      wp_id: wpId
    }), {
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