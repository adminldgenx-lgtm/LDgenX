// The team's settings: availability for appointments (approval, formats, opening hours, rules,
// closed days) and the weekly deletion of files.
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Trash2, X } from 'lucide-react';
import {
  api,
  type BookingConfig,
  type RetentionSettings,
  type WeeklyRule,
} from '../api';
import { fill, useI18n } from '../i18n';
import { useAction, useData, useToast } from '../state';
import {
  Button,
  Card,
  ErrorNote,
  Field,
  Loading,
  PageHeader,
  Segmented,
  Switch,
  Tabs,
  useConfirm,
} from '../ui';
import { nextPurgeAfter } from '../lib/retention';

type Tab = 'availability' | 'files';

export function SettingsPage() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const retention = useData(() => api.getRetention(), []);
  const booking = useData(() => api.getBookingConfig(), []);
  const tabs: [Tab, string][] = [
    ['availability', t.settings.availabilityTab],
    ['files', t.settings.filesTab],
  ];
  // An unknown tab in the address opens the first one.
  const tab =
    tabs.find(([id]) => id === params.get('onglet'))?.[0] ?? 'availability';
  return (
    <>
      <PageHeader title={t.nav.settings} lead={t.settings.lead} />
      <Tabs
        label={t.nav.settings}
        value={tab}
        onChange={(next) => setParams({ onglet: next }, { replace: true })}
        tabs={tabs}
      />
      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="p-tabpanel"
      >
        {tab === 'availability' &&
          (booking.error ? (
            <ErrorNote onRetry={booking.reload} />
          ) : booking.data ? (
            <AvailabilityForm config={booking.data} />
          ) : (
            <Loading />
          ))}
        {tab === 'files' &&
          (retention.error ? (
            <ErrorNote onRetry={retention.reload} />
          ) : retention.data ? (
            <RetentionForm
              key={retention.data.lastPurgeAt ?? 'retention'}
              settings={retention.data}
            />
          ) : (
            <Loading />
          ))}
      </div>
    </>
  );
}

let ruleSeq = 0;

