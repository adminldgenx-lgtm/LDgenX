-- Portal records are separated by entity. `data` preserves the existing typed API contract.
-- Browser roles can only read their own records; every write passes through the Edge API.
create extension if not exists btree_gist with schema extensions;
create schema if not exists private;
revoke all on schema private from public;

create table public.portal_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null check (jsonb_typeof(data) = 'object' and data->>'id' = id::text),
  role text generated always as (data->>'role') stored check (role in ('admin', 'client')),
  status text generated always as (data->>'status') stored check (status in ('pending', 'active', 'disabled')),
  email text generated always as (data->>'email') stored unique
);
create table public.portal_messages (
  id uuid primary key,
  client_id uuid not null references public.portal_profiles(id) on delete cascade,
  author_id uuid not null references public.portal_profiles(id),
  data jsonb not null check (data->>'id' = id::text and data->>'clientId' = client_id::text and data->>'authorId' = author_id::text)
);
create index portal_messages_client_idx on public.portal_messages(client_id, (data->>'createdAt'));
create table public.portal_files (
  id uuid primary key,
  client_id uuid not null references public.portal_profiles(id) on delete cascade,
  uploaded_by uuid not null references public.portal_profiles(id),
  object_path text not null unique,
  data jsonb not null check (data->>'id' = id::text and data->>'clientId' = client_id::text and data->>'uploadedBy' = uploaded_by::text)
);
create index portal_files_client_idx on public.portal_files(client_id);
create index portal_files_expiry_idx on public.portal_files((data->>'expiresAt'));
create table public.portal_inquiries (id uuid primary key, data jsonb not null check (data->>'id' = id::text));
create table public.portal_appointments (
  id uuid primary key,
  client_id uuid references public.portal_profiles(id) on delete cascade,
  data jsonb not null check (data->>'id' = id::text and (data->>'clientId') is not distinct from client_id::text)
);
create index portal_appointments_client_idx on public.portal_appointments(client_id);
create index portal_appointments_start_idx on public.portal_appointments((data->>'start'));
-- Both the confirmed time and a pending change hold their place. The database rejects
-- overlaps across appointments, even if a future caller forgets the application check.
create table public.portal_reservations (
  id bigint generated always as identity primary key,
  appointment_id uuid not null references public.portal_appointments(id) on delete cascade,
  host_id text not null,
  slot tstzrange not null,
  exclude using gist (host_id with =, appointment_id with <>, slot with &&)
);
create index portal_reservations_appointment_idx on public.portal_reservations(appointment_id);
create table public.portal_activity (
  id uuid primary key,
  client_id uuid references public.portal_profiles(id) on delete cascade,
  data jsonb not null check (data->>'id' = id::text)
);
create index portal_activity_client_idx on public.portal_activity(client_id);
create index portal_activity_time_idx on public.portal_activity((data->>'at'));
create table public.portal_settings (id text primary key check (id in ('booking', 'retention')), data jsonb not null);
create table private.portal_rate_limits (key text primary key, hits integer not null, window_at timestamptz not null);
create table private.portal_storage_cleanup (path text primary key);
create table private.portal_jobs (id text primary key, secret text not null);
create table private.portal_email_outbox (
  id uuid primary key default gen_random_uuid(),
  recipient text not null,
  dedupe_key text unique,
  subject text not null,
  body text not null,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  attempts integer not null default 0,
  last_error text
);

