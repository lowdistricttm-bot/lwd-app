-- Aggiunge le colonne per le coordinate geografiche alla tabella degli incontri
ALTER TABLE public.meets 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Forza il refresh della cache dello schema (opzionale ma consigliato)
NOTIFY pgrst, 'reload schema';