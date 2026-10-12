import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { applications, services, company, copy } from '../content/fr';
import { PhotoStack, TextLink } from '../components/ui';
import { usePresence, useReducedMotion } from '../components/motion';

// Each mega menu opens on an overview; hovering an entry previews its image and headline.
const menus = {
  services: {
    label: 'Expertises',
    image: 'laboratoire',
    title: 'Une question.\nDes expertises complémentaires.',
    text: copy.home.servicesIntro,
    all: copy.labels.allServices,
    items: services,
  },
  applications: {
    label: 'Applications',
    image: 'conception',
    title: 'La connaissance du vivant,\nsur votre terrain.',
    text: copy.home.applicationsIntro,
    all: copy.labels.allApplications,
    items: applications,
  },
};

function Lockup({ tone, sizes }: { tone: 'navy' | 'light'; sizes: string }) {
  return (
    <img
      className={tone === 'navy' ? 'brand-dark' : 'brand-light'}
      src={`/brand/lockup-${tone}-160.webp`}
      srcSet={`/brand/lockup-${tone}-96.webp 343w, /brand/lockup-${tone}-160.webp 570w`}
      sizes={sizes}
      alt={tone === 'navy' ? 'LDgenX' : ''}
      width="570"
      height="160"
    />
  );
}

const links = [
  ['/etudes-de-cas', copy.navigation.studies],
  ['/innovation', copy.navigation.innovation],
  ['/a-propos', copy.navigation.about],
  ['/ressources', copy.navigation.resources],
];

export function Header() {
  const [menu, setMenu] = useState<'services' | 'applications' | null>(null);
  const [mobile, setMobile] = useState(false);
  const header = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const location = useLocation();
  const reduced = useReducedMotion();
  // On the homepage the header is transparent at the top of the dark hero, deep navy while the
  // hero scrolls beneath it, and back to its usual light style once the hero has passed.
  const isHome = (location.pathname.replace(/\/+$/, '') || '/') === '/';
  const [heroTone, setHeroTone] = useState<'top' | 'scrolled' | null>(isHome ? 'top' : null);
  const [heroPath, setHeroPath] = useState(location.pathname);
  if (heroPath !== location.pathname) {
    setHeroPath(location.pathname);
    setHeroTone(isHome ? 'top' : null);
  }
  useEffect(() => {
    const start = isHome ? document.querySelector('[data-hero-start]') : null;
    const end = isHome ? document.querySelector('[data-hero-end]') : null;
    if (!start || !end) return;
    const passed = new Map<Element, boolean>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) passed.set(entry.target, entry.boundingClientRect.top <= 0);
      setHeroTone(passed.get(end) ? null : passed.get(start) ? 'scrolled' : 'top');
    });
    observer.observe(start);
    observer.observe(end);
    return () => observer.disconnect();
  }, [isHome]);
  // Panels stay mounted while they fade out; the last menu shown keeps its content meanwhile.
  const megaState = usePresence(menu !== null, reduced ? 0 : 170);
  const sheetState = usePresence(mobile, reduced ? 0 : 240);
  const [shownMenu, setShownMenu] = useState(menu);
  const [preview, setPreview] = useState<number | null>(null);
  if (menu && menu !== shownMenu) {
    setShownMenu(menu);
    setPreview(null);
  }
  const tone = megaState === 'closed' ? heroTone : null;
  useEffect(() => {
    setMenu(null);
    setMobile(false);
    // A new page: leave the menu at once so focus can move to the page.
    dialog.current?.close();
  }, [location.pathname]);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setMenu(null);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);
  useEffect(() => {
    const sheet = dialog.current;
    if (sheetState === 'open' && sheet && !sheet.open) sheet.showModal();
    // Closing returns focus to the menu button, where the dialog was opened.
    if (sheetState === 'closed' && sheet?.open) sheet.close();
  }, [sheetState]);
  useEffect(() => {
    document.body.style.overflow = mobile ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobile]);
  // A link to the page already on screen does not change the address: close the panel anyway.
  const closeOnLink = (event: MouseEvent, close: () => void) => {
    if ((event.target as Element).closest('a')) close();
  };
  return (
    <>
      <a className="skip-link" href="#main">
        Aller au contenu
      </a>
      <header
        ref={header}
        className="site-header"
        data-over-hero={tone ?? undefined}
        onMouseLeave={() => setMenu(null)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setMenu(null);
            (
              header.current?.querySelector('[aria-expanded="true"]') as HTMLElement | null
            )?.focus();
          }
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setMenu(null);
        }}
      >
        <div className="header-inner container">
          <Link to="/" className="brand" aria-label="LDgenX — Accueil">
            <Lockup tone="navy" sizes="(max-width: 1050px) 150px, 186px" />
          </Link>
          <nav className="desktop-nav" aria-label="Navigation principale">
            {(['services', 'applications'] as const).map((key) => (
              <button
                key={key}
                className={`nav-menu-trigger ${menu === key || location.pathname.startsWith('/' + key) ? 'active' : ''}`}
                onMouseEnter={() => setMenu(key)}
                onClick={(event) => setMenu(event.detail === 0 && menu === key ? null : key)}
                aria-expanded={menu === key}
                aria-controls={`mega-${key}`}
              >
                {copy.navigation[key]}
                <ChevronDown size={12} aria-hidden="true" />
              </button>
            ))}
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} onMouseEnter={() => setMenu(null)}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <a className="language" href={company.english}>
              <span>FR</span>
              <span className="language-divider">/</span>EN
              <span className="sr-only" lang="en">
                {' '}
                English website
              </span>
            </a>
            <Link to="/contact" className="header-cta">
              <span>{copy.navigation.contact}</span>
              <ArrowRight
                className="header-cta-arrow"
                size={17}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </Link>
            <button
              className="mobile-trigger"
              onClick={() => setMobile(true)}
              aria-label="Ouvrir le menu"
              aria-haspopup="dialog"
            >
              <Menu size={26} />
            </button>
          </div>
        </div>
        {megaState !== 'closed' && shownMenu && (
          <>
            <div className="mega-scrim" data-state={megaState} aria-hidden="true" />
            <MegaMenu
              id={`mega-${shownMenu}`}
              menu={shownMenu}
              state={megaState}
              preview={preview}
              onPreview={setPreview}
              onNavigate={(event) => closeOnLink(event, () => setMenu(null))}
            />
          </>
        )}
      </header>
      <dialog
        ref={dialog}
        className="mobile-dialog"
        data-state={sheetState}
        aria-labelledby="mobile-menu-title"
        onCancel={(event) => {
          // Escape plays the same closing animation as the close button.
          event.preventDefault();
          setMobile(false);
        }}
        onClick={(event) => closeOnLink(event, () => setMobile(false))}
      >
        <div className="mobile-menu-head">
          <Link to="/" aria-label="LDgenX — Accueil">
            <Lockup tone="navy" sizes="150px" />
          </Link>
          <button onClick={() => setMobile(false)} aria-label="Fermer le menu">
            <X size={28} />
          </button>
        </div>
        <p id="mobile-menu-title" className="eyebrow">
          Explorer LDgenX
        </p>
        <nav aria-label="Navigation mobile">
          {(['services', 'applications'] as const).map((key) => (
            <details key={key}>
              <summary>
                {copy.navigation[key]}
                <ChevronDown size={21} />
              </summary>
              <div>
                <Link className="mobile-all" to={`/${key}`}>
                  {key === 'services' ? copy.labels.allServices : copy.labels.allApplications}
                </Link>
                {(key === 'services' ? services : applications).map((s) => (
                  <Link key={s.slug} to={`/${key}/${s.slug}`}>
                    {s.title}
                  </Link>
                ))}
              </div>
            </details>
          ))}
          {links.map(([to, label]) => (
            <Link className="mobile-nav-link" key={to} to={to}>
              {label}
            </Link>
          ))}
        </nav>
        <Link to="/contact" className="header-cta mobile-sheet-cta">
          <span>{copy.navigation.contact}</span>
          <ArrowRight className="header-cta-arrow" size={18} strokeWidth={1.8} aria-hidden="true" />
        </Link>
        <div className="mobile-menu-bottom">
          <a href={`mailto:${company.email}`}>{company.email}</a>
          <a href={company.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
          <a href={company.english}>
            FR / EN
            <span className="sr-only" lang="en">
              {' '}
              English website
            </span>
          </a>
        </div>
      </dialog>
    </>
  );
}

