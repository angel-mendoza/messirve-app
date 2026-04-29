-- =============================================
-- MESSIRVE APP - Initial Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- =============================================

-- Categories (managed by admin via Supabase dashboard)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  emoji text,
  "order" integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;

-- Anyone (including anonymous) can read categories
create policy "Public read categories"
  on public.categories for select using (true);

-- Insert default categories
insert into public.categories (name, slug, emoji, "order") values
  ('HOGAR', 'hogar', '🏠', 1),
  ('GASTRONOMÍA', 'gastronomia', '🍽️', 2),
  ('SALUD & BIENESTAR', 'salud-bienestar', '💊', 3),
  ('ARTE & ENTRETENIMIENTO', 'arte-entretenimiento', '🎨', 4),
  ('INDUMENTARIA & BELLEZA', 'indumentaria-belleza', '👗', 5),
  ('HOSPEDAJE PARA TURISTAS', 'hospedaje-turistas', '🏨', 6),
  ('ASESORÍA & GESTORÍA PARA INMIGRANTES', 'asesoria-gestoria', '📋', 7)
on conflict (slug) do nothing;

-- =============================================
-- Services (managed by admin via dashboard)
-- =============================================
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  description text,
  address text,
  city text not null default 'Barcelona',
  price_info text,
  phone text,
  website text,
  instagram text,
  photos text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.services enable row level security;

-- Authenticated users can view active services
create policy "Authenticated read active services"
  on public.services for select
  to authenticated
  using (is_active = true);

-- =============================================
-- User profiles
-- =============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================
-- Service likes
-- =============================================
create table if not exists public.service_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, service_id)
);
alter table public.service_likes enable row level security;

create policy "Authenticated read all likes"
  on public.service_likes for select
  to authenticated
  using (true);

create policy "Users manage own likes"
  on public.service_likes for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================
-- Service ratings (1 per user per service)
-- =============================================
create table if not exists public.service_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  stars integer not null check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, service_id)
);
alter table public.service_ratings enable row level security;

create policy "Authenticated read all ratings"
  on public.service_ratings for select
  to authenticated
  using (true);

create policy "Users manage own ratings"
  on public.service_ratings for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================
-- Service comments
-- =============================================
create table if not exists public.service_comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.service_comments enable row level security;

create policy "Authenticated read all comments"
  on public.service_comments for select
  to authenticated
  using (true);

create policy "Users insert own comments"
  on public.service_comments for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users delete own comments"
  on public.service_comments for delete
  to authenticated
  using (auth.uid() = user_id);

-- =============================================
-- Storage bucket for service photos
-- =============================================
insert into storage.buckets (id, name, public)
values ('service-photos', 'service-photos', true)
on conflict (id) do nothing;

-- Anyone can read service photos (public bucket)
create policy "Public read service photos"
  on storage.objects for select
  using (bucket_id = 'service-photos');

-- Only authenticated admins upload via dashboard (no app upload policy needed)
