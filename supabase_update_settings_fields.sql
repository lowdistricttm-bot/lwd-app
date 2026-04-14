-- Aggiunta colonne per salvare le preferenze delle notifiche
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT true;