import { Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { App } from './App';
import { getPage, allPages, renderHead, redirects, companyOrigin } from './lib/server-exports';
import { catalogs, loadCatalog } from './content/catalog';
import { locales } from './lib/routes';

import type { PageMeta } from './lib/pages';

// The server renders every language: callers wait for `ready` (both catalogues loaded) before
// reading `pages` or rendering.
export let pages: PageMeta[] = [];
export const ready = Promise.all(locales.map(loadCatalog)).then(() => {
  pages = allPages();
});
export { redirects, companyOrigin, catalogs };
export function render(path: string) {
  const meta = getPage(path);
  return {
    html: renderToString(
      <StaticRouter location={path}>
        <Suspense fallback={null}>
          <App />
        </Suspense>
      </StaticRouter>,
    ),
    head: renderHead(meta),
  };
}
