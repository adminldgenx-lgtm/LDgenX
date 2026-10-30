import { createClient } from "npm:@supabase/supabase-js@2.118.0";
import postgres, { type Sql } from "npm:postgres@3.4.7";
import { portalOrigins } from "../_shared/origins.ts";
import { productionOrigin } from "../_shared/site.ts";
import {
  CALENDAR_OWNER,
  CALENDAR_SCOPES,
  CalendarError,
  validateCalendarMap,
  calendarPreferences,
  validateCalendarPreferences,
} from "../_shared/calendar.ts";
import {
  calendarConnection,
  calendarGoogleRequest,
  encryptCalendarCredentials,
  externalCalendarBusy,
  enqueueCalendarBlocks,
  runCalendarSync,
  enqueueCalendarRefresh,
  calendarItemState,
  configureTeamCalendar,
} from "../_shared/google-calendar.ts";
import type { BookingConfig } from "../_shared/types.ts";
const project = Deno.env.get("SUPABASE_URL")!,
  service = createClient(project, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
const callback = `${productionOrigin}/api/auth/google/callback`;
const sha = async (value: string) =>
  [
    ...new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    ),
  ]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
const ready = () =>
  !!Deno.env.get("GOOGLE_CLIENT_ID") &&
  !!Deno.env.get("GOOGLE_CLIENT_SECRET") &&
  !!Deno.env.get("GOOGLE_CALENDAR_ENCRYPTION_KEY");
function database() {
  const connection = new URL(Deno.env.get("SUPABASE_DB_URL")!);
  if (Deno.env.get("PORTAL_POOLER_HOST")) {
    connection.hostname = Deno.env.get("PORTAL_POOLER_HOST")!;
    connection.port = "6543";
    connection.username = Deno.env.get("PORTAL_POOLER_USER")!;
  }
  return postgres(connection.toString(), {
    prepare: false,
    max: 1,
    idle_timeout: 5,
    connect_timeout: 15,
    ssl: Deno.env.get("PORTAL_POOLER_HOST") ? "require" : undefined,
    connection: { application_name: "ldgenx-calendar" },
  });
}
async function authenticate(req: Request, sql: Sql) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new CalendarError("unauthenticated", 401);
  const { data, error } = await service.auth.getUser(token);
  if (error || !data.user) throw new CalendarError("unauthenticated", 401);
  const [admin] =
    await sql`select id from public.portal_profiles where id=${data.user.id} and role='admin' and status='active'`;
  if (!admin) throw new CalendarError("forbidden", 403);
  return data.user.id;
}
async function booking(sql: Sql) {
  const [row] =
    await sql`select data from public.portal_settings where id='booking'`;
  return row.data as BookingConfig;
}
const recordedBusy = (sql: Sql, from: string, to: string) =>
  externalCalendarBusy(sql, from, to, true);
