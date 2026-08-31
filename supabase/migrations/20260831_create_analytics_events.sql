create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  user_id text not null,
  session_id text not null,
  timestamp timestamptz not null,
  app_version text not null,
  platform text not null,
  event_name text not null,
  properties jsonb not null default '{}'::jsonb,
  background_id text,
  ownership_type text,
  placement text,
  ad_network text,
  revenue_usd numeric(12, 6),
  product_id text,
  product_type text,
  price_usd numeric(12, 2),
  inserted_at timestamptz not null default timezone('utc', now())
);

create index if not exists analytics_events_timestamp_idx
  on public.analytics_events (timestamp desc);

create index if not exists analytics_events_event_name_idx
  on public.analytics_events (event_name, timestamp desc);

create index if not exists analytics_events_user_id_idx
  on public.analytics_events (user_id, timestamp desc);

create index if not exists analytics_events_session_id_idx
  on public.analytics_events (session_id, timestamp desc);

alter table public.analytics_events enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on public.analytics_events to anon, authenticated;

drop policy if exists "analytics_events_insert_anon" on public.analytics_events;
create policy "analytics_events_insert_anon"
  on public.analytics_events
  for insert
  to anon, authenticated
  with check (true);

comment on table public.analytics_events is
  'Bloomwave Garden raw analytics events posted from the iOS client.';
