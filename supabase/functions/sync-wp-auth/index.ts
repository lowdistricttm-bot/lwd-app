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

    console.log(`[sync-wp-auth] Sincronizzazione per: ${username}`);

    // 1. Autenticazione su WordPress
    const wpRes = await fetch("https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    const wpData = await wpRes.json()
    
    if (!wpRes.ok) {
      console.warn(`[sync-wp-auth] WP Auth negata per ${username}`);
      return new Response(JSON.stringify({ 
        error: "Credenziali non valide sul sito ufficiale.",
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // 2. Estrazione dati completi dal sito
    const data = wpData.data || wpData;
    const user = data.user || {};
    
    const email = data.user_email || data.email || user.user_email || user.email;
    const wpUsername = user.user_login || user.display_name || username;
    const wpAvatar = user.avatar_url || null;
    const wpId = user.ID || user.id || null;

    if (!email) {
      throw new Error("Email non trovata. Usa l'email per il login.");
    }

    // 3. Sincronizzazione su Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (existingUser) {
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { 
        password: password, 
        email_confirm: true,
        user_metadata: { 
          ...existingUser.user_metadata,
          username: wpUsername,
          wp_id: wpId
        }
      })
    } else {
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { 
          username: wpUsername,
          wp_id: wpId,
          synced_at: new Date().toISOString()
        }
      })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      email, 
      username: wpUsername, 
      avatar_url: wpAvatar,
      wp_id: wpId 
    }), {
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