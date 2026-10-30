import assert from "node:assert/strict";
import test from "node:test";
import { defaultBooking } from "../supabase/functions/_shared/defaults.ts";
import {
  atMinutes,
  addDays,
  teamDay,
  weekdayOf,
  DAY,
} from "../supabase/functions/_shared/time.ts";
import {
  PortalService,
  type Repository,
} from "../supabase/functions/_shared/service.ts";
import {
  PortalError,
  type Appointment,
  type TimeBlock,
  type User,
} from "../supabase/functions/_shared/types.ts";
import {
  appointmentGoogleEvents,
  blockGoogleEvents,
  googleEventSpans,
  validateCalendarMap,
  CalendarError,
  calendarEventMatches,
  calendarEventRange,
  validateCalendarPreferences,
} from "../supabase/functions/_shared/calendar.ts";
import {
  encryptCalendarCredentials,
  externalCalendarBusy,
  upsertCalendarEvent,
  runCalendarSync,
} from "../supabase/functions/_shared/google-calendar.ts";
import type { Sql } from "npm:postgres@3.4.7";
const id = "92efda45-aae8-400c-8191-3c480c4a8ee1";
let day = teamDay(Date.now() + 7 * DAY);
while (weekdayOf(day) > 4) day = addDays(day, 1);
const iso = (hour: number, min = 0) =>
  atMinutes(day, hour * 60 + min).toISOString();
