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
    // Utilizziamo l'encoder standard di Deno per evitare problemi di call stack su immagini grandi
    const base64Data = encodeBase64(new Uint8Array(buffer));

    const payload = {
      contents: [{
        parts: [
          { text: "Sei un esperto di car styling e stance. Analizza questa foto laterale di un'auto. Valuta da 1 a 100 i seguenti parametri: stance_score (generale), wheel_gap (distanza gomma-passaruota), camber (inclinazione), fitment (allineamento). Restituisci SOLO un JSON con questi campi esatti (stance_score, wheel_gap, camber, fitment_type) e un campo 'comment' di massimo 15 parole in italiano con stile aggressivo e tecnico." },
          { inlineData: { mimeType: "image/jpeg", data: base64Data } }
        ]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    }

    console.log("[analyze-stance] Invio richiesta a Gemini 1.5 Flash (v1)...");
    
    // Aggiornato endpoint da v1beta a v1
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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
      console.error("[analyze-stance] Risposta Gemini incompleta:", JSON.stringify(data));
      throw new Error("L'IA non ha restituito una risposta valida. Riprova con un'altra foto.");
    }

    const textResponse = data.candidates[0].content.parts[0].text
    console.log("[analyze-stance] Risposta testuale ricevuta:", textResponse);

    const result = JSON.parse(textResponse.replace(/```json/g, '').replace(/```/g, '').trim())

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