import { catalog, type Catalog } from '../content/catalog';
import { company, routeSources } from '../content/site';
import { imageUrl, socialImageUrl } from './images';
import { heroPosterPreload } from './hero';
import { bases, localeOf, locales, routesFor, type Locale } from './routes';
import { listedExpertises } from './expertises';

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
  | 'publication'
  | 'faq'
  | 'glossary'
  | 'sitemap'
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

/** A description cut at a word, within the length search engines display. */
export function clip(text: string, max = 158) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:–-]+$/, '')}…`;
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
    page(r.home, 'home', seo.home.label, seo.home.title, seo.home.description, 'equipe-maxime'),
    page(
      r.services,
      'services',
      seo.services.label,
      seo.services.title,
      seo.services.description,
      'schema-sequencage',
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
        seo.article.title(s.seoTitle ?? s.title.replace(/\.$/, '')),
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
      'equipe-maxime',
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
    page(
      r.about,
      'about',
      seo.about.label,
      seo.about.title,
      seo.about.description,
      'equipe-maxime',
    ),
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
    ...c.research.publications.map((p) =>
      page(
        r.publication(p.id),
        'publication',
        p.seoTitle,
        seo.publication.title(p.seoTitle),
        clip(p.summary),
        p.figures[0]?.image,
        p.id,
      ),
    ),
    page(r.faq, 'faq', seo.faq.label, seo.faq.title, seo.faq.description),
    page(r.glossary, 'glossary', seo.glossary.label, seo.glossary.title, seo.glossary.description),
    page(r.siteMap, 'sitemap', seo.siteMap.label, seo.siteMap.title, seo.siteMap.description),
    page(r.partners, 'partners', seo.partners.label, seo.partners.title, seo.partners.description),
    page(
      r.resources,
      'resources',
      seo.resources.label,
      seo.resources.title,
      seo.resources.description,
      'bioinformatique-client',
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
    ...each('publication', src.publications, r.publication),
    one('faq', r.faq),
    one('glossary', r.glossary),
    one('sitemap', r.siteMap),
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
  '/services/recherche-developpement': '/applications/recherche-publique-privee',
  '/en/services/research-development': '/en/applications/public-private-research',
  '/services/research-development': '/en/applications/public-private-research',
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
    meta.kind === 'service' && meta.id === 'materiel'
      ? routesFor(meta.locale, catalog(meta.locale)).service('adn-environnemental-adne')
      : meta.kind === 'person'
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

// The page in structured data, for search engines and AI assistants: one graph per page, whose
// nodes share stable identifiers across the site (the organisation, its people, its services,
// its articles), so the pages describe a single, connected entity.
const lang = (locale: Locale) => (locale === 'en' ? 'en' : 'fr-FR');
const node = (id: string) => ({ '@id': id });
const ORG = `${company.origin}/#organization`;
const SITE = `${company.origin}/#website`;
const personId = (id: string) => `${company.origin}/#person-${id}`;
const plain = (text: string) => text.replace(/\*/g, '').replace(/\n/g, ' ');

function organization(locale: Locale) {
  const c = catalog(locale);
  const r = routesFor(locale, c);
  return {
    '@type': ['Organization', 'ProfessionalService'],
    '@id': ORG,
    name: company.name,
    legalName: company.legalName,
    url: company.origin,
    logo: {
      '@type': 'ImageObject',
      '@id': `${company.origin}/#logo`,
      url: `${company.origin}/brand/full.png`,
    },
    image: `${company.origin}${socialImageUrl('equipe-maxime')}`,
    description: c.ui.seo.home.description,
    slogan: plain(c.ui.hero.lines.flat().join(' ')).replace(/\s+/g, ' ').trim(),
    email: company.email,
    foundingDate: company.foundingDate,
    founder: c.people
      .filter((p) => company.founders.includes(p.id))
      .map((p) => node(personId(p.id))),
    employee: c.people.map((p) => node(personId(p.id))),
    identifier: { '@type': 'PropertyValue', propertyID: 'SIREN', value: company.siren },
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.street,
      postalCode: company.postalCode,
      addressLocality: company.locality,
      addressRegion: 'Occitanie',
      addressCountry: 'FR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: company.geo[0], longitude: company.geo[1] },
    location: {
      '@type': 'Place',
      name: company.site,
      address: {
        '@type': 'PostalAddress',
        streetAddress: company.street,
        postalCode: company.postalCode,
        addressLocality: company.locality,
        addressCountry: 'FR',
      },
    },
    areaServed: { '@type': 'Country', name: 'France' },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: locale === 'en' ? 'customer service' : 'service client',
      email: company.email,
      url: company.origin + r.contact,
      availableLanguage: ['fr', 'en'],
    },
    sameAs: [company.linkedin],
    award: c.ui.seo.organization.award,
    knowsAbout: c.ui.seo.organization.knowsAbout,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: c.ui.seo.services.label,
      itemListElement: listedExpertises(c.services).map((s) => ({
        '@type': 'Offer',
        itemOffered: node(`${company.origin}${r.service(s.id)}#service`),
      })),
    },
  };
}

