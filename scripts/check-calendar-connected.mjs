// Real connected-calendar round trip, confined to QA appointments and QA blocks.
// The QA client has notifications disabled; the admin actor never notifies other admins.
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { randomUUID, randomBytes } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { parseEnv } from "node:util";
import { ref, serviceKey, query, literal } from "./lib/supabase-management.mjs";
import { calendarGoogle } from "./lib/google-calendar.mjs";
const env = parseEnv(await readFile(".env.production", "utf8")),
  project = `https://${ref}.supabase.co`,
  key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const service = createClient(project, await serviceKey(), {
  auth: { persistSession: false, autoRefreshToken: false },
});
const users = [],
  appointments = [],
  blocks = [],
  checks = [],
  run = randomUUID().slice(0, 8);
let token, google;
const ok = (condition, label) => {
  assert(condition, label);
  checks.push(label);
  console.log(label);
};
async function account(admin) {
  const email = `calendar-connected-${run}-${admin ? "admin" : "client"}@example.invalid`,
    password = randomBytes(24).toString("base64url");
  const made = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      firstName: "Calendar",
      lastName: "QA",
      organisation: "QA",
      locale: "fr",
    },
  });
  assert(!made.error);
  users.push(made.data.user.id);
  await query(
    `update public.portal_profiles set data=data||${literal(JSON.stringify({ role: admin ? "admin" : "client", status: "active", notify: { messages: false, files: false, appointments: false, weeklyPurge: false } }))}::jsonb where id=${literal(made.data.user.id)}`,
  );
  if (admin) {
    const client = createClient(project, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const signed = await client.auth.signInWithPassword({ email, password });
    assert(!signed.error);
    token = signed.data.session.access_token;
  }
  return made.data.user.id;
}
async function call(path, method = "GET", body, api = "portal") {
  const r = await fetch(`${project}/functions/v1/${api}${path}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(90000),
  });
  const value = await r.json().catch(() => null);
  assert(r.ok, `${method} ${path} HTTP ${r.status} ${value?.code ?? ""}`);
  return value;
}
async function exportsFor(id, block = false) {
  return query(
    `select calendar_id,event_id from private.${block ? "google_calendar_block_events" : "google_calendar_events"} where ${block ? "block_id" : "appointment_id"}=${literal(id)}`,
  );
}
async function readEvent(mapping) {
  return google.request(
    `/calendars/${encodeURIComponent(mapping.calendar_id)}/events/${encodeURIComponent(mapping.event_id)}?fields=id,status,start,end,extendedProperties`,
  );
}
try {
  google = await calendarGoogle();
  await account(true);
  // Recover fixtures from a prior interrupted run before allocating another test slot.
  const stale = await query(
    "select a.id,a.data->>'status' as status from public.portal_appointments a join public.portal_profiles p on p.id=a.client_id where p.data->>'email' like 'calendar-connected-%@example.invalid'",
  );
  for (const a of stale)
    if (["requested", "confirmed"].includes(a.status))
      await call(`/appointments/${a.id}/cancel`, "POST", {
        reason: "QA cleanup",
      });
  await call("/sync", "POST", undefined, "calendar");
  const oldUsers = await query(
    "select p.id from public.portal_profiles p where p.data->>'email' like 'calendar-connected-%@example.invalid' and not exists(select 1 from public.portal_appointments a where a.client_id=p.id and exists(select 1 from private.google_calendar_events e where e.appointment_id=a.id))",
  );
  for (const old of oldUsers)
    if (!users.includes(old.id)) {
      const deleted = await service.auth.admin.deleteUser(old.id);
      assert(!deleted.error);
    }
  const client = await account(false);
  const config = await call("/booking/config"),
    host = config.hosts.find((h) => h.bookable),
    type = config.types.find((t) => t.active);
  // Off-hours fixture: avoid occupying a public bookable slot during the test.
  let start = new Date(Date.now() + 40 * 86400000);
  start.setUTCHours(2, 0, 0, 0);
  const booking = await call("/appointments", "POST", {
    clientId: client,
    typeId: type.id,
    hostId: host.id,
    start: start.toISOString(),
    topic: "Calendar QA",
    meetingUrl: "",
  });
  appointments.push(booking.id);
  let maps = await exportsFor(booking.id);
  ok(
    maps.length === 1,
    "Website API appointment creates a mapped Google event",
  );
  let remote = await readEvent(maps[0]);
  ok(
    remote.status === 200 &&
      Date.parse(remote.value.start.dateTime) === Date.parse(booking.start),
    "Real Google event time matches the portal appointment",
  );
  const moved = new Date(start.getTime() + 3600000).toISOString();
  await call(`/appointments/${booking.id}/move`, "POST", { start: moved });
  remote = await readEvent(maps[0]);
  ok(
    remote.status === 200 &&
      Date.parse(remote.value.start.dateTime) === Date.parse(moved),
    "Website move updates the same Google event",
  );
  await call(`/appointments/${booking.id}/cancel`, "POST", {
    reason: "QA cleanup",
  });
  remote = await readEvent(maps[0]);
  ok(
    [404, 410].includes(remote.status) || remote.value?.status === "cancelled",
    "Website cancellation removes the Google event",
  );
  if (process.argv.includes("--blocks")) {
    const end = new Date(start.getTime() + 1800000).toISOString();
    const block = await call("/booking/blocks", "POST", {
      hostId: null,
      start: start.toISOString(),
      end,
      reason: "Calendar QA block",
    });
    blocks.push(block.id);
    maps = await exportsFor(block.id, true);
    ok(
      maps.length === config.hosts.filter((h) => h.bookable).length,
      "Whole-team block exports to every bookable person’s Google calendar",
    );
    for (const mapping of maps) {
      const event = await readEvent(mapping);
      assert.equal(event.status, 200);
      assert.equal(Date.parse(event.value.start.dateTime), start.getTime());
      assert.equal(
        event.value.extendedProperties.private.ldgenxBlock,
        block.id,
      );
    }
    ok(
      true,
      "Real Google block events preserve times and their managed identity",
    );
    const busy = await call(
      `/busy?${new URLSearchParams({ from: new Date(start.getTime() - 3600000).toISOString(), to: new Date(start.getTime() + 3600000).toISOString() })}`,
      "GET",
      undefined,
      "calendar",
    );
    ok(
      !busy.some((b) => maps.some((m) => b.id.endsWith(m.event_id))),
      "Managed block copies are not imported as duplicate Google busy entries",
    );
    await call(`/booking/blocks/${block.id}`, "DELETE");
    for (const mapping of maps) {
      const event = await readEvent(mapping);
      assert(
        [404, 410].includes(event.status) ||
          event.value?.status === "cancelled",
      );
    }
    ok(true, "Deleting the website block removes every managed Google copy");
    blocks.splice(blocks.indexOf(block.id), 1);
  }
  const state = await call("/status", "GET", undefined, "calendar");
  ok(
    state.lastSync && !state.lastError && state.pending === 0,
    "Connected status reports successful export with no pending work or error",
  );
  await mkdir("docs/calendar-qa", { recursive: true });
  await writeFile(
    "docs/calendar-qa/connected-round-trip.json",
    JSON.stringify(
      {
        date: new Date().toISOString(),
        checks,
        realGoogle: true,
        fixturesRemoved: true,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`${checks.length} real connected-calendar checks passed.`);
} finally {
  await cleanupFixtures().catch(() => {
    console.error("QA fixture cleanup needs retry.");
    process.exitCode = 1;
  });
}
async function cleanupFixtures() {
  for (const id of blocks) {
    try {
      await call(`/booking/blocks/${id}`, "DELETE");
    } catch {
      console.error("QA block cleanup needs retry");
    }
  }
  for (const id of appointments) {
    try {
      await call(`/appointments/${id}/cancel`, "POST", {
        reason: "QA cleanup",
      });
    } catch {
      /* A successfully cancelled record needs no extra mutation. */
    }
  }
  // The backend removes mappings only after Google acknowledged deletion. Recheck only remaining mappings.
  const remaining = await query(
    `select calendar_id,event_id from private.google_calendar_events where appointment_id in (${appointments.length ? appointments.map(literal).join(",") : "'00000000-0000-0000-0000-000000000000'"})`,
  );
  for (const event of remaining) {
    const removed = await google.request(
      `/calendars/${encodeURIComponent(event.calendar_id)}/events/${encodeURIComponent(event.event_id)}?sendUpdates=none`,
      "DELETE",
    );
    if (![204, 404, 410].includes(removed.status))
      throw new Error("QA Google event cleanup needs retry.");
  }
  for (const id of [...users].reverse()) {
    const result = await service.auth.admin.deleteUser(id);
    if (result.error) throw new Error("QA account cleanup needs retry.");
  }
}
