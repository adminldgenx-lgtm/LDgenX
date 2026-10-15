import type { Locale } from '../lib/routes';

// Each language's catalogue is its own chunk: a page loads only its language (see main.tsx),
// the other one arrives when the visitor switches. The server loads both (entry-server.tsx).
export type Catalog = typeof import('./catalog.fr').fr;

const loaders: Record<Locale, () => Promise<Catalog>> = {
  fr: () => import('./catalog.fr').then((m) => m.fr),
  en: () => import('./catalog.en').then((m) => m.en),
};
export const catalogs: Partial<Record<Locale, Catalog>> = {};
const pending: Partial<Record<Locale, Promise<Catalog>>> = {};

/** Loads a language's catalogue once; later calls return the same promise. */
export function loadCatalog(locale: Locale): Promise<Catalog> {
  return (pending[locale] ??= loaders[locale]().then((c) => (catalogs[locale] = c)));
}

/** A catalogue already loaded. */
export function catalog(locale: Locale): Catalog {
  const c = catalogs[locale];
  if (!c) throw new Error(`The ${locale} catalogue is not loaded.`);
  return c;
}
