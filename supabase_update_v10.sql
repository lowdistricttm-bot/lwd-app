-- Aggiunta colonna per la privacy della targa
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS license_plate_privacy TEXT DEFAULT 'private';

-- Commento per chiarezza: 'public' = visibile a tutti, 'private' = solo admin/staff e proprietario