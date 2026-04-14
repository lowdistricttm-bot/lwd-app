-- Aggiunta campi per biografia e social
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
ADD COLUMN IF NOT EXISTS facebook_handle TEXT,
ADD COLUMN IF NOT EXISTS tiktok_handle TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;