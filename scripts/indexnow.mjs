// Tells search engines that use IndexNow (Bing, which also feeds ChatGPT search and Copilot,
// Yandex, Seznam, Naver) which pages changed, right after a deployment. A publication in the
// administration does the same by itself (supabase/functions/editorial). Google does not use
// IndexNow: it reads the sitemap declared in robots.txt and Search Console.
//
// Usage, once the new version is online:
//   node scripts/indexnow.mjs            every page of the sitemaps
//   node scripts/indexnow.mjs --changed  only pages whose last change is today (data/lastmod.json)
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = readFileSync(path.join(root, 'supabase/functions/_shared/site.ts'), 'utf8');
const key = site.match(/indexNowKey = "([0-9a-f]+)"/)?.[1];
const origin = site.match(/productionOrigin = "([^"]+)"/)?.[1];
if (!key || !origin) throw new Error('IndexNow key or origin not found in the shared site file.');

const dist = path.join(root, 'dist');
const index = readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
let urls = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].flatMap(([, sitemap]) =>
  [
    ...readFileSync(path.join(dist, sitemap.replace(origin, '')), 'utf8').matchAll(
      /<url><loc>([^<]+)<\/loc>/g,
    ),
  ].map((m) => m[1].replace(/&amp;/g, '&')),
);
if (process.argv.includes('--changed')) {
  const dates = JSON.parse(readFileSync(path.join(root, 'data/lastmod.json'), 'utf8'));
  const today = new Date().toISOString().slice(0, 10);
  urls = urls.filter((url) => dates[url.replace(origin, '') || '/']?.date === today);
}
if (!urls.length) {
  console.log('No page to submit.');
  process.exit(0);
}
const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: new URL(origin).host,
    key,
    keyLocation: `${origin}/${key}.txt`,
    urlList: urls,
  }),
});
console.log(`IndexNow: ${urls.length} addresses submitted, answer ${response.status}.`);
if (!response.ok && response.status !== 202) process.exit(1);
