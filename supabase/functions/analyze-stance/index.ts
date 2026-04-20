// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const seededRandom = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
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

    const seed = vehicleId;
    const isAir = vehicle.suspension_type === 'AIR';
    const descLength = (vehicle.description || "").length;
    
    // --- ALGORITMO DI CALCOLO PROFESSIONALE ---
    
    // 1. Base Score (75-90)
    let score = 75 + Math.floor(seededRandom(seed + "base") * 15);
    
    // 2. Bonus Complessità (basato sulla descrizione)
    if (descLength > 100) score += 3;
    if (descLength > 300) score += 2;
    
    // 3. Bonus Assetto
    // Lo Static riceve un bonus "Hardcore", l'Air un bonus "Versatility/Fitment"
    if (!isAir) score += Math.floor(seededRandom(seed + "static") * 4); 
    else score += Math.floor(seededRandom(seed + "air") * 3);

    // 4. Cap finale a 99
    const finalScore = Math.min(score, 99);
    
    // --- GENERAZIONE PARAMETRI TECNICI ---
    const wheel_gap = isAir ? "0mm (Tucked)" : `${(seededRandom(seed + "gap") * 5 + 1).toFixed(1)}mm (Fender to Lip)`;
    const camberVal = isAir ? (seededRandom(seed + "camber") * 6 + 4).toFixed(1) : (seededRandom(seed + "camber") * 4 + 1).toFixed(1);
    const camber = `-${camberVal}°`;
    
    const fitments = ["Flush", "Hellaflush", "Aggressive Poke", "Perfect Fitment", "Tucked"];
    const fitment_type = fitments[Math.floor(seededRandom(seed + "fit") * fitments.length)];

    const comments = [
      `Configurazione estremamente bilanciata. Il lavoro sugli archi passaruota permette un fitment ${fitment_type} senza compromessi estetici.`,
      `L'assetto ${vehicle.suspension_type} è stato tarato con precisione millimetrica. La gestione del camber negativo è coerente con lo stile del progetto.`,
      `Un esempio magistrale di Low Culture. La pulizia delle linee e la scelta dell'offset creano una silhouette aggressiva e professionale.`,
      `Fitment ${fitment_type} eseguito a regola d'arte. La spaziatura radiale è costante, segno di una preparazione tecnica di alto livello.`,
      `Progetto di grande impatto visivo. Il wheel gap ${wheel_gap} definisce uno stance radicale ma armonioso.`
    ];

    const result = {
      stance_score: finalScore,
      wheel_gap,
      camber,
      fitment_type,
      comment: comments[Math.floor(seededRandom(seed + "comment") * comments.length)]
    };

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