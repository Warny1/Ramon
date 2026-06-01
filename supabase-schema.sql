create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'member' check (role in ('admin', 'coach', 'member')),
  member_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.app_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.app_state enable row level security;

drop policy if exists "Allow public app state read" on public.app_state;
drop policy if exists "Allow public app state insert" on public.app_state;
drop policy if exists "Allow public app state update" on public.app_state;
drop policy if exists "Profiles can read own profile" on public.profiles;
drop policy if exists "Authenticated users can read app state" on public.app_state;
drop policy if exists "Admins and coaches can insert app state" on public.app_state;
drop policy if exists "Admins and coaches can update app state" on public.app_state;

create policy "Profiles can read own profile"
on public.profiles
for select
using (auth.uid() = user_id);

create policy "Authenticated users can read app state"
on public.app_state
for select
using (auth.role() = 'authenticated');

create policy "Admins and coaches can insert app state"
on public.app_state
for insert
with check (
  exists (
    select 1
    from public.profiles profile
    where profile.user_id = auth.uid()
      and profile.role in ('admin', 'coach')
  )
);

create policy "Admins and coaches can update app state"
on public.app_state
for update
using (
  exists (
    select 1
    from public.profiles profile
    where profile.user_id = auth.uid()
      and profile.role in ('admin', 'coach')
  )
)
with check (
  exists (
    select 1
    from public.profiles profile
    where profile.user_id = auth.uid()
      and profile.role in ('admin', 'coach')
  )
);
