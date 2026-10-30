import { loadEnv } from 'vite';
const buildEnv = { ...loadEnv('production', process.cwd(), ''), ...process.env };
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import {
  render,
  pages,
  redirects,
  companyOrigin,
  catalogs,
  company,
  getPage,
  renderHead,
  ready,
} from '../.prerender/entry-server.js';
import { crawlerFiles, imageSet, mainOf } from './crawler-files.mjs';
import { pageFile } from './page-file.mjs';

await ready;

const root = path.resolve('dist');
// The portal is built by default. A public-site-only build can exclude it with LDGENX_PORTAL=0.
const portal = existsSync(path.join(root, 'portal.html'));
const built = await readFile(path.join(root, 'index.html'), 'utf8');
if (!built.includes('<!--app-html-->') || !built.includes('<!--seo-head-->'))
  throw new Error('Prerender placeholders are missing.');
// The stylesheet is small: inlined, it lets the first paint start without another request.
const stylesheet = built.match(/<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/);
if (!stylesheet) throw new Error('Stylesheet link not found.');
const css = await readFile(path.join(root, stylesheet[1].slice(1)), 'utf8');
// Headings are set in Manrope: fetching it early spares them a reflow when the font arrives.
const display = (await readdir(path.join(root, 'assets'))).find((file) =>
  /^manrope-latin-500-normal-.+\.woff2$/.test(file),
);
if (!display) throw new Error('Heading font not found.');
const template = built.replace(
  stylesheet[0],
  `<link rel="preload" href="/assets/${display}" as="font" type="font/woff2" crossorigin><style>${css}</style>`,
);
const localeOf = (path) => (path === '/en' || path.startsWith('/en/') ? 'en' : 'fr');
// Each page's language catalogue (and the terms it carries) is fetched alongside the main
// script, not after it.
const assets = await readdir(path.join(root, 'assets'));
const chunk = (prefix) => {
  const file = assets.find((f) => f.startsWith(prefix) && f.endsWith('.js'));
  if (!file) throw new Error(`${prefix} chunk not found.`);
  return `<link rel="modulepreload" crossorigin href="/assets/${file}">`;
};
const preloads = {
  fr: chunk('catalog.fr-') + chunk('cgv.fr-'),
  en: chunk('catalog.en-') + chunk('cgv.fr-'),
};
const withLang = (html, locale) =>
  html
    .replace('<html lang="fr">', `<html lang="${catalogs[locale].ui.htmlLang}">`)
    .replace('</head>', `${preloads[locale]}</head>`);
await writeFile('.prerender/editorial-templates.json', JSON.stringify({ fr: withLang(template, 'fr'), en: withLang(template, 'en') }));
// Each page's date of last change: kept from one build to the next while its content stays the
// same (data/lastmod.json), so sitemaps and structured data date real changes only.
const lastmodFile = path.resolve('data/lastmod.json');
const known = JSON.parse(await readFile(lastmodFile, 'utf8').catch(() => '{}'));
const today = new Date().toISOString().slice(0, 10);
const dates = {};
// Pictures shown on each page, for the image sitemap.
const imagesOf = {};
for (const page of pages) {
  const output = render(page.path);
  const main = mainOf(output.html);
  const hash = createHash('sha256').update(main).digest('hex').slice(0, 16);
  dates[page.path] = known[page.path]?.hash === hash ? known[page.path] : { hash, date: today };
  imagesOf[page.path] = imageSet(main);
  const head = renderHead(getPage(page.path), dates[page.path].date);
  const file = path.join(root, pageFile(page.path));
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(
    file,
    withLang(template, page.locale)
      .replace('<!--app-html-->', output.html)
      .replace('<!--seo-head-->', head)
      .replace('</body>', '<script id="ldgenx-editorial" type="application/json">{"index":[],"document":null}</script></body>'),
  );
}
await writeFile(lastmodFile, `${JSON.stringify(dates, null, 2)}\n`);
const notFound = render('/404');
await writeFile(
  path.join(root, '404.html'),
  withLang(template, 'fr')
    .replace('<!--app-html-->', notFound.html)
    .replace('<!--seo-head-->', notFound.head),
);
// A redirect whose address differs from a page only by its capitals (/Services) is left to the
// host rules: on a case-insensitive disk its file would replace the page.
const written = new Set(pages.map((p) => p.path.toLowerCase()));
for (const [from, to] of Object.entries(redirects)) {
  if (written.has(from.toLowerCase())) continue;
  written.add(from.toLowerCase());
  const t = catalogs[localeOf(to)].ui;
  const file = path.join(root, pageFile(from));
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(
    file,
    `<!doctype html><html lang="${t.htmlLang}"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><link rel="canonical" href="${companyOrigin}${to}"><meta http-equiv="refresh" content="0;url=${to}"><title>${t.redirect.title}</title></head><body><p>${t.redirect.text} <a href="${to}">${t.redirect.link}</a>.</p></body></html>`,
  );
}
// Sitemaps (each address with its language versions, its date of last change and the pictures it
// shows), robots.txt and the language-model files: see crawler-files.mjs.
const files = crawlerFiles({ pages, catalogs, company, dates, imagesOf, today, portal });
await mkdir(path.join(root, 'sitemaps'), { recursive: true });
for (const [file, content] of Object.entries(files))
  await writeFile(path.join(root, file), content);
