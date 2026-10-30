import type {
  TimeBlock,
  BookingConfig,
} from "../../supabase/functions/_shared/types";
/** The same owner-primary busy interval can apply to the entire team; display it once. */
export function agendaBlocks(
  portal: TimeBlock[],
  google: TimeBlock[],
  config: BookingConfig | undefined,
  hostId: string,
  fr: boolean,
): TimeBlock[] {
  const source = [...portal, ...google].filter(
    (b) => !hostId || !b.hostId || b.hostId === hostId,
  );
  if (hostId || !config) return source;
  const all = config.hosts.filter((h) => h.bookable).map((h) => h.id),
    groups = new Map<string, TimeBlock[]>();
  for (const b of source)
    if (b.id.startsWith("google:") && b.hostId) {
      const key = JSON.stringify([b.start, b.end, b.reason]);
      groups.set(key, [...(groups.get(key) ?? []), b]);
    }
  const remove = new Set<string>(),
    combined: TimeBlock[] = [];
  for (const group of groups.values())
    if (
      all.length > 1 &&
      all.every((id) => group.some((b) => b.hostId === id))
    ) {
      group.forEach((b) => remove.add(b.id));
      combined.push({
        ...group[0],
        id: group[0].id + ":team",
        hostId: null,
        reason: ["Google Calendar", "Google Agenda", ""].includes(
          group[0].reason.trim(),
        )
          ? fr
            ? "Indisponibilité Google · Toute l’équipe"
            : "Google busy · Whole team"
          : `${group[0].reason} · ${fr ? "Toute l’équipe" : "Whole team"}`,
      });
    }
  return [...source.filter((b) => !remove.has(b.id)), ...combined];
}