function AvailabilityForm({ config }: { config: BookingConfig }) {
  const { t, locale } = useI18n();
  const { run, busy } = useAction();
  const [form, setForm] = useState(config);
  const [newDay, setNewDay] = useState('');
  const setType = (
    id: string,
    patch: Partial<BookingConfig['types'][number]>,
  ) =>
    setForm({
      ...form,
      types: form.types.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    });
  const setHost = (id: string, bookable: boolean) =>
    setForm({
      ...form,
      hosts: form.hosts.map((h) => (h.id === id ? { ...h, bookable } : h)),
    });
  const setRule = (id: string, patch: Partial<WeeklyRule>) =>
    setForm({
      ...form,
      rules: form.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });
  const addRule = (hostId: string, weekday: number) =>
    setForm({
      ...form,
      rules: [
        ...form.rules,
        {
          id: `rule-${Date.now()}-${ruleSeq++}`,
          hostId,
          weekday,
          start: '09:00',
          end: '12:00',
        },
      ],
    });
  const removeRule = (id: string) =>
    setForm({ ...form, rules: form.rules.filter((r) => r.id !== id) });
  // Blocks are managed from the calendar: saving here leaves them as they are.
  const save = () => {
    const patch: Partial<BookingConfig> = { ...form };
    delete patch.blocks;
    return run(() => api.updateBookingConfig(patch), t.common.saved);
  };
  const numberSelect = (
    id: string,
    value: number,
    options: number[],
    format: (n: number) => string,
    onChange: (n: number) => void,
  ) => (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {options.map((n) => (
        <option key={n} value={n}>
          {format(n)}
        </option>
      ))}
    </select>
  );
  return (
    <div className="p-stack">
      <Card title={t.settings.approval}>
        <Segmented
          label={t.settings.approval}
          value={form.approval}
          onChange={(approval) => setForm({ ...form, approval })}
          options={[
            ['manual', t.settings.approvalManual],
            ['auto', t.settings.approvalAuto],
          ]}
        />
        <p className="p-help">
          {form.approval === 'auto'
            ? t.settings.approvalAutoHelp
            : t.settings.approvalManualHelp}
        </p>
      </Card>

      <Card title={t.settings.openings}>
        <div className="p-openings">
          {form.hosts.map((h) => (
            <section key={h.id} className="p-opening-host">
              <header>
                <strong>{h.name}</strong>
                <span className="p-muted">{h.role[locale]}</span>
                <Switch
                  label={t.settings.bookable}
                  checked={h.bookable}
                  onChange={(v) => setHost(h.id, v)}
                />
              </header>
              {h.bookable && (
                <table className="p-opening-table">
                  <tbody>
                    {t.weekdays.map((dayName, weekday) => {
                      const rules = form.rules.filter(
                        (r) => r.hostId === h.id && r.weekday === weekday,
                      );
                      return (
                        <tr key={weekday}>
                          <th scope="row">{dayName}</th>
                          <td>
                            {!rules.length && (
                              <span className="p-muted">
                                {t.settings.closed}
                              </span>
                            )}
                            {rules.map((r) => (
                              <span key={r.id} className="p-range">
                                <input
                                  type="time"
                                  step={900}
                                  aria-label={`${dayName} · ${t.agenda.start}`}
                                  value={r.start}
                                  onChange={(e) =>
                                    setRule(r.id, { start: e.target.value })
                                  }
                                />
                                –
                                <input
                                  type="time"
                                  step={900}
                                  aria-label={`${dayName} · ${t.agenda.end}`}
                                  value={r.end}
                                  onChange={(e) =>
                                    setRule(r.id, { end: e.target.value })
                                  }
                                />
                                <button
                                  type="button"
                                  className="p-icon-button"
                                  aria-label={`${t.common.delete} · ${dayName} ${r.start}`}
                                  onClick={() => removeRule(r.id)}
                                >
                                  <X size={16} />
                                </button>
                              </span>
                            ))}
                            <button
                              type="button"
                              className="p-link p-add"
                              onClick={() => addRule(h.id, weekday)}
                            >
                              <Plus size={14} aria-hidden="true" />{' '}
                              {t.settings.addRange}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </section>
          ))}
        </div>
      </Card>

      <Card title={t.settings.types}>
        <div className="p-type-settings">
          {form.types.map((x) => (
            <div
              key={x.id}
              className="p-type-setting"
              style={{ borderLeftColor: x.colour }}
            >
              <div className="p-grid-2">
                <Field label={`${t.settings.typeLabel} · FR`}>
                  {(id) => (
                    <input
                      id={id}
                      value={x.label.fr}
                      onChange={(e) =>
                        setType(x.id, {
                          label: { ...x.label, fr: e.target.value },
                        })
                      }
                    />
                  )}
                </Field>
                <Field label={`${t.settings.typeLabel} · EN`}>
                  {(id) => (
                    <input
                      id={id}
                      value={x.label.en}
                      onChange={(e) =>
                        setType(x.id, {
                          label: { ...x.label, en: e.target.value },
                        })
                      }
                    />
                  )}
                </Field>
              </div>
              <div className="p-grid-3">
                <Field label={t.settings.duration}>
                  {(id) =>
                    numberSelect(
                      id,
                      x.minutes,
                      [15, 20, 30, 45, 60, 90, 120],
                      (n) => fill(t.settings.minutes, { count: n }),
                      (minutes) => setType(x.id, { minutes }),
                    )
                  }
                </Field>
                <Switch
                  label={t.settings.public}
                  checked={x.public}
                  onChange={(v) => setType(x.id, { public: v })}
                />
                <Switch
                  label={t.settings.active}
                  checked={x.active}
                  onChange={(v) => setType(x.id, { active: v })}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="p-columns" data-even>
        <Card title={t.settings.rules}>
          <div className="p-form">
            <Field label={t.settings.buffer}>
              {(id) =>
                numberSelect(
                  id,
                  form.bufferMinutes,
                  [0, 5, 10, 15, 30],
                  (n) => fill(t.settings.minutes, { count: n }),
                  (bufferMinutes) => setForm({ ...form, bufferMinutes }),
                )
              }
            </Field>
            <Field label={t.settings.minNotice}>
              {(id) =>
                numberSelect(
                  id,
                  form.minNoticeHours,
                  [2, 4, 12, 24, 48, 72],
                  (n) => fill(t.settings.hours, { count: n }),
                  (minNoticeHours) => setForm({ ...form, minNoticeHours }),
                )
              }
            </Field>
            <Field label={t.settings.horizon}>
              {(id) =>
                numberSelect(
                  id,
                  form.horizonDays,
                  [14, 30, 60, 90, 180],
                  (n) => fill(t.settings.daysAhead, { count: n }),
                  (horizonDays) => setForm({ ...form, horizonDays }),
                )
              }
            </Field>
            <Field label={t.settings.step}>
              {(id) =>
                numberSelect(
                  id,
                  form.stepMinutes,
                  [10, 15, 20, 30, 60],
                  (n) => fill(t.settings.minutes, { count: n }),
                  (stepMinutes) => setForm({ ...form, stepMinutes }),
                )
              }
            </Field>
          </div>
        </Card>
        <Card title={t.settings.closedDays}>
          <p className="p-help">{t.settings.closedDaysHelp}</p>
          <ul className="p-tags">
            {[...form.closedDays].sort().map((d) => (
              <li key={d}>
                {d}
                <button
                  type="button"
                  className="p-icon-button"
                  aria-label={`${t.common.delete} ${d}`}
                  onClick={() =>
                    setForm({
                      ...form,
                      closedDays: form.closedDays.filter((x) => x !== d),
                    })
                  }
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
          <div className="p-row">
            <input
              type="date"
              aria-label={t.settings.addClosedDay}
              value={newDay}
              onChange={(e) => setNewDay(e.target.value)}
            />
            <Button
              variant="secondary"
              size="small"
              disabled={!newDay || form.closedDays.includes(newDay)}
              onClick={() => {
                setForm({ ...form, closedDays: [...form.closedDays, newDay] });
                setNewDay('');
              }}
            >
              {t.settings.addClosedDay}
            </Button>
          </div>
        </Card>
      </div>
      <div className="p-sticky-save">
        <Button busy={busy} onClick={save}>
          {t.common.save}
        </Button>
      </div>
    </div>
  );
}

function RetentionForm({ settings }: { settings: RetentionSettings }) {
  const { t, locale, dateTime, relative, count: plural } = useI18n();
  const { run, busy } = useAction();
  const toast = useToast();
  const confirm = useConfirm();
  const files = useData(() => api.listFiles(), []);
  const [form, setForm] = useState(settings);
  const next = nextPurgeAfter(Date.now(), form);
  const preview = fill(form.notice[locale], {
    date: `${dateTime(next)} (${relative(next)})`,
  });
  const removable = (files.data ?? []).filter((f) => !f.kept);
  return (
    <div className="p-columns" data-even>
      <Card title={t.retention.title}>
        <div className="p-form">
          <Switch
            label={t.settings.enabled}
            checked={form.enabled}
            onChange={(enabled) => setForm({ ...form, enabled })}
          />
          <div className="p-grid-2">
            <Field label={t.settings.weekday}>
              {(id) => (
                <select
                  id={id}
                  value={form.weekday}
                  onChange={(e) =>
                    setForm({ ...form, weekday: Number(e.target.value) })
                  }
                >
                  {t.weekdays.map((d, i) => (
                    <option key={d} value={i}>
                      {d}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label={t.settings.hour}>
              {(id) => (
                <select
                  id={id}
                  value={form.hour}
                  onChange={(e) =>
                    setForm({ ...form, hour: Number(e.target.value) })
                  }
                >
                  {Array.from({ length: 24 }, (_, h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>
          <Field
            label={t.settings.minimumDays}
            help={t.settings.minimumDaysHelp}
          >
            {(id, d) => (
              <select
                id={id}
                aria-describedby={d}
                value={form.minimumDays}
                onChange={(e) =>
                  setForm({ ...form, minimumDays: Number(e.target.value) })
                }
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {fill(t.settings.days, { count: n })}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field
            label={`${t.settings.notice} · FR`}
            help={t.settings.noticeHelp}
          >
            {(id, d) => (
              <textarea
                id={id}
                aria-describedby={d}
                rows={3}
                value={form.notice.fr}
                onChange={(e) =>
                  setForm({
                    ...form,
                    notice: { ...form.notice, fr: e.target.value },
                  })
                }
              />
            )}
          </Field>
          <Field label={`${t.settings.notice} · EN`}>
            {(id) => (
              <textarea
                id={id}
                rows={3}
                value={form.notice.en}
                onChange={(e) =>
                  setForm({
                    ...form,
                    notice: { ...form.notice, en: e.target.value },
                  })
                }
              />
            )}
          </Field>
          <div className="p-form-actions">
            <Button
              busy={busy}
              onClick={() =>
                run(() => api.updateRetention(form), t.common.saved)
              }
            >
              {t.common.save}
            </Button>
          </div>
        </div>
      </Card>
      <div className="p-stack">
        <Card title={t.settings.preview}>
          {form.enabled ? (
            <div className="p-notice" role="note">
              <div>
                <strong>{t.retention.title}</strong>
                <p>{preview}</p>
              </div>
            </div>
          ) : (
            <p className="p-muted">{t.retention.off}</p>
          )}
        </Card>
        <Card>
          <div className="p-purge">
            <div>
              {settings.enabled && (
                <p className="p-big">
                  {fill(t.retention.next, {
                    date: dateTime(nextPurgeAfter(Date.now(), settings)),
                  })}
                </p>
              )}
              <p className="p-muted">
                {plural(
                  t.retention.willGo,
                  removable.filter(
                    (f) =>
                      f.expiresAt &&
                      Date.parse(f.expiresAt) <=
                        nextPurgeAfter(Date.now(), settings),
                  ).length,
                )}
              </p>
              {settings.lastPurgeAt && (
                <p className="p-muted">
                  {fill(t.retention.lastPurge, {
                    date: dateTime(settings.lastPurgeAt),
                  })}
                </p>
              )}
            </div>
            <Button
              variant="danger"
              busy={busy}
              disabled={!removable.length}
              onClick={async () => {
                if (
                  await confirm.ask(
                    fill(t.retention.purgeConfirm, { count: removable.length }),
                    t.retention.purgeNow,
                  )
                ) {
                  const count = await run(() => api.purgeNow());
                  if (count !== undefined)
                    toast(plural(t.retention.purged, count));
                }
              }}
            >
              <Trash2 size={16} aria-hidden="true" /> {t.retention.purgeNow}
            </Button>
          </div>
        </Card>
      </div>
      {confirm.element}
    </div>
  );
}