function MegaMenu({
  id,
  menu,
  state,
  preview,
  onPreview,
  onNavigate,
}: {
  id: string;
  menu: keyof typeof menus;
  state: 'open' | 'closing';
  preview: number | null;
  onPreview: (index: number) => void;
  onNavigate: (event: MouseEvent) => void;
}) {
  const content = menus[menu];
  const item = preview === null ? null : content.items[preview];
  // Every image is mounted at once, so moving across the entries is a pure crossfade.
  const images = [content.image, ...new Set(content.items.map((i) => i.image))];
  return (
    <div id={id} className="mega-menu" data-state={state} onClick={onNavigate}>
      <div className="container mega-inner" key={menu}>
        <Link to={`/${menu}`} className="mega-feature">
          <PhotoStack
            className="mega-feature-media"
            items={images.map((image) => ({ image, alt: '' }))}
            active={images.indexOf(item?.image ?? content.image)}
            sizes="340px"
          />
          <span className="mega-feature-copy" key={preview ?? 'overview'}>
            <span className="mega-feature-label">{item ? item.title : content.label}</span>
            <span className="mega-feature-title">{item ? item.headline : content.title}</span>
            {!item && <span className="mega-feature-text">{content.text}</span>}
          </span>
        </Link>
        <div className="mega-links">
          {content.items.map((s, i) => (
            <Link
              key={s.slug}
              to={`/${menu}/${s.slug}`}
              data-preview={preview === i || undefined}
              style={{ '--i': i } as CSSProperties}
              onMouseEnter={() => onPreview(i)}
              onFocus={() => onPreview(i)}
            >
              <span className="mega-link-title">{s.title}</span>
              <span className="mega-link-scope">{s.scope}</span>
              <ArrowRight
                className="mega-link-arrow"
                size={18}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </div>
      <div className="container mega-foot">
        <p>Une question scientifique ? Parlons de votre projet.</p>
        <div>
          <TextLink to={`/${menu}`}>{content.all}</TextLink>
          <a className="text-link" href={company.appointment} target="_blank" rel="noreferrer">
            Prendre rendez-vous
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
