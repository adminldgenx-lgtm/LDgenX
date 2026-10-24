// The team's inbox: every client's conversation, and the messages sent through the contact form
// of the public site. On large screens the list and the open item sit side by side; on phones,
// one after the other.
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, Search } from 'lucide-react';
import { api, type Inquiry } from '../api';
import { fill, useI18n } from '../i18n';
import { useAction, useData, useMediaQuery } from '../state';
import { Avatar, Badge, Button, Empty, Loading, PageHeader, Tabs } from '../ui';
import { Thread } from '../shared';
import { InviteDialog } from './clients';

export function InboxPage() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const view = params.get('vue') === 'site' ? 'site' : 'clients';
  const threads = useData(() => api.listThreads(), []);
  const inquiries = useData(() => api.listInquiries(), []);
  const unread = (threads.data ?? []).reduce((sum, th) => sum + th.unread, 0);
  const fresh = (inquiries.data ?? []).filter((i) => i.status === 'new').length;
  return (
    <>
      <PageHeader title={t.nav.messages} lead={t.messages.adminLead} />
      <Tabs
        label={t.nav.messages}
        value={view}
        onChange={(next) => setParams(next === 'site' ? { vue: 'site' } : {}, { replace: true })}
        tabs={[
          ['clients', t.messages.clientsTab, unread],
          ['site', t.messages.siteTab, fresh],
        ]}
      />
      <div
        role="tabpanel"
        id={`panel-${view}`}
        aria-labelledby={`tab-${view}`}
        className="p-tabpanel"
      >
        {view === 'clients' ? <Conversations /> : <SiteMessages />}
      </div>
    </>
  );
}

