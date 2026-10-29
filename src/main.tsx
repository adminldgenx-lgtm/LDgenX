import { Suspense } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { loadCatalog } from './content/catalog';
import { localeAt } from './lib/pages';
import './styles/global.css';
import './styles/content.css';
import './editorial/editorial.css';
import { EditorialProvider, readEditorialBootstrap } from './editorial/context';

// The page's own language is loaded before hydration, so the first render matches the
// server's markup.
loadCatalog(localeAt(location.pathname)).then(() => {
  const container = document.getElementById('root')!;
  const application = (
    <BrowserRouter>
      <Suspense fallback={null}>
        <EditorialProvider initial={readEditorialBootstrap()}><App /></EditorialProvider>
      </Suspense>
    </BrowserRouter>
  );
  if (container.childElementCount > 0) hydrateRoot(container, application);
  else createRoot(container).render(application);
});
