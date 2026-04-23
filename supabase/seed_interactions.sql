-- Re-seed interactions using the properly created user IDs
-- Run after users are created via Admin API

-- Likes: each user likes ~8 services randomly
INSERT INTO public.service_likes (user_id, service_id)
SELECT DISTINCT u.id, s.id
FROM auth.users u
CROSS JOIN (
  SELECT id FROM public.services ORDER BY random() LIMIT 8
) s
WHERE u.email LIKE '%@test.com'
ON CONFLICT (user_id, service_id) DO NOTHING;

-- Ratings: 1 per user per service, varied stars
INSERT INTO public.service_ratings (user_id, service_id, stars)
SELECT
  u.id,
  s.id,
  (ARRAY[5,4,5,3,4])[u.rn] as stars
FROM (
  SELECT id, email, ROW_NUMBER() OVER (ORDER BY email) as rn
  FROM auth.users
  WHERE email LIKE '%@test.com'
) u
CROSS JOIN (
  SELECT id FROM public.services ORDER BY random() LIMIT 6
) s
ON CONFLICT (user_id, service_id) DO NOTHING;

-- Comments on Gastronomía services
INSERT INTO public.service_comments (user_id, service_id, content)
SELECT u.id, s.id, c.content
FROM auth.users u
CROSS JOIN (
  SELECT s.id
  FROM public.services s
  JOIN public.categories c ON c.id = s.category_id
  WHERE c.slug = 'gastronomia'
  LIMIT 2
) s
CROSS JOIN (
  VALUES
    ('Un lugar increíble, la comida es deliciosa y el trato excelente. 100% recomendado para toda la comunidad latina.'),
    ('Muy buena atención y precios razonables. Me recordó a los sabores de casa.'),
    ('Perfecto para reuniones familiares. El personal es muy amable y habla en español.')
) c(content)
WHERE u.email LIKE '%@test.com'
  AND u.email IN ('maria.garcia@test.com', 'carlos.lopez@test.com', 'ana.martinez@test.com')
ON CONFLICT DO NOTHING;

-- Comments on Asesoría & Gestoría services
INSERT INTO public.service_comments (user_id, service_id, content)
SELECT u.id, s.id, c.content
FROM auth.users u
CROSS JOIN (
  SELECT s.id
  FROM public.services s
  JOIN public.categories c ON c.id = s.category_id
  WHERE c.slug = 'asesoria-gestoria'
  LIMIT 2
) s
CROSS JOIN (
  VALUES
    ('Me ayudaron con todos mis trámites de residencia. Muy profesionales y honestos con los tiempos.'),
    ('Excelente gestoría. Me explicaron todo el proceso paso a paso sin complicaciones.')
) c(content)
WHERE u.email LIKE '%@test.com'
  AND u.email IN ('diego.rodriguez@test.com', 'valentina.torres@test.com')
ON CONFLICT DO NOTHING;
