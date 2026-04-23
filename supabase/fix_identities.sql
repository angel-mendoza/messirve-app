-- Fix: insert missing auth.identities for seed users
-- GoTrue needs these to authenticate email/password users
-- Note: 'email' column is generated, do not insert it

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
