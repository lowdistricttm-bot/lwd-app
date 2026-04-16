-- Assicuriamoci che la tabella sia pulita e configurata bene
DROP POLICY IF EXISTS "story_views_insert_policy" ON public.story_views;
DROP POLICY IF EXISTS "story_views_select_policy" ON public.story_views;

-- 1. Permetti l'inserimento a tutti gli utenti autenticati
CREATE POLICY "story_views_insert_policy" ON public.story_views
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Permetti la lettura al proprietario della storia (join diretto su stories)
CREATE POLICY "story_views_select_policy" ON public.story_views
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.stories 
    WHERE stories.id = story_views.story_id 
    AND stories.user_id = auth.uid()
  )
);

-- Forza l'abilitazione del Realtime (metodo sicuro)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE tablename = 'story_views') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE story_views;
  END IF;
END $$;