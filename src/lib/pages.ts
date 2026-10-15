import { catalog, type Catalog } from '../content/catalog';
import { company, routeSources } from '../content/site';
import { imageUrl } from './images';
import { heroPosterPreload } from './hero';
import { bases, localeOf, locales, routesFor, type Locale } from './routes';

export type PageKind =
  | 'home'
  | 'services'
  | 'service'
  | 'applications'
  | 'application'
  | 'studies'
  | 'study'
  | 'work'
  | 'innovations'
  | 'innovation'
  | 'about'
  | 'team'
  | 'person'
  | 'publications'
  | 'partners'
  | 'resources'
  | 'article'
  | 'contact'
  | 'legal'
  | 'privacy'
  | 'terms'
  | 'not-found';
export interface PageMeta {
  path: string;
  title: string;
  description: string;
  label: string;
  kind: PageKind;
  locale: Locale;
  /** The entity shown, the same in both languages (its French slug). */
  id?: string;
  slug?: string;
  image?: string;
  noindex?: boolean;
  /** The same page in each language that has it. */
  alternates: Partial<Record<Locale, string>>;
}

function buildPages(locale: Locale, c: Catalog): PageMeta[] {
  const r = routesFor(locale, c);
  const seo = c.ui.seo;
  const page = (
    path: string,
    kind: PageKind,
    label: string,
    title: string,
    description: string,
    image?: string,
    id?: string,
  ): PageMeta => ({ path, kind, label, title, description, image, id, locale, alternates: {} });
  const list: PageMeta[] = [
    page(r.home, 'home', seo.home.label, seo.home.title, seo.home.description, 'laboratoire'),
    page(
      r.services,
      'services',
      seo.services.label,
      seo.services.title,
      seo.services.description,
      'sequencage',
    ),
    ...c.services.map((s) =>
      page(
        r.service(s.id),
        'service',
        s.title,
        s.seo?.title ?? seo.service.title(s.title),
        s.seo?.description ?? seo.service.description(s.title, s.short),
        s.image,
        s.id,
      ),
    ),
    ...c.works.map((w) =>
      page(r.work(w.id), 'work', w.title, seo.work.title(w.title), w.summary, w.image, w.id),
    ),
    page(
      r.applications,
      'applications',
      seo.applications.label,
      seo.applications.title,
      seo.applications.description,
      'riviere',
    ),
    ...c.applications.map((s) =>
      page(
        r.application(s.id),
        'application',
        s.title,
        s.seo?.title ?? seo.application.title(s.title),
        s.seo?.description ?? seo.application.description(s.title),
        s.image,
        s.id,
      ),
    ),
    page(
      r.studies,
      'studies',
      seo.studies.label,
      seo.studies.title,
      seo.studies.description,
      'carte-artois-picardie',
    ),
    ...c.studies.map((s) =>
      page(
        r.study(s.id),
        'study',
        s.title,
        seo.article.title(s.title.replace(/\.$/, '')),
        s.subtitle,
        s.image,
        s.id,
      ),
    ),
    page(
      r.innovations,
      'innovations',
      seo.innovations.label,
      seo.innovations.title,
      seo.innovations.description,
      'innovation',
    ),
    ...c.innovations.map((s) =>
      page(
        r.innovation(s.id),
        'innovation',
        s.title,
        seo.innovation.title(s.title, s.id),
        s.intro,
        s.image,
        s.id,
      ),
    ),
    page(r.about, 'about', seo.about.label, seo.about.title, seo.about.description, 'laboratoire'),
    page(r.team, 'team', seo.team.label, seo.team.title, seo.team.description),
    ...c.people
      .filter((p) => p.slug)
      .map((p) =>
        page(
          r.person(p.id),
          'person',
          p.name,
          seo.person.title(p.name),
          seo.person.description(p.name, p.role),
          p.photo,
          p.id,
        ),
      ),
    page(
      r.publications,
      'publications',
      seo.publications.label,
      seo.publications.title,
      seo.publications.description,
    ),
    page(r.partners, 'partners', seo.partners.label, seo.partners.title, seo.partners.description),
    page(
      r.resources,
      'resources',
      seo.resources.label,
      seo.resources.title,
      seo.resources.description,
      'bioinformatique',
    ),
    ...c.resources.map((s) =>
      page(
        r.resource(s.id),
        'article',
        s.title,
        seo.article.title(s.title.replace(/\.$/, '')),
        s.intro,
        s.image,
        s.id,
      ),
    ),
    page(r.contact, 'contact', seo.contact.label, seo.contact.title, seo.contact.description),
    {
      ...page(r.legal, 'legal', seo.legal.label, seo.legal.title, seo.legal.description),
      noindex: true,
    },
    {
      ...page(r.privacy, 'privacy', seo.privacy.label, seo.privacy.title, seo.privacy.description),
      noindex: true,
    },
  ];
  // The terms of sale are published in French only.
  if (locale === 'fr')
    list.push(page(r.terms, 'terms', seo.terms.label, seo.terms.title, seo.terms.description));
  return list;
}

