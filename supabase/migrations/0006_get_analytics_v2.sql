-- =============================================================
-- get_analytics(p_from, p_to, p_bucket) — v2
-- Replaces the single p_days argument with an explicit range and
-- a bucket granularity, so the page can switch between Today
-- (hourly), Yesterday, Last 7 days, Last 30 days, and All time.
--
--   p_from   nullable lower bound (NULL = no lower bound; "all time")
--   p_to     upper bound, defaults to now()
--   p_bucket 'hour' | 'day' — controls series granularity
--
-- Series rows now carry a "bucket" field that is either an
-- ISO date ("YYYY-MM-DD") or an ISO date+hour ("YYYY-MM-DDTHH:00:00")
-- depending on p_bucket.
-- =============================================================
drop function if exists public.get_analytics(int);

create or replace function public.get_analytics(
  p_from   timestamptz default null,
  p_to     timestamptz default null,
  p_bucket text        default 'day'
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id    uuid        := auth.uid();
  v_from       timestamptz := coalesce(p_from, '1970-01-01'::timestamptz);
  v_to         timestamptz := coalesce(p_to,   now());
  v_trunc      text        := case when p_bucket = 'hour' then 'hour' else 'day' end;
  v_step       interval    := case when p_bucket = 'hour'
                                   then '1 hour'::interval
                                   else '1 day'::interval end;
  v_fmt        text        := case when p_bucket = 'hour'
                                   then 'YYYY-MM-DD"T"HH24:00:00'
                                   else 'YYYY-MM-DD' end;
  v_total      bigint;
  v_series     jsonb;
  v_top_links  jsonb;
  v_top_refs   jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object(
      'total', 0,
      'series', '[]'::jsonb,
      'top_links', '[]'::jsonb,
      'top_referrers', '[]'::jsonb
    );
  end if;

  -- total
  select count(*)
    into v_total
    from public.click_events
   where user_id = v_user_id
     and created_at >= v_from
     and created_at <  v_to;

  -- series, zero-filled across the window at the chosen granularity
  select jsonb_agg(
           jsonb_build_object(
             'bucket', to_char(d.t, v_fmt),
             'clicks', coalesce(c.clicks, 0)
           )
           order by d.t
         )
    into v_series
    from generate_series(
           date_trunc(v_trunc, v_from),
           date_trunc(v_trunc, v_to),
           v_step
         ) as d(t)
    left join (
      select date_trunc(v_trunc, created_at) as t,
             count(*) as clicks
        from public.click_events
       where user_id = v_user_id
         and created_at >= v_from
         and created_at <  v_to
      group by 1
    ) c on c.t = d.t;

  -- top 5 links
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
         and created_at <  v_to
      group by link_id
      order by clicks desc
      limit 5
    ) t
    join public.links l on l.id = t.link_id;

  -- top 5 referrers
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
         and created_at <  v_to
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

grant execute on function public.get_analytics(timestamptz, timestamptz, text)
  to authenticated;
