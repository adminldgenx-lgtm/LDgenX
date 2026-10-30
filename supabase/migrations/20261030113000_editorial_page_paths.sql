-- Existing-page drafts retain validated nested routes and the empty homepage slug.
-- Ordinary article/expertise/application slugs retain their original strict format.
alter table public.cms_entries drop constraint if exists cms_entries_slug_check;
alter table public.cms_entries add constraint cms_entries_slug_check check (
  (kind <> 'page' and slug ~ '^[a-z0-9][a-z0-9-]{0,99}$')
  or (kind = 'page' and (slug = '' or slug ~ '^[a-z0-9][a-z0-9/-]{0,199}$') and slug not like '%//%' and right(slug,1) <> '/')
);