// Every page's address, per language, from the static index alone: enough for the language
// alternates and the redirects before a catalogue has loaded.
type Slot = { kind: PageKind; id?: string; path: string };
function addresses(locale: Locale): Slot[] {
  const src = routeSources[locale];
  const r = routesFor(locale, src);
  const one = (kind: PageKind, path: string): Slot => ({ kind, path });
  const each = (kind: PageKind, list: { id: string }[], to: (id: string) => string) =>
    list.map((e): Slot => ({ kind, id: e.id, path: to(e.id) }));
  return [
    one('home', r.home),
    one('services', r.services),
    ...each('service', src.services, r.service),
    ...each('work', src.works, r.work),
    one('applications', r.applications),
    ...each('application', src.applications, r.application),
    one('studies', r.studies),
    ...each('study', src.studies, r.study),
    one('innovations', r.innovations),
    ...each('innovation', src.innovations, r.innovation),
    one('about', r.about),
    one('team', r.team),
    ...each(
      'person',
      src.people.filter((p) => p.slug),
      r.person,
    ),
    one('publications', r.publications),
    one('partners', r.partners),
    one('resources', r.resources),
    ...each('article', src.resources, r.resource),
    one('contact', r.contact),
    one('legal', r.legal),
    one('privacy', r.privacy),
    ...(locale === 'fr' ? [one('terms', r.terms)] : []),
  ];
}
const slots = Object.fromEntries(locales.map((l) => [l, addresses(l)])) as Record<Locale, Slot[]>;
/** Every page address, in every language (for the preview server). */
export const pagePaths = locales.flatMap((l) => slots[l].map((t) => t.path));

const built: Partial<Record<Locale, PageMeta[]>> = {};
/** The pages of a language whose catalogue is loaded, each paired with its counterparts. */
function pagesOf(locale: Locale): PageMeta[] {
  return (built[locale] ??= buildPages(locale, catalog(locale)).map((page) => {
    for (const l of locales) {
      const twin = slots[l].find((t) => t.kind === page.kind && t.id === page.id);
      if (twin) page.alternates[l] = twin.path;
    }
    return page;
  }));
}

/** Every page of every language (server side, once both catalogues are loaded). Checks that the
 *  static index of addresses matches the catalogues. */
export function allPages(): PageMeta[] {
  const list = locales.flatMap(pagesOf);
  for (const locale of locales) {
    const expected = slots[locale].map((t) => t.path).sort();
    const actual = list
      .filter((p) => p.locale === locale)
      .map((p) => p.path)
      .sort();
    if (expected.join() !== actual.join())
      throw new Error(`content/site.ts does not match the ${locale} catalogue.`);
  }
  return list;
}

