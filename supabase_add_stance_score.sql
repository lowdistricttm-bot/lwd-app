-- Aggiunta colonna per il punteggio stance
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS stance_score INTEGER;

-- Commento per chiarezza
COMMENT ON COLUMN public.vehicles.stance_score IS 'Punteggio calcolato dall AI Stance Analyzer';