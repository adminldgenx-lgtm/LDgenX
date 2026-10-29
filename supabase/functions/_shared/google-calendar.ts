// Server-only bridge: encrypted offline credentials, busy intervals and a durable export queue.
import type { Sql } from "npm:postgres@3.4.7";
import type { Appointment, BookingConfig, TimeBlock } from "./types.ts";
import {
  CalendarError,
  appointmentGoogleEvents,
  blockGoogleEvents,
  googleEventSpans,
  type GoogleEvent,
} from "./calendar.ts";
interface Credentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
interface Connection {
  enabled: boolean;
  owner_email: string;
  credentials: string | null;
  managed: Record<string, string>;
  busy: Record<string, string[]>;
}
const API = "https://www.googleapis.com/calendar/v3";
const bytes = (value: string) =>
  Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
const base64 = (value: Uint8Array) => btoa(String.fromCharCode(...value));
async function key() {
  const value = Deno.env.get("GOOGLE_CALENDAR_ENCRYPTION_KEY");
  if (!value) throw new CalendarError("not_configured");
  return crypto.subtle.importKey("raw", bytes(value), "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}
export async function encryptCalendarCredentials(value: Credentials) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const body = new Uint8Array(
    await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
        additionalData: new TextEncoder().encode("LDgenX Calendar v1"),
      },
      await key(),
      new TextEncoder().encode(JSON.stringify(value)),
    ),
  );
  return `${base64(iv)}.${base64(body)}`;
}
async function decrypt(value: string): Promise<Credentials> {
  try {
    const [iv, body] = value.split(".");
    return JSON.parse(
      new TextDecoder().decode(
        await crypto.subtle.decrypt(
          {
            name: "AES-GCM",
            iv: bytes(iv),
            additionalData: new TextEncoder().encode("LDgenX Calendar v1"),
          },
          await key(),
          bytes(body),
        ),
      ),
    );
  } catch {
    throw new CalendarError("credentials_unavailable");
  }
}
export async function calendarGoogleRequest<T = Record<string, unknown>>(
  token: string,
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(API + path, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new CalendarError("google_unavailable");
  }
  if (response.status === 204) return {} as T;
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new CalendarError(`google_${response.status}`);
  return result as T;
}
export async function calendarConnection(sql: Sql): Promise<Connection | null> {
  const [row] =
    await sql`select * from private.google_calendar_connection where id=true`;
  return (row as Connection) ?? null;
}
async function access(sql: Sql, connection: Connection) {
  if (!connection.credentials) throw new CalendarError("refresh_required");
  let tokens = await decrypt(connection.credentials);
  if (tokens.expiresAt > Date.now() + 60000) return tokens.accessToken;
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID"),
    secret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  if (!clientId || !secret) throw new CalendarError("not_configured");
  let r: Response;
  try {
    r = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: secret,
        grant_type: "refresh_token",
        refresh_token: tokens.refreshToken,
      }),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new CalendarError("google_unavailable");
  }
  const value = await r.json();
  if (!r.ok || !value.access_token)
    throw new CalendarError(
      value.error === "invalid_grant"
        ? "refresh_required"
        : "google_unavailable",
    );
  tokens = {
    accessToken: value.access_token,
    refreshToken: value.refresh_token || tokens.refreshToken,
    expiresAt: Date.now() + Number(value.expires_in || 3600) * 1000,
  };
  await sql`update private.google_calendar_connection set credentials=${await encryptCalendarCredentials(tokens)},updated_at=now() where id=true and credentials=${connection.credentials}`;
  return tokens.accessToken;
}
export async function externalCalendarBusy(
  sql: Sql,
  from: string,
  to: string,
  recordHealth = false,
): Promise<TimeBlock[]> {
  const connection = await calendarConnection(sql);
  if (!connection?.enabled) return [];
  try {
    const token = await access(sql, connection),
      [setting] =
        await sql`select data from public.portal_settings where id='booking'`,
      config = setting.data as BookingConfig;
    const hosts = config.hosts.filter((h) => h.bookable),
      blocks: TimeBlock[] = [];
    const ids = [
      ...new Set(
        hosts.flatMap((h) =>
          (connection.busy[h.id] ?? ["primary"]).map((id) =>
            id === "primary" ? connection.owner_email : id,
          ),
        ),
      ),
    ];
    const managedIds = new Set(Object.values(connection.managed));
    if (ids.some((id) => managedIds.has(id)))
      throw new CalendarError("invalid_calendar_mapping");
    if (ids.length) {
      const result = await calendarGoogleRequest<{
        calendars: Record<
          string,
          { errors?: unknown[]; busy: { start: string; end: string }[] }
        >;
      }>(token, "/freeBusy", "POST", {
        timeMin: from,
        timeMax: to,
        timeZone: "Europe/Paris",
        calendarExpansionMax: 50,
        items: ids.map((id) => ({ id })),
      });
      for (const id of ids)
        if (!result.calendars?.[id] || result.calendars[id].errors?.length)
          throw new CalendarError("calendar_unavailable");
      for (const host of hosts)
        for (const id of connection.busy[host.id] ?? ["primary"])
          for (const span of result.calendars[
            id === "primary" ? connection.owner_email : id
          ].busy) {
            if (
              !Number.isFinite(Date.parse(span.start)) ||
              !Number.isFinite(Date.parse(span.end)) ||
              Date.parse(span.end) <= Date.parse(span.start)
            )
              throw new CalendarError("invalid_google_event");
            blocks.push({
              id: `google:busy:${blocks.length}`,
              hostId: host.id,
              start: span.start,
              end: span.end,
              reason: "Google Calendar",
            });
          }
    }
    const known =
      await sql`select e.calendar_id,e.event_id,e.kind,e.appointment_id,a.data from private.google_calendar_events e join public.portal_appointments a on a.id=e.appointment_id`;
    const knownBlocks =
      await sql`select * from private.google_calendar_block_events`;
    const desiredBlocks = config.blocks.flatMap((block) =>
      blockGoogleEvents(block, config, connection.managed).map((event) => ({
        blockId: block.id,
        event,
      })),
    );
    for (const host of hosts) {
      const calendar = connection.managed[host.id];
      if (!calendar) {
        blocks.push({
          id: `google:unconfigured:${host.id}`,
          hostId: host.id,
          start: from,
          end: to,
          reason: "Google Calendar",
        });
        continue;
      }
      let page = "";
      let pages = 0;
      const events: GoogleEvent[] = [];
      do {
        const query = new URLSearchParams({
          timeMin: from,
          timeMax: to,
          singleEvents: "true",
          showDeleted: "true",
          maxResults: "2500",
          fields:
            "items(id,status,transparency,start,end,extendedProperties),nextPageToken",
        });
        if (page) query.set("pageToken", page);
        const result = await calendarGoogleRequest<{
          items?: GoogleEvent[];
          nextPageToken?: string;
        }>(token, `/calendars/${encodeURIComponent(calendar)}/events?${query}`);
        events.push(...(result.items ?? []));
        page = result.nextPageToken ?? "";
        if (++pages > 5 && page) throw new CalendarError("calendar_too_large");
      } while (page);
      const expected = known
        .filter((r) => r.calendar_id === calendar)
        .map((r) => ({
          row: r,
          event: appointmentGoogleEvents(
            r.data as Appointment,
            connection.managed,
          ).find((e) => e.kind === r.kind && e.calendarId === calendar),
        }));
      const knownIds = new Set<string>();
      for (const item of expected) {
        if (!item.event) continue;
        const actual = events.find((e) => e.id === item.row.event_id);
        const matches =
          actual &&
          actual.status !== "cancelled" &&
          actual.transparency !== "transparent" &&
          actual.start?.dateTime &&
          actual.end?.dateTime &&
          Date.parse(actual.start.dateTime) ===
            Date.parse(item.event.body.start.dateTime) &&
          Date.parse(actual.end.dateTime) ===
            Date.parse(item.event.body.end.dateTime);
        if (matches) knownIds.add(String(item.row.event_id));
        else if (
          Date.parse(item.event.body.start.dateTime) < Date.parse(to) &&
          Date.parse(item.event.body.end.dateTime) > Date.parse(from)
        )
          await sql`insert into private.google_calendar_outbox(appointment_id) values(${item.row.appointment_id}) on conflict(appointment_id) do nothing`;
      }
      for (const row of knownBlocks.filter((r) => r.calendar_id === calendar)) {
        const expected = desiredBlocks.find(
          (d) => d.blockId === row.block_id && d.event.hostId === row.host_id,
        )?.event;
        const actual = events.find((e) => e.id === row.event_id);
        const matches =
          expected &&
          actual &&
          actual.status !== "cancelled" &&
          actual.transparency !== "transparent" &&
          actual.start?.dateTime &&
          actual.end?.dateTime &&
          Date.parse(actual.start.dateTime) ===
            Date.parse(expected.body.start.dateTime) &&
          Date.parse(actual.end.dateTime) ===
            Date.parse(expected.body.end.dateTime);
        if (matches) knownIds.add(String(row.event_id));
        else if (
          !expected ||
          (Date.parse(expected.body.start.dateTime) < Date.parse(to) &&
            Date.parse(expected.body.end.dateTime) > Date.parse(from))
        )
          await sql`insert into private.google_calendar_block_outbox(block_id) values(${row.block_id}) on conflict(block_id) do nothing`;
      }
      blocks.push(...googleEventSpans(events, knownIds, host.id));
    }
    if (recordHealth)
      await sql`update private.google_calendar_connection set last_busy_error=null,last_busy_checked_at=now() where id=true`;
    return blocks;
  } catch (error) {
    if (recordHealth)
      await sql`update private.google_calendar_connection set last_busy_error=${error instanceof CalendarError ? error.code : "google_unavailable"},last_busy_checked_at=now() where id=true`;
    throw error;
  }
}
export async function enqueueCalendarAppointment(sql: Sql, id: string) {
  await sql`insert into private.google_calendar_outbox(appointment_id) select ${id}::uuid where exists(select 1 from private.google_calendar_connection where id=true and enabled) on conflict(appointment_id) do update set revision=now(),attempts=0,next_attempt_at=now(),last_error=null`;
}
export async function enqueueCalendarBlocks(
  sql: Sql,
  config: BookingConfig,
  previous?: BookingConfig,
) {
  const [connection] =
    await sql`select enabled from private.google_calendar_connection where id=true`;
  if (!connection?.enabled) return;
  const mapped =
    await sql`select distinct block_id from private.google_calendar_block_events`;
  const ids = [
    ...new Set([
      ...config.blocks.map((b) => b.id),
      ...(previous?.blocks ?? []).map((b) => b.id),
      ...mapped.map((r) => String(r.block_id)),
    ]),
  ];
  if (ids.length) {
    await sql`insert into private.google_calendar_block_outbox ${sql(ids.map((block_id) => ({ block_id })))} on conflict(block_id) do update set revision=now(),attempts=0,next_attempt_at=now(),last_error=null`;
  }
}
// Deterministic replacement IDs make retries safe even after Google retains a deleted-event tombstone.
export async function upsertCalendarEvent(
  token: string,
  event:
    | ReturnType<typeof appointmentGoogleEvents>[number]
    | ReturnType<typeof blockGoogleEvents>[number],
  revision: string | Date,
) {
  const write = async () => {
    const path = `/calendars/${encodeURIComponent(event.calendarId)}/events/${event.eventId}?sendUpdates=none`;
    try {
      await calendarGoogleRequest(token, path, "PUT", event.body);
    } catch (error) {
      if (!(error instanceof CalendarError && error.code === "google_404"))
        throw error;
      try {
        await calendarGoogleRequest(
          token,
          `/calendars/${encodeURIComponent(event.calendarId)}/events?sendUpdates=none`,
          "POST",
          event.body,
        );
      } catch (insert) {
        if (!(insert instanceof CalendarError && insert.code === "google_409"))
          throw insert;
        await calendarGoogleRequest(token, path, "PUT", event.body);
      }
    }
  };
  try {
    await write();
  } catch (error) {
    if (!(error instanceof CalendarError && error.code === "google_410"))
      throw error;
    event.eventId = `${event.baseEventId}${new Date(revision).getTime()}`;
    event.body.id = event.eventId;
    await write();
  }
  return event;
}
export async function runCalendarSync(sql: Sql, onlyId?: string) {
  const conn = await calendarConnection(sql);
  if (!conn?.enabled) return { synced: 0, pending: 0 };
  const started = Date.now();
  let synced = 0;
  await sql.begin(async (transaction) => {
    const tx = transaction as unknown as Sql;
    const [lock] =
      await tx`select pg_try_advisory_xact_lock(hashtextextended('google-calendar-sync',0)) as acquired`;
    if (!lock.acquired) return;
    const conn = await calendarConnection(tx);
    if (!conn?.enabled) return;
    let token: string;
    try {
      token = await access(tx, conn);
    } catch (error) {
      await tx`update private.google_calendar_connection set last_error=${error instanceof CalendarError ? error.code : "google_unavailable"} where id=true`;
      return;
    }
    const jobs = onlyId
      ? await tx`select appointment_id,revision::text as revision from private.google_calendar_outbox where appointment_id=${onlyId} and next_attempt_at<=now() limit 1`
      : await tx`select appointment_id,revision::text as revision from private.google_calendar_outbox where next_attempt_at<=now() order by revision limit 5`;
    for (const job of jobs) {
      if (Date.now() - started > 20000) break;
      try {
        const [row] =
          await tx`select data from public.portal_appointments where id=${job.appointment_id}`;
        if (!row) {
          await tx`delete from private.google_calendar_outbox where appointment_id=${job.appointment_id}`;
          continue;
        }
        const desired = appointmentGoogleEvents(
          row.data as Appointment,
          conn.managed,
        );
        const old =
          await tx`select * from private.google_calendar_events where appointment_id=${job.appointment_id}`;
        for (const event of old)
          if (
            !desired.some(
              (d) =>
                d.kind === event.kind && d.calendarId === event.calendar_id,
            )
          ) {
            try {
              await calendarGoogleRequest(
                token,
                `/calendars/${encodeURIComponent(event.calendar_id)}/events/${encodeURIComponent(event.event_id)}?sendUpdates=none`,
                "DELETE",
              );
            } catch (e) {
              if (!(
                e instanceof CalendarError &&
                ["google_404", "google_410"].includes(e.code)
              ))
                throw e;
            }
            await tx`delete from private.google_calendar_events where appointment_id=${job.appointment_id} and kind=${event.kind}`;
          }
        for (const event of desired) {
          const mapping = old.find(
            (e) => e.kind === event.kind && e.calendar_id === event.calendarId,
          );
          if (mapping) event.body.id = event.eventId = String(mapping.event_id);
          await upsertCalendarEvent(token, event, job.revision);
          await tx`insert into private.google_calendar_events(appointment_id,kind,calendar_id,event_id) values(${job.appointment_id},${event.kind},${event.calendarId},${event.eventId}) on conflict(appointment_id,kind) do update set calendar_id=excluded.calendar_id,event_id=excluded.event_id`;
        }
        await tx`delete from private.google_calendar_outbox where appointment_id=${job.appointment_id} and revision::text=${job.revision}::text`;
        synced++;
      } catch (error) {
        const code =
          error instanceof CalendarError ? error.code : "google_unavailable";
        await tx`update private.google_calendar_outbox set attempts=attempts+1,last_error=${code},next_attempt_at=now()+least(900,power(2,least(attempts,6))*15)*interval '1 second' where appointment_id=${job.appointment_id} and revision::text=${job.revision}::text`;
        await tx`update private.google_calendar_connection set last_error=${code} where id=true`;
      }
    }
    const [setting] =
      await tx`select data from public.portal_settings where id='booking'`;
    const config = setting.data as BookingConfig;
    const blockJobs =
      await tx`select block_id,revision::text as revision from private.google_calendar_block_outbox where next_attempt_at<=now() order by revision limit 5`;
    for (const job of blockJobs) {
      if (Date.now() - started > 20000) break;
      try {
        const block = config.blocks.find((b) => b.id === job.block_id);
        const desired = block
          ? blockGoogleEvents(block, config, conn.managed)
          : [];
        const old =
          await tx`select * from private.google_calendar_block_events where block_id=${job.block_id}`;
        for (const event of old)
          if (
            !desired.some(
              (d) =>
                d.hostId === event.host_id &&
                d.calendarId === event.calendar_id,
            )
          ) {
            try {
              await calendarGoogleRequest(
                token,
                `/calendars/${encodeURIComponent(event.calendar_id)}/events/${encodeURIComponent(event.event_id)}?sendUpdates=none`,
                "DELETE",
              );
            } catch (error) {
              if (!(
                error instanceof CalendarError &&
                ["google_404", "google_410"].includes(error.code)
              ))
                throw error;
            }
            await tx`delete from private.google_calendar_block_events where block_id=${job.block_id} and host_id=${event.host_id}`;
          }
        for (const event of desired) {
          const mapping = old.find(
            (e) =>
              e.host_id === event.hostId && e.calendar_id === event.calendarId,
          );
          if (mapping) event.body.id = event.eventId = String(mapping.event_id);
          await upsertCalendarEvent(token, event, job.revision);
          await tx`insert into private.google_calendar_block_events(block_id,host_id,calendar_id,event_id) values(${job.block_id},${event.hostId},${event.calendarId},${event.eventId}) on conflict(block_id,host_id) do update set calendar_id=excluded.calendar_id,event_id=excluded.event_id`;
        }
        await tx`delete from private.google_calendar_block_outbox where block_id=${job.block_id} and revision::text=${job.revision}::text`;
        synced++;
      } catch (error) {
        const code =
          error instanceof CalendarError ? error.code : "google_unavailable";
        await tx`update private.google_calendar_block_outbox set attempts=attempts+1,last_error=${code},next_attempt_at=now()+least(900,power(2,least(attempts,6))*15)*interval '1 second' where block_id=${job.block_id} and revision::text=${job.revision}::text`;
        await tx`update private.google_calendar_connection set last_error=${code} where id=true`;
      }
    }
    if (synced)
      await tx`update private.google_calendar_connection set last_sync_at=now(),last_error=coalesce((select last_error from private.google_calendar_outbox where last_error is not null limit 1),(select last_error from private.google_calendar_block_outbox where last_error is not null limit 1)) where id=true`;
  });
  const [pending] =
    await sql`select ((select count(*) from private.google_calendar_outbox)+(select count(*) from private.google_calendar_block_outbox))::int as count`;
  return { synced, pending: pending.count };
}
