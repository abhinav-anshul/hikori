-- =============================================================
-- click_events table
-- One row per redirect. Powers the analytics page.
--
-- Writes happen only through the resolve_and_track RPC
-- (SECURITY DEFINER) so anonymous visitors can insert without
-- a direct grant. Rows are immutable once written.
-- =============================================================
create table public.click_events (
  -- identity --------------------------------------------------
  id              uuid        primary key default gen_random_uuid(),
  link_id         uuid        not null references public.links(id)  on delete cascade,
  user_id         uuid        not null references auth.users(id)    on delete cascade,
    -- denormalized from links.user_id so RLS and "all my clicks"
    -- queries don't need a join. Set by the RPC at insert time.
  created_at      timestamptz not null default now(),

  -- referrer --------------------------------------------------
  referrer        text,
  referrer_host   text,
    -- parsed hostname (e.g. "twitter.com") for cheap GROUP BY.
    -- "Direct" traffic = referrer_host IS NULL.

  -- utm (parsed from the incoming short-link query string) ----
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  utm_term        text,  
  utm_content     text,

  -- device / agent --------------------------------------------
  user_agent      text,
  browser_name    text,
  browser_version text,
  os_name         text,
  os_version      text,
  device_type     text,
    -- 'mobile' | 'tablet' | 'desktop' | 'bot'
  is_bot          boolean     not null default false,

  -- geo (from CDN headers; nullable when unknown) -------------
  country         text,         -- ISO-3166-1 alpha-2
  region          text,
  city            text,

  -- visitor (unique-counts without storing PII) ---------------
  ip_hash         text,
    -- HMAC of (ip + daily-rotating salt). Lets us count uniques
    -- within a day without keeping a long-lived identifier.

  -- locale ----------------------------------------------------
  language        text          -- first token of Accept-Language
);

-- =============================================================
-- indexes
-- =============================================================
-- Per-link timeline and recent-clicks-for-link queries.
create index click_events_link_time_idx
  on public.click_events (link_id, created_at desc);

-- Account-wide analytics ("all my clicks, newest first").
create index click_events_user_time_idx
  on public.click_events (user_id, created_at desc);

-- Global retention sweeps.
create index click_events_created_at_idx
  on public.click_events (created_at);

-- =============================================================
-- row-level security
-- Owners can read their own events. No insert/update/delete
-- policy: only resolve_and_track (SECURITY DEFINER) writes,
-- and rows are immutable.
-- =============================================================
alter table public.click_events enable row level security;

create policy click_events_select_own
  on public.click_events for select
  using (user_id = auth.uid());
