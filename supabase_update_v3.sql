-- Aggiunta colonne mancanti alla tabella applications
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS modifications TEXT;