import type { Appointment, BookingConfig, TimeBlock } from "./types.ts";
import { heldSpans } from "./availability.ts";
import { atMinutes, teamDay, type DayKey } from "./time.ts";
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
  summary?: string;
  htmlLink?: string;
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
      reason: event.summary?.trim() || "Google Calendar",
      allDay: Boolean(event.start?.date && !event.start?.dateTime),
      sourceUrl: safeGoogleUrl(event.htmlLink),
    });
  }
  return result;
}
export function safeGoogleUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return;
  try {
    const url = new URL(value);
    if (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      ["www.google.com", "calendar.google.com"].includes(url.hostname)
    )
      return url.href;
  } catch {
    /* Invalid source links are omitted. */
  }
}
export interface CalendarPreferences {
  shareBlockTitles: boolean;
  shareClientDetails: boolean;
  shareAppointmentNotes: boolean;
  shareMeetingLink: boolean;
  reminderMinutes: number | null;
  teamBlocks: "shared" | "per_host";
  language: "fr" | "en";
}
export const defaultCalendarPreferences: CalendarPreferences = {
  shareBlockTitles: true,
  shareClientDetails: false,
  shareAppointmentNotes: false,
  shareMeetingLink: true,
  reminderMinutes: 10,
  teamBlocks: "shared",
  language: "fr",
};
export function calendarPreferences(
  value?: Partial<CalendarPreferences> | null,
): CalendarPreferences {
  return { ...defaultCalendarPreferences, ...value };
}
export function validateCalendarPreferences(
  input: unknown,
): CalendarPreferences {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new CalendarError("invalid_input", 400);
  const p = calendarPreferences(input as CalendarPreferences);
  for (const k of [
    "shareBlockTitles",
    "shareClientDetails",
    "shareAppointmentNotes",
    "shareMeetingLink",
  ] as const)
    if (typeof p[k] !== "boolean")
      throw new CalendarError("invalid_input", 400);
  if (
    ![null, 5, 10, 15, 30, 60].includes(p.reminderMinutes) ||
    !["shared", "per_host"].includes(p.teamBlocks) ||
    !["fr", "en"].includes(p.language)
  )
    throw new CalendarError("invalid_input", 400);
  return Object.fromEntries(
    Object.keys(defaultCalendarPreferences).map((k) => [
      k,
      p[k as keyof CalendarPreferences],
    ]),
  ) as unknown as CalendarPreferences;
}
const text = (value: string) =>
  Array.from(value)
    .filter(
      (c) => c.charCodeAt(0) >= 32 || [9, 10, 13].includes(c.charCodeAt(0)),
    )
    .join("")
    .trim();
const title = (value: string) =>
  Array.from(text(value).replace(/[\r\n]+/g, " "))
    .slice(0, 160)
    .join("");
