import { createContext, useContext, type ReactNode } from 'react';
import { catalog, type Catalog } from './content/catalog';
import { routeSources } from './content/site';
import { routesFor, type Locale, type Routes } from './lib/routes';
import { useEditorial } from './editorial/context';
import { overlayCatalog } from './editorial/overlay';

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
/** The catalogue of the language shown, with published content applied once per update. */
export function useCatalog(): Catalog {
  const locale = useContext(LocaleContext);
  const { index, documents, catalogues } = useEditorial();
  let current = catalogues.get(locale);
  if (!current) {
    current = overlayCatalog(catalog(locale), locale, index, documents);
    catalogues.set(locale, current);
  }
  return current;
}
export const useRoutes = (): Routes => routeTables[useContext(LocaleContext)];
export const getRoutes = (locale: Locale) => routeTables[locale];
export type { Locale };
