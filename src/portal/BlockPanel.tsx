import { useState } from "react";
import { ExternalLink, Lock, Save } from "lucide-react";
import { api, type TimeBlock, type BookingConfig } from "./api";
import { useI18n } from "./i18n";
import { useAction } from "./state";
import { Button, Dialog, Field, useConfirm } from "./ui";
import { CalendarSyncInfo } from "./CalendarSyncInfo";
import {
  addDays,
  atMinutes,
  hhmm,
  minutesOf,
  teamDay,
  wallTime,
  type DayKey,
} from "./lib/time";
function fields(b: TimeBlock) {
  const from = wallTime(b.start),
    to = wallTime(b.end);
  return {
    reason: b.reason,
    hostId: b.hostId ?? "",
    startDay: teamDay(Date.parse(b.start)),
    endDay: b.allDay
      ? addDays(teamDay(Date.parse(b.end)), -1)
      : teamDay(Date.parse(b.end)),
    startTime: hhmm(from.hour * 60 + from.minute),
    endTime: hhmm(to.hour * 60 + to.minute),
    allDay: b.allDay === true,
    version: b.version ?? 1,
  };
}
export function BlockPanel({
  block,
  config,
  onClose,
  onUpdated,
}: {
  block: TimeBlock;
  config: BookingConfig;
  onClose: () => void;
  onUpdated?: (block: TimeBlock) => void;
}) {
  const { locale, date, time, t } = useI18n(),
    fr = locale === "fr",
    external = block.id.startsWith("google:");
  const [editing, setEditing] = useState(false),
    [form, setForm] = useState(() => fields(block));
  const { run, busy } = useAction(),
    confirm = useConfirm();
  const who = block.hostId
    ? config.hosts.find((h) => h.id === block.hostId)?.name
    : fr
      ? "Toute l’équipe"
      : "Whole team";
  const fullDateTime = (value: string) =>
    `${date(value, { year: true })} · ${time(value)}`;
  const dayCount = Math.round(
    (Date.parse(teamDay(Date.parse(block.end))) -
      Date.parse(teamDay(Date.parse(block.start)))) /
      86400000,
  );
  const stale = editing && form.version !== (block.version ?? 1);
  let span: { start: string; end: string } | null = null;
  try {
    if (
      form.startDay &&
      form.endDay &&
      (form.allDay || (form.startTime && form.endTime))
    ) {
      const start = atMinutes(
          form.startDay as DayKey,
          form.allDay ? 0 : minutesOf(form.startTime),
        ),
        end = atMinutes(
          (form.allDay
            ? addDays(form.endDay as DayKey, 1)
            : form.endDay) as DayKey,
          form.allDay ? 0 : minutesOf(form.endTime),
        );
      if (start < end)
        span = { start: start.toISOString(), end: end.toISOString() };
    }
  } catch {
    /* Invalid input remains unsaveable. */
  }
  const save = async () => {
    if (!span || stale) return;
    const updated = await run(
      () =>
        api.updateBlock(block.id, {
          ...span,
          reason: form.reason,
          hostId: form.hostId || null,
          allDay: form.allDay,
          version: form.version,
        }),
      t.common.saved,
    );
    if (updated) {
      onUpdated?.(updated);
      setForm(fields(updated));
      setEditing(false);
    }
  };
  const remove = async () => {
    if (
      await confirm.ask(
        fr
          ? "Supprimer ce créneau ? La suppression sera aussi envoyée aux agendas Google concernés."
          : "Delete this blocked time? Its managed Google copies will also be removed.",
        t.common.delete,
      )
    ) {
      const done = await run(async () => {
        await api.removeBlock(block.id);
        return true;
      }, t.agenda.blockRemoved);
      if (done) onClose();
    }
  };
  return (
    <>
      <Dialog
        open
        side
        title={
          block.reason ||
          (external
            ? fr
              ? "Indisponibilité Google"
              : "Google busy time"
            : fr
              ? "Créneau bloqué"
              : "Blocked time")
        }
        onClose={onClose}
        footer={
          !external ? (
            <>
              <Button variant="danger" disabled={busy} onClick={remove}>
                {t.common.delete}
              </Button>
              {editing ? (
                <Button busy={busy} disabled={!span || stale} onClick={save}>
                  <Save size={16} />
                  {t.common.save}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setForm(fields(block));
                    setEditing(true);
                  }}
                >
                  {fr ? "Modifier le créneau" : "Edit blocked time"}
                </Button>
              )}
            </>
          ) : undefined
        }
      >
        <div className="p-stack">
          <p className="p-eyebrow">
            <Lock size={14} />{" "}
            {external
              ? "Google Agenda"
              : fr
                ? "Indisponibilité LDgenX"
                : "LDgenX blocked time"}
          </p>
          {!editing ? (
            <>
              <dl className="p-calendar-facts">
                <dt>{fr ? "Personnes concernées" : "People affected"}</dt>
                <dd>{who}</dd>
                <dt>{fr ? "Début" : "Start"}</dt>
                <dd>
                  {block.allDay
                    ? date(block.start, { year: true })
                    : fullDateTime(block.start)}
                </dd>
                <dt>{fr ? "Fin" : "End"}</dt>
                <dd>
                  {block.allDay
                    ? date(
                        atMinutes(
                          addDays(teamDay(Date.parse(block.end)), -1),
                          720,
                        ).toISOString(),
                        { year: true },
                      )
                    : fullDateTime(block.end)}
                </dd>
                <dt>{fr ? "Fuseau horaire" : "Time zone"}</dt>
                <dd>Europe/Paris</dd>
                {block.allDay && (
                  <>
                    <dt>{fr ? "Durée" : "Duration"}</dt>
                    <dd>
                      {dayCount === 1
                        ? fr
                          ? "Journée entière"
                          : "All day"
                        : fr
                          ? `${dayCount} journées entières`
                          : `${dayCount} full days`}
                    </dd>
                  </>
                )}
              </dl>
              {external ? (
                <>
                  <p className="p-help">
                    {fr
                      ? "Cette indisponibilité vient de Google. Modifiez l’événement dans Google Agenda ; le portail vérifiera les nouvelles disponibilités. Les détails de vos agendas privés ne sont pas importés."
                      : "This busy period comes from Google. Edit it in Google Calendar; the portal will check the new availability. Private calendar details are not imported."}
                  </p>
                  <a
                    href={block.sourceUrl || "https://calendar.google.com/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-link"
                  >
                    <ExternalLink size={14} />
                    {fr ? "Ouvrir Google Agenda" : "Open Google Calendar"}
                  </a>
                </>
              ) : (
                <CalendarSyncInfo kind="block" id={block.id} />
              )}
            </>
          ) : (
            <>
              <Field
                label={fr ? "Intitulé du créneau" : "Blocked-time title"}
                help={
                  fr
                    ? "Cet intitulé peut apparaître dans Google selon les paramètres de synchronisation."
                    : "This title can appear in Google depending on synchronization settings."
                }
              >
                {(id) => (
                  <input
                    id={id}
                    maxLength={500}
                    value={form.reason}
                    onChange={(e) =>
                      setForm({ ...form, reason: e.target.value })
                    }
                  />
                )}
              </Field>
              <Field label={fr ? "Personnes concernées" : "People affected"}>
                {(id) => (
                  <select
                    id={id}
                    value={form.hostId}
                    onChange={(e) =>
                      setForm({ ...form, hostId: e.target.value })
                    }
                  >
                    <option value="">
                      {fr ? "Toute l’équipe" : "Whole team"}
                    </option>
                    {config.hosts
                      .filter((h) => h.bookable || h.id === block.hostId)
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
                  onChange={(e) =>
                    setForm({ ...form, allDay: e.target.checked })
                  }
                />
                {fr ? "Journée entière" : "All day"}
              </label>
              <div className="p-calendar-fields">
                <Field label={fr ? "Date de début" : "Start date"}>
                  {(id) => (
                    <input
                      type="date"
                      id={id}
                      value={form.startDay}
                      onChange={(e) =>
                        setForm({ ...form, startDay: e.target.value as DayKey })
                      }
                    />
                  )}
                </Field>
                <Field
                  label={
                    fr
                      ? form.allDay
                        ? "Dernier jour inclus"
                        : "Date de fin"
                      : form.allDay
                        ? "Last day inclusive"
                        : "End date"
                  }
                >
                  {(id) => (
                    <input
                      type="date"
                      id={id}
                      min={form.startDay}
                      value={form.endDay}
                      onChange={(e) =>
                        setForm({ ...form, endDay: e.target.value as DayKey })
                      }
                    />
                  )}
                </Field>
              </div>
              {!form.allDay && (
                <div className="p-calendar-fields">
                  <Field label={fr ? "Heure de début" : "Start time"}>
                    {(id) => (
                      <input
                        type="time"
                        id={id}
                        value={form.startTime}
                        onChange={(e) =>
                          setForm({ ...form, startTime: e.target.value })
                        }
                      />
                    )}
                  </Field>
                  <Field label={fr ? "Heure de fin" : "End time"}>
                    {(id) => (
                      <input
                        type="time"
                        id={id}
                        value={form.endTime}
                        onChange={(e) =>
                          setForm({ ...form, endTime: e.target.value })
                        }
                      />
                    )}
                  </Field>
                </div>
              )}
              <p className="p-help">
                {fr
                  ? "Les horaires sont exprimés en heure de Paris. L’intitulé, la portée et les dates seront mis à jour dans Google."
                  : "Times use Paris time. The title, scope and dates will be updated in Google."}
              </p>
              {stale && (
                <p className="p-notice" role="alert">
                  {t.errors.stale_record}{" "}
                  <Button size="small" onClick={() => setForm(fields(block))}>
                    {fr ? "Recharger la fiche" : "Reload details"}
                  </Button>
                </p>
              )}
              <Button variant="ghost" onClick={() => setEditing(false)}>
                {t.common.cancel}
              </Button>
            </>
          )}
        </div>
      </Dialog>
      {confirm.element}
    </>
  );
}
