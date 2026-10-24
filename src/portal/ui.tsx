// The portal's building blocks. Native elements first (button, dialog, input), styled in
// portal.css; every control is reachable and usable with the keyboard.
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type DragEvent,
  type ReactNode,
} from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Upload, X } from 'lucide-react';
import type { AppointmentStatus } from './api';
import { fill, useI18n } from './i18n';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'quiet';

export function Button({
  variant = 'primary',
  busy = false,
  size,
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  busy?: boolean;
  size?: 'small';
}) {
  return (
    <button
      type="button"
      className={`p-button ${className}`}
      data-variant={variant}
      data-size={size}
      aria-busy={busy || undefined}
      {...props}
      disabled={props.disabled || busy}
    >
      {busy && <Loader2 className="p-spin" size={16} aria-hidden="true" />}
      {children}
    </button>
  );
}

export function LinkButton({
  to,
  variant = 'primary',
  size,
  children,
}: {
  to: string;
  variant?: Variant;
  size?: 'small';
  children: ReactNode;
}) {
  return (
    <Link to={to} className="p-button" data-variant={variant} data-size={size}>
      {children}
    </Link>
  );
}

/** A labelled control with its help and error; `children` receives the control's id. */
export function Field({
  label,
  help,
  error,
  optional,
  children,
  className = '',
}: {
  label: ReactNode;
  help?: ReactNode;
  error?: string | null;
  optional?: boolean;
  children: (id: string, describedBy?: string) => ReactNode;
  className?: string;
}) {
  const id = useId();
  const { t } = useI18n();
  const describedBy =
    [help && `${id}-help`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`p-field ${className}`} data-invalid={error ? '' : undefined}>
      <label htmlFor={id}>
        {label}
        {optional && <span className="p-optional"> ({t.common.optional})</span>}
      </label>
      {children(id, describedBy)}
      {help && (
        <p id={`${id}-help`} className="p-help">
          {help}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="p-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Several options shown as toggles (expertises, milieux). */
export function ChoiceChips({
  options,
  value,
  onChange,
  label,
}: {
  options: Record<string, string>;
  value: string[];
  onChange: (value: string[]) => void;
  label: string;
}) {
  return (
    <div className="p-chips" role="group" aria-label={label}>
      {Object.entries(options).map(([key, text]) => {
        const on = value.includes(key);
        return (
          <button
            key={key}
            type="button"
            className="p-chip"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((v) => v !== key) : [...value, key])}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}

/** One choice among a few, as a segmented control. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: [T, ReactNode][];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const known = options.some(([key]) => key === value);
  return (
    <div className="p-segmented" role="radiogroup" aria-label={label}>
      {options.map(([key, text], i) => (
        <button
          key={key}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={value === key}
          tabIndex={value === key || (!known && i === 0) ? 0 : -1}
          onClick={() => onChange(key)}
          onKeyDown={(event) => {
            const step = ['ArrowRight', 'ArrowDown'].includes(event.key)
              ? 1
              : ['ArrowLeft', 'ArrowUp'].includes(event.key)
                ? -1
                : 0;
            if (!step) return;
            event.preventDefault();
            const next = (i + step + options.length) % options.length;
            onChange(options[next][0]);
            refs.current[next]?.focus();
          }}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  help,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  help?: ReactNode;
}) {
  const id = useId();
  return (
    <div className="p-switch-row">
      <div>
        <label id={`${id}-label`} htmlFor={id}>
          {label}
        </label>
        {help && (
          <p id={`${id}-help`} className="p-help">
            {help}
          </p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={help ? `${id}-help` : undefined}
        className="p-switch"
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  );
}

const STATUS_TONE: Record<AppointmentStatus, string> = {
  requested: 'amber',
  confirmed: 'green',
  declined: 'neutral',
  cancelled: 'neutral',
};
/** An appointment's status, as a coloured label. */
export function StatusPill({ status }: { status: AppointmentStatus }) {
  const { t } = useI18n();
  return (
    <span className="p-pill" data-tone={STATUS_TONE[status]}>
      {t.booking.status[status]}
    </span>
  );
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: string }) {
  return (
    <span className="p-badge" data-tone={tone}>
      {children}
    </span>
  );
}

export function Avatar({
  name,
  colour,
  size = 32,
}: {
  name: string;
  colour?: string;
  size?: number;
}) {
  const initials = name
    .replace(/^Dr\s+/, '')
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span
      className="p-avatar"
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: size * 0.38, background: colour }}
    >
      {initials}
    </span>
  );
}

export function PageHeader({
  title,
  lead,
  actions,
  back,
}: {
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  back?: { to: string; label: string };
}) {
  return (
    <header className="p-page-header">
      <div>
        {back && (
          <Link className="p-back" to={back.to}>
            ← {back.label}
          </Link>
        )}
        <h1>{title}</h1>
        {lead && <p className="p-lead">{lead}</p>}
      </div>
      {actions && <div className="p-page-actions">{actions}</div>}
    </header>
  );
}

export function Card({
  title,
  action,
  children,
  className = '',
  pad = true,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <section className={`p-card ${className}`} data-pad={pad || undefined}>
      {(title || action) && (
        <header className="p-card-head">
          {title && <h2>{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Empty({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="p-empty">
      <p>{children}</p>
      {action}
    </div>
  );
}

export function Loading({ lines = 3 }: { lines?: number }) {
  const { t } = useI18n();
  return (
    <div className="p-skeleton" aria-busy="true" aria-label={t.common.loading}>
      {Array.from({ length: lines }, (_, i) => (
        <span key={i} style={{ width: `${90 - i * 12}%` }} />
      ))}
    </div>
  );
}

export function ErrorNote({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="p-empty" data-tone="error">
      <p>{t.errors.network}</p>
      <Button variant="secondary" onClick={onRetry}>
        {t.common.retry}
      </Button>
    </div>
  );
}

/** A modal dialog on the native element: focus is trapped and Escape closes it. */
export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  side = false,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  side?: boolean;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { t } = useI18n();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // The content takes focus, not the close button: no ring on a tap, and Tab leads on.
      dialog.querySelector<HTMLElement>('.p-dialog-body')?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="p-dialog"
      data-side={side || undefined}
      data-wide={wide || undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => event.target === ref.current && onClose()}
    >
      {open && (
        <div className="p-dialog-body" tabIndex={-1}>
          <header className="p-dialog-head">
            <h2>{title}</h2>
            <button
              type="button"
              className="p-icon-button"
              onClick={onClose}
              aria-label={t.common.close}
            >
              <X size={20} />
            </button>
          </header>
          <div className="p-dialog-content">{children}</div>
          {footer && <footer className="p-dialog-foot">{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}

/** Asks before a destructive action. */
export function useConfirm() {
  const { t } = useI18n();
  const [request, setRequest] = useState<{
    text: string;
    label: string;
    resolve: (ok: boolean) => void;
  } | null>(null);
  const ask = (text: string, label = t.common.confirm) =>
    new Promise<boolean>((resolve) => setRequest({ text, label, resolve }));
  const close = (ok: boolean) => {
    request?.resolve(ok);
    setRequest(null);
  };
  const element = (
    <Dialog
      open={!!request}
      onClose={() => close(false)}
      title={t.common.confirm}
      footer={
        <>
          <Button variant="ghost" onClick={() => close(false)}>
            {t.common.cancel}
          </Button>
          <Button variant="danger" onClick={() => close(true)}>
            {request?.label}
          </Button>
        </>
      }
    >
      <p>{request?.text}</p>
    </Dialog>
  );
  return { ask, element };
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: [T, ReactNode, number?][];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div className="p-tabs" role="tablist" aria-label={label}>
      {tabs.map(([key, text, count], i) => (
        <button
          key={key}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="tab"
          id={`tab-${key}`}
          aria-selected={value === key}
          aria-controls={value === key ? `panel-${key}` : undefined}
          tabIndex={value === key ? 0 : -1}
          onClick={() => onChange(key)}
          onKeyDown={(event) => {
            const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
            if (!step) return;
            const next = (i + step + tabs.length) % tabs.length;
            onChange(tabs[next][0]);
            refs.current[next]?.focus();
          }}
        >
          {text}
          {!!count && <span className="p-count">{count}</span>}
        </button>
      ))}
    </div>
  );
}

/** Drop or choose files. */
export function FileDrop({
  onFiles,
  compact = false,
}: {
  onFiles: (files: File[]) => void;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const drop = (event: DragEvent) => {
    event.preventDefault();
    setOver(false);
    const files = [...event.dataTransfer.files];
    if (files.length) onFiles(files);
  };
  const [before, after] = t.files.drop.split('{browse}');
  return (
    <div
      className="p-drop"
      data-over={over || undefined}
      data-compact={compact || undefined}
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={drop}
    >
      <Upload size={compact ? 18 : 22} aria-hidden="true" />
      <p>
        {over ? (
          t.files.dropActive
        ) : (
          <>
            {before}
            <button type="button" className="p-link" onClick={() => input.current?.click()}>
              {t.files.browse}
            </button>
            {after}
          </>
        )}
      </p>
      <input
        ref={input}
        type="file"
        multiple
        hidden
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          if (files.length) onFiles(files);
          event.target.value = '';
        }}
      />
    </div>
  );
}

/** Text with {key} placeholders, where some values are elements (links). */
export function Fill({ text, values }: { text: string; values: Record<string, ReactNode> }) {
  const parts = text.split(/(\{\w+\})/);
  return (
    <>
      {parts.map((part, i) => {
        const key = part.match(/^\{(\w+)\}$/)?.[1];
        return <span key={i}>{key && key in values ? values[key] : part}</span>;
      })}
    </>
  );
}
export { fill };

/** A day as a small calendar leaf: month above, day below, in Paris time. */
export function DateBlock({ iso }: { iso: string }) {
  const { locale } = useI18n();
  const tag = locale === 'fr' ? 'fr-FR' : 'en-GB';
  const options = { timeZone: 'Europe/Paris' } as const;
  return (
    <span className="p-date-block" aria-hidden="true">
      <span>
        {new Intl.DateTimeFormat(tag, { ...options, month: 'short' }).format(new Date(iso))}
      </span>
      <strong>
        {new Intl.DateTimeFormat(tag, { ...options, day: 'numeric' }).format(new Date(iso))}
      </strong>
    </span>
  );
}