const fixture: Appointment = {
  id,
  hostId: "maeva",
  typeId: "decouverte",
  start: iso(10),
  end: iso(10, 15),
  status: "confirmed",
  clientId: null,
  guest: {
    name: "PRIVATE CLIENT",
    email: "private@example.invalid",
    organisation: "PRIVATE LAB",
    phone: "",
  },
  topic: "PRIVATE SUBJECT",
  meetingUrl: "",
  change: null,
  reply: "",
  createdBy: "team",
  createdAt: iso(9),
  updatedAt: iso(9),
};
const managed = {
  maeva: "maeva@group.calendar.google.com",
  emilie: "emilie@group.calendar.google.com",
  damien: "damien@group.calendar.google.com",
};
test("exports hold requested appointments and both pending-change hosts without personal details", () => {
  const a = {
    ...fixture,
    status: "requested" as const,
    change: { hostId: "emilie", start: iso(11), end: iso(11, 15), at: iso(9) },
  };
  const events = appointmentGoogleEvents(a, managed);
  assert.equal(events.length, 2);
  assert.equal(events[1].calendarId, managed.emilie);
  for (const e of events) {
    assert.match(e.eventId, /^[a-v0-9]{5,1024}$/);
    assert.equal(e.body.transparency, "opaque");
    assert(!JSON.stringify(e).includes("PRIVATE"));
    assert(!("attendees" in e.body));
  }
  assert.deepEqual(
    appointmentGoogleEvents({ ...fixture, status: "cancelled" }, managed),
    [],
  );
  assert.deepEqual(
    appointmentGoogleEvents({ ...fixture, status: "declined" }, managed),
    [],
  );
});
test("busy intervals handle Paris all-day DST boundaries, transparency, recurrence instances and known exports", () => {
  const spans = googleEventSpans(
    [
      {
        id: "allDay",
        start: { date: "2026-10-25" },
        end: { date: "2026-10-26" },
      },
      {
        id: "instance",
        start: { dateTime: iso(10) },
        end: { dateTime: iso(11) },
      },
      { id: "known", start: { dateTime: iso(10) }, end: { dateTime: iso(11) } },
      { id: "cancelled", status: "cancelled" },
      { id: "free", transparency: "transparent" },
    ],
    new Set(["known"]),
    "maeva",
  );
  assert.equal(spans.length, 2);
  assert.equal(spans[0].allDay, true);
  assert.equal(spans[1].allDay, false);
  assert.equal(
    Date.parse(spans[0].end) - Date.parse(spans[0].start),
    25 * 3600000,
  );
  assert.throws(
    () =>
      googleEventSpans(
        [{ id: "bad", start: { dateTime: "bad" }, end: { dateTime: iso(11) } }],
        new Set(),
        "maeva",
      ),
    CalendarError,
  );
});
test("calendar maps accept only bookable hosts and bounded, deduplicated IDs", () => {
  const c = structuredClone(defaultBooking);
  const values = Object.fromEntries(
    c.hosts
      .filter((h) => h.bookable)
      .map((h) => [h.id, ["primary", "primary"]]),
  );
  assert(
    Object.values(validateCalendarMap(values, c)).every(
      (ids) => ids.length === 1,
    ),
  );
  assert.throws(
    () =>
      validateCalendarMap({ ...values, maeva: ["https://evil.example"] }, c),
    CalendarError,
  );
  assert.throws(
    () =>
      validateCalendarMap({ ...values, maeva: Array(16).fill("primary") }, c),
    CalendarError,
  );
});
function repo(blocks: TimeBlock[], fail = false): Repository {
  return {
    setting: async () => {
      const c = structuredClone(defaultBooking);
      c.minNoticeHours = 0;
      c.bufferMinutes = 15;
      return c;
    },
    list: async () => [],
    externalBusy: async () => {
      if (fail) throw new PortalError("calendar_unavailable");
      return blocks;
    },
  } as unknown as Repository;
}
const block: TimeBlock = {
  id: "google:busy:0",
  hostId: "maeva",
  start: iso(10),
  end: iso(11),
  reason: "Google Calendar",
};
test("public availability excludes Google busy times and buffer, while preserving other hosts", async () => {
  const slots = await new PortalService(repo([block]), null).availableSlots(
    "decouverte",
    iso(9),
    iso(12),
  );
  const blocked = slots.find((s) => s.start === iso(10));
  assert(!blocked?.hostIds.includes("maeva"));
  assert(blocked?.hostIds.includes("emilie"));
  assert(!slots.find((s) => s.start === iso(11))?.hostIds.includes("maeva"));
  assert(slots.find((s) => s.start === iso(11, 15))?.hostIds.includes("maeva"));
});
test("administrator scheduling and client requests cannot bypass Google busy checks", async () => {
  const admin = { id: "admin", role: "admin", status: "active" } as User;
  await assert.rejects(
    new PortalService(repo([block]), admin).scheduleAppointment({
      typeId: "decouverte",
      hostId: "maeva",
      start: iso(10),
      clientId: null,
      guest: fixture.guest!,
      topic: "",
      meetingUrl: "",
    }),
    { code: "slot_taken" },
  );
  await assert.rejects(
    new PortalService(repo([block]), null).requestAppointment({
      typeId: "decouverte",
      hostId: "maeva",
      start: iso(10),
      guest: fixture.guest!,
      topic: "",
    }),
    { code: "slot_taken" },
  );
});
test("enabled but unavailable Google prevents booking and listing rather than assuming free time", async () => {
  await assert.rejects(
    new PortalService(repo([], true), null).availableSlots(
      "decouverte",
      iso(9),
      iso(12),
    ),
    { code: "calendar_unavailable" },
  );
  await assert.rejects(
    new PortalService(repo([], true), null).requestAppointment({
      typeId: "decouverte",
      start: iso(10),
      guest: fixture.guest!,
      topic: "",
    }),
    { code: "calendar_unavailable" },
  );
});
// These tests mock Google only: no real account authorization or events are used.
test("encrypted credentials are randomized and cannot expose tokens as plaintext", async () => {
  Deno.env.set("GOOGLE_CALENDAR_ENCRYPTION_KEY", btoa("x".repeat(32)));
  const value = {
    accessToken: "SECRET-ACCESS",
    refreshToken: "SECRET-REFRESH",
    expiresAt: Date.now() + 3600000,
  };
  const a = await encryptCalendarCredentials(value),
    b = await encryptCalendarCredentials(value);
  assert.notEqual(a, b);
  assert(!a.includes(value.accessToken));
  assert.equal(a.split(".").length, 2);
});
test("unconnected bridge returns no Google blocks without issuing network requests", async () => {
  const sql = (async () => [{ enabled: false }]) as unknown as Sql;
  assert.deepEqual(await externalCalendarBusy(sql, iso(9), iso(12)), []);
});
test("deleted Google exports are recreated under deterministic replacement IDs and retries remain idempotent", async () => {
  const original = globalThis.fetch;
  const requests: { url: string; method: string; body: unknown }[] = [];
  const event = appointmentGoogleEvents(fixture, managed)[0];
  const old = event.eventId;
  const revision = "2026-10-29 16:00:00.123456+00";
  const remote = new Map<string, unknown>();
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    const body = init?.body ? JSON.parse(String(init.body)) : null;
    requests.push({ url, method: init?.method ?? "GET", body });
    if (url.includes(`/events/${old}?`))
      return new Response("{}", { status: 410 });
    if (init?.method === "PUT") {
      if (!remote.has(body.id)) return new Response("{}", { status: 404 });
      remote.set(body.id, body);
      return Response.json(body);
    }
    if (init?.method === "POST") {
      if (remote.has(body.id)) return new Response("{}", { status: 409 });
      remote.set(body.id, body);
      return Response.json(body);
    }
    throw new Error("unexpected");
  };
  try {
    const first = await upsertCalendarEvent(
      "TOKEN",
      structuredClone(event),
      revision,
    );
    const retry = await upsertCalendarEvent(
      "TOKEN",
      structuredClone(event),
      revision,
    );
    assert.equal(first.eventId, retry.eventId);
    assert.notEqual(first.eventId, old);
    assert.match(first.eventId, /^[a-v0-9]+$/);
    assert.equal(remote.size, 1);
    assert(requests.every((r) => r.url.endsWith("sendUpdates=none")));
  } finally {
    globalThis.fetch = original;
  }
});

