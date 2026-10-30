-- Editorial drafts, immutable public snapshots and limited revision history. Portal data is untouched.
create table public.cms_entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check(kind in ('article','study','publication')),
  locale text not null check(locale in ('fr','en')),
  slug text not null check(slug ~ '^[a-z0-9][a-z0-9-]{0,99}$'),
  group_id uuid not null,
  legacy_id text,
  draft jsonb not null check(jsonb_typeof(draft)='object' and octet_length(draft::text)<=250000),
  version integer not null default 1,
  published_version integer,
  created_by uuid references auth.users on delete set null,
  updated_by uuid references auth.users on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(kind,locale,slug), unique(group_id,locale)
);
create table public.cms_publications (
  entry_id uuid primary key references public.cms_entries on delete cascade,
  kind text not null check(kind in ('article','study','publication')),
  locale text not null check(locale in ('fr','en')),
  slug text not null,
  path text not null unique,
  group_id uuid not null,
  legacy_id text,
  status text not null check(status in ('published','withdrawn')),
  snapshot jsonb,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check((status='published' and snapshot is not null) or (status='withdrawn' and snapshot is null))
);
create table public.cms_media (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check(kind in ('image','video')),
  bytes bigint not null check(bytes>0),
  sha256 text not null unique,
  variants jsonb not null,
  state text not null check(state in ('uploading','ready','failed')),
  is_public boolean not null default false,
  created_by uuid references auth.users on delete set null,
  created_at timestamptz not null default now()
);
create table public.cms_media_links (
  entry_id uuid not null references public.cms_entries on delete cascade,
  media_id uuid not null references public.cms_media,
  stage text not null check(stage in ('draft','published')),
  primary key(entry_id,media_id,stage)
);
create index cms_media_links_media on public.cms_media_links(media_id);
create table public.cms_revisions (
  id bigint generated always as identity primary key,
  entry_id uuid not null references public.cms_entries on delete cascade,
  version integer not null,
  document jsonb not null,
  media_ids uuid[] not null default '{}',
  reason text not null,
  author text not null,
  created_at timestamptz not null default now()
);
create index cms_revisions_entry on public.cms_revisions(entry_id,created_at desc);
create index cms_revisions_media on public.cms_revisions using gin(media_ids);
alter table public.cms_entries enable row level security;
alter table public.cms_publications enable row level security;
alter table public.cms_media enable row level security;
alter table public.cms_media_links enable row level security;
alter table public.cms_revisions enable row level security;
revoke all on public.cms_entries,public.cms_publications,public.cms_media,public.cms_media_links,public.cms_revisions from anon,authenticated;
grant select on public.cms_publications to anon,authenticated;
create policy cms_published_read on public.cms_publications for select to anon,authenticated using(status='published');
grant select on public.cms_entries,public.cms_media,public.cms_media_links,public.cms_revisions to authenticated;
create policy cms_entry_admin on public.cms_entries for select to authenticated using((select private.portal_is_admin()));
create policy cms_media_admin on public.cms_media for select to authenticated using((select private.portal_is_admin()));
create policy cms_links_admin on public.cms_media_links for select to authenticated using((select private.portal_is_admin()));
create policy cms_revisions_admin on public.cms_revisions for select to authenticated using((select private.portal_is_admin()));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
  ('editorial-drafts','editorial-drafts',false,20000000,array['image/webp','video/mp4','video/webm']),
  ('editorial-public','editorial-public',true,20000000,array['image/webp','video/mp4','video/webm']);
-- No browser upload policies: the role-checked API owns every media mutation.
