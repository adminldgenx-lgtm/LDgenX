import { CalendarSyncInfo } from './CalendarSyncInfo';
// The team's actions on appointments, shared by the requests, the calendar and the client pages:
// answering a request (confirm, another time, decline), answering a change, moving, creating an
// appointment or blocking time, and the detail panel of one appointment.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import {
  api,
  type Appointment,
  type BookingConfig,
  type Slot,
  type TimeBlock,
} from './api';
import { fill, useI18n } from './i18n';
import { useAction, useData } from './state';
import {
  Badge,
  Button,
  DateBlock,
  Dialog,
  Field,
  Segmented,
  StatusPill,
  useConfirm,
} from './ui';
import { usePeople } from './shared';
import { AddToCalendar, SlotPicker } from './booking';
import {
  addDays,
  atMinutes,
  hhmm,
  minutesOf,
  teamDay,
  wallTime,
  weekdayOf,
  type DayKey,
} from './lib/time';

/** Who an appointment is with: a client, or a visitor of the site. */
export function useWho() {
  const people = usePeople();
  return (a: Appointment) => {
    const client = a.clientId ? people.get(a.clientId) : null;
    return {
      name: client?.name ?? a.guest?.name ?? '—',
      organisation: client?.organisation ?? a.guest?.organisation ?? '',
      guest: !a.clientId,
      email: a.guest?.email ?? '',
      phone: a.guest?.phone ?? '',
    };
  };
}

/** Whether a time falls outside the person's opening hours (or on a closed day). */
export function outsideHours(
  config: BookingConfig,
  hostId: string,
  start: number,
  minutes: number,
) {
  const key = teamDay(start);
  if (config.closedDays.includes(key)) return true;
  const w = wallTime(start);
  const from = w.hour * 60 + w.minute;
  return !config.rules.some(
    (r) =>
      r.hostId === hostId &&
      r.weekday === weekdayOf(key) &&
      minutesOf(r.start) <= from &&
      from + minutes <= minutesOf(r.end),
  );
}

