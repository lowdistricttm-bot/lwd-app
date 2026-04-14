-- Aggiungiamo la colonna image_url alla tabella messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS image_url TEXT;