test("live-busy bridge ignores only matching managed events; moved events block and enqueue repair", async () => {
  Deno.env.set("GOOGLE_CALENDAR_ENCRYPTION_KEY", btoa("x".repeat(32)));
  const credentials = await encryptCalendarCredentials({
    accessToken: "MOCK-TOKEN",
    refreshToken: "MOCK-REFRESH",
    expiresAt: Date.now() + 3600000,
  });
  const config = structuredClone(defaultBooking);
  const calendars = Object.fromEntries(
    config.hosts
      .filter((h) => h.bookable)
      .map((h) => [h.id, `${h.id}@group.calendar.google.com`]),
  );
  const connection = {
    enabled: true,
    owner_email: "owner@example.invalid",
    credentials,
    managed: calendars,
    busy: Object.fromEntries(
      config.hosts.filter((h) => h.bookable).map((h) => [h.id, ["primary"]]),
    ),
  };
  const expected = appointmentGoogleEvents(fixture, calendars)[0];
  let moved = false,
    partialError = false;
  const repairs: string[] = [];
  const sql = (async (parts: TemplateStringsArray) => {
    const text = parts.join("?");
    if (text.includes("select * from private.google_calendar_connection"))
      return [connection];
    if (text.includes("select data from public.portal_settings"))
      return [{ data: config }];
    if (text.includes("select * from private.google_calendar_block_events"))
      return [];
    if (text.includes("select e.calendar_id"))
      return [
        {
          calendar_id: calendars.maeva,
          event_id: expected.eventId,
          kind: "main",
          appointment_id: id,
          data: fixture,
        },
      ];
    if (text.includes("insert into private.google_calendar_outbox")) {
      repairs.push(id);
      return [];
    }
    throw new Error("Unexpected database request");
  }) as unknown as Sql;
  const original = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url.endsWith("/freeBusy")) {
      const body = JSON.parse(String(init?.body));
      assert.deepEqual(body.items, [{ id: "owner@example.invalid" }]);
      return Response.json({
        calendars: {
          "owner@example.invalid": partialError
            ? { errors: [{ reason: "notFound" }] }
            : { busy: [] },
        },
      });
    }
    assert(url.includes("fields="));
    assert(
      Object.values(calendars).some((id) =>
        url.includes(encodeURIComponent(id)),
      ),
    );
    assert(!url.includes("description"));
    const isHost = url.includes(encodeURIComponent(calendars.maeva));
    return Response.json({
      items: isHost
        ? [
            {
              ...expected.body,
              ...(moved
                ? {
                    start: { dateTime: iso(11) },
                    end: { dateTime: iso(11, 15) },
                  }
                : {}),
            },
          ]
        : [],
    });
  };
  try {
    assert.deepEqual(await externalCalendarBusy(sql, iso(9), iso(12)), []);
    assert.equal(repairs.length, 0);
    moved = true;
    const spans = await externalCalendarBusy(sql, iso(9), iso(12));
    assert.equal(spans.length, 1);
    assert.equal(spans[0].start, iso(11));
    assert.equal(repairs.length, 1);
    partialError = true;
    await assert.rejects(externalCalendarBusy(sql, iso(9), iso(12)), {
      code: "calendar_unavailable",
    });
  } finally {
    globalThis.fetch = original;
  }
});
test("an enabled disconnected calendar never silently falls back to unprotected slots", async () => {
  const sql = (async () => [
    { enabled: true, credentials: null },
  ]) as unknown as Sql;
  await assert.rejects(externalCalendarBusy(sql, iso(9), iso(12)), {
    code: "refresh_required",
  });
});

