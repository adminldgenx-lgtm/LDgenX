import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import {
  render,
  pages,
  redirects,
  companyOrigin,
  catalogs,
  ready,
} from '../.prerender/entry-server.js';

await ready;

const root = path.resolve('dist');
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
for (const page of pages) {
  const output = render(page.path);
  const directory = page.path === '/' ? root : path.join(root, page.path.slice(1));
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, 'index.html'),
    withLang(template, page.locale)
      .replace('<!--app-html-->', output.html)
      .replace('<!--seo-head-->', output.head),
  );
}
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
  const directory = path.join(root, from.slice(1));
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, 'index.html'),
    `<!doctype html><html lang="${t.htmlLang}"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><link rel="canonical" href="${companyOrigin}${to}"><meta http-equiv="refresh" content="0;url=${to}"><title>${t.redirect.title}</title></head><body><p>${t.redirect.text} <a href="${to}">${t.redirect.link}</a>.</p></body></html>`,
  );
}
// Each address with its counterparts in the other language.
const entry = (p) =>
  `<url><loc>${companyOrigin}${p.path}</loc>${Object.entries(p.alternates)
    .map(
      ([lang, href]) =>
        `<xhtml:link rel="alternate" hreflang="${lang}" href="${companyOrigin}${href}"/>`,
    )
    .join('')}</url>`;
await writeFile(
  path.join(root, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${pages
    .filter((p) => !p.noindex)
    .map(entry)
    .join('\n')}\n</urlset>`,
);
await writeFile(
  path.join(root, 'robots.txt'),
  `User-agent: *\nAllow: /\nSitemap: ${companyOrigin}/sitemap.xml\n`,
);
await writeFile(
  path.join(root, '_redirects'),
  Object.entries(redirects)
    .map(([from, to]) => `${from} ${to} 301\n${from}/ ${to} 301`)
    .join('\n') +
    '\n' +
    pages
      .filter((p) => p.path !== '/')
      .map((p) => `${p.path} ${p.path}/index.html 200`)
      .join('\n') +
    '\n',
);
await writeFile(path.join(root, 'redirects.json'), JSON.stringify(redirects, null, 2));
const llms = (locale) => {
  const t = catalogs[locale].ui.seo.llms;
  const of = (kind) => pages.filter((p) => p.locale === locale && p.kind === kind);
  const line = (p, description = false) =>
    `- [${p.label}](${companyOrigin}${p.path})${description ? `: ${p.description}` : ''}`;
  return `## ${t.expertises}\n${of('service')
    .map((p) => line(p, true))
    .join('\n')}\n\n## ${t.applications}\n${of('application')
    .map((p) => line(p))
    .join('\n')}\n\n## ${t.more}\n${[
    ...of('studies'),
    ...of('study'),
    ...of('work'),
    ...of('innovations'),
    ...of('team'),
    ...of('publications'),
    ...of('resources'),
  ]
    .map((p) => line(p))
    .join('\n')}\n\n${t.note}\n`;
};
await writeFile(
  path.join(root, 'llms.txt'),
  `# LDgenX\n\n> ${catalogs.fr.ui.seo.llms.summary}\n\nContact : info@ldgenx.fr\n\n${llms('fr')}\n# LDgenX (English)\n\n> ${catalogs.en.ui.seo.llms.summary}\n\n${llms('en')}`,
);
console.log(
  `Prerendered ${pages.length} pages, ${Object.keys(redirects).length} redirects, and a 404 page.`,
);
