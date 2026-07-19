create table if not exists public.app_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

drop policy if exists "Allow public app state read" on public.app_state;
drop policy if exists "Allow public app state insert" on public.app_state;
drop policy if exists "Allow public app state update" on public.app_state;
drop policy if exists "Authenticated users can read app state" on public.app_state;
drop policy if exists "Admins and coaches can insert app state" on public.app_state;
drop policy if exists "Admins and coaches can update app state" on public.app_state;

create policy "Allow public app state read"
on public.app_state
for select
using (true);

create policy "Allow public app state insert"
on public.app_state
for insert
with check (true);

create policy "Allow public app state update"
on public.app_state
for update
using (true)
with check (true);

create table if not exists public.app_settings (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.members (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.schedules (
  id text primary key,
  member_id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id text primary key,
  member_id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.attendances (
  id text primary key,
  member_id text not null,
  record_key text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  unique (member_id, record_key)
);

create index if not exists schedules_member_id_idx on public.schedules (member_id);
create index if not exists payments_member_id_idx on public.payments (member_id);
create index if not exists attendances_member_id_idx on public.attendances (member_id);
create index if not exists attendances_updated_at_idx on public.attendances (updated_at);

create table if not exists public.app_backups (
  id text primary key,
  backup_date date not null,
  source text not null default 'vercel-cron',
  data jsonb not null,
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists app_backups_backup_date_idx on public.app_backups (backup_date desc);

alter table public.app_settings enable row level security;
alter table public.members enable row level security;
alter table public.schedules enable row level security;
alter table public.payments enable row level security;
alter table public.attendances enable row level security;
alter table public.app_backups enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['app_settings', 'members', 'schedules', 'payments', 'attendances', 'app_backups']
  loop
    execute format('drop policy if exists "Allow public read" on public.%I', table_name);
    execute format('drop policy if exists "Allow public insert" on public.%I', table_name);
    execute format('drop policy if exists "Allow public update" on public.%I', table_name);
    execute format('drop policy if exists "Allow public delete" on public.%I', table_name);

    execute format(
      'create policy "Allow public read" on public.%I for select using (true)',
      table_name
    );
    execute format(
      'create policy "Allow public insert" on public.%I for insert with check (true)',
      table_name
    );
    execute format(
      'create policy "Allow public update" on public.%I for update using (true) with check (true)',
      table_name
    );
    execute format(
      'create policy "Allow public delete" on public.%I for delete using (true)',
      table_name
    );
  end loop;
end
$$;
