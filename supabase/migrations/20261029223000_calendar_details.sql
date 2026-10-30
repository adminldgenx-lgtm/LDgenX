-- Event presentation, per-item acknowledgements and one shared team calendar.
alter table private.google_calendar_connection add column preferences jsonb not null default '{}'::jsonb;
alter table private.google_calendar_connection add column team_creation_token uuid;
alter table private.google_calendar_events add column google_url text;
alter table private.google_calendar_events add column synced_at timestamptz;
alter table private.google_calendar_block_events add column google_url text;
alter table private.google_calendar_block_events add column synced_at timestamptz;
insert into private.google_calendar_block_outbox(block_id)
select b.value->>'id' from public.portal_settings s,lateral jsonb_array_elements(coalesce(s.data->'blocks','[]'::jsonb)) as b(value)
where s.id='booking' and exists(select 1 from private.google_calendar_connection where enabled)
on conflict(block_id) do update set revision=now(),attempts=0,next_attempt_at=now(),last_error=null;
insert into private.google_calendar_outbox(appointment_id)
select id from public.portal_appointments where data->>'status' in ('requested','confirmed') and ((data->>'end')::timestamptz>now() or (data->'change'->>'end')::timestamptz>now())
and exists(select 1 from private.google_calendar_connection where enabled)
on conflict(appointment_id) do update set revision=now(),attempts=0,next_attempt_at=now(),last_error=null;
