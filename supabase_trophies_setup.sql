-- Tabella definizioni Trofei
CREATE TABLE public.trophies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_name TEXT NOT NULL, -- es: "Season 4 - 2025"
  category TEXT NOT NULL, -- es: "best_fitment", "best_static", "top_10"
  image_url TEXT, -- Icona o render 3D del trofeo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella assegnazione Trofei
CREATE TABLE public.user_trophies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  trophy_id UUID REFERENCES public.trophies(id) ON DELETE CASCADE NOT NULL,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, trophy_id, vehicle_id)
);

-- RLS
ALTER TABLE public.trophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trophies ENABLE ROW LEVEL SECURITY;

-- Tutti possono vedere i trofei
CREATE POLICY "trophies_read_policy" ON public.trophies FOR SELECT USING (true);
CREATE POLICY "user_trophies_read_policy" ON public.user_trophies FOR SELECT USING (true);

-- Solo Admin/Staff possono gestire i trofei
CREATE POLICY "trophies_admin_policy" ON public.trophies
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')
  )
);

CREATE POLICY "user_trophies_admin_policy" ON public.user_trophies
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')
  )
);

-- Inserimento trofei base di esempio
INSERT INTO public.trophies (title, description, event_name, category) VALUES
('BEST FITMENT', 'Assegnato al progetto con la precisione millimetrica tra cerchio e parafango.', 'SEASON 4', 'best_fitment'),
('BEST STATIC', 'Il re del ferro. Assetto statico estremo senza compromessi.', 'SEASON 4', 'best_static'),
('BEST OF SHOW', 'Il premio supremo. L''auto che incarna l''essenza Low District.', 'SEASON 4', 'best_of_show'),
('TOP 10 SELECTION', 'Selezionato tra i migliori 10 progetti dell''evento.', 'SEASON 4', 'top_10');