// Former addresses of ldgenx.fr and ldgenx.com (English pages now under /en), with the page
// that replaces each of them. Addresses that differ from a page only by their capitals are
// served by the host rules alone (see scripts/prerender.mjs).
export const redirects: Record<string, string> = {
  '/equipe': bases.fr.team,
  '/publications': bases.fr.publications,
  // The renewable-energy application now covers onshore wind and solar as well.
  '/applications/energies-marines-renouvelables': `${bases.fr.applications}/energies-renouvelables`,
  '/en/applications/marine-renewable-energy': `${bases.en.applications}/renewable-energy`,
  '/en/publications': bases.en.publications,
  '/partenaires': bases.fr.partners,
  '/partenaires-2': bases.fr.partners,
  '/a-propos/innovation': bases.fr.innovations,
  '/cgvs': bases.fr.terms,
  '/blog': bases.fr.resources,
  '/actualites': bases.fr.resources,
  '/Services': bases.fr.services,
  '/a-propos/Services': bases.fr.services,
  '/applications/Services': bases.fr.services,
  '/cgvs/Services': bases.fr.services,
  '/equipe/Services': bases.fr.services,
  '/services/Services': bases.fr.services,
  '/en/team': bases.en.team,
  '/en/a-propos': bases.en.about,
  '/en/partners': bases.en.partners,
  '/en/partenaires-2': bases.en.partners,
  '/en/about-us/innovation': bases.en.innovations,
  '/en/Services': bases.en.services,
  '/en/about-us/Services': bases.en.services,
  '/en/applications/Services': bases.en.services,
  '/en/services/Services': bases.en.services,
  '/en/team/Services': bases.en.services,
};

// Should ldgenx.com point to this site, its addresses (the English pages without /en) lead to
// the English pages, except where a French page already answers at the same address.
const everyAddress = locales.flatMap((l) => slots[l].map((t) => t.path.toLowerCase()));
for (const page of slots.en) {
  const old = page.path.slice('/en'.length);
  if (old && !everyAddress.includes(old.toLowerCase()) && !(old in redirects))
    redirects[old] = page.path;
}

/** The language of the page shown at an address, redirects followed. */
export function localeAt(path: string): Locale {
  const normalized = path.replace(/\/+$/, '') || '/';
  return localeOf(redirects[normalized] || normalized);
}

export function getPage(path: string): PageMeta {
  const normalized = path.replace(/\/+$/, '') || '/';
  const target = redirects[normalized] || normalized;
  const locale = localeOf(target);
  const found = pagesOf(locale).find((p) => p.path === target);
  if (found) return found;
  const t = catalog(locale).ui.notFound;
  return {
    path: normalized,
    label: t.label,
    kind: 'not-found',
    title: t.metaTitle,
    description: t.metaDescription,
    noindex: true,
    locale,
    alternates: {},
  };
}

export function breadcrumbs(meta: PageMeta) {
  const home = bases[meta.locale].home;
  const crumbs = [{ name: catalog(meta.locale).ui.common.home, path: home }];
  const pages = pagesOf(meta.locale);
  if (meta.path === home) return crumbs;
  const parentPath =
    meta.kind === 'person'
      ? bases[meta.locale].team
      : meta.path.slice(0, meta.path.lastIndexOf('/'));
  const chain: PageMeta[] = [];
  let parent = pages.find((p) => p.path === parentPath);
  while (parent && parent.path !== home) {
    chain.unshift(parent);
    const up = parent.path.slice(0, parent.path.lastIndexOf('/'));
    parent = pages.find((p) => p.path === up);
  }
  for (const p of chain) crumbs.push({ name: p.label, path: p.path });
  crumbs.push({ name: meta.label, path: meta.path });
  return crumbs;
}

