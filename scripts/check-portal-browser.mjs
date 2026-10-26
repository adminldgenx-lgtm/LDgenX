import { chromium, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { ref, serviceKey, query, literal } from './lib/supabase-management.mjs';
const origin = process.argv[2] ?? 'http://127.0.0.1:4173';
const output = 'docs/qa-2026-10-26';
await mkdir(output, { recursive: true });
const run = randomUUID().slice(0, 8),
  users = [],
  errors = [],
  failures = [];
const publicEnv = parseEnv(await readFile('.env.production', 'utf8'));
const service = createClient(`https://${ref}.supabase.co`, await serviceKey(), {
  auth: { persistSession: false, autoRefreshToken: false },
});
const browser = await chromium.launch({ channel: 'chrome', headless: true });
async function account(name, isAdmin = false) {
  const email = `portal-browser-${run}-${name}@example.invalid`,
    password = randomBytes(24).toString('base64url');
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      firstName: 'QA',
      lastName: name,
      organisation: `QA ${run}`,
      phone: '',
      locale: 'fr',
    },
  });
  if (error) throw new Error(`Cannot create test account: ${error.code}`);
  users.push(data.user.id);
  if (isAdmin)
    await query(
      `update public.portal_profiles set data=data||'{"role":"admin","status":"active"}'::jsonb where id=${literal(data.user.id)}::uuid`,
    );
  return { id: data.user.id, email, password };
}
function track(page) {
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => {
    if (r.url().includes('/functions/v1/portal') && r.status() >= 400)
      failures.push({ path: new URL(r.url()).pathname, status: r.status() });
  });
}
async function login(page, user, admin = false) {
  await page.goto(origin + (admin ? '/admin/connexion' : '/espace/connexion'));
  await page.getByLabel('Adresse e-mail', { exact: true }).fill(user.email);
  await page.getByLabel('Mot de passe', { exact: true }).fill(user.password);
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await page.waitForURL(admin ? '**/admin/messages' : '**/espace/messages');
}
try {
  const client = await account('client'),
    admin = await account('team', true);
  const clientContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    locale: 'fr-FR',
    reducedMotion: 'reduce',
  });
  const adminContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    locale: 'fr-FR',
    reducedMotion: 'reduce',
  });
  const cp = await clientContext.newPage(),
    ap = await adminContext.newPage();
  track(cp);
  track(ap);
  await login(cp, client);
  console.log('Browser: client signed in');
  await login(ap, admin, true);
  console.log('Browser: admin signed in');
  await expect(
    cp.getByText('Votre compte est en attente de validation', { exact: false }),
  ).toBeVisible();
  await ap.goto(`${origin}/admin/messages?client=${client.id}`);
  const message = `Message navigateur ${run}`;
  await cp.getByRole('textbox', { name: 'Écrire un message…' }).fill(message);
  await cp.locator('input[type="file"]').setInputFiles({
    name: 'qa-private.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('Browser private attachment'),
  });
  await cp.getByRole('button', { name: 'Envoyer', exact: true }).click();
  console.log('Browser: checking sent message in client');
  await expect(cp.getByText(message, { exact: true })).toBeVisible({
    timeout: 15000,
  });
  console.log('Browser: checking Realtime in admin');
  await expect(ap.getByText(message, { exact: true }).last()).toBeVisible({
    timeout: 15000,
  });
  await ap
    .getByRole('textbox', { name: 'Écrire un message…' })
    .fill(`Réponse navigateur ${run}`);
  await ap.getByRole('button', { name: 'Envoyer', exact: true }).click();
  await expect(
    cp.getByText(`Réponse navigateur ${run}`, { exact: true }),
  ).toBeVisible({ timeout: 15000 });
  await cp.reload();
  await expect(cp.getByText(message, { exact: true })).toBeVisible();
  await cp.screenshot({
    path: `${output}/portal-client-desktop.png`,
    fullPage: true,
  });
  await ap.screenshot({
    path: `${output}/portal-admin-desktop.png`,
    fullPage: true,
  });
  await cp.setViewportSize({ width: 390, height: 844 });
  await cp.screenshot({
    path: `${output}/portal-client-mobile.png`,
    fullPage: true,
  });
  expect(
    await cp.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBeTruthy();
  // Every existing application screen loads through the real API, with no mocked requests.
  for (const path of [
    '/espace/fichiers',
    '/espace/rendez-vous',
    '/espace/compte',
  ]) {
    await cp.goto(origin + path);
    await expect(cp.locator('h1')).toBeVisible();
    await expect(cp.locator('.p-loading')).toHaveCount(0, { timeout: 15000 });
  }
  for (const path of [
    '/admin/demandes',
    '/admin/agenda',
    '/admin/clients',
    '/admin/parametres',
    `/admin/clients/${client.id}`,
  ]) {
    await ap.goto(origin + path);
    await expect(ap.locator('h1')).toBeVisible();
  }
  await clientContext.close();
  await adminContext.close();
  // A genuine recovery link, generated without sending email, can set a new password.
  // Password changes revoke other sessions; close those pages before testing recovery.
  const recoveryContext = await browser.newContext({ locale: 'fr-FR' });
  const rp = await recoveryContext.newPage();
  track(rp);
  const link = await service.auth.admin.generateLink({
    type: 'recovery',
    email: client.email,
    options: { redirectTo: origin + '/espace/nouveau-mot-de-passe' },
  });
  if (link.error) throw new Error(`Recovery setup failed: ${link.error.code}`);
  await rp.goto(link.data.properties.action_link);
  await expect(
    rp.getByRole('heading', { name: 'Choisir un nouveau mot de passe' }),
  ).toBeVisible({ timeout: 15000 });
  const next = randomBytes(24).toString('base64url');
  await rp.getByLabel('Mot de passe', { exact: true }).fill(next);
  await rp.getByLabel('Confirmer le mot de passe', { exact: true }).fill(next);
  await rp.getByRole('button', { name: 'Enregistrer le mot de passe' }).click();
  await expect(
    rp.getByText('Votre mot de passe a été enregistré.'),
  ).toBeVisible({ timeout: 15000 });
  const verifier = createClient(
    `https://${ref}.supabase.co`,
    publicEnv.VITE_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const changed = await verifier.auth.signInWithPassword({
    email: client.email,
    password: next,
  });
  expect(changed.error).toBeNull();
  const publicContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: 'fr-FR',
  });
  const pp = await publicContext.newPage();
  track(pp);
  await pp.goto(origin + '/espace/reserver');
  await expect(pp.locator('h1')).toBeVisible();
  await expect(
    pp.getByText('Échange découverte', { exact: true }).first(),
  ).toBeVisible({ timeout: 15000 });
  await expect(pp.locator('.p-calendar')).not.toHaveAttribute(
    'aria-busy',
    'true',
    { timeout: 15000 },
  );
  if (!(await pp.locator('.p-calendar-day:not([disabled])').count())) {
    await pp.locator('.p-calendar header button').last().click();
  }
  await pp
    .locator('.p-calendar-day:not([disabled])')
    .first()
    .click({ timeout: 15000 });
  await pp.locator('.p-slot').first().click();
  await pp.screenshot({
    path: `${output}/portal-booking-mobile.png`,
    fullPage: true,
  });
  await pp.getByRole('button', { name: /Continuer/ }).click();
  await pp.getByLabel('Nom et prénom', { exact: true }).fill(`Guest QA ${run}`);
  await pp.getByLabel('Adresse e-mail', { exact: true }).fill(client.email);
  await pp.getByRole('checkbox').check();
  await pp
    .getByRole('button', { name: 'Envoyer la demande', exact: true })
    .click();
  await expect(
    pp.getByRole('heading', { name: 'Demande envoyée', exact: true }),
  ).toBeVisible({ timeout: 15000 });
  const guestRequests = await query(
    `select data from public.portal_appointments where data->'guest'->>'name'=${literal(`Guest QA ${run}`)}`,
  );
  expect(guestRequests.length).toBe(1);
  expect(guestRequests[0].data.status).toBe('requested');
  await pp.goto(origin + '/contact');
  await pp.locator('[name="name"]').fill(`Browser QA ${run}`);
  await pp.locator('[name="email"]').fill(client.email);
  await pp
    .locator('[name="message"]')
    .fill(`Contact depuis le navigateur, test ${run}.`);
  await pp.locator('[name="privacy"]').check();
  const response = pp.waitForResponse(
    (r) =>
      r.url().endsWith('/portal/inquiries') && r.request().method() === 'POST',
  );
  await pp.locator('form button[type="submit"]').click();
  expect((await response).status()).toBe(204);
  const inquiries = await query(
    `select data from public.portal_inquiries where data->>'email'=${literal(client.email)}`,
  );
  expect(inquiries.length).toBe(1);
  expect(inquiries[0].data.locale).toBe('fr');
  expect(errors).toEqual([]);
  expect(failures).toEqual([]);
  await writeFile(
    `${output}/browser-results.json`,
    JSON.stringify(
      {
        passed: true,
        checked: [
          'client/admin login',
          'pending-account messaging',
          'private attachment',
          'Realtime in both directions',
          'persistent session and messages',
          'desktop and mobile layout',
          'all client and admin routes',
          'real recovery link and password update',
          'public guest booking submitted and persisted',
          'contact form to database',
        ],
        pageErrors: errors,
        apiErrors: failures,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    'Passed portal browser tests: authentication, persistent messaging, private attachment, bidirectional Realtime, recovery, public booking, contact form, all routes, desktop and mobile.',
  );
} catch (e) {
  console.error('Browser API failures:', JSON.stringify(failures));
  console.error('Browser runtime errors:', JSON.stringify(errors));
  for (const [i, context] of browser.contexts().entries()) {
    for (const page of context.pages())
      await page
        .screenshot({ path: `${output}/failure-${i}.png`, fullPage: true })
        .catch(() => {});
  }
  // Sanitize Playwright failures: navigation errors could otherwise print a one-time Auth URL.
  console.error(
    'Browser check failed:',
    String(e.message).replace(
      /https:\/\/[^\s]+\/auth\/v1\/verify[^\s]*/g,
      '[private recovery URL]',
    ),
  );
  throw new Error(
    String(e.message).replace(
      /https:\/\/[^\s]+\/auth\/v1\/verify[^\s]*/g,
      '[private recovery URL]',
    ),
  );
} finally {
  await browser.close();
  const files = users.length
    ? await query(
        `select object_path from public.portal_files where client_id in (${users.map(literal).join(',')})`,
      )
    : [];
  for (const id of users) await service.auth.admin.deleteUser(id);
  if (files.length)
    await service.storage
      .from('portal-files')
      .remove(files.map((f) => f.object_path));
  await query(
    `delete from public.portal_appointments where data->'guest'->>'name'=${literal(`Guest QA ${run}`)};delete from public.portal_activity where data->'data'->>'name'=${literal(`Guest QA ${run}`)};delete from public.portal_inquiries where data->>'name'=${literal(`Browser QA ${run}`)};delete from public.portal_activity where data->>'kind'='inquiry' and data->'data'->>'name'=${literal(`Browser QA ${run}`)};delete from private.portal_storage_cleanup where path in (${files.length ? files.map((f) => literal(f.object_path)).join(',') : "''"});`,
  );
}
