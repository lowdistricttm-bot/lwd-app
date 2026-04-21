-- 1. Creazione Tabella Richieste Ruolo
CREATE TABLE IF NOT EXISTS public.role_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  requested_role TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Abilitazione Row Level Security (RLS)
ALTER TABLE public.role_requests ENABLE ROW LEVEL SECURITY;

-- 3. Politiche di Sicurezza (RLS)
-- Gli utenti possono vedere solo le proprie richieste
DROP POLICY IF EXISTS "Users can view their own requests" ON public.role_requests;
CREATE POLICY "Users can view their own requests" ON public.role_requests
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Gli utenti possono inserire solo richieste per se stessi
DROP POLICY IF EXISTS "Users can insert their own requests" ON public.role_requests;
CREATE POLICY "Users can insert their own requests" ON public.role_requests
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Admin e Staff possono vedere tutte le richieste
DROP POLICY IF EXISTS "Admins and Staff can view all requests" ON public.role_requests;
CREATE POLICY "Admins and Staff can view all requests" ON public.role_requests
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Admin e Staff possono aggiornare lo stato delle richieste
DROP POLICY IF EXISTS "Admins and Staff can update requests" ON public.role_requests;
CREATE POLICY "Admins and Staff can update requests" ON public.role_requests
FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- 4. Funzione per Notifiche Automatiche agli Admin
CREATE OR REPLACE FUNCTION public.notify_admins_on_role_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    requester_username TEXT;
BEGIN
    -- Recuperiamo lo username di chi fa la richiesta
    SELECT username INTO requester_username FROM public.profiles WHERE id = NEW.user_id;

    -- Inseriamo una notifica per ogni admin e staff
    INSERT INTO public.notifications (user_id, actor_id, type, content)
    SELECT 
        p.id,           -- L'admin/staff da notificare
        NEW.user_id,    -- L'utente che ha fatto la richiesta (attore)
        'admin_info',   -- Tipo di notifica
        'Nuova richiesta di upgrade a ' || UPPER(NEW.requested_role) || ' da @' || COALESCE(requester_username, 'un utente')
    FROM public.profiles p
    WHERE p.role IN ('admin', 'staff');

    RETURN NEW;
END;
$$;

-- 5. Creazione del Trigger
DROP TRIGGER IF EXISTS on_role_request_created ON public.role_requests;
CREATE TRIGGER on_role_request_created
  AFTER INSERT ON public.role_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_on_role_request();

-- 6. Forza ricaricamento cache schema PostgREST
NOTIFY pgrst, 'reload schema';