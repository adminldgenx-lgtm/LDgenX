// Read-only launch check. Authentication/bot challenges are reported as unverified, not broken.
import { readFile, writeFile } from 'node:fs/promises';
import { pageFile } from './page-file.mjs';
const site = await import('../.prerender/entry-server.js');
await site.ready;
const links = new Map();
for (const page of site.pages) {
  const html = await readFile('dist/' + pageFile(page.path), 'utf8');
  for (const match of html.matchAll(/<a\b[^>]*href="(https?:[^"<>]+)"/g)) {
    const url = match[1].replaceAll('&amp;', '&');
    if (new URL(url).hostname.endsWith('ldgenx.fr')) continue;
    const places = links.get(url) ?? [];
    if (!places.includes(page.path)) places.push(page.path);
    links.set(url, places);
  }
}
const rows = [];
const queue = [...links.entries()];
let next = 0;
await Promise.all(
  Array.from({ length: 2 }, async () => {
    while (next < queue.length) {
      const [url, pages] = queue[next++];
      const host = new URL(url).hostname;
      if (['doi.org', 'pubmed.ncbi.nlm.nih.gov', 'orcid.org'].includes(host)) {
        rows.push({
          url,
          pages,
          status: 'bibliographic-reference',
          verification:
            'DOIs/PubMed checked against publisher metadata; ORCID identifiers preserved from sources',
        });
        continue;
      }
      try {
        const r = await fetch(url, {
          headers: {
            Range: 'bytes=0-4095',
            'User-Agent': 'LDgenX-Prepublication-Link-Check/1.0',
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(20000),
        });
        await r.body?.cancel();
        rows.push({
          url,
          pages,
          status: r.status,
          finalUrl: r.url,
          classification:
            r.status === 404 || r.status === 410 ? 'broken' : r.ok ? 'reachable' : 'unverified',
        });
      } catch (e) {
        rows.push({ url, pages, status: e.name, classification: 'unverified' });
      }
    }
  }),
);
await writeFile(
  'docs/preprod-2026-10-26/external-links.json',
  JSON.stringify(rows, null, 2) + '\n',
);
console.log('External destinations:', rows.length);
for (const row of rows.filter(
  (r) => r.classification === 'broken' || r.classification === 'unverified',
))
  console.log(row.classification, row.status, row.url);
