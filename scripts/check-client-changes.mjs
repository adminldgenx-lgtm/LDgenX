// Acceptance checks for the client's 27 October email and Damien Crestel's supplied corrections.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
import { pageFile } from './page-file.mjs';

const site = await import('../.prerender/entry-server.js');
await site.ready;
const origin = process.argv[2] ?? 'http://127.0.0.1:4173';
const out = process.env.LDGENX_QA_OUTPUT ?? 'docs/client-changes-2026-10-27';
await mkdir(out, { recursive: true });
const plain = (s) =>
  s
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
const address = (locale, kind, id) =>
  site.pages.find((p) => p.locale === locale && p.kind === kind && (!id || p.id === id)).path;
const html = async (path) => readFile('dist/' + pageFile(path), 'utf8');
const main = async (path) => (await html(path)).match(/<main\b[\s\S]*?<\/main>/)[0];
const results = [];
const mapPages = [];
const mapAssets = /(?:carte-artois-picardie|ap-carte-stations|ap-rapport-carte|ap-site-[a-z-]+)-\d+\.(?:webp|jpg|png)/;
for (const page of site.pages) {
  if (/class="journey(?:\s|")/.test(await main(page.path))) mapPages.push(page.path);
  if (!(page.kind === 'study' && page.id === 'ichtyofaune-artois-picardie'))
    assert(!mapAssets.test(await html(page.path)), page.path + ': scientific map outside its case');
  const footer = (await html(page.path)).match(/<footer\b[\s\S]*?<\/footer>/)[0];
  for (const target of site.pages.filter((p) => p.locale === page.locale))
    assert(footer.includes(`href="${target.path}"`), `${page.path}: footer missing ${target.path}`);
}
assert.deepEqual(
  mapPages.sort(),
  ['fr', 'en'].map((locale) => address(locale, 'study', 'ichtyofaune-artois-picardie')).sort(),
  'The interactive study map belongs only to its case page',
);

