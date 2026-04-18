-- Aggiunta della colonna per la privacy della targa alla tabella profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS license_plate_privacy TEXT DEFAULT 'private';

-- Commento per documentazione
COMMENT ON COLUMN public.profiles.license_plate_privacy IS 'Gestisce la visibilità della targa dei veicoli (public o private)';