async function readJson(req: Request) {
  const reader = req.body?.getReader();
  let raw = "",
    size = 0;
  if (reader) {
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 20000) {
          await reader.cancel();
          throw new CalendarError("invalid_input", 400);
        }
        raw += decoder.decode(value, { stream: true });
      }
      raw += decoder.decode();
    } finally {
      reader.releaseLock();
    }
  }
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    throw new CalendarError("invalid_input", 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new CalendarError("invalid_input", 400);

  return body;
}
async function consumeCallback(url: URL, sql: Sql) {
  const state = url.searchParams.get("state") ?? "";
  if (!/^[a-f0-9]{64}$/.test(state))
    throw new CalendarError("invalid_oauth_state", 400);
  const [ticket] =
    await sql`delete from private.google_calendar_oauth where state_hash=${await sha(state)} and created_at>now()-interval '10 minutes' returning actor_id`;
  if (!ticket) throw new CalendarError("invalid_oauth_state", 400);
  const [actor] =
    await sql`select id from public.portal_profiles where id=${ticket.actor_id} and role='admin' and status='active'`;
  if (!actor) throw new CalendarError("forbidden", 403);
  if (url.searchParams.get("error"))
    throw new CalendarError("consent_cancelled", 400);
  const lease = new Date(Date.now() + 120000).toISOString();
  const [claimed] =
    await sql`update private.google_calendar_connection set connect_until=${lease} where id=true and (connect_until is null or connect_until<now()) returning id`;
  if (!claimed) throw new CalendarError("connection_busy", 409);
  try {
    const code = url.searchParams.get("code");
    if (!code || code.length > 3000 || !ready())
      throw new CalendarError("not_configured", 400);
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
        client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
        redirect_uri: callback,
      }),
      signal: AbortSignal.timeout(10000),
    });
    const grant = await response.json();
    if (!response.ok || !grant.access_token)
      throw new CalendarError("authorization_failed");
    const scopes = String(grant.scope ?? "").split(" ");
    if (
      CALENDAR_SCOPES.filter((s) => s.startsWith("https://")).some(
        (s) => !scopes.includes(s),
      )
    )
      throw new CalendarError("scope_required", 400);
    const identity = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: { Authorization: `Bearer ${grant.access_token}` },
        signal: AbortSignal.timeout(10000),
      },
    );
    const profile = await identity.json();
    if (
      !identity.ok ||
      profile.email_verified !== true ||
      String(profile.email).toLowerCase() !== CALENDAR_OWNER
    )
      throw new CalendarError("owner_mismatch", 400);
    const old = await calendarConnection(sql);
    if (!grant.refresh_token) throw new CalendarError("refresh_required", 400);
    const cipher = await encryptCalendarCredentials({
      accessToken: grant.access_token,
      refreshToken: grant.refresh_token,
      expiresAt: Date.now() + Number(grant.expires_in || 3600) * 1000,
    });
    const refreshExpiry = grant.refresh_token_expires_in
      ? new Date(
          Date.now() + Number(grant.refresh_token_expires_in) * 1000,
        ).toISOString()
      : null;
    await sql`update private.google_calendar_connection set owner_email=${CALENDAR_OWNER},credentials=${cipher},connected_by=${ticket.actor_id},refresh_expires_at=${refreshExpiry},last_error='connecting',updated_at=now() where id=true`;
    const config = await booking(sql),
      managed = { ...old?.managed },
      busy = { ...old?.busy };
    for (const host of config.hosts.filter((h) => h.bookable)) {
      let exists = false;
      if (managed[host.id])
        try {
          await calendarGoogleRequest(
            grant.access_token,
            `/calendars/${encodeURIComponent(managed[host.id])}/events?maxResults=1&fields=items(id)`,
          );
          exists = true;
        } catch (error) {
          if (!(
            error instanceof CalendarError &&
            ["google_404", "google_410"].includes(error.code)
          ))
            throw error;
        }
      if (!exists) {
        const calendar = await calendarGoogleRequest<{ id: string }>(
          grant.access_token,
          "/calendars",
          "POST",
          {
            summary: `LDgenX · ${host.name}`,
            description:
              "Agenda géré par le portail LDgenX. Modifier les rendez-vous dans LDgenX. Les événements ajoutés manuellement ici bloquent la personne associée.",
            timeZone: "Europe/Paris",
          },
        );
        if (!calendar.id) throw new CalendarError("google_unavailable");
        managed[host.id] = calendar.id;
      }
      busy[host.id] ??= ["primary"];
      await sql`update private.google_calendar_connection set managed=${sql.json(managed)},busy=${sql.json(busy)} where id=true`;
    }
    // Validate the owner's busy calendars before enabling protection or claiming connectivity.
    const previousEnabled = old?.enabled ?? false;
    await sql`update private.google_calendar_connection set enabled=true where id=true`;
    try {
      await recordedBusy(
        sql,
        new Date().toISOString(),
        new Date(Date.now() + 86400000).toISOString(),
      );
    } catch (error) {
      if (!previousEnabled)
        await sql`update private.google_calendar_connection set enabled=false where id=true`;
      throw error;
    }
    await sql.begin(async (tx) => {
      await tx`select pg_advisory_xact_lock(hashtextextended('booking',0))`;
      await tx`update private.google_calendar_connection set enabled=true,last_error=null,updated_at=now() where id=true`;
      await tx`insert into private.google_calendar_outbox(appointment_id) select id from public.portal_appointments where data->>'status' in ('requested','confirmed') and (data->>'end')::timestamptz>now()-interval '1 day' on conflict(appointment_id) do update set revision=now(),attempts=0,next_attempt_at=now(),last_error=null`;
      await enqueueCalendarBlocks(
        tx as unknown as Sql,
        await booking(tx as unknown as Sql),
      );
    });
    await runCalendarSync(sql);
  } finally {
    await sql`update private.google_calendar_connection set connect_until=null where id=true and connect_until=${lease}`;
  }
}
Deno.serve(async (req) => {
  const sql = database(),
    url = new URL(req.url),
    path = url.pathname.replace(/^\/calendar(?=\/|$)/, "") || "/",
    origin = req.headers.get("origin");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "Access-Control-Allow-Headers":
      "authorization,apikey,content-type,x-client-info",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    Vary: "Origin",
  };
  if (origin && portalOrigins.includes(origin))
    headers["Access-Control-Allow-Origin"] = origin;
  const respond = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers });
  try {
    if (path === "/callback" && req.method === "GET") {
      let result = "connected";
      try {
        await consumeCallback(url, sql);
      } catch (error) {
        result =
          error instanceof CalendarError ? error.code : "connection_failed";
      }
      return new Response(null, {
        status: 303,
        headers: {
          Location: `${productionOrigin}/admin/parametres?onglet=google&calendar=${encodeURIComponent(result)}`,
          "Cache-Control": "no-store",
          "Referrer-Policy": "no-referrer",
        },
      });
    }
    if (origin && !portalOrigins.includes(origin))
      throw new CalendarError("forbidden", 403);
    if (req.method === "OPTIONS")
      return new Response(null, { status: 204, headers });
    if (path === "/jobs" && req.method === "POST") {
      const secret = Deno.env.get("GOOGLE_CALENDAR_JOB_SECRET");
      if (!secret || req.headers.get("x-calendar-job-key") !== secret)
        throw new CalendarError("forbidden", 403);
      const connection = await calendarConnection(sql);
      if (!connection?.enabled) return respond({ synced: 0, pending: 0 });
      if (
        !connection.last_reconcile_at ||
        Date.now() - new Date(connection.last_reconcile_at).getTime() > 300000
      ) {
        try {
          const config = await booking(sql);
          await recordedBusy(
            sql,
            new Date().toISOString(),
            new Date(
              Date.now() + Math.min(config.horizonDays, 93) * 86400000,
            ).toISOString(),
          );
        } catch {
          /* Busy failure remains recorded and booking checks fail closed; exports still retry. */
        }
        await sql`update private.google_calendar_connection set last_reconcile_at=now() where id=true`;
      }
      return respond(await runCalendarSync(sql));
    }
    const actor = await authenticate(req, sql);
    if (path === "/status" && req.method === "GET") {
      const [row] =
        await sql`select enabled,owner_email,credentials is not null as connected,managed,busy,last_sync_at,coalesce(last_busy_error,last_error) as last_error,last_busy_checked_at,refresh_expires_at,preferences,team_creation_token from private.google_calendar_connection where id=true`;
      const [pending] =
        await sql`select ((select count(*) from private.google_calendar_outbox)+(select count(*) from private.google_calendar_block_outbox))::int as count`;
      return respond({
        configured: ready(),
        expectedOwner: CALENDAR_OWNER,
        enabled: row.enabled,
        connected: row.connected,
        owner: row.owner_email,
        managed: row.managed,
        busy: row.busy,
        lastSync: row.last_sync_at,
        lastError: row.last_error,
        lastBusyCheck: row.last_busy_checked_at,
        refreshExpires: row.refresh_expires_at,
        pending: pending.count,
        preferences: calendarPreferences(row.preferences),
        teamCalendar: row.managed._team ?? null,
        teamNeedsAttention: !!row.team_creation_token && !row.managed._team,
        hosts: (await booking(sql)).hosts
          .filter((h) => h.bookable)
          .map(({ id, name }) => ({ id, name })),
      });
    }
    const item = path.match(/^\/item\/(appointment|block)\/([^/]+)$/);
    if (item && req.method === "GET")
      return respond(
        await calendarItemState(
          sql,
          item[1] as "appointment" | "block",
          decodeURIComponent(item[2]),
        ),
      );
    if (path === "/preferences" && req.method === "PUT") {
      const body = await readJson(req),
        prefs = validateCalendarPreferences(body.preferences);
      if (body.teamCalendarId)
        await configureTeamCalendar(sql, String(body.teamCalendarId).trim());
      await sql.begin(async (transaction) => {
        const tx = transaction as unknown as Sql;
        await tx`select pg_advisory_xact_lock(hashtextextended('booking',0))`;
        await tx`update private.google_calendar_connection set preferences=${tx.json(prefs as never)},updated_at=now() where id=true`;
        await enqueueCalendarRefresh(tx);
      });
      return respond(await runCalendarSync(sql));
    }
    if (path === "/connect" && req.method === "POST") {
      if (!ready()) throw new CalendarError("not_configured");
      await sql`delete from private.google_calendar_oauth where created_at<now()-interval '20 minutes'`;
      const state = [...crypto.getRandomValues(new Uint8Array(32))]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      await sql`insert into private.google_calendar_oauth(state_hash,actor_id) values(${await sha(state)},${actor})`;
      const google = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      google.search = new URLSearchParams({
        client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
        redirect_uri: callback,
        response_type: "code",
        scope: CALENDAR_SCOPES.join(" "),
        access_type: "offline",
        prompt: "consent",
        include_granted_scopes: "true",
        login_hint: CALENDAR_OWNER,
        state,
      }).toString();
      return respond({ url: google.href });
    }
    if (path === "/busy" && req.method === "GET") {
      const from = url.searchParams.get("from") ?? "",
        to = url.searchParams.get("to") ?? "",
        start = Date.parse(from),
        end = Date.parse(to);
      if (
        !Number.isFinite(start) ||
        !Number.isFinite(end) ||
        end <= start ||
        end - start > 94 * 86400000
      )
        throw new CalendarError("invalid_input", 400);
      return respond(
        await recordedBusy(
          sql,
          new Date(start).toISOString(),
          new Date(end).toISOString(),
        ),
      );
    }
    if (path === "/config" && req.method === "PUT") {
      const body = await readJson(req);
      const config = await booking(sql),
        busy = validateCalendarMap(body.busy, config),
        connection = await calendarConnection(sql);
      if (!connection?.credentials) throw new CalendarError("refresh_required");
      if (
        Object.values(busy)
          .flat()
          .some((id) => Object.values(connection.managed).includes(id))
      )
        throw new CalendarError("invalid_calendar_mapping", 400);
      const previous = connection.busy;
      await sql`update private.google_calendar_connection set busy=${sql.json(busy)},updated_at=now() where id=true`;
      try {
        await recordedBusy(
          sql,
          new Date().toISOString(),
          new Date(Date.now() + 86400000).toISOString(),
        );
      } catch (error) {
        await sql`update private.google_calendar_connection set busy=${sql.json(previous)} where id=true`;
        throw error;
      }
      return respond({ ok: true });
    }
    if (path === "/sync" && req.method === "POST") {
      await enqueueCalendarRefresh(sql, false);
      await sql`update private.google_calendar_outbox set next_attempt_at=now()`;
      await sql`update private.google_calendar_block_outbox set next_attempt_at=now()`;
      const config = await booking(sql);
      await recordedBusy(
        sql,
        new Date().toISOString(),
        new Date(
          Date.now() + Math.min(config.horizonDays, 93) * 86400000,
        ).toISOString(),
      );
      return respond(await runCalendarSync(sql));
    }
    if (path === "/disconnect" && req.method === "POST") {
      // Retain enabled=true after an established connection: bookings stay blocked until reconnected.
      await sql.begin(async (tx) => {
        await tx`select pg_advisory_xact_lock(hashtextextended('google-calendar-sync',0))`;
        const [row] =
          await tx`select connect_until>now() as connecting from private.google_calendar_connection where id=true`;
        if (row.connecting) throw new CalendarError("connection_busy", 409);
        await tx`delete from private.google_calendar_oauth`;
        await tx`update private.google_calendar_connection set credentials=null,last_error='refresh_required',updated_at=now() where id=true`;
      });
      return respond({ ok: true });
    }
    throw new CalendarError("not_found", 404);
  } catch (error) {
    return respond(
      {
        code:
          error instanceof CalendarError ? error.code : "google_unavailable",
      },
      error instanceof CalendarError ? error.status : 503,
    );
  } finally {
    await sql.end({ timeout: 1 }).catch(() => {});
  }
});
