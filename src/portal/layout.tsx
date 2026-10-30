// The frame around every signed-in screen: a sidebar on large screens, a top bar and a menu on
// phones, and the guards that keep each area to its users. Counters in the menu stay live.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  CalendarDays,
  CalendarClock,
  FolderOpen,
  Inbox,
  LogOut,
  Menu,
  MessagesSquare,
  Settings,
  UserRound,
  Users,
  X,
  BookOpen,
} from 'lucide-react';
import { api } from './api';
import { useI18n } from './i18n';
import { useData, useSession } from './state';
import { Avatar, Button, Loading, ErrorNote } from './ui';
import { Notifications } from './shared';

export function LanguageSwitch() {
  const { t, locale, setLocale } = useI18n();
  const { user, setUser } = useSession();
  return (
    <button
      type="button"
      className="p-lang"
      lang={locale === 'fr' ? 'en' : 'fr'}
      aria-label={t.common.language}
      onClick={async () => {
        const next = locale === 'fr' ? 'en' : 'fr';
        setLocale(next);
        // The answer may come after a newer choice: the language on screen stays.
        if (user) setUser(await api.updateProfile({ locale: next }), false);
      }}
    >
      {t.common.languageCode}
    </button>
  );
}

function Brand({ area, to }: { area: string; to: string }) {
  return (
    <Link to={to} className="p-brand">
      <img
        src="/brand/lockup-navy-160.webp"
        alt="LDgenX"
        width={570}
        height={160}
      />
      <span>{area}</span>
    </Link>
  );
}

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  count?: number;
}

