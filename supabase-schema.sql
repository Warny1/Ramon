create table if not exists public.app_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

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
