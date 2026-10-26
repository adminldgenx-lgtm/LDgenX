// Structural and quantitative checks for the bilingual launch catalogue.
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
const site = await import('../.prerender/entry-server.js');
await site.ready;
const { fr, en } = site.catalogs;
const exceptions = [];
for (const group of ['services', 'applications', 'studies', 'resources', 'works', 'people'])
  assert.deepEqual(
    fr[group].map((v) => v.id),
    en[group].map((v) => v.id),
    `${group}: FR/EN IDs`,
  );
const normalized = (s) =>
  s
    .replace(/&amp;/g, '&')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/<[^>]*>|[^a-z0-9]/gi, '')
    .toLowerCase();
const numbers = (s) =>
  (
    s
      .replace(/\b[1-9]\d{0,2}(?:[ ,\u00a0\u202f]\d{3})+(?=[^\d.,]|$)/g, (n) =>
        n.replace(/[ ,\u00a0\u202f]/g, ''),
      )
      .replace(/(\d),(\d)/g, '$1.$2')
      .match(/\d+(?:\.\d+)?/g) ?? []
  ).sort();
function compare(a, b, path = '') {
  if (typeof a === 'string' && typeof b === 'string') {
    if (JSON.stringify(numbers(a)) !== JSON.stringify(numbers(b))) exceptions.push(path);
  } else if (Array.isArray(a) && Array.isArray(b)) {
    assert.equal(a.length, b.length, `${path}: translated list length`);
    a.forEach((v, i) => compare(v, b[i], `${path}[${i}]`));
  } else if (a && b && typeof a === 'object' && typeof b === 'object')
    for (const k of Object.keys(a)) compare(a[k], b[k], path ? `${path}.${k}` : k);
}
compare(fr, en);
assert.deepEqual(exceptions, [], 'FR/EN quantitative inconsistencies');
const papers = fr.research.publications,
  bibliography = JSON.parse(await readFile('docs/preprod-2026-10-26/bibliography.json', 'utf8'));
assert.equal(new Set(papers.map((p) => p.doi.toLowerCase())).size, papers.length, 'Duplicate DOI');
for (const p of papers) {
  const q = en.research.publications.find((q) => q.id === p.id),
    source = bibliography.find((s) => s.doi === p.doi);
  for (const key of ['doi', 'title', 'year', 'journal', 'authors', 'members'])
    assert.deepEqual(p[key], q[key], `${p.id}: ${key}`);
  assert(source?.status === 200, `${p.id}: unverified DOI`);
  assert.equal(normalized(p.title), normalized(source.title), `${p.id}: publisher title`);
  assert.equal(normalized(p.journal), normalized(source.journal), `${p.id}: publisher journal`);
  assert(
    Object.values(source.dates).some((d) => d[0] === p.year),
    `${p.id}: publication year`,
  );
  assert.equal(p.authors.length, source.authors.length, `${p.id}: author count`);
  source.authors.forEach((a, i) =>
    assert(normalized(p.authors[i]).startsWith(normalized(a.family)), `${p.id}: author ${i + 1}`),
  );
  for (const id of p.members)
    assert(
      fr.people.some((person) => person.id === id),
      `${p.id}: unknown team member`,
    );
  if (p.figures.length) assert.equal(p.licence, 'CC BY 4.0', `${p.id}: figure licence`);
}
const targets = fr.customAssay.targets;
assert.equal(targets.length, 22, 'Expected client-confirmed 22 target species');
assert.equal(new Set(targets.map((t) => t.latin)).size, targets.length, 'Duplicate target species');
assert.equal(
  fr.studies
    .find((s) => s.id === 'genomique-vanneau-huppe')
    .details.regions.reduce((n, r) => n + r.value, 0) + 3,
  479,
  'Lapwing regional counts plus missing region',
);
const bear = fr.studies.find((s) => s.id === 'demogenetique-ours-pyrenees');
assert(
  Math.abs(bear.details.regions.reduce((n, r) => n + r.value, 0) - 100) < 0.001,
  'Bear percentages',
);
const estuary = fr.studies.find((s) => s.id === 'adne-estuaire-milieu-turbide');
const overlaps = estuary.details.figures.find((f) => f.bars).bars.map((b) => b.value);
assert.deepEqual(overlaps, [14, 12, 2], 'Estuary source comparison');
const files = (await readdir('dist/assets')).filter((f) => f.endsWith('.js'));
for (const file of files)
  assert(
    !/(sbp_[a-f\d]{40}|sb_secret_[a-zA-Z\d_-]{20,})/.test(
      await readFile('dist/assets/' + file, 'utf8'),
    ),
    `Private credential in ${file}`,
  );
console.log(
  `Passed: ${site.pages.length} pages; bilingual IDs and quantitative parity; ${papers.length} publisher-verified publications; 22 distinct assay targets; case-study totals; figure licensing; production credential patterns.`,
);
