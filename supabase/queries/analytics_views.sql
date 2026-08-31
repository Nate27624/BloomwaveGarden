create or replace view public.analytics_daily_metrics as
with installs as (
  select
    date_trunc('day', timestamp)::date as metric_date,
    count(distinct user_id) as new_users
  from public.analytics_events
  where event_name = 'first_open'
  group by 1
),
active_users as (
  select
    date_trunc('day', timestamp)::date as metric_date,
    count(distinct user_id) as daily_active_users
  from public.analytics_events
  group by 1
),
session_starts as (
  select
    date_trunc('day', timestamp)::date as metric_date,
    count(*) as session_starts
  from public.analytics_events
  where event_name = 'session_start'
  group by 1
),
session_ends as (
  select
    date_trunc('day', timestamp)::date as metric_date,
    avg(nullif((properties ->> 'duration_sec')::numeric, 0)) as avg_session_duration_sec
  from public.analytics_events
  where event_name = 'session_end'
  group by 1
),
harvests as (
  select
    date_trunc('day', timestamp)::date as metric_date,
    count(*) as harvest_events
  from public.analytics_events
  where event_name = 'harvest'
  group by 1
),
background_store_visits as (
  select
    date_trunc('day', timestamp)::date as metric_date,
    count(distinct user_id) as users_opened_background_store
  from public.analytics_events
  where event_name = 'background_store_opened'
  group by 1
),
background_interactions as (
  select
    date_trunc('day', timestamp)::date as metric_date,
    count(distinct user_id) as users_interacted_backgrounds,
    count(distinct case when coalesce(background_id, '') <> 'classic' then user_id end) as users_desiring_non_default_backgrounds
  from public.analytics_events
  where event_name in (
    'background_viewed',
    'background_equipped',
    'background_temp_unlocked',
    'purchase_offer_shown',
    'purchase_started',
    'purchase_completed',
    'ad_offer_shown',
    'ad_started',
    'ad_completed'
  )
  group by 1
),
ad_funnel as (
  select
    date_trunc('day', timestamp)::date as metric_date,
    count(*) filter (where event_name = 'ad_offer_shown') as ad_offer_shown_count,
    count(*) filter (where event_name = 'ad_started') as ad_started_count,
    count(*) filter (where event_name = 'ad_completed') as ad_completed_count,
    coalesce(sum(revenue_usd) filter (where event_name = 'ad_completed'), 0) as ad_revenue_usd
  from public.analytics_events
  where event_name in ('ad_offer_shown', 'ad_started', 'ad_completed')
  group by 1
),
purchase_funnel as (
  select
    date_trunc('day', timestamp)::date as metric_date,
    count(distinct user_id) filter (where event_name = 'purchase_offer_shown') as purchase_offer_users,
    count(distinct user_id) filter (where event_name = 'purchase_completed') as purchase_completed_users,
    count(distinct user_id) filter (
      where event_name = 'purchase_offer_shown'
        and product_type = 'lifetime_pass'
    ) as lifetime_offer_users,
    count(distinct user_id) filter (
      where event_name = 'purchase_completed'
        and product_type = 'lifetime_pass'
    ) as lifetime_completed_users,
    count(distinct user_id) filter (
      where event_name = 'purchase_offer_shown'
        and product_type = 'individual_background'
    ) as background_offer_users,
    count(distinct user_id) filter (
      where event_name = 'purchase_completed'
        and product_type = 'individual_background'
    ) as background_completed_users,
    coalesce(sum(price_usd) filter (where event_name = 'purchase_completed'), 0) as purchase_revenue_usd
  from public.analytics_events
  where event_name in ('purchase_offer_shown', 'purchase_completed')
  group by 1
),
cumulative_installs as (
  select
    metric_date,
    sum(new_users) over (order by metric_date rows between unbounded preceding and current row) as installs_to_date
  from installs
)
select
  active_users.metric_date,
  coalesce(installs.new_users, 0) as new_users,
  active_users.daily_active_users,
  round(coalesce(session_starts.session_starts::numeric / nullif(active_users.daily_active_users, 0), 0), 4) as avg_sessions_per_user,
  coalesce(session_ends.avg_session_duration_sec, 0) as avg_session_duration_sec,
  round(coalesce(harvests.harvest_events::numeric / nullif(session_starts.session_starts, 0), 0), 4) as harvests_per_session,
  round(coalesce(background_store_visits.users_opened_background_store::numeric / nullif(active_users.daily_active_users, 0), 0), 4) as background_store_visit_rate,
  round(coalesce(background_interactions.users_interacted_backgrounds::numeric / nullif(active_users.daily_active_users, 0), 0), 4) as background_interaction_rate,
  round(coalesce(ad_funnel.ad_started_count::numeric / nullif(ad_funnel.ad_offer_shown_count, 0), 0), 4) as ad_offer_to_ad_start_rate,
  round(coalesce(ad_funnel.ad_completed_count::numeric / nullif(ad_funnel.ad_started_count, 0), 0), 4) as ad_completion_rate,
  round(coalesce(ad_funnel.ad_completed_count::numeric / nullif(active_users.daily_active_users, 0), 0), 4) as ads_watched_per_active_user,
  round(coalesce(ad_funnel.ad_revenue_usd / nullif(active_users.daily_active_users, 0), 0), 6) as ad_revenue_per_active_user,
  round(coalesce(purchase_funnel.purchase_completed_users::numeric / nullif(purchase_funnel.purchase_offer_users, 0), 0), 4) as purchase_conversion_rate,
  round(coalesce(purchase_funnel.lifetime_completed_users::numeric / nullif(purchase_funnel.lifetime_offer_users, 0), 0), 4) as lifetime_pass_conversion_rate,
  round(coalesce(purchase_funnel.background_completed_users::numeric / nullif(purchase_funnel.background_offer_users, 0), 0), 4) as individual_background_conversion_rate,
  round(coalesce((purchase_funnel.purchase_revenue_usd + ad_funnel.ad_revenue_usd) / nullif(active_users.daily_active_users, 0), 0), 6) as revenue_per_active_user,
  round(coalesce((purchase_funnel.purchase_revenue_usd + ad_funnel.ad_revenue_usd) / nullif(cumulative_installs.installs_to_date, 0), 0), 6) as revenue_per_install,
  round(coalesce(background_interactions.users_desiring_non_default_backgrounds::numeric / nullif(active_users.daily_active_users, 0), 0), 4) as background_desire_rate
