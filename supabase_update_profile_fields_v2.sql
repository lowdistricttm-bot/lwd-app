-- Aggiunta delle colonne mancanti alla tabella profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
ADD COLUMN IF NOT EXISTS facebook_handle TEXT,
ADD COLUMN IF NOT EXISTS tiktok_handle TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- I permessi RLS esistenti (auth.uid() = id) copriranno automaticamente queste nuove colonne.