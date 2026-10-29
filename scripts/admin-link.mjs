// Generate a private recovery link only: never rerun setup or change email/Auth settings.
import { writeFile, chmod } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import { credentials, ref, serviceKey } from './lib/supabase-management.mjs';
import { portalSiteOrigin } from '../supabase/functions/_shared/site.ts';

const origin = portalSiteOrigin(credentials.PORTAL_SITE_URL);
const admin = createClient(`https://${ref}.supabase.co`, await serviceKey(), {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data, error } = await admin.auth.admin.generateLink({
  type: 'recovery',
  email: 'admin.ldgenx@gmail.com',
  options: { redirectTo: `${origin}/espace/nouveau-mot-de-passe` },
});
if (error || !data.properties?.action_link)
  throw new Error('Administrator recovery link could not be generated.');
const safe = data.properties.action_link.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
await writeFile(
  'admin-setup.local.html',
  `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="referrer" content="no-referrer"><title>Récupération administrateur LDgenX</title><body style="font:18px system-ui;max-width:650px;margin:80px auto;padding:24px"><h1>Compte administrateur LDgenX</h1><p>Ce lien privé retourne sur ${origin}. Il est à usage unique et expire après une heure.</p><p><a href="${safe}">Choisir mon mot de passe</a></p></body></html>`,
  { mode: 0o600 },
);
await chmod('admin-setup.local.html', 0o600);
console.log(`Private recovery artifact: admin-setup.local.html; returns to ${origin}. No email sent; backend settings unchanged.`);