from active_users
left join installs on installs.metric_date = active_users.metric_date
left join session_starts on session_starts.metric_date = active_users.metric_date
left join session_ends on session_ends.metric_date = active_users.metric_date
left join harvests on harvests.metric_date = active_users.metric_date
left join background_store_visits on background_store_visits.metric_date = active_users.metric_date
left join background_interactions on background_interactions.metric_date = active_users.metric_date
left join ad_funnel on ad_funnel.metric_date = active_users.metric_date
left join purchase_funnel on purchase_funnel.metric_date = active_users.metric_date
left join cumulative_installs on cumulative_installs.metric_date = active_users.metric_date
order by active_users.metric_date desc;

create or replace view public.analytics_retention as
with first_opens as (
  select
    user_id,
    min(date_trunc('day', timestamp)::date) as cohort_date
  from public.analytics_events
  where event_name = 'first_open'
  group by 1
),
activity as (
  select distinct
    user_id,
    date_trunc('day', timestamp)::date as activity_date
  from public.analytics_events
),
retention as (
  select
    first_opens.cohort_date,
    count(distinct first_opens.user_id) as cohort_size,
    count(distinct case when activity.activity_date = first_opens.cohort_date + 1 then first_opens.user_id end) as d1_users,
    count(distinct case when activity.activity_date = first_opens.cohort_date + 3 then first_opens.user_id end) as d3_users,
    count(distinct case when activity.activity_date = first_opens.cohort_date + 7 then first_opens.user_id end) as d7_users
  from first_opens
  left join activity
    on activity.user_id = first_opens.user_id
  group by 1
)
select
  cohort_date,
  cohort_size,
  round(coalesce(d1_users::numeric / nullif(cohort_size, 0), 0), 4) as d1_retention,
  round(coalesce(d3_users::numeric / nullif(cohort_size, 0), 0), 4) as d3_retention,
  round(coalesce(d7_users::numeric / nullif(cohort_size, 0), 0), 4) as d7_retention
from retention
order by cohort_date desc;
