-- 1. Aggiungiamo la colonna event_id alla tabella notifications per collegare la notifica all'evento
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id) ON DELETE CASCADE;

-- 2. Creiamo la funzione che genererà le notifiche
CREATE OR REPLACE FUNCTION public.handle_event_notifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_rec RECORD;
  actor_uuid UUID;
BEGIN
  -- Otteniamo l'ID dell'admin che sta facendo l'operazione
  actor_uuid := auth.uid();
  
  -- Se l'operazione avviene fuori dal client (es. editor SQL), usiamo un admin di default
  IF actor_uuid IS NULL THEN
    SELECT id INTO actor_uuid FROM public.profiles WHERE role = 'admin' LIMIT 1;
  END IF;

  -- Condizione: nuovo evento inserito OPPURE evento esistente che cambia stato in 'open'
  IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'open') THEN
    FOR user_rec IN SELECT id FROM public.profiles LOOP
      INSERT INTO public.notifications (
        user_id,
        actor_id,
        type,
        event_id,
        is_read
      ) VALUES (
        user_rec.id,
        actor_uuid,
        'event_update',
        NEW.id,
        false
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

-- 3. Colleghiamo il trigger alla tabella events
DROP TRIGGER IF EXISTS on_event_change ON public.events;
CREATE TRIGGER on_event_change
  AFTER INSERT OR UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_event_notifications();