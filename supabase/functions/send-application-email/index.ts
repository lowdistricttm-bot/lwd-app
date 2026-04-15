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
    const { applicationId, status } = await req.json()
    
    // Inizializza client Supabase con Service Role per bypassare RLS e leggere i dati necessari
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`[send-application-email] Elaborazione email per candidatura ${applicationId} con stato ${status}`);

    // 1. Recupera i dati della candidatura
    const { data: app, error: appError } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        profiles:user_id (first_name, last_name, username),
        events:event_id (title)
      `)
      .eq('id', applicationId)
      .single()

    if (appError || !app) throw new Error("Candidatura non trovata")

    // 2. Recupera il template corretto
    const templateType = status === 'approved' ? 'approval' : 'rejection'
    const { data: template, error: tempError } = await supabaseAdmin
      .from('email_templates')
      .select('*')
      .eq('type', templateType)
      .single()

    if (tempError || !template) throw new Error("Template email non trovato")

    // 3. Prepara il contenuto (Sostituzione segnaposto)
    const userName = app.profiles?.username || app.full_name || 'Membro'
    const eventTitle = app.events?.title || 'Evento Low District'
    
    let emailBody = template.body
      .replace(/{{user_name}}/g, userName)
      .replace(/{{event_title}}/g, eventTitle)

    // 4. Invia tramite Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY non configurata")

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Low District <info@lowdistrict.it>',
        to: [app.email],
        subject: template.subject.replace(/{{event_title}}/g, eventTitle),
        text: emailBody,
        // Puoi aggiungere html: se preferisci un formato più ricco
      }),
    })

    const resData = await res.json()
    console.log("[send-application-email] Risposta Resend:", resData);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("[send-application-email] Errore:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})