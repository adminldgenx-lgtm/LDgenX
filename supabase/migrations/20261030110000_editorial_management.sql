-- Recoverable deletion keeps drafts/history and reserves withdrawn public URLs.
alter table public.cms_entries add column if not exists deleted_at timestamptz;
alter table public.cms_entries add column if not exists deleted_by uuid references auth.users on delete set null;
create index if not exists cms_entries_active_updated on public.cms_entries(updated_at desc) where deleted_at is null;
alter table public.cms_entries drop constraint if exists cms_entries_kind_check;
alter table public.cms_entries add constraint cms_entries_kind_check check(kind in ('article','study','publication','service','application','page'));
alter table public.cms_publications drop constraint if exists cms_publications_kind_check;
alter table public.cms_publications add constraint cms_publications_kind_check check(kind in ('article','study','publication','service','application','page'));
