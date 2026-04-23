-- Delete incorrectly inserted seed users and all their related data
DELETE FROM auth.identities WHERE user_id::text LIKE 'aaaaaaaa-0000-0000-0000-00000000000%';
DELETE FROM public.service_comments WHERE user_id::text LIKE 'aaaaaaaa-0000-0000-0000-00000000000%';
DELETE FROM public.service_ratings WHERE user_id::text LIKE 'aaaaaaaa-0000-0000-0000-00000000000%';
DELETE FROM public.service_likes WHERE user_id::text LIKE 'aaaaaaaa-0000-0000-0000-00000000000%';
DELETE FROM public.profiles WHERE id::text LIKE 'aaaaaaaa-0000-0000-0000-00000000000%';
DELETE FROM auth.users WHERE id::text LIKE 'aaaaaaaa-0000-0000-0000-00000000000%';
