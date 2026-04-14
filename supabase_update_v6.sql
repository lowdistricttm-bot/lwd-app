-- Aggiunta della colonna program alla tabella events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS program TEXT;

-- Aggiornamento della cache dello schema
NOTIFY pgrst, 'reload schema';