create function private.portal_is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.portal_profiles where id = (select auth.uid()) and role = 'admin' and status = 'active');
$$;
create function private.portal_can_access(client uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select private.portal_is_admin() or exists(select 1 from public.portal_profiles where id = (select auth.uid()) and id = client and status <> 'disabled');
$$;
revoke all on function private.portal_is_admin(), private.portal_can_access(uuid) from public;
grant usage on schema private to authenticated;
grant execute on function private.portal_is_admin(), private.portal_can_access(uuid) to authenticated;

alter table public.portal_profiles enable row level security;
alter table public.portal_messages enable row level security;
alter table public.portal_files enable row level security;
alter table public.portal_inquiries enable row level security;
alter table public.portal_appointments enable row level security;
alter table public.portal_reservations enable row level security;
alter table public.portal_activity enable row level security;
alter table public.portal_settings enable row level security;

create policy profile_read on public.portal_profiles for select to authenticated using (private.portal_can_access(id));
create policy message_read on public.portal_messages for select to authenticated using (private.portal_can_access(client_id));
create policy file_read on public.portal_files for select to authenticated using (private.portal_can_access(client_id) and ((data->>'expiresAt') is null or data->>'expiresAt' > to_char(now() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')));
create policy inquiry_read on public.portal_inquiries for select to authenticated using ((select private.portal_is_admin()));
create policy appointment_read on public.portal_appointments for select to authenticated using (private.portal_can_access(client_id));
create policy activity_read on public.portal_activity for select to authenticated using (
  ((data->'audience'->>'admins')::boolean and (select private.portal_is_admin()))
  or (data->'audience'->>'clientId' = (select auth.uid())::text and private.portal_can_access(client_id))
);
-- No direct settings access: the public API returns booking configuration without private blocks.
revoke all on public.portal_profiles, public.portal_messages, public.portal_files, public.portal_inquiries, public.portal_appointments, public.portal_reservations, public.portal_activity, public.portal_settings from anon, authenticated;
revoke all on all tables in schema private from public, anon, authenticated;
grant select on public.portal_profiles, public.portal_messages, public.portal_files, public.portal_inquiries, public.portal_appointments, public.portal_activity to authenticated;

create function private.portal_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
declare
  meta jsonb := new.raw_user_meta_data;
  stamp text := to_char(now() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
  profile jsonb;
  message_id uuid := gen_random_uuid();
  activity_id uuid := gen_random_uuid();
begin
  profile := jsonb_build_object('id', new.id, 'email', lower(new.email), 'role', 'client', 'status', 'pending',
    'firstName', left(coalesce(meta->>'firstName', ''), 100), 'lastName', left(coalesce(meta->>'lastName', ''), 100),
    'organisation', left(coalesce(meta->>'organisation', ''), 200), 'phone', left(coalesce(meta->>'phone', ''), 50),
    'locale', case when meta->>'locale' = 'en' then 'en' else 'fr' end, 'createdAt', stamp,
    'notify', jsonb_build_object('messages', true, 'files', true, 'appointments', true, 'weeklyPurge', true));
  insert into public.portal_profiles(id, data) values (new.id, profile);
  if length(trim(coalesce(meta->>'message', ''))) > 0 then
    insert into public.portal_messages(id,client_id,author_id,data) values (message_id,new.id,new.id,
      jsonb_build_object('id',message_id,'clientId',new.id,'authorId',new.id,'body',left(trim(meta->>'message'),10000),'fileIds','[]'::jsonb,'createdAt',stamp,'readBy',jsonb_build_array(new.id)));
  end if;
  insert into public.portal_activity(id,client_id,data) values (activity_id,new.id,
    jsonb_build_object('id',activity_id,'kind','account_created','at',stamp,'actorId',new.id,'clientId',new.id,
      'audience',jsonb_build_object('admins',true,'clientId',null),'readBy',jsonb_build_array(new.id),
      'data',jsonb_build_object('name',trim((profile->>'firstName')||' '||(profile->>'lastName')),'organisation',profile->>'organisation')));
  return new;
end;
$$;
revoke all on function private.portal_new_user() from public;
create trigger portal_on_auth_user_created after insert on auth.users for each row execute function private.portal_new_user();

insert into storage.buckets(id,name,public,file_size_limit) values ('portal-files','portal-files',false,10485760);
-- The bucket has no browser policies. Only the verified Edge API can upload/sign/delete.
alter publication supabase_realtime add table public.portal_profiles, public.portal_messages, public.portal_files, public.portal_appointments, public.portal_activity, public.portal_inquiries;
