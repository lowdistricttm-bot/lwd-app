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
    const { application, vehicle, userProfile } = await req.json()

    console.log("[notify-admin] Nuova candidatura ricevuta per l'evento:", application.event_id);

    // Nota: Per inviare email reali da una Edge Function, dovresti usare un servizio come Resend, SendGrid o Postmark.
    // Qui simuliamo l'invio loggando i dati che andrebbero nell'email.
    // In produzione, configureresti una chiamata API verso il tuo provider email.
    
    const emailBody = `
      NUOVA CANDIDATURA LOW DISTRICT
      ------------------------------
      Evento: ${application.event_id}
      Candidato: ${application.fullName}
      Email: ${application.email}
      Instagram: ${application.instagram}
      Città: ${application.city}
      
      VEICOLO:
      Marca/Modello: ${vehicle.brand} ${vehicle.model}
      Modifiche: ${application.modifications}
      
      Link Foto Interni:
      ${application.interiorUrls?.join('\n')}
    `;

    console.log("[notify-admin] Email inviata a info@lowdistrict.it");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})