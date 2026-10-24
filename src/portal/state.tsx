// Session, data loading and messages to the user, shared by every screen.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { api, PortalError, type User } from './api';
import { useI18n } from './i18n';

/* ---------------------------------------------------------------- Data */

interface Loaded<T> {
  data: T | undefined;
  error: PortalError | null;
  loading: boolean;
  reload: () => void;
}

/** Loads with `load`, again when `deps` change and whenever the data changes anywhere. */
export function useData<T>(load: () => Promise<T>, deps: unknown[] = []): Loaded<T> {
  const [state, setState] = useState<{ data?: T; error: PortalError | null; loading: boolean }>({
    error: null,
    loading: true,
  });
  const latest = useRef(load);
  latest.current = load;
  const run = useRef(0);
  const reload = useCallback(() => {
    const ticket = ++run.current;
    setState((s) => ({ ...s, loading: true }));
    latest
      .current()
      .then((data) => ticket === run.current && setState({ data, error: null, loading: false }))
      .catch((error: unknown) => {
        if (ticket !== run.current) return;
        const portalError = error instanceof PortalError ? error : new PortalError('network');
        setState((s) => ({ ...s, error: portalError, loading: false }));
      });
  }, []);
  useEffect(reload, deps);
  useEffect(() => api.subscribe(reload), [reload]);
  return { data: state.data, error: state.error, loading: state.loading, reload };
}

/* ---------------------------------------------------------------- Toasts */

type ToastKind = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  text: string;
  kind: ToastKind;
}
const ToastContext = createContext<(text: string, kind?: ToastKind) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, kind: ToastKind = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list.slice(-2), { id, text, kind }]);
    setTimeout(
      () => setToasts((list) => list.filter((t) => t.id !== id)),
      kind === 'error' ? 6000 : 3500,
    );
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="p-toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="p-toast" data-kind={t.kind}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);

/** Runs an action, reports its error in the user's language, and returns its result. */
export function useAction() {
  const toast = useToast();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const run = useCallback(
    async <T,>(action: () => Promise<T>, success?: string): Promise<T | undefined> => {
      setBusy(true);
      try {
        const result = await action();
        if (success) toast(success);
        return result;
      } catch (error) {
        const code = error instanceof PortalError ? error.code : 'generic';
        toast(t.errors[code as keyof typeof t.errors] ?? t.errors.generic, 'error');
        return undefined;
      } finally {
        setBusy(false);
      }
    },
    [t, toast],
  );
  return { run, busy };
}

/* ---------------------------------------------------------------- Session */

interface Session {
  user: User | null;
  ready: boolean;
  /** `syncLocale`: take the account's language (at sign-in), or keep the one on screen. */
  setUser: (user: User | null, syncLocale?: boolean) => void;
  signOut: () => Promise<void>;
}
const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const { setLocale } = useI18n();
  const setUser = useCallback(
    (next: User | null, syncLocale = true) => {
      setUserState(next);
      if (next && syncLocale) setLocale(next.locale);
    },
    [setLocale],
  );
  useEffect(() => {
    const check = () =>
      api
        .currentUser()
        .then((current) => {
          setUserState(current);
          setReady(true);
        })
        .catch(() => setReady(true));
    check();
    return api.subscribe(check);
  }, []);
  const signOut = useCallback(async () => {
    await api.signOut();
    setUserState(null);
  }, []);
  return (
    <SessionContext.Provider value={{ user, ready, setUser, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}
export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession outside SessionProvider');
  return value;
}
/** The signed-in user, on screens that require one. */
export function useUser() {
  const { user } = useSession();
  if (!user) throw new PortalError('unauthenticated');
  return user;
}

/** Whether a media query matches, kept up to date. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, [query]);
  return matches;
}
