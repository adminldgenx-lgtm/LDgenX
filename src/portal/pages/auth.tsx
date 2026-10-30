import { useState, type InputHTMLAttributes } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { api, PortalError } from "../api";
import { useI18n } from "../i18n";
import { useSession } from "../state";
import { Button, Field, Fill } from "../ui";
import { OpenLayout } from "../layout";
import { GoogleSignIn } from "../GoogleSignIn";
import "../auth.css";

const home = (role: "admin" | "client") =>
  role === "admin" ? "/admin/messages" : "/espace/messages";

function PasswordInput(
  props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">,
) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  return (
    <div className="p-auth-password">
      <input {...props} type={visible ? "text" : "password"} />
      <button
        type="button"
        className="p-password-toggle"
        aria-label={visible ? t.auth.hidePassword : t.auth.showPassword}
        aria-controls={props.id}
        aria-pressed={visible}
        disabled={props.disabled}
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? (
          <EyeOff size={19} aria-hidden="true" />
        ) : (
          <Eye size={19} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

function PrivacyLink() {
  const { locale } = useI18n();
  return (
    <p className="p-auth-privacy">
      <a
        href={
          locale === "fr" ? "/politique-confidentialite" : "/en/privacy-policy"
        }
      >
        {locale === "fr" ? "Confidentialité" : "Privacy"}
      </a>
    </p>
  );
}

export function LoginPage({ admin = false }: { admin?: boolean }) {
  const { t } = useI18n();
  const { user, setUser } = useSession();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const requested = params.get("suite");
  const destination =
    requested &&
    new RegExp(`^/${user?.role === "admin" ? "admin" : "espace"}(?:/|$)`).test(
      requested,
    )
      ? requested
      : user
        ? home(user.role)
        : "/espace";
  if (user) return <Navigate to={destination} replace />;
  const signIn = async () => {
    if (busy || googleBusy) return;
    setBusy(true);
    setError(null);
    try {
      setUser(await api.signIn(email, password));
    } catch (e) {
      const code = e instanceof PortalError ? e.code : "network";
      setError(t.errors[code as keyof typeof t.errors] ?? t.errors.generic);
    } finally {
      setBusy(false);
    }
  };
  return (
    <OpenLayout>
      <div className="p-auth-card p-auth-access">
        <header className="p-auth-heading">
          {admin && <span className="p-auth-label">{t.common.admin}</span>}
          <h1>{t.auth.loginTitle}</h1>
          <p>{t.auth.loginLead}</p>
        </header>
        <GoogleSignIn
          admin={admin}
          disabled={busy}
          onBusyChange={setGoogleBusy}
        />
        <form
          className="p-form"
          aria-busy={busy || googleBusy}
          onSubmit={(event) => {
            event.preventDefault();
            void signIn();
          }}
        >
          <fieldset className="p-auth-fields" disabled={busy || googleBusy}>
            <Field label={t.auth.email}>
              {(id) => (
                <input
                  id={id}
                  type="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              )}
            </Field>
            <Field label={t.auth.password}>
              {(id) => (
                <PasswordInput
                  id={id}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
            </Field>
            <p className="p-auth-forgot">
              <Link to="/espace/mot-de-passe">{t.auth.forgot}</Link>
            </p>
            {error && (
              <p className="p-error p-auth-error" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" busy={busy} className="p-wide">
              {t.auth.signIn}
            </Button>
          </fieldset>
        </form>
        {!admin && (
          <p className="p-auth-switch">
            {t.auth.noAccount}{" "}
            <Link to="/espace/inscription">{t.auth.createAccount}</Link>
          </p>
        )}
        <PrivacyLink />
      </div>
    </OpenLayout>
  );
}

export function RegisterPage() {
  const { t, locale } = useI18n();
  const { user, setUser } = useSession();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    organisation: "",
    phone: "",
    password: "",
    message: "",
  });
  const [consent, setConsent] = useState(false);
  const [tried, setTried] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
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
    if (busy || googleBusy) return;
    setTried(true);
    if (Object.values(errors).some(Boolean)) return;
    setBusy(true);
    setError(null);
    try {
      const created = await api.signUp({ ...form, locale });
      if (created) setUser(created);
      else setVerificationSent(true);
    } catch (e) {
      const code = e instanceof PortalError ? e.code : "network";
      setError(t.errors[code as keyof typeof t.errors] ?? t.errors.generic);
    } finally {
      setBusy(false);
    }
  };
  if (verificationSent)
    return (
      <OpenLayout>
        <div className="p-auth-card p-auth-access">
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
      <div className="p-auth-card p-auth-access" data-register>
        <header className="p-auth-heading">
          <h1>{t.auth.registerTitle}</h1>
        </header>
        <GoogleSignIn disabled={busy} onBusyChange={setGoogleBusy} />
        <form
          className="p-form"
          noValidate
          aria-busy={busy || googleBusy}
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <fieldset className="p-auth-fields" disabled={busy || googleBusy}>
            <div className="p-auth-names">
              <Field label={t.auth.firstName} error={show("firstName")}>
                {(id, d) => (
                  <input
                    id={id}
                    aria-describedby={d}
                    aria-invalid={!!show("firstName")}
                    autoComplete="given-name"
                    required
                    value={form.firstName}
                    onChange={set("firstName")}
                  />
                )}
              </Field>
              <Field label={t.auth.lastName} error={show("lastName")}>
                {(id, d) => (
                  <input
                    id={id}
                    aria-describedby={d}
                    aria-invalid={!!show("lastName")}
                    autoComplete="family-name"
                    required
                    value={form.lastName}
                    onChange={set("lastName")}
                  />
                )}
              </Field>
            </div>
            <Field label={t.auth.organisation} error={show("organisation")}>
              {(id, d) => (
                <input
                  id={id}
                  aria-describedby={d}
                  aria-invalid={!!show("organisation")}
                  autoComplete="organization"
                  required
                  value={form.organisation}
                  onChange={set("organisation")}
                />
              )}
            </Field>
            <Field label={t.auth.email} error={show("email")}>
              {(id, d) => (
                <input
                  id={id}
                  aria-describedby={d}
                  aria-invalid={!!show("email")}
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  value={form.email}
                  onChange={set("email")}
                />
              )}
            </Field>
            <Field
              label={t.auth.password}
              help={t.auth.passwordHint}
              error={show("password")}
            >
              {(id, d) => (
                <PasswordInput
                  id={id}
                  aria-describedby={d}
                  aria-invalid={!!show("password")}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={set("password")}
                />
              )}
            </Field>
            <div>
              <label
                className="p-check p-auth-consent"
                data-invalid={show("consent") ? "" : undefined}
              >
                <input
                  type="checkbox"
                  checked={consent}
                  required
                  aria-invalid={!!show("consent")}
                  aria-describedby={
                    show("consent") ? "signup-consent-error" : undefined
                  }
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                  <Fill
                    text={t.auth.consent}
                    values={{
                      link: (
                        <a
                          href={
                            locale === "fr"
                              ? "/politique-confidentialite"
                              : "/en/privacy-policy"
                          }
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
              {show("consent") && (
                <p id="signup-consent-error" className="p-error" role="alert">
                  {t.auth.consentRequired}
                </p>
              )}
            </div>
            {error && (
              <p className="p-error p-auth-error" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" busy={busy} className="p-wide">
              {t.auth.register}
            </Button>
          </fieldset>
        </form>
        <p className="p-auth-approval">{t.auth.registerNote}</p>
        <p className="p-auth-switch">
          {t.auth.haveAccount}{" "}
          <Link to="/espace/connexion">{t.auth.signIn}</Link>
        </p>
      </div>
    </OpenLayout>
  );
}

export function ForgotPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <OpenLayout>
      <div className="p-auth-card p-auth-access">
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
                  const code = e instanceof PortalError ? e.code : "network";
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
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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
      const code = e instanceof PortalError ? e.code : "network";
      setError(t.errors[code] ?? t.errors.generic);
    } finally {
      setBusy(false);
    }
  };
  return (
    <OpenLayout>
      <div className="p-auth-card p-auth-access">
        <h1>{t.auth.resetTitle}</h1>
        {saved ? (
          <>
            <p role="status">{t.auth.passwordSaved}</p>
            <Link to={user ? home(user.role) : "/espace/connexion"}>
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
                <PasswordInput
                  id={id}
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
                <PasswordInput
                  id={id}
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