function Conversations() {
  const { t, relative } = useI18n();
  const [params, setParams] = useSearchParams();
  const wide = useMediaQuery('(min-width: 900px)');
  const threads = useData(() => api.listThreads(), []);
  const clients = useData(() => api.listClients(), []);
  const [query, setQuery] = useState('');
  const byId = useMemo(() => new Map((clients.data ?? []).map((c) => [c.id, c])), [clients.data]);
  const q = query.trim().toLowerCase();
  const list = (threads.data ?? [])
    .filter((th) => byId.get(th.clientId)?.status !== 'disabled')
    .filter((th) => {
      const c = byId.get(th.clientId);
      return (
        !q ||
        (c &&
          [c.firstName, c.lastName, c.organisation, c.email].some((v) =>
            v.toLowerCase().includes(q),
          ))
      );
    })
    // Unread first, then the latest conversations, then clients without messages.
    .sort(
      (a, b) =>
        Number(b.unread > 0) - Number(a.unread > 0) ||
        (b.lastMessage?.createdAt ?? '').localeCompare(a.lastMessage?.createdAt ?? ''),
    );
  const selected = params.get('client') ?? (wide ? (list[0]?.clientId ?? null) : null);
  const client = selected ? byId.get(selected) : null;
  if (!threads.data || !clients.data) return <Loading lines={6} />;
  return (
    <div className="p-inbox" data-open={selected && !wide ? '' : undefined}>
      <div className="p-inbox-list">
        <label className="p-search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.messages.searchClients}
            aria-label={t.common.search}
          />
        </label>
        <ul>
          {list.map((th) => {
            const c = byId.get(th.clientId);
            if (!c) return null;
            const name = `${c.firstName} ${c.lastName}`;
            return (
              <li key={th.clientId}>
                <button
                  type="button"
                  className="p-inbox-item"
                  aria-current={selected === th.clientId || undefined}
                  data-unread={th.unread ? '' : undefined}
                  onClick={() => setParams({ client: th.clientId }, { replace: wide })}
                >
                  <Avatar name={name} colour="#2a7416" size={36} />
                  <span className="p-inbox-text">
                    <span className="p-inbox-top">
                      <strong>{name}</strong>
                      {th.lastMessage && (
                        <time dateTime={th.lastMessage.createdAt}>
                          {relative(th.lastMessage.createdAt)}
                        </time>
                      )}
                    </span>
                    <span className="p-inbox-sub">
                      <span className="p-muted">{c.organisation}</span>
                      {c.status === 'pending' && (
                        <Badge tone="green">{t.accountStatus.pending}</Badge>
                      )}
                    </span>
                    <span className="p-inbox-preview">
                      {th.lastMessage ? th.lastMessage.body || '📎' : t.messages.noMessage}
                    </span>
                  </span>
                  {!!th.unread && (
                    <span className="p-count" data-tone="green">
                      {th.unread}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="p-inbox-pane">
        {client ? (
          <>
            <header className="p-inbox-head">
              {!wide && (
                <button type="button" className="p-link" onClick={() => setParams({})}>
                  ← {t.common.back}
                </button>
              )}
              <div>
                <strong>
                  {client.firstName} {client.lastName}
                </strong>
                <span className="p-muted"> · {client.organisation}</span>
              </div>
              <Link
                to={`/admin/clients/${client.id}`}
                className="p-button"
                data-variant="secondary"
                data-size="small"
              >
                {t.messages.openClient}
              </Link>
            </header>
            <Thread key={client.id} clientId={client.id} />
          </>
        ) : (
          <Empty>{t.messages.chooseThread}</Empty>
        )}
      </div>
    </div>
  );
}

function SiteMessages() {
  const { t, relative } = useI18n();
  const [params, setParams] = useSearchParams();
  const wide = useMediaQuery('(min-width: 900px)');
  const inquiries = useData(() => api.listInquiries(), []);
  const list = inquiries.data ?? [];
  const selectedId = params.get('message') ?? (wide ? (list[0]?.id ?? null) : null);
  const selected = list.find((i) => i.id === selectedId) ?? null;
  // Opening a new message marks it as read.
  useEffect(() => {
    if (selected?.status === 'new') api.setInquiryStatus(selected.id, 'read').catch(() => {});
  }, [selected?.id, selected?.status]);
  useEffect(() => {
    api.markActivityRead({ kinds: ['inquiry'] }).catch(() => {});
  }, []);
  if (!inquiries.data) return <Loading lines={6} />;
  if (!list.length) return <Empty>{t.inquiries.empty}</Empty>;
  return (
    <div className="p-inbox" data-open={selected && !wide ? '' : undefined}>
      <div className="p-inbox-list">
        <ul>
          {list.map((i) => (
            <li key={i.id}>
              <button
                type="button"
                className="p-inbox-item"
                aria-current={selectedId === i.id || undefined}
                data-unread={i.status === 'new' ? '' : undefined}
                onClick={() => setParams({ vue: 'site', message: i.id }, { replace: wide })}
              >
                <Avatar name={i.name} colour="#2b7dc2" size={36} />
                <span className="p-inbox-text">
                  <span className="p-inbox-top">
                    <strong>{i.name}</strong>
                    <time dateTime={i.createdAt}>{relative(i.createdAt)}</time>
                  </span>
                  <span className="p-muted">{i.organisation}</span>
                  <span className="p-inbox-preview">{i.message}</span>
                </span>
                <Badge
                  tone={i.status === 'new' ? 'green' : i.status === 'done' ? 'neutral' : 'navy'}
                >
                  {t.inquiries.status[i.status]}
                </Badge>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-inbox-pane">
        {selected ? (
          <InquiryDetail
            inquiry={selected}
            onBack={wide ? undefined : () => setParams({ vue: 'site' })}
          />
        ) : (
          <Empty>{t.inquiries.choose}</Empty>
        )}
      </div>
    </div>
  );
}

function InquiryDetail({ inquiry: i, onBack }: { inquiry: Inquiry; onBack?: () => void }) {
  const { t, dateTime } = useI18n();
  const { run, busy } = useAction();
  const [inviting, setInviting] = useState(false);
  const [first, ...rest] = i.name.split(' ');
  const rows: [string, string][] = [
    [t.auth.organisation, i.organisation],
    [t.inquiries.sector, i.sector],
    [t.inquiries.material, i.material],
    [t.inquiries.timeline, i.timeline],
  ];
  return (
    <article className="p-inquiry">
      <header className="p-inbox-head">
        {onBack && (
          <button type="button" className="p-link" onClick={onBack}>
            ← {t.common.back}
          </button>
        )}
        <div>
          <strong>{i.name}</strong>
          <span className="p-muted">
            {' '}
            · {fill(t.inquiries.received, { date: dateTime(i.createdAt) })}
          </span>
        </div>
        <Badge tone={i.status === 'new' ? 'green' : i.status === 'done' ? 'neutral' : 'navy'}>
          {t.inquiries.status[i.status]}
        </Badge>
      </header>
      <div className="p-inquiry-body">
        <p>
          <Mail size={15} aria-hidden="true" /> <a href={`mailto:${i.email}`}>{i.email}</a>
        </p>
        <dl className="p-review">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value || <span className="p-muted">{t.inquiries.notGiven}</span>}</dd>
            </div>
          ))}
        </dl>
        <p className="p-inquiry-message">{i.message}</p>
        <div className="p-row">
          <a
            className="p-button"
            data-variant="primary"
            href={`mailto:${i.email}?subject=${encodeURIComponent(t.inquiries.replySubject)}`}
          >
            <Mail size={16} aria-hidden="true" /> {t.inquiries.reply}
          </a>
          <Button
            variant="secondary"
            busy={busy}
            onClick={() =>
              run(() => api.setInquiryStatus(i.id, i.status === 'done' ? 'read' : 'done'))
            }
          >
            {i.status === 'done' ? t.inquiries.reopen : t.inquiries.markDone}
          </Button>
          <Button variant="ghost" onClick={() => setInviting(true)}>
            {t.inquiries.invite}
          </Button>
        </div>
      </div>
      <InviteDialog
        open={inviting}
        onClose={() => setInviting(false)}
        initial={{
          firstName: first ?? '',
          lastName: rest.join(' '),
          email: i.email,
          organisation: i.organisation,
        }}
      />
    </article>
  );
}
