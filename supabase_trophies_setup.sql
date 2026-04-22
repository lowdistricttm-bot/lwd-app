-- Tabella definizioni Trofei (già creata, aggiungiamo i premi reali)
CREATE TABLE IF NOT EXISTS public.trophies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_name TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pulizia e inserimento premi ufficiali Low District
DELETE FROM public.trophies;

INSERT INTO public.trophies (title, description, event_name, category) VALUES
('BEST OF SHOW', 'Il riconoscimento supremo dell''evento.', 'SEASON 4', 'of_show'),
('BEST FITMENT', 'Precisione millimetrica tra cerchio e parafango.', 'SEASON 4', 'best_fitment'),
('BEST STATIC', 'Assetto statico estremo senza compromessi.', 'SEASON 4', 'best_static'),
('BEST AIR', 'Miglior gestione e pulizia dell''assetto a aria.', 'SEASON 4', 'best_air'),
('BEST INTERIOR', 'Cura maniacale dei dettagli interni.', 'SEASON 4', 'best_interior'),
('BEST WHEELS', 'La scelta di cerchi più iconica e azzeccata.', 'SEASON 4', 'best_wheels'),
('TOP 10 SELECTION', 'Selezionato tra i migliori 10 progetti.', 'SEASON 4', 'top_10'),
('LADY DISTRICT', 'Miglior progetto femminile del District.', 'SEASON 4', 'lady'),
('CLEANEST PROJECT', 'Il progetto più pulito e coerente.', 'SEASON 4', 'clean');