for (const locale of ['fr', 'en']) {
  const c = site.catalogs[locale];
  const services = c.services.filter((s) => s.listed !== false);
  assert.equal(services.length, 7);
  assert(!services.some((s) => ['materiel', 'recherche-developpement'].includes(s.id)));
  const home = await main(locale === 'fr' ? '/' : '/en');
  const footer = (await html(locale === 'fr' ? '/' : '/en')).match(/<footer\b[\s\S]*?<\/footer>/)[0];
  const footerServices = footer.match(/data-footer-group="services"[\s\S]*?<\/details>/)[0];
  assert(!footerServices.includes(address(locale, 'service', 'materiel')));
  const discovery = await readFile('dist/llms.txt', 'utf8');
  const expertiseIndex = discovery.split(locale === 'fr' ? '## Expertises' : '## Services')[1].split('\n## ')[0];
  assert(!expertiseIndex.includes(address(locale, 'service', 'materiel')));
  assert(discovery.includes(address(locale, 'service', 'materiel')));
  assert(!/class="journey(?:\s|")/.test(home), `${locale}: map still on homepage`);
  assert(
    /class="journey(?:\s|")/.test(
      await main(address(locale, 'study', 'ichtyofaune-artois-picardie')),
    ),
  );
  for (const p of site.pages.filter((p) => p.locale === locale && p.kind === 'service'))
    assert(
      !(await main(p.path)).includes('practice-section'),
      p.path + ': practical block on expertise',
    );
  for (const p of site.pages.filter((p) => p.locale === locale && p.kind === 'application'))
    assert(
      (await main(p.path)).includes('practice-section'),
      p.path + ': application practical block missing',
    );
  const edna = c.services.find((s) => s.id === 'adn-environnemental-adne');
  assert(
    edna.approaches.some(
      (a) => a.title === (locale === 'fr' ? 'Barcoding : dPCR ciblée' : 'Barcoding: targeted dPCR'),
    ),
  );
  const pop = c.services.find((s) => s.id === 'genomique-des-populations');
  assert(!pop.approaches.filter((a) => a.preview !== false).some((a) => /SNP/.test(a.title)));
  const material = address(locale, 'service', 'materiel');
  assert(
    (await main(address(locale, 'service', edna.id))).includes(`href="${material}"`),
    'Sampling equipment link missing',
  );
  const research = c.applications.find((a) => a.id === 'recherche-publique-privee');
  assert(research.researchSupport);
  assert(
    !site.pages.some(
      (p) => p.locale === locale && p.kind === 'service' && p.id === 'recherche-developpement',
    ),
  );
  const support = research.researchSupport;
  const text = plain(await main(address(locale, 'application', research.id)));
  const required = [
    support.headline,
    support.intro,
    support.need,
    support.delivery,
    ...support.approaches.flatMap((a) => [a.title, a.text]),
    ...support.prestations,
    ...support.uses,
    ...support.cases.map((x) => x.title),
  ];
  for (const sentence of required)
    assert(text.includes(plain(sentence)), `Lost R&D content: ${sentence}`);
  for (const p of c.research.publications) {
    for (const id of p.services)
      assert(
        c.services.some((s) => s.id === id),
        `${p.id}: retired expertise`,
      );
    for (const id of p.applications ?? [])
      assert(
        c.applications.some((a) => a.id === id),
        `${p.id}: missing application`,
      );
  }
  assert.equal(c.research.publications.length, 28);
  const papers = Object.fromEntries(c.research.publications.map((p) => [p.id, p]));
  assert(
    papers['bar-cortisol-temperature-2026'].approach.includes(
      locale === 'fr' ? 'ouest-méditerranéennes' : 'Western Mediterranean',
    ),
  );
  assert(
    papers['bar-cortisol-temperature-2026'].approach.includes(
      locale === 'fr' ? 'est-méditerranéennes' : 'Eastern Mediterranean',
    ),
  );
  assert(
    papers['bar-cortisol-temperature-2026'].limit.includes(
      locale === 'fr' ? 'populations méditerranéennes' : 'Mediterranean populations',
    ),
  );
  assert(
    papers['bar-sex-ratio-temperature-gwas-2026'].finding.includes(
      locale === 'fr' ? 'SNP du chromosome 19' : 'SNPs on chromosome 19',
    ),
  );
  assert(
    !papers['bar-sex-ratio-temperature-gwas-2026'].limit.includes(
      locale === 'fr' ? 'aucun QTL' : 'no QTL',
    ),
  );
  assert(
    papers['bar-survie-larvaire-introgression-2026'].limit.includes(
      locale === 'fr' ? 'trop faibles' : 'too low',
    ),
  );
  assert(
    papers['bar-croissance-larvaire-temperature-2025'].limit.includes(
      locale === 'fr' ? 'contre-gradient' : 'countergradient',
    ),
  );
  for (const p of Object.values(papers).filter((p) =>
    [
      'bar-cortisol-temperature-2026',
      'bar-sex-ratio-temperature-gwas-2026',
      'bar-survie-larvaire-introgression-2026',
      'bar-croissance-larvaire-temperature-2025',
    ].includes(p.id),
  )) {
    const body = plain(await main(address(locale, 'publication', p.id)));
    for (const key of ['summary', 'approach', 'finding', 'limit'])
      assert(body.includes(plain(p[key])), `${p.id} ${key}: rendered correction missing`);
  }
  for (const resource of c.resources) assert(address(locale, 'article', resource.id));
  results.push({
    locale,
    staticAcceptancePassed: true,
    expertises: services.length,
    publications: 28,
  });
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
  });
  page.on('pageerror', (e) => errors.push(e.message));
  for (const locale of ['fr', 'en']) {
    const c = site.catalogs[locale];
    await page.goto(origin + (locale === 'fr' ? '/' : '/en'));
    const homePop = c.services.find((s) => s.id === 'genomique-des-populations');
    const homeTab = page.getByRole('tab').filter({ hasText: homePop.title });
    await homeTab.scrollIntoViewIfNeeded();
    await homeTab.click();
    await expect(page.locator('.trace-panel-tags')).not.toContainText(/SNP/);
    await page.goto(origin + address(locale, 'services'));
    await expect(page.locator('.desktop-nav').locator(':scope > a, :scope > .nav-dropdown')).toHaveCount(
      5,
    );
    await expect(page.locator('.desktop-nav')).toContainText('Publications');
    await expect(page.locator('.desktop-nav')).not.toContainText(c.copy.navigation.resources);
    await expect(page.locator('.desktop-nav')).not.toContainText(c.copy.navigation.innovation);
    const pop = c.services.find((s) => s.id === 'genomique-des-populations');
    const trigger = page.getByRole('button', { name: pop.title, exact: true }).first();
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    const tags = page.locator('#landscape-card .landscape-card-tags');
    await expect(tags).toBeVisible();
    expect(await tags.innerText()).not.toMatch(/SNP/);
    await page
      .locator('.landscape-section')
      .screenshot({ path: `${out}/${locale}-population-preview.png` });
    const environment = c.applications.find((a) => a.erc);
    await page.goto(origin + address(locale, 'application', environment.id));
    const letters = page.locator('.erc-letters li');
    await letters.first().scrollIntoViewIfNeeded();
    const palette = await letters.evaluateAll((items) =>
      items.map((item) => ({
        color: getComputedStyle(item).color,
        background: getComputedStyle(item).backgroundColor,
      })),
    );
    for (let i = 0; i < c.erc.states.length; i++) {
      await page
        .getByRole('tab', { name: `${c.erc.states[i].moment} ${c.erc.states[i].label}` })
        .click();
      await expect(page.locator('#erc-panel')).toContainText(c.erc.states[i].text);
      expect(
        await letters.evaluateAll((items) =>
          items.map((item) => ({
            color: getComputedStyle(item).color,
            background: getComputedStyle(item).backgroundColor,
          })),
        ),
      ).toEqual(palette);
    }
    expect(new Set(palette.map((x) => x.background)).size).toBe(1);
    await page.waitForTimeout(800); // Let the project-phase rail finish its transition.
    await page.locator('.erc-board').screenshot({ path: `${out}/${locale}-erc.png` });
    await page.goto(
      origin +
        (locale === 'fr' ? '/recherche' : '/en/research') +
        '?application=recherche-publique-privee',
    );
    const count = c.research.publications.filter((p) =>
      p.applications?.includes('recherche-publique-privee'),
    ).length;
    await expect(page.locator('.research-list > li')).toHaveCount(count);
    await page.locator('.research-reset').click();
    await expect(page.locator('.research-list > li')).toHaveCount(28);
    await page.goto(
      origin +
        (locale === 'fr' ? '/recherche' : '/en/research') +
        '?expertise=recherche-developpement',
    );
    await expect(page.locator('.research-list > li')).toHaveCount(count);
    results.find((r) => r.locale === locale).interactiveAcceptancePassed = true;
  }
  for (const path of [
    '/services/recherche-developpement',
    '/en/services/research-development',
    '/services/research-development',
  ]) {
    const response = await page.request.get(origin + path, { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers().location).toContain('applications/');
  }
  assert.deepEqual(errors, []);
  await writeFile(
    `${out}/acceptance-results.json`,
    JSON.stringify({ passed: true, results, runtimeErrors: errors }, null, 2) + '\n',
  );
  console.log(
    'Passed client acceptance in FR/EN: map placement, preview labels, practice sections, full R&D migration, preserved publications, scientific corrections, five-item navbar, ERC and redirects.',
  );
} finally {
  await browser.close();
}
