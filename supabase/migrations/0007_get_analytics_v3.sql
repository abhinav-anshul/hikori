-- =============================================================
-- get_analytics(p_from, p_to, p_bucket, p_link_id) — v3
-- Adds optional p_link_id so the per-link drill-down page can
-- reuse the same RPC scoped to a single link.
--
-- When p_link_id is provided:
--   - total, series, top_referrers filter to that link
--   - top_links returns [] (meaningless when scoped to one link)
--
-- Also: top_links now includes the link id so the page can build
-- a /dashboard/links/<id> href without a second lookup.
-- =============================================================
drop function if exists public.get_analytics(timestamptz, timestamptz, text);

create or replace function public.get_analytics(
  p_from    timestamptz default null,
  p_to      timestamptz default null,
  p_bucket  text        default 'day',
  p_link_id uuid        default null
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
     and created_at <  v_to
     and (p_link_id is null or link_id = p_link_id);

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
        group by link_id
        order by clicks desc
        limit 5
      ) t
      join public.links l on l.id = t.link_id;
  end if;

  -- top referrers
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

grant execute on function public.get_analytics(
  timestamptz, timestamptz, text, uuid
) to authenticated;
