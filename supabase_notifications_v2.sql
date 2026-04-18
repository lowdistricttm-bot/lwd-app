-- 1. Aggiungiamo la colonna vehicle_id alla tabella notifiche se non esiste
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='vehicle_id') THEN
    ALTER TABLE public.notifications ADD COLUMN vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Funzione universale per gestire le notifiche social (Like e Commenti Post)
CREATE OR REPLACE FUNCTION public.handle_social_notifications()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Determiniamo il destinatario della notifica
  IF (TG_TABLE_NAME = 'likes') THEN
    SELECT user_id INTO target_user_id FROM public.posts WHERE id = NEW.post_id;
    -- Non inviare notifiche a se stessi
    IF (NEW.user_id = target_user_id) THEN RETURN NEW; END IF;
    
    INSERT INTO public.notifications (user_id, actor_id, type, post_id)
    VALUES (target_user_id, NEW.user_id, 'like', NEW.post_id);
    
  ELSIF (TG_TABLE_NAME = 'comments') THEN
    SELECT user_id INTO target_user_id FROM public.posts WHERE id = NEW.post_id;
    -- Non inviare notifiche a se stessi
    IF (NEW.user_id = target_user_id) THEN RETURN NEW; END IF;
    
    INSERT INTO public.notifications (user_id, actor_id, type, post_id)
    VALUES (target_user_id, NEW.user_id, 'comment', NEW.post_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Funzione per notifiche Like Veicoli
CREATE OR REPLACE FUNCTION public.handle_vehicle_like_notifications()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT user_id INTO target_user_id FROM public.vehicles WHERE id = NEW.vehicle_id;
  
  -- Non inviare notifiche a se stessi
  IF (NEW.user_id = target_user_id) THEN RETURN NEW; END IF;

  INSERT INTO public.notifications (user_id, actor_id, type, vehicle_id)
  VALUES (target_user_id, NEW.user_id, 'vehicle_like', NEW.vehicle_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Creazione Trigger
DROP TRIGGER IF EXISTS on_post_like ON public.likes;
CREATE TRIGGER on_post_like AFTER INSERT ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.handle_social_notifications();

DROP TRIGGER IF EXISTS on_post_comment ON public.comments;
CREATE TRIGGER on_post_comment AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.handle_social_notifications();

DROP TRIGGER IF EXISTS on_vehicle_like ON public.vehicle_likes;
CREATE TRIGGER on_vehicle_like AFTER INSERT ON public.vehicle_likes
FOR EACH ROW EXECUTE FUNCTION public.handle_vehicle_like_notifications();