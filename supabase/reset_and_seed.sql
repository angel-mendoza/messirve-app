-- =============================================
-- MESSIRVE RESET + SEED
-- Limpia datos existentes y recarga datos por defecto
-- =============================================

-- 1. Limpiar servicios e interacciones (CASCADE limpia las tablas dependientes)
TRUNCATE public.services CASCADE;

-- 3. Resetear contraseñas y datos de usuarios seed sin borrarlos
-- (Borrar/reinsertar en auth.users directamente corrompe el estado de GoTrue)
UPDATE auth.users SET
  encrypted_password = crypt('Test1234!', gen_salt('bf')),
  email_confirmed_at = now(),
  updated_at = now(),
  raw_user_meta_data = CASE email
    WHEN 'maria.garcia@test.com'     THEN '{"full_name":"María García"}'::jsonb
    WHEN 'carlos.lopez@test.com'     THEN '{"full_name":"Carlos López"}'::jsonb
    WHEN 'ana.martinez@test.com'     THEN '{"full_name":"Ana Martínez"}'::jsonb
    WHEN 'diego.rodriguez@test.com'  THEN '{"full_name":"Diego Rodríguez"}'::jsonb
    WHEN 'valentina.torres@test.com' THEN '{"full_name":"Valentina Torres"}'::jsonb
  END
WHERE email IN (
  'maria.garcia@test.com', 'carlos.lopez@test.com', 'ana.martinez@test.com',
  'diego.rodriguez@test.com', 'valentina.torres@test.com'
);

-- Si algún usuario no existe todavía, insertarlo
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, aud, role,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) VALUES
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'maria.garcia@test.com',
    crypt('Test1234!', gen_salt('bf')),
    now(), 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"María García"}',
    now(), now()
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'carlos.lopez@test.com',
    crypt('Test1234!', gen_salt('bf')),
    now(), 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Carlos López"}',
    now(), now()
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'ana.martinez@test.com',
    crypt('Test1234!', gen_salt('bf')),
    now(), 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Ana Martínez"}',
    now(), now()
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'diego.rodriguez@test.com',
    crypt('Test1234!', gen_salt('bf')),
    now(), 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Diego Rodríguez"}',
    now(), now()
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'valentina.torres@test.com',
    crypt('Test1234!', gen_salt('bf')),
    now(), 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Valentina Torres"}',
    now(), now()
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'María García'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Carlos López'),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'Ana Martínez'),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'Diego Rodríguez'),
  ('aaaaaaaa-0000-0000-0000-000000000005', 'Valentina Torres')
ON CONFLICT (id) DO NOTHING;

-- Identities para autenticación email/password
INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
VALUES
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000001',
    '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","email":"maria.garcia@test.com","email_verified":true}',
    'email', now(), now()
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000002',
    '{"sub":"aaaaaaaa-0000-0000-0000-000000000002","email":"carlos.lopez@test.com","email_verified":true}',
    'email', now(), now()
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000003',
    'aaaaaaaa-0000-0000-0000-000000000003',
    '{"sub":"aaaaaaaa-0000-0000-0000-000000000003","email":"ana.martinez@test.com","email_verified":true}',
    'email', now(), now()
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000004',
    'aaaaaaaa-0000-0000-0000-000000000004',
    '{"sub":"aaaaaaaa-0000-0000-0000-000000000004","email":"diego.rodriguez@test.com","email_verified":true}',
    'email', now(), now()
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000005',
    'aaaaaaaa-0000-0000-0000-000000000005',
    '{"sub":"aaaaaaaa-0000-0000-0000-000000000005","email":"valentina.torres@test.com","email_verified":true}',
    'email', now(), now()
  )
ON CONFLICT (provider_id, provider) DO NOTHING;

-- =============================================
-- 6. Servicios (3 por categoría)
-- =============================================

-- HOGAR
INSERT INTO public.services (id, category_id, name, description, address, city, price_info, phone, website, instagram, photos)
SELECT
  gen_random_uuid(), c.id, s.name, s.description, s.address, 'Barcelona',
  s.price_info, s.phone, s.website, s.instagram, '{}'
FROM public.categories c
CROSS JOIN (VALUES
  ('Limpiezas BCN Hogar', 'Servicio profesional de limpieza para hogares y oficinas. Contamos con personal capacitado y productos ecológicos. Servicio puntual y de confianza para toda la familia.', 'Carrer de Balmes, 45', '€15 por hora', '+34 931 234 567', 'https://limpiezasbcn.es', '@limpiezasbcn'),
  ('Mudanzas y Transportes Roca', 'Empresa de mudanzas con más de 10 años de experiencia en Barcelona. Embalaje, transporte y montaje de muebles incluido. Presupuesto sin compromiso.', 'Avinguda Diagonal, 112', 'Desde €150 por mudanza', '+34 932 345 678', NULL, '@mudanzasroca'),
  ('Fontanería Urgente 24h', 'Servicio de fontanería urgente disponible las 24 horas. Reparación de tuberías, instalación de sanitarios y detección de fugas. Sin cargo extra por urgencias nocturnas.', 'Carrer de Provença, 78', '€60 visita + materiales', '+34 933 456 789', NULL, NULL)
) AS s(name, description, address, price_info, phone, website, instagram)
WHERE c.slug = 'hogar';

