// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { encode as encodeBase64 } from "https://deno.land/std@0.190.0/encoding/base64.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { imageUrl } = await req.json()
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

    if (!GEMINI_API_KEY) throw new Error("API Key mancante nei Secrets di Supabase")

    console.log("[analyze-stance] Scaricamento immagine:", imageUrl);
    const imageRes = await fetch(imageUrl);
    
    if (!imageRes.ok) {
      throw new Error(`Impossibile scaricare l'immagine: ${imageRes.statusText}`);
    }

    const buffer = await imageRes.arrayBuffer();
    const base64Data = encodeBase64(new Uint8Array(buffer));

    // Payload ridotto all'osso per evitare errori di campi sconosciuti
    const payload = {
      contents: [{
        parts: [
          { text: "Sei un esperto di car styling e stance. Analizza questa foto. Restituisci SOLO un oggetto JSON (senza markdown) con questi campi: stance_score (numero 1-100), wheel_gap (numero 1-100), camber (numero 1-100), fitment_type (stringa), comment (max 15 parole in italiano tecnico/aggressivo)." },
          { 
            inlineData: { 
              mimeType: "image/jpeg", 
              data: base64Data 
            } 
          }
        ]
      }]
    }

    console.log("[analyze-stance] Invio richiesta a Gemini 1.5 Flash...");
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    
    if (data.error) {
      console.error("[analyze-stance] Errore API Gemini:", data.error);
      throw new Error(`Errore Google AI: ${data.error.message}`);
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("L'IA non ha restituito una risposta valida.");
    }

    const textResponse = data.candidates[0].content.parts[0].text
    console.log("[analyze-stance] Risposta grezza:", textResponse);

    // Estrazione sicura del JSON tramite Regex (cerca il contenuto tra le graffe)
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Formato risposta non valido.");
    
    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("[analyze-stance] Errore critico:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})