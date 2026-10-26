// Dates in the team's time zone (Europe/Paris), whatever the visitor's. The browser has no
// time-zone arithmetic, so wall-clock times in Paris are converted to instants through Intl.

export const TEAM_ZONE = 'Europe/Paris';
export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export interface WallTime {
  year: number;
  month: number; // 1–12
  day: number;
  hour: number;
  minute: number;
  /** 0 = Monday … 6 = Sunday. */
  weekday: number;
}

const partsFormat = new Map<string, Intl.DateTimeFormat>();
function formatterFor(zone: string) {
  let format = partsFormat.get(zone);
  if (!format) {
    format = new Intl.DateTimeFormat('en-GB', {
      timeZone: zone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      weekday: 'short',
    });
    partsFormat.set(zone, format);
  }
  return format;
}
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** The wall-clock reading of an instant in a zone. */
export function wallTime(
  date: Date | number | string,
  zone = TEAM_ZONE,
): WallTime {
  const parts = Object.fromEntries(
    formatterFor(zone)
      .formatToParts(new Date(date))
      .map((p) => [p.type, p.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    weekday: WEEKDAYS.indexOf(parts.weekday),
  };
}

/** Minutes the zone is ahead of UTC at an instant. */
function offsetAt(time: number, zone: string) {
  const w = wallTime(time, zone);
  const asUtc = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute);
  return Math.round((asUtc - Math.floor(time / MINUTE) * MINUTE) / MINUTE);
}

/** The instant at which a zone's clock reads the given wall time. */
export function fromWallTime(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  zone = TEAM_ZONE,
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  let time = guess - offsetAt(guess, zone) * MINUTE;
  // Across a change of clocks the first guess can be an hour off.
  const corrected = guess - offsetAt(time, zone) * MINUTE;
  if (corrected !== time) time = corrected;
  return new Date(time);
}

/** A calendar day, independent of any zone: 'YYYY-MM-DD'. */
export type DayKey = string;
export const dayKey = (w: {
  year: number;
  month: number;
  day: number;
}): DayKey =>
  `${w.year}-${String(w.month).padStart(2, '0')}-${String(w.day).padStart(2, '0')}`;
export const parseDay = (key: DayKey) => {
  const [year, month, day] = key.split('-').map(Number);
  return { year, month, day };
};
/** The day key of an instant in the team's zone. */
export const teamDay = (date: Date | number) => dayKey(wallTime(date));
/** Adds days to a day key (calendar arithmetic, no zone involved). */
export function addDays(key: DayKey, days: number): DayKey {
  const { year, month, day } = parseDay(key);
  const d = new Date(Date.UTC(year, month - 1, day + days));
  return dayKey({
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  });
}
/** 0 = Monday … 6 = Sunday. */
export function weekdayOf(key: DayKey) {
  const { year, month, day } = parseDay(key);
  return (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7;
}
export const startOfWeek = (key: DayKey) => addDays(key, -weekdayOf(key));
/** Minutes since midnight from 'HH:MM'. */
export const minutesOf = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
export const hhmm = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
/** The instant of a team-zone day at a number of minutes past midnight. */
export const atMinutes = (key: DayKey, minutes: number) => {
  const { year, month, day } = parseDay(key);
  return fromWallTime(year, month, day, Math.floor(minutes / 60), minutes % 60);
};
export const visitorZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || TEAM_ZONE;
