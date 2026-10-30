-- Google identity fields are presentation data only. Role/status remain server-controlled.
create or replace function private.portal_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
declare
  meta jsonb := new.raw_user_meta_data;
  stamp text := to_char(now() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
  profile jsonb;
  message_id uuid := gen_random_uuid();
  activity_id uuid := gen_random_uuid();
begin
  profile := jsonb_build_object('id', new.id, 'email', lower(new.email), 'role', 'client', 'status', 'pending',
    'firstName', left(coalesce(nullif(meta->>'firstName',''), meta->>'given_name', meta->>'name', ''), 100), 'lastName', left(coalesce(nullif(meta->>'lastName',''), meta->>'family_name', ''), 100),
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
