import { getPage, pagePaths, type PageMeta } from './pages';
import { localeOf, type Locale } from './routes';

export type FooterGroup =
  | 'explore'
  | 'services'
  | 'applications'
  | 'studies'
  | 'publications'
  | 'innovation'
  | 'company'
  | 'resources';

const groupOrder: FooterGroup[] = [
  'explore',
  'services',
  'applications',
  'studies',
  'publications',
  'innovation',
  'company',
  'resources',
];

function groupFor(page: PageMeta): FooterGroup {
  switch (page.kind) {
    case 'service':
      return page.id === 'materiel' ? 'explore' : 'services';
    case 'application':
      return 'applications';
    case 'study':
    case 'work':
      return 'studies';
    case 'publication':
    case 'publications':
      return 'publications';
    case 'innovation':
    case 'innovations':
      return 'innovation';
    case 'about':
    case 'team':
    case 'person':
    case 'partners':
    case 'legal':
    case 'privacy':
    case 'terms':
      return 'company';
    case 'resources':
    case 'article':
    case 'faq':
    case 'glossary':
      return 'resources';
    default:
      return 'explore';
  }
}

/** Real, current public pages only. Portal routes and historical redirects are not a directory. */
export function footerDirectory(locale: Locale) {
  const pages = pagePaths.filter((path) => localeOf(path) === locale).map(getPage);
  return groupOrder.map((key) => ({
    key,
    pages: pages.filter((page) => groupFor(page) === key),
  }));
}
