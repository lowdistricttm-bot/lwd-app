-- Aggiunta colonna per la locandina se non esiste
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Permessi per gli amministratori (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can insert events" ON public.events
FOR INSERT TO authenticated WITH CHECK (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

CREATE POLICY "Admins can update events" ON public.events
FOR UPDATE TO authenticated USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

CREATE POLICY "Admins can delete events" ON public.events
FOR DELETE TO authenticated USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);