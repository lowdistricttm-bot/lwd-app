-- 1. Assicuriamoci che la colonna esista
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id) ON DELETE CASCADE;

-- 2. Aggiorniamo la funzione per gestire le tipologie di messaggi esatte
CREATE OR REPLACE FUNCTION public.handle_event_notifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_rec RECORD;
  actor_uuid UUID;
  notif_type TEXT;
BEGIN
  -- Otteniamo l'ID dell'admin che sta facendo l'operazione
  actor_uuid := auth.uid();
  
  -- Se l'operazione avviene fuori dal client, usiamo un admin di default
  IF actor_uuid IS NULL THEN
    SELECT id INTO actor_uuid FROM public.profiles WHERE role = 'admin' LIMIT 1;
  END IF;

  -- Determiniamo il tipo di notifica da inviare
  IF (TG_OP = 'INSERT') THEN
    notif_type := 'event_new';
  ELSIF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    IF NEW.status = 'open' THEN
      notif_type := 'event_open';
    ELSIF NEW.status = 'closed' THEN
      notif_type := 'event_closed';
    ELSE
      -- Ignoriamo altri stati come 'soon' per non spammare notifiche
      RETURN NEW;
    END IF;
  ELSE
    RETURN NEW;
  END IF;

  -- Inseriamo la notifica per tutti gli utenti
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
      notif_type,
      NEW.id,
      false
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- 3. Applichiamo il trigger
DROP TRIGGER IF EXISTS on_event_change ON public.events;
CREATE TRIGGER on_event_change
  AFTER INSERT OR UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_event_notifications();