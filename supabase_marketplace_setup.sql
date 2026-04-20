-- Tabella per gli annunci del Marketplace
CREATE TABLE IF NOT EXISTS public.marketplace_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Abilitazione RLS
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;

-- Policy: Tutti possono vedere gli annunci (inclusi i semplici iscritti)
CREATE POLICY "marketplace_read_policy" ON public.marketplace_items
FOR SELECT USING (true);

-- Policy: Gli utenti autenticati possono pubblicare e gestire i propri annunci
CREATE POLICY "marketplace_insert_policy" ON public.marketplace_items
FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "marketplace_update_policy" ON public.marketplace_items
FOR UPDATE TO authenticated USING (auth.uid() = seller_id);

CREATE POLICY "marketplace_delete_policy" ON public.marketplace_items
FOR DELETE TO authenticated USING (auth.uid() = seller_id);