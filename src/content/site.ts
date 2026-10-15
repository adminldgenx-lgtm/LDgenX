// What every page needs before its catalogue arrives: the company's details and the address
// of each entity in each language. Catalogues are loaded per language (see catalog.ts); this
// index keeps routes, language alternates and redirects available without them. The server
// build checks that it matches the catalogues (see allPages in lib/pages.ts).
import type { Locale, RouteSource } from '../lib/routes';

export const company = {
  name: 'LDgenX',
  origin: 'https://www.ldgenx.fr',
  email: 'info@ldgenx.fr',
  address: 'Station Ifremer · 51 route de Maguelone',
  city: '34250 Palavas-les-Flots, France',
  appointment: 'https://cal.com/ldgenx-echange/decouverte',
  english: 'https://www.ldgenx.com/',
  linkedin: 'https://www.linkedin.com/company/ldgenx/',
};

type Pairs = [id: string, slug: string][];
const same = (ids: string[]): Pairs => ids.map((id) => [id, id]);

const services = [
  'adn-environnemental-adne',
  'genomique-des-populations',
  'analyse-des-communautes-microbiennes',
  'selection',
  'bioinformatique',
  'sequencage-dpcr',
  'recherche-developpement',
  'materiel',
];
/** Application sectors, in the order of the catalogues. */
export const applicationIds = [
  'biodiversite-conservation',
  'aquaculture-peche',
  'agriculture-agroecologie',
  'environnement-bureaux-d-etudes',
  'recherche-publique-privee',
  'energies-marines-renouvelables',
];
const studies = [
  'ichtyofaune-artois-picardie',
  'biodiversite-eolien-offshore',
  'communautes-microplastiques',
];
const works = ['conservation', 'tracabilite', 'selection-genomique'];
const innovations = ['dna-ecotrace', 'edna-clock'];
const resources = [
  'comprendre-adn-environnemental',
  'bioinformatique-question-biologique',
  'genomique-filiere-aquacole',
];
// People without a page of their own have an empty slug.
const people: Pairs = [
  ['maeva-leitwein', 'dr-maeva-leitwein'],
  ['emilie-delpuech', 'dr-emilie-delpuech'],
  ['maxime-lambert', ''],
  ['damien-crestel', ''],
];

const slugs: Record<Locale, Record<keyof RouteSource, Pairs>> = {
  fr: {
    services: same(services),
    applications: applicationIds.map((id): [string, string] => [
      id,
      id === 'energies-marines-renouvelables' ? 'energies-renouvelables' : id,
    ]),
    studies: same(studies),
    works: same(works),
    innovations: same(innovations),
    resources: same(resources),
    people,
  },
  en: {
    services: [
      ['adn-environnemental-adne', 'environmental-dna-edna'],
      ['genomique-des-populations', 'population-genomics'],
      ['analyse-des-communautes-microbiennes', 'microbial-community-analysis'],
      ['selection', 'genomic-selection'],
      ['bioinformatique', 'bioinformatics'],
      ['sequencage-dpcr', 'sequencing-dpcr'],
      ['recherche-developpement', 'research-development'],
      ['materiel', 'equipment'],
    ],
    applications: [
      ['biodiversite-conservation', 'biodiversity-conservation'],
      ['aquaculture-peche', 'aquaculture-fisheries'],
      ['agriculture-agroecologie', 'agriculture-agroecology'],
      ['environnement-bureaux-d-etudes', 'environment-consultancies'],
      ['recherche-publique-privee', 'public-private-research'],
      ['energies-marines-renouvelables', 'renewable-energy'],
    ],
    studies: [
      ['ichtyofaune-artois-picardie', 'artois-picardie-fish-survey'],
      ['biodiversite-eolien-offshore', 'offshore-wind-biodiversity'],
      ['communautes-microplastiques', 'microplastic-microbial-communities'],
    ],
    works: [
      ['conservation', 'conservation'],
      ['tracabilite', 'traceability'],
      ['selection-genomique', 'genomic-selection-page'],
    ],
    innovations: [
      ['dna-ecotrace', 'dna-ecotrace'],
      ['edna-clock', 'ednaclock'],
    ],
    resources: [
      ['comprendre-adn-environnemental', 'understanding-environmental-dna'],
      ['bioinformatique-question-biologique', 'bioinformatics-biological-question'],
      ['genomique-filiere-aquacole', 'genomics-aquaculture'],
    ],
    people,
  },
};

/** The addresses of every entity in a language, as `routesFor` expects them. */
export const routeSources = Object.fromEntries(
  Object.entries(slugs).map(([locale, kinds]) => [
    locale,
    Object.fromEntries(
      Object.entries(kinds).map(([kind, pairs]) => [
        kind,
        pairs.map(([id, slug]) => ({ id, slug })),
      ]),
    ),
  ]),
) as unknown as Record<Locale, RouteSource>;
