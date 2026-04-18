-- 1. Imposta l'identità di replica su FULL per la tabella messaggi
-- Questo permette di ricevere tutti i dati (inclusi quelli vecchi in caso di update/delete)
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- 2. Aggiungi la tabella alla pubblicazione Realtime di Supabase
-- Usiamo un blocco DO per evitare errori se la tabella è già presente nella pubblicazione
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;