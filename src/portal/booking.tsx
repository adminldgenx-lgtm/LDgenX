// Appointments seen from the client's side and the visitor's: choosing a format, a day in a month
// calendar and a free time, then sending the request. The calendar and the time list also serve
// to change an appointment, and the team uses them to answer a request with another time.
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  FlaskConical,
  Phone,
  Video,
} from 'lucide-react';
import {
  api,
  PortalError,
  type Appointment,
  type AppointmentType,
  type BookingConfig,
  type Slot,
} from './api';
import { fill, useI18n } from './i18n';
import { useAction, useData, useSession, useToast } from './state';
import { Button, Dialog, ErrorNote, Field, Fill, Loading } from './ui';
import {
  TEAM_ZONE,
  addDays,
  atMinutes,
  dayKey,
  parseDay,
  teamDay,
  visitorZone,
  wallTime,
  weekdayOf,
  type DayKey,
} from './lib/time';
import { googleCalendarUrl, icsFile, saveBlob } from './lib/ics';
import { bases } from '../lib/routes';

const monthStart = (key: DayKey) => {
  const { year, month } = parseDay(key);
  return dayKey({ year, month, day: 1 });
};
const addMonths = (key: DayKey, n: number) => {
  const { year, month } = parseDay(key);
  const d = new Date(Date.UTC(year, month - 1 + n, 1));
  return dayKey({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: 1 });
};

export const LocationIcon = ({ location }: { location: AppointmentType['location'] }) =>
  location === 'phone' ? (
    <Phone size={16} aria-hidden="true" />
  ) : location === 'lab' ? (
    <FlaskConical size={16} aria-hidden="true" />
  ) : (
    <Video size={16} aria-hidden="true" />
  );

