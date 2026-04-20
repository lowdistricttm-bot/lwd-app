import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { imageUrl } = await req.json()
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

    if (!GEMINI_API_KEY) throw new Error("API Key mancante")

    const prompt = {
      contents: [{
        parts: [
          { text: "Sei un esperto di car styling e stance. Analizza questa foto laterale di un'auto. Valuta da 1 a 100 i seguenti parametri: stance_score (generale), wheel_gap (distanza gomma-passaruota), camber (inclinazione), fitment (allineamento). Restituisci SOLO un JSON con questi campi e un campo 'comment' di massimo 15 parole in italiano con stile aggressivo e tecnico." },
          { inline_data: { mime_type: "image/jpeg", data: await fetch(imageUrl).then(r => r.arrayBuffer()).then(b => btoa(String.fromCharCode(...new Uint8Array(b)))) } }
        ]
      }]
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prompt)
    })

    const data = await response.json()
    const textResponse = data.candidates[0].content.parts[0].text
    const jsonMatch = textResponse.match(/\{.*\}/s)
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Analisi fallita" }

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