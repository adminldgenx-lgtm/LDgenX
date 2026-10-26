-- Keep queued notifications attached to the event that caused them, including on account deletion.
alter table private.portal_email_outbox add column source_id uuid references public.portal_activity(id) on delete cascade;
create function private.portal_file_deleted() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into private.portal_storage_cleanup(path) values(old.object_path) on conflict do nothing;
  return old;
end;
$$;
revoke all on function private.portal_file_deleted() from public;
create trigger portal_file_cleanup after delete on public.portal_files for each row execute function private.portal_file_deleted();
create function private.portal_auth_updated() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.portal_profiles set data = data || jsonb_build_object('email',lower(new.email)) ||
    case when new.last_sign_in_at is not null then jsonb_build_object('lastSeenAt',to_char(new.last_sign_in_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')) else '{}'::jsonb end
  where id=new.id;
  return new;
end;
$$;
revoke all on function private.portal_auth_updated() from public;
create trigger portal_on_auth_updated after update of email,last_sign_in_at on auth.users for each row execute function private.portal_auth_updated();
