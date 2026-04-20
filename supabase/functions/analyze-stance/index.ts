// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
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
    const base64Data = arrayBufferToBase64(buffer);

    const prompt = {
      contents: [{
        parts: [
          { text: "Sei un esperto di car styling e stance. Analizza questa foto laterale di un'auto. Valuta da 1 a 100 i seguenti parametri: stance_score (generale), wheel_gap (distanza gomma-passaruota), camber (inclinazione), fitment (allineamento). Restituisci SOLO un JSON con questi campi e un campo 'comment' di massimo 15 parole in italiano con stile aggressivo e tecnico." },
          { inline_data: { mime_type: "image/jpeg", data: base64Data } }
        ]
      }],
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
      ]
    }

    let modelName = 'gemini-1.5-flash';
    console.log(`[analyze-stance] Invio richiesta a Gemini (${modelName} su v1beta)...`);
    
    let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prompt)
    });

    let data = await response.json();

    // Fallback: se il modello flash non è trovato, proviamo con la versione pro
    if (data.error && data.error.code === 404) {
      console.log(`[analyze-stance] ${modelName} non trovato. Tentativo di fallback con gemini-1.5-pro...`);
      modelName = 'gemini-1.5-pro';
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt)
      });
      data = await response.json();
    }
    
    // Ulteriore fallback su gemini-pro-vision se la key è associata a vecchi endpoint
    if (data.error && data.error.code === 404) {
      console.log(`[analyze-stance] ${modelName} non trovato. Tentativo di fallback finale con gemini-pro-vision...`);
      modelName = 'gemini-pro-vision';
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt)
      });
      data = await response.json();
    }

    if (data.error) {
      console.error("[analyze-stance] Errore API Gemini:", data.error);
      throw new Error(`Errore Google AI: ${data.error.message}`);
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error("[analyze-stance] Risposta Gemini incompleta:", JSON.stringify(data));
      throw new Error("L'IA non ha restituito una risposta valida. Riprova con un'altra foto.");
    }

    const textResponse = data.candidates[0].content.parts[0].text
    const jsonMatch = textResponse.match(/\{.*\}/s)
    
    if (!jsonMatch) {
      console.error("[analyze-stance] Formato JSON non trovato nella risposta:", textResponse);
      throw new Error("L'IA ha risposto in un formato non corretto.");
    }

    const result = JSON.parse(jsonMatch[0])

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