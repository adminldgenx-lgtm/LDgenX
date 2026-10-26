// Every prerendered route in mobile and desktop Chrome, with production CSP applied.
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const site = await import('../.prerender/entry-server.js');
await site.ready;
const origin = process.argv[2] ?? 'http://127.0.0.1:4173';
const out = 'docs/preprod-2026-10-26';
await mkdir(out, { recursive: true });
const csp = (await readFile('dist/_headers', 'utf8')).match(/Content-Security-Policy: (.+)/)[1];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const tasks = site.pages.flatMap((p) => [320, 1440].map((width) => ({ path: p.path, width })));
let cursor = 0;
const rows = [],
  errors = [];
try {
  await Promise.all(
    Array.from({ length: 3 }, async () => {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 1000 },
        reducedMotion: 'reduce',
      });
      await context.addInitScript(() => {
        window.__cspViolations = [];
        addEventListener('securitypolicyviolation', (e) =>
          window.__cspViolations.push({
            directive: e.effectiveDirective,
            blocked: e.blockedURI,
          }),
        );
      });
      const page = await context.newPage();
      page.setDefaultTimeout(15000);
      let pageErrors = [];
      page.on('pageerror', (e) => pageErrors.push(e.message));
      await page.route('**/*', async (route) => {
        if (route.request().resourceType() !== 'document') return route.continue();
        const response = await route.fetch();
        await route.fulfill({
          response,
          headers: { ...response.headers(), 'Content-Security-Policy': csp },
        });
      });
      while (cursor < tasks.length) {
        const task = tasks[cursor++];
        pageErrors = [];
        try {
          await page.setViewportSize({ width: task.width, height: 1000 });
          const response = await page.goto(origin + task.path, {
            waitUntil: 'domcontentloaded',
          });
          assert.equal(response.status(), 200);
          await page.evaluate(() => document.fonts.ready);
          await page.evaluate(async () => {
            const images = [...document.images];
            await Promise.all(
              images.map((img) => {
                img.loading = 'eager';
                return img.decode().catch(() => {});
              }),
            );
          });
          await page.waitForTimeout(500);
          const state = await page.evaluate(() => ({
            h1: document.querySelectorAll('h1').length,
            width: innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            broken: [...document.images]
              .filter((i) => !i.complete || i.naturalWidth === 0)
              .map((i) => i.getAttribute('src')),
            csp: window.__cspViolations,
            mainText: document.querySelector('main')?.textContent.length ?? 0,
          }));
          const defects = [];
          if (state.h1 !== 1) defects.push('H1 count ' + state.h1);
          if (state.scrollWidth > state.width + 1)
            defects.push('overflow ' + (state.scrollWidth - state.width));
          if (state.broken.length) defects.push('broken images ' + state.broken.join(','));
          if (state.csp.length) defects.push('CSP ' + JSON.stringify(state.csp));
          if (pageErrors.length) defects.push('JS ' + JSON.stringify(pageErrors));
          if (state.mainText < 60) defects.push('empty main');
          rows.push({ ...task, ...state, mainText: undefined, defects });
          if (defects.length) errors.push({ ...task, defects });
        } catch (e) {
          errors.push({ ...task, defects: [e.message.slice(0, 300)] });
        }
        if (rows.length % 30 === 0)
          console.log(`Browser sweep: ${rows.length}/${tasks.length}; issues ${errors.length}`);
      }
      await context.close();
    }),
  );
  await writeFile(
    out + '/public-browser-results.json',
    JSON.stringify(
      {
        routes: site.pages.length,
        viewports: [320, 1440],
        tested: rows.length,
        errors,
        rows,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    `Public browser sweep: ${rows.length} page/viewport combinations; ${errors.length} issues.`,
  );
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
