-- Calendar credentials and queues never enter the public schema or browser-readable tables.
create table private.google_calendar_connection (
  id boolean primary key default true check(id),
  enabled boolean not null default false,
  owner_email text,
  credentials text,
  managed jsonb not null default '{}'::jsonb,
  busy jsonb not null default '{}'::jsonb,
  connect_until timestamptz,
  connected_by uuid references auth.users on delete set null,
  last_sync_at timestamptz,
  refresh_expires_at timestamptz,
  last_error text,
  last_busy_error text,
  last_busy_checked_at timestamptz,
  updated_at timestamptz not null default now()
);
insert into private.google_calendar_connection(id) values(true);
create table private.google_calendar_oauth (
  state_hash text primary key,
  actor_id uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now()
);
create table private.google_calendar_outbox (
  appointment_id uuid primary key references public.portal_appointments(id) on delete cascade,
  revision timestamptz not null default now(),
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  last_error text
);
create table private.google_calendar_events (
  appointment_id uuid not null references public.portal_appointments(id) on delete cascade,
  kind text not null check(kind in ('main','change')),
  calendar_id text not null,
  event_id text not null,
  primary key(appointment_id,kind)
);
alter table private.google_calendar_connection enable row level security;
alter table private.google_calendar_oauth enable row level security;
alter table private.google_calendar_outbox enable row level security;
alter table private.google_calendar_events enable row level security;
revoke all on private.google_calendar_connection,private.google_calendar_oauth,private.google_calendar_outbox,private.google_calendar_events from public,anon,authenticated;
