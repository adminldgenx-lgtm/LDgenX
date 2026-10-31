import { Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { App } from './App';
import {
  getPage,
  allPages,
  renderHead,
  redirects,
  companyOrigin,
  company,
} from './lib/server-exports';
import { catalog, catalogs, loadCatalog } from './content/catalog';
import { locales } from './lib/routes';

import type { PageMeta } from './lib/pages';
import { EditorialProvider, resolveEditorialMeta, type EditorialBootstrap } from './editorial/context';
import { overlayCatalog } from './editorial/overlay';

// The server renders every language: callers wait for `ready` (both catalogues loaded) before
// reading `pages` or rendering.
export let pages: PageMeta[] = [];
export const ready = Promise.all(locales.map(loadCatalog)).then(() => {
  pages = allPages();
});
export { redirects, companyOrigin, catalogs, company, getPage, renderHead };
export { editorialMeta } from './editorial/meta';
export { legacyDocument } from './editorial/legacy';
export { validateDocument, publicationIssues, cardFields } from '../supabase/functions/_shared/editorial';
export function render(path: string, editorial: EditorialBootstrap = { index: [], document: null }) {
  const meta = resolveEditorialMeta(path, editorial.index);
  const documents = editorial.document ? { [editorial.document.path]: editorial.document } : {};
  return {
    html: renderToString(
      <StaticRouter location={path}>
        <Suspense fallback={null}>
          <EditorialProvider initial={editorial}><App /></EditorialProvider>
        </Suspense>
      </StaticRouter>,
    ),
    head: renderHead(
      meta,
      editorial.document?.updatedAt.slice(0, 10),
      overlayCatalog(catalog(meta.locale), meta.locale, editorial.index, documents),
    ),
  };
}
