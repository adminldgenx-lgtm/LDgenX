import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { render, pages, redirects, companyOrigin } from '../.prerender/entry-server.js';

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
for (const page of pages) {
  const output = render(page.path);
  const directory = page.path === '/' ? root : path.join(root, page.path.slice(1));
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, 'index.html'),
    template.replace('<!--app-html-->', output.html).replace('<!--seo-head-->', output.head),
  );
}
const notFound = render('/404');
await writeFile(
  path.join(root, '404.html'),
  template.replace('<!--app-html-->', notFound.html).replace('<!--seo-head-->', notFound.head),
);
for (const [from, to] of Object.entries(redirects)) {
  const directory = path.join(root, from.slice(1));
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, 'index.html'),
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><link rel="canonical" href="${companyOrigin}${to}"><meta http-equiv="refresh" content="0;url=${to}"><title>Redirection | LDgenX</title></head><body><p>Cette page a changé d’adresse. <a href="${to}">Continuer vers la page LDgenX</a>.</p></body></html>`,
  );
}
await writeFile(
  path.join(root, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
    .filter((p) => !p.noindex)
    .map((p) => `<url><loc>${companyOrigin}${p.path}</loc></url>`)
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
await writeFile(
  path.join(root, 'llms.txt'),
  `# LDgenX\n\n> Entreprise française de génomique appliquée à la biodiversité, l’agriculture et l’aquaculture.\n\nContact : info@ldgenx.fr\n\n## Expertises\n${pages
    .filter((p) => p.kind === 'service')
    .map((p) => `- [${p.label}](${companyOrigin}${p.path}): ${p.description}`)
    .join('\n')}\n\n## Applications\n${pages
    .filter((p) => p.kind === 'application')
    .map((p) => `- [${p.label}](${companyOrigin}${p.path})`)
    .join(
      '\n',
    )}\n\n## Ressources et références\n- [Études de cas](${companyOrigin}/etudes-de-cas)\n- [Innovation](${companyOrigin}/innovation)\n- [Équipe](${companyOrigin}/a-propos/equipe)\n- [Ressources & Expertise](${companyOrigin}/ressources)\n\nLes projets de R&D sont des axes de recherche. Les illustrations ne constituent pas un reportage des études présentées.\n`,
);
console.log(
  `Prerendered ${pages.length} pages, ${Object.keys(redirects).length} redirects, and a 404 page.`,
);