-- GASTRONOMÍA
INSERT INTO public.services (id, category_id, name, description, address, city, price_info, phone, website, instagram, photos)
SELECT
  gen_random_uuid(), c.id, s.name, s.description, s.address, 'Barcelona',
  s.price_info, s.phone, s.website, s.instagram, '{}'
FROM public.categories c
CROSS JOIN (VALUES
  ('Caminito Grill Steak House', 'El mejor asado argentino en Barcelona. Carnes a la parrilla de primera calidad, empanadas caseras y vinos seleccionados. Un pedacito de Argentina en el corazón de Barcelona.', 'Carrer de l''Eixample, 27', '€20-40 por persona', '+34 934 567 890', 'https://caminitobcn.es', '@caminitobcn'),
  ('La Cocina de Mamá', 'Comida casera latinoamericana elaborada con recetas tradicionales. Menú del día con opciones venezolanas, colombianas y peruanas. Delivery disponible a toda Barcelona.', 'Carrer de Muntaner, 55', '€10-15 por persona', '+34 935 678 901', NULL, '@lacocinademama_bcn'),
  ('Café del Viajero', 'Café y espacio cultural para la comunidad inmigrante. Desayunos, meriendas y almuerzos ligeros. Punto de encuentro para compartir experiencias y hacer networking.', 'Carrer de la Diputació, 182', '€5-12 por persona', '+34 936 789 012', 'https://cafedelviajero.com', '@cafedelviajero')
) AS s(name, description, address, price_info, phone, website, instagram)
WHERE c.slug = 'gastronomia';

-- SALUD & BIENESTAR
INSERT INTO public.services (id, category_id, name, description, address, city, price_info, phone, website, instagram, photos)
SELECT
  gen_random_uuid(), c.id, s.name, s.description, s.address, 'Barcelona',
  s.price_info, s.phone, s.website, s.instagram, '{}'
FROM public.categories c
CROSS JOIN (VALUES
  ('Clínica Médica Central', 'Centro médico con atención en español. Médicos generalistas y especialistas. Asistencia a inmigrantes con y sin tarjeta sanitaria. Precios accesibles y pago en cuotas.', 'Carrer de Rosselló, 149', 'Consulta desde €40', '+34 934 111 222', 'https://clinicacentral.es', NULL),
  ('Centro de Yoga & Bienestar Alma', 'Clases de yoga, meditación y mindfulness en español. Ambiente familiar y acogedor. Primera clase gratis para nuevos integrantes. Horarios flexibles mañana y tarde.', 'Carrer de Mallorca, 220', '€8 clase suelta / €50 mensual', '+34 935 222 333', NULL, '@yogaalma_bcn'),
  ('Farmacia & Parafarmacia Salud Total', 'Farmacia con atención en español e inglés. Preparación de medicamentos sin receta española, asesoramiento nutricional y productos naturales. Envío a domicilio disponible.', 'Gran Via de les Corts Catalanes, 410', 'Precios de mercado', '+34 936 333 444', NULL, NULL)
) AS s(name, description, address, price_info, phone, website, instagram)
WHERE c.slug = 'salud-bienestar';

-- ARTE & ENTRETENIMIENTO
INSERT INTO public.services (id, category_id, name, description, address, city, price_info, phone, website, instagram, photos)
SELECT
  gen_random_uuid(), c.id, s.name, s.description, s.address, 'Barcelona',
  s.price_info, s.phone, s.website, s.instagram, '{}'
FROM public.categories c
CROSS JOIN (VALUES
  ('Galería Nuevo Mundo', 'Espacio de arte dedicado a artistas latinoamericanos en Barcelona. Exposiciones permanentes y temporales. Talleres de pintura, escultura y fotografía. Entrada libre algunos fines de semana.', 'Carrer del Consell de Cent, 330', 'Entrada €5 / Talleres desde €20', '+34 932 444 555', 'https://galerianuevomundo.com', '@galerianuevomundo'),
  ('Academia de Tango Buenos Aires BCN', 'Clases de tango argentino para todos los niveles. Milongas los viernes y sábados. Profesores certificados de Buenos Aires. El mejor ambiente para conectar con la cultura rioplatense.', 'Carrer de Viladomat, 133', '€12 clase / €15 milonga', '+34 933 555 666', NULL, '@tangobuenosairesbcn'),
  ('Teatro Cultural Latino', 'Espacio escénico dedicado a la cultura latinoamericana. Obras de teatro, conciertos de música latina, stand-up comedy y eventos culturales. Programación mensual variada.', 'Carrer de Parlament, 35', 'Desde €10 por entrada', '+34 934 666 777', 'https://teatroltino.es', '@teatrolatinobcn')
) AS s(name, description, address, price_info, phone, website, instagram)
WHERE c.slug = 'arte-entretenimiento';

