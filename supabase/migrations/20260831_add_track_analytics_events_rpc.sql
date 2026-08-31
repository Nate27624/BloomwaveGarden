create or replace function public.track_analytics_events(events jsonb)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer := 0;
begin
  insert into public.analytics_events (
    user_id,
    session_id,
    timestamp,
    app_version,
    platform,
    event_name,
    properties,
    background_id,
    ownership_type,
    placement,
    ad_network,
    revenue_usd,
    product_id,
    product_type,
    price_usd
  )
  select
    coalesce(nullif(item->>'user_id', ''), 'unknown'),
    item->>'session_id',
    (item->>'timestamp')::timestamptz,
    coalesce(nullif(item->>'app_version', ''), '0.0.0'),
    coalesce(nullif(item->>'platform', ''), 'ios'),
    item->>'event_name',
    coalesce(item->'properties', '{}'::jsonb),
    nullif(item->>'background_id', ''),
    nullif(item->>'ownership_type', ''),
    nullif(item->>'placement', ''),
    nullif(item->>'ad_network', ''),
    case when coalesce(item->>'revenue_usd', '') = '' then null else (item->>'revenue_usd')::numeric(12, 6) end,
    nullif(item->>'product_id', ''),
    nullif(item->>'product_type', ''),
    case when coalesce(item->>'price_usd', '') = '' then null else (item->>'price_usd')::numeric(12, 2) end
  from jsonb_array_elements(events) as item
  where coalesce(item->>'session_id', '') <> ''
    and coalesce(item->>'event_name', '') <> ''
    and coalesce(item->>'timestamp', '') <> '';

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

grant execute on function public.track_analytics_events(jsonb) to anon, authenticated;
