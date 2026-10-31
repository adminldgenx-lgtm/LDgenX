import type { InternalLink } from '../content/types';

// Addresses of every page, in each language. French pages keep the addresses of ldgenx.fr;
// English pages live under /en and keep the page names of ldgenx.com. Entities are found by
// their `id` (the same in both languages) and addressed by their `slug` (each language’s own).

export type Locale = 'fr' | 'en';
export const locales: Locale[] = ['fr', 'en'];

export const bases = {
  fr: {
    home: '/',
    services: '/services',
    applications: '/applications',
    studies: '/etudes-de-cas',
    innovations: '/innovation',
    about: '/a-propos',
    team: '/a-propos/equipe',
    partners: '/a-propos/partenaires',
    resources: '/ressources',
    publications: '/recherche',
    faq: '/faq',
    glossary: '/glossaire',
    siteMap: '/plan-du-site',
    contact: '/contact',
    legal: '/mentions-legales',
    privacy: '/politique-confidentialite',
    terms: '/cgvs/cgvs',
    person: '/equipe',
    work: '/services',
  },
  en: {
    home: '/en',
    services: '/en/services',
    applications: '/en/applications',
    studies: '/en/case-studies',
    innovations: '/en/innovation',
    about: '/en/about-us',
    team: '/en/about-us/team',
    partners: '/en/about-us/partners',
    resources: '/en/resources',
    publications: '/en/research',
    faq: '/en/faq',
    glossary: '/en/glossary',
    siteMap: '/en/site-map',
    contact: '/en/contact',
    legal: '/en/legal-notice',
    privacy: '/en/privacy-policy',
    // The terms of sale exist in French only.
    terms: '/cgvs/cgvs',
    person: '/en/team',
    work: '/en/services',
  },
} satisfies Record<Locale, Record<string, string>>;

type Entity = { id: string; slug: string };
/** The parts of a catalogue the addresses depend on. */
export interface RouteSource {
  services: Entity[];
  applications: Entity[];
  studies: Entity[];
  works: Entity[];
  innovations: Entity[];
  resources: Entity[];
  people: Entity[];
  publications: Entity[];
}

/** The locale an address belongs to. */
export function localeOf(path: string): Locale {
  return path === '/en' || path.startsWith('/en/') ? 'en' : 'fr';
}

export function routesFor(locale: Locale, source: RouteSource) {
  const base = bases[locale];
  // Published items are not in the static tables: their id carries their own address.
  const slug = (list: Entity[], id: string) =>
    list.find((e) => e.id === id)?.slug ?? id.replace(/^cms:/, '');
  const routes = {
    ...base,
    service: (id: string) => `${base.services}/${slug(source.services, id)}`,
    application: (id: string) => `${base.applications}/${slug(source.applications, id)}`,
    study: (id: string) => `${base.studies}/${slug(source.studies, id)}`,
    work: (id: string) => `${base.work}/${slug(source.works, id)}`,
    innovation: (id: string) => `${base.innovations}/${slug(source.innovations, id)}`,
    resource: (id: string) => `${base.resources}/${slug(source.resources, id)}`,
    person: (id: string) => `${base.person}/${slug(source.people, id)}`,
    publication: (id: string) => `${base.publications}/${slug(source.publications, id)}`,
    /** An internal link resolved in this language, or an external address as it is. */
    link: (link: InternalLink): string =>
      link.kind === 'external' ? link.href : routes[link.kind](link.id),
  };
  return routes;
}
export type Routes = ReturnType<typeof routesFor>;