function HostSelect({
  config,
  value,
  onChange,
  only,
}: {
  config: BookingConfig;
  value: string;
  onChange: (id: string) => void;
  only?: string[];
}) {
  const { t } = useI18n();
  return (
    <Field label={t.agenda.host}>
      {(id) => (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {config.hosts
            .filter((h) => !only || only.includes(h.id))
            .map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
        </select>
      )}
    </Field>
  );
}

/** Confirm, confirm at another time, or decline a request. */
export function RequestActions({
  appointment: a,
  config,
}: {
  appointment: Appointment;
  config: BookingConfig;
}) {
  const { t, date, time } = useI18n();
  const { run, busy } = useAction();
  const [open, setOpen] = useState<'confirm' | 'other' | 'decline' | null>(
    null,
  );
  const [hostId, setHostId] = useState(a.hostId);
  const [meetingUrl, setMeetingUrl] = useState(a.meetingUrl);
  const [reply, setReply] = useState('');
  const [slot, setSlot] = useState<Slot | null>(null);
  const close = () => {
    setOpen(null);
    setReply('');
    setSlot(null);
  };
  const answer = async (accept: boolean, extra: { start?: string } = {}) => {
    const done = await run(
      () =>
        api.respondToRequest(a.id, {
          accept,
          reply,
          hostId,
          meetingUrl,
          ...extra,
        }),
      accept ? t.requests.confirmed : t.requests.declined,
    );
    if (done) close();
  };
  const replyField = (placeholder?: string) => (
    <Field label={t.requests.reply} optional>
      {(id) => (
        <textarea
          id={id}
          rows={3}
          placeholder={placeholder}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
      )}
    </Field>
  );
  const linkField = (
    <Field label={t.agenda.meetingUrl} optional>
      {(id) => (
        <input
          id={id}
          type="url"
          placeholder="https://"
          value={meetingUrl}
          onChange={(e) => setMeetingUrl(e.target.value)}
        />
      )}
    </Field>
  );
  return (
    <>
      <div className="p-request-actions">
        <Button size="small" onClick={() => setOpen('confirm')}>
          {t.requests.confirm}
        </Button>
        <Button
          size="small"
          variant="secondary"
          onClick={() => setOpen('other')}
        >
          {t.requests.otherTime}
        </Button>
        <Button size="small" variant="ghost" onClick={() => setOpen('decline')}>
          {t.requests.decline}
        </Button>
      </div>
      <Dialog
        open={open === 'confirm'}
        onClose={close}
        title={t.requests.confirmTitle}
        footer={
          <>
            <Button variant="ghost" onClick={close}>
              {t.common.cancel}
            </Button>
            <Button busy={busy} onClick={() => answer(true)}>
              {t.requests.confirm}
            </Button>
          </>
        }
      >
        <p className="p-big">
          {date(a.start)} · {time(a.start)}–{time(a.end)}
        </p>
        <HostSelect config={config} value={hostId} onChange={setHostId} />
        {linkField}
        {replyField()}
      </Dialog>
      <Dialog
        open={open === 'other'}
        onClose={close}
        title={t.requests.otherTimeTitle}
        wide
        footer={
          <>
            <Button variant="ghost" onClick={close}>
              {t.common.cancel}
            </Button>
            <Button
              busy={busy}
              disabled={!slot}
              onClick={() => slot && answer(true, { start: slot.start })}
            >
              {slot
                ? `${t.requests.confirm} · ${date(slot.start, { weekday: false })}, ${time(slot.start)}`
                : t.requests.confirm}
            </Button>
          </>
        }
      >
        <p className="p-help">{t.requests.otherTimeHelp}</p>
        <SlotPicker
          typeId={a.typeId}
          ignore={a.id}
          selected={slot}
          onPick={(s) => {
            setSlot(s);
            if (s && !s.hostIds.includes(hostId)) setHostId(s.hostIds[0]);
          }}
        />
        {slot && (
          <HostSelect
            config={config}
            value={hostId}
            onChange={setHostId}
            only={slot.hostIds}
          />
        )}
        {linkField}
        {replyField()}
      </Dialog>
      <Dialog
        open={open === 'decline'}
        onClose={close}
        title={t.requests.declineTitle}
        footer={
          <>
            <Button variant="ghost" onClick={close}>
              {t.common.cancel}
            </Button>
            <Button variant="danger" busy={busy} onClick={() => answer(false)}>
              {t.requests.decline}
            </Button>
          </>
        }
      >
        {replyField(t.requests.declinePlaceholder)}
      </Dialog>
    </>
  );
}

/** Accept or refuse the other time a client asked for. */
export function ChangeActions({
  appointment: a,
}: {
  appointment: Appointment;
}) {
  const { t } = useI18n();
  const { run, busy } = useAction();
  const [declining, setDeclining] = useState(false);
  const [reply, setReply] = useState('');
  return (
    <>
      <div className="p-request-actions">
        <Button
          size="small"
          busy={busy}
          onClick={() =>
            run(
              () => api.respondToChange(a.id, true),
              t.requests.changeAccepted,
            )
          }
        >
          {t.requests.accept}
        </Button>
        <Button size="small" variant="ghost" onClick={() => setDeclining(true)}>
          {t.requests.decline}
        </Button>
      </div>
      <Dialog
        open={declining}
        onClose={() => setDeclining(false)}
        title={t.requests.declineTitle}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeclining(false)}>
              {t.common.cancel}
            </Button>
            <Button
              variant="danger"
              busy={busy}
              onClick={async () => {
                const done = await run(
                  () => api.respondToChange(a.id, false, reply),
                  t.requests.changeDeclined,
                );
                if (done) {
                  setDeclining(false);
                  setReply('');
                }
              }}
            >
              {t.requests.decline}
            </Button>
          </>
        }
      >
        <Field label={t.requests.reply} optional>
          {(id) => (
            <textarea
              id={id}
              rows={3}
              placeholder={t.requests.declinePlaceholder}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
            />
          )}
        </Field>
      </Dialog>
    </>
  );
}

