import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { App } from './App';
import { getPage, pages, renderHead, redirects, companyOrigin } from './lib/server-exports';

export { pages, redirects, companyOrigin };
export function render(path: string) {
  const meta = getPage(path);
  return {
    html: renderToString(
      <StaticRouter location={path}>
        <App />
      </StaticRouter>,
    ),
    head: renderHead(meta),
  };
}
