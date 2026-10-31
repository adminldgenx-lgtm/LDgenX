import {
  supabase,
  supabasePublishableKey,
  supabaseUrl,
} from "../../lib/supabase";
import type {
  EditorialEntry,
  EditorialMedia,
  EditorialRevision,
} from "../../../supabase/functions/_shared/editorial";
export class CmsError extends Error {
  constructor(
    public code: string,
    public details: string[] = [],
  ) {
    super(code);
  }
}
export async function cmsRequest<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session) throw new CmsError("unauthenticated");
  const headers: Record<string, string> = {
    apikey: supabasePublishableKey,
    Authorization: `Bearer ${session.access_token}`,
  };
  if (body && !(body instanceof FormData))
    headers["Content-Type"] = "application/json";
  let response: Response;
  try {
    response = await fetch(`${supabaseUrl}/functions/v1/editorial${path}`, {
      method,
      headers,
      body:
        body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
      signal: AbortSignal.timeout(method === "GET" ? 20000 : 90000),
    });
  } catch {
    throw new CmsError("unavailable");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new CmsError(data.code ?? "unavailable", data.details ?? []);
  return data;
}
export const cms = {
  list: () => cmsRequest<EditorialEntry[]>("/entries"),
  get: (id: string) => cmsRequest<EditorialEntry>(`/entries/${id}`),
  media: () => cmsRequest<EditorialMedia[]>("/media"),
  revisions: (id: string) =>
    cmsRequest<EditorialRevision[]>(`/entries/${id}/revisions`),
};
export const megabytes = (bytes: number) =>
  bytes < 1_000_000
    ? `${Math.max(1, Math.round(bytes / 1000))} KB`
    : `${(bytes / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} MB`;
