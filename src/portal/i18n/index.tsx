// The portal's language: the account's choice once signed in, before that the visitor's last
// choice or their browser's. Text comes from fr.ts / en.ts; dates are formatted in Paris time.
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { fr, type Dictionary } from './fr';
import { en } from './en';
import type { Locale } from '../api/types';
import { TEAM_ZONE } from '../lib/time';

const dictionaries: Record<Locale, Dictionary> = { fr, en };
const KEY = 'ldgenx-portal-locale';

function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'fr' || saved === 'en') return saved;
  } catch {
    // Storage blocked: fall back to the browser's language.
  }
  return navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

/** Replaces {name} placeholders. */
export function fill(text: string, values: Record<string, string | number> = {}) {
  return text.replace(/\{(\w+)\}/g, (match, key) => (key in values ? String(values[key]) : match));
}

/** A sentence with a number: zero (when given), one, or several. */
export interface CountForms {
  zero?: string;
  one: string;
  other: string;
}

interface I18n {
  t: Dictionary;
  /** The form for `n` (French puts 0 and 1 in the singular), with {count} and other values. */
  count: (forms: CountForms, n: number, values?: Record<string, string | number>) => string;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** 'lundi 26 octobre 2026' */
  date: (iso: string | number, options?: { weekday?: boolean; year?: boolean }) => string;
  /** '14:30' */
  time: (iso: string | number, zone?: string) => string;
  /** 'lundi 26 octobre, 14:30' */
  dateTime: (iso: string | number) => string;
  /** '26 oct.' */
  short: (iso: string | number) => string;
  /** 'il y a 2 heures', 'dans 4 jours' */
  relative: (iso: string | number) => string;
  size: (bytes: number) => string;
}

const Context = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setState] = useState<Locale>(initialLocale);
  const setLocale = useCallback((next: Locale) => {
    setState(next);
    document.documentElement.lang = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Not remembered: the choice holds for this visit.
    }
  }, []);
  const value = useMemo<I18n>(() => {
    const tag = locale === 'fr' ? 'fr-FR' : 'en-GB';
    const formatters = new Map<string, Intl.DateTimeFormat>();
    const fmt = (key: string, options: Intl.DateTimeFormatOptions) => {
      let f = formatters.get(key);
      if (!f)
        formatters.set(
          key,
          (f = new Intl.DateTimeFormat(tag, { timeZone: TEAM_ZONE, ...options })),
        );
      return f;
    };
    const rtf = new Intl.RelativeTimeFormat(tag, { numeric: 'auto' });
    return {
      t: dictionaries[locale],
      count: (forms, n, values = {}) => {
        const form =
          n === 0 && forms.zero
            ? forms.zero
            : n === 1 || (locale === 'fr' && n === 0)
              ? forms.one
              : forms.other;
        return fill(form, { count: n, ...values });
      },
      locale,
      setLocale,
      date: (iso, options = {}) =>
        fmt(`d${options.weekday !== false}${!!options.year}`, {
          weekday: options.weekday === false ? undefined : 'long',
          day: 'numeric',
          month: 'long',
          year: options.year ? 'numeric' : undefined,
        }).format(new Date(iso)),
      time: (iso, zone) =>
        new Intl.DateTimeFormat(tag, {
          timeZone: zone ?? TEAM_ZONE,
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(iso)),
      dateTime: (iso) =>
        fmt('dt', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(iso)),
      short: (iso) => fmt('s', { day: 'numeric', month: 'short' }).format(new Date(iso)),
      relative: (iso) => {
        const diff = new Date(iso).getTime() - Date.now();
        const abs = Math.abs(diff);
        const units: [Intl.RelativeTimeFormatUnit, number][] = [
          ['minute', 60_000],
          ['hour', 3_600_000],
          ['day', 86_400_000],
          ['week', 604_800_000],
          ['month', 2_592_000_000],
        ];
        if (abs < 60_000) return rtf.format(0, 'minute');
        let [unit, size] = units[0];
        for (const [u, s] of units) if (abs >= s) [unit, size] = [u, s];
        return rtf.format(Math.round(diff / size), unit);
      },
      size: (bytes) => {
        const units = locale === 'fr' ? ['o', 'Ko', 'Mo', 'Go'] : ['B', 'KB', 'MB', 'GB'];
        let value = bytes;
        let i = 0;
        while (value >= 1024 && i < units.length - 1) {
          value /= 1024;
          i++;
        }
        return `${new Intl.NumberFormat(tag, { maximumFractionDigits: i ? 1 : 0 }).format(value)} ${units[i]}`;
      },
    };
  }, [locale, setLocale]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useI18n() {
  const value = useContext(Context);
  if (!value) throw new Error('useI18n outside I18nProvider');
  return value;
}