/** The team moves an appointment to any time; the person is told. */
export function MoveDialog({
  appointment,
  config,
  onClose,
}: {
  appointment: Appointment | null;
  config: BookingConfig;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { run, busy } = useAction();
  const [form, setForm] = useState({ id: '', day: '', time: '', hostId: '' });
  if (appointment && form.id !== appointment.id) {
    const w = wallTime(appointment.start);
    setForm({
      id: appointment.id,
      day: teamDay(Date.parse(appointment.start)),
      time: hhmm(w.hour * 60 + w.minute),
      hostId: appointment.hostId,
    });
  }
  if (!appointment)
    return (
      <Dialog open={false} onClose={onClose} title="">
        {null}
      </Dialog>
    );
  const length =
    (Date.parse(appointment.end) - Date.parse(appointment.start)) / 60_000;
  const start =
    form.day && form.time
      ? atMinutes(form.day as DayKey, minutesOf(form.time)).getTime()
      : NaN;
  return (
    <Dialog
      open
      onClose={onClose}
      title={t.agenda.moveTitle}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button
            busy={busy}
            disabled={Number.isNaN(start)}
            onClick={async () => {
              const done = await run(
                () =>
                  api.moveAppointment(
                    appointment.id,
                    new Date(start).toISOString(),
                    form.hostId,
                  ),
                t.agenda.moved,
              );
              if (done) onClose();
            }}
          >
            {t.agenda.move}
          </Button>
        </>
      }
    >
      <p className="p-help">{t.agenda.moveHelp}</p>
      <div className="p-grid-2">
        <Field label={t.agenda.date}>
          {(id) => (
            <input
              id={id}
              type="date"
              value={form.day}
              onChange={(e) => setForm({ ...form, day: e.target.value })}
            />
          )}
        </Field>
        <Field label={t.agenda.time}>
          {(id) => (
            <input
              id={id}
              type="time"
              step={900}
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
          )}
        </Field>
      </div>
      <HostSelect
        config={config}
        value={form.hostId}
        onChange={(hostId) => setForm({ ...form, hostId })}
      />
      {!Number.isNaN(start) &&
        outsideHours(config, form.hostId, start, length) && (
          <p className="p-warning">{t.agenda.outsideHours}</p>
        )}
    </Dialog>
  );
}

export interface NewDraft {
  day: DayKey;
  minutes: number;
  clientId?: string;
  hostId?: string;
  kind?: 'appointment' | 'block';
}

