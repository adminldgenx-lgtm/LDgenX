import type { Appointment, BookingConfig, TimeBlock } from "./types.ts";
import { heldSpans } from "./availability.ts";
import { atMinutes, type DayKey } from "./time.ts";
export const CALENDAR_OWNER = "admin.ldgenx@gmail.com";
export const CALENDAR_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/calendar.app.created",
  "https://www.googleapis.com/auth/calendar.events.freebusy",
];
export class CalendarError extends Error {
  constructor(
    public code: string,
    public status = 503,
  ) {
    super(code);
  }
}
export interface GoogleEvent {
  id?: string;
  status?: string;
  transparency?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  extendedProperties?: { private?: Record<string, string> };
}
export function validateCalendarMap(
  input: unknown,
  config: BookingConfig,
): Record<string, string[]> {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new CalendarError("invalid_input", 400);
  const result: Record<string, string[]> = {};
  for (const host of config.hosts.filter((h) => h.bookable)) {
    const ids = (input as Record<string, unknown>)[host.id];
    if (
      !Array.isArray(ids) ||
      ids.length > 15 ||
      ids.some(
        (id) =>
          typeof id !== "string" ||
          id.length > 254 ||
          !/^[a-zA-Z0-9_.@+=-]+$/.test(id),
      )
    )
      throw new CalendarError("invalid_input", 400);
    result[host.id] = [...new Set(ids as string[])];
  }
  if (new Set(Object.values(result).flat()).size > 50)
    throw new CalendarError("invalid_input", 400);
  return result;
}
export function googleEventSpans(
  events: GoogleEvent[],
  knownIds: Set<string>,
  hostId: string,
): TimeBlock[] {
  const result: TimeBlock[] = [];
  const time = (part: { dateTime?: string; date?: string } | undefined) =>
    part?.dateTime
      ? Date.parse(part.dateTime)
      : part?.date
        ? atMinutes(part.date as DayKey, 0).getTime()
        : NaN;
  for (const event of events) {
    if (
      event.status === "cancelled" ||
      event.transparency === "transparent" ||
      knownIds.has(event.id ?? "")
    )
      continue;
    const start = time(event.start),
      end = time(event.end);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start)
      throw new CalendarError("invalid_google_event");
    result.push({
      id: `google:${hostId}:${event.id}`,
      hostId,
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
      reason: "Google Calendar",
    });
  }
  return result;
}
export function appointmentGoogleEvents(
  a: Appointment,
  managed: Record<string, string>,
) {
  return heldSpans(a).map((span, index) => {
    const kind = index === 0 ? "main" : "change",
      calendarId = managed[span.hostId];
    if (!calendarId) throw new CalendarError("host_not_configured");
    const eventId = `ldg${a.id.replaceAll("-", "")}${index}`;
    return {
      kind,
      calendarId,
      eventId,
      body: {
        id: eventId,
        status: "confirmed",
        summary:
          kind === "change"
            ? "LDgenX · changement demandé"
            : a.status === "requested"
              ? "LDgenX · rendez-vous en attente"
              : "LDgenX · rendez-vous confirmé",
        description: `Rendez-vous géré dans le portail LDgenX.\nhttps://www.ldgenx.fr/admin/agenda\nRéférence : ${a.id}\nLes modifications et annulations se font dans LDgenX.`,
        start: {
          dateTime: new Date(span.span.start).toISOString(),
          timeZone: "Europe/Paris",
        },
        end: {
          dateTime: new Date(span.span.end).toISOString(),
          timeZone: "Europe/Paris",
        },
        transparency: "opaque",
        extendedProperties: {
          private: { ldgenxAppointment: a.id, ldgenxKind: kind },
        },
        reminders: { useDefault: false },
      },
    };
  });
}
