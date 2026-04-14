-- Aggiunta della colonna end_date alla tabella events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;

-- Aggiornamento della cache dello schema
NOTIFY pgrst, 'reload schema';