// Pieces used by both the client area and the administration.
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CalendarClock,
  Download,
  FileText,
  Paperclip,
  Pin,
  PinOff,
  Trash2,
  X,
} from 'lucide-react';
import {
  api,
  type Activity,
  type FileItem,
  type Message,
  type RetentionSettings,
  type Role,
} from './api';
import { fill, useI18n } from './i18n';
import { useAction, useData, useUser } from './state';
import { Avatar, Badge, Button, Empty, Loading, useConfirm } from './ui';
import { nextPurgeAfter } from './lib/retention';
import { saveBlob } from './lib/ics';
import { teamDay } from './lib/time';

/* ---------------------------------------------------------------- People */

export interface Person {
  name: string;
  organisation: string;
  role: Role;
}

/** Names of everyone the current user deals with. */
export function usePeople() {
  const user = useUser();
  const team = useData(() => api.listTeam(), []);
  const clients = useData(
    () => (user.role === 'admin' ? api.listClients() : Promise.resolve([])),
    [user.role],
  );
  return useMemo(() => {
    const map = new Map<string, Person>();
    for (const m of team.data ?? [])
      map.set(m.id, {
        name: `${m.firstName} ${m.lastName}`,
        organisation: 'LDgenX',
        role: 'admin',
      });
    for (const c of clients.data ?? [])
      map.set(c.id, {
        name: `${c.firstName} ${c.lastName}`,
        organisation: c.organisation,
        role: 'client',
      });
    map.set(user.id, {
      name: `${user.firstName} ${user.lastName}`,
      organisation: user.organisation,
      role: user.role,
    });
    return map;
  }, [team.data, clients.data, user]);
}

/* ---------------------------------------------------------------- Weekly deletion */

export function nextPurge(settings: RetentionSettings | undefined) {
  if (!settings?.enabled) return null;
  return nextPurgeAfter(Date.now(), settings);
}

/** The notice above a client's files: when the next deletion happens. */
export function RetentionNotice() {
  const { t, locale, dateTime, relative } = useI18n();
  const { data } = useData(() => api.getRetention(), []);
  const next = nextPurge(data);
  if (!data || !next) return null;
  return (
    <div className="p-notice" role="note">
      <CalendarClock size={20} aria-hidden="true" />
      <div>
        <strong>{t.retention.title}</strong>
        <p>{fill(data.notice[locale], { date: `${dateTime(next)} (${relative(next)})` })}</p>
      </div>
    </div>
  );
}

/** For a client: files from the team that the next deletion removes and that are not yet
 *  downloaded. */
