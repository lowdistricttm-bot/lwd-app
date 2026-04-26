// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import * as jose from 'https://esm.sh/jose@5.2.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getAccessToken(serviceAccount: any) {
  const jwt = await new jose.SignJWT({
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: serviceAccount.token_uri,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
  })
    .setProtectedHeader({ alg: 'RS256' })
    .sign(await jose.importPKCS8(serviceAccount.private_key, 'RS256'))

  const res = await fetch(serviceAccount.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  const data = await res.json()
  return data.access_token
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { record } = await req.json()
    console.log("[push-notifier] Ricevuto record notifica:", record);
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Recupera il token FCM del destinatario
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('fcm_token, username')
      .eq('id', record.user_id)
      .single()

    if (profileError || !profile?.fcm_token) {
      return new Response(JSON.stringify({ message: 'Token non trovato' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 2. Recupera il profilo di chi ha scatenato la notifica (actor)
    const { data: actorProfile } = await supabaseAdmin
      .from('profiles')
      .select('username')
      .eq('id', record.actor_id)
      .single()

    // 3. Recupera il Service Account
    const serviceAccountStr = Deno.env.get('FIREBASE_SERVICE_ACCOUNT');
    if (!serviceAccountStr) throw new Error("FIREBASE_SERVICE_ACCOUNT secret mancante");
    const serviceAccount = JSON.parse(serviceAccountStr);

    const accessToken = await getAccessToken(serviceAccount);

    // 4. Prepara il contenuto in base al tipo
    let title = "Low District";
    let body = record.content || "Hai una nuova attività";
    let url = "/profile?tab=notifications";

    switch (record.type) {
      case 'message':
        title = actorProfile?.username || "Nuovo Messaggio";
        body = record.content;
        url = `/chat/${record.actor_id}`;
        break;
      case 'like': title = "Nuovo Like!"; break;
      case 'comment': title = "Nuovo Commento!"; break;
      case 'follow': title = "Nuovo Follower!"; break;
      case 'admin_info': title = "Annuncio Ufficiale"; break;
      case 'application_status': title = "Aggiornamento Selezione"; break;
    }

    console.log(`[push-notifier] Invio push a @${profile.username} per tipo: ${record.type}`);

    // 5. Invio tramite FCM v1
    const fcmResponse = await fetch(`https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: {
          token: profile.fcm_token,
          data: {
            title: title,
            body: body,
            icon: "/icon-only.png",
            url: url
          },
          webpush: {
            headers: { Urgency: "high" },
            fcm_options: { link: `https://lwd-app.vercel.app${url}` }
          }
        }
      }),
    });

    const fcmData = await fcmResponse.json();
    return new Response(JSON.stringify({ success: true, fcm: fcmData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("[push-notifier] Errore:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})