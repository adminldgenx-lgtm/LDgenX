// What every page needs before its catalogue arrives: the company's details and the address
// of each entity in each language. Catalogues are loaded per language (see catalog.ts); this
// index keeps routes, language alternates and redirects available without them. The server
// build checks that it matches the catalogues (see allPages in lib/pages.ts).
import type { Locale, RouteSource } from '../lib/routes';
import { indexNowKey, productionOrigin } from '../../supabase/functions/_shared/site';

export const portalEnabled = import.meta.env?.VITE_PORTAL_ENABLED !== '0';

export const company = {
  name: 'LDgenX',
  origin: productionOrigin,
  email: 'info@ldgenx.fr',
  address: 'Station Ifremer · 51 route de Maguelone',
  city: '34250 Palavas-les-Flots, France',
  appointment: portalEnabled
    ? '/espace/reserver'
    : 'https://cal.com/ldgenx-echange/decouverte',
  english: `${productionOrigin}/en`,
  linkedin: 'https://www.linkedin.com/company/ldgenx/',
  // Public registry (recherche-entreprises.api.gouv.fr, October 2026) and OpenStreetMap.
  legalName: 'LDgenX SAS',
  siren: '952193837',
  foundingDate: '2023-05-01',
  founders: ['maeva-leitwein', 'emilie-delpuech'],
  site: 'Station Ifremer de Palavas-les-Flots',
  street: '51 route de Maguelone',
  postalCode: '34250',
  locality: 'Palavas-les-Flots',
  geo: [43.52, 3.9103] as [number, number],
  // Codes from Google Search Console and Bing Webmaster Tools, once the site is verified.
  verification: { google: '', bing: '' },
  // IndexNow key (Bing, Yandex, Seznam, Naver): the file /<key>.txt holds it; see
  // scripts/indexnow.mjs.
  indexNowKey,
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
  'tests-adn-cibles',
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
  'genomique-vanneau-huppe',
  'demogenetique-ours-pyrenees',
  'adne-estuaire-milieu-turbide',
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
  ['damien-crestel', 'dr-damien-crestel'],
];
// Articles of the research page, newest first: the French address is the id.
const publications: Pairs = [
  [
    'levure-replication-adn-polymerase-alpha-2026',
    'yeast-dna-replication-polymerase-alpha-2026',
  ],
  ['bar-cortisol-temperature-2026', 'sea-bass-cortisol-temperature-2026'],
  ['bar-sex-ratio-temperature-gwas-2026', 'sea-bass-sex-ratio-gwas-2026'],
  [
    'bar-survie-larvaire-introgression-2026',
    'sea-bass-larval-survival-introgression-2026',
  ],
  [
    'poissons-tolerance-rechauffement-taille-2025',
    'fish-warming-tolerance-body-mass-2025',
  ],
  ['genomes-becasse-becassine-2025', 'woodcock-jack-snipe-genomes-2025'],
  ['bar-introgression-fitness-2025', 'sea-bass-introgression-fitness-2025'],
  [
    'bar-croissance-larvaire-temperature-2025',
    'sea-bass-larval-growth-temperature-2025',
  ],
  [
    'bar-selection-efficacite-alimentaire-2025',
    'sea-bass-feed-efficiency-selection-2025',
  ],
  [
    'bar-introgression-teneur-gras-2024',
    'sea-bass-introgression-muscle-fat-2024',
  ],
  [
    'bar-determinisme-sexe-energie-2024',
    'sea-bass-sex-determination-energy-2024',
  ],
  ['bar-temperature-femelles-2024', 'sea-bass-temperature-female-ratio-2024'],
  ['bar-resistance-vnn-2023', 'sea-bass-vnn-resistance-2023'],
  ['capelan-methylation-reproduction-2023', 'capelin-dna-methylation-2023'],
  ['truite-pigmentation-gwas-2023', 'brown-trout-pigmentation-gwas-2023'],
  [
    'saumon-coho-elevage-expression-2022',
    'coho-salmon-hatchery-expression-2022',
  ],
  ['omble-ascendance-repeuplement-2021', 'stocking-ancestry-landscape-2021'],
  ['porc-efficacite-alimentaire-gwas-2021', 'pig-feed-efficiency-gwas-2021'],
  ['saumon-coho-epigenome-germinal-2021', 'salmon-germline-epigenome-2021'],
  [
    'haplotypes-genomique-conservation-2020',
    'haplotypes-conservation-genomics-2020',
  ],
  [
    'omble-diversite-petites-populations-2020',
    'brook-charr-small-populations-2020',
  ],
  ['porc-prediction-genomique-2020', 'pig-genomic-prediction-2020'],
  [
    'omble-recombinaison-ascendance-2019',
    'brook-charr-recombination-ancestry-2019',
  ],
  ['truite-ressource-snp-2019', 'brown-trout-snp-array-2019'],
  ['truite-trois-ascendances-2018', 'brown-trout-three-way-admixture-2018'],
  ['truite-arc-en-ciel-san-francisco-2017', 'rainbow-trout-san-francisco-2017'],
  ['truite-carte-liaison-2017', 'brown-trout-linkage-map-2017'],
  ['truite-orb-diversite-2016', 'brown-trout-orb-diversity-2016'],
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
    publications: publications.map(([id]): [string, string] => [id, id]),
  },
  en: {
    services: [
      ['adn-environnemental-adne', 'environmental-dna-edna'],
      ['genomique-des-populations', 'population-genomics'],
      ['analyse-des-communautes-microbiennes', 'microbial-community-analysis'],
      ['selection', 'genomic-selection'],
      ['bioinformatique', 'bioinformatics'],
      ['sequencage-dpcr', 'sequencing-dpcr'],
      ['tests-adn-cibles', 'targeted-dna-tests-dpcr'],
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
      ['genomique-vanneau-huppe', 'northern-lapwing-genomics'],
      ['demogenetique-ours-pyrenees', 'pyrenean-brown-bear-demogenetics'],
      ['adne-estuaire-milieu-turbide', 'estuary-edna-turbid-water'],
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
      [
        'bioinformatique-question-biologique',
        'bioinformatics-biological-question',
      ],
      ['genomique-filiere-aquacole', 'genomics-aquaculture'],
    ],
    people,
    publications,
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