-- INDUMENTARIA & BELLEZA
INSERT INTO public.services (id, category_id, name, description, address, city, price_info, phone, website, instagram, photos)
SELECT
  gen_random_uuid(), c.id, s.name, s.description, s.address, 'Barcelona',
  s.price_info, s.phone, s.website, s.instagram, '{}'
FROM public.categories c
CROSS JOIN (VALUES
  ('Peluquería & Estética Latina', 'Salón de belleza especializado en cabello afro, rizado y lacio. Cortes, tintes, alisados brasileños y keratinas. Manicura y pedicura. Atendemos en español y portugués.', 'Carrer de Còrsega, 305', 'Corte desde €15 / Tinte desde €40', '+34 935 777 888', NULL, '@peloluciabcn'),
  ('Ropa & Moda Latina', 'Tienda de ropa con las últimas tendencias latinoamericanas. Vestidos, accesorios y calzado importados directamente. También moda local española a precios competitivos.', 'Carrer de Girona, 88', 'Desde €15 por prenda', '+34 936 888 999', NULL, '@ropalatinabarcelona'),
  ('Centro de Belleza Natural', 'Tratamientos faciales y corporales con productos naturales. Masajes relajantes y terapéuticos, depilación láser y tratamientos anti-edad. Personal especializado y ambiente íntimo.', 'Carrer d''Aragó, 251', 'Masaje desde €35 / Facial desde €45', '+34 937 999 000', 'https://bellezanatural.es', '@bellezanaturalbcn')
) AS s(name, description, address, price_info, phone, website, instagram)
WHERE c.slug = 'indumentaria-belleza';

-- HOSPEDAJE PARA TURISTAS
INSERT INTO public.services (id, category_id, name, description, address, city, price_info, phone, website, instagram, photos)
SELECT
  gen_random_uuid(), c.id, s.name, s.description, s.address, 'Barcelona',
  s.price_info, s.phone, s.website, s.instagram, '{}'
FROM public.categories c
CROSS JOIN (VALUES
  ('Hostel Buenos Aires Barcelona', 'Alojamiento para mochileros y turistas latinoamericanos. Habitaciones compartidas y privadas. Cocina equipada, WiFi gratuito, lockers y ambiente social. Ideal para conocer gente nueva.', 'Carrer de la Rambla, 67', 'Desde €18/noche dormitorio', '+34 931 100 200', 'https://hostelbuenosaires.com', '@hostelbabcn'),
  ('Apartamentos El Born', 'Apartamentos amueblados en el barrio del Born. Alquiler por días, semanas o meses. WiFi, ropa de cama y limpieza incluida. Perfecta ubicación para explorar Barcelona.', 'Carrer del Comerç, 15', 'Desde €65/noche', '+34 932 200 300', 'https://apartamentosborn.es', '@apartamentosborn'),
  ('Pensión La Familia', 'Pensión familiar con trato personalizado. Habitaciones individuales y dobles con desayuno incluido. A 5 minutos del metro. Perfecta para largas estancias. Precios especiales por semana.', 'Carrer de la Unió, 43', '€35-55/noche con desayuno', '+34 933 300 400', NULL, NULL)
) AS s(name, description, address, price_info, phone, website, instagram)
WHERE c.slug = 'hospedaje-turistas';

-- ASESORÍA & GESTORÍA
INSERT INTO public.services (id, category_id, name, description, address, city, price_info, phone, website, instagram, photos)
SELECT
  gen_random_uuid(), c.id, s.name, s.description, s.address, 'Barcelona',
  s.price_info, s.phone, s.website, s.instagram, '{}'
