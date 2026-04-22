ALTER TABLE public.meets ADD COLUMN IF NOT EXISTS privacy TEXT DEFAULT 'public';
ALTER TABLE public.meets ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

ALTER TABLE public.carovane ADD COLUMN IF NOT EXISTS privacy TEXT DEFAULT 'public';
ALTER TABLE public.carovane ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

DROP POLICY IF EXISTS "meets_read_policy" ON public.meets;
CREATE POLICY "meets_read_policy" ON public.meets
FOR SELECT USING (
  privacy = 'public' 
  OR user_id = auth.uid() 
  OR EXISTS (SELECT 1 FROM meet_participants WHERE meet_id = meets.id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Carovane leggibili da tutti" ON public.carovane;
CREATE POLICY "Carovane leggibili da tutti" ON public.carovane
FOR SELECT USING (
  privacy = 'public' 
  OR creator_id = auth.uid() 
  OR EXISTS (SELECT 1 FROM carovane_partecipanti WHERE carovana_id = carovane.id AND user_id = auth.uid())
);

CREATE OR REPLACE FUNCTION public.join_by_invite_code(p_code TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_meet_id UUID;
  v_carovana_id UUID;
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Non autenticato';
  END IF;

  -- Cerca nei meet
  SELECT id INTO v_meet_id FROM public.meets WHERE invite_code = p_code LIMIT 1;
  IF v_meet_id IS NOT NULL THEN
    INSERT INTO public.meet_participants (meet_id, user_id) 
    VALUES (v_meet_id, v_user_id)
    ON CONFLICT DO NOTHING;
    RETURN json_build_object('type', 'meet', 'id', v_meet_id);
  END IF;

  -- Cerca nelle carovane
  SELECT id INTO v_carovana_id FROM public.carovane WHERE invite_code = p_code LIMIT 1;
  IF v_carovana_id IS NOT NULL THEN
    INSERT INTO public.carovane_partecipanti (carovana_id, user_id) 
    VALUES (v_carovana_id, v_user_id)
    ON CONFLICT DO NOTHING;
    RETURN json_build_object('type', 'carovana', 'id', v_carovana_id);
  END IF;

  RAISE EXCEPTION 'Codice invito non valido o scaduto';
END;
$$;