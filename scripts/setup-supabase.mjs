// Idempotent remote setup. Credentials stay in an ignored file; output contains no secrets.
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import {
  management,
  query,
  literal,
  ref,
  serviceKey,
  saveCredentials,
  credentials,
} from './lib/supabase-management.mjs';
import {
  defaultBooking,
  defaultRetention,
} from '../supabase/functions/_shared/defaults.ts';
import { portalOrigins, portalAuthRedirects } from '../supabase/functions/_shared/origins.ts';
const siteUrl = (credentials.PORTAL_SITE_URL ?? 'https://www.ldgenx.fr').replace(/\/+$/, '');
if (!portalOrigins.includes(siteUrl))
  throw new Error('PORTAL_SITE_URL must be one of the configured portal origins.');
const project = await management('');
if (project.status !== 'ACTIVE_HEALTHY')
  throw new Error('Supabase project is not healthy');
await query(
  'create schema if not exists supabase_migrations; create table if not exists supabase_migrations.schema_migrations(version text primary key, statements text[], name text);',
);
const applied = new Set(
  (
    await query('select version from supabase_migrations.schema_migrations')
  ).map((x) => x.version),
);
for (const file of (await readdir('supabase/migrations'))
  .filter((f) => f.endsWith('.sql'))
  .sort()) {
  const version = file.split('_')[0];
  if (applied.has(version)) continue;
  const sql = await readFile(`supabase/migrations/${file}`, 'utf8');
  await query(
    `begin;\n${sql}\ninsert into supabase_migrations.schema_migrations(version,name,statements) values(${literal(version)},${literal(file.slice(version.length + 1, -4))},array[${literal(sql)}]);\ncommit;`,
  );
  console.log(`Applied migration ${version}`);
}
for (const [id, data] of [
  ['booking', defaultBooking],
  ['retention', defaultRetention],
])
  await query(
    `insert into public.portal_settings(id,data) values(${literal(id)},${literal(JSON.stringify(data))}::jsonb) on conflict(id) do nothing`,
  );
const before = await management('/config/auth');
await writeFile('supabase-auth-before.local', JSON.stringify(before, null, 2), {
  flag: 'wx',
  mode: 0o600,
}).catch((e) => {
  if (e.code !== 'EEXIST') throw e;
});
await management(
  '/config/auth',
  {
    site_url: siteUrl,
    uri_allow_list: portalAuthRedirects.join(','),
    external_email_enabled: true,
    mailer_autoconfirm: false,
    password_min_length: 8,
  },
  'PATCH',
);
const jobSecret =
  credentials.PORTAL_JOB_SECRET ?? randomBytes(32).toString('hex');
await saveCredentials({ PORTAL_JOB_SECRET: jobSecret });
const poolers = await management('/config/database/pooler');
const pooler = poolers.find((p) => p.pool_mode === 'transaction');
if (!pooler) throw new Error('Project transaction pooler is unavailable');
await management('/secrets', [
  { name: 'PORTAL_POOLER_HOST', value: pooler.db_host },
  { name: 'PORTAL_POOLER_USER', value: pooler.db_user },
  { name: 'PORTAL_JOB_SECRET', value: jobSecret },
  { name: 'PORTAL_SITE_URL', value: siteUrl },
  {
    name: 'PORTAL_ALLOWED_ORIGINS',
    value: portalOrigins.join(','),
  },
]);
await query(
  `insert into private.portal_jobs(id,secret) values('cron',${literal(jobSecret)}) on conflict(id) do update set secret=excluded.secret`,
);
const client = createClient(`https://${ref}.supabase.co`, await serviceKey(), {
  auth: { persistSession: false, autoRefreshToken: false },
});
const adminEmail = 'admin.ldgenx@gmail.com';
let rows = await query(
  `select id from public.portal_profiles where email=${literal(adminEmail)}`,
);
let adminId = rows[0]?.id;
if (!adminId) {
  const { data, error } = await client.auth.admin.createUser({
    email: adminEmail,
    password: randomBytes(48).toString('base64url'),
    email_confirm: true,
    user_metadata: {
      firstName: 'Administration',
      lastName: 'LDgenX',
      organisation: 'LDgenX',
      phone: '',
      locale: 'fr',
    },
  });
  if (error)
    throw new Error(
      `Administrator creation failed: ${error.code ?? error.status}`,
    );
  adminId = data.user.id;
}
await query(
  `update public.portal_profiles set data=data||'{"role":"admin","status":"active"}'::jsonb where id=${literal(adminId)}::uuid`,
);
// Generate the setup link once; do not send an email or replace a link already handed off.
try {
  await readFile('admin-setup.local.html', 'utf8');
} catch {
  const { data, error } = await client.auth.admin.generateLink({
    type: 'recovery',
    email: adminEmail,
    options: {
      redirectTo: 'http://localhost:5173/espace/nouveau-mot-de-passe',
    },
  });
  if (error || !data.properties?.action_link)
    throw new Error('Administrator setup link could not be generated');
  const safe = data.properties.action_link
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;');
  await writeFile(
    'admin-setup.local.html',
    `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="referrer" content="no-referrer"><title>Configuration administrateur LDgenX</title><body style="font:18px system-ui;max-width:650px;margin:80px auto;padding:24px"><h1>Compte administrateur LDgenX</h1><p>Compte : ${adminEmail}</p><p>Lancez <code>npm run dev</code>, puis ouvrez ce lien privé pour choisir votre mot de passe. Le lien est à usage unique et expire après une heure.</p><p><a href="${safe}">Choisir mon mot de passe</a></p><p>Si le lien a expiré, lancez <code>npm run supabase:admin-link</code>.</p></body></html>`,
    { mode: 0o600 },
  );
}
console.log(
  'Database, private storage, Auth URLs, scheduled jobs key and administrator configured.',
);
console.log(
  'Private administrator setup: admin-setup.local.html (ignored by Git). Email delivery remains unconfigured.',
);
