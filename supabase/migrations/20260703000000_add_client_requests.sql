-- =============================================
-- Client role requests
-- =============================================

-- Users request to become a 'client' (unlocks publishing services) instead of being
-- promoted directly by an admin. One row per user forever — re-requesting after a
-- rejection reuses the same row instead of piling up duplicates.
create table if not exists public.client_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  message text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.client_requests enable row level security;

-- Users can read only their own request — used by the dashboard card to show its status
create policy "Users read own client request"
  on public.client_requests for select
  to authenticated
  using (auth.uid() = user_id);

-- Users create their own request, always starting pending. Role is re-checked here at
-- the DB layer too — defense in depth, never rely on UI gating alone (mirrors
-- "Clients insert own pending services" from 20260608000000_add_user_roles.sql).
create policy "Users insert own client request"
  on public.client_requests for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and status = 'pending'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'user'
    )
  );

-- Users can retry after a rejection by flipping their own row back to pending.
-- USING checks the row's current (old) state, WITH CHECK checks the new state —
-- this is the only transition a plain user is ever allowed to make directly.
create policy "Users retry own rejected client request"
  on public.client_requests for update
  to authenticated
  using (auth.uid() = user_id and status = 'rejected')
  with check (auth.uid() = user_id and status = 'pending');

-- No admin policies here on purpose: admin approve/reject goes through createAdminClient()
-- (service-role key, bypasses RLS) after re-checking profile.role = 'admin' server-side —
-- same pattern as every other admin mutation in this codebase.
