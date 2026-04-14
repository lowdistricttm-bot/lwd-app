-- Aggiunta della policy per permettere l'aggiornamento dei voti (necessaria per l'upsert)
CREATE POLICY "Staff and Admin can update votes" ON public.application_votes
FOR UPDATE TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff', 'support')
)
WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff', 'support')
);

-- Aggiunta della policy per permettere l'eliminazione dei voti (opzionale ma consigliata)
CREATE POLICY "Staff and Admin can delete votes" ON public.application_votes
FOR DELETE TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff', 'support')
);