export function ExpiringNotice() {
  const { t, dateTime, count } = useI18n();
  const user = useUser();
  const files = useData(() => api.listFiles(), []);
  const retention = useData(() => api.getRetention(), []);
  const next = nextPurge(retention.data);
  const soon = (files.data ?? []).filter(
    (f) =>
      f.direction === 'to_client' &&
      f.expiresAt &&
      next &&
      Date.parse(f.expiresAt) <= next &&
      !f.downloads.some((d) => d.userId === user.id),
  );
  if (!soon.length || !next) return null;
  return (
    <div className="p-notice" data-compact role="note">
      <CalendarClock size={20} aria-hidden="true" />
      <p>
        {count(t.messages.filesSoon, soon.length, { date: dateTime(next) })}{' '}
        <Link to="/espace/fichiers">{t.messages.seeFiles}</Link>
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- Files */

export async function downloadFile(file: FileItem) {
  saveBlob(await api.downloadFile(file.id), file.name);
}

export function FileRow({ file, people }: { file: FileItem; people: Map<string, Person> }) {
  const { t, short, relative, size } = useI18n();
  const user = useUser();
  const { run, busy } = useAction();
  const confirm = useConfirm();
  const admin = user.role === 'admin';
  const clientDownload = file.downloads.find((d) => d.userId === file.clientId);
  const mine = file.uploadedBy === user.id;
  const author = people.get(file.uploadedBy)?.name ?? t.common.unknown;
  return (
    <li className="p-file">
      <FileText className="p-file-icon" size={20} aria-hidden="true" />
      <div className="p-file-main">
        <p className="p-file-name">{file.name}</p>
        <p className="p-file-meta">
          {size(file.size)} · {short(file.createdAt)} · {fill(t.files.by, { name: author })}
        </p>
        {file.note && <p className="p-file-note">{file.note}</p>}
        <p className="p-file-meta">
          {file.kept || !file.expiresAt ? (
            <Badge tone="green">{t.retention.kept}</Badge>
          ) : (
            <Badge tone="amber">
              {fill(t.retention.expires, { date: relative(file.expiresAt) })}
            </Badge>
          )}
          {admin && file.direction === 'to_client' && (
            <Badge tone={clientDownload ? 'navy' : 'neutral'}>
              {clientDownload
                ? fill(t.files.downloadedOn, { date: relative(clientDownload.at) })
                : t.files.notDownloaded}
            </Badge>
          )}
          {!admin && file.direction === 'to_client' && !clientDownload && (
            <Badge tone="blue">{t.files.new}</Badge>
          )}
        </p>
      </div>
      <div className="p-file-actions">
        <Button
          variant="secondary"
          size="small"
          onClick={() => run(() => downloadFile(file))}
          aria-label={`${t.common.download} ${file.name}`}
        >
          <Download size={16} aria-hidden="true" />
          <span className="p-hide-small">{t.common.download}</span>
        </Button>
        {admin && (
          <Button
            variant="quiet"
            size="small"
            busy={busy}
            onClick={() => run(() => api.keepFile(file.id, !file.kept))}
            aria-label={`${file.kept ? t.retention.unkeep : t.retention.keep} ${file.name}`}
            title={t.retention.keptHelp}
          >
            {file.kept ? (
              <PinOff size={16} aria-hidden="true" />
            ) : (
              <Pin size={16} aria-hidden="true" />
            )}
          </Button>
        )}
        {(admin || mine) && (
          <Button
            variant="quiet"
            size="small"
            onClick={async () => {
              if (
                await confirm.ask(fill(t.files.deleteConfirm, { name: file.name }), t.common.delete)
              )
                run(() => api.deleteFile(file.id), t.files.deleted);
            }}
            aria-label={`${t.common.delete} ${file.name}`}
          >
            <Trash2 size={16} aria-hidden="true" />
          </Button>
        )}
      </div>
      {confirm.element}
    </li>
  );
}

/* ---------------------------------------------------------------- Conversation */

/** A client's conversation with the team; the team's messages sit on one side whoever wrote
 *  them, with their author's name. */
export function Thread({ clientId }: { clientId: string }) {
  const { t, date, time } = useI18n();
  const user = useUser();
  const people = usePeople();
  const messages = useData(() => api.listMessages(clientId), [clientId]);
  const files = useData(() => api.listFiles(clientId), [clientId]);
  const { run, busy } = useAction();
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const list = useRef<HTMLDivElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const count = messages.data?.length ?? 0;
  const lastId = messages.data?.at(-1)?.id;
  useEffect(() => {
    if (!count) return;
    api.markThreadRead(clientId).catch(() => {});
    // The thread opens on its latest message: only the thread scrolls, never the page.
    const box = list.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [count, lastId, clientId]);
  const send = async () => {
    if (!body.trim() && !attachments.length) return;
    const sent = await run(() => api.sendMessage(clientId, body, attachments));
    if (sent) {
      setBody('');
      setAttachments([]);
    }
  };
  const today = teamDay(Date.now());
  const yesterday = teamDay(Date.now() - 86_400_000);
  const dayLabel = (iso: string) => {
    const key = teamDay(Date.parse(iso));
    return key === today ? t.common.today : key === yesterday ? t.common.yesterday : date(iso);
  };
  const sameSide = (m: Message) =>
    user.role === 'admin' ? people.get(m.authorId)?.role === 'admin' : m.authorId === user.id;
  return (
    <div className="p-thread">
      <div ref={list} className="p-messages" aria-live="polite">
        {messages.loading && !messages.data ? (
          <Loading />
        ) : !count ? (
          <Empty>{user.role === 'admin' ? t.messages.emptyTeam : t.messages.empty}</Empty>
        ) : (
          messages.data!.map((m, i) => {
            const author = people.get(m.authorId);
            const own = sameSide(m);
            const fromTeam = author?.role === 'admin';
            const newDay =
              i === 0 ||
              teamDay(Date.parse(messages.data![i - 1].createdAt)) !==
                teamDay(Date.parse(m.createdAt));
            return (
              <Fragment key={m.id}>
                {newDay && (
                  <p className="p-day" role="separator">
                    <span>{dayLabel(m.createdAt)}</span>
                  </p>
                )}
                <article className="p-message" data-own={own || undefined}>
                  <Avatar name={author?.name ?? '?'} colour={fromTeam ? '#03254b' : '#2a7416'} />
                  <div className="p-bubble">
                    <header>
                      <strong>
                        {m.authorId === user.id ? t.common.you : (author?.name ?? t.common.unknown)}
                      </strong>
                      {fromTeam && m.authorId !== user.id && (
                        <span className="p-muted"> · LDgenX</span>
                      )}
                      <time dateTime={m.createdAt}>{time(m.createdAt)}</time>
                    </header>
                    {m.body && <p>{m.body}</p>}
                    {!!m.fileIds.length && (
                      <ul className="p-attachments">
                        {m.fileIds.map((fileId) => {
                          const f = files.data?.find((x) => x.id === fileId);
                          return (
                            <li key={fileId}>
                              {f ? (
                                <button
                                  type="button"
                                  className="p-attachment"
                                  onClick={() => run(() => downloadFile(f))}
                                >
                                  <Paperclip size={14} aria-hidden="true" /> {f.name}
                                </button>
                              ) : (
                                <span className="p-attachment" data-gone>
                                  <Paperclip size={14} aria-hidden="true" />{' '}
                                  {t.messages.attachmentGone}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </article>
              </Fragment>
            );
          })
        )}
      </div>
      <form
        className="p-composer"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        {!!attachments.length && (
          <ul className="p-attachments" data-pending>
            {attachments.map((f, i) => (
              <li key={i}>
                <span className="p-attachment">
                  <Paperclip size={14} aria-hidden="true" /> {f.name}
                </span>
                <button
                  type="button"
                  className="p-icon-button"
                  aria-label={fill(t.messages.removeAttachment, { name: f.name })}
                  onClick={() => setAttachments(attachments.filter((_, j) => j !== i))}
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="p-composer-row">
          <button
            type="button"
            className="p-icon-button"
            onClick={() => picker.current?.click()}
            aria-label={t.messages.attach}
            title={t.messages.attach}
          >
            <Paperclip size={19} />
          </button>
          <input
            ref={picker}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              setAttachments([...attachments, ...(e.target.files ?? [])]);
              e.target.value = '';
            }}
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t.messages.placeholder}
            aria-label={t.messages.placeholder}
            rows={1}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) send();
            }}
          />
          <Button type="submit" busy={busy} disabled={!body.trim() && !attachments.length}>
            {t.common.send}
          </Button>
        </div>
      </form>
    </div>
  );
}

/* ---------------------------------------------------------------- Notifications */

const TEAM_LINKS: Partial<Record<Activity['kind'], (a: Activity) => string>> = {
  message: (a) => `/admin/messages?client=${a.clientId}`,
  file_uploaded: (a) => `/admin/clients/${a.clientId}?onglet=files`,
  account_created: (a) => `/admin/clients/${a.clientId}`,
  inquiry: () => '/admin/messages?vue=site',
  purge: () => '/admin/parametres?onglet=files',
  appointment_requested: () => '/admin/demandes',
  change_requested: () => '/admin/demandes',
};
const CLIENT_LINKS: Partial<Record<Activity['kind'], string>> = {
  message: '/espace/messages',
  file_uploaded: '/espace/fichiers',
};

/** Where an activity leads, and its sentence, for the reader's role. */
export function useActivity() {
  const { t, dateTime, locale } = useI18n();
  const user = useUser();
  const booking = useData(() => api.getBookingConfig(), []);
  const sentences = user.role === 'admin' ? t.activity.team : t.activity.client;
  return {
    sentence(a: Activity) {
      const values: Record<string, string | number> = { ...a.data };
      if (typeof values.type === 'string')
        values.type =
          booking.data?.types.find((x) => x.id === values.type)?.label[locale] ?? values.type;
      if (typeof values.start === 'string') values.start = dateTime(values.start);
      return fill(sentences[a.kind] ?? t.activity.team[a.kind] ?? a.kind, values);
    },
    link(a: Activity) {
      if (user.role === 'admin') return (TEAM_LINKS[a.kind] ?? (() => '/admin/agenda'))(a);
      return CLIENT_LINKS[a.kind] ?? '/espace/rendez-vous';
    },
  };
}

/** The bell in the top bar: what others did, live. */
export function Notifications() {
  const { t, relative } = useI18n();
  const user = useUser();
  const activity = useData(() => api.listActivity(40), []);
  const { sentence, link } = useActivity();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const unread = activity.data?.filter((a) => !a.readBy.includes(user.id)) ?? [];
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);
  return (
    <div className="p-bell" ref={box}>
      <button
        type="button"
        className="p-icon-button"
        aria-expanded={open}
        aria-label={`${t.common.notifications}${unread.length ? ` (${unread.length})` : ''}`}
        onClick={() => setOpen(!open)}
      >
        <Bell size={20} />
        {!!unread.length && (
          <span className="p-bell-count">{unread.length > 9 ? '9+' : unread.length}</span>
        )}
      </button>
      {open && (
        <div className="p-popover" role="dialog" aria-label={t.common.notifications}>
          <header>
            <strong>{t.common.notifications}</strong>
            {!!unread.length && (
              <button type="button" className="p-link" onClick={() => api.markActivityRead()}>
                {t.common.markAllRead}
              </button>
            )}
          </header>
          {!activity.data?.length ? (
            <p className="p-muted p-pad">{t.common.noNotifications}</p>
          ) : (
            <ul>
              {activity.data.slice(0, 14).map((a) => (
                <li key={a.id} data-unread={!a.readBy.includes(user.id) || undefined}>
                  <Link
                    to={link(a)}
                    onClick={() => {
                      api.markActivityRead({ ids: [a.id] });
                      setOpen(false);
                    }}
                  >
                    <span>{sentence(a)}</span>
                    <time dateTime={a.at}>{relative(a.at)}</time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
