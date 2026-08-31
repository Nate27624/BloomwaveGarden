# Supabase Analytics

This folder wires Bloomwave's raw event stream into a Supabase table and provides the first dashboard views for the metrics requested on `2026-08-31`.

## Client flags

The iOS app now reads these Info.plist-backed build settings:

- `BLOOMWAVE_ENABLE_SUPABASE_ANALYTICS`
- `BLOOMWAVE_SUPABASE_URL`
- `BLOOMWAVE_SUPABASE_ANON_KEY`

They default to disabled and blank so the current review build path stays untouched.

## Enable locally after review

1. Set `BLOOMWAVE_ENABLE_SUPABASE_ANALYTICS = YES`.
2. Set `BLOOMWAVE_SUPABASE_URL` to your Supabase project URL, for example `https://xyzcompany.supabase.co`.
3. Set `BLOOMWAVE_SUPABASE_ANON_KEY` to the project's anon public key.
4. Regenerate the Xcode project with `xcodegen generate` if you changed `project.yml`.
5. Rebuild the app.

## SQL setup

1. Run [migrations/20260831_create_analytics_events.sql](./migrations/20260831_create_analytics_events.sql).
2. Run [queries/analytics_views.sql](./queries/analytics_views.sql).

That creates:

- `public.analytics_events`
- `public.analytics_daily_metrics`
- `public.analytics_retention`

## Event coverage note

- All requested events are wired into the analytics schema and client bridge.
- `crate_opened` is exposed through `window.bloomwaveAnalyticsBridge.trackCrateOpened(...)` for the next crate-opening feature, because the current shipped game does not yet have a crate-opening action to bind automatically.

## Metric definitions

- `purchase_conversion_rate` is distinct purchasers divided by distinct users shown a purchase offer on that day.
- `lifetime_pass_conversion_rate` uses only `product_type = 'lifetime_pass'`.
- `individual_background_conversion_rate` uses only `product_type = 'individual_background'`.
- `background_desire_rate` is distinct active users who interacted with any non-`classic` background divided by active users that day.
- `revenue_per_install` uses cumulative installs to date as the denominator.
