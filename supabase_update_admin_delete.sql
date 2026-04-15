-- Permetti a Admin e Staff di eliminare le candidature
CREATE POLICY "Staff and Admin can delete applications" ON public.applications
FOR DELETE TO authenticated USING (
  ((SELECT role FROM public.profiles WHERE id = auth.uid()) = ANY (ARRAY['admin'::text, 'staff'::text]))
);