/** A new appointment (confirmed at once) or a blocked time, set by the team. */
export function NewDialog({
  draft,
  config,
  onClose,
  onCreated,
}: {
  draft: NewDraft | null;
  config: BookingConfig;
  onClose: () => void;
  onCreated?: (item: Appointment | TimeBlock) => void;
}) {
  const { t, locale } = useI18n();
  const { run, busy } = useAction();
  const clients = useData(() => api.listClients(), []);
  const firstHost =
    config.hosts.find((h) => h.bookable)?.id ?? config.hosts[0]?.id ?? '';
  const blank = {
    kind: 'appointment' as 'appointment' | 'block',
    who: 'client' as 'client' | 'guest',
    clientId: '',
    guest: { name: '', email: '', organisation: '', phone: '' },
    typeId: config.types.find((x) => x.active)?.id ?? '',
    day: '',
    time: '',
    end: '',
    endDay: '',
    allDay: false,
    hostId: firstHost,
    blockHost: '',
    topic: '',
    meetingUrl: '',
    reason: '',
  };
  const [form, setForm] = useState(blank);
  const [seen, setSeen] = useState<NewDraft | null>(null);
  if (draft && draft !== seen) {
    setSeen(draft);
    setForm({
      ...blank,
      kind: draft.kind ?? 'appointment',
      clientId: draft.clientId ?? '',
      hostId: draft.hostId ?? firstHost,
      blockHost: draft.kind === 'block' ? (draft.hostId ?? '') : '',
      day: draft.day,
      endDay: draft.day,
      allDay: false,
      time: hhmm(draft.minutes),
      end: hhmm(Math.min(draft.minutes + 60, 23 * 60 + 45)),
    });
  }
  const type = config.types.find((x) => x.id === form.typeId);
  const start =
    form.day && form.time
      ? atMinutes(form.day as DayKey, minutesOf(form.time)).getTime()
      : NaN;
  const validAppointment =
    !Number.isNaN(start) &&
    !!type &&
    (form.who === 'client'
      ? !!form.clientId
      : !!form.guest.name.trim() && /^\S+@\S+\.\S+$/.test(form.guest.email));
  let blockSpan: { start: string; end: string } | null = null;
  try {
    if (form.day && form.endDay && (form.allDay || (form.time && form.end))) {
      const begin = atMinutes(
          form.day as DayKey,
          form.allDay ? 0 : minutesOf(form.time),
        ),
        finish = atMinutes(
          (form.allDay
            ? addDays(form.endDay as DayKey, 1)
            : form.endDay) as DayKey,
          form.allDay ? 0 : minutesOf(form.end),
        );
      if (begin < finish)
        blockSpan = { start: begin.toISOString(), end: finish.toISOString() };
    }
  } catch {
    /* Incomplete dates remain unsaveable. */
  }
  const validBlock = !!blockSpan;
  const submit = async () => {
    if (form.kind === 'block') {
      if (!blockSpan) return;
      const done = await run(
        () =>
          api.addBlock({
            hostId: form.blockHost || null,
            ...blockSpan,
            allDay: form.allDay,
            reason: form.reason,
          }),
        t.agenda.blockAdded,
      );
      if (done) {
        onCreated?.(done);
        onClose();
      }
      return;
    }
    const done = await run(
      () =>
        api.scheduleAppointment({
          typeId: form.typeId,
          start: new Date(start).toISOString(),
          hostId: form.hostId,
          clientId: form.who === 'client' ? form.clientId : null,
          guest: form.who === 'guest' ? form.guest : null,
          topic: form.topic,
          meetingUrl: form.meetingUrl,
        }),
      t.agenda.scheduled,
    );
    if (done) {
      onCreated?.(done);
      onClose();
    }
  };
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm({ ...form, [key]: value });
  return (
    <Dialog
      open={!!draft}
      onClose={onClose}
      title={t.agenda.newTitle}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button
            busy={busy}
            disabled={form.kind === 'block' ? !validBlock : !validAppointment}
            onClick={submit}
          >
            {form.kind === 'block' ? t.agenda.block : t.agenda.schedule}
          </Button>
        </>
      }
    >
      {!draft?.clientId && (
        <Segmented
          label={t.agenda.newTitle}
          value={form.kind}
          onChange={(kind) => set('kind', kind)}
          options={[
            ['appointment', t.agenda.appointmentKind],
            ['block', t.agenda.blockKind],
          ]}
        />
      )}
      {form.kind === 'appointment' ? (
        <div className="p-form">
          {!draft?.clientId && (
            <Segmented
              label={t.agenda.who}
              value={form.who}
              onChange={(who) => set('who', who)}
              options={[
                ['client', t.agenda.aClient],
                ['guest', t.agenda.someoneElse],
              ]}
            />
          )}
          {form.who === 'client' ? (
            <Field label={t.agenda.client}>
              {(id) => (
                <select
                  id={id}
                  value={form.clientId}
                  onChange={(e) => set('clientId', e.target.value)}
                  disabled={!!draft?.clientId}
                >
                  <option value="">{t.agenda.chooseClient}</option>
                  {(clients.data ?? [])
                    .filter((c) => c.status !== 'disabled')
                    .sort((a, b) => a.lastName.localeCompare(b.lastName))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} · {c.organisation}
                      </option>
                    ))}
                </select>
              )}
            </Field>
          ) : (
            <div className="p-grid-2">
              <Field label={t.booking.name}>
                {(id) => (
                  <input
                    id={id}
                    value={form.guest.name}
                    onChange={(e) =>
                      set('guest', { ...form.guest, name: e.target.value })
                    }
                  />
                )}
              </Field>
              <Field label={t.auth.email}>
                {(id) => (
                  <input
                    id={id}
                    type="email"
                    value={form.guest.email}
                    onChange={(e) =>
                      set('guest', { ...form.guest, email: e.target.value })
                    }
                  />
                )}
              </Field>
              <Field label={t.auth.organisation} optional>
                {(id) => (
                  <input
                    id={id}
                    value={form.guest.organisation}
                    onChange={(e) =>
                      set('guest', {
                        ...form.guest,
                        organisation: e.target.value,
                      })
                    }
                  />
                )}
              </Field>
              <Field label={t.auth.phone} optional>
                {(id) => (
                  <input
                    id={id}
                    type="tel"
                    value={form.guest.phone}
                    onChange={(e) =>
                      set('guest', { ...form.guest, phone: e.target.value })
                    }
                  />
                )}
              </Field>
            </div>
          )}
          <Field label={t.agenda.type}>
            {(id) => (
              <select
                id={id}
                value={form.typeId}
                onChange={(e) => set('typeId', e.target.value)}
              >
                {config.types
                  .filter((x) => x.active)
                  .map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.label[locale]} ·{' '}
                      {fill(t.booking.minutes, { minutes: x.minutes })}
                    </option>
                  ))}
              </select>
            )}
          </Field>
          {/* Who and when on one line: the person's name needs the most room. */}
          <div className="p-when-row">
            <HostSelect
              config={config}
              value={form.hostId}
              onChange={(hostId) => set('hostId', hostId)}
            />
            <Field label={t.agenda.date}>
              {(id) => (
                <input
                  id={id}
                  type="date"
                  value={form.day}
                  onChange={(e) => set('day', e.target.value)}
                />
              )}
            </Field>
            <Field label={t.agenda.time}>
              {(id) => (
                <input
                  id={id}
                  type="time"
                  step={900}
                  value={form.time}
                  onChange={(e) => set('time', e.target.value)}
                />
              )}
            </Field>
          </div>
          {!Number.isNaN(start) &&
            type &&
            outsideHours(config, form.hostId, start, type.minutes) && (
              <p className="p-warning">{t.agenda.outsideHours}</p>
            )}
          <Field label={t.agenda.topic} optional>
            {(id) => (
              <input
                id={id}
                value={form.topic}
                onChange={(e) => set('topic', e.target.value)}
              />
            )}
          </Field>
          <Field label={t.agenda.meetingUrl} optional>
            {(id) => (
              <input
                id={id}
                type="url"
                placeholder="https://"
                value={form.meetingUrl}
                onChange={(e) => set('meetingUrl', e.target.value)}
              />
            )}
          </Field>
        </div>
      ) : (
        <div className="p-form">
          <Field
            label={
              locale === 'fr' ? 'Intitulé du créneau' : 'Blocked-time title'
            }
            help={
              locale === 'fr'
                ? 'L’intitulé peut être affiché dans Google, selon les paramètres de synchronisation.'
                : 'The title can appear in Google depending on synchronization settings.'
            }
            optional
          >
            {(id) => (
              <input
                id={id}
                maxLength={500}
                placeholder={t.agenda.blockReasonPlaceholder}
                value={form.reason}
                onChange={(e) => set('reason', e.target.value)}
              />
            )}
          </Field>
          <Field label={t.agenda.host}>
            {(id) => (
              <select
                id={id}
                value={form.blockHost}
                onChange={(e) => set('blockHost', e.target.value)}
              >
                <option value="">{t.agenda.wholeTeam}</option>
                {config.hosts
                  .filter((h) => h.bookable)
                  .map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
              </select>
            )}
          </Field>
          <label className="p-check">
            <input
              type="checkbox"
              checked={form.allDay}
              onChange={(e) => set('allDay', e.target.checked)}
            />
            {locale === 'fr' ? 'Journée entière' : 'All day'}
          </label>
          <div className="p-calendar-fields">
            <Field label={locale === 'fr' ? 'Date de début' : 'Start date'}>
              {(id) => (
                <input
                  id={id}
                  type="date"
                  value={form.day}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      day: e.target.value,
                      endDay:
                        form.endDay && form.endDay >= e.target.value
                          ? form.endDay
                          : e.target.value,
                    });
                  }}
                />
              )}
            </Field>
            <Field
              label={
                locale === 'fr'
                  ? form.allDay
                    ? 'Dernier jour inclus'
                    : 'Date de fin'
                  : form.allDay
                    ? 'Last day inclusive'
                    : 'End date'
              }
            >
              {(id) => (
                <input
                  id={id}
                  type="date"
                  min={form.day}
                  value={form.endDay}
                  onChange={(e) => set('endDay', e.target.value)}
                />
              )}
            </Field>
          </div>
          {!form.allDay && (
            <div className="p-calendar-fields">
              <Field label={t.agenda.start}>
                {(id) => (
                  <input
                    id={id}
                    type="time"
                    step={900}
                    value={form.time}
                    onChange={(e) => set('time', e.target.value)}
                  />
                )}
              </Field>
              <Field label={t.agenda.end}>
                {(id) => (
                  <input
                    id={id}
                    type="time"
                    step={900}
                    value={form.end}
                    onChange={(e) => set('end', e.target.value)}
                  />
                )}
              </Field>
            </div>
          )}
          <p className="p-help">
            {locale === 'fr'
              ? 'Horaires en heure de Paris. Les créneaux concernant toute l’équipe sont regroupés selon les paramètres Google.'
              : 'Times use Paris time. Whole-team blocks are grouped according to the Google settings.'}
          </p>
        </div>
      )}
    </Dialog>
  );
}