export function structuredData(meta: PageMeta) {
  const organization = {
    '@type': 'Organization',
    '@id': `${company.origin}/#organization`,
    name: company.name,
    url: company.origin,
    logo: `${company.origin}/brand/full.png`,
    email: company.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Station Ifremer, 51 route de Maguelone',
      postalCode: '34250',
      addressLocality: 'Palavas-les-Flots',
      addressCountry: 'FR',
    },
    founder: [
      { '@type': 'Person', name: 'Maeva Leitwein' },
      { '@type': 'Person', name: 'Emilie Delpuech' },
    ],
  };
  const graph: Record<string, unknown>[] = [
    organization,
    {
      '@type': 'WebSite',
      '@id': `${company.origin}/#website`,
      url: company.origin,
      name: company.name,
      inLanguage: meta.locale === 'en' ? 'en' : 'fr-FR',
      publisher: { '@id': organization['@id'] },
    },
    {
      '@type': 'WebPage',
      '@id': `${company.origin}${meta.path}#webpage`,
      url: company.origin + meta.path,
      name: meta.title,
      description: meta.description,
      inLanguage: meta.locale === 'en' ? 'en' : 'fr-FR',
      isPartOf: { '@id': `${company.origin}/#website` },
    },
  ];
  if (meta.path !== '/')
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs(meta).map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: company.origin + c.path,
      })),
    });
  if (meta.kind === 'service')
    graph.push({
      '@type': 'Service',
      name: meta.label,
      serviceType: meta.label,
      description: meta.description,
      url: company.origin + meta.path,
      provider: { '@id': organization['@id'] },
    });
  if (meta.kind === 'article')
    graph.push({
      '@type': 'Article',
      headline: meta.label,
      description: meta.description,
      inLanguage: meta.locale === 'en' ? 'en' : 'fr-FR',
      author: { '@id': organization['@id'] },
      publisher: { '@id': organization['@id'] },
      mainEntityOfPage: company.origin + meta.path,
      ...(meta.image && { image: `${company.origin}${imageUrl(meta.image)}` }),
    });
  if (meta.kind === 'team' || meta.kind === 'person') {
    catalog(meta.locale)
      .people.filter((p) => meta.kind === 'team' || p.id === meta.id)
      .forEach((p) =>
        graph.push({
          '@type': 'Person',
          name: p.name.replace(/^Dr /, ''),
          jobTitle: p.title,
          worksFor: { '@id': organization['@id'] },
        }),
      );
  }
  // The articles listed on the research page, as they are published (authors, journal, DOI).
  if (meta.kind === 'publications')
    for (const p of catalog(meta.locale).research.publications)
      graph.push({
        '@type': 'ScholarlyArticle',
        headline: p.title,
        name: p.title,
        author: p.authors.map((name) => ({ '@type': 'Person', name })),
        datePublished: String(p.year),
        isPartOf: { '@type': 'Periodical', name: p.journal },
        sameAs: `https://doi.org/${p.doi}`,
        identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: p.doi },
        inLanguage: 'en',
      });
  return { '@context': 'https://schema.org', '@graph': graph };
}

export const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
export function renderHead(meta: PageMeta) {
  const title = escapeHtml(meta.title),
    description = escapeHtml(meta.description),
    url = escapeHtml(company.origin + meta.path);
  return `<title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="robots" content="${meta.noindex ? 'noindex, follow' : 'index, follow'}" />
    <link rel="canonical" href="${url}" />
    ${Object.entries(meta.alternates)
      .map(
        ([l, p]) =>
          `<link rel="alternate" hreflang="${l}" href="${escapeHtml(company.origin + p)}" />`,
      )
      .join('\n    ')}
    ${meta.alternates.fr ? `<link rel="alternate" hreflang="x-default" href="${escapeHtml(company.origin + meta.alternates.fr)}" />` : ''}
    ${meta.kind === 'home' ? heroPosterPreload : ''}
    <meta property="og:locale" content="${catalog(meta.locale).ui.ogLocale}" />
    <meta property="og:site_name" content="LDgenX" />
    <meta property="og:type" content="${meta.kind === 'article' ? 'article' : 'website'}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    ${meta.image ? `<meta property="og:image" content="${company.origin}${imageUrl(meta.image)}" />` : ''}
    <meta name="twitter:card" content="${meta.image ? 'summary_large_image' : 'summary'}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    ${meta.image ? `<meta name="twitter:image" content="${company.origin}${imageUrl(meta.image)}" />` : ''}
    <script id="ldgenx-schema" type="application/ld+json">${JSON.stringify(structuredData(meta)).replace(/</g, '\\u003c')}</script>`;
}
