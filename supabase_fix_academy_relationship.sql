-- Aggiunge il vincolo di chiave esterna mancante
ALTER TABLE public.academy_tutorials
DROP CONSTRAINT IF EXISTS academy_tutorials_author_id_fkey;

ALTER TABLE public.academy_tutorials
ADD CONSTRAINT academy_tutorials_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES public.profiles(id)
ON DELETE SET NULL;

-- Notifica a PostgREST di ricaricare lo schema (opzionale, solitamente automatico)
NOTIFY pgrst, 'reload schema';