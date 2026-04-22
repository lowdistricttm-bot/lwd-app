-- 1. Creazione Tabella Academy
CREATE TABLE IF NOT EXISTS public.academy_tutorials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- 'mechanics', 'bodywork', 'wheels', 'air-suspension', 'static'
  image_url TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Abilitazione Row Level Security (RLS)
ALTER TABLE public.academy_tutorials ENABLE ROW LEVEL SECURITY;

-- 3. Politiche di Sicurezza (RLS)

-- Tutti gli utenti (anche non loggati) possono leggere i tutorial
DROP POLICY IF EXISTS "Academy public read" ON public.academy_tutorials;
CREATE POLICY "Academy public read" ON public.academy_tutorials
FOR SELECT USING (true);

-- Solo Staff, Admin e Support possono creare nuovi tutorial
DROP POLICY IF EXISTS "Staff can insert tutorials" ON public.academy_tutorials;
CREATE POLICY "Staff can insert tutorials" ON public.academy_tutorials
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role IN ('admin', 'staff', 'support') OR profiles.is_admin = true)
  )
);

-- L'autore originale o un Admin possono modificare i tutorial esistenti
DROP POLICY IF EXISTS "Staff can update tutorials" ON public.academy_tutorials;
CREATE POLICY "Staff can update tutorials" ON public.academy_tutorials
FOR UPDATE TO authenticated USING (
  auth.uid() = author_id OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- L'autore originale o un Admin possono eliminare i tutorial
DROP POLICY IF EXISTS "Staff can delete tutorials" ON public.academy_tutorials;
CREATE POLICY "Staff can delete tutorials" ON public.academy_tutorials
FOR DELETE TO authenticated USING (
  auth.uid() = author_id OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 4. Funzione e Trigger per l'aggiornamento automatico della colonna updated_at
CREATE OR REPLACE FUNCTION public.handle_academy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_academy_updated_at ON public.academy_tutorials;
CREATE TRIGGER set_academy_updated_at
BEFORE UPDATE ON public.academy_tutorials
FOR EACH ROW EXECUTE FUNCTION public.handle_academy_updated_at();