FROM public.categories c
CROSS JOIN (VALUES
  ('Gestoría Legal Inmigrante', 'Asesoramiento legal integral para inmigrantes. Tramitación de NIE, TIE, permisos de residencia y trabajo. Reagrupación familiar, nacionalidad y recursos contra denegaciones. Primera consulta gratuita.', 'Carrer de Pelai, 12', 'Consulta desde €50 / Trámite desde €150', '+34 934 400 500', 'https://gestorialegal.es', '@gestorialegalinmigrante'),
  ('Asesoría Laboral & Fiscal BCN', 'Asesoramiento laboral y fiscal para trabajadores y autónomos inmigrantes. Alta en la Seguridad Social, declaración de la renta, contrato de trabajo y ERTE. Atención personalizada en español.', 'Rambla de Catalunya, 56', 'Desde €60 por consulta', '+34 935 500 600', NULL, '@asesorialaboralbcn'),
  ('Traducción & Apostilla Express', 'Servicio de traducción jurada de documentos oficiales. Apostilla de la Haya, legalización de documentos extranjeros y notaría. Más de 20 idiomas disponibles. Envío a domicilio.', 'Carrer de Pau Claris, 96', 'Traducción desde €30 por página', '+34 936 600 700', 'https://traduccionexpress.es', '@traduccionexpress')
) AS s(name, description, address, price_info, phone, website, instagram)
WHERE c.slug = 'asesoria-gestoria';

-- =============================================
-- 7. Interacciones de ejemplo
-- =============================================

CREATE TEMP TABLE seed_services AS
SELECT s.id, s.name, c.slug AS category_slug
FROM public.services s
JOIN public.categories c ON c.id = s.category_id
ORDER BY c.slug, s.created_at;

-- Likes: cada usuario da like a ~10 servicios aleatorios
INSERT INTO public.service_likes (user_id, service_id)
SELECT DISTINCT u.id, s.id
FROM (VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001'::uuid),
  ('aaaaaaaa-0000-0000-0000-000000000002'::uuid),
  ('aaaaaaaa-0000-0000-0000-000000000003'::uuid),
  ('aaaaaaaa-0000-0000-0000-000000000004'::uuid),
  ('aaaaaaaa-0000-0000-0000-000000000005'::uuid)
) u(id)
CROSS JOIN (SELECT id FROM seed_services ORDER BY random() LIMIT 10) s
ON CONFLICT (user_id, service_id) DO NOTHING;

-- Ratings
INSERT INTO public.service_ratings (user_id, service_id, stars)
SELECT u.user_id, s.id, u.stars
FROM (VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001'::uuid, 5),
  ('aaaaaaaa-0000-0000-0000-000000000002'::uuid, 4),
  ('aaaaaaaa-0000-0000-0000-000000000003'::uuid, 5),
  ('aaaaaaaa-0000-0000-0000-000000000004'::uuid, 3),
  ('aaaaaaaa-0000-0000-0000-000000000005'::uuid, 4)
) u(user_id, stars)
CROSS JOIN (SELECT id FROM seed_services ORDER BY random() LIMIT 8) s
ON CONFLICT (user_id, service_id) DO NOTHING;

-- Comentarios en gastronomía
INSERT INTO public.service_comments (user_id, service_id, content)
SELECT u.user_id, s.id, u.comment
FROM (VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001'::uuid, 'Un lugar increíble, la comida es deliciosa y el trato excelente. 100% recomendado para toda la comunidad latina.'),
  ('aaaaaaaa-0000-0000-0000-000000000002'::uuid, 'Muy buena atención, precios razonables. Me recordó a los sabores de casa.'),
  ('aaaaaaaa-0000-0000-0000-000000000003'::uuid, 'Perfecto para reuniones familiares. El personal es muy amable y hablan en español.'),
  ('aaaaaaaa-0000-0000-0000-000000000004'::uuid, 'La mejor opción que encontré en Barcelona. Definitivamente vuelvo pronto.'),
  ('aaaaaaaa-0000-0000-0000-000000000005'::uuid, 'Servicio de calidad y ubicación muy conveniente. Lo recomiendo a todos mis amigos.')
) u(user_id, comment)
CROSS JOIN (SELECT id FROM seed_services WHERE category_slug = 'gastronomia' LIMIT 3) s
ON CONFLICT DO NOTHING;

-- Comentarios en asesoría
INSERT INTO public.service_comments (user_id, service_id, content)
SELECT u.user_id, s.id, u.comment
FROM (VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001'::uuid, 'Me ayudaron con todos mis trámites de residencia. Muy profesionales y honestos con los tiempos.'),
  ('aaaaaaaa-0000-0000-0000-000000000003'::uuid, 'Excelente gestoría. Me explicaron todo el proceso paso a paso sin complicaciones.'),
  ('aaaaaaaa-0000-0000-0000-000000000005'::uuid, 'Muy recomendados. Sin ellos no hubiera podido regularizar mi situación tan rápido.')
) u(user_id, comment)
CROSS JOIN (SELECT id FROM seed_services WHERE category_slug = 'asesoria-gestoria' LIMIT 2) s
ON CONFLICT DO NOTHING;

DROP TABLE IF EXISTS seed_services;

-- Refrescar cache de PostgREST para evitar "database error querying schema"
NOTIFY pgrst, 'reload schema';
