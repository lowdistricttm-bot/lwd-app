-- 1. Assicuriamoci che la colonna esista
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS vehicle_id UUID;

-- 2. Aggiungiamo esplicitamente il vincolo di Foreign Key se non esiste
-- Questo permette a PostgREST (l'API di Supabase) di vedere la relazione
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='notifications_vehicle_id_fkey') THEN
    ALTER TABLE public.notifications 
    ADD CONSTRAINT notifications_vehicle_id_fkey 
    FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Notifiche Like Veicoli (Trigger aggiornato)
CREATE OR REPLACE FUNCTION public.handle_vehicle_like_notifications()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT user_id INTO target_user_id FROM public.vehicles WHERE id = NEW.vehicle_id;
  
  IF (NEW.user_id = target_user_id) THEN RETURN NEW; END IF;

  INSERT INTO public.notifications (user_id, actor_id, type, vehicle_id)
  VALUES (target_user_id, NEW.user_id, 'vehicle_like', NEW.vehicle_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_vehicle_like ON public.vehicle_likes;
CREATE TRIGGER on_vehicle_like AFTER INSERT ON public.vehicle_likes
FOR EACH ROW EXECUTE FUNCTION public.handle_vehicle_like_notifications();