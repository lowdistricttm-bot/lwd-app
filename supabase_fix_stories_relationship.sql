-- Crea la relazione mancante tra stories e profiles
-- Questo permette a Supabase di unire le tabelle e recuperare username/avatar
ALTER TABLE public.stories
DROP CONSTRAINT IF EXISTS stories_user_id_fkey;

ALTER TABLE public.stories
ADD CONSTRAINT stories_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Assicuriamoci che RLS permetta la lettura dei profili legati alle storie
CREATE POLICY "stories_profiles_read" ON public.profiles
FOR SELECT USING (true);