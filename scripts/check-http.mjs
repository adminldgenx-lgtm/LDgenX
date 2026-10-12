import assert from 'node:assert/strict';
import { pages, redirects, companyOrigin } from '../.prerender/entry-server.js';

const origin = process.argv[2] || 'http://127.0.0.1:4173';
for (const page of pages) {
  const response = await fetch(origin + page.path);
  assert.equal(response.status, 200, page.path);
  const html = await response.text();
  assert(
    html.includes(`<link rel="canonical" href="${companyOrigin}${page.path}"`),
    `${page.path}: server returned the wrong document`,
  );
  assert.equal((html.match(/<h1\b/g) || []).length, 1, page.path);
}
for (const [from, to] of Object.entries(redirects)) {
  const response = await fetch(origin + from, { redirect: 'manual' });
  assert.equal(response.status, 301, from);
  assert.equal(response.headers.get('location'), to, from);
}
const missing = await fetch(origin + '/page-inconnue');
assert.equal(missing.status, 404);
assert((await missing.text()).includes('noindex, follow'));
console.log(
  `Passed: ${pages.length} direct page loads, ${Object.keys(redirects).length} HTTP 301 redirects, and a real HTTP 404.`,
);
