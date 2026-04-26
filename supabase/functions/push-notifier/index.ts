import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { record } = await req.json()
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Recupera il token FCM dell'utente destinatario
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('fcm_token, username')
      .eq('id', record.user_id)
      .single()

    if (profileError || !profile?.fcm_token) {
      return new Response(JSON.stringify({ message: 'Token non trovato o utente non registrato per le push' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 2. Prepara il testo della notifica in base al tipo
    let title = "Low District";
    let body = record.content || "Hai una nuova attività nel Distretto";

    switch (record.type) {
      case 'like': title = "Nuovo Like!"; break;
      case 'comment': title = "Nuovo Commento!"; break;
      case 'follow': title = "Nuovo Follower!"; break;
      case 'admin_info': title = "Annuncio Ufficiale"; break;
      case 'application_status': title = "Aggiornamento Selezione"; break;
    }

    // 3. Invia a Firebase (Legacy API per semplicità di configurazione tramite Server Key)
    const FIREBASE_SERVER_KEY = Deno.env.get('FIREBASE_SERVER_KEY');
    
    if (!FIREBASE_SERVER_KEY) {
      throw new Error("FIREBASE_SERVER_KEY non configurata nei Secrets di Supabase");
    }

    console.log(`[push-notifier] Invio notifica a @${profile.username}`);

    const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${FIREBASE_SERVER_KEY}`,
      },
      body: JSON.stringify({
        to: profile.fcm_token,
        notification: {
          title: title,
          body: body,
          icon: "https://www.lowdistrict.it/wp-content/uploads/icon-only.png",
          click_action: "https://lwd-app.vercel.app/profile?tab=notifications"
        },
        priority: "high"
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