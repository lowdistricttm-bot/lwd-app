-- 1. Aggiorna tutti i profili esistenti che non hanno ancora una preferenza impostata
-- Questo attiva la logica di sincronizzazione del token per i vecchi utenti
UPDATE public.profiles 
SET push_notifications = true 
WHERE push_notifications IS NULL;

-- 2. Imposta il valore predefinito a TRUE per tutti i nuovi iscritti futuri
ALTER TABLE public.profiles 
ALTER COLUMN push_notifications SET DEFAULT true;

-- 3. Assicuriamoci che anche la colonna email_notifications segua la stessa logica
UPDATE public.profiles 
SET email_notifications = true 
WHERE email_notifications IS NULL;

ALTER TABLE public.profiles 
ALTER COLUMN email_notifications SET DEFAULT true;