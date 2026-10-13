-- =============================================================
-- Guest links — a deliberately isolated table that powers the
-- public homepage's hero shortener only. No auth required to
-- create one, nothing here ever touches `links`/`click_events`,
-- and it never will even for a signed-in visitor — this is a
-- closed-loop "try it" preview, not a cut-down version of the
-- real product.
--
-- Guest links expire 24h after creation; `resolve_guest_link`
-- enforces that in its `where` clause, so there's no cron job —
-- an expired row just stops resolving (404).
--
-- Same security model as the real redirect path
-- (`resolve_and_track`, see 0004): RLS denies every direct table
-- access for every role, including anon/authenticated. The two
-- SECURITY DEFINER functions below are the only way in or out.
-- =============================================================

create table public.guest_links (
  id              uuid        primary key default gen_random_uuid(),
  slug            text        not null unique,
  target_url      text        not null,
  click_count     bigint      not null default 0,
  created_at      timestamptz not null default now(),
  expires_at      timestamptz not null default (now() + interval '24 hours'),
  last_clicked_at timestamptz,
  creator_ip_hash text,

  constraint guest_links_slug_format check (slug ~ '^[a-z0-9]{6,10}$'),
  constraint guest_links_target_url_http check (target_url ~* '^https?://')
);

alter table public.guest_links enable row level security;
-- No policies — see banner comment above.

create or replace function public.create_guest_link(p_slug text, p_target_url text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.guest_links (slug, target_url)
  values (p_slug, p_target_url);
end;
$$;

create or replace function public.resolve_guest_link(p_slug text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target_url text;
begin
  update public.guest_links
  set click_count = click_count + 1,
      last_clicked_at = now()
  where slug = p_slug
    and expires_at > now()
  returning target_url into v_target_url;

  return v_target_url; -- null => not found or expired, caller shows 404
end;
$$;

grant execute on function public.create_guest_link(text, text) to anon, authenticated;
grant execute on function public.resolve_guest_link(text) to anon, authenticated;
