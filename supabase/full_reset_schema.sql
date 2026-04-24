-- =============================================
-- FULL RESET: borra TODO y recrea el schema
-- =============================================

-- 1. Borrar tablas públicas
DROP TABLE IF EXISTS public.service_comments CASCADE;
DROP TABLE IF EXISTS public.service_ratings CASCADE;
DROP TABLE IF EXISTS public.service_likes CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;

-- 2. Borrar todos los usuarios de auth (cascadea a sessions, refresh_tokens, identities)
DELETE FROM auth.users;

-- 3. Recrear schema desde la migración
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  emoji text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);

INSERT INTO public.categories (name, slug, emoji) VALUES
  ('HOGAR', 'hogar', '🏠'),
  ('GASTRONOMÍA', 'gastronomia', '🍽️'),
  ('SALUD & BIENESTAR', 'salud-bienestar', '💊'),
  ('ARTE & ENTRETENIMIENTO', 'arte-entretenimiento', '🎨'),
  ('INDUMENTARIA & BELLEZA', 'indumentaria-belleza', '👗'),
  ('HOSPEDAJE PARA TURISTAS', 'hospedaje-turistas', '🏨'),
  ('ASESORÍA & GESTORÍA PARA INMIGRANTES', 'asesoria-gestoria', '📋')
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  address text,
  city text NOT NULL DEFAULT 'Barcelona',
  price_info text,
  phone text,
  website text,
  instagram text,
  photos text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read active services" ON public.services FOR SELECT TO authenticated USING (is_active = true);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile"   ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.service_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, service_id)
);
ALTER TABLE public.service_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read all likes" ON public.service_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage own likes"       ON public.service_likes FOR ALL    TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.service_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  stars integer NOT NULL CHECK (stars BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, service_id)
);
ALTER TABLE public.service_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read all ratings" ON public.service_ratings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage own ratings"       ON public.service_ratings FOR ALL    TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.service_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.service_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read all comments" ON public.service_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own comments"       ON public.service_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own comments"       ON public.service_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

INSERT INTO storage.buckets (id, name, public) VALUES ('service-photos', 'service-photos', true) ON CONFLICT (id) DO NOTHING;