function person(locale: Locale, id: string) {
  const c = catalog(locale);
  const r = routesFor(locale, c);
  const p = c.people.find((x) => x.id === id)!;
  const service = c.services.find((s) => s.id === p.service);
  return {
    '@type': 'Person',
    '@id': personId(p.id),
    name: p.name.replace(/^Dr /, ''),
    ...(p.name.startsWith('Dr ') && { honorificPrefix: 'Dr' }),
    jobTitle: p.title,
    description: p.bio,
    image: `${company.origin}${imageUrl(p.photo)}`,
    worksFor: node(ORG),
    ...(p.slug && { url: company.origin + r.person(p.id) }),
    ...(service && { knowsAbout: service.title }),
    ...(p.orcid && {
      sameAs: [`https://orcid.org/${p.orcid}`],
      identifier: { '@type': 'PropertyValue', propertyID: 'ORCID', value: p.orcid },
    }),
  };
}

function article(locale: Locale, id: string) {
  const c = catalog(locale);
  const r = routesFor(locale, c);
  const p = c.research.publications.find((x) => x.id === id)!;
  const url = company.origin + r.publication(p.id);
  return {
    '@type': 'ScholarlyArticle',
    '@id': `${url}#article`,
    headline: p.title,
    name: p.title,
    ...(plain(p.readingTitle) !== p.title && { alternativeHeadline: plain(p.readingTitle) }),
    description: p.summary,
    url,
    sameAs: `https://doi.org/${p.doi}`,
    identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: p.doi },
    datePublished: p.online ?? String(p.year),
    inLanguage: 'en',
    isPartOf: { '@type': 'Periodical', name: p.journal },
    author: p.authors.map((name) => {
      const member = c.people.find(
        (m) => p.members.includes(m.id) && name.startsWith(m.name.split(' ').pop()!),
      );
      return member ? node(personId(member.id)) : { '@type': 'Person', name };
    }),
    ...(p.themes.length > 0 && {
      keywords: p.themes.map((t) => c.ui.research.themes[t]).join(', '),
    }),
    about: [
      ...c.services
        .filter((s) => p.services.includes(s.id))
        .map((s) => node(`${company.origin}${r.service(s.id)}#service`)),
      ...c.applications
        .filter((application) => p.applications?.includes(application.id))
        .map((application) => ({
          '@type': 'Thing',
          name: application.title,
          url: company.origin + r.application(application.id),
        })),
    ],
    ...(p.licence.startsWith('CC BY') && {
      license: 'https://creativecommons.org/licenses/by/4.0/',
    }),
  };
}

const pageType: Partial<Record<PageKind, string>> = {
  services: 'CollectionPage',
  applications: 'CollectionPage',
  studies: 'CollectionPage',
  innovations: 'CollectionPage',
  resources: 'CollectionPage',
  publications: 'CollectionPage',
  team: 'CollectionPage',
  about: 'AboutPage',
  contact: 'ContactPage',
  person: 'ProfilePage',
  publication: 'ItemPage',
  faq: 'FAQPage',
};

