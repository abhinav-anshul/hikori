-- =============================================================
-- get_analytics(p_from, p_to, p_bucket, p_link_id, p_exclude_bots) — v4
--   • Adds a unique-visitor count: COUNT(DISTINCT ip_hash) excluding nulls.
--   • Adds top_devices and top_countries aggregations (null buckets dropped).
--   • Adds p_exclude_bots: when true, all aggregations skip is_bot rows.
--
-- Output shape:
--   {
--     "total": int,
--     "uniques": int,
--     "series": [{ "bucket": "...", "clicks": int }, ...],
--     "top_links":     [{ "id", "slug", "clicks" }, ...]   (empty when p_link_id set)
--     "top_referrers": [{ "host",    "clicks" }, ...]
--     "top_devices":   [{ "device",  "clicks" }, ...]
--     "top_countries": [{ "country", "clicks" }, ...]
--   }
-- =============================================================
drop function if exists public.get_analytics(timestamptz, timestamptz, text, uuid);

create or replace function public.get_analytics(
  p_from         timestamptz default null,
  p_to           timestamptz default null,
  p_bucket       text        default 'day',
  p_link_id      uuid        default null,
  p_exclude_bots boolean     default false
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id        uuid        := auth.uid();
  v_from           timestamptz := coalesce(p_from, '1970-01-01'::timestamptz);
  v_to             timestamptz := coalesce(p_to,   now());
  v_trunc          text        := case when p_bucket = 'hour' then 'hour' else 'day' end;
  v_step           interval    := case when p_bucket = 'hour'
                                       then '1 hour'::interval
                                       else '1 day'::interval end;
  v_fmt            text        := case when p_bucket = 'hour'
                                       then 'YYYY-MM-DD"T"HH24:00:00'
                                       else 'YYYY-MM-DD' end;
  v_total          bigint;
  v_uniques        bigint;
  v_series         jsonb;
  v_top_links      jsonb;
  v_top_refs       jsonb;
  v_top_devices    jsonb;
  v_top_countries  jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object(
      'total', 0, 'uniques', 0,
      'series', '[]'::jsonb,
      'top_links', '[]'::jsonb,
      'top_referrers', '[]'::jsonb,
      'top_devices', '[]'::jsonb,
      'top_countries', '[]'::jsonb
    );
  end if;

  -- total + uniques in one pass
  select count(*),
         count(distinct ip_hash) filter (where ip_hash is not null)
    into v_total, v_uniques
    from public.click_events
   where user_id = v_user_id
     and created_at >= v_from
     and created_at <  v_to
     and (p_link_id is null or link_id = p_link_id)
     and (not p_exclude_bots or is_bot = false);

  -- zero-filled series
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
         and (p_link_id is null or link_id = p_link_id)
         and (not p_exclude_bots or is_bot = false)
      group by 1
    ) c on c.t = d.t;

  -- top links (skipped when scoped to a single link)
  if p_link_id is null then
    select jsonb_agg(
             jsonb_build_object(
               'id',     l.id,
               'slug',   l.slug,
               'clicks', t.clicks
             )
             order by t.clicks desc
           )
      into v_top_links
      from (
        select link_id, count(*) as clicks
          from public.click_events
         where user_id = v_user_id
           and created_at >= v_from
           and created_at <  v_to
           and (not p_exclude_bots or is_bot = false)
        group by link_id
        order by clicks desc
        limit 5
      ) t
      join public.links l on l.id = t.link_id;
  end if;

  -- top referrers (null → "Direct")
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
         and (p_link_id is null or link_id = p_link_id)
         and (not p_exclude_bots or is_bot = false)
      group by referrer_host
      order by clicks desc
      limit 5
    ) t;

  -- top devices (drop nulls; rarely null in practice)
  select jsonb_agg(
           jsonb_build_object('device', device_type, 'clicks', clicks)
           order by clicks desc
         )
    into v_top_devices
    from (
      select device_type, count(*) as clicks
        from public.click_events
       where user_id = v_user_id
         and created_at >= v_from
         and created_at <  v_to
         and (p_link_id is null or link_id = p_link_id)
         and (not p_exclude_bots or is_bot = false)
         and device_type is not null
      group by device_type
      order by clicks desc
      limit 5
    ) t;

  -- top countries (drop nulls; localhost will be empty until deployed)
  select jsonb_agg(
           jsonb_build_object('country', country, 'clicks', clicks)
           order by clicks desc
         )
    into v_top_countries
    from (
      select country, count(*) as clicks
        from public.click_events
       where user_id = v_user_id
         and created_at >= v_from
         and created_at <  v_to
         and (p_link_id is null or link_id = p_link_id)
         and (not p_exclude_bots or is_bot = false)
         and country is not null
      group by country
      order by clicks desc
      limit 5
    ) t;

  return jsonb_build_object(
    'total',         v_total,
    'uniques',       v_uniques,
    'series',        coalesce(v_series,        '[]'::jsonb),
    'top_links',     coalesce(v_top_links,     '[]'::jsonb),
    'top_referrers', coalesce(v_top_refs,      '[]'::jsonb),
    'top_devices',   coalesce(v_top_devices,   '[]'::jsonb),
    'top_countries', coalesce(v_top_countries, '[]'::jsonb)
  );
end $$;

grant execute on function public.get_analytics(
  timestamptz, timestamptz, text, uuid, boolean
) to authenticated;
