-- Aggiungiamo un vincolo di unicità per permettere l'upsert (evita l'errore Failed to fetch dovuto a conflitti DB)
ALTER TABLE public.story_views 
ADD CONSTRAINT story_views_user_story_unique UNIQUE (story_id, user_id);

-- Assicuriamoci che le RLS per i messaggi e i like siano corrette
ALTER TABLE public.story_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy per permettere l'inserimento dei like
DROP POLICY IF EXISTS "story_likes_insert_policy" ON public.story_likes;
CREATE POLICY "story_likes_insert_policy" ON public.story_likes
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Policy per permettere l'invio dei messaggi (necessaria per il DM automatico)
DROP POLICY IF EXISTS "messages_insert_policy" ON public.messages;
CREATE POLICY "messages_insert_policy" ON public.messages
FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);