export function structuredData(meta: PageMeta, lastmod?: string) {
  const c = catalog(meta.locale);
  const r = routesFor(meta.locale, c);
  const url = company.origin + meta.path;
  const inLanguage = lang(meta.locale);
  const graph: Record<string, unknown>[] = [
    organization(meta.locale),
    {
      '@type': 'WebSite',
      '@id': SITE,
      url: company.origin,
      name: company.name,
      alternateName: c.ui.seo.organization.alternateName,
      inLanguage: ['fr-FR', 'en'],
      publisher: node(ORG),
    },
  ];
  const page: Record<string, unknown> = {
    '@type': pageType[meta.kind] ?? 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: meta.title,
    description: meta.description,
    inLanguage,
    isPartOf: node(SITE),
    publisher: node(ORG),
    ...(meta.image && {
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: `${company.origin}${imageUrl(meta.image)}`,
      },
    }),
    ...(meta.path !== bases[meta.locale].home && { breadcrumb: node(`${url}#breadcrumb`) }),
    ...(lastmod && { dateModified: lastmod }),
  };
  graph.push(page);
  if (meta.path !== bases[meta.locale].home)
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: breadcrumbs(meta).map((crumb, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: crumb.name,
        item: company.origin + crumb.path,
      })),
    });

  const service = meta.kind === 'service' && c.services.find((s) => s.id === meta.id);
  if (service) {
    graph.push({
      '@type': 'Service',
      '@id': `${url}#service`,
      name: service.title,
      serviceType: service.title,
      description: service.intro,
      url,
      image: `${company.origin}${imageUrl(service.image)}`,
      provider: node(ORG),
      areaServed: { '@type': 'Country', name: 'France' },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: c.ui.expertisePage.prestationsEyebrow,
        itemListElement: service.prestations.map((name) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name },
        })),
      },
    });
    page.mainEntity = node(`${url}#service`);
    // The species for which primers and probes are held, as taxa.
    if (service.id === 'tests-adn-cibles')
      graph.push({
        '@type': 'ItemList',
        '@id': `${url}#species`,
        name: c.customAssay.targetsLabel,
        numberOfItems: c.customAssay.targets.length,
        itemListElement: c.customAssay.targets.map((x, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Taxon',
            name: x.latin,
            alternateName: x.searchNames,
            taxonRank: 'species',
          },
        })),
      });
  }
  const sector = meta.kind === 'application' && c.applications.find((s) => s.id === meta.id);
  if (sector) {
    page.about = { '@type': 'Thing', name: sector.title, description: sector.scope };
    page.mentions = sector.services.map((id) => node(`${company.origin}${r.service(id)}#service`));
  }
  const study = meta.kind === 'study' && c.studies.find((s) => s.id === meta.id);
  if (study) {
    const client = study.facts.find((f) => /^(Commanditaire|Client)$/.test(f.label))?.value;
    graph.push({
      '@type': 'Article',
      '@id': `${url}#study`,
      headline: plain(study.title),
      description: study.subtitle,
      inLanguage,
      image: `${company.origin}${imageUrl(study.image)}`,
      author: node(ORG),
      publisher: node(ORG),
      mainEntityOfPage: node(`${url}#webpage`),
      about: node(`${company.origin}${r.service(study.service)}#service`),
      ...(client && { funder: { '@type': 'Organization', name: client } }),
      ...(study.source &&
        !/ldgenx\.(fr|com)/.test(study.source) && {
          isBasedOn: { '@type': 'CreativeWork', url: study.source },
        }),
    });
  }
  const work = meta.kind === 'work' && c.works.find((w) => w.id === meta.id);
  if (work)
    graph.push({
      '@type': 'Article',
      '@id': `${url}#work`,
      headline: work.title,
      description: work.summary,
      inLanguage,
      image: `${company.origin}${imageUrl(work.image)}`,
      author: node(ORG),
      publisher: node(ORG),
      mainEntityOfPage: node(`${url}#webpage`),
    });
  const project = meta.kind === 'innovation' && c.innovations.find((x) => x.id === meta.id);
  if (project)
    graph.push({
      '@type': 'ResearchProject',
      '@id': `${url}#project`,
      name: project.title,
      description: project.intro,
      url,
      parentOrganization: node(ORG),
    });
  if (meta.kind === 'article') {
    const resource = c.resources.find((x) => x.id === meta.id)!;
    graph.push({
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: plain(resource.title),
      description: resource.intro,
      inLanguage,
      author: node(ORG),
      publisher: node(ORG),
      mainEntityOfPage: node(`${url}#webpage`),
      ...(meta.image && { image: `${company.origin}${socialImageUrl(meta.image)}` }),
    });
  }
  if (meta.kind === 'team' || meta.kind === 'about')
    for (const p of c.people) graph.push(person(meta.locale, p.id));
  if (meta.kind === 'person' && meta.id) {
    graph.push(person(meta.locale, meta.id));
    page.mainEntity = node(personId(meta.id));
  }
  if (meta.kind === 'publications') {
    page.mainEntity = {
      '@type': 'ItemList',
      numberOfItems: c.research.publications.length,
      itemListElement: c.research.publications.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: company.origin + r.publication(p.id),
        name: p.title,
      })),
    };
  }
  if (meta.kind === 'publication' && meta.id) {
    const p = c.research.publications.find((x) => x.id === meta.id)!;
    graph.push(article(meta.locale, meta.id));
    for (const id of p.members) graph.push(person(meta.locale, id));
    page.mainEntity = node(`${url}#article`);
  }
  if (meta.kind === 'faq')
    page.mainEntity = c.knowledge.faq.groups.flatMap((g) =>
      g.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    );
  if (meta.kind === 'glossary')
    graph.push({
      '@type': 'DefinedTermSet',
      '@id': `${url}#glossary`,
      name: c.knowledge.glossary.eyebrow,
      inLanguage,
      hasDefinedTerm: c.knowledge.glossary.terms.map((x) => ({
        '@type': 'DefinedTerm',
        '@id': `${url}#${x.id}`,
        name: x.term,
        ...(x.also && { alternateName: x.also }),
        description: x.definition,
        url: `${url}#${x.id}`,
        inDefinedTermSet: node(`${url}#glossary`),
      })),
    });
  return { '@context': 'https://schema.org', '@graph': graph };
}

