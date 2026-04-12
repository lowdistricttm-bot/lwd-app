-- Crea la tabella stories
create table stories (
  id uuid default gen_random_uuid() primary key,
  user_id bigint not null, -- Usiamo bigint perché gli ID di WordPress sono numeri
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Abilita la sicurezza (RLS)
alter table stories enable row level security;

-- Permetti a chiunque di vedere le storie
create policy "Le storie sono visibili a tutti" on stories
  for select using (true);

-- Permetti l'inserimento delle storie
create policy "Tutti possono inserire storie" on stories
  for insert with check (true);