test("whole-team blocked times export to every bookable calendar without copying private reasons", () => {
  const c = structuredClone(defaultBooking),
    block = {
      ...fixture,
      id: "block-one",
      hostId: null,
      reason: "PRIVATE INTERNAL REASON",
    };
  const events = blockGoogleEvents(block, c, managed, {
    shareBlockTitles: false,
    teamBlocks: "per_host",
  });
  assert.equal(events.length, c.hosts.filter((h) => h.bookable).length);
  assert.deepEqual(events.map((e) => e.hostId).sort(), [
    "damien",
    "emilie",
    "maeva",
  ]);
  for (const event of events) {
    assert.match(event.eventId, /^[a-v0-9]{5,1024}$/);
    assert(!JSON.stringify(event).includes("PRIVATE"));
    assert.equal(event.body.transparency, "opaque");
    assert.equal(event.body.extendedProperties.private.ldgenxBlock, block.id);
  }
  assert.equal(
    blockGoogleEvents({ ...block, hostId: "emilie" }, c, managed).length,
    1,
  );
  assert.equal(
    blockGoogleEvents({ ...block, hostId: "maxime" }, c, managed).length,
    0,
  );
});
test("administrators cannot schedule an appointment inside a portal blocked time", async () => {
  const r = repo([]),
    setting = r.setting;
  r.setting = async (key) => {
    const c = (await setting(key)) as typeof defaultBooking;
    c.blocks = [block];
    return c as never;
  };
  await assert.rejects(
    new PortalService(r, {
      id: "admin",
      role: "admin",
      status: "active",
    } as User).scheduleAppointment({
      typeId: "decouverte",
      hostId: "maeva",
      start: iso(10),
      clientId: null,
      guest: fixture.guest!,
      topic: "",
      meetingUrl: "",
    }),
    { code: "slot_taken" },
  );
});
test("outbox acknowledgement preserves PostgreSQL microseconds instead of leaving successful exports pending", async () => {
  Deno.env.set("GOOGLE_CALENDAR_ENCRYPTION_KEY", btoa("x".repeat(32)));
  const credentials = await encryptCalendarCredentials({
    accessToken: "MOCK",
    refreshToken: "MOCK",
    expiresAt: Date.now() + 3600000,
  });
  const revision = "2026-10-29 20:00:00.123456+00";
  let pending = true;
  const observed: unknown[] = [];
  const tag = async (parts: TemplateStringsArray, ...values: unknown[]) => {
    const text = parts.join("?");
    if (text.includes("select * from private.google_calendar_connection"))
      return [{ enabled: true, credentials, managed }];
    if (text.includes("pg_try_advisory_xact_lock")) return [{ acquired: true }];
    if (text.includes("select appointment_id"))
      return pending
        ? [
            {
              appointment_id: id,
              revision: text.includes("revision::text")
                ? revision
                : new Date(revision),
            },
          ]
        : [];
    if (text.includes("select data from public.portal_appointments"))
      return [{ data: fixture }];
    if (text.includes("select * from private.google_calendar_events"))
      return [];
    if (text.includes("insert into private.google_calendar_events")) return [];
    if (text.includes("delete from private.google_calendar_outbox")) {
      observed.push(values[1]);
      if (text.includes("revision::text") && values[1] === revision)
        pending = false;
      return [];
    }
    if (text.includes("select data from public.portal_settings"))
      return [{ data: structuredClone(defaultBooking) }];
    if (text.includes("select block_id")) return [];
    if (text.includes("update private.google_calendar_connection")) return [];
    if (text.includes("select ((select count(*)"))
      return [{ count: pending ? 1 : 0 }];
    throw new Error("Unexpected SQL in outbox regression");
  };
  const sql = Object.assign(tag, {
    begin: async (fn: (tx: Sql) => Promise<unknown>) =>
      fn(sql as unknown as Sql),
  }) as unknown as Sql;
  const original = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ id: "exported" });
  try {
    const result = await runCalendarSync(sql, id);
    assert.equal(result.synced, 1);
    assert.equal(result.pending, 0);
    assert.deepEqual(observed, [revision]);
  } finally {
    globalThis.fetch = original;
  }
});

