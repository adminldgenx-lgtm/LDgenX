// The contact form sends directly only when an approved form service is configured
// at build time. Without it, the form prepares an e-mail in the visitor's mail app.
export const contactEndpoint = (import.meta.env.VITE_CONTACT_ENDPOINT ?? '').trim();
export const directContact = /^https:\/\//.test(contactEndpoint);

export async function sendContact(form: HTMLFormElement) {
  const response = await fetch(contactEndpoint, {
    method: 'POST',
    body: new FormData(form),
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Contact endpoint answered ${response.status}`);
}
