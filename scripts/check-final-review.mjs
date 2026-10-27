// Exercise the final audit's public journeys without creating real bookings or messages.
import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const site = await import('../.prerender/entry-server.js');
await site.ready;
const origin = process.argv[2] ?? 'http://127.0.0.1:4174';
const output = process.env.LDGENX_QA_OUTPUT ?? 'docs/final-review-2026-10-27';
const widths = process.env.LDGENX_QA_WIDTHS?.split(',').map(Number) ?? [375, 390, 412, 1440];
const csp = (await readFile('dist/_headers', 'utf8')).match(/Content-Security-Policy: (.+)/)[1];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const rows = [], errors = [];
await mkdir(output, { recursive: true });
const address = (locale, kind, id) => site.pages.find((p) =>
  p.locale === locale && p.kind === kind && (!id || p.id === id)).path;

async function noOverflow(page, label) {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), label);
}

try {
  for (const locale of ['fr', 'en']) for (const width of widths) {
    const context = await browser.newContext({
      viewport: { width, height: 950 }, locale: locale === 'fr' ? 'en-GB' : 'fr-FR',
      reducedMotion: 'reduce',
    });
    await context.addInitScript(() => {
      window.__siteCsp = [];
      addEventListener('securitypolicyviolation', (e) => window.__siteCsp.push(e.effectiveDirective));
    });
    if (!origin.includes(':517')) await context.route('**/*', async (route) => {
      if (route.request().resourceType() !== 'document') return route.continue();
      const response = await route.fetch();
      return route.fulfill({ response, headers: { ...response.headers(), 'Content-Security-Policy': csp } });
    });
    const page = await context.newPage();
    page.on('pageerror', (e) => errors.push({ locale, width, message: e.message }));
    await page.goto(origin + address(locale, 'home'));
    if (width < 1201) {
      await page.locator('.mobile-trigger').click();
      await expect(page.locator('.mobile-dialog')).toBeVisible();
      await page.locator('.mobile-dialog details').first().locator('summary').click();
      await expect(page.locator('.mobile-dialog details').first().locator('a')).toHaveCount(8);
      await page.keyboard.press('Escape');
      await expect(page.locator('.mobile-dialog')).not.toBeVisible();
    } else {
      const trigger = page.locator('.nav-menu-trigger').first();
      await trigger.focus();
      await page.keyboard.press('Enter');
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Escape');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    }
    for (const [index, kind] of ['services', 'applications'].entries()) {
      const target = address(locale, kind);
      if (width < 1201) {
        await page.locator('.mobile-trigger').click();
        await expect(page.locator('.mobile-dialog')).toBeVisible();
        const group = page.locator('.mobile-dialog details').nth(index);
        if (!await group.evaluate((node) => node.open)) await group.locator('summary').click();
        await expect(group).toHaveAttribute('open', '');
        await group.locator('.mobile-all').click();
      } else {
        const overview = page.locator('.nav-overview').nth(index);
        await expect(overview).toHaveAttribute('href', target);
        await overview.click();
      }
      await expect(page).toHaveURL(origin + target);
      await page.reload();
      await expect(page.locator('main h1')).toHaveCount(1);
      if (width >= 1201) {
        await page.goto(origin + address(locale, 'home'));
        await page.locator('.nav-dropdown').nth(index).hover();
        await page.locator(`.mega-foot a[href="${target}"]`).click();
        await expect(page).toHaveURL(origin + target);
      }
    }
    await page.goto(origin + address(locale, 'home'));
    const pop = site.catalogs[locale].services.find((s) => s.id === 'genomique-des-populations');
    const tab = page.getByRole('tab').filter({ hasText: pop.title });
    await tab.scrollIntoViewIfNeeded();
    await tab.click();
    await expect(page.locator('.trace-panel-tags')).not.toContainText(/SNP/);
    await expect(page.locator('.atlas')).toHaveCount(1);
    const dna = page.locator(width < 801 ? '.dna-progress button' : '.dna-rail ol button');
    await expect(dna).toHaveCount(7);
    await dna.nth(3).click();
    await expect(dna.nth(3)).toHaveAttribute('aria-current', 'step');
    await dna.last().click();
    await expect(dna.last()).toHaveAttribute('aria-current', 'step');
    await noOverflow(page, 'Home interactions');

    const groups = page.locator('.footer-directory details');
    await expect(groups).toHaveCount(8);
    for (const group of await groups.all()) {
      await group.locator('summary').focus();
      await page.keyboard.press('Enter');
      await expect(group).toHaveAttribute('open', '');
      await expect(group.locator('a').first()).toBeVisible();
    }
    const links = await page.locator('.footer-directory a').evaluateAll((nodes) => nodes.map((a) => a.getAttribute('href')));
    assert.deepEqual(links.slice().sort(), site.pages.filter((p) => p.locale === locale).map((p) => p.path).sort());
    await noOverflow(page, 'Open footer directory');
    if (width === 390 || width === 1440) {
      // Close the long publication list for a readable overall footer capture.
      await page.locator('[data-footer-group="publications"] summary').click();
      await page.locator('.footer-directory').screenshot({ path: `${output}/${locale}-footer-${width}.png` });
    }
    const other = locale === 'fr' ? 'en' : 'fr';
    await page.locator(`.footer-bottom a[lang="${other}"]`).click();
    await expect(page.locator('html')).toHaveAttribute('lang', other);

    const casePath = address(locale, 'study', 'ichtyofaune-artois-picardie');
    await page.goto(origin + casePath);
    await page.reload();
    const stages = page.locator('.journey-progress button');
    await expect(stages).toHaveCount(6);
    await stages.nth(2).click();
    await expect(stages.nth(2)).toHaveAttribute('aria-current', 'step');
    await stages.nth(4).click();
    await expect(stages.nth(4)).toHaveAttribute('aria-current', 'step');
    await page.waitForTimeout(1500); // The mobile sheet resizes for the selected chapter.
    await page.locator('.journey-layers button').last().click();
    await expect(page.locator('.journey-layers button').last()).toHaveAttribute('aria-pressed', 'true');
    await noOverflow(page, 'Scientific map');

    await page.goto(origin + address(locale, 'contact'));
    const form = page.locator('#project-form');
    assert.equal(await form.evaluate((node) => node.checkValidity()), false);
    await expect(page.locator('.contact-path-primary a')).toHaveAttribute('href', `/espace/reserver?lang=${locale}`);
    const popup = page.waitForEvent('popup');
    await page.locator('.contact-path-primary a').click();
    const booking = await popup;
    booking.on('pageerror', (e) => errors.push({ locale, width, message: e.message }));
    await booking.waitForLoadState('domcontentloaded');
    await expect(booking.locator('.p-calendar')).toBeVisible({ timeout: 20000 });
    assert(new URL(booking.url()).pathname === '/espace/reserver');
    await expect(booking.locator('html')).toHaveAttribute('lang', locale);
    await expect(booking.locator('.p-calendar')).not.toHaveAttribute('aria-busy', 'true');
    if (!await booking.locator('.p-calendar-day:not([disabled])').count())
      await booking.locator('.p-calendar header button').last().click();
    await booking.locator('.p-calendar-day:not([disabled])').first().click();
    await booking.locator('.p-slot').first().click();
    await booking.getByRole('button', { name: /Continuer|Continue/ }).click();
    await expect(booking.locator('.p-booking form')).toBeVisible();
    await expect(booking.locator('.p-check a')).toHaveAttribute('href', address(locale, 'privacy'));
    await noOverflow(booking, 'Public booking form');
    await booking.screenshot({ path: `${output}/${locale}-public-booking-${width}.png` });
    if (locale === 'en' && width === 390) {
      // A rejected server write must not display a booking confirmation.
      let blockedWrites = 0;
      const rejectWrite = (route) => {
        if (route.request().method() !== 'POST') return route.continue();
        blockedWrites++;
        return route.fulfill({
          status: 503, contentType: 'application/json', body: JSON.stringify({ code: 'network' }),
        });
      };
      await booking.route('**/portal/**', rejectWrite);
      await booking.locator('[autocomplete="name"]').fill('Isolated failure check');
      await booking.locator('[autocomplete="email"]').fill('failure-check@example.invalid');
      await booking.getByRole('checkbox').check();
      await booking.locator('form button[type="submit"]').click();
      await expect.poll(() => blockedWrites).toBe(1);
      await expect(booking.locator('.p-toasts [data-kind="error"]')).toBeVisible();
      await expect(booking.locator('.p-booked')).toHaveCount(0);
      await booking.unroute('**/portal/**', rejectWrite);
      // Configuration failures expose a retry control, rather than an endless loader.
      await booking.route('**/portal/booking/config', (route) => route.fulfill({
        status: 503, contentType: 'application/json', body: JSON.stringify({ code: 'network' }),
      }));
      await booking.reload();
      await expect(booking.getByRole('button', { name: 'Try again', exact: true })).toBeVisible();
      await booking.unroute('**/portal/booking/config');
      await booking.getByRole('button', { name: 'Try again', exact: true }).click();
      await expect(booking.locator('.p-calendar')).toBeVisible();
    }
    assert.deepEqual(await page.evaluate(() => window.__siteCsp), []);
    assert.deepEqual(await booking.evaluate(() => window.__siteCsp), []);
    rows.push({ locale, width, passed: true, footerPages: links.length, publicBookingWithoutLogin: true });
    console.log(`Public interactions: ${locale} ${width}px passed.`);
    await context.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(`${output}/interactive-results.json`, JSON.stringify({ passed: true, origin, rows, errors }, null, 2) + '\n');
} finally { await browser.close(); }
