-- Abilita RLS sulla tabella events (se non già fatto)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policy per permettere agli amministratori di inserire nuovi eventi
CREATE POLICY "Admins can insert events" ON public.events
FOR INSERT TO authenticated
WITH CHECK (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Policy per permettere agli amministratori di aggiornare gli eventi esistenti
CREATE POLICY "Admins can update events" ON public.events
FOR UPDATE TO authenticated
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Policy per permettere agli amministratori di eliminare gli eventi
CREATE POLICY "Admins can delete events" ON public.events
FOR DELETE TO authenticated
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);