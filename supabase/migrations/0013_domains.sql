-- =============================================================
-- Custom domains
--   • `domains` — one row per custom domain a user wants to serve
--     their links from. Ownership is proven ourselves via a TXT
--     record lookup against `verification_token` (see
--     lib/domain-check.ts); once verified, the domain is also
--     attached to the Vercel project (via the Vercel API) so it
--     gets a real SSL certificate — this table only tracks our
--     side of that.
--   • `links.domain_id` — nullable. NULL means "the default
--     hikori.app host". Set on delete null: removing a domain
--     falls its links back to the default host rather than
--     deleting them.
--   • Slug uniqueness (previously global, see 0001_create_links.sql)
--     is now scoped per host: unique among domain_id IS NULL rows
--     (the shared default host) and, separately, unique within
--     each custom domain. Two different domains can reuse the
--     same slug.
-- =============================================================

create table public.domains (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        not null references auth.users(id) on delete cascade,
  domain              text        not null,
  verification_token  text        not null default replace(gen_random_uuid()::text, '-', ''),
  status              text        not null default 'pending',
  created_at          timestamptz not null default now(),

  constraint domains_status_known check (status in ('pending', 'verified', 'failed'))
);

-- Domains are globally unique (DNS itself is global) and matched
-- case-insensitively, same reasoning as tags_user_name_key.
create unique index domains_domain_key
  on public.domains (lower(domain));

create index domains_user_id_idx
  on public.domains (user_id);

alter table public.domains enable row level security;

create policy domains_select_own on public.domains
  for select using (user_id = auth.uid());

create policy domains_insert_own on public.domains
  for insert with check (user_id = auth.uid());

create policy domains_update_own on public.domains
  for update using (user_id = auth.uid());

create policy domains_delete_own on public.domains
  for delete using (user_id = auth.uid());

-- =============================================================
-- links.domain_id
-- =============================================================
alter table public.links
  add column domain_id uuid references public.domains(id) on delete set null;

drop index public.links_slug_key;

create unique index links_slug_key
  on public.links (slug) where domain_id is null;

create unique index links_domain_slug_key
  on public.links (domain_id, slug) where domain_id is not null;
