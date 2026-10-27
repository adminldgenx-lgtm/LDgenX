import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { PhotoStack, TextLink } from '../components/ui';
import { usePresence } from '../components/motion';
import { useCatalog, useRoutes, useLocale, type Locale } from '../i18n';
import { bases } from '../lib/routes';
import { getPage } from '../lib/pages';
import { loadCatalog } from '../content/catalog';
import { AccountLink } from './AccountLink';
import { listedExpertises } from '../lib/expertises';
import { appointmentLink } from '../lib/appointment-link';

type MenuKey = 'services' | 'applications';

// Each mega menu opens on an overview; hovering an entry previews its image and headline.
function useMenus() {
  const { applications, services, copy, ui } = useCatalog();
  const r = useRoutes();
  return {
    services: {
      label: copy.navigation.services,
      image: 'equipe-maxime',
      title: ui.header.servicesTitle,
      text: copy.home.servicesIntro,
      all: copy.labels.allServices,
      to: r.services,
      items: listedExpertises(services).map((s) => ({ ...s, to: r.service(s.id) })),
    },
    applications: {
      label: copy.navigation.applications,
      image: 'schema-protocole',
      title: ui.header.applicationsTitle,
      text: copy.home.applicationsIntro,
      all: copy.labels.allApplications,
      to: r.applications,
      items: applications.map((s) => ({ ...s, to: r.application(s.id) })),
    },
  };
}

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

export function Header() {
  const { copy, company, ui } = useCatalog();
  const r = useRoutes();
  const menus = useMenus();
  const links = [
    [r.studies, copy.navigation.studies],
    [r.publications, copy.navigation.research],
    [r.about, copy.navigation.about],
  ];
  const [menu, setMenu] = useState<MenuKey | null>(null);
  const [mobile, setMobile] = useState(false);
  const header = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const location = useLocation();
  // On the homepage the header is transparent at the top of the dark hero, deep navy while the
  // hero scrolls beneath it, and back to its usual light style once the hero has passed.
  const meta = getPage(location.pathname);
  const isHome = meta.kind === 'home';
  // The same page in the other language, or that language's homepage.
  const other: Locale = meta.locale === 'fr' ? 'en' : 'fr';
  const otherPath = meta.alternates[other] ?? bases[other].home;
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
  const megaState = usePresence(menu !== null, 170);
  const sheetState = usePresence(mobile, 240);
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
    if (sheetState === 'open' && sheet && !sheet.open) {
      sheet.showModal();
      // The sheet itself takes focus, not its first link: no focus ring after a tap, and Tab
      // still leads to the links in order.
      sheet.focus();
    }
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
        {ui.common.skip}
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
          <Link to={r.home} className="brand" aria-label={ui.common.homeLink}>
            <Lockup tone="navy" sizes="(max-width: 1050px) 150px, 186px" />
          </Link>
          <nav className="desktop-nav" aria-label={ui.header.mainNav}>
            {(['services', 'applications'] as const).map((key) => (
              <div
                key={key}
                className={`nav-dropdown ${menu === key || location.pathname.startsWith(menus[key].to) ? 'active' : ''}`}
                onMouseEnter={() => setMenu(key)}
              >
                <NavLink className="nav-overview" to={menus[key].to}>
                  {copy.navigation[key]}
                </NavLink>
                <button
                  type="button"
                  className="nav-menu-trigger"
                  aria-label={`${copy.navigation[key]} · ${ui.header.openMenu}`}
                  aria-expanded={menu === key}
                  aria-controls={`mega-${key}`}
                  onClick={() => setMenu(menu === key ? null : key)}
                >
                  <ChevronDown size={12} aria-hidden="true" />
                </button>
              </div>
            ))}
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} onMouseEnter={() => setMenu(null)}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <Link
              className="language"
              to={otherPath}
              hrefLang={other}
              onPointerEnter={() => loadCatalog(other)}
              onFocus={() => loadCatalog(other)}
            >
              <span aria-hidden="true">
                <span data-current={meta.locale === 'fr' || undefined}>FR</span>
                <span className="language-divider">/</span>
                <span data-current={meta.locale === 'en' || undefined}>EN</span>
              </span>
              <span className="sr-only" lang={other}>
                {ui.header.otherLanguageName}
              </span>
            </Link>
            <AccountLink />
            <Link to={r.contact} className="header-cta">
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
              aria-label={ui.header.openMenu}
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
        tabIndex={-1}
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
          <Link to={r.home} aria-label={ui.common.homeLink}>
            <Lockup tone="navy" sizes="150px" />
          </Link>
          <button onClick={() => setMobile(false)} aria-label={ui.header.closeMenu}>
            <X size={28} />
          </button>
        </div>
        <p id="mobile-menu-title" className="eyebrow">
          {ui.header.explore}
        </p>
        <nav aria-label={ui.header.mobileNav}>
          {(['services', 'applications'] as const).map((key) => (
            <details key={key}>
              <summary>
                {copy.navigation[key]}
                <ChevronDown size={21} />
              </summary>
              <div>
                <Link className="mobile-all" to={menus[key].to}>
                  {menus[key].all}
                </Link>
                {menus[key].items.map((s) => (
                  <Link key={s.id} to={s.to}>
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
        <Link to={r.contact} className="header-cta mobile-sheet-cta">
          <span>{copy.navigation.contact}</span>
          <ArrowRight className="header-cta-arrow" size={18} strokeWidth={1.8} aria-hidden="true" />
        </Link>
        <div className="mobile-menu-bottom">
          <a href={`mailto:${company.email}`}>{company.email}</a>
          <a href={company.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
            <span className="sr-only">{ui.common.newTab}</span>
          </a>
          <Link to={otherPath} hrefLang={other}>
            <span aria-hidden="true">FR / EN</span>
            <span className="sr-only" lang={other}>
              {ui.header.otherLanguageName}
            </span>
          </Link>
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
  menu: MenuKey;
  state: 'open' | 'closing';
  preview: number | null;
  onPreview: (index: number) => void;
  onNavigate: (event: MouseEvent) => void;
}) {
  const content = useMenus()[menu];
  const { copy, ui } = useCatalog();
  const locale = useLocale();
  const item = preview === null ? null : content.items[preview];
  // Every image is mounted at once, so moving across the entries is a pure crossfade.
  const images = [content.image, ...new Set(content.items.map((i) => i.image))];
  return (
    <div id={id} className="mega-menu" data-state={state} onClick={onNavigate}>
      <div className="container mega-inner" key={menu}>
        <Link to={content.to} className="mega-feature">
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
              key={s.id}
              to={s.to}
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
        <p>{ui.header.megaFoot}</p>
        <div>
          <TextLink to={content.to}>{content.all}</TextLink>
          <a className="text-link" href={appointmentLink(locale)} target="_blank" rel="noreferrer">
            {copy.labels.appointment}
            <span className="sr-only">{ui.common.newTab}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
