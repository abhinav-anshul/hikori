-- =============================================================
-- tags + link_tags
-- Tags are user-scoped. Names are unique per user, case-insensitive.
-- Color is one of 8 preset keys; the UI maps each to a Tailwind
-- bg/text class pair.
-- =============================================================

create table public.tags (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  name       text        not null,
  color      text        not null default 'gray',
  created_at timestamptz not null default now(),

  constraint tags_name_len check (char_length(name) between 1 and 32),
  constraint tags_color_known check (
    color in ('gray','red','orange','yellow','green','blue','purple','pink')
  )
);

-- Case-insensitive uniqueness so "Twitter" and "twitter" can't coexist.
create unique index tags_user_name_key
  on public.tags (user_id, lower(name));

create index tags_user_id_idx
  on public.tags (user_id);

alter table public.tags enable row level security;

create policy tags_select_own on public.tags
  for select using (user_id = auth.uid());

create policy tags_insert_own on public.tags
  for insert with check (user_id = auth.uid());

create policy tags_update_own on public.tags
  for update using (user_id = auth.uid());

create policy tags_delete_own on public.tags
  for delete using (user_id = auth.uid());

-- =============================================================
-- link_tags — many-to-many between links and tags.
-- No user_id column; ownership is enforced by RLS through joins
-- to the parent tables.
-- =============================================================
create table public.link_tags (
  link_id uuid not null references public.links(id) on delete cascade,
  tag_id  uuid not null references public.tags(id)  on delete cascade,
  primary key (link_id, tag_id)
);

-- Reverse lookup for filtering links by a tag.
create index link_tags_tag_id_idx
  on public.link_tags (tag_id);

alter table public.link_tags enable row level security;

create policy link_tags_select_own on public.link_tags
  for select using (
    exists (
      select 1 from public.links l
       where l.id = link_id and l.user_id = auth.uid()
    )
  );

-- Insert requires the caller to own BOTH the link and the tag.
create policy link_tags_insert_own on public.link_tags
  for insert with check (
    exists (
      select 1 from public.links l
       where l.id = link_id and l.user_id = auth.uid()
    )
    and exists (
      select 1 from public.tags t
       where t.id = tag_id and t.user_id = auth.uid()
    )
  );

create policy link_tags_delete_own on public.link_tags
  for delete using (
    exists (
      select 1 from public.links l
       where l.id = link_id and l.user_id = auth.uid()
    )
  );
