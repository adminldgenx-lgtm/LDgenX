import assert from "node:assert/strict";
import test from "node:test";
import { defaultBooking } from "../supabase/functions/_shared/defaults.ts";
import { atMinutes, addDays, teamDay, weekdayOf, DAY } from "../supabase/functions/_shared/time.ts";
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
  googleEventSpans,
  validateCalendarMap,
  CalendarError,
} from "../supabase/functions/_shared/calendar.ts";
import {
  encryptCalendarCredentials,
  externalCalendarBusy,
  upsertCalendarEvent,
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
  const revision = "2026-10-29T16:00:00Z";
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
    assert(!url.includes("summary"));
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
