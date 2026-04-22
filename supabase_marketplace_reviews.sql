-- Aggiunta colonna status a marketplace_items se non esiste
ALTER TABLE public.marketplace_items ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Creazione tabella seller_reviews
CREATE TABLE IF NOT EXISTS public.seller_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(seller_id, reviewer_id)
);

ALTER TABLE public.seller_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for reviews" ON public.seller_reviews
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reviews" ON public.seller_reviews
FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews" ON public.seller_reviews
FOR UPDATE TO authenticated USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews" ON public.seller_reviews
FOR DELETE TO authenticated USING (auth.uid() = reviewer_id);