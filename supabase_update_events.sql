-- Aggiunta della colonna image_url alla tabella events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Aggiornamento della cache dello schema (opzionale, Supabase lo fa automaticamente)
NOTIFY pgrst, 'reload schema';