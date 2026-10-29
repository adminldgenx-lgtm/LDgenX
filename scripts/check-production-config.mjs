import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { productionOrigin, productionAliases, previewOrigin, localOrigins, portalSiteOrigin } from '../supabase/functions/_shared/site.ts';
import { portalAuthRedirects } from '../supabase/functions/_shared/origins.ts';

const redirects = await readFile('dist/_redirects', 'utf8');
for (const path of ['/espace', '/espace/*', '/admin', '/admin/*'])
  assert(redirects.includes(`${path} /portal 200`), `${path}: missing internal extensionless rewrite`);
assert(!/\/portal\.html 200/.test(redirects), 'An .html rewrite target triggers a visible Cloudflare 308');
const headers = await readFile('dist/_headers', 'utf8');
for (const host of ['https://:project.pages.dev/*', 'https://:version.:project.pages.dev/*'])
  assert(headers.includes(`${host}\n  X-Robots-Tag: noindex`), `${host}: preview indexing protection`);
for (const path of ['/espace', '/admin', '/portal'])
  assert(headers.includes(`${path}\n  X-Robots-Tag: noindex, nofollow`), `${path}: private indexing protection`);
const robots = await readFile('dist/robots.txt', 'utf8');
for (const path of ['/espace', '/admin', '/portal'])
  assert(robots.includes(`Disallow: ${path}`), `${path}: private crawler exclusion`);
for (const origin of [...productionAliases, 'https://untrusted.example', 'https://www.ldgenx.fr.evil.example'])
  assert.equal(portalSiteOrigin(origin), productionOrigin, `${origin}: canonical callback`);
for (const origin of [previewOrigin, ...localOrigins])
  assert.equal(portalSiteOrigin(origin), origin, `${origin}: preserved explicit testing origin`);
for (const path of ['/espace/connexion', '/espace/nouveau-mot-de-passe'])
  assert(portalAuthRedirects.includes(productionOrigin + path), `${path}: exact production callback`);
assert(!portalAuthRedirects.includes(productionOrigin + '/espace/**'), 'Production Auth callback must be exact');
console.log('Passed production routing, preview/private indexing and canonical Auth destination regressions.');