/** One appointment as a row, with the answer it waits for. */
export function TeamAppointmentRow({
  appointment: a,
  config,
  onOpen,
}: {
  appointment: Appointment;
  config: BookingConfig;
  onOpen?: (a: Appointment) => void;
}) {
  const { t, locale, date, time, dateTime, relative } = useI18n();
  const who = useWho()(a);
  const type = config.types.find((x) => x.id === a.typeId);
  const host = config.hosts.find((h) => h.id === a.hostId);
  const waiting = a.status === 'requested';
  return (
    <li
      className="p-appointment"
      data-cancelled={
        a.status === 'cancelled' || a.status === 'declined' || undefined
      }
    >
      <DateBlock iso={a.start} />
      <div className="p-appointment-main">
        <div className="p-appointment-head">
          <strong>
            {who.name}
            {who.organisation && (
              <span className="p-muted"> · {who.organisation}</span>
            )}
          </strong>
          {who.guest && <Badge tone="blue">{t.requests.visitor}</Badge>}
          <StatusPill status={a.status} />
        </div>
        <p className="p-muted">
          {type?.label[locale]} · {date(a.start)} · {time(a.start)}–
          {time(a.end)} · {host?.name}
        </p>
        {a.change && (
          <p className="p-change">
            {fill(t.booking.changePending, { date: dateTime(a.change.start) })}
          </p>
        )}
        {a.topic && <p className="p-quote">{a.topic}</p>}
        {who.guest && (who.email || who.phone) && (
          <p className="p-contact-line">
            {who.email && (
              <a href={`mailto:${who.email}`}>
                <Mail size={14} aria-hidden="true" /> {who.email}
              </a>
            )}
            {who.phone && (
              <span>
                <Phone size={14} aria-hidden="true" /> {who.phone}
              </span>
            )}
          </p>
        )}
        {(waiting || a.change) && (
          <p className="p-help">
            {fill(t.requests.received, {
              date: relative(a.change?.at ?? a.createdAt),
            })}
          </p>
        )}
        {waiting && <RequestActions appointment={a} config={config} />}
        {!waiting && a.change && <ChangeActions appointment={a} />}
      </div>
      {onOpen && (
        <Button variant="quiet" size="small" onClick={() => onOpen(a)}>
          {t.agenda.details}
        </Button>
      )}
    </li>
  );
}

