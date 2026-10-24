// The team's clients: the list, and each client's page with their conversation, the files
// dropped for them and their appointments.
import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CalendarPlus, Mail, Phone, Search, UserPlus } from 'lucide-react';
import { api, type Appointment, type InviteInput, type User } from '../api';
import { fill, useI18n } from '../i18n';
import { useAction, useData } from '../state';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  Empty,
  ErrorNote,
  Field,
  FileDrop,
  Loading,
  PageHeader,
  Segmented,
  Tabs,
} from '../ui';
import { FileRow, nextPurge, Thread, usePeople } from '../shared';
import { AppointmentPanel, NewDialog, TeamAppointmentRow, type NewDraft } from '../team';
import { teamDay } from '../lib/time';

const statusTone = (status: User['status']) =>
  status === 'pending' ? 'green' : status === 'disabled' ? 'neutral' : 'navy';

export function ClientsPage() {
  const { t, relative, count: plural } = useI18n();
  const clients = useData(() => api.listClients(), []);
  const threads = useData(() => api.listThreads(), []);
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [inviting, setInviting] = useState(false);
  const status = (params.get('statut') as User['status'] | 'all' | null) ?? 'all';
  const unread = useMemo(
    () => new Map((threads.data ?? []).map((th) => [th.clientId, th.unread])),
    [threads.data],
  );
  const q = query.trim().toLowerCase();
  const shown = (clients.data ?? [])
    .filter((c) => status === 'all' || c.status === status)
    .filter(
      (c) =>
        !q ||
        [c.firstName, c.lastName, c.organisation, c.email].some((v) => v.toLowerCase().includes(q)),
    )
    .sort(
      (a, b) =>
        Number(b.status === 'pending') - Number(a.status === 'pending') ||
        a.organisation.localeCompare(b.organisation),
    );
  return (
    <>
      <PageHeader
        title={t.nav.clients}
        lead={t.clients.lead}
        actions={
          <Button onClick={() => setInviting(true)}>
            <UserPlus size={18} aria-hidden="true" /> {t.clients.invite}
          </Button>
        }
      />
      <div className="p-toolbar">
        <label className="p-search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.clients.search}
            aria-label={t.common.search}
          />
        </label>
        <Segmented
          label={t.nav.clients}
          value={status}
          onChange={(next) => setParams(next === 'all' ? {} : { statut: next }, { replace: true })}
          options={[
            ['all', t.common.all],
            ['pending', t.accountStatus.pending],
            ['active', t.accountStatus.active],
            ['disabled', t.accountStatus.disabled],
          ]}
        />
      </div>
      <Card pad={false}>
        {clients.error ? (
          <ErrorNote onRetry={clients.reload} />
        ) : !clients.data ? (
          <Loading lines={5} />
        ) : !shown.length ? (
          <Empty>{t.clients.empty}</Empty>
        ) : (
          <ul className="p-list">
            {shown.map((c) => {
              const unreadCount = unread.get(c.id) ?? 0;
              return (
                <li key={c.id}>
                  <Link to={`/admin/clients/${c.id}`} className="p-list-row">
                    <Avatar name={`${c.firstName} ${c.lastName}`} colour="#2a7416" />
                    <span className="p-list-main">
                      <strong>
                        {c.firstName} {c.lastName} · {c.organisation}
                      </strong>
                      <span className="p-muted">
                        {c.email} ·{' '}
                        {fill(t.clients.lastSeen, {
                          date: c.lastSeenAt ? relative(c.lastSeenAt) : t.clients.never,
                        })}
                      </span>
                    </span>
                    {!!unreadCount && (
                      <Badge tone="green">{plural(t.messages.unread, unreadCount)}</Badge>
                    )}
                    <Badge tone={statusTone(c.status)}>{t.accountStatus[c.status]}</Badge>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      <InviteDialog open={inviting} onClose={() => setInviting(false)} />
    </>
  );
}

export function InviteDialog({
  open,
  onClose,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Partial<InviteInput>;
}) {
  const { t, locale } = useI18n();
  const { run, busy } = useAction();
  const blank = { email: '', firstName: '', lastName: '', organisation: '', locale, ...initial };
  const [form, setForm] = useState(blank);
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setForm(blank);
  }
  const valid =
    /^\S+@\S+\.\S+$/.test(form.email) && !!form.firstName.trim() && !!form.organisation.trim();
  const set = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm({ ...form, [key]: event.target.value });
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t.clients.invite}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button
            busy={busy}
            disabled={!valid}
            onClick={async () => {
              const done = await run(
                () => api.inviteClient(form),
                fill(t.clients.invited, { email: form.email }),
              );
              if (done) onClose();
            }}
          >
            {t.clients.invite}
          </Button>
        </>
      }
    >
      <p className="p-muted">{t.clients.inviteLead}</p>
      <div className="p-form">
        <div className="p-grid-2">
          <Field label={t.auth.firstName}>
            {(id) => <input id={id} value={form.firstName} onChange={set('firstName')} />}
          </Field>
          <Field label={t.auth.lastName}>
            {(id) => <input id={id} value={form.lastName} onChange={set('lastName')} />}
          </Field>
        </div>
        <Field label={t.auth.email}>
          {(id) => <input id={id} type="email" value={form.email} onChange={set('email')} />}
        </Field>
        <Field label={t.auth.organisation}>
          {(id) => <input id={id} value={form.organisation} onChange={set('organisation')} />}
        </Field>
        <Field label={t.account.languagePref}>
          {(id) => (
            <select id={id} value={form.locale} onChange={set('locale')}>
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          )}
        </Field>
      </div>
    </Dialog>
  );
}

const TABS = ['messages', 'files', 'appointments'] as const;
type Tab = (typeof TABS)[number];

export function ClientPage() {
  const { id = '' } = useParams();
  const { t, date, relative } = useI18n();
  const [params, setParams] = useSearchParams();
  // An unknown tab in the address opens the first one.
  const tab: Tab = TABS.find((x) => x === params.get('onglet')) ?? 'messages';
  const client = useData(() => api.getUser(id), [id]);
  const threads = useData(() => api.listThreads(), []);
  const files = useData(() => api.listFiles(id), [id]);
  const appointments = useData(() => api.listAppointments(), []);
  const { run, busy } = useAction();
  if (client.error) return <ErrorNote onRetry={client.reload} />;
  if (!client.data) return <Loading lines={6} />;
  const c = client.data;
  const unread = threads.data?.find((th) => th.clientId === id)?.unread ?? 0;
  const theirs = (appointments.data ?? []).filter((a) => a.clientId === id);
  const live = theirs.filter(
    (a) => (a.status === 'requested' || a.status === 'confirmed') && Date.parse(a.end) > Date.now(),
  ).length;
  return (
    <>
      <PageHeader
        back={{ to: '/admin/clients', label: t.nav.clients }}
        title={`${c.firstName} ${c.lastName}`}
        lead={
          <span className="p-client-meta">
            <span>{c.organisation}</span>
            <Badge tone={statusTone(c.status)}>{t.accountStatus[c.status]}</Badge>
            <a href={`mailto:${c.email}`}>
              <Mail size={14} aria-hidden="true" /> {c.email}
            </a>
            {c.phone && (
              <a href={`tel:${c.phone.replace(/\s/g, '')}`}>
                <Phone size={14} aria-hidden="true" /> {c.phone}
              </a>
            )}
            <span className="p-muted">
              {fill(t.clients.since, { date: date(c.createdAt, { weekday: false, year: true }) })}
              {' · '}
              {fill(t.clients.lastSeen, {
                date: c.lastSeenAt ? relative(c.lastSeenAt) : t.clients.never,
              })}
            </span>
          </span>
        }
        actions={
          <>
            {c.status === 'pending' && (
              <Button
                busy={busy}
                onClick={() => run(() => api.setAccountStatus(c.id, 'active'), t.clients.approved)}
              >
                {t.clients.approve}
              </Button>
            )}
            {c.status === 'active' && (
              <Button
                variant="ghost"
                busy={busy}
                onClick={() =>
                  run(() => api.setAccountStatus(c.id, 'disabled'), t.clients.disabled)
                }
              >
                {t.clients.disable}
              </Button>
            )}
            {c.status === 'disabled' && (
              <Button
                variant="secondary"
                busy={busy}
                onClick={() => run(() => api.setAccountStatus(c.id, 'active'), t.common.saved)}
              >
                {t.clients.enable}
              </Button>
            )}
          </>
        }
      />
      <Tabs
        label={`${c.firstName} ${c.lastName}`}
        value={tab}
        onChange={(next) => setParams({ onglet: next }, { replace: true })}
        tabs={[
          ['messages', t.clients.tabs.messages, unread],
          ['files', t.clients.tabs.files, files.data?.length],
          ['appointments', t.clients.tabs.appointments, live],
        ]}
      />
      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="p-tabpanel"
      >
        {tab === 'messages' && (
          <Card pad={false} className="p-thread-card">
            <Thread clientId={c.id} />
          </Card>
        )}
        {tab === 'files' && <ClientFiles client={c} />}
        {tab === 'appointments' && (
          <ClientAppointments client={c} list={theirs} loading={!appointments.data} />
        )}
      </div>
    </>
  );
}

function ClientFiles({ client }: { client: User }) {
  const { t, dateTime, relative, count: plural } = useI18n();
  const files = useData(() => api.listFiles(client.id), [client.id]);
  const retention = useData(() => api.getRetention(), []);
  const people = usePeople();
  const { run, busy } = useAction();
  const [note, setNote] = useState('');
  const upload = (list: File[]) =>
    run(
      async () => {
        for (const file of list) await api.uploadFile(client.id, file, note);
        setNote('');
      },
      plural(t.files.uploaded, list.length),
    );
  const toClient = (files.data ?? []).filter((f) => f.direction === 'to_client');
  const fromClient = (files.data ?? []).filter((f) => f.direction === 'from_client');
  const purgeAt = nextPurge(retention.data);
  return (
    <div className="p-stack">
      <Card title={fill(t.files.dropFor, { name: `${client.firstName} ${client.lastName}` })}>
        <div className="p-upload">
          <FileDrop onFiles={upload} />
          <label className="p-inline-field">
            <span>{t.files.note}</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} disabled={busy} />
          </label>
        </div>
        <p className="p-help">
          {purgeAt
            ? fill(t.retention.next, { date: `${dateTime(purgeAt)} (${relative(purgeAt)})` })
            : t.retention.off}
          {' · '}
          <Link to="/admin/parametres?onglet=files">{t.nav.settings}</Link>
        </p>
      </Card>
      <Card title={t.files.toClient} pad={false}>
        {!files.data ? (
          <Loading />
        ) : toClient.length ? (
          <ul className="p-files">
            {toClient.map((f) => (
              <FileRow key={f.id} file={f} people={people} />
            ))}
          </ul>
        ) : (
          <Empty>{t.files.emptyTeam}</Empty>
        )}
      </Card>
      <Card title={t.files.fromClient} pad={false}>
        {!files.data ? (
          <Loading />
        ) : fromClient.length ? (
          <ul className="p-files">
            {fromClient.map((f) => (
              <FileRow key={f.id} file={f} people={people} />
            ))}
          </ul>
        ) : (
          <Empty>{t.files.emptyReceived}</Empty>
        )}
      </Card>
    </div>
  );
}

function ClientAppointments({
  client,
  list,
  loading,
}: {
  client: User;
  list: Appointment[];
  loading: boolean;
}) {
  const { t } = useI18n();
  const config = useData(() => api.getBookingConfig(), []);
  const [draft, setDraft] = useState<NewDraft | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const now = Date.now();
  const upcoming = list.filter(
    (a) => (a.status === 'requested' || a.status === 'confirmed') && Date.parse(a.end) > now,
  );
  const past = list.filter((a) => !upcoming.includes(a)).reverse();
  if (loading || !config.data) return <Loading lines={4} />;
  const cfg = config.data;
  return (
    <div className="p-stack">
      <div className="p-row">
        <Button
          onClick={() =>
            setDraft({ day: teamDay(now + 86_400_000), minutes: 10 * 60, clientId: client.id })
          }
        >
          <CalendarPlus size={18} aria-hidden="true" /> {t.clients.schedule}
        </Button>
      </div>
      <Card title={t.booking.upcoming} pad={false}>
        {upcoming.length ? (
          <ul className="p-appointments">
            {upcoming.map((a) => (
              <TeamAppointmentRow
                key={a.id}
                appointment={a}
                config={cfg}
                onOpen={(x) => setOpen(x.id)}
              />
            ))}
          </ul>
        ) : (
          <Empty>{t.booking.none}</Empty>
        )}
      </Card>
      {!!past.length && (
        <Card title={t.booking.past} pad={false}>
          <ul className="p-appointments">
            {past.map((a) => (
              <TeamAppointmentRow
                key={a.id}
                appointment={a}
                config={cfg}
                onOpen={(x) => setOpen(x.id)}
              />
            ))}
          </ul>
        </Card>
      )}
      <NewDialog draft={draft} config={cfg} onClose={() => setDraft(null)} />
      <AppointmentPanel
        appointment={list.find((a) => a.id === open) ?? null}
        config={cfg}
        onClose={() => setOpen(null)}
      />
    </div>
  );
}
