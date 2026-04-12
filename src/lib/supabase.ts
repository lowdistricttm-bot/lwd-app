import { createClient } from '@supabase/supabase-js';

// Recupero le variabili d'ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Se le chiavi mancano, logghiamo un errore chiaro invece di far crashare l'app
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERRORE: Credenziali Supabase mancanti! Assicurati di aver impostato VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nelle variabili d'ambiente.");
}

// Inizializziamo il client (usiamo stringhe vuote come fallback per evitare l'errore di inizializzazione immediata)
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co", 
  supabaseAnonKey || "placeholder-key"
);