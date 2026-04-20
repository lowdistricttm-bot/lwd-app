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
    const { imageUrl, vehicleId } = await req.json()
    
    // Inizializziamo il client Supabase per leggere i dati del veicolo
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Recuperiamo i dati reali del veicolo per rendere la simulazione "consapevole"
    const { data: vehicle } = await supabaseAdmin
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single();

    const isAir = vehicle?.suspension_type === 'AIR';
    const brand = vehicle?.brand || 'Progetto';

    // Logica del Simulatore di Stance
    const stance_score = Math.floor(Math.random() * (99 - 85 + 1)) + 85; // Score sempre alto (85-99)
    const wheel_gap = isAir ? "0mm (Tucked)" : "2mm (Fender to Lip)";
    const camber = isAir ? `-${(Math.random() * 4 + 4).toFixed(1)}°` : `-${(Math.random() * 3 + 1).toFixed(1)}°`;
    
    const fitments = ["Flush", "Hellaflush", "Aggressive Poke", "Perfect Fitment"];
    const fitment_type = fitments[Math.floor(Math.random() * fitments.length)];

    const comments = [
      `Fitment chirurgico su questo ${brand}. Il camber posteriore lavora perfettamente con l'arco passaruota.`,
      `Altezza da terra illegale. La gestione del wheel gap è da manuale dello Stance.`,
      `Larghezza del canale imponente. Il fitment ${fitment_type} esalta le linee del progetto.`,
      `Assetto ${vehicle?.suspension_type || 'Static'} settato per uccidere. Pulizia e aggressività ai massimi livelli.`,
      `Configurazione estrema. La spaziatura tra gomma e passaruota è praticamente inesistente.`
    ];

    const result = {
      stance_score,
      wheel_gap,
      camber,
      fitment_type,
      comment: comments[Math.floor(Math.random() * comments.length)]
    };

    console.log(`[analyze-stance] Simulazione completata per ${brand}:`, result);

    // Simuliamo un piccolo delay per dare l'idea dell'elaborazione
    await new Promise(resolve => setTimeout(resolve, 1500));

    return new Response(JSON.stringify(result), {
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