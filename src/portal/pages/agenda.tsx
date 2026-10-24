// The team's calendar, live: a week grid (appointments, requests waiting for an answer, changes
// asked for, blocked times and openings), a month view and a list. Everything is in Paris time,
// where the team works. A free time is clicked to create an appointment; a confirmed appointment
// is dragged to move it.
import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react';
import { ChevronLeft, ChevronRight, Lock, Plus } from 'lucide-react';
import { api, type Appointment, type BookingConfig, type TimeBlock } from '../api';
import { fill, useI18n } from '../i18n';
import { useAction, useData, useMediaQuery } from '../state';
import { Button, Card, Empty, Loading, PageHeader, Segmented, StatusPill, useConfirm } from '../ui';
import { AppointmentPanel, NewDialog, useWho, type NewDraft } from '../team';
import {
  DAY,
  addDays,
  atMinutes,
  minutesOf,
  parseDay,
  startOfWeek,
  teamDay,
  wallTime,
  weekdayOf,
  type DayKey,
} from '../lib/time';
import { nextOpening } from '../lib/availability';

const FIRST_HOUR = 8;
const LAST_HOUR = 19;
const HOUR_HEIGHT = 64;
const SNAP = 15;

type View = 'week' | 'month' | 'list';

interface Placed<T> {
  item: T;
  top: number;
  height: number;
  lane: number;
  lanes: number;
}

/** Positions the events of one day in the grid, side by side where they overlap. */
function place<T extends { start: string; end: string }>(items: T[]): Placed<T>[] {
  const sorted = [...items].sort((a, b) => a.start.localeCompare(b.start));
  const placed: Placed<T>[] = [];
  let group: Placed<T>[] = [];
  let groupEnd = 0;
  const flush = () => {
    const lanes = Math.max(1, ...group.map((p) => p.lane + 1));
    for (const p of group) p.lanes = lanes;
    group = [];
  };
  for (const item of sorted) {
    const s = wallTime(item.start);
    const top = ((s.hour * 60 + s.minute - FIRST_HOUR * 60) * HOUR_HEIGHT) / 60;
    const length = (Date.parse(item.end) - Date.parse(item.start)) / 60_000;
    const height = Math.max(24, (length * HOUR_HEIGHT) / 60);
    const begin = Date.parse(item.start);
    if (group.length && begin >= groupEnd) flush();
    const used = new Set(group.filter((p) => Date.parse(p.item.end) > begin).map((p) => p.lane));
    let lane = 0;
    while (used.has(lane)) lane++;
    const entry = { item, top, height, lane, lanes: 1 };
    group.push(entry);
    placed.push(entry);
    groupEnd = Math.max(groupEnd, Date.parse(item.end));
  }
  flush();
  return placed;
}

/** What the week grid shows: an appointment, or the other time a client asked for. */
interface GridItem {
  key: string;
  start: string;
  end: string;
  appointment: Appointment;
  ghost: boolean;
}

