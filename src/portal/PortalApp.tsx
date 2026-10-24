// The client area (/espace) and the administration (/admin): one application, kept apart from
// the public site and from search engines.
import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { I18nProvider, useI18n } from './i18n';
import { SessionProvider, ToastProvider, useSession } from './state';
import { AdminShell, ClientShell, Gate } from './layout';
import { ForgotPage, LoginPage, RegisterPage } from './pages/auth';
import {
  AccountPage,
  ClientAppointmentsPage,
  ClientFilesPage,
  ClientMessagesPage,
  PublicBookingPage,
} from './pages/client';
import { InboxPage } from './pages/inbox';
import { RequestsPage } from './pages/requests';
import { AgendaPage } from './pages/agenda';
import { ClientPage, ClientsPage } from './pages/clients';
import { SettingsPage } from './pages/settings';

function Entry() {
  const { user } = useSession();
  if (!user) return <Navigate to="/espace/connexion" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/messages' : '/espace/messages'} replace />;
}

/** Each screen gets a title, and focus moves to it, as on a page change. */
function PageTitle() {
  const location = useLocation();
  const { t } = useI18n();
  useEffect(() => {
    const area = location.pathname.startsWith('/admin') ? t.common.admin : t.common.clientArea;
    document.title = `${area} · LDgenX`;
    document.getElementById('p-main')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [location.pathname, t]);
  return null;
}

export function PortalApp() {
  return (
    <I18nProvider>
      <ToastProvider>
        <SessionProvider>
          <PageTitle />
          <Gate>
            <Routes>
              <Route path="/espace" element={<Entry />} />
              <Route path="/espace/connexion" element={<LoginPage />} />
              <Route path="/espace/inscription" element={<RegisterPage />} />
              <Route path="/espace/mot-de-passe" element={<ForgotPage />} />
              <Route path="/espace/reserver" element={<PublicBookingPage />} />
              <Route element={<ClientShell />}>
                <Route path="/espace/messages" element={<ClientMessagesPage />} />
                <Route path="/espace/fichiers" element={<ClientFilesPage />} />
                <Route path="/espace/rendez-vous" element={<ClientAppointmentsPage />} />
                <Route path="/espace/compte" element={<AccountPage />} />
              </Route>
              <Route path="/admin" element={<Navigate to="/admin/messages" replace />} />
              <Route path="/admin/connexion" element={<LoginPage admin />} />
              <Route element={<AdminShell />}>
                <Route path="/admin/messages" element={<InboxPage />} />
                <Route path="/admin/demandes" element={<RequestsPage />} />
                <Route path="/admin/agenda" element={<AgendaPage />} />
                <Route path="/admin/clients" element={<ClientsPage />} />
                <Route path="/admin/clients/:id" element={<ClientPage />} />
                <Route path="/admin/parametres" element={<SettingsPage />} />
                <Route path="/admin/compte" element={<AccountPage />} />
              </Route>
              <Route path="*" element={<Entry />} />
            </Routes>
          </Gate>
        </SessionProvider>
      </ToastProvider>
    </I18nProvider>
  );
}
