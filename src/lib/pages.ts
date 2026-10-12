import { applications, services, studies, resources, innovations, company } from '../content/fr';
import { imageUrl } from './images';
import { heroPosterPreload } from './hero';

export type PageKind =
  | 'home'
  | 'services'
  | 'service'
  | 'applications'
  | 'application'
  | 'studies'
  | 'study'
  | 'innovations'
  | 'innovation'
  | 'about'
  | 'team'
  | 'partners'
  | 'resources'
  | 'article'
  | 'contact'
  | 'legal'
  | 'privacy'
  | 'not-found';
export interface PageMeta {
  path: string;
  title: string;
  description: string;
  label: string;
  kind: PageKind;
  slug?: string;
  image?: string;
  noindex?: boolean;
}
const page = (
  path: string,
  label: string,
  kind: PageKind,
  title: string,
  description: string,
  image?: string,
): PageMeta => ({ path, label, kind, title, description, image });

export const pages: PageMeta[] = [
  page(
    '/',
    'Accueil',
    'home',
    'Génomique appliquée & ADN environnemental | LDgenX',
    'LDgenX accompagne vos projets de biodiversité, d’agriculture et d’aquaculture, de l’échantillonnage à l’interprétation des données génomiques.',
    'laboratoire',
  ),
  page(
    '/services',
    'Expertises',
    'services',
    'Expertises en ADN et génomique appliquée | LDgenX',
    'ADN environnemental, génomique des populations, communautés microbiennes, bioinformatique, séquençage et dPCR : découvrez les expertises LDgenX.',
    'sequencage',
  ),
  ...services.map((s) => ({
    ...page(
      `/services/${s.slug}`,
      s.title,
      'service',
      `${s.title === 'Communautés microbiennes' ? 'Analyse des communautés microbiennes' : s.title} | LDgenX`,
      `${s.title} : ${s.short} Découvrez les approches et l’accompagnement LDgenX.`,
      s.image,
    ),
    slug: s.slug,
  })),
  page(
    '/applications',
    'Applications',
    'applications',
    'Applications de la génomique au vivant | LDgenX',
    'Explorez les applications de la génomique pour la biodiversité, l’aquaculture, l’agriculture, les bureaux d’études et la recherche.',
    'biodiversite',
  ),
  ...applications.map((s) => ({
    ...page(
      `/applications/${s.slug}`,
      s.title,
      'application',
      `${s.title} | LDgenX`,
      `${s.title} : les expertises LDgenX au service de vos enjeux, de l’échantillonnage à l’interprétation.`,
      s.image,
    ),
    slug: s.slug,
  })),
  page(
    '/etudes-de-cas',
    'Études de cas',
    'studies',
    'Études de cas en biodiversité et génomique | LDgenX',
    'Découvrez des études et champs d’application présentés par LDgenX : ichtyofaune, ADN environnemental, sélection génomique et microbiologie.',
    'environnement',
  ),
  ...studies.map((s) => ({
    ...page(
      `/etudes-de-cas/${s.slug}`,
      s.title,
      'study',
      `${s.title.replace(/\.$/, '')} | LDgenX`,
      s.subtitle,
      s.image,
    ),
    slug: s.slug,
  })),
  page(
    '/innovation',
    'Innovation',
    'innovations',
    'Innovation DeepTech : DNA EcoTrace & eDNAClock | LDgenX',
    'Explorez DNA EcoTrace et eDNAClock, les projets de recherche et développement LDgenX à la croisée de l’ADNe, du séquençage et de la bioinformatique.',
    'innovation',
  ),
  ...innovations.map((s) => ({
    ...page(
      `/innovation/${s.slug}`,
      s.title,
      'innovation',
      `${s.title} : ${s.slug === 'dna-ecotrace' ? 'ADNe et biodiversité' : 'ADNe et épigénétique'} | LDgenX`,
      s.intro,
      s.image,
    ),
    slug: s.slug,
  })),
  page(
    '/a-propos',
    'À propos',
    'about',
    'Une équipe DeepTech au service du vivant | LDgenX',
    'Découvrez LDgenX, entreprise française de génomique appliquée, son équipe scientifique, son approche et son écosystème.',
    'laboratoire',
  ),
  page(
    '/a-propos/equipe',
    'Équipe',
    'team',
    'L’équipe scientifique de LDgenX',
    'Maeva Leitwein, Emilie Delpuech et Maxime Lambert : des expertises complémentaires en génomique, bioinformatique et biologie moléculaire.',
  ),
  page(
    '/a-propos/partenaires',
    'Partenaires',
    'partners',
    'Partenaires et écosystème scientifique | LDgenX',
    'Les soutiens, l’écosystème scientifique et les organisations qui font confiance à LDgenX, présentés selon leur relation avec l’entreprise.',
  ),
  page(
    '/ressources',
    'Ressources',
    'resources',
    'Ressources & expertise en génomique | LDgenX',
    'Des repères pour comprendre l’ADN environnemental, la bioinformatique et les applications de la génomique en aquaculture.',
    'bioinformatique',
  ),
  ...resources.map((s) => ({
    ...page(
      `/ressources/${s.slug}`,
      s.title,
      'article',
      `${s.title.replace(/\.$/, '')} | LDgenX`,
      s.intro,
      s.image,
    ),
    slug: s.slug,
  })),
  page(
    '/contact',
    'Contact',
    'contact',
    'Parlons de votre projet scientifique | LDgenX',
    'Contactez LDgenX à Palavas-les-Flots pour votre projet en ADN environnemental, génomique ou bioinformatique. Échangez avec l’équipe scientifique.',
  ),
  {
    ...page(
      '/mentions-legales',
      'Mentions légales',
      'legal',
      'Mentions légales | LDgenX',
      'Informations légales de LDgenX SAS, entreprise de génomique appliquée, et coordonnées de contact.',
    ),
    noindex: true,
  },
  {
    ...page(
      '/politique-confidentialite',
      'Confidentialité',
      'privacy',
      'Politique de confidentialité | LDgenX',
      'Informations sur les données et la confidentialité lors de l’utilisation de ce site et de la préparation d’un e-mail à LDgenX.',
    ),
    noindex: true,
  },
];

