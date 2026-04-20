// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Funzione per generare un numero pseudo-casuale basato su una stringa (seed)
const seededRandom = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { imageUrl, vehicleId } = await req.json()
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: vehicle } = await supabaseAdmin
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single();

    if (!vehicle) throw new Error("Veicolo non trovato");

    // Usiamo l'ID del veicolo come seme per rendere tutto deterministico
    const seed = vehicleId;
    const r1 = seededRandom(seed + "score");
    const r2 = seededRandom(seed + "gap");
    const r3 = seededRandom(seed + "camber");
    const r4 = seededRandom(seed + "fit");
    const r5 = seededRandom(seed + "comment");

    const isAir = vehicle.suspension_type === 'AIR';
    const brand = vehicle.brand || 'Progetto';

    // Calcolo Punteggio (85-99)
    const stance_score = Math.floor(r1 * (99 - 85 + 1)) + 85;
    
    // Parametri Tecnici
    const wheel_gap = isAir ? "0mm (Tucked)" : `${Math.floor(r2 * 3) + 1}mm (Fender to Lip)`;
    const camberVal = isAir ? (r3 * 4 + 4).toFixed(1) : (r3 * 3 + 1).toFixed(1);
    const camber = `-${camberVal}°`;
    
    const fitments = ["Flush", "Hellaflush", "Aggressive Poke", "Perfect Fitment"];
    const fitment_type = fitments[Math.floor(r4 * fitments.length)];

    const comments = [
      `Fitment chirurgico su questo ${brand}. Il camber posteriore lavora perfettamente con l'arco passaruota.`,
      `Altezza da terra estrema. La gestione del wheel gap è da manuale dello Stance.`,
      `Larghezza del canale imponente. Il fitment ${fitment_type} esalta le linee del progetto.`,
      `Assetto ${vehicle.suspension_type} settato per uccidere. Pulizia e aggressività ai massimi livelli.`,
      `Configurazione radicale. La spaziatura tra gomma e passaruota è praticamente inesistente.`
    ];

    const result = {
      stance_score,
      wheel_gap,
      camber,
      fitment_type,
      comment: comments[Math.floor(r5 * comments.length)]
    };

    console.log(`[analyze-stance] Analisi deterministica per ${brand}:`, result);

    // Simuliamo il caricamento per l'effetto "analisi"
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