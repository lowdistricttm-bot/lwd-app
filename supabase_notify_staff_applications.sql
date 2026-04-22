-- Funzione per notificare admin e staff alla creazione di una candidatura
CREATE OR REPLACE FUNCTION public.notify_staff_on_new_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    applicant_username TEXT;
    event_title TEXT;
BEGIN
    -- Recuperiamo lo username di chi si candida
    SELECT username INTO applicant_username FROM public.profiles WHERE id = NEW.user_id;
    
    -- Recuperiamo il titolo dell'evento
    SELECT title INTO event_title FROM public.events WHERE id = NEW.event_id;

    -- Inseriamo una notifica per ogni admin e staff
    INSERT INTO public.notifications (user_id, actor_id, type, application_id, content)
    SELECT 
        p.id,           -- L'admin/staff da notificare
        NEW.user_id,    -- L'utente che si è candidato (attore)
        'admin_info',   -- Tipo di notifica ufficiale
        NEW.id,         -- ID della candidatura
        'Nuova candidatura da @' || COALESCE(applicant_username, 'un utente') || ' per ' || COALESCE(event_title, 'un evento')
    FROM public.profiles p
    WHERE p.role IN ('admin', 'staff');

    RETURN NEW;
END;
$$;

-- Trigger sulla tabella applications
DROP TRIGGER IF EXISTS on_application_created ON public.applications;
CREATE TRIGGER on_application_created
  AFTER INSERT ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.notify_staff_on_new_application();