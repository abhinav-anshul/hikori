-- =============================================================
-- resolve_and_track(...) — v2
-- Replaces the v1 single-arg function. In addition to the
-- click_count increment, it inserts one row into click_events
-- with everything the caller can scrape from the request.
--
-- Still SECURITY DEFINER so anonymous visitors can write without
-- a direct grant on click_events. Returns the target_url, or
-- NULL if the slug doesn't exist (caller renders notFound).
-- =============================================================

-- Drop the v1 signature so we don't accumulate overloads.
drop function if exists public.resolve_and_track(text);

create or replace function public.resolve_and_track(
  p_slug            text,
  p_referrer        text    default null,
  p_referrer_host   text    default null,
  p_utm_source      text    default null,
  p_utm_medium      text    default null,
  p_utm_campaign    text    default null,
  p_utm_term        text    default null,
  p_utm_content     text    default null,
  p_user_agent      text    default null,
  p_browser_name    text    default null,
  p_browser_version text    default null,
  p_os_name         text    default null,
  p_os_version      text    default null,
  p_device_type     text    default null,
  p_is_bot          boolean default false,
  p_country         text    default null,
  p_region          text    default null,
  p_city            text    default null,
  p_ip_hash         text    default null,
  p_language        text    default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link_id uuid;
  v_user_id uuid;
  v_target  text;
begin
  update public.links
     set click_count = click_count + 1
   where slug = p_slug
  returning id, user_id, target_url
       into v_link_id, v_user_id, v_target;

  if v_link_id is null then
    return null;
  end if;

  insert into public.click_events (
    link_id, user_id,
    referrer, referrer_host,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content,
    user_agent, browser_name, browser_version,
    os_name, os_version, device_type, is_bot,
    country, region, city,
    ip_hash, language
  ) values (
    v_link_id, v_user_id,
    p_referrer, p_referrer_host,
    p_utm_source, p_utm_medium, p_utm_campaign, p_utm_term, p_utm_content,
    p_user_agent, p_browser_name, p_browser_version,
    p_os_name, p_os_version, p_device_type, p_is_bot,
    p_country, p_region, p_city,
    p_ip_hash, p_language
  );

  return v_target;
end $$;

revoke all on function public.resolve_and_track(
  text, text, text, text, text, text, text, text,
  text, text, text, text, text, text, boolean,
  text, text, text, text, text
) from public;

grant execute on function public.resolve_and_track(
  text, text, text, text, text, text, text, text,
  text, text, text, text, text, text, boolean,
  text, text, text, text, text
) to anon, authenticated;
