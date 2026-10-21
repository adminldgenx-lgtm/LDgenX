// Optional browser QA. Use the available Playwright installation without adding app dependencies.
// LDGENX_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/check-assays-browser.mjs [origin]
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const { chromium } = await import(process.env.LDGENX_PLAYWRIGHT_MODULE || 'playwright');
const source = JSON.parse(await readFile(new URL('../data/assay-targets.json', import.meta.url), 'utf8'));
const targets = source.targets.filter((x) => x.publication === 'publish');
const origin = process.argv[2] || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
const languages = [
  { path: '/services/sequencage-dpcr', nameKey: 'nameFr', search: 'Rechercher une espèce', reset: 'Réinitialiser', contact: '/contact', groups: ['Mammifères', 'Poissons', 'Reptiles', 'Invertébrés'] },
  { path: '/en/services/sequencing-dpcr', nameKey: 'nameEn', search: 'Search for a species', reset: 'Reset', contact: '/en/contact', groups: ['Mammals', 'Fish', 'Reptiles', 'Invertebrates'] },
];
try {
  for (const language of languages) {
    for (const width of [1440, 768, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      page.setDefaultTimeout(8000);
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(origin + language.path);
      await page.locator('.assay-catalog').waitFor();
      const names = await page.locator('.assay-target-name').allTextContents();
      const latin = await page.locator('.assay-target-latin').allTextContents();
      assert.deepEqual(names, targets.map((x) => x[language.nameKey]));
      assert.deepEqual(latin, targets.map((x) => x.latin));
      const search = page.getByRole('searchbox', { name: language.search });
      const reset = page.getByRole('button', { name: language.reset, exact: true });
      const categories = ['mammals', 'fish', 'reptiles', 'invertebrates'];
      for (const [index, category] of categories.entries()) {
        await page.getByRole('button', { name: language.groups[index], exact: true }).click();
        assert.equal(await page.locator('.assay-target').count(), targets.filter((x) => x.category === category).length);
      }
      await reset.click();
      await search.fill('Thunnus');
      assert.equal(await page.locator('.assay-target').count(), 2);
      await search.fill('tortue'); // French source names are searchable in both languages.
      assert.equal(await page.locator('.assay-target').count(), 1);
      assert.equal(await page.locator('.assay-target-detail em').textContent(), 'Caretta caretta');
      await search.fill('amerique'); // Accent-insensitive search.
      assert.equal(await page.locator('.assay-target').count(), 1);
      await search.fill('Neomys anomalus');
      assert.equal(await page.locator('.assay-target').count(), 0);
      assert.equal(await page.locator('.assay-empty').count(), 1);
      await reset.click();
      if (width > 800) {
        const target = page.locator('.assay-target').filter({ hasText: 'Carcharodon carcharias' });
        await target.focus();
        await page.keyboard.press('Space');
        assert.equal(await target.getAttribute('aria-pressed'), 'true');
      } else {
        await page.locator('.assay-mobile-select select').selectOption('carcharodon-carcharias');
      }
      assert.equal(await page.locator('.assay-target-detail em').textContent(), 'Carcharodon carcharias');
      assert.equal(await page.locator('.assay-target-detail a').getAttribute('href'), language.contact);
      const tabs = page.locator('.assay-steps [role="tab"]');
      await tabs.first().click();
      await page.keyboard.press('End');
      assert.equal(await tabs.last().getAttribute('aria-selected'), 'true');
      await page.keyboard.press('Home');
      assert.equal(await tabs.first().getAttribute('aria-selected'), 'true');
      assert.equal(await page.locator('.assay-detail-body').evaluate((e) => getComputedStyle(e).animationName), 'none');
      assert.equal(await page.locator('.assay-section').evaluate((e) => e.scrollWidth > e.clientWidth), false);
      if (width > 320) assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      // 320px's existing header overflow is documented separately from this section.
      console.log(`Passed: ${language.path} at ${width}px`);
      await page.close();
    }
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
console.log('Passed: bilingual catalogue content, filters, search, empty state, selection, contact, keyboard and reduced motion.');
