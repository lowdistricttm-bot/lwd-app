-- Rimuovo le vecchie policy per resettarle correttamente
DROP POLICY IF EXISTS "Users can view views for their own stories" ON public.story_views;
DROP POLICY IF EXISTS "Users can insert their own views" ON public.story_views;

-- 1. Permetti a chiunque autenticato di inserire una visualizzazione (il check user_id garantisce l'identità)
CREATE POLICY "story_views_insert_policy" ON public.story_views
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Permetti al proprietario della storia di vedere chi l'ha visualizzata
CREATE POLICY "story_views_select_policy" ON public.story_views
FOR SELECT TO authenticated
USING (
  story_id IN (
    SELECT id FROM public.stories WHERE user_id = auth.uid()
  )
);

-- Assicuriamoci che il Realtime sia attivo per questa tabella
ALTER PUBLICATION supabase_realtime ADD TABLE story_views;