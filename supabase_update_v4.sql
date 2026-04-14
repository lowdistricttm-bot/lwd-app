-- Aggiunta colonna per memorizzare gli URL delle foto degli interni
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS interior_urls JSONB DEFAULT '[]'::jsonb;