export const redirects: Record<string, string> = {
  '/equipe': '/a-propos/equipe',
  '/partenaires': '/a-propos/partenaires',
  '/a-propos/innovation': '/innovation',
  '/services/selection': '/services/selection-genomique',
  '/blog': '/ressources',
  '/actualites': '/ressources',
};

export function getPage(path: string): PageMeta {
  const normalized = path.replace(/\/+$/, '') || '/';
  return (
    pages.find((p) => p.path === (redirects[normalized] || normalized)) || {
      path: normalized,
      label: 'Page introuvable',
      kind: 'not-found',
      title: 'Page introuvable | LDgenX',
      description:
        'Cette page n’existe pas. Retrouvez les expertises, applications et ressources de LDgenX.',
      noindex: true,
    }
  );
}

export function breadcrumbs(meta: PageMeta) {
  const crumbs = [{ name: 'Accueil', path: '/' }];
  if (meta.path !== '/') {
    const parent = '/' + meta.path.split('/')[1];
    if (parent !== meta.path) {
      const parentPage = pages.find((p) => p.path === parent);
      if (parentPage) crumbs.push({ name: parentPage.label, path: parent });
    }
    crumbs.push({ name: meta.label, path: meta.path });
  }
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
      inLanguage: 'fr-FR',
      publisher: { '@id': organization['@id'] },
    },
    {
      '@type': 'WebPage',
      '@id': `${company.origin}${meta.path}#webpage`,
      url: company.origin + meta.path,
      name: meta.title,
      description: meta.description,
      inLanguage: 'fr-FR',
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
      inLanguage: 'fr-FR',
      author: { '@id': organization['@id'] },
      publisher: { '@id': organization['@id'] },
      mainEntityOfPage: company.origin + meta.path,
      ...(meta.image && { image: `${company.origin}${imageUrl(meta.image)}` }),
    });
  if (meta.kind === 'team') {
    ['Maeva Leitwein', 'Emilie Delpuech', 'Maxime Lambert'].forEach((name) =>
      graph.push({ '@type': 'Person', name, worksFor: { '@id': organization['@id'] } }),
    );
  }
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
    <link rel="alternate" hreflang="fr" href="${url}" />
    ${meta.kind === 'home' ? heroPosterPreload : ''}
    <meta property="og:locale" content="fr_FR" />
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
