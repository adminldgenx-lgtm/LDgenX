import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { pagePaths, redirects } from './src/lib/pages';

// The client area and the administration are a second application (portal.html), served for
// every address under /espace and /admin. The development server always serves it; a build
// includes it only with LDGENX_PORTAL=1, once its backend is connected (docs/PORTAL.md).
const portalPath = /^\/(espace|admin)(\/|$)/;
const withPortal = process.env.LDGENX_PORTAL === '1';

export default defineConfig(({ isSsrBuild }) => ({
  // Vite's development router remains client-rendered. The production preview
  // serves each route's generated document through the middleware below; the
  // development server makes the crawler files (sitemaps, robots.txt, llms.txt)
  // on request, as the build writes them.
  appType: 'spa',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'ldgenx-portal',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const url = new URL(req.url || '/', 'http://localhost');
          if (portalPath.test(url.pathname)) req.url = `/portal.html${url.search}`;
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, _res, next) => {
          const url = new URL(req.url || '/', 'http://localhost');
          if (portalPath.test(url.pathname) && existsSync(resolve('dist/portal.html')))
            req.url = `/portal.html${url.search}`;
          next();
        });
      },
    },
    {
      name: 'ldgenx-crawler-files',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const path = new URL(req.url || '/', 'http://localhost').pathname;
          if (!/^\/(sitemap\.xml|sitemaps\/[a-z]+\.xml|robots\.txt|llms(-full)?\.txt)$/.test(path))
            return next();
          try {
            const entry = await server.ssrLoadModule('/src/entry-server.tsx');
            await entry.ready;
            const tools = await import(pathToFileURL(resolve('scripts/crawler-files.mjs')).href);
            // Dates of the last build; pictures from a render of each page, for the sitemaps.
            const dates = JSON.parse(
              await readFile(resolve('data/lastmod.json'), 'utf8').catch(() => '{}'),
            );
            const imagesOf: Record<string, string[]> = {};
            if (path.startsWith('/sitemaps/'))
              for (const page of entry.pages)
                imagesOf[page.path] = tools.imageSet(tools.mainOf(entry.render(page.path).html));
            const files = tools.crawlerFiles({
              pages: entry.pages,
              catalogs: entry.catalogs,
              company: entry.company,
              dates,
              imagesOf,
              today: new Date().toISOString().slice(0, 10),
            });
            const body = files[path.slice(1)];
            if (body === undefined) return next();
            res.setHeader(
              'Content-Type',
              `${path.endsWith('.xml') ? 'application/xml' : 'text/plain'}; charset=utf-8`,
            );
            res.end(body);
          } catch (error) {
            next(error);
          }
        });
      },
    },
    {
      name: 'ldgenx-static-pages',
      configurePreviewServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = new URL(req.url || '/', 'http://localhost');
          const path = url.pathname.replace(/\/+$/, '') || '/';
          if (redirects[path]) {
            res.statusCode = 301;
            res.setHeader('Location', redirects[path] + url.search);
            res.end();
            return;
          }
          if (pagePaths.includes(path)) {
            req.url = `${path === '/' ? '/index' : path}.html${url.search}`;
            next();
            return;
          }
          if (!path.split('/').pop()?.includes('.')) {
            try {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.end(await readFile(resolve('dist/404.html')));
            } catch (error) {
              next(error);
            }
            return;
          }
          next();
        });
      },
    },
  ],
  build: {
    sourcemap: false,
    rollupOptions: isSsrBuild
      ? undefined
      : {
          input: {
            main: resolve('index.html'),
            ...(withPortal && { portal: resolve('portal.html') }),
          },
        },
  },
}));