await writeFile(
  path.join(root, '_redirects'),
  Object.entries(redirects)
    .map(([from, to]) => `${from} ${to} 301\n${from}/ ${to} 301`)
    .join('\n') +
    '\n' +
    // A page asked with a trailing slash goes to its address (Cloudflare serves page.html at /page).
    pages
      .filter((p) => p.path !== '/')
      .map((p) => `${p.path}/ ${p.path} 301`)
      .join('\n') +
    '\n' +
    // The client area and the administration: one application for every address below them.
    (portal
      // An .html rewrite target is normalized by Pages into a visible 308 to /portal,
      // losing the requested route. The extensionless target keeps the rewrite internal.
      ? '/espace /portal 200\n/espace/* /portal 200\n/admin /portal 200\n/admin/* /portal 200\n'
      : ''),
);
await writeFile(path.join(root, 'redirects.json'), JSON.stringify(redirects, null, 2));
// Host rules (Cloudflare Pages reads this file). Every response carries the security headers:
// the site loads nothing from other origins, runs no inline script (the JSON-LD blocks are data)
// and cannot be framed. Then a long cache for fingerprinted assets, plain text for the
// language-model files, which stay out of search results, as does the client area when built.
// A header set by two matching rules would be joined, so each rule sets different headers.
const contact = (buildEnv.VITE_CONTACT_ENDPOINT ?? '').trim();
const supabase = (buildEnv.VITE_SUPABASE_URL ?? '').trim();
const supabaseOrigin = /^https:\/\//.test(supabase) ? ` ${new URL(supabase).origin} ${new URL(supabase).origin.replace('https:', 'wss:')}` : '';
const contactOrigin = /^https:\/\//.test(contact) ? ` ${new URL(contact).origin}` : '';
const policy = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${supabase ? ` ${new URL(supabase).origin}` : ''}`,
  "font-src 'self'",
  `media-src 'self' blob:${supabase ? ` ${new URL(supabase).origin}` : ''}`,
  "frame-src 'self' https://www.youtube-nocookie.com https://player.vimeo.com",
  `connect-src 'self'${contactOrigin}${supabaseOrigin}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');
const security = [
  `Content-Security-Policy: ${policy}`,
  'Strict-Transport-Security: max-age=31536000',
  'X-Content-Type-Options: nosniff',
  'X-Frame-Options: DENY',
  'Referrer-Policy: strict-origin-when-cross-origin',
  'Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  'Cross-Origin-Opener-Policy: same-origin',
];
const rules = [
  ['/*', security],
  // The public production domain is indexable; Pages addresses are previews/aliases.
  ['https://:project.pages.dev/*', ['X-Robots-Tag: noindex']],
  ['https://:version.:project.pages.dev/*', ['X-Robots-Tag: noindex']],
  ['/assets/*', ['Cache-Control: public, max-age=31536000, immutable']],
  ['/images/*', ['Cache-Control: public, max-age=2592000']],
  ['/llms.txt', ['Content-Type: text/plain; charset=utf-8', 'X-Robots-Tag: noindex']],
  ['/llms-full.txt', ['Content-Type: text/plain; charset=utf-8', 'X-Robots-Tag: noindex']],
  ...(portal
    ? [
        ['/portal.html', ['X-Robots-Tag: noindex, nofollow', 'Cache-Control: no-cache']],
        ['/portal', ['X-Robots-Tag: noindex, nofollow', 'Cache-Control: no-cache']],
        ['/espace', ['X-Robots-Tag: noindex, nofollow']],
        ['/espace/*', ['X-Robots-Tag: noindex, nofollow']],
        ['/admin', ['X-Robots-Tag: noindex, nofollow']],
        ['/admin/*', ['X-Robots-Tag: noindex, nofollow']],
      ]
    : []),
];
await writeFile(
  path.join(root, '_headers'),
  rules
    .map(([match, headers]) => `${match}\n${headers.map((h) => `  ${h}`).join('\n')}`)
    .join('\n') + '\n',
);
console.log(
  `Prerendered ${pages.length} pages, ${Object.keys(redirects).length} redirects, and a 404 page.`,
);
