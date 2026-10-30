import { use, useEffect, useRef, useState, type ComponentType } from 'react';
import { Navigate, useLocation, useNavigationType } from 'react-router-dom';
import { localeAt, redirects, type PageKind, type PageMeta } from './lib/pages';
import { catalogs, loadCatalog } from './content/catalog';
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
import {
  AboutPage,
  TeamPage,
  PartnersPage,
  LegalPage,
  PrivacyPage,
  PersonPage,
  TermsPage,
} from './pages/Company';
import { WorkPage } from './pages/Works';
import { PublicationPage, ResearchPage } from './pages/Research';
import { FaqPage, GlossaryPage, SiteMapPage } from './pages/Knowledge';
import { LocaleProvider, useCatalog, useRoutes } from './i18n';
import { ContactPage } from './pages/Contact';
import { usePublicMeta } from './editorial/context';
import { PublishedEditorialPage } from './editorial/PublicDocument';

function NotFound() {
  const t = useCatalog().ui.notFound;
  const r = useRoutes();
  return (
    <section className="not-found">
      <Eyebrow>{t.eyebrow}</Eyebrow>
      <h1>{t.title}</h1>
      <p>{t.text}</p>
      <Button to={r.home}>{t.home}</Button>
      <Button to={r.services} variant="outline">
        {t.services}
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
  work: WorkPage,
  person: PersonPage,
  publications: ResearchPage,
  publication: PublicationPage,
  faq: FaqPage,
  glossary: GlossaryPage,
  sitemap: SiteMapPage,
  terms: TermsPage,
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

/** A hairline under the header that fills as the page is read. */
function ReadingProgress() {
  const bar = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.current?.style.setProperty(
        '--read',
        String(max > 0 ? Math.min(1, window.scrollY / max) : 0),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <div className="reading-progress" aria-hidden="true">
      <span ref={bar} />
    </div>
  );
}

// Scroll position of each history entry, so Back and Forward return where the visitor was.
const scrollPositions = new Map<string, number>();

export function App() {
  const location = useLocation();
  const navigationType = useNavigationType();
  // Moving to the other language waits for its catalogue; the navigation is a transition, so
  // the current page stays on screen meanwhile.
  const locale = localeAt(location.pathname);
  if (!catalogs[locale]) use(loadCatalog(locale));
  const meta = usePublicMeta(location.pathname);
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
  // Only a change of page (or anchor) moves the scroll and focus; a change of the query alone
  // (filters, an open publication) leaves the reader where they are.
  const place = useRef(location.pathname + location.hash);
  useEffect(() => {
    entryKey.current = location.key;
    if (initial.current) {
      initial.current = false;
      return;
    }
    const here = location.pathname + location.hash;
    if (here === place.current) return;
    place.current = here;
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
    <LocaleProvider locale={meta.locale}>
      <SEO meta={meta} />
      <Header />
      {meta.kind !== 'home' && <ReadingProgress />}
      <main
        id="main"
        tabIndex={-1}
        key={meta.path}
        className={navigated ? 'page-enter' : undefined}
      >
        {meta.editorial ? <PublishedEditorialPage row={meta.editorial} /> : <Page meta={meta} />}
      </main>
      <Footer />
      {redirects[normalized] && <Navigate to={redirects[normalized]} replace />}
    </LocaleProvider>
  );
}
