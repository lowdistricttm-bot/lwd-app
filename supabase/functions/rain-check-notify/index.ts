// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Recupera tutti gli utenti con una città impostata
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, city, username')
      .not('city', 'is', null);

    if (!profiles) throw new Error("Nessun profilo trovato");

    console.log(`[rain-check] Analisi meteo per ${profiles.length} utenti...`);

    for (const profile of profiles) {
      try {
        // Geocoding veloce
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(profile.city)}&limit=1`);
        const geoData = await geoRes.json();
        if (!geoData[0]) continue;

        const { lat, lon } = geoData[0];
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_probability_max&timezone=auto`);
        const weatherData = await weatherRes.json();

        const todayProb = weatherData.daily.precipitation_probability_max[0];
        const tomorrowProb = weatherData.daily.precipitation_probability_max[1];

        // Se il meteo è perfetto (prob < 15% per oggi e domani)
        if (todayProb < 15 && tomorrowProb < 15) {
          // Inserisci notifica nel DB con il nuovo tipo 'weather_alert'
          await supabaseAdmin.from('notifications').insert({
            user_id: profile.id,
            actor_id: profile.id, 
            type: 'weather_alert', 
            content: `District Alert: Meteo perfetto a ${profile.city}! È il momento ideale per lavare l'auto e far splendere il tuo progetto.`
          });
        }
      } catch (e) {
        console.error(`Errore per utente ${profile.username}:`, e.message);
      }
    }

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