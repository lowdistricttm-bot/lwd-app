-- Aggiunta colonna per memorizzare gli ID degli utenti menzionati
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS mentions JSONB DEFAULT '[]'::jsonb;

-- Commento per documentazione
COMMENT ON COLUMN public.stories.mentions IS 'Array di UUID degli utenti menzionati nella storia';