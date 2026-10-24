// The weekly purge of shared files: when it runs, and when a given file goes. The server's weekly
// job follows the same rule (docs/PORTAL.md), so the dates shown are the dates applied.
import type { FileItem, RetentionSettings } from '../api/types';
import { DAY, addDays, atMinutes, teamDay, weekdayOf } from './time';

/** The first purge strictly after an instant. */
export function nextPurgeAfter(
  time: number,
  settings: Pick<RetentionSettings, 'weekday' | 'hour'>,
) {
  let key = teamDay(time);
  for (let i = 0; i < 8; i++, key = addDays(key, 1)) {
    if (weekdayOf(key) !== settings.weekday) continue;
    const at = atMinutes(key, settings.hour * 60).getTime();
    if (at > time) return at;
  }
  // Unreachable: a weekday comes back within eight days.
  return time + 7 * DAY;
}

/** When a file dropped at `createdAt` is removed: the first purge that leaves it at least
 *  `minimumDays` online. */
export function expiryFor(createdAt: number, settings: RetentionSettings) {
  let at = nextPurgeAfter(createdAt, settings);
  while (at - createdAt < settings.minimumDays * DAY) at = nextPurgeAfter(at, settings);
  return at;
}

export function fileExpiry(
  file: Pick<FileItem, 'createdAt' | 'kept'>,
  settings: RetentionSettings,
) {
  if (file.kept || !settings.enabled) return null;
  return new Date(expiryFor(Date.parse(file.createdAt), settings)).toISOString();
}
