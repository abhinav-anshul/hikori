-- =============================================================
-- resolve_and_track(slug) — public redirect helper
-- Atomically increments click_count and returns target_url.
-- Returns NULL when the slug doesn't exist.
-- Runs as SECURITY DEFINER so anonymous visitors can resolve
-- slugs without widening the table's RLS policies.
-- =============================================================
create or replace function public.resolve_and_track(p_slug text)
returns text
language sql
security definer
set search_path = public
as $$
  update public.links
     set click_count = click_count + 1
   where slug = p_slug
  returning target_url;
$$;

revoke all on function public.resolve_and_track(text) from public;
grant execute on function public.resolve_and_track(text) to anon, authenticated;
