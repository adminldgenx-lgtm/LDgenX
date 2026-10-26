// Read-only bibliographic audit. Use --refresh to update publisher metadata.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
const directory = 'docs/preprod-2026-10-26';
const site = await import('../.prerender/entry-server.js');
await site.ready;
const papers = site.catalogs.fr.research.publications;
const cached = JSON.parse(
  await readFile(`${directory}/bibliography.json`, 'utf8').catch(() => '[]'),
);
const refresh = process.argv.includes('--refresh');
const raw = [],
  rows = [],
  failures = [];
await mkdir(directory, { recursive: true });
for (const p of papers) {
  let row = cached.find((r) => r.doi === p.doi && r.status === 200);
  if (!row || refresh) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(
          `https://api.crossref.org/works/${encodeURIComponent(p.doi)}`,
          {
            headers: { 'User-Agent': 'LDgenX-Prepublication-Audit/1.0' },
            signal: AbortSignal.timeout(30000),
          },
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const { message: m } = await response.json();
        raw.push({ id: p.id, ...m });
        row = {
          id: p.id,
          doi: p.doi,
          status: response.status,
          title: m.title?.[0],
          journal: m['container-title']?.[0],
          dates: Object.fromEntries(
            ['published', 'published-print', 'published-online', 'issued']
              .filter((k) => m[k])
              .map((k) => [k, m[k]['date-parts'][0]]),
          ),
          volume: m.volume,
          issue: m.issue,
          pages: m.page,
          articleNumber: m['article-number'],
          authors: m.author?.map((a) => ({
            given: a.given,
            family: a.family,
            ORCID: a.ORCID,
          })),
          licences: m.license?.map((l) => l.URL),
          source: m.URL,
          relations: m.relation,
        };
        break;
      } catch (e) {
        if (attempt === 2) failures.push(`${p.id}: ${e.message}`);
        else await delay(2000 * (attempt + 1));
      }
    }
    await delay(1500);
  }
  if (!row) continue;
  rows.push({
    ...row,
    siteTitle: p.title,
    siteJournal: p.journal,
    siteYear: p.year,
    siteIssue: p.issue,
    siteAuthors: p.authors,
  });
}
// Preserve the last verified evidence if a refresh could not complete.
assert.deepEqual(failures, [], 'Publisher metadata refresh failed');
await writeFile(`${directory}/bibliography.json`, JSON.stringify(rows, null, 2) + '\n');
if (raw.length)
  await writeFile(`${directory}/crossref-sources.local`, JSON.stringify(raw, null, 2));
const normalize = (s) =>
  s
    ?.replace(/&amp;/g, '&')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/<[^>]*>|[^a-z0-9]/gi, '')
    .toLowerCase();
const discrepancies = [];
for (const r of rows) {
  const flags = [];
  if (normalize(r.title) !== normalize(r.siteTitle)) flags.push('TITLE');
  if (normalize(r.journal) !== normalize(r.siteJournal)) flags.push('JOURNAL');
  if (!Object.values(r.dates).some((d) => d[0] === r.siteYear)) flags.push('YEAR');
  if (r.authors.length !== r.siteAuthors.length) flags.push('AUTHORS');
  if (flags.length) discrepancies.push(`${r.id}: ${flags.join(', ')}`);
}
assert.equal(rows.length, papers.length, 'All publications must have evidence');
assert.deepEqual(discrepancies, [], 'Publisher metadata discrepancies');
console.log(
  `Passed: ${rows.length} publications match publisher metadata (${refresh ? 'refreshed' : 'cached where available'}).`,
);
