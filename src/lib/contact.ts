// The public form reaches the same inbox as the client portal.
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '').trim();
export const contactEndpoint = (
  import.meta.env.VITE_CONTACT_ENDPOINT ??
  (supabaseUrl ? `${supabaseUrl}/functions/v1/portal/inquiries` : '')
).trim();
export const directContact = /^https:\/\//.test(contactEndpoint);

export async function sendContact(form: HTMLFormElement) {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (contactEndpoint.startsWith(supabaseUrl + '/functions/') && key)
    headers.apikey = key;
  const response = await fetch(contactEndpoint, {
    method: 'POST',
    body: new FormData(form),
    headers,
  });
  if (!response.ok)
    throw new Error(`Contact endpoint answered ${response.status}`);
}
