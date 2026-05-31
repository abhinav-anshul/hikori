-- =============================================================
-- get_link_sparklines(p_days) — flat per-link daily click counts
--
-- Returns one row per (link_id, day) for the current user, going
-- back p_days. The links page pivots this into a 7-point series
-- per link and renders a tiny line as a row affordance.
--
-- Days with zero clicks are NOT returned — the caller zero-fills.
-- This keeps the payload small (most links won't have a click on
-- most days) and the SQL trivial.
-- =============================================================
create or replace function public.get_link_sparklines(p_days int default 7)
returns table (link_id uuid, day date, clicks bigint)
language sql
security invoker
set search_path = public
as $$
  select
    ce.link_id,
    date_trunc('day', ce.created_at)::date as day,
    count(*)                              as clicks
    from public.click_events ce
   where ce.user_id = auth.uid()
     and ce.created_at >= now() - (p_days || ' days')::interval
   group by ce.link_id, day;
$$;

grant execute on function public.get_link_sparklines(int) to authenticated;
