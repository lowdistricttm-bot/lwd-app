-- 1. Elimina la policy se già esiste per evitare errori
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

-- 2. Crea la policy che autorizza gli utenti a eliminare (DELETE) le proprie notifiche
CREATE POLICY "Users can delete their own notifications" 
ON public.notifications 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 3. Abilita in modo sicuro il Realtime per la tabella notifiche
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN 
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications; 
  END IF; 
END $$;