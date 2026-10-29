-- Portal blocked times have their own durable export queue, including deletion tombstones.
create table private.google_calendar_block_outbox (
  block_id text primary key,
  revision timestamptz not null default now(),
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  last_error text
);
create table private.google_calendar_block_events (
  block_id text not null,
  host_id text not null,
  calendar_id text not null,
  event_id text not null,
  primary key(block_id,host_id)
);
alter table private.google_calendar_block_outbox enable row level security;
alter table private.google_calendar_block_events enable row level security;
revoke all on private.google_calendar_block_outbox,private.google_calendar_block_events from public,anon,authenticated;
-- Backfill current portal blocks after an existing connection has already been authorized.
insert into private.google_calendar_block_outbox(block_id)
select b.value->>'id' from public.portal_settings s,
  lateral jsonb_array_elements(coalesce(s.data->'blocks','[]'::jsonb)) as b(value)
where s.id='booking' and exists(select 1 from private.google_calendar_connection where enabled);
