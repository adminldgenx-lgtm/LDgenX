import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pages, redirects } from './src/lib/pages';

export default defineConfig(() => ({
  // Vite's development router remains client-rendered. The production preview
  // serves each route's generated document through the middleware below.
  appType: 'spa',
  plugins: [
    react(),
    tailwindcss(),
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
          if (pages.some((p) => p.path === path)) {
            req.url = `${path === '/' ? '' : path}/index.html${url.search}`;
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
  },
}));
