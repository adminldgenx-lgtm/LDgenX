import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { catalog, type Catalog } from './content/catalog';
import { routeSources } from './content/site';
import { routesFor, type Locale, type Routes } from './lib/routes';
import { useEditorial } from './editorial/context';

// The language of the page being shown, and what follows from it: its catalogue and its
// addresses. Set once per page by App from the address.
const LocaleContext = createContext<Locale>('fr');

const routeTables: Record<Locale, Routes> = {
  fr: routesFor('fr', routeSources.fr),
  en: routesFor('en', routeSources.en),
};

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}
export const useLocale = () => useContext(LocaleContext);
export function useCatalog(): Catalog {
  const locale = useContext(LocaleContext), base = catalog(locale), { index } = useEditorial();
  return useMemo(() => {
    const rows = index.filter((r) => r.locale === locale && r.legacyId);
    if (!rows.length) return base;
    const find = (kind: string, id: string) => rows.find((r) => r.kind === kind && r.legacyId === id);
    const cover = (row: typeof rows[number], previous: string) => row.cover ? `cms-entry:${row.id}` : previous;
    return { ...base,
      resources: base.resources.filter((s) => find('article', s.id)?.status !== 'withdrawn').map((s) => { const r = find('article', s.id); return r ? { ...s, title: r.title, intro: r.summary, category: r.category, image: cover(r, s.image) } : s; }),
      studies: base.studies.filter((s) => find('study', s.id)?.status !== 'withdrawn').map((s) => { const r = find('study', s.id); return r ? { ...s, title: r.title, subtitle: r.summary, category: r.category, image: cover(r, s.image) } : s; }),
      research: { ...base.research,
        publications: base.research.publications.filter((p) => find('publication', p.id)?.status !== 'withdrawn').map((p) => { const r = find('publication', p.id); return r ? { ...p, title: r.title.replace(/\*/g, ''), readingTitle: r.title, seoTitle: r.seoTitle || r.title.replace(/\*/g, ''), summary: r.summary } : p; }),
        featured: base.research.featured.filter((p) => find('publication', p.publication)?.status !== 'withdrawn'),
      },
    };
  }, [base, index, locale]);
}
export const useRoutes = (): Routes => routeTables[useContext(LocaleContext)];
export const getRoutes = (locale: Locale) => routeTables[locale];
export type { Locale };