/** A month of days; days with free times can be chosen. */
export function MonthCalendar({
  month,
  onMonth,
  selected,
  onSelect,
  available,
  loading,
}: {
  month: DayKey;
  onMonth: (month: DayKey) => void;
  selected: DayKey | null;
  onSelect: (day: DayKey) => void;
  available: Set<DayKey>;
  loading: boolean;
}) {
  const { t, locale } = useI18n();
  const today = teamDay(Date.now());
  const first = monthStart(month);
  const { year, month: m } = parseDay(first);
  const length = new Date(Date.UTC(year, m, 0)).getUTCDate();
  const title = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, m - 1, 1)));
  const days = Array.from({ length }, (_, i) => addDays(first, i));
  return (
    <div className="p-calendar" aria-busy={loading || undefined}>
      <header>
        <button
          type="button"
          className="p-icon-button"
          onClick={() => onMonth(addMonths(first, -1))}
          disabled={first <= monthStart(today)}
          aria-label={t.common.previous}
        >
          <ChevronLeft size={20} />
        </button>
        <h3>{title}</h3>
        <button
          type="button"
          className="p-icon-button"
          onClick={() => onMonth(addMonths(first, 1))}
          aria-label={t.common.next}
        >
          <ChevronRight size={20} />
        </button>
      </header>
      <div className="p-calendar-grid">
        {t.weekdaysShort.map((d) => (
          <span key={d} className="p-calendar-weekday" aria-hidden="true">
            {d}
          </span>
        ))}
        {Array.from({ length: weekdayOf(first) }, (_, i) => (
          <span key={`lead-${i}`} />
        ))}
        {days.map((day) => {
          const free = available.has(day);
          return (
            <button
              key={day}
              type="button"
              className="p-calendar-day"
              data-today={day === today || undefined}
              data-free={free || undefined}
              aria-pressed={selected === day}
              aria-label={`${t.weekdays[weekdayOf(day)]} ${parseDay(day).day} ${title}${free ? '' : ` · ${t.booking.noSlots}`}`}
              disabled={!free}
              onClick={() => onSelect(day)}
            >
              {parseDay(day).day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** The free times of one day, morning then afternoon. */
export function SlotList({
  slots,
  selected,
  onPick,
}: {
  slots: Slot[];
  selected: string | null;
  onPick: (slot: Slot) => void;
}) {
  const { t, time } = useI18n();
  const zone = visitorZone();
  const otherZone = zone !== TEAM_ZONE;
  if (!slots.length) return <p className="p-muted">{t.booking.noSlots}</p>;
  const groups: [string, Slot[]][] = [
    [t.booking.morning, slots.filter((s) => wallTime(s.start).hour < 12)],
    [t.booking.afternoon, slots.filter((s) => wallTime(s.start).hour >= 12)],
  ];
  return (
    <div className="p-slots">
      {groups
        .filter(([, list]) => list.length)
        .map(([label, list]) => (
          <div key={label}>
            <p className="p-subtitle">{label}</p>
            <div className="p-slot-grid">
              {list.map((s) => (
                <button
                  key={s.start}
                  type="button"
                  className="p-slot"
                  aria-pressed={selected === s.start}
                  onClick={() => onPick(s)}
                >
                  {time(s.start)}
                  {otherZone && <small>{time(s.start, zone)}</small>}
                </button>
              ))}
            </div>
          </div>
        ))}
      <p className="p-help">
        <Clock size={14} aria-hidden="true" /> {t.booking.zone}
        {otherZone && <> · {fill(t.booking.yourZone, { zone })}</>}
      </p>
    </div>
  );
}

/** Free times of a format over a month, and the days that have some; live. */
function useMonthSlots(typeId: string | null, month: DayKey, hostId: string, ignore?: string) {
  const range = useMemo(
    () => ({
      from: atMinutes(monthStart(month), 0).toISOString(),
      to: atMinutes(addMonths(month, 1), 0).toISOString(),
    }),
    [month],
  );
  const slots = useData(
    () =>
      typeId
        ? api.availableSlots(typeId, range.from, range.to, hostId || undefined, ignore)
        : Promise.resolve([]),
    [typeId, range.from, range.to, hostId, ignore],
  );
  const byDay = useMemo(() => {
    const map = new Map<DayKey, Slot[]>();
    for (const s of slots.data ?? []) {
      const key = teamDay(Date.parse(s.start));
      map.set(key, [...(map.get(key) ?? []), s]);
    }
    return map;
  }, [slots.data]);
  return { byDay, loading: slots.loading };
}

/** A month calendar and the free times of the chosen day, for one format. */
export function SlotPicker({
  typeId,
  hostId = '',
  ignore,
  selected,
  onPick,
}: {
  typeId: string;
  hostId?: string;
  ignore?: string;
  selected: Slot | null;
  onPick: (slot: Slot | null) => void;
}) {
  const { t, date } = useI18n();
  const [month, setMonth] = useState(() => monthStart(teamDay(Date.now())));
  const [day, setDay] = useState<DayKey | null>(null);
  const { byDay, loading } = useMonthSlots(typeId, month, hostId, ignore);
  const available = new Set(byDay.keys());
  const daySlots = day ? (byDay.get(day) ?? []) : [];
  // A slot taken meanwhile (by someone else, live) is no longer offered.
  const gone = !!selected && !!day && !loading && !daySlots.some((s) => s.start === selected.start);
  useEffect(() => {
    if (gone) onPick(null);
  }, [gone, onPick]);
  return (
    <div className="p-booking-pick">
      <MonthCalendar
        month={month}
        onMonth={(m) => {
          setMonth(m);
          setDay(null);
          onPick(null);
        }}
        selected={day}
        onSelect={(d) => {
          setDay(d);
          onPick(null);
        }}
        available={available}
        loading={loading}
      />
      <div className="p-booking-slots">
        {loading && !available.size ? (
          <Loading lines={4} />
        ) : !available.size ? (
          <p className="p-muted">{t.booking.noSlotsMonth}</p>
        ) : day ? (
          <>
            <h3>{date(atMinutes(day, 12 * 60).toISOString())}</h3>
            <SlotList slots={daySlots} selected={selected?.start ?? null} onPick={onPick} />
          </>
        ) : (
          <p className="p-muted">{t.booking.chooseDay}</p>
        )}
      </div>
    </div>
  );
}

export function AddToCalendar({
  appointment,
  config,
}: {
  appointment: Appointment;
  config: BookingConfig;
}) {
  const { t, locale } = useI18n();
  const type = config.types.find((x) => x.id === appointment.typeId);
  const host = config.hosts.find((h) => h.id === appointment.hostId);
  const event = {
    id: appointment.id,
    title: fill(t.booking.eventTitle, { type: type?.label[locale] ?? '' }),
    description: [appointment.topic, host?.name, appointment.meetingUrl].filter(Boolean).join('\n'),
    location: appointment.meetingUrl || (type ? t.booking.location[type.location] : ''),
    start: appointment.start,
    end: appointment.end,
  };
  return (
    <div className="p-add-calendar">
      <span className="p-muted">{t.booking.addTo}</span>
      <a
        className="p-button"
        data-variant="secondary"
        data-size="small"
        href={googleCalendarUrl(event)}
        target="_blank"
        rel="noreferrer"
      >
        <CalendarPlus size={15} aria-hidden="true" /> {t.booking.addGoogle}
      </a>
      <Button
        variant="secondary"
        size="small"
        onClick={() => saveBlob(icsFile(event), 'rendez-vous-ldgenx.ics')}
      >
        {t.booking.addIcs}
      </Button>
    </div>
  );
}

/** Requesting an appointment: a client (signed in) or a visitor of the site. */
export function RequestFlow({
  publicMode = false,
  onDone,
}: {
  publicMode?: boolean;
  onDone?: () => void;
}) {
  const { t, locale, date, time } = useI18n();
  const { user } = useSession();
  const config = useData(() => api.getBookingConfig(), []);
  const { run, busy } = useAction();
  const toast = useToast();
  const [typeId, setTypeId] = useState<string | null>(null);
  const [hostId, setHostId] = useState('');
  const [slot, setSlot] = useState<Slot | null>(null);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [topic, setTopic] = useState('');
  const [guest, setGuest] = useState({ name: '', email: '', organisation: '', phone: '' });
  const [consent, setConsent] = useState(false);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<Appointment | null>(null);
  const [round, setRound] = useState(0);

  if (config.error) return <ErrorNote onRetry={config.reload} />;
  if (!config.data) return <Loading lines={4} />;
  const cfg = config.data;
  const types = cfg.types.filter((x) => x.active && (user && !publicMode ? true : x.public));
  // A single format needs no choosing: the calendar opens at once.
  const single = types.length === 1;
  if (single && step === 0 && typeId !== types[0].id) {
    setTypeId(types[0].id);
    setStep(1);
  }
  const type = types.find((x) => x.id === typeId);
  const hosts = cfg.hosts.filter((h) => h.bookable);
  const auto = cfg.approval === 'auto';
  const guestErrors = {
    name: !guest.name.trim(),
    email: !/^\S+@\S+\.\S+$/.test(guest.email),
    consent: !consent,
  };

  const send = async () => {
    setTried(true);
    if (!slot || !type) return;
    if (!user && Object.values(guestErrors).some(Boolean)) return;
    try {
      const appointment = await api.requestAppointment({
        typeId: type.id,
        start: slot.start,
        hostId: hostId || undefined,
        topic,
        guest: user ? undefined : guest,
      });
      setDone(appointment);
      setStep(3);
    } catch (error) {
      if (error instanceof PortalError && error.code === 'slot_taken') {
        toast(t.errors.slot_taken, 'error');
        setSlot(null);
        setStep(1);
      } else run(() => Promise.reject(error));
    }
  };

  if (step === 3 && done && type) {
    const confirmed = done.status === 'confirmed';
    return (
      <div className="p-booked">
        <span className="p-booked-mark" aria-hidden="true">
          <Check size={28} />
        </span>
        <h2>{confirmed ? t.booking.confirmedTitle : t.booking.sentTitle}</h2>
        <p className="p-booked-when">
          {date(done.start)} · {time(done.start)}–{time(done.end)}
        </p>
        <p>
          {type.label[locale]} · {fill(t.booking.minutes, { minutes: type.minutes })}
        </p>
        <p className="p-muted">
          {confirmed
            ? t.booking.confirmedText
            : user
              ? t.booking.sentText
              : t.booking.sentTextGuest}
        </p>
        {confirmed && <AddToCalendar appointment={done} config={cfg} />}
        <div className="p-row">
          <Button
            variant="ghost"
            onClick={() => {
              setDone(null);
              setSlot(null);
              setTopic('');
              setRound(round + 1);
              setStep(single ? 1 : 0);
            }}
          >
            {t.booking.another}
          </Button>
          {onDone && (
            <Button variant="secondary" onClick={onDone}>
              {t.common.close}
            </Button>
          )}
        </div>
      </div>
    );
  }

  const steps = [t.booking.stepType, t.booking.stepTime, t.booking.stepDetails];
  const shown = single ? steps.slice(1) : steps;
  const current = single ? step - 1 : step;
  return (
    <div className="p-booking">
      <p className="p-muted">{auto ? t.booking.leadAuto : t.booking.leadManual}</p>
      <ol className="p-steps" aria-label={t.booking.request}>
        {shown.map((label, i) => (
          <li key={label} data-state={i < current ? 'done' : i === current ? 'now' : undefined}>
            <span>{i + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="p-type-list">
          {types.map((x) => (
            <button
              key={x.id}
              type="button"
              className="p-type"
              aria-pressed={typeId === x.id}
              onClick={() => {
                setTypeId(x.id);
                setSlot(null);
                setStep(1);
              }}
              style={{ '--type': x.colour } as CSSProperties}
            >
              <span className="p-type-head">
                <strong>{x.label[locale]}</strong>
                <span className="p-type-minutes">
                  {fill(t.booking.minutes, { minutes: x.minutes })}
                </span>
              </span>
              <span>{x.description[locale]}</span>
              <span className="p-type-meta">
                <LocationIcon location={x.location} /> {t.booking.location[x.location]}
                {!x.public && <> · {t.booking.clientsOnly}</>}
              </span>
            </button>
          ))}
        </div>
      )}

      {step === 1 && type && (
        <div className="p-booking-time">
          <div className="p-booking-summary">
            {!single && (
              <button type="button" className="p-link" onClick={() => setStep(0)}>
                ← {t.common.back}
              </button>
            )}
            <strong>{type.label[locale]}</strong>
            <span className="p-muted">
              {fill(t.booking.minutes, { minutes: type.minutes })} ·{' '}
              {t.booking.location[type.location]}
            </span>
            {hosts.length > 1 && (
              <label className="p-inline-field">
                <span>{t.booking.with}</span>
                <select
                  value={hostId}
                  onChange={(e) => {
                    setHostId(e.target.value);
                    setSlot(null);
                  }}
                >
                  <option value="">{t.booking.anyone}</option>
                  {hosts.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <SlotPicker
            key={`${type.id}-${round}`}
            typeId={type.id}
            hostId={hostId}
            selected={slot}
            onPick={setSlot}
          />
          {slot && (
            <div className="p-form-actions">
              <Button onClick={() => setStep(2)}>
                {t.common.continue} · {date(slot.start, { weekday: false })}, {time(slot.start)}
              </Button>
            </div>
          )}
        </div>
      )}

      {step === 2 && type && slot && (
        <form
          className="p-form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <div className="p-booking-summary">
            <button type="button" className="p-link" onClick={() => setStep(1)}>
              ← {t.common.back}
            </button>
            <strong>
              {date(slot.start)} · {time(slot.start)}–{time(slot.end)}
            </strong>
            <span className="p-muted">
              {type.label[locale]} · {fill(t.booking.minutes, { minutes: type.minutes })}
            </span>
          </div>
          {!user && (
            <div className="p-grid-2">
              <Field
                label={t.booking.name}
                error={tried && guestErrors.name ? t.common.required : null}
              >
                {(id, d) => (
                  <input
                    id={id}
                    aria-describedby={d}
                    autoComplete="name"
                    value={guest.name}
                    onChange={(e) => setGuest({ ...guest, name: e.target.value })}
                  />
                )}
              </Field>
              <Field
                label={t.auth.email}
                error={tried && guestErrors.email ? t.errors.invalid_input : null}
              >
                {(id, d) => (
                  <input
                    id={id}
                    aria-describedby={d}
                    type="email"
                    autoComplete="email"
                    value={guest.email}
                    onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                  />
                )}
              </Field>
              <Field label={t.auth.organisation} optional>
                {(id) => (
                  <input
                    id={id}
                    autoComplete="organization"
                    value={guest.organisation}
                    onChange={(e) => setGuest({ ...guest, organisation: e.target.value })}
                  />
                )}
              </Field>
              <Field label={t.auth.phone} optional>
                {(id) => (
                  <input
                    id={id}
                    type="tel"
                    autoComplete="tel"
                    value={guest.phone}
                    onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                  />
                )}
              </Field>
            </div>
          )}
          <Field label={t.booking.topic} help={t.booking.topicHelp} optional>
            {(id, d) => (
              <textarea
                id={id}
                aria-describedby={d}
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            )}
          </Field>
          {!user && (
            <label className="p-check" data-invalid={tried && guestErrors.consent ? '' : undefined}>
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>
                <Fill
                  text={t.auth.consent}
                  values={{
                    link: (
                      <a href={bases[locale].privacy} target="_blank" rel="noreferrer">
                        {t.auth.privacy}
                      </a>
                    ),
                  }}
                />
              </span>
            </label>
          )}
          <div className="p-form-actions">
            <Button type="submit" busy={busy}>
              {auto ? t.booking.sendAuto : t.booking.send}
            </Button>
          </div>
        </form>
      )}
      {publicMode && !user && step < 2 && (
        <p className="p-help">
          <Fill
            text={t.booking.loginForMore}
            values={{ link: <Link to="/espace/connexion">{t.booking.loginLink}</Link> }}
          />
        </p>
      )}
    </div>
  );
}

/** A client chooses another time for one of their appointments. */
export function ChangeDialog({
  appointment,
  onClose,
}: {
  appointment: Appointment | null;
  onClose: () => void;
}) {
  const { t, date, time } = useI18n();
  const config = useData(() => api.getBookingConfig(), []);
  const { run, busy } = useAction();
  const [slot, setSlot] = useState<Slot | null>(null);
  if (!appointment)
    return (
      <Dialog open={false} onClose={onClose} title="">
        {null}
      </Dialog>
    );
  const auto = config.data?.approval === 'auto' || appointment.status === 'requested';
  return (
    <Dialog
      open
      wide
      onClose={onClose}
      title={t.booking.changeTitle}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button
            disabled={!slot}
            busy={busy}
            onClick={async () => {
              if (!slot) return;
              const changed = await run(
                () => api.requestChange(appointment.id, slot.start),
                auto ? t.booking.changeDone : t.booking.changeSent,
              );
              if (changed) onClose();
            }}
          >
            {slot
              ? `${t.common.confirm} · ${date(slot.start, { weekday: false })}, ${time(slot.start)}`
              : t.common.confirm}
          </Button>
        </>
      }
    >
      <SlotPicker
        typeId={appointment.typeId}
        ignore={appointment.id}
        selected={slot}
        onPick={setSlot}
      />
    </Dialog>
  );
}
