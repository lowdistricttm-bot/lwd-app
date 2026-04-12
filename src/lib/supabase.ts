import { supabase as integratedClient } from "@/integrations/supabase/client";

// Esportiamo il client integrato per mantenere la compatibilità con il resto dell'app
export const supabase = integratedClient;