export function AgendaPage() {
  const { t, locale, date, time } = useI18n();
  const phone = useMediaQuery('(max-width: 760px)');
  const [view, setView] = useState<View>(phone ? 'list' : 'week');
  const [anchor, setAnchor] = useState<DayKey>(() => teamDay(Date.now()));
  const [hostId, setHostId] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<NewDraft | null>(null);
  const config = useData(() => api.getBookingConfig(), []);
  const range = useMemo(() => {
    if (view === 'week') {
      const from = startOfWeek(anchor);
      return { from, to: addDays(from, 7) };
    }
    if (view === 'month') {
      const { year, month } = parseDay(anchor);
      const from = startOfWeek(`${year}-${String(month).padStart(2, '0')}-01`);
      return { from, to: addDays(from, 42) };
    }
    return { from: teamDay(Date.now()), to: addDays(teamDay(Date.now()), 90) };
  }, [view, anchor]);
  const appointments = useData(
    () =>
      api.listAppointments({
        from: atMinutes(range.from, 0).toISOString(),
        to: atMinutes(range.to, 0).toISOString(),
      }),
    [range.from, range.to],
  );
  const who = useWho();
  const { run } = useAction();
  const cfg = config.data;
  const visible = (appointments.data ?? []).filter(
    (a) =>
      (a.status === 'confirmed' || a.status === 'requested') &&
      (!hostId || a.hostId === hostId || a.change?.hostId === hostId),
  );
  const blocks = (cfg?.blocks ?? []).filter((b) => !hostId || !b.hostId || b.hostId === hostId);
  const open = appointments.data?.find((a) => a.id === openId) ?? null;
  const move = (direction: 1 | -1) => {
    if (view === 'week') setAnchor(addDays(anchor, 7 * direction));
    else {
      const { year, month } = parseDay(anchor);
      const d = new Date(Date.UTC(year, month - 1 + direction, 1));
      setAnchor(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`);
    }
  };
  const tag = locale === 'fr' ? 'fr-FR' : 'en-GB';
  const label =
    view === 'month'
      ? new Intl.DateTimeFormat(tag, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
          new Date(Date.UTC(parseDay(anchor).year, parseDay(anchor).month - 1, 1)),
        )
      : `${date(atMinutes(range.from, 720).toISOString(), { weekday: false })} – ${date(atMinutes(addDays(range.to, -1), 720).toISOString(), { weekday: false, year: true })}`;
  // The form opens on the person's next free opening, in the period shown (never in the past).
  const startDraft = (kind?: 'block') => {
    const today = teamDay(Date.now());
    const base = view === 'week' ? range.from : view === 'month' ? anchor : today;
    const from = base > today ? base : today;
    const person = hostId || cfg?.hosts.find((h) => h.bookable)?.id || '';
    const found = cfg && nextOpening(cfg, appointments.data ?? [], person, from, Date.now());
    const w = wallTime(Date.now());
    const soon = Math.min(23 * 60, Math.ceil((w.hour * 60 + w.minute + 1) / 15) * 15);
    setDraft({
      ...(found ?? { day: from, minutes: from === today ? soon : 9 * 60 }),
      hostId: hostId || undefined,
      kind,
    });
  };
  // A time already taken is refused, and said so, by the shared action helper.
  const moveTo = (a: Appointment, start: number) =>
    run(() => api.moveAppointment(a.id, new Date(start).toISOString()), t.agenda.moved);

  return (
    <>
      <PageHeader
        title={t.nav.agenda}
        lead={t.agenda.lead}
        actions={
          <>
            <Button variant="secondary" onClick={() => startDraft('block')}>
              <Lock size={16} aria-hidden="true" /> {t.agenda.block}
            </Button>
            <Button onClick={() => startDraft()}>
              <Plus size={18} aria-hidden="true" /> {t.agenda.new}
            </Button>
          </>
        }
      />
      <div className="p-toolbar p-agenda-toolbar">
        {view !== 'list' ? (
          <div className="p-row">
            <button
              type="button"
              className="p-icon-button"
              aria-label={t.agenda.previous}
              onClick={() => move(-1)}
            >
              <ChevronLeft size={20} />
            </button>
            <Button variant="ghost" size="small" onClick={() => setAnchor(teamDay(Date.now()))}>
              {t.common.today}
            </Button>
            <button
              type="button"
              className="p-icon-button"
              aria-label={t.agenda.next}
              onClick={() => move(1)}
            >
              <ChevronRight size={20} />
            </button>
            <h2 className="p-agenda-label">{label}</h2>
          </div>
        ) : (
          <span />
        )}
        <div className="p-row">
          <select
            aria-label={t.agenda.host}
            value={hostId}
            onChange={(e) => setHostId(e.target.value)}
          >
            <option value="">{t.agenda.allHosts}</option>
            {cfg?.hosts.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
          <Segmented
            label={t.nav.agenda}
            value={view}
            onChange={setView}
            options={[
              ['week', t.agenda.week],
              ['month', t.agenda.month],
              ['list', t.agenda.list],
            ]}
          />
        </div>
      </div>
      {!cfg || !appointments.data ? (
        <Loading lines={8} />
      ) : view === 'week' ? (
        <WeekGrid
          from={range.from}
          config={cfg}
          hostId={hostId}
          appointments={visible}
          blocks={blocks}
          name={(a) => who(a).name}
          onOpen={setOpenId}
          onEmpty={(day, minutes) => setDraft({ day, minutes, hostId: hostId || undefined })}
          onMove={moveTo}
        />
      ) : view === 'month' ? (
        <MonthGrid
          from={range.from}
          month={parseDay(anchor).month}
          appointments={visible}
          config={cfg}
          name={(a) => who(a).name}
          onOpen={setOpenId}
          onDay={(d) => {
            setAnchor(d);
            setView('week');
          }}
        />
      ) : (
        <Card pad={false}>
          {!visible.length ? (
            <Empty>{t.agenda.empty}</Empty>
          ) : (
            <ul className="p-agenda-list">
              {groupByDay(visible).map(([day, items]) => (
                <li key={day}>
                  <h3>{date(atMinutes(day, 720).toISOString())}</h3>
                  <ul>
                    {items.map((a) => {
                      const type = cfg.types.find((x) => x.id === a.typeId);
                      return (
                        <li key={a.id}>
                          <button
                            type="button"
                            className="p-agenda-item"
                            data-status={a.status}
                            data-past={Date.parse(a.end) < Date.now() || undefined}
                            onClick={() => setOpenId(a.id)}
                            style={{ '--type': type?.colour } as CSSProperties}
                          >
                            <span className="p-agenda-time">
                              {time(a.start)}–{time(a.end)}
                            </span>
                            <span>
                              <strong>{who(a).name}</strong> · {type?.label[locale]}
                              <span className="p-muted p-block">
                                {cfg.hosts.find((h) => h.id === a.hostId)?.name}
                              </span>
                            </span>
                            {a.status === 'requested' ? (
                              <StatusPill status="requested" />
                            ) : a.change ? (
                              <span className="p-pill" data-tone="amber">
                                {t.agenda.changeAsked}
                              </span>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
      <AppointmentPanel
        appointment={open}
        config={cfg ?? emptyConfig}
        onClose={() => setOpenId(null)}
      />
      {cfg && <NewDialog draft={draft} config={cfg} onClose={() => setDraft(null)} />}
    </>
  );
}

const emptyConfig: BookingConfig = {
  types: [],
  hosts: [],
  rules: [],
  blocks: [],
  bufferMinutes: 0,
  minNoticeHours: 0,
  horizonDays: 0,
  stepMinutes: 15,
  closedDays: [],
  approval: 'manual',
};

function groupByDay(items: Appointment[]) {
  const map = new Map<DayKey, Appointment[]>();
  for (const a of [...items].sort((x, y) => x.start.localeCompare(y.start))) {
    const key = teamDay(Date.parse(a.start));
    map.set(key, [...(map.get(key) ?? []), a]);
  }
  return [...map.entries()];
}

function WeekGrid({
  from,
  config,
  hostId,
  appointments,
  blocks,
  name,
  onOpen,
  onEmpty,
  onMove,
}: {
  from: DayKey;
  config: BookingConfig;
  hostId: string;
  appointments: Appointment[];
  blocks: TimeBlock[];
  name: (a: Appointment) => string;
  onOpen: (id: string) => void;
  onEmpty: (day: DayKey, minutes: number) => void;
  onMove: (a: Appointment, start: number) => void;
}) {
  const { t, locale, time } = useI18n();
  const { run } = useAction();
  const confirm = useConfirm();
  const days = Array.from({ length: 7 }, (_, i) => addDays(from, i));
  const today = teamDay(Date.now());
  const now = wallTime(Date.now());
  const nowTop = ((now.hour * 60 + now.minute - FIRST_HOUR * 60) * HOUR_HEIGHT) / 60;
  const hours = Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, i) => FIRST_HOUR + i);
  const height = (LAST_HOUR - FIRST_HOUR) * HOUR_HEIGHT;
  const closed = new Set(config.closedDays);
  const columns = useRef<(HTMLDivElement | null)[]>([]);
  // Dragging: where the appointment would land, shown as it moves.
  const [preview, setPreview] = useState<{ id: string; col: number; minutes: number } | null>(null);
  const drag = useRef<{
    appointment: Appointment;
    x: number;
    y: number;
    offset: number;
    moved: boolean;
    landing: { col: number; minutes: number } | null;
  } | null>(null);
  const suppressClick = useRef(false);
  const wrap = useRef<HTMLDivElement>(null);
  const todayIndex = days.indexOf(today);
  // On a narrow screen the week scrolls sideways: it opens on today (or on Monday).
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const column = todayIndex >= 0 ? columns.current[todayIndex] : null;
    const first = columns.current[0];
    el.scrollLeft = column && first ? column.offsetLeft - first.offsetLeft : 0;
  }, [from, todayIndex]);

  const items: GridItem[] = appointments.flatMap((a) => [
    { key: a.id, start: a.start, end: a.end, appointment: a, ghost: false },
    ...(a.change
      ? [
          {
            key: `${a.id}-change`,
            start: a.change.start,
            end: a.change.end,
            appointment: a,
            ghost: true,
          },
        ]
      : []),
  ]);

  const startDrag = (event: PointerEvent<HTMLButtonElement>, a: Appointment) => {
    if (a.status !== 'confirmed' || event.button !== 0 || event.pointerType === 'touch') return;
    const box = event.currentTarget.getBoundingClientRect();
    drag.current = {
      appointment: a,
      x: event.clientX,
      y: event.clientY,
      offset: ((event.clientY - box.top) / HOUR_HEIGHT) * 60,
      moved: false,
      landing: null,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.hypot(event.clientX - d.x, event.clientY - d.y) < 5) return;
    d.moved = true;
    const col = columns.current.findIndex((c) => {
      const r = c?.getBoundingClientRect();
      return r && event.clientX >= r.left && event.clientX < r.right;
    });
    if (col < 0) return;
    const r = columns.current[col]!.getBoundingClientRect();
    const length = (Date.parse(d.appointment.end) - Date.parse(d.appointment.start)) / 60_000;
    let minutes = FIRST_HOUR * 60 + ((event.clientY - r.top) / HOUR_HEIGHT) * 60 - d.offset;
    minutes = Math.round(minutes / SNAP) * SNAP;
    minutes = Math.min(Math.max(minutes, FIRST_HOUR * 60), LAST_HOUR * 60 - length);
    d.landing = { col, minutes };
    setPreview({ id: d.appointment.id, col, minutes });
  };
  const endDrag = () => {
    const d = drag.current;
    drag.current = null;
    setPreview(null);
    if (!d?.moved || !d.landing) return;
    suppressClick.current = true;
    const start = atMinutes(days[d.landing.col], d.landing.minutes).getTime();
    if (start !== Date.parse(d.appointment.start)) onMove(d.appointment, start);
  };

  return (
    <div className="p-week-wrap" ref={wrap}>
      <div className="p-week" style={{ '--hour': `${HOUR_HEIGHT}px` } as CSSProperties}>
        <div className="p-week-head">
          <span />
          {days.map((d) => (
            <span key={d} data-today={d === today || undefined}>
              {t.weekdaysShort[weekdayOf(d)]} <strong>{parseDay(d).day}</strong>
            </span>
          ))}
        </div>
        <div className="p-week-body" style={{ height }}>
          <div className="p-week-hours" aria-hidden="true">
            {hours.map((h) => (
              <span key={h} style={{ top: (h - FIRST_HOUR) * HOUR_HEIGHT }}>
                {String(h).padStart(2, '0')}:00
              </span>
            ))}
          </div>
          {days.map((d, col) => {
            const weekday = weekdayOf(d);
            const openings = closed.has(d)
              ? []
              : config.rules.filter(
                  (r) => r.weekday === weekday && (!hostId || r.hostId === hostId),
                );
            const dayStart = atMinutes(d, 0).getTime();
            const dayEnd = dayStart + DAY;
            const inDay = (start: string) =>
              Date.parse(start) >= dayStart && Date.parse(start) < dayEnd;
            const dayBlocks = blocks
              .filter((b) => Date.parse(b.end) > dayStart && Date.parse(b.start) < dayEnd)
              .map((b) => ({
                ...b,
                start: new Date(
                  Math.max(Date.parse(b.start), atMinutes(d, FIRST_HOUR * 60).getTime()),
                ).toISOString(),
                end: new Date(
                  Math.min(Date.parse(b.end), atMinutes(d, LAST_HOUR * 60).getTime()),
                ).toISOString(),
              }))
              .filter((b) => b.end > b.start);
            const ghostHere =
              preview && preview.col === col ? appointments.find((a) => a.id === preview.id) : null;
            return (
              <div
                key={d}
                ref={(el) => {
                  columns.current[col] = el;
                }}
                className="p-week-day"
                data-today={d === today || undefined}
                data-closed={closed.has(d) || undefined}
                onClick={(event) => {
                  if (event.target !== event.currentTarget) return;
                  const minutes =
                    FIRST_HOUR * 60 +
                    Math.floor((event.nativeEvent.offsetY / HOUR_HEIGHT) * 2) * 30;
                  onEmpty(d, minutes);
                }}
              >
                {openings.map((r) => (
                  <span
                    key={r.id}
                    className="p-week-open"
                    style={{
                      top: ((minutesOf(r.start) - FIRST_HOUR * 60) * HOUR_HEIGHT) / 60,
                      height: ((minutesOf(r.end) - minutesOf(r.start)) * HOUR_HEIGHT) / 60,
                    }}
                  />
                ))}
                {place(dayBlocks).map(({ item, top, height: h }) => (
                  <button
                    key={item.id}
                    type="button"
                    className="p-week-block"
                    style={{ top, height: h }}
                    title={item.reason}
                    onClick={async () => {
                      if (
                        await confirm.ask(
                          `${t.agenda.removeBlock} · ${item.reason || t.agenda.blocked}`,
                          t.agenda.removeBlock,
                        )
                      )
                        run(() => api.removeBlock(item.id), t.agenda.blockRemoved);
                    }}
                  >
                    <Lock size={12} aria-hidden="true" /> {item.reason || t.agenda.blocked}
                    {item.hostId && (
                      <>
                        {' '}
                        · {config.hosts.find((x) => x.id === item.hostId)?.name.replace(/^Dr /, '')}
                      </>
                    )}
                  </button>
                ))}
                {place(items.filter((i) => inDay(i.start))).map(
                  ({ item, top, height: h, lane, lanes }) => {
                    const a = item.appointment;
                    const type = config.types.find((x) => x.id === a.typeId);
                    const host = config.hosts.find(
                      (x) => x.id === (item.ghost ? a.change!.hostId : a.hostId),
                    );
                    const short = h < 46;
                    const dragging = preview?.id === a.id && !item.ghost;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        className="p-week-event"
                        data-status={a.status}
                        data-past={Date.parse(item.end) < Date.now() || undefined}
                        data-ghost={item.ghost || undefined}
                        data-short={short || undefined}
                        data-dragging={dragging || undefined}
                        style={
                          {
                            top,
                            height: h,
                            left: `calc(${(lane / lanes) * 100}% + 2px)`,
                            width: `calc(${100 / lanes}% - 4px)`,
                            '--type': type?.colour,
                          } as CSSProperties
                        }
                        title={`${time(item.start)}–${time(item.end)} · ${type?.label[locale] ?? ''} · ${name(a)}`}
                        onPointerDown={(e) => !item.ghost && startDrag(e, a)}
                        onPointerMove={moveDrag}
                        onPointerUp={endDrag}
                        onPointerCancel={() => {
                          drag.current = null;
                          setPreview(null);
                        }}
                        onClick={() => {
                          if (suppressClick.current) {
                            suppressClick.current = false;
                            return;
                          }
                          onOpen(a.id);
                        }}
                      >
                        {item.ghost ? (
                          <strong>
                            {t.agenda.changeAsked} · {name(a)}
                          </strong>
                        ) : short ? (
                          <strong>
                            {time(item.start)} · {name(a)}
                          </strong>
                        ) : (
                          <>
                            <strong>
                              {time(item.start)} {type?.label[locale]}
                            </strong>
                            <span>{name(a)}</span>
                            {a.status === 'requested' ? (
                              <span className="p-week-host">{t.agenda.requested}</span>
                            ) : (
                              h > 62 && <span className="p-week-host">{host?.name}</span>
                            )}
                          </>
                        )}
                      </button>
                    );
                  },
                )}
                {ghostHere && preview && (
                  <span
                    className="p-week-preview"
                    style={{
                      top: ((preview.minutes - FIRST_HOUR * 60) * HOUR_HEIGHT) / 60,
                      height: Math.max(
                        24,
                        ((Date.parse(ghostHere.end) - Date.parse(ghostHere.start)) / 60_000) *
                          (HOUR_HEIGHT / 60),
                      ),
                    }}
                    aria-hidden="true"
                  >
                    {String(Math.floor(preview.minutes / 60)).padStart(2, '0')}:
                    {String(preview.minutes % 60).padStart(2, '0')} · {name(ghostHere)}
                  </span>
                )}
                {d === today && nowTop > 0 && nowTop < height && (
                  <span className="p-week-now" style={{ top: nowTop }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <p className="p-help">
        <Plus size={14} aria-hidden="true" /> {t.agenda.hint} · {t.booking.zone}
      </p>
      {confirm.element}
    </div>
  );
}

function MonthGrid({
  from,
  month,
  appointments,
  config,
  name,
  onOpen,
  onDay,
}: {
  from: DayKey;
  month: number;
  appointments: Appointment[];
  config: BookingConfig;
  name: (a: Appointment) => string;
  onOpen: (id: string) => void;
  onDay: (day: DayKey) => void;
}) {
  const { t, time } = useI18n();
  const today = teamDay(Date.now());
  const byDay = new Map(groupByDay(appointments));
  const days = Array.from({ length: 42 }, (_, i) => addDays(from, i));
  return (
    <div className="p-month">
      {t.weekdaysShort.map((w) => (
        <span key={w} className="p-month-weekday">
          {w}
        </span>
      ))}
      {days.map((d) => {
        const items = byDay.get(d) ?? [];
        return (
          <div
            key={d}
            className="p-month-day"
            data-other={parseDay(d).month !== month || undefined}
            data-today={d === today || undefined}
          >
            <button type="button" className="p-month-date" onClick={() => onDay(d)}>
              {parseDay(d).day}
            </button>
            {items.slice(0, 3).map((a) => {
              const type = config.types.find((x) => x.id === a.typeId);
              return (
                <button
                  key={a.id}
                  type="button"
                  className="p-month-event"
                  data-status={a.status}
                  data-past={Date.parse(a.end) < Date.now() || undefined}
                  style={{ '--type': type?.colour } as CSSProperties}
                  onClick={() => onOpen(a.id)}
                >
                  {time(a.start)} {name(a)}
                </button>
              );
            })}
            {items.length > 3 && (
              <button type="button" className="p-link p-month-more" onClick={() => onDay(d)}>
                {fill(t.agenda.more, { count: items.length - 3 })}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
