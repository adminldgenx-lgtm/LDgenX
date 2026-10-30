import type { CalendarPreferences } from "../../supabase/functions/_shared/calendar";
import { supabase, supabaseUrl, supabasePublishableKey } from "../lib/supabase";
import type { TimeBlock } from "./api";
export interface CalendarStatus {
  configured: boolean;
  expectedOwner: string;
  enabled: boolean;
  connected: boolean;
  owner: string | null;
  managed: Record<string, string>;
  busy: Record<string, string[]>;
  lastSync: string | null;
  lastBusyCheck: string | null;
  lastError: string | null;
  refreshExpires: string | null;
  pending: number;
  hosts: { id: string; name: string }[];
  preferences: CalendarPreferences;
  teamCalendar: string | null;
  teamNeedsAttention: boolean;
}
export interface CalendarItemState {
  state:
    "synced" | "pending" | "error" | "disabled" | "not_exported" | "removed";
  error: string | null;
  syncedAt: string | null;
  links: { url: string; calendar: string }[];
}
export class CalendarApiError extends Error {
  constructor(public code: string) {
    super(code);
  }
}
export async function calendarRequest<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session) throw new CalendarApiError("unauthenticated");
  let response: Response;
  try {
    response = await fetch(`${supabaseUrl}/functions/v1/calendar${path}`, {
      method,
      headers: {
        apikey: supabasePublishableKey,
        Authorization: `Bearer ${session.access_token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(method === "GET" ? 45000 : 90000),
    });
  } catch {
    throw new CalendarApiError("google_unavailable");
  }
  const value = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new CalendarApiError(value.code ?? "google_unavailable");
  return value;
}
export const calendarApi = {
  item: (kind: "appointment" | "block", id: string) =>
    calendarRequest<CalendarItemState>(
      `/item/${kind}/${encodeURIComponent(id)}`,
    ),
  status: () => calendarRequest<CalendarStatus>("/status"),
  busy: (from: string, to: string) =>
    calendarRequest<TimeBlock[]>(`/busy?${new URLSearchParams({ from, to })}`),
};
