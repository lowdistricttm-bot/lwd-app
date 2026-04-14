-- Rimuovo le vecchie politiche restrittive
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;
DROP POLICY IF EXISTS "Gli utenti possono eliminare i propri messaggi" ON public.messages;

-- Nuova politica per i Post: l'autore può cancellare il post
CREATE POLICY "posts_delete_policy" ON public.posts
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Nuova politica per i Messaggi: un utente può cancellare un messaggio se ne è il mittente O il destinatario
-- Questo permette di eliminare l'intera cronologia di una conversazione
CREATE POLICY "messages_delete_policy" ON public.messages
FOR DELETE TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Assicuriamoci che i commenti e i like possano essere rimossi dall'autore
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
CREATE POLICY "comments_delete_policy" ON public.comments
FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;
CREATE POLICY "likes_delete_policy" ON public.likes
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Ricarica lo schema
NOTIFY pgrst, 'reload schema';