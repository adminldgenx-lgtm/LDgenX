// The files written for crawlers: the sitemap index and its section sitemaps, robots.txt and the
// language-model files. The build writes them into dist (scripts/prerender.mjs); the development
// server makes them on request from the current content (vite.config.ts), so both serve the same.
import { buildLlms } from './llms.mjs';

/** The page's own content, without the header and footer every page shares. */
export const mainOf = (html) => html.match(/<main[\s\S]*<\/main>/)?.[0] ?? html;

/** Pictures shown in a page, each at its largest width, for the image sitemap. */
export function imageSet(html) {
  const best = {};
  for (const [, name, width] of html.matchAll(/\/images\/([a-z0-9-]+?)-(\d+)\.webp/g))
    if (!best[name] || Number(width) > best[name]) best[name] = Number(width);
  return Object.entries(best).map(([name, width]) => `/images/${name}-${width}.webp`);
}

// Sitemaps by section of the site.
const sections = {
  pages: [
    'home',
    'services',
    'applications',
    'studies',
    'innovations',
    'about',
    'team',
    'partners',
    'resources',
    'publications',
    'contact',
    'faq',
    'glossary',
    'sitemap',
    'terms',
  ],
  expertises: ['service', 'application'],
  etudes: ['study', 'work', 'innovation'],
  recherche: ['publication', 'person'],
  ressources: ['article'],
};

// Search engines and AI assistants are all welcome: the explicit list keeps a host's default
// "block AI crawlers" rule from silently excluding them.
const crawlers = [
  'Googlebot',
  'Bingbot',
  'Applebot',
  'DuckDuckBot',
  'Qwantbot',
  'YandexBot',
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'MistralAI-User',
  'Google-Extended',
  'Applebot-Extended',
  'Amazonbot',
  'meta-externalagent',
  'DuckAssistBot',
  'cohere-ai',
  'CCBot',
];

const xml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/**
 * Every crawler file, as { path: content }.
 * `dates` maps a page to its date of last change ({ date }), `imagesOf` to the pictures it shows;
 * a page missing from either gets `today` and no pictures.
 */
export function crawlerFiles({
  pages,
  catalogs,
  company,
  dates = {},
  imagesOf = {},
  today,
  portal = false,
}) {
  const origin = company.origin;
  const dateOf = (p) => dates[p.path]?.date ?? today;
  const unlisted = pages.filter(
    (p) => !p.noindex && !Object.values(sections).flat().includes(p.kind),
  );
  if (unlisted.length)
    throw new Error(`Pages missing from the sitemaps: ${unlisted.map((p) => p.path).join(', ')}`);
  const entry = (p) =>
    `<url><loc>${xml(origin + p.path)}</loc><lastmod>${dateOf(p)}</lastmod>${Object.entries(
      p.alternates,
    )
      .map(
        ([lang, href]) =>
          `<xhtml:link rel="alternate" hreflang="${lang}" href="${xml(origin + href)}"/>`,
      )
      .join('')}${
      p.alternates.fr
        ? `<xhtml:link rel="alternate" hreflang="x-default" href="${xml(origin + p.alternates.fr)}"/>`
        : ''
    }${(imagesOf[p.path] ?? [])
      .map((src) => `<image:image><image:loc>${xml(origin + src)}</image:loc></image:image>`)
      .join('')}</url>`;

  const files = {};
  const index = [];
  for (const [name, kinds] of Object.entries(sections)) {
    const list = pages.filter((p) => !p.noindex && kinds.includes(p.kind));
    if (!list.length) continue;
    files[`sitemaps/${name}.xml`] =
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${list.map(entry).join('\n')}\n</urlset>\n`;
    const latest = list.map(dateOf).sort().pop();
    index.push(
      `<sitemap><loc>${origin}/sitemaps/${name}.xml</loc><lastmod>${latest}</lastmod></sitemap>`,
    );
  }
  files['sitemap.xml'] =
    `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${index.join('\n')}\n</sitemapindex>\n`;
  // The client area and the administration, when built, are private: kept out by every group,
  // since a crawler follows only the group that names it.
  const rules = portal
    ? 'Allow: /\nDisallow: /espace\nDisallow: /admin\nDisallow: /portal'
    : 'Allow: /';
  files['robots.txt'] =
    `# LDgenX: every public page is open to search engines and AI assistants.\nUser-agent: *\n${rules}\n\n${crawlers
      .map((bot) => `User-agent: ${bot}\n${rules}`)
      .join('\n\n')}\n\nSitemap: ${origin}/sitemap.xml\n`;
  const { llmsTxt, llmsFull } = buildLlms({ catalogs, pages, company });
  files['llms.txt'] = llmsTxt;
  files['llms-full.txt'] = llmsFull;
  return files;
}
