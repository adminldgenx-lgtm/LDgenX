// Free start times for an appointment type: each person's weekly openings, less closed days,
// blocks, the minimum notice, the booking horizon and every time already held: confirmed
// appointments, requests waiting for the team and changes asked for (each with the buffer).
// Shared by the demo and, as a reference, by the server, which computes it again before accepting
// a request.
import type { Appointment, BookingConfig, Slot } from '../api/types';
import {
  DAY,
  HOUR,
  MINUTE,
  addDays,
  atMinutes,
  minutesOf,
  teamDay,
  weekdayOf,
  type DayKey,
} from './time';

interface Span {
  start: number;
  end: number;
}

/** The times an appointment holds for its person: its own, and a change waiting for an answer. */
export function heldSpans(appointment: Appointment): { hostId: string; span: Span }[] {
  if (appointment.status !== 'confirmed' && appointment.status !== 'requested') return [];
  const held = [
    {
      hostId: appointment.hostId,
      span: { start: Date.parse(appointment.start), end: Date.parse(appointment.end) },
    },
  ];
  if (appointment.change)
    held.push({
      hostId: appointment.change.hostId,
      span: {
        start: Date.parse(appointment.change.start),
        end: Date.parse(appointment.change.end),
      },
    });
  return held;
}

/** Whether a person has another appointment overlapping a time (buffer not counted). */
export function overlaps(
  appointments: Appointment[],
  hostId: string,
  start: number,
  end: number,
  ignore?: string,
) {
  return appointments.some(
    (a) =>
      a.id !== ignore &&
      heldSpans(a).some((h) => h.hostId === hostId && start < h.span.end && end > h.span.start),
  );
}

/**
 * The first quarter-hour, from a day on and never in the past, within a person's opening hours and
 * not taken by one of their appointments: the time the team's “new appointment” form starts on.
 */
export function nextOpening(
  config: BookingConfig,
  appointments: Appointment[],
  hostId: string,
  fromDay: DayKey,
  now: number,
): { day: DayKey; minutes: number } | null {
  const closed = new Set(config.closedDays);
  for (let i = 0, day = fromDay; i < 60; i++, day = addDays(day, 1)) {
    if (closed.has(day)) continue;
    const rules = config.rules
      .filter((r) => r.hostId === hostId && r.weekday === weekdayOf(day))
      .sort((a, b) => minutesOf(a.start) - minutesOf(b.start));
    for (const rule of rules)
      for (let m = minutesOf(rule.start); m + 15 <= minutesOf(rule.end); m += 15) {
        const start = atMinutes(day, m).getTime();
        if (start >= now && !overlaps(appointments, hostId, start, start + 15 * MINUTE))
          return { day, minutes: m };
      }
  }
  return null;
}

export function computeSlots(
  config: BookingConfig,
  appointments: Appointment[],
  typeId: string,
  from: number,
  to: number,
  now: number,
  hostId?: string,
  ignore?: string,
): Slot[] {
  const type = config.types.find((t) => t.id === typeId && t.active);
  if (!type) return [];
  const length = type.minutes * MINUTE;
  const buffer = config.bufferMinutes * MINUTE;
  const earliest = Math.max(from, now + config.minNoticeHours * HOUR);
  const latest = Math.min(to, now + config.horizonDays * DAY);
  if (earliest >= latest) return [];
  const hosts = config.hosts.filter((h) => h.bookable && (!hostId || h.id === hostId));
  const busy = new Map<string, Span[]>();
  for (const h of hosts) busy.set(h.id, []);
  for (const a of appointments) {
    if (a.id === ignore) continue;
    for (const { hostId: id, span } of heldSpans(a))
      busy.get(id)?.push({ start: span.start - buffer, end: span.end + buffer });
  }
  for (const b of config.blocks) {
    const span = { start: Date.parse(b.start), end: Date.parse(b.end) };
    for (const h of hosts) if (!b.hostId || b.hostId === h.id) busy.get(h.id)!.push(span);
  }
  const closed = new Set(config.closedDays);
  const byStart = new Map<number, Set<string>>();
  for (let key = teamDay(earliest); ; key = addDays(key, 1)) {
    const dayStart = atMinutes(key, 0).getTime();
    if (dayStart > latest) break;
    if (closed.has(key)) continue;
    const weekday = weekdayOf(key);
    for (const rule of config.rules) {
      if (rule.weekday !== weekday || !busy.has(rule.hostId)) continue;
      const open = minutesOf(rule.start);
      const close = minutesOf(rule.end);
      for (let m = open; m + type.minutes <= close; m += config.stepMinutes) {
        const start = atMinutes(key, m).getTime();
        const end = start + length;
        if (start < earliest || end > latest) continue;
        if (busy.get(rule.hostId)!.some((b) => start < b.end && end > b.start)) continue;
        const set = byStart.get(start) ?? new Set<string>();
        set.add(rule.hostId);
        byStart.set(start, set);
      }
    }
  }
  return [...byStart.entries()]
    .sort(([a], [b]) => a - b)
    .map(([start, ids]) => ({
      start: new Date(start).toISOString(),
      end: new Date(start + length).toISOString(),
      hostIds: [...ids],
    }));
}