/** One appointment in detail, with every action on it. */
export function AppointmentPanel({
  appointment,
  config,
  onClose,
}: {
  appointment: Appointment | null;
  config: BookingConfig;
  onClose: () => void;
}) {
  const { t, locale, date, time, dateTime } = useI18n();
  const whoOf = useWho();
  const { run, busy } = useAction();
  const confirm = useConfirm();
  const [moving, setMoving] = useState<Appointment | null>(null);
  const [draft, setDraft] = useState<{
    id: string;
    meetingUrl: string;
    hostId: string;
  } | null>(null);
  if (appointment && draft?.id !== appointment.id)
    setDraft({
      id: appointment.id,
      meetingUrl: appointment.meetingUrl,
      hostId: appointment.hostId,
    });
  if (!appointment || !draft)
    return (
      <Dialog open={false} onClose={onClose} title="" side>
        {null}
      </Dialog>
    );
  const a = appointment;
  const who = whoOf(a);
  const type = config.types.find((x) => x.id === a.typeId);
  const live =
    (a.status === 'confirmed' || a.status === 'requested') &&
    Date.parse(a.end) > Date.now();
  return (
    <>
      <Dialog
        open
        side
        onClose={onClose}
        title={type?.label[locale] ?? t.nav.agenda}
        footer={
          live &&
          a.status === 'confirmed' && (
            <>
              <Button
                variant="quiet"
                onClick={async () => {
                  if (
                    await confirm.ask(t.booking.cancelConfirm, t.booking.cancel)
                  ) {
                    const done = await run(
                      () => api.cancelAppointment(a.id),
                      t.booking.cancelledToast,
                    );
                    if (done) onClose();
                  }
                }}
              >
                {t.booking.cancel}
              </Button>
              <Button variant="secondary" onClick={() => setMoving(a)}>
                {t.agenda.move}
              </Button>
            </>
          )
        }
      >
        <CalendarSyncInfo kind="appointment" id={a.id} />
        <div className="p-stack">
          <div>
            <StatusPill status={a.status} />
            <p className="p-big">
              {date(a.start)}
              <br />
              {time(a.start)}–{time(a.end)}
            </p>
          </div>
          {a.change && (
            <div className="p-change-box">
              <p>
                <strong>{t.agenda.changeAsked}</strong> ·{' '}
                {dateTime(a.change.start)}
              </p>
              <ChangeActions appointment={a} />
            </div>
          )}
          <div className="p-agenda-contact">
            <p className="p-subtitle">{t.agenda.contact}</p>
            {a.clientId ? (
              <Link to={`/admin/clients/${a.clientId}`}>
                <strong>{who.name}</strong>
              </Link>
            ) : (
              <strong>
                {who.name} <Badge tone="blue">{t.agenda.guest}</Badge>
              </strong>
            )}
            {who.organisation && <p>{who.organisation}</p>}
            {who.email && (
              <p>
                <Mail size={14} aria-hidden="true" />{' '}
                <a href={`mailto:${who.email}`}>{who.email}</a>
              </p>
            )}
            {who.phone && (
              <p>
                <Phone size={14} aria-hidden="true" /> {who.phone}
              </p>
            )}
          </div>
          {a.topic && <p className="p-quote">{a.topic}</p>}
          {a.reply && (
            <p className="p-reply">
              <strong>{t.booking.teamReply}</strong> {a.reply}
            </p>
          )}
          {a.status === 'requested' && (
            <RequestActions appointment={a} config={config} />
          )}
          {a.status === 'confirmed' && (
            <AddToCalendar appointment={a} config={config} />
          )}
          {live && a.status === 'confirmed' && (
            <div className="p-form">
              <HostSelect
                config={config}
                value={draft.hostId}
                onChange={(hostId) => setDraft({ ...draft, hostId })}
              />
              <Field label={t.agenda.meetingUrl} optional>
                {(id) => (
                  <input
                    id={id}
                    type="url"
                    placeholder="https://"
                    value={draft.meetingUrl}
                    onChange={(e) =>
                      setDraft({ ...draft, meetingUrl: e.target.value })
                    }
                  />
                )}
              </Field>
              <Button
                variant="secondary"
                busy={busy}
                onClick={() =>
                  run(
                    () =>
                      api.updateAppointment(a.id, {
                        meetingUrl: draft.meetingUrl,
                        hostId: draft.hostId,
                      }),
                    t.common.saved,
                  )
                }
              >
                {t.common.save}
              </Button>
            </div>
          )}
        </div>
        {confirm.element}
      </Dialog>
      <MoveDialog
        appointment={moving}
        config={config}
        onClose={() => setMoving(null)}
      />
    </>
  );
}
