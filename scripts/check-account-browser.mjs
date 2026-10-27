// Real Auth sessions verify the public navbar across the separate website/portal applications.
import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { ref, serviceKey, query, literal } from './lib/supabase-management.mjs';

const origin = process.argv[2] ?? 'http://127.0.0.1:4173';
const output = process.env.LDGENX_QA_OUTPUT ?? 'docs/qa-2026-10-26';
await mkdir(output, { recursive: true });
const service = createClient(`https://${ref}.supabase.co`, await serviceKey(), {
  auth: { persistSession: false, autoRefreshToken: false },
});
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const users = [],
  pageErrors = [],
  layoutChecks = [];
const widths = [
  1600, 1536, 1441, 1440, 1421, 1420, 1391, 1390, 1366, 1321, 1320, 1280, 1201, 1200, 1050, 768,
  601, 600, 420, 412, 390, 380, 379, 375, 320,
];
const csp = (await readFile('dist/_headers', 'utf8')).match(/Content-Security-Policy: (.+)/)[1];

async function checkLayouts(page, state) {
  for (const lang of ['', '/en']) {
    await page.goto(origin + lang + '/contact');
    const account = page.locator('.header-account');
    await expect(account).toBeVisible();
    if (state !== 'signed-out') await expect(account).toHaveAttribute('data-signed-in', 'true');
    for (const width of widths) {
      await page.setViewportSize({ width, height: 950 });
      const problems = await page.evaluate(() => {
        const header = document.querySelector('.header-inner');
        const box = header.getBoundingClientRect();
        const visible = (node) => {
          const style = getComputedStyle(node),
            rect = node.getBoundingClientRect();
          return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0;
        };
        const issues = [];
        for (const parent of [header, header.querySelector('.header-actions')]) {
          // The menu icon's existing hit area extends 8px into the container padding.
          const bounds = parent === header ? box : { left: 0, right: innerWidth };
          const children = [...parent.children].filter(visible);
          children.forEach((child, i) => {
            const r = child.getBoundingClientRect();
            if (r.left < bounds.left - 1 || r.right > bounds.right + 1)
              issues.push(child.className + ' out of bounds');
            if (i && r.left < children[i - 1].getBoundingClientRect().right - 1)
              issues.push(child.className + ' overlaps');
          });
        }
        if (document.documentElement.scrollWidth > innerWidth + 1)
          issues.push('horizontal overflow');
        return issues;
      });
      layoutChecks.push({ state, locale: lang ? 'en' : 'fr', width, problems });
      assert.deepEqual(problems, [], `${state} ${lang || 'fr'} ${width}px`);
    }
  }
}

async function fixture(role) {
  const email = `account-nav-${randomUUID()}@example.invalid`;
  const password = randomBytes(24).toString('base64url');
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { firstName: 'Compte', lastName: 'Vérification', locale: 'fr' },
  });
  assert(!error, 'Test account creation failed');
  users.push(data.user.id);
  await query(
    `update public.portal_profiles set data=data||${literal(JSON.stringify({ role, status: 'active' }))}::jsonb where id=${literal(data.user.id)}::uuid`,
  );
  return { email, password };
}

try {
  const context = await browser.newContext({ locale: 'en-GB', reducedMotion: 'reduce' });
  await context.addInitScript(() => {
    window.__cspViolations = [];
    addEventListener('securitypolicyviolation', (e) =>
      window.__cspViolations.push(e.effectiveDirective),
    );
  });
  await context.route('**/*', async (route) => {
    if (route.request().resourceType() !== 'document') return route.continue();
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: { ...response.headers(), 'Content-Security-Policy': csp },
    });
  });
  const page = await context.newPage(),
    watch = await context.newPage();
  for (const tab of [page, watch]) tab.on('pageerror', (e) => pageErrors.push(e.message));
  await checkLayouts(watch, 'signed-out');
  for (const role of ['client', 'admin']) {
    const credentials = await fixture(role);
    await page.goto(origin + '/contact');
    await watch.goto(origin + '/contact');
    await page.locator('.header-account').click();
    await expect(page).toHaveURL(/\/espace\/connexion$/);
    // The French site's button preserves French even with an English browser preference.
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await page.getByLabel('Adresse e-mail', { exact: true }).fill(credentials.email);
    await page.getByLabel('Mot de passe', { exact: true }).fill(credentials.password);
    await page.locator('form button[type="submit"]').click();
    const destination = role === 'admin' ? '/admin/messages' : '/espace/messages';
    await expect(page).toHaveURL(origin + destination, { timeout: 20000 });
    await expect(watch.locator('.header-account')).toHaveAttribute('data-signed-in', 'true');
    await expect(watch.locator('.header-account')).toHaveAccessibleName('Mon compte · Connecté');
    await watch.reload();
    await expect(watch.locator('.header-account')).toHaveAttribute('data-signed-in', 'true');
    await watch.locator('.header-account').click();
    await expect(watch).toHaveURL(origin + destination);
    await checkLayouts(watch, role);
    await watch.setViewportSize({ width: 390, height: 844 });
    await watch.goto(origin + '/contact');
    await expect(watch.locator('.header-account')).toHaveAttribute('data-signed-in', 'true');
    await watch
      .locator('.site-header')
      .screenshot({ path: `${output}/account-${role}-mobile.png` });
    await watch.setViewportSize({ width: 1440, height: 950 });
    await watch
      .locator('.site-header')
      .screenshot({ path: `${output}/account-${role}-desktop.png` });
    await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click();
    await expect(watch.locator('.header-account')).not.toHaveAttribute('data-signed-in', 'true');
    await expect(watch.locator('.header-account')).toHaveAccessibleName('Connexion');
    assert.deepEqual(await watch.evaluate(() => window.__cspViolations), [], 'Auth loading CSP');
    console.log(
      `Passed ${role}: navbar login, persisted session, role routing, cross-tab login/logout.`,
    );
  }
  assert.deepEqual(pageErrors, []);
  await writeFile(
    `${output}/account-navbar-results.json`,
    JSON.stringify(
      {
        passed: true,
        checked: [
          'signed-out link',
          'FR/EN labels',
          'site language carried to login',
          'real client/admin login',
          'role-specific destinations',
          'session persistence',
          'cross-tab sign-in/sign-out',
          'production CSP',
          'breakpoint bounds and overlap',
        ],
        layoutChecks,
        pageErrors,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`Passed: ${layoutChecks.length} navbar layout checks; no runtime or CSP errors.`);
} finally {
  await browser.close();
  for (const id of users) {
    const { error } = await service.auth.admin.deleteUser(id);
    assert(!error, 'Test account cleanup failed');
  }
}
