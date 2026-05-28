-- =============================================================
-- links table
-- =============================================================
create table public.links (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  slug         text        not null,
  target_url   text        not null,
  click_count  bigint      not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint links_slug_format
    check (slug ~ '^[a-zA-Z0-9_-]{1,64}$'),
  constraint links_target_url_http
    check (target_url ~* '^https?://')
);

-- Slug must be globally unique for now. When you add custom domains,
-- drop this and replace with a unique index on (domain_id, slug).
create unique index links_slug_key on public.links (slug);

-- Fast "my links" list, newest first.
create index links_user_created_idx
  on public.links (user_id, created_at desc);

-- =============================================================
-- updated_at trigger
-- =============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger links_set_updated_at
  before update on public.links
  for each row execute function public.set_updated_at();

-- =============================================================
-- Row-Level Security
-- =============================================================
alter table public.links enable row level security;

create policy "links_select_own"
  on public.links for select
  using (auth.uid() = user_id);

create policy "links_insert_own"
  on public.links for insert
  with check (auth.uid() = user_id);

create policy "links_update_own"
  on public.links for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "links_delete_own"
  on public.links for delete
  using (auth.uid() = user_id);
