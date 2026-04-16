-- Tabella per tracciare le visualizzazioni delle storie
CREATE TABLE IF NOT EXISTS public.story_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

-- Abilita RLS
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

-- Politiche di sicurezza
-- 1. Gli utenti possono vedere le visualizzazioni solo delle PROPRIE storie
CREATE POLICY "Users can view views for their own stories" ON public.story_views
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.stories
    WHERE stories.id = story_views.story_id
    AND stories.user_id = auth.uid()
  )
);

-- 2. Gli utenti possono inserire la propria visualizzazione
CREATE POLICY "Users can insert their own views" ON public.story_views
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);