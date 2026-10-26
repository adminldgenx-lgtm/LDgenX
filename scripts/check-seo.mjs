// Checks every built page as a search engine reads it: one h1, a title and description within
// the lengths results display and unique across the site, a canonical address, reciprocal
// language versions, a sharing picture that exists, valid structured data, alternative text on
// every image, internal links that lead somewhere, and sitemaps that list exactly the indexable
// pages. Run after `npm run build`.
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pageFile } from './page-file.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const origin = 'https://www.ldgenx.fr';
const errors = [];
const warnings = [];
const fail = (page, message) => errors.push(`${page}: ${message}`);
const warn = (page, message) => warnings.push(`${page}: ${message}`);

const read = (file) => readFileSync(path.join(dist, file), 'utf8');
const fileOf = pageFile;
const decode = (text) =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

// The sitemaps: the index, then each section.
const index = read('sitemap.xml');
const sitemapFiles = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
  m[1].replace(origin, ''),
);
const listed = new Map();
for (const file of sitemapFiles) {
  if (!existsSync(path.join(dist, file))) {
    fail('sitemap.xml', `missing ${file}`);
    continue;
  }
  for (const [, block] of read(file).matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = decode(block.match(/<loc>([^<]+)<\/loc>/)[1]).replace(origin, '') || '/';
    const alternates = Object.fromEntries(
      [...block.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [
        m[1],
        decode(m[2]).replace(origin, '') || '/',
      ]),
    );
    if (!/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(block))
      fail(loc, 'sitemap entry without lastmod');
    for (const [, img] of block.matchAll(/<image:loc>([^<]+)<\/image:loc>/g))
      if (!existsSync(path.join(dist, decode(img).replace(origin, ''))))
        fail(loc, `sitemap image missing: ${img}`);
    if (listed.has(loc)) fail(loc, 'listed twice in the sitemaps');
    listed.set(loc, alternates);
  }
}
const redirects = JSON.parse(read('redirects.json'));

const titles = new Map();
const descriptions = new Map();
const internalTargets = new Set([...listed.keys()]);
const pages = [...listed.keys()];
const head = {};
for (const page of pages) {
  const file = fileOf(page);
  if (!existsSync(path.join(dist, file))) {
    fail(page, 'listed in a sitemap but not built');
    continue;
  }
  const html = read(file);
  const get = (re) => html.match(re)?.[1];
  const title = decode(get(/<title>([^<]*)<\/title>/) ?? '');
  const description = decode(get(/<meta name="description" content="([^"]*)"/) ?? '');
  const robots = get(/<meta name="robots" content="([^"]*)"/) ?? '';
  const canonical = get(/<link rel="canonical" href="([^"]*)"/);
  const lang = get(/<html lang="([^"]+)"/);
  const ogImage = get(/<meta property="og:image" content="([^"]*)"/);
  const alternates = Object.fromEntries(
    [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [
      m[1],
      decode(m[2]).replace(origin, '') || '/',
    ]),
  );
  head[page] = alternates;

  if (!title) fail(page, 'no title');
  else if (title.length > 70) fail(page, `title too long (${title.length}): ${title}`);
  else if (title.length > 62) warn(page, `title may be cut in results (${title.length}): ${title}`);
  if (!description) fail(page, 'no meta description');
  else if (description.length < 50) warn(page, `short description (${description.length})`);
  else if (description.length > 170) fail(page, `description too long (${description.length})`);
  if (titles.has(title)) fail(page, `same title as ${titles.get(title)}`);
  titles.set(title, page);
  if (descriptions.has(description))
    fail(page, `same description as ${descriptions.get(description)}`);
  descriptions.set(description, page);
  if (robots.includes('noindex')) fail(page, 'noindex page listed in a sitemap');
  if (canonical !== origin + (page === '/' ? '/' : page) && canonical !== origin + page)
    fail(page, `canonical is ${canonical}`);
  const expectedLang = page === '/en' || page.startsWith('/en/') ? 'en' : 'fr';
  if (lang !== expectedLang) fail(page, `html lang is ${lang}`);
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) fail(page, `${h1} h1 elements`);
  if (!ogImage) fail(page, 'no og:image');
  else if (!existsSync(path.join(dist, ogImage.replace(origin, ''))))
    fail(page, `og:image missing: ${ogImage}`);
  if (alternates.fr && !alternates['x-default']) fail(page, 'no x-default');
  if (JSON.stringify(alternates) !== JSON.stringify(listed.get(page)))
    fail(page, 'language versions differ between the page and the sitemap');
  // Structured data.
  const json = get(/<script id="ldgenx-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/);
  try {
    const data = JSON.parse(json);
    const graph = data['@graph'];
    if (!Array.isArray(graph)) throw new Error('no @graph');
    const webpage = graph.find((n) => String(n['@id']).endsWith('#webpage'));
    if (!webpage) throw new Error('no WebPage node');
    if (webpage.url !== canonical) throw new Error(`WebPage url ${webpage.url}`);
    if (!graph.some((n) => n['@id'] === `${origin}/#organization`))
      throw new Error('no Organization');
    for (const n of graph)
      for (const [key, value] of Object.entries(n))
        if (value === undefined || value === '') throw new Error(`empty ${key} in ${n['@type']}`);
  } catch (error) {
    fail(page, `structured data: ${error.message}`);
  }
  // Images and links.
  for (const [img] of html.matchAll(/<img\b[^>]*>/g))
    if (!/\balt="/.test(img)) fail(page, `image without alt: ${img.slice(0, 90)}`);
  for (const [, href] of html.matchAll(/<a\b[^>]*href="([^"#?]*)[^"]*"/g)) {
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const target = href.replace(/\/+$/, '') || '/';
    if (internalTargets.has(target) || target in redirects) continue;
    if (existsSync(path.join(dist, 'portal.html')) && /^\/(espace|admin)(\/|$)/.test(target)) continue;
    if (existsSync(path.join(dist, target))) continue;
    // Pages kept out of the sitemaps (legal notice, privacy) are still built.
    if (existsSync(path.join(dist, fileOf(target)))) continue;
    fail(page, `broken internal link: ${href}`);
  }
}
// Each language version must point back.
for (const [page, alternates] of Object.entries(head))
  for (const [l, other] of Object.entries(alternates)) {
    if (l === 'x-default') continue;
    if (!head[other]) {
      fail(page, `hreflang ${l} points to ${other}, which is not in the sitemaps`);
      continue;
    }
    if (!Object.values(head[other]).includes(page)) fail(page, `${other} does not point back`);
  }
// Files for crawlers.
const robots = read('robots.txt');
if (!robots.includes(`Sitemap: ${origin}/sitemap.xml`)) fail('robots.txt', 'no sitemap line');
if (/^Disallow: \/\s*$/m.test(robots)) fail('robots.txt', 'disallows the whole site');
for (const file of ['llms.txt', 'llms-full.txt'])
  if (!existsSync(path.join(dist, file))) fail(file, 'missing');

for (const w of warnings) console.warn(`warning  ${w}`);
for (const e of errors) console.error(`error    ${e}`);
console.log(
  `${pages.length} indexable pages checked: ${errors.length} errors, ${warnings.length} warnings.`,
);
if (errors.length) process.exit(1);
