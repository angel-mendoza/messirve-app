#!/bin/bash
# =============================================
# MESSIRVE FULL RESET
# Limpia todo y recarga desde cero
# =============================================

SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2bmVya3hnaHh1dmVkZ2l1eXZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjgwODI4OCwiZXhwIjoyMDkyMzg0Mjg4fQ.3Z366SFifRnAIzVfqsyzt0xLL4Uf9R16i9naTTzMCTU"
AUTH_URL="https://evnerkxghxuvedgiuyvv.supabase.co/auth/v1/admin/users"

echo "==> 1. Limpiando base de datos..."
npx supabase db query --linked --file supabase/full_reset_schema.sql

echo "==> 2. Creando usuarios via GoTrue admin API..."

create_user() {
  local id=$1
  local email=$2
  local full_name=$3

  curl -s -X POST "$AUTH_URL" \
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
    -H "apikey: $SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"id\": \"$id\",
      \"email\": \"$email\",
      \"password\": \"Test1234!\",
      \"email_confirm\": true,
      \"user_metadata\": { \"full_name\": \"$full_name\" }
    }" | grep -o '"id":"[^"]*"' | head -1
}

create_user "aaaaaaaa-0000-0000-0000-000000000001" "maria.garcia@test.com"     "María García"
create_user "aaaaaaaa-0000-0000-0000-000000000002" "carlos.lopez@test.com"     "Carlos López"
create_user "aaaaaaaa-0000-0000-0000-000000000003" "ana.martinez@test.com"     "Ana Martínez"
create_user "aaaaaaaa-0000-0000-0000-000000000004" "diego.rodriguez@test.com"  "Diego Rodríguez"
create_user "aaaaaaaa-0000-0000-0000-000000000005" "valentina.torres@test.com" "Valentina Torres"

echo ""
echo "==> 3. Cargando servicios e interacciones..."
npx supabase db query --linked --file supabase/full_reset_seed.sql

echo ""
echo "==> Verificando..."
npx supabase db query --linked "SELECT (SELECT COUNT(*) FROM public.services) AS services, (SELECT COUNT(*) FROM public.categories) AS categories, (SELECT COUNT(*) FROM auth.users WHERE email LIKE '%@test.com') AS test_users, (SELECT COUNT(*) FROM public.service_likes) AS likes, (SELECT COUNT(*) FROM public.service_ratings) AS ratings, (SELECT COUNT(*) FROM public.service_comments) AS comments;"

echo ""
echo "==> Reset completo!"