const html = (value: string) =>
  text(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("\n", "<br>");
function details(lines: string[], link: string, fr: boolean) {
  return (
    lines.filter(Boolean).map(html).join("<br>") +
    `<br><br><a href="${html(link)}">${fr ? "Ouvrir la fiche et modifier dans LDgenX" : "Open and manage in LDgenX"}</a><br>` +
    html(
      fr
        ? "Les modifications et annulations se font dans LDgenX afin de vérifier les disponibilités."
        : "Edit or cancel in LDgenX so availability can be checked.",
    )
  );
}
function reminders(p: CalendarPreferences) {
  return {
    useDefault: false,
    overrides:
      p.reminderMinutes === null
        ? []
        : [{ method: "popup", minutes: p.reminderMinutes }],
  };
}
export function calendarEventRange(event: GoogleEvent) {
  const time = (p: GoogleEvent["start"]) =>
    p?.dateTime
      ? Date.parse(p.dateTime)
      : p?.date
        ? atMinutes(p.date as DayKey, 0).getTime()
        : NaN;
  return { start: time(event.start), end: time(event.end) };
}
export function calendarEventMatches(
  actual: GoogleEvent | undefined,
  expected: GoogleEvent,
) {
  if (
    !actual ||
    actual.status === "cancelled" ||
    actual.transparency === "transparent"
  )
    return false;
  const a = calendarEventRange(actual),
    b = calendarEventRange(expected);
  return Number.isFinite(a.start) && a.start === b.start && a.end === b.end;
}
export function appointmentGoogleEvents(
  a: Appointment,
  managed: Record<string, string>,
  config?: BookingConfig,
  settings?: Partial<CalendarPreferences>,
  client?: { name: string; organisation: string },
) {
  const p = calendarPreferences(settings),
    fr = p.language === "fr";
  return heldSpans(a).map((span, index) => {
    const kind = index === 0 ? "main" : "change",
      calendarId = managed[span.hostId];
    if (!calendarId) throw new CalendarError("host_not_configured");
    const host = config?.hosts.find((h) => h.id === span.hostId),
      type = config?.types.find((t) => t.id === a.typeId);
    const state =
      kind === "change"
        ? fr
          ? "Changement demandé"
          : "Change requested"
        : a.status === "requested"
          ? fr
            ? "À confirmer"
            : "Awaiting confirmation"
          : fr
            ? "Confirmé"
            : "Confirmed";
    const format =
        type?.label[p.language] || (fr ? "Rendez-vous" : "Appointment"),
      person = host?.name || span.hostId;
    const customer =
      client ??
      (a.guest
        ? { name: a.guest.name, organisation: a.guest.organisation }
        : undefined);
    const eventId = `ldg${a.id.replaceAll("-", "")}${index}`,
      day = teamDay(span.span.start);
    const link = `https://www.ldgenx.fr/admin/agenda?rdv=${encodeURIComponent(a.id)}&date=${day}`;
    const location =
      p.shareMeetingLink && a.meetingUrl
        ? a.meetingUrl
        : type?.location === "lab"
          ? fr
            ? "Au laboratoire"
            : "At the laboratory"
          : type?.location === "phone"
            ? fr
              ? "Téléphone"
              : "Phone"
            : fr
              ? "Visioconférence"
              : "Video call";
    return {
      kind,
      calendarId,
      eventId,
      baseEventId: eventId,
      googleUrl: undefined as string | undefined,
      body: {
        id: eventId,
        status: "confirmed",
        summary: title(
          `${a.status === "requested" || kind === "change" ? state + " · " : ""}${format} · ${person}${p.shareClientDetails && customer?.name ? " · " + customer.name : ""}`,
        ),
        description: details(
          [
            `LDgenX · ${state}`,
            `${fr ? "Format" : "Format"} : ${format}`,
            `${fr ? "Intervenant" : "Team member"} : ${person}`,
            `${fr ? "Durée" : "Duration"} : ${Math.round((span.span.end - span.span.start) / 60000)} min`,
            p.shareClientDetails && customer
              ? `${fr ? "Client" : "Client"} : ${customer.name}${customer.organisation ? " · " + customer.organisation : ""}`
              : "",
            p.shareAppointmentNotes && a.topic
              ? `${fr ? "Sujet" : "Subject"} : ${a.topic}`
              : "",
            p.shareMeetingLink && a.meetingUrl
              ? `${fr ? "Rejoindre la visioconférence" : "Join the call"} : ${a.meetingUrl}`
              : "",
            `${fr ? "Fuseau horaire" : "Time zone"} : Europe/Paris`,
          ],
          link,
          fr,
        ),
        location,
        start: {
          dateTime: new Date(span.span.start).toISOString(),
          timeZone: "Europe/Paris",
        },
        end: {
          dateTime: new Date(span.span.end).toISOString(),
          timeZone: "Europe/Paris",
        },
        transparency: "opaque",
        source: {
          title: fr ? "Gérer dans LDgenX" : "Manage in LDgenX",
          url: link,
        },
        extendedProperties: {
          private: { ldgenxAppointment: a.id, ldgenxKind: kind },
        },
        reminders: reminders(p),
      },
    };
  });
}
export function blockGoogleEvents(
  block: TimeBlock,
  config: BookingConfig,
  managed: Record<string, string>,
  settings?: Partial<CalendarPreferences>,
) {
  const p = calendarPreferences(settings),
    fr = p.language === "fr",
    shared = !block.hostId && p.teamBlocks === "shared" && !!managed._team;
  const targets = shared
    ? [{ id: "_team", name: fr ? "Toute l’équipe" : "Whole team" }]
    : config.hosts.filter(
        (h) => h.bookable && (!block.hostId || h.id === block.hostId),
      );
  const eventId =
    "ldgb" +
    [...new TextEncoder().encode(block.id)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("");
  const label =
    p.shareBlockTitles && block.reason.trim()
      ? block.reason
      : fr
        ? "Indisponibilité"
        : "Unavailable";
  const day = teamDay(Date.parse(block.start)),
    link = `https://www.ldgenx.fr/admin/agenda?creneau=${encodeURIComponent(block.id)}&date=${day}`;
  return targets.map((host) => {
    const calendarId = managed[host.id];
    if (!calendarId) throw new CalendarError("host_not_configured");
    const start = block.allDay
      ? { date: teamDay(Date.parse(block.start)) }
      : {
          dateTime: new Date(block.start).toISOString(),
          timeZone: "Europe/Paris",
        };
    const end = block.allDay
      ? { date: teamDay(Date.parse(block.end)) }
      : {
          dateTime: new Date(block.end).toISOString(),
          timeZone: "Europe/Paris",
        };
    return {
      kind: "block" as const,
      hostId: host.id,
      calendarId,
      eventId,
      baseEventId: eventId,
      googleUrl: undefined as string | undefined,
      body: {
        id: eventId,
        status: "confirmed",
        summary: title(`${label} · ${host.name}`),
        description: details(
          [
            `LDgenX · ${fr ? "Créneau bloqué" : "Blocked time"}`,
            `${fr ? "Personnes concernées" : "People affected"} : ${!block.hostId ? (fr ? "Toute l’équipe" : "Whole team") : host.name}`,
            p.shareBlockTitles && block.reason
              ? `${fr ? "Intitulé" : "Title"} : ${block.reason}`
              : "",
            `${fr ? "Fuseau horaire" : "Time zone"} : Europe/Paris`,
            block.allDay ? (fr ? "Journée entière" : "All day") : "",
          ],
          link,
          fr,
        ),
        start,
        end,
        transparency: "opaque",
        source: {
          title: fr
            ? "Modifier le créneau dans LDgenX"
            : "Edit this block in LDgenX",
          url: link,
        },
        extendedProperties: {
          private: { ldgenxBlock: block.id, ldgenxHost: host.id },
        },
        reminders: { useDefault: false },
      },
    };
  });
}
