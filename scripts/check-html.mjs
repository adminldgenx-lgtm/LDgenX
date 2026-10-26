import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pages, redirects, companyOrigin, ready } from '../.prerender/entry-server.js';
import { pageFile } from './page-file.mjs';

await ready;

const portal = await access('dist/portal.html').then(() => true, () => false);
const titles = new Set(),
  descriptions = new Set();
let links = 0,
  images = 0;
for (const page of pages) {
  const file = path.join('dist', pageFile(page.path));
  const html = await readFile(file, 'utf8');
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${page.path}: one H1 required`);
  assert(!/<h1[^>]*>\s*<\/h1>/.test(html), `${page.path}: empty H1`);
  const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
  const levels = [...main.matchAll(/<h([1-6])\b/g)].map((match) => Number(match[1]));
  levels.forEach((level, i) =>
    assert(i === 0 || level <= levels[i - 1] + 1, `${page.path}: heading jumps to h${level}`),
  );
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  const description = html.match(/<meta name="description" content="(.*?)"/s)?.[1];
  assert(title && description, `${page.path}: missing metadata`);
  assert(!titles.has(title), `${page.path}: duplicate title`);
  titles.add(title);
  assert(!descriptions.has(description), `${page.path}: duplicate description`);
  descriptions.add(description);
  assert(
    html.includes(`<link rel="canonical" href="${companyOrigin}${page.path}"`),
    `${page.path}: canonical`,
  );
  assert(
    html.includes('property="og:title"') && html.includes('name="twitter:title"'),
    `${page.path}: social metadata`,
  );
  assert(
    JSON.parse(
      html.match(/<script id="ldgenx-schema" type="application\/ld\+json">(.*?)<\/script>/s)[1],
    )['@graph'].length > 0,
  );
  assert(
    !/lorem ipsum|\bNaN\b|\bundefined\b|<!--app-html-->/i.test(html),
    `${page.path}: unresolved content`,
  );
  const visibleText = html
    .replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ');
  const spacing = visibleText.match(/\S {1,}[?!;:»]|« /);
  assert(!spacing, `${page.path}: French punctuation needs a no-break space: "${spacing?.[0]}"`);
  for (const match of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const url = match[1];
    if (/\.[a-z\d]+$/i.test(url)) await access(path.join('dist', url.slice(1)));
    else
      assert(
        pages.some((p) => p.path === url) || redirects[url] || (portal && /^\/(espace|admin)(\/|$)/.test(url)),
        `${page.path}: broken link ${url}`,
      );
    links++;
  }
  for (const match of html.matchAll(
    /<meta (?:property|name)="(?:og|twitter):image" content="([^"]+)"/g,
  )) {
    const url = new URL(match[1]);
    assert.equal(url.origin, companyOrigin, `${page.path}: social image on another origin`);
    await access(path.join('dist', url.pathname.slice(1)));
  }
  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = match[0];
    assert(/alt="[^"]*"/.test(tag), `${page.path}: image alt missing`);
    const src = tag.match(/src="(\/.*?)"/)?.[1];
    if (src) await access(path.join('dist', src.slice(1)));
    images++;
  }
}
console.log(
  `Passed: ${pages.length} prerendered pages; unique metadata; one H1; ordered headings; valid JSON-LD; French spacing; social images; ${links} local links; ${images} images.`,
);
