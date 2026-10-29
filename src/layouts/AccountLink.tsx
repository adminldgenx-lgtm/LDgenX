import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { UserRound, UserRoundCheck } from 'lucide-react';
import { useCatalog } from '../i18n';
import { portalEnabled } from '../content/site';

/** The public site and portal share Supabase Auth's persisted session. */
export function AccountLink() {
  const { ui } = useCatalog();
  const t = ui.header;
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (import.meta.env.SSR || !portalEnabled) return;
    let disposed = false;
    let unsubscribe: (() => void) | undefined;
    // Load Auth in the browser only: prerendered pages always start with the sign-in link.
    void import('../lib/supabase')
      .then(({ supabase }) => {
        if (disposed) return;
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          if (!disposed) setUser(session?.user ?? null);
        });
        unsubscribe = () => data.subscription.unsubscribe();
      })
      .catch(() => {
        // Keep a usable sign-in destination if the session cannot be loaded.
      });
    return () => {
      disposed = true;
      unsubscribe?.();
    };
  }, []);

  if (!portalEnabled) return null;
  const signedIn = user !== null;
  const Icon = signedIn ? UserRoundCheck : UserRound;
  return (
    <a
      className="header-account"
      href={signedIn ? '/espace' : '/espace/connexion'}
      data-signed-in={signedIn || undefined}
      aria-label={signedIn ? `${t.account} · ${t.signedIn}` : t.signIn}
      title={signedIn ? (user.email ?? t.signedIn) : t.signIn}
      onClick={() => {
        try {
          localStorage.setItem('ldgenx-portal-locale', ui.lang);
        } catch {
          // Navigation still works when browser storage is unavailable.
        }
      }}
    >
      <span className="header-account-icon">
        <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
        {signedIn && <span className="header-account-status" aria-hidden="true" />}
      </span>
      <span className="header-account-label">{signedIn ? t.account : t.signIn}</span>
    </a>
  );
}
