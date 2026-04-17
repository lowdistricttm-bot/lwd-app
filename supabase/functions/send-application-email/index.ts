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
    const { applicationId, status } = await req.json()
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`[send-application-email] Avvio per candidatura: ${applicationId}, stato: ${status}`);

    // 1. Recupera i dati della candidatura
    const { data: app, error: appError } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        profiles:user_id (username),
        events:event_id (title)
      `)
      .eq('id', applicationId)
      .single()

    if (appError || !app) {
      console.error("[send-application-email] Candidatura non trovata:", appError);
      throw new Error("Candidatura non trovata");
    }

    // 2. Recupera il template (assicurati che i tipi siano 'approval' e 'rejection')
    const templateType = status === 'approved' ? 'approval' : 'rejection';
    const { data: template, error: tempError } = await supabaseAdmin
      .from('email_templates')
      .select('*')
      .eq('type', templateType)
      .maybeSingle();

    if (tempError || !template) {
      console.error(`[send-application-email] Template '${templateType}' non trovato nel DB.`);
      throw new Error(`Template email '${templateType}' non configurato.`);
    }

    // 3. Prepara il contenuto
    const userName = app.profiles?.username || app.full_name || 'Membro';
    const eventTitle = app.events?.title || 'Evento Low District';
    
    const emailBody = template.body
      .replace(/{{user_name}}/g, userName)
      .replace(/{{event_title}}/g, eventTitle);

    const emailSubject = template.subject.replace(/{{event_title}}/g, eventTitle);

    // 4. Invia tramite Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.error("[send-application-email] RESEND_API_KEY non trovata nei Secrets di Supabase.");
      throw new Error("Configurazione server incompleta (API Key)");
    }

    console.log(`[send-application-email] Invio email a: ${app.email}`);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Low District <info@lowdistrict.it>',
        to: [app.email],
        subject: emailSubject,
        text: emailBody,
      }),
    });

    const resData = await res.json();
    
    if (!res.ok) {
      console.error("[send-application-email] Errore Resend API:", resData);
      throw new Error(resData.message || "Errore durante l'invio dell'email");
    }

    console.log("[send-application-email] Email inviata con successo!", resData);

    return new Response(JSON.stringify({ success: true, id: resData.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("[send-application-email] Errore critico:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})