function Shell({
  area,
  home,
  items,
  account,
}: {
  area: string;
  home: string;
  items: NavItem[];
  account: string;
}) {
  const { t } = useI18n();
  const { user, signOut } = useSession();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawerClose = useRef<HTMLButtonElement>(null);
  // Where focus goes once the menu has closed (the page is out of reach until then): the new
  // page after a link, the menu button otherwise.
  const focusAfter = useRef<'main' | 'menu' | null>(null);
  useEffect(() => {
    setOpen((wasOpen) => {
      if (wasOpen) focusAfter.current = 'main';
      return false;
    });
  }, [location.pathname]);
  const close = () => {
    focusAfter.current = 'menu';
    setOpen(false);
  };
  useEffect(() => {
    if (!open) {
      const target = focusAfter.current;
      focusAfter.current = null;
      if (target === 'main')
        document.getElementById('p-main')?.focus({ preventScroll: true });
      if (target === 'menu') menuButton.current?.focus();
      return;
    }
    document.body.style.overflow = 'hidden';
    drawerClose.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      focusAfter.current = 'menu';
      setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  if (!user) return null;
  const name = `${user.firstName} ${user.lastName}`;
  const nav = (
    <nav className="p-nav" aria-label={area}>
      {items.map((item) => (
        <NavLink key={item.to} to={item.to}>
          {item.icon}
          <span>{item.label}</span>
          {!!item.count && (
            <span className="p-count" aria-label={`(${item.count})`}>
              {item.count > 99 ? '99+' : item.count}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
  const foot = (
    <div className="p-side-foot">
      <Link to={account} className="p-me">
        <Avatar
          name={name}
          colour={user.role === 'admin' ? '#03254b' : '#2a7416'}
        />
        <div>
          <strong>{name}</strong>
          <span>{t.common.account}</span>
        </div>
      </Link>
      <div className="p-side-links">
        <a href="/">{t.common.backToSite}</a>
        <button type="button" className="p-link" onClick={signOut}>
          <LogOut size={15} aria-hidden="true" /> {t.common.signOut}
        </button>
      </div>
    </div>
  );
  return (
    <div className="p-app">
      <a className="p-skip" href="#p-main" inert={open}>
        {t.common.skip}
      </a>
      <aside className="p-side" inert={open}>
        <Brand area={area} to={home} />
        {nav}
        {foot}
      </aside>
      {/* While the phone menu is open, the page behind it is out of reach. */}
      <div className="p-body" inert={open}>
        <header className="p-top">
          <button
            ref={menuButton}
            type="button"
            className="p-icon-button p-menu-button"
            aria-label={t.common.openMenu}
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className="p-top-brand">
            <Brand area={area} to={home} />
          </div>
          <div className="p-top-actions">
            <LanguageSwitch />
            <Notifications />
          </div>
        </header>
        <main id="p-main" className="p-main" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
      {open && (
        <div
          className="p-drawer"
          role="dialog"
          aria-modal="true"
          aria-label={t.common.menu}
        >
          <div className="p-drawer-panel">
            <div className="p-drawer-head">
              <Brand area={area} to={home} />
              <button
                ref={drawerClose}
                type="button"
                className="p-icon-button"
                aria-label={t.common.close}
                onClick={close}
              >
                <X size={22} />
              </button>
            </div>
            {nav}
            {foot}
          </div>
          <button
            type="button"
            className="p-drawer-scrim"
            aria-label={t.common.close}
            tabIndex={-1}
            onClick={close}
          />
        </div>
      )}
    </div>
  );
}

export function Gate({ children }: { children: ReactNode }) {
  const { ready, error } = useSession();
  if (error)
    return (
      <div className="p-gate">
        <ErrorNote onRetry={() => window.location.reload()} />
      </div>
    );
  if (!ready)
    return (
      <div className="p-gate">
        <Loading />
      </div>
    );
  return <>{children}</>;
}

const total = (list: { unread: number }[] | undefined) =>
  (list ?? []).reduce((sum, item) => sum + item.unread, 0);

export function ClientShell() {
  const { t } = useI18n();
  const { user } = useSession();
  const location = useLocation();
  const client = user?.role === 'client';
  const threads = useData(
    () => (client ? api.listThreads() : Promise.resolve([])),
    [user?.id],
  );
  const files = useData(
    () => (client ? api.listFiles() : Promise.resolve([])),
    [user?.id],
  );
  if (user?.role === 'admin') return <Navigate to="/admin/messages" replace />;
  if (!user)
    return (
      <Navigate
        to={`/espace/connexion?suite=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  const fresh = (files.data ?? []).filter(
    (f) =>
      f.direction === 'to_client' &&
      !f.downloads.some((d) => d.userId === user.id),
  ).length;
  return (
    <Shell
      area={t.common.clientArea}
      home="/espace/messages"
      account="/espace/compte"
      items={[
        {
          to: '/espace/messages',
          label: t.nav.messages,
          icon: <MessagesSquare size={19} aria-hidden="true" />,
          count: total(threads.data),
        },
        {
          to: '/espace/fichiers',
          label: t.nav.files,
          icon: <FolderOpen size={19} aria-hidden="true" />,
          count: fresh,
        },
        {
          to: '/espace/rendez-vous',
          label: t.nav.appointments,
          icon: <CalendarDays size={19} aria-hidden="true" />,
        },
        {
          to: '/espace/compte',
          label: t.common.account,
          icon: <UserRound size={19} aria-hidden="true" />,
        },
      ]}
    />
  );
}

export function AdminShell() {
  const { t, locale } = useI18n();
  const { user } = useSession();
  const location = useLocation();
  const admin = user?.role === 'admin';
  const threads = useData(
    () => (admin ? api.listThreads() : Promise.resolve([])),
    [user?.id],
  );
  const inquiries = useData(
    () => (admin ? api.listInquiries() : Promise.resolve([])),
    [user?.id],
  );
  const appointments = useData(
    () => (admin ? api.listAppointments() : Promise.resolve([])),
    [user?.id],
  );
  const clients = useData(
    () => (admin ? api.listClients() : Promise.resolve([])),
    [user?.id],
  );
  if (!user)
    return (
      <Navigate
        to={`/admin/connexion?suite=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  if (!admin) return <AdminOnly />;
  const waiting = (appointments.data ?? []).filter(
    (a) => a.status === 'requested' || (a.status === 'confirmed' && a.change),
  ).length;
  return (
    <Shell
      area={t.common.admin}
      home="/admin/messages"
      account="/admin/compte"
      items={[
        {
          to: '/admin/contenus',
          label: locale === 'fr' ? 'Contenus' : 'Content',
          icon: <BookOpen size={19} aria-hidden="true" />,
        },
        {
          to: '/admin/messages',
          label: t.nav.messages,
          icon: <Inbox size={19} aria-hidden="true" />,
          count:
            total(threads.data) +
            (inquiries.data ?? []).filter((i) => i.status === 'new').length,
        },
        {
          to: '/admin/demandes',
          label: t.nav.requests,
          icon: <CalendarClock size={19} aria-hidden="true" />,
          count: waiting,
        },
        {
          to: '/admin/agenda',
          label: t.nav.agenda,
          icon: <CalendarDays size={19} aria-hidden="true" />,
        },
        {
          to: '/admin/clients',
          label: t.nav.clients,
          icon: <Users size={19} aria-hidden="true" />,
          count: (clients.data ?? []).filter((c) => c.status === 'pending')
            .length,
        },
        {
          to: '/admin/parametres',
          label: t.nav.settings,
          icon: <Settings size={19} aria-hidden="true" />,
        },
      ]}
    />
  );
}

function AdminOnly() {
  const { t } = useI18n();
  const { signOut } = useSession();
  return (
    <div className="p-auth">
      <div className="p-auth-card">
        <h1>{t.common.admin}</h1>
        <p>{t.auth.adminOnly}</p>
        <div className="p-row">
          <Link
            className="p-button"
            data-variant="secondary"
            to="/espace/messages"
          >
            {t.common.clientArea}
          </Link>
          <Button variant="ghost" onClick={signOut}>
            {t.common.signOut}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Pages outside the signed-in frame: sign-in, sign-up, public booking. */
export function OpenLayout({ children }: { children: ReactNode }) {
  const { t, locale } = useI18n();
  const site = locale === 'fr' ? '/' : '/en';
  return (
    <div className="p-auth">
      <header className="p-auth-top">
        <a href={site} className="p-brand">
          <img
            src="/brand/lockup-navy-160.webp"
            alt="LDgenX"
            width={570}
            height={160}
          />
        </a>
        <div className="p-top-actions">
          <a className="p-link" href={site}>
            {t.common.backToSite}
          </a>
          <LanguageSwitch />
        </div>
      </header>
      <main id="p-main" className="p-auth-main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
