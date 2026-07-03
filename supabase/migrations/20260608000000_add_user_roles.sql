-- =============================================
-- Add user roles + service ownership
-- =============================================

-- Role on profiles: 'admin' | 'client' | 'user' (default 'user')
-- Plain text + check constraint, consistent with the existing `stars integer check (...)` pattern (no enums in this schema)
alter table public.profiles
  add column if not exists role text not null default 'user'
    check (role in ('admin', 'client', 'user'));

-- Owner of a service: nullable — null means it was created by an admin via the Supabase dashboard
alter table public.services
  add column if not exists user_id uuid references auth.users(id) on delete set null;

-- Clients can insert their OWN services, forced to start pending review (is_active = false).
-- Role is re-checked here at the DB layer too — defense in depth, never rely on UI gating alone.
create policy "Clients insert own pending services"
  on public.services for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and is_active = false
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'client'
    )
  );

-- Owners can read their own services even while pending (is_active = false).
-- Postgres OR's multiple permissive policies for the same command, so this combines
-- with "Authenticated read active services" without breaking it.
create policy "Users read own services"
  on public.services for select
  to authenticated
  using (auth.uid() = user_id);

-- NOTE: handle_new_user() is intentionally NOT modified. raw_user_meta_data is
-- attacker-controlled (any user can pass { data: { role: 'admin' } } to signUp),
-- so role must rely solely on the column's `default 'user'`. Elevation to
-- 'client'/'admin' happens only through privileged server-side paths
-- (service-role key + explicit UPDATE), never through the signup trigger.
