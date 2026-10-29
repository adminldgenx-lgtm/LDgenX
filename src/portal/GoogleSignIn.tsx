import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { portalSiteOrigin } from "../../supabase/functions/_shared/site";
import { useI18n } from "./i18n";
import { Button } from "./ui";

/** Basic identity scopes only. Connecting the team's calendar is a separate administrator action. */
export function GoogleSignIn({
  admin = false,
  disabled = false,
}: {
  admin?: boolean;
  disabled?: boolean;
}) {
  const { locale } = useI18n(),
    fr = locale === "fr",
    [params] = useSearchParams(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  if (import.meta.env.VITE_GOOGLE_AUTH_ENABLED !== "1") return null;
  const start = async () => {
    setBusy(true);
    setError("");
    try {
      const target = params.get("suite");
      const next =
        target && /^\/(?:admin|espace)(?:\/|$)/.test(target)
          ? target
          : admin
            ? "/admin/messages"
            : "/espace";
      const callback = new URL(
        "/espace/connexion",
        portalSiteOrigin(window.location.origin),
      );
      callback.searchParams.set("lang", locale);
      callback.searchParams.set("suite", next);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callback.href,
          scopes: "openid",
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
    } catch {
      setError(
        fr
          ? "La connexion Google n’a pas pu démarrer. Réessayez ou utilisez votre mot de passe."
          : "Google sign-in could not start. Please retry or use your password.",
      );
      setBusy(false);
    }
  };
  return (
    <div className="p-google-auth">
      <Button
        className="p-wide p-google"
        variant="secondary"
        busy={busy}
        disabled={disabled}
        onClick={start}
      >
        <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5h6.6c3.9-3.6 6.1-8.8 6.1-14.9Z"
          />
          <path
            fill="#34A853"
            d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5a12.2 12.2 0 0 1-18.2-6.4H5.9v5.2A20.4 20.4 0 0 0 24 44Z"
          />
          <path
            fill="#FBBC05"
            d="M12.7 27.7a12.2 12.2 0 0 1 0-7.4v-5.2H5.9a20 20 0 0 0 0 17.8l6.8-5.2Z"
          />
          <path
            fill="#EA4335"
            d="M24 11.8c3 0 5.7 1 7.8 3.1l5.8-5.8A19.5 19.5 0 0 0 24 4 20.4 20.4 0 0 0 5.9 15.1l6.8 5.2A12 12 0 0 1 24 11.8Z"
          />
        </svg>
        {fr ? "Continuer avec Google" : "Continue with Google"}
      </Button>
      <p className="p-help">
        {fr
          ? "Ouvrez ou créez votre compte LDgenX avec Google."
          : "Sign in or create your LDgenX account with Google."}{" "}
        <a
          href={fr ? "/politique-confidentialite" : "/en/privacy-policy"}
          target="_blank"
          rel="noreferrer"
        >
          {fr ? "Confidentialité" : "Privacy"}
        </a>
      </p>
      {(error || params.get("error")) && (
        <p className="p-error" role="alert">
          {error ||
            (fr
              ? "Connexion Google annulée ou refusée. Vous pouvez réessayer."
              : "Google sign-in was cancelled or declined. You can retry.")}
        </p>
      )}
      <div className="p-auth-divider">
        <span>
          {fr ? "ou avec votre adresse e-mail" : "or with your email address"}
        </span>
      </div>
    </div>
  );
}
