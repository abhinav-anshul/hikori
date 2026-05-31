-- =============================================================
-- get_analytics(p_days) — one-call analytics summary
-- Returns a JSONB object with everything the analytics page
-- needs in a single round trip:
--
--   {
--     "total":         <int>  total clicks in window
--     "series":        [{ "day": "YYYY-MM-DD", "clicks": <int> }, ...]
--                         one row per day in the window (zero-filled)
--     "top_links":     [{ "slug": <text>,      "clicks": <int> }, ...]   top 5
--     "top_referrers": [{ "host": "Direct" |…, "clicks": <int> }, ...]   top 5
--   }
--
-- SECURITY INVOKER so RLS on click_events still applies. We also
-- filter on auth.uid() explicitly so the planner uses the
-- (user_id, created_at) index without depending on RLS rewrites.
-- =============================================================
create or replace function public.get_analytics(p_days int default 30)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id   uuid := auth.uid();
  v_from      timestamptz := now() - (p_days || ' days')::interval;
  v_total     bigint;
  v_series    jsonb;
  v_top_links jsonb;
  v_top_refs  jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object(
      'total', 0,
      'series', '[]'::jsonb,
      'top_links', '[]'::jsonb,
      'top_referrers', '[]'::jsonb
    );
  end if;

  -- total clicks in window
  select count(*)
    into v_total
    from public.click_events
   where user_id = v_user_id
     and created_at >= v_from;

  -- daily series, zero-filled for missing days
  select jsonb_agg(
           jsonb_build_object(
             'day',    to_char(d.day, 'YYYY-MM-DD'),
             'clicks', coalesce(c.clicks, 0)
           )
           order by d.day
         )
    into v_series
    from generate_series(
           date_trunc('day', v_from),
           date_trunc('day', now()),
           '1 day'::interval
         ) as d(day)
    left join (
      select date_trunc('day', created_at) as day,
             count(*) as clicks
        from public.click_events
       where user_id = v_user_id
         and created_at >= v_from
      group by 1
    ) c on c.day = d.day;

  -- top 5 links by clicks
  select jsonb_agg(
           jsonb_build_object('slug', l.slug, 'clicks', t.clicks)
           order by t.clicks desc
         )
    into v_top_links
    from (
      select link_id, count(*) as clicks
        from public.click_events
       where user_id = v_user_id
         and created_at >= v_from
      group by link_id
      order by clicks desc
      limit 5
    ) t
    join public.links l on l.id = t.link_id;

  -- top 5 referrers; NULL host bucketed as "Direct"
  select jsonb_agg(
           jsonb_build_object(
             'host',   coalesce(referrer_host, 'Direct'),
             'clicks', clicks
           )
           order by clicks desc
         )
    into v_top_refs
    from (
      select referrer_host, count(*) as clicks
        from public.click_events
       where user_id = v_user_id
         and created_at >= v_from
      group by referrer_host
      order by clicks desc
      limit 5
    ) t;

  return jsonb_build_object(
    'total',         v_total,
    'series',        coalesce(v_series,    '[]'::jsonb),
    'top_links',     coalesce(v_top_links, '[]'::jsonb),
    'top_referrers', coalesce(v_top_refs,  '[]'::jsonb)
  );
end $$;

grant execute on function public.get_analytics(int) to authenticated;
