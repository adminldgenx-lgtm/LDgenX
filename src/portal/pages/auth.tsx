import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { api, PortalError } from '../api';
import { useI18n } from '../i18n';
import { useSession } from '../state';
import { Button, Field, Fill } from '../ui';
import { OpenLayout } from '../layout';
import { GoogleSignIn } from '../GoogleSignIn';

const home = (role: 'admin' | 'client') =>
  role === 'admin' ? '/admin/messages' : '/espace/messages';

export function LoginPage({ admin = false }: { admin?: boolean }) {
  const { t } = useI18n();
  const { user, setUser } = useSession();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const requested = params.get('suite');
  const destination =
    requested &&
    new RegExp(`^/${user?.role === 'admin' ? 'admin' : 'espace'}(?:/|$)`).test(
      requested,
    )
      ? requested
      : user
        ? home(user.role)
        : '/espace';
  if (user) return <Navigate to={destination} replace />;
  const signIn = async (address: string, secret: string) => {
    setBusy(true);
    setError(null);
    try {
      const signed = await api.signIn(address, secret);
      setUser(signed);
    } catch (e) {
      const code = e instanceof PortalError ? e.code : 'network';
      setError(t.errors[code as keyof typeof t.errors] ?? t.errors.generic);
    } finally {
      setBusy(false);
    }
  };
  return (
    <OpenLayout>
      <div className="p-auth-card">
        <p className="p-eyebrow">
          {admin ? t.common.admin : t.common.clientArea}
        </p>
        <h1>{t.auth.loginTitle}</h1>
        <p className="p-lead">{t.auth.loginLead}</p>
        <GoogleSignIn admin={admin} disabled={busy} />
        <form
          className="p-form"
          onSubmit={(event) => {
            event.preventDefault();
            signIn(email, password);
          }}
        >
          <Field label={t.auth.email}>
            {(id) => (
              <input
                id={id}
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}
          </Field>
          <Field label={t.auth.password}>
            {(id) => (
              <input
                id={id}
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
          </Field>
          {error && (
            <p className="p-error" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" busy={busy} className="p-wide">
            {t.auth.signIn}
          </Button>
          <div className="p-auth-links">
            <Link to="/espace/mot-de-passe">{t.auth.forgot}</Link>
            {!admin && (
              <span>
                {t.auth.noAccount}{' '}
                <Link to="/espace/inscription">{t.auth.createAccount}</Link>
              </span>
            )}
          </div>
        </form>
      </div>
    </OpenLayout>
  );
}

export function RegisterPage() {
  const { t, locale } = useI18n();
  const { user, setUser } = useSession();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organisation: '',
    phone: '',
    password: '',
    message: '',
  });
  const [consent, setConsent] = useState(false);
  const [tried, setTried] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  if (user) return <Navigate to={home(user.role)} replace />;
  const set =
    (key: keyof typeof form) => (event: { target: { value: string } }) =>
      setForm({ ...form, [key]: event.target.value });
  const errors = {
    firstName: !form.firstName.trim() && t.common.required,
    lastName: !form.lastName.trim() && t.common.required,
    email: !/^\S+@\S+\.\S+$/.test(form.email) && t.errors.invalid_input,
    organisation: !form.organisation.trim() && t.common.required,
    password: form.password.length < 8 && t.auth.passwordShort,
    consent: !consent && t.auth.consentRequired,
  };
  const show = (key: keyof typeof errors) => (tried && errors[key]) || null;
  const submit = async () => {
    setTried(true);
    if (Object.values(errors).some(Boolean)) return;
    setBusy(true);
    setError(null);
    try {
      const created = await api.signUp({ ...form, locale });
      if (created) {
        setUser(created);
      } else setVerificationSent(true);
    } catch (e) {
      const code = e instanceof PortalError ? e.code : 'network';
      setError(t.errors[code as keyof typeof t.errors] ?? t.errors.generic);
    } finally {
      setBusy(false);
    }
  };
  if (verificationSent)
    return (
      <OpenLayout>
        <div className="p-auth-card">
          <h1>{t.auth.verifyTitle}</h1>
          <p className="p-lead" role="status">
            {t.auth.verifySent}
          </p>
          <Link to="/espace/connexion">{t.auth.backToLogin}</Link>
        </div>
      </OpenLayout>
    );
  return (
    <OpenLayout>
      <div className="p-auth-card" data-wide>
        <p className="p-eyebrow">{t.common.clientArea}</p>
        <h1>{t.auth.registerTitle}</h1>
        <p className="p-lead">{t.auth.registerLead}</p>
        <GoogleSignIn disabled={busy} />
        <form
          className="p-form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className="p-grid-2">
            <Field label={t.auth.firstName} error={show('firstName')}>
              {(id, d) => (
                <input
                  id={id}
                  aria-describedby={d}
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={set('firstName')}
                />
              )}
            </Field>
            <Field label={t.auth.lastName} error={show('lastName')}>
              {(id, d) => (
                <input
                  id={id}
                  aria-describedby={d}
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={set('lastName')}
                />
              )}
            </Field>
            <Field label={t.auth.organisation} error={show('organisation')}>
              {(id, d) => (
                <input
                  id={id}
                  aria-describedby={d}
                  autoComplete="organization"
                  value={form.organisation}
                  onChange={set('organisation')}
                />
              )}
            </Field>
            <Field label={t.auth.phone} optional>
              {(id) => (
                <input
                  id={id}
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={set('phone')}
                />
              )}
            </Field>
            <Field label={t.auth.email} error={show('email')}>
              {(id, d) => (
                <input
                  id={id}
                  aria-describedby={d}
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={set('email')}
                />
              )}
            </Field>
            <Field
              label={t.auth.password}
              help={t.auth.passwordHint}
              error={show('password')}
            >
              {(id, d) => (
                <input
                  id={id}
                  aria-describedby={d}
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={set('password')}
                />
              )}
            </Field>
          </div>
          <Field label={t.auth.message} help={t.auth.messageHelp} optional>
            {(id, d) => (
              <textarea
                id={id}
                aria-describedby={d}
                rows={3}
                value={form.message}
                onChange={set('message')}
              />
            )}
          </Field>
          <label
            className="p-check"
            data-invalid={show('consent') ? '' : undefined}
          >
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              <Fill
                text={t.auth.consent}
                values={{
                  link: (
                    <a
                      href="/politique-confidentialite"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t.auth.privacy}
                    </a>
                  ),
                }}
              />
            </span>
          </label>
          {show('consent') && (
            <p className="p-error">{t.auth.consentRequired}</p>
          )}
          {error && (
            <p className="p-error" role="alert">
              {error}
            </p>
          )}
          <p className="p-help">{t.auth.registerNote}</p>
          <Button type="submit" busy={busy} className="p-wide">
            {t.auth.register}
          </Button>
          <p className="p-auth-links">
            <span>
              {t.auth.haveAccount}{' '}
              <Link to="/espace/connexion">{t.auth.signIn}</Link>
            </span>
          </p>
        </form>
      </div>
    </OpenLayout>
  );
}

export function ForgotPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <OpenLayout>
      <div className="p-auth-card">
        <h1>{t.auth.forgotTitle}</h1>
        {sent ? (
          <p className="p-lead" role="status">
            {t.auth.linkSent}
          </p>
        ) : (
          <>
            <p className="p-lead">{t.auth.forgotLead}</p>
            <form
              className="p-form"
              onSubmit={async (event) => {
                event.preventDefault();
                setBusy(true);
                setError(null);
                try {
                  await api.requestPasswordReset(email);
                  setSent(true);
                } catch (e) {
                  const code = e instanceof PortalError ? e.code : 'network';
                  setError(t.errors[code] ?? t.errors.generic);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Field label={t.auth.email}>
                {(id) => (
                  <input
                    id={id}
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                )}
              </Field>
              {error && (
                <p className="p-error" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" busy={busy} className="p-wide">
                {t.auth.sendLink}
              </Button>
            </form>
          </>
        )}
        <p className="p-auth-links">
          <Link to="/espace/connexion">{t.auth.backToLogin}</Link>
        </p>
      </div>
    </OpenLayout>
  );
}

/** Destination for password-recovery and invitation links issued by Supabase Auth. */
export function ResetPasswordPage() {
  const { t } = useI18n();
  const { user } = useSession();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async () => {
    setError(null);
    if (password.length < 8) {
      setError(t.auth.passwordShort);
      return;
    }
    if (password !== confirm) {
      setError(t.auth.passwordMismatch);
      return;
    }
    setBusy(true);
    try {
      await api.setPassword(password);
      setSaved(true);
    } catch (e) {
      const code = e instanceof PortalError ? e.code : 'network';
      setError(t.errors[code] ?? t.errors.generic);
    } finally {
      setBusy(false);
    }
  };
  return (
    <OpenLayout>
      <div className="p-auth-card">
        <h1>{t.auth.resetTitle}</h1>
        {saved ? (
          <>
            <p role="status">{t.auth.passwordSaved}</p>
            <Link to={user ? home(user.role) : '/espace/connexion'}>
              {t.common.clientArea}
            </Link>
          </>
        ) : !user ? (
          <>
            <p className="p-error" role="alert">
              {t.auth.resetExpired}
            </p>
            <Link to="/espace/mot-de-passe">{t.auth.sendLink}</Link>
          </>
        ) : (
          <form
            className="p-form"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <Field label={t.auth.password} help={t.auth.passwordHint}>
              {(id) => (
                <input
                  id={id}
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              )}
            </Field>
            <Field label={t.auth.confirmPassword}>
              {(id) => (
                <input
                  id={id}
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                />
              )}
            </Field>
            {error && (
              <p className="p-error" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" busy={busy}>
              {t.auth.savePassword}
            </Button>
          </form>
        )}
      </div>
    </OpenLayout>
  );
}
