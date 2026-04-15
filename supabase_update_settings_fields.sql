-- Aggiunta colonne per le preferenze delle notifiche alla tabella profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT true;

-- Assicuriamoci che i permessi RLS siano attivi (dovrebbero già esserlo)
-- Gli utenti possono aggiornare solo il proprio profilo