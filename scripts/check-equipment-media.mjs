// Run after npm run build. Audits active output; historical assets are deliberately retained.
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { pages, ready } from '../.prerender/entry-server.js';
import { pageFile } from './page-file.mjs';
await ready;
const creditedPhotos = JSON.parse(await readFile('data/licensed-photos.json', 'utf8'))
  .photos.filter((photo) => photo.attributionRequired);
const retired = [
  'laboratoire',
  'sequencage',
  'microbiologie',
  'dna-ecotrace',
  'conception',
  'agriculture',
  'recherche',
  'innovation',
  'aquaculture',
];
const retiredUrl = new RegExp(`/images/(?:${retired.join('|')})-\\d+\\.webp`);
const retiredData = new RegExp(`data-image="(?:${retired.join('|')})"`);
let replacements = 0,
  social = 0;
const report = [];
for (const page of pages) {
  const html = await readFile(`dist/${pageFile(page.path)}`, 'utf8');
  assert(!retiredUrl.test(html), `${page.path}: retired image URL`);
  assert(!retiredData.test(html), `${page.path}: retired image in page`);
  const images = [...html.matchAll(/data-image="([^"]+)"/g)].map((m) => m[1]);
  const relevant = images.filter(
    (n) => n.startsWith('schema-') || n === 'equipe-maxime' || n === 'selection-unima',
  );
  replacements += relevant.length;
  const previews = [
    ...html.matchAll(/<meta (?:property|name)="(?:og|twitter):image" content="([^"]+)"/g),
  ].map((m) => m[1]);
  for (const preview of previews) {
    await access('dist' + new URL(preview).pathname);
    social++;
  }
  // Original decorative photographs are public-domain/CC0; the Slack exception is credited
  // in the legal notice. Scientific figures retain attribution in their captions.
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '');
  let withoutScientificCaptions = text.replace(/<figcaption>[\s\S]*?<\/figcaption>/g, '');
  // The Slack photograph is a deliberate, attributed exception to the public-domain assets.
  // Verify its complete licence record before excluding the legal credit from the old-media check.
  if (page.kind === 'legal') {
    const credits = text.match(/<div data-photo-licences[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';
    for (const photo of creditedPhotos) {
      assert(credits.includes(`data-photo-credit="${photo.name}"`), `${page.path}: missing photo credit`);
      assert(credits.includes(photo.author), `${page.path}: missing photographer`);
      assert(credits.includes(`href="${photo.source}"`), `${page.path}: missing photo source`);
      assert(credits.includes(`href="${photo.licenceUrl}"`), `${page.path}: missing photo licence`);
    }
    withoutScientificCaptions = withoutScientificCaptions.replace(credits, '');
  }
  assert(
    !/CC BY|Wikimedia|Sketchfab|id="credits"/.test(withoutScientificCaptions),
    `${page.path}: retired decorative attribution`,
  );
  for (const caption of text.matchAll(/<figcaption>([\s\S]*?)<\/figcaption>/g)) {
    if (caption[1].includes('CC BY 4.0'))
      assert(
        caption[1].includes('href="https://creativecommons.org/licenses/by/4.0/"'),
        `${page.path}: scientific licence missing its link`,
      );
  }
  report.push({
    path: page.path,
    media: [...new Set(relevant)],
    social: previews,
  });
}
for (const name of await readdir('dist/assets'))
  if (/\.(js|css)$/.test(name)) {
    const body = await readFile('dist/assets/' + name, 'utf8');
    assert(!retiredUrl.test(body), `${name}: retired URL in bundle`);
    const assigned = new RegExp(`\\bimage\\s*:\\s*['"](?:${retired.join('|')})['"]`);
    assert(!assigned.test(body), `${name}: retired image in a lazy catalogue`);
  }
console.log(
  `Passed: ${pages.length} FR/EN pages, ${replacements} real/neutral image occurrences, ${social} social tags, scientific licence links, lazy bundles; nine retired visuals unused.`,
);
if (process.argv.includes('--report')) {
  const { writeFile } = await import('node:fs/promises');
  await writeFile(
    'docs/qa-2026-10-20/active-media-routes.json',
    JSON.stringify(report, null, 2) + '\n',
  );
}