test("shared team blocks have one useful Google event with a direct editable-record link", () => {
  const config = structuredClone(defaultBooking),
    b = {
      id: "team-block",
      hostId: null,
      start: iso(10),
      end: iso(11),
      reason: "Réunion de laboratoire",
    };
  const events = blockGoogleEvents(b, config, {
    ...managed,
    _team: "team@group.calendar.google.com",
  });
  assert.equal(events.length, 1);
  assert.equal(events[0].hostId, "_team");
  assert.equal(
    events[0].body.summary,
    "Réunion de laboratoire · Toute l’équipe",
  );
  const link = new URL(events[0].body.source.url);
  assert.equal(link.searchParams.get("creneau"), b.id);
  assert.equal(link.searchParams.get("date"), day);
  assert(events[0].body.description.includes("Personnes concernées"));
  assert.equal(events[0].body.reminders.useDefault, false);
  assert.equal(
    blockGoogleEvents(
      b,
      config,
      { ...managed, _team: "team@group.calendar.google.com" },
      { teamBlocks: "per_host" },
    ).length,
    3,
  );
});
test("all-day blocks keep exclusive Google end dates across the Paris clock change", () => {
  const b = {
    id: "dst-day",
    hostId: "maeva",
    reason: "Congés",
    allDay: true,
    start: atMinutes("2026-03-29", 0).toISOString(),
    end: atMinutes("2026-03-31", 0).toISOString(),
  };
  const [event] = blockGoogleEvents(
    b,
    structuredClone(defaultBooking),
    managed,
  );
  assert.equal(event.body.start.date, "2026-03-29");
  assert.equal(event.body.end.date, "2026-03-31");
  const span = calendarEventRange(event.body);
  assert.equal(span.end - span.start, 47 * 3600000);
  assert(
    calendarEventMatches({ ...event.body, id: "different-id" }, event.body),
  );
});
test("rich appointment exports withhold private details by default and escape explicitly shared text", () => {
  const config = structuredClone(defaultBooking),
    a = {
      ...fixture,
      meetingUrl: "https://meet.example.invalid/session",
      topic: "<script>alert(1)</script>",
    };
  const [safe] = appointmentGoogleEvents(a, managed, config);
  assert(safe.body.summary.includes(config.types[0].label.fr));
  assert(!safe.body.description.includes("PRIVATE"));
  assert(!safe.body.description.includes("<script>"));
  assert(safe.body.location.includes("meet.example.invalid"));
  assert.equal(safe.body.reminders.overrides[0].method, "popup");
  const [shared] = appointmentGoogleEvents(
    a,
    managed,
    config,
    {
      shareClientDetails: true,
      shareAppointmentNotes: true,
      shareMeetingLink: false,
      reminderMinutes: null,
    },
    { name: "<img src=x>", organisation: "A & B" },
  );
  assert(shared.body.description.includes("&lt;img"));
  assert(shared.body.description.includes("&lt;script&gt;"));
  assert(!shared.body.description.includes("<script>"));
  assert(!shared.body.description.includes("meet.example.invalid"));
  assert.equal(shared.body.reminders.overrides.length, 0);
  assert.throws(
    () => validateCalendarPreferences({ shareClientDetails: "yes" }),
    CalendarError,
  );
  assert.throws(
    () => validateCalendarPreferences({ reminderMinutes: 999 }),
    CalendarError,
  );
});
test("blocked-time editing preserves other records, checks versions and restricts access", async () => {
  const c = structuredClone(defaultBooking);
  c.blocks = [
    { ...block, version: 1 },
    { ...block, id: "another" },
  ];
  const r = {
    setting: async () => structuredClone(c),
    setSetting: async (_key: string, value: unknown) => Object.assign(c, value),
  } as unknown as Repository;
  const svc = new PortalService(r, {
    id: "admin",
    role: "admin",
    status: "active",
  } as User);
  const changed = await svc.updateBlock(block.id, {
    ...block,
    reason: "Nouveau titre",
    version: 1,
  });
  assert.equal(changed.version, 2);
  assert.equal(c.blocks.length, 2);
  assert.equal(c.blocks[1].id, "another");
  await assert.rejects(svc.updateBlock(block.id, { ...block, version: 1 }), {
    code: "stale_record",
  });
  await assert.rejects(
    new PortalService(r, {
      id: "client",
      role: "client",
      status: "active",
    } as User).updateBlock(block.id, { ...block, version: 2 }),
    { code: "forbidden" },
  );
  await assert.rejects(
    svc.updateBlock(block.id, { ...block, allDay: true, version: 2 }),
    { code: "invalid_input" },
  );
});

