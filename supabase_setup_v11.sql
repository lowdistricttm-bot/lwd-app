-- 1. Timeline Privata e Logbook Manutenzione
CREATE TABLE public.vehicle_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('modification', 'maintenance', 'reminder')),
  title TEXT NOT NULL,
  description TEXT,
  mileage INTEGER,
  cost DECIMAL(10,2),
  event_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reminder_date TIMESTAMP WITH TIME ZONE,
  is_private BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. District Meet (Raduni Spontanei)
CREATE TABLE public.spontaneous_meets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('coffee', 'photo', 'wash', 'drive')),
  location_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 3. Marketplace P2P
CREATE TABLE public.marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('wheels', 'interior', 'exterior', 'performance', 'other')),
  price DECIMAL(10,2),
  description TEXT,
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Abilitazione RLS
ALTER TABLE public.vehicle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spontaneous_meets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;

-- Politiche RLS
CREATE POLICY "Users can manage own logs" ON public.vehicle_logs
FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Public can view meets" ON public.spontaneous_meets
FOR SELECT USING (expires_at > now());

CREATE POLICY "Users can manage own meets" ON public.spontaneous_meets
FOR ALL TO authenticated USING (auth.uid() = creator_id);

CREATE POLICY "Public can view marketplace" ON public.marketplace_items
FOR SELECT USING (status = 'available');

CREATE POLICY "Users can manage own items" ON public.marketplace_items
FOR ALL TO authenticated USING (auth.uid() = seller_id);