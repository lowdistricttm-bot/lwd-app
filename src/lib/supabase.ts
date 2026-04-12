import { createClient } from '@supabase/supabase-js';

// Queste variabili vengono caricate automaticamente se hai attivato l'integrazione Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);