test("shared Google availability is displayed once for the whole team and still filters per person", async () => {
  const { agendaBlocks } = await import("../src/portal/calendar-view.ts");
  const c = structuredClone(defaultBooking),
    busy = c.hosts
      .filter((h) => h.bookable)
      .map((h) => ({
        ...block,
        reason: "Réunion laboratoire",
        id: "google:" + h.id,
        hostId: h.id,
      }));
  const whole = agendaBlocks([], busy, c, "", true);
  assert.equal(whole.length, 1);
  assert.equal(whole[0].hostId, null);
  assert(whole[0].reason.includes("Toute l’équipe"));
  assert(whole[0].reason.includes("Réunion laboratoire"));
  const individual = agendaBlocks([], busy, c, "maeva", true);
  assert.equal(individual.length, 1);
  assert.equal(individual[0].hostId, "maeva");
});
test("pending appointment changes stay visible when their original date is outside the viewed period", async () => {
  const a = {
    ...fixture,
    start: iso(9),
    end: iso(9, 15),
    change: { hostId: "maeva", start: iso(15), end: iso(15, 15), at: iso(8) },
  };
  const r = { list: async () => [a] } as unknown as Repository;
  const list = await new PortalService(r, {
    id: "admin",
    role: "admin",
    status: "active",
  } as User).listAppointments({ from: iso(14), to: iso(16) });
  assert.equal(list.length, 1);
});
