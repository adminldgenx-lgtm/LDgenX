import { useEffect, useRef, useState, type ComponentType } from 'react';
import { Navigate, useLocation, useNavigationType } from 'react-router-dom';
import { getPage, redirects, type PageKind, type PageMeta } from './lib/pages';
import { Header } from './layouts/Header';
import { Footer } from './layouts/Footer';
import { SEO } from './components/SEO';
import { Button, Eyebrow } from './components/ui';
import { Home } from './pages/Home';
import { ServicePage, ServicesPage, ApplicationsPage, ApplicationPage } from './pages/Expertise';
import {
  StudiesPage,
  StudyPage,
  InnovationsPage,
  InnovationPage,
  ResourcesPage,
  ArticlePage,
} from './pages/Editorial';
import { AboutPage, TeamPage, PartnersPage, LegalPage, PrivacyPage } from './pages/Company';
import { ContactPage } from './pages/Contact';

function NotFound() {
  return (
    <section className="not-found">
      <Eyebrow>404 · une autre piste à explorer</Eyebrow>
      <h1>Cette page nous échappe.</h1>
      <p>Retrouvez les expertises et les ressources de LDgenX.</p>
      <Button to="/">Revenir à l’accueil</Button>
      <Button to="/services" variant="outline">
        Explorer les expertises
      </Button>
    </section>
  );
}
const templates: Record<PageKind, ComponentType<{ meta: PageMeta }>> = {
  home: Home,
  services: ServicesPage,
  service: ServicePage,
  applications: ApplicationsPage,
  application: ApplicationPage,
  studies: StudiesPage,
  study: StudyPage,
  innovations: InnovationsPage,
  innovation: InnovationPage,
  about: AboutPage,
  team: TeamPage,
  partners: PartnersPage,
  resources: ResourcesPage,
  article: ArticlePage,
  contact: ContactPage,
  legal: LegalPage,
  privacy: PrivacyPage,
  'not-found': NotFound,
};

// Scroll position of each history entry, so Back and Forward return where the visitor was.
const scrollPositions = new Map<string, number>();

export function App() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const meta = getPage(location.pathname);
  const Page = templates[meta.kind];
  const initial = useRef(true);
  const entryKey = useRef(location.key);
  // The first page arrives as server-rendered HTML; later pages fade in when the route changes.
  const [firstKey] = useState(location.key);
  const [navigated, setNavigated] = useState(false);
  if (!navigated && location.key !== firstKey) setNavigated(true);
  useEffect(() => {
    let frame = 0;
    const save = () => {
      frame = 0;
      scrollPositions.set(entryKey.current, window.scrollY);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(save);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  useEffect(() => {
    entryKey.current = location.key;
    if (initial.current) {
      initial.current = false;
      return;
    }
    const saved = navigationType === 'POP' ? scrollPositions.get(location.key) : undefined;
    const target = location.hash && document.getElementById(location.hash.slice(1));
    // The page jumps without the stylesheet's smooth scrolling, which would otherwise carry on
    // from the previous page's height and leave the new one a few pixels down.
    const root = document.documentElement;
    root.style.scrollBehavior = 'auto';
    if (saved !== undefined) window.scrollTo({ top: saved, behavior: 'instant' });
    else if (target) target.scrollIntoView({ behavior: 'instant' });
    else window.scrollTo({ top: 0, behavior: 'instant' });
    document.getElementById('main')?.focus({ preventScroll: true });
    const frame = requestAnimationFrame(() => root.style.removeProperty('scroll-behavior'));
    return () => {
      cancelAnimationFrame(frame);
      root.style.removeProperty('scroll-behavior');
    };
  }, [location.pathname, location.hash, location.key, navigationType]);
  const normalized = location.pathname.replace(/\/+$/, '') || '/';
  return (
    <>
      <SEO meta={meta} />
      <Header />
      <main
        id="main"
        tabIndex={-1}
        key={meta.path}
        className={navigated ? 'page-enter' : undefined}
      >
        <Page meta={meta} />
      </main>
      <Footer />
      {redirects[normalized] && <Navigate to={redirects[normalized]} replace />}
    </>
  );
}