/** Open Graph locales, known without loading the other language's catalogue. */
const ogLocales: Record<Locale, string> = { fr: 'fr_FR', en: 'en_GB' };

export const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
/** The page's head: title, description, robots, canonical, language versions, social cards and
 *  structured data. `lastmod` (server only) dates the page's last change. */
export function renderHead(meta: PageMeta, lastmod?: string) {
  const title = escapeHtml(meta.title),
    description = escapeHtml(meta.description),
    url = escapeHtml(company.origin + meta.path);
  const ui = catalog(meta.locale).ui;
  // Every page shares a picture; the team at work stands in for pages without their own.
  const image = `${company.origin}${socialImageUrl(meta.image ?? 'equipe-maxime')}`;
  const imageAlt = escapeHtml(meta.label);
  return `<title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="robots" content="${meta.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}" />
    <link rel="canonical" href="${url}" />
    ${Object.entries(meta.alternates)
      .map(
        ([l, p]) =>
          `<link rel="alternate" hreflang="${l}" href="${escapeHtml(company.origin + p)}" />`,
      )
      .join('\n    ')}
    ${meta.alternates.fr ? `<link rel="alternate" hreflang="x-default" href="${escapeHtml(company.origin + meta.alternates.fr)}" />` : ''}
    ${meta.kind === 'home' ? heroPosterPreload : ''}
    ${company.verification.google ? `<meta name="google-site-verification" content="${company.verification.google}" />` : ''}
    ${company.verification.bing ? `<meta name="msvalidate.01" content="${company.verification.bing}" />` : ''}
    <meta property="og:locale" content="${ui.ogLocale}" />
    ${Object.keys(meta.alternates)
      .filter((l) => l !== meta.locale)
      .map((l) => `<meta property="og:locale:alternate" content="${ogLocales[l as Locale]}" />`)
      .join('')}
    <meta property="og:site_name" content="LDgenX" />
    <meta property="og:type" content="${['article', 'publication', 'study', 'work'].includes(meta.kind) ? 'article' : 'website'}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:alt" content="${imageAlt}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <script id="ldgenx-schema" type="application/ld+json">${JSON.stringify(structuredData(meta, lastmod)).replace(/</g, '\\u003c')}</script>`;
}
