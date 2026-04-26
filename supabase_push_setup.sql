-- 1. Abilitiamo l'estensione necessaria per le chiamate HTTP dal database
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Creiamo la funzione che contatta la Edge Function
-- Questa funzione agisce come un postino: prende la notifica e la manda al server di invio
CREATE OR REPLACE FUNCTION public.notify_via_push()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Chiamata alla Edge Function tramite l'estensione pg_net
  PERFORM
    net.http_post(
      url := 'https://cxjqbxhhslxqpkfcwqhr.supabase.co/functions/v1/push-notifier',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4anFieGhoc2x4cXBrZmN3cWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjAwNDIyNywiZXhwIjoyMDkxNTgwMjI3fQ.VbAoN212C1BNgMUZjiu5fFrHW5pR7ujQQ2WSLkGhxv4'
      ),
      body := jsonb_build_object('record', row_to_json(NEW))
    );
  RETURN NEW;
END;
$function$;

-- 3. Colleghiamo la funzione alla tabella notifications
-- Ogni volta che viene inserita una riga (like, commento, messaggio), il trigger scatta
DROP TRIGGER IF EXISTS on_notification_created_push ON public.notifications;
CREATE TRIGGER on_notification_created_push
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.notify_via_push();