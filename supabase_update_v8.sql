-- Assicuriamoci che la policy di eliminazione per i post sia attiva
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
CREATE POLICY "Users can delete their own posts" ON public.posts
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Nota: I vincoli ON DELETE CASCADE dovrebbero essere gestiti a livello di schema.
-- Se non lo sono, questa query assicura che l'utente possa pulire i propri dati correlati.
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
CREATE POLICY "Users can delete their own comments" ON public.comments
FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;
CREATE POLICY "Users can delete their own likes" ON public.likes
FOR DELETE TO authenticated USING (auth.uid() = user_id);