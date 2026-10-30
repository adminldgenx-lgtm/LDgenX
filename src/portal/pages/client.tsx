// The client's side: the conversation with the team, the files the team dropped, the
// appointments, the account.
import { useEffect, useState } from "react";
import { CalendarPlus, Download, Search } from "lucide-react";
import { api, type Appointment, type BookingConfig } from "../api";
import { fill, useI18n } from "../i18n";
import { useAction, useData, useSession, useUser } from "../state";
import {
  Button,
  Card,
  DateBlock,
  Empty,
  ErrorNote,
  Segmented,
  Field,
  Fill,
  Loading,
  PageHeader,
  StatusPill,
  Switch,
  useConfirm,
} from "../ui";
import {
  downloadFile,
  ExpiringNotice,
  FileRow,
  RetentionNotice,
  Thread,
  usePeople,
} from "../shared";
import { AddToCalendar, ChangeDialog, RequestFlow } from "../booking";
import { OpenLayout } from "../layout";
import { searchText } from "../../lib/search";

export function ClientMessagesPage() {
  const { t } = useI18n();
  const user = useUser();
  return (
    <>
      <PageHeader title={t.nav.messages} lead={t.messages.clientLead} />
      {user.status === "pending" && (
        <div className="p-notice" data-tone="info" role="note">
          <p>{t.auth.pending}</p>
        </div>
      )}
      <ExpiringNotice />
      <Card pad={false} className="p-thread-card">
        <Thread clientId={user.id} />
      </Card>
    </>
  );
}

export function ClientFilesPage() {
  const { t, locale } = useI18n();
  const fr = locale === "fr";
  const [direction, setDirection] = useState<"received" | "sent">("received");
  const [query, setQuery] = useState("");
  const files = useData(() => api.listFiles(), []);
  const people = usePeople();
  const { run, busy } = useAction();
  const fromTeam = (files.data ?? []).filter(
    (f) => f.direction === "to_client",
  );
  const sent = (files.data ?? []).filter((f) => f.direction === "from_client");
  const shown = (direction === "received" ? fromTeam : sent)
    .filter((f) =>
      searchText(`${f.name} ${f.note}`).includes(searchText(query)),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  // Opening the page reads the notifications of new files.
  useEffect(() => {
    api.markActivityRead({ kinds: ["file_uploaded"] }).catch(() => {});
  }, []);
  return (
    <>
      <PageHeader
        title={t.nav.files}
        lead={t.files.clientLead}
        actions={
          direction === "received" &&
          !query.trim() &&
          fromTeam.length > 1 && (
            <Button
              variant="secondary"
              busy={busy}
              onClick={() =>
                run(async () => {
                  for (const f of fromTeam) await downloadFile(f);
                })
              }
            >
              <Download size={18} aria-hidden="true" /> {t.files.downloadAll}
            </Button>
          )
        }
      />
      <RetentionNotice />
      <div className="p-toolbar">
        <Segmented
          label={t.nav.files}
          value={direction}
          onChange={setDirection}
          options={[
            [
              "received",
              `${fr ? "Reçus de LDgenX" : "Received from LDgenX"} (${fromTeam.length})`,
            ],
            [
              "sent",
              `${fr ? "Envoyés à LDgenX" : "Sent to LDgenX"} (${sent.length})`,
            ],
          ]}
        />
        <label className="p-search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            aria-label={fr ? "Rechercher un fichier" : "Search files"}
            placeholder={
              fr ? "Nom du fichier ou commentaire…" : "File name or note…"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      {files.data && !files.error && (
        <p className="p-help">
          {shown.length}{" "}
          {fr
            ? shown.length === 1
              ? "fichier affiché, du plus récent au plus ancien."
              : "fichiers affichés, du plus récent au plus ancien."
            : shown.length === 1
              ? "file shown, newest first."
              : "files shown, newest first."}
        </p>
      )}
      <Card pad={false}>
        {files.error ? (
          <ErrorNote onRetry={files.reload} />
        ) : !files.data ? (
          <Loading />
        ) : !shown.length ? (
          <Empty>
            {query.trim()
              ? fr
                ? "Aucun fichier ne correspond à cette recherche."
                : "No files match this search."
              : direction === "sent"
                ? fr
                  ? "Les pièces jointes envoyées dans vos messages apparaîtront ici."
                  : "Attachments sent in your messages will appear here."
                : t.files.empty}
          </Empty>
        ) : (
          <ul className="p-files">
            {shown.map((f) => (
              <FileRow key={f.id} file={f} people={people} />
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

/** One appointment, from the client's side. */
function AppointmentRow({
  appointment: a,
  config,
  onChange,
  onCancel,
}: {
  appointment: Appointment;
  config: BookingConfig;
  onChange: (a: Appointment) => void;
  onCancel: (a: Appointment) => void;
}) {
  const { t, locale, date, time, dateTime } = useI18n();
  const type = config.types.find((x) => x.id === a.typeId);
  const live =
    (a.status === "requested" || a.status === "confirmed") &&
    Date.parse(a.end) > Date.now();
  return (
    <li
      className="p-appointment"
      data-past={!live || undefined}
      data-cancelled={
        a.status === "cancelled" || a.status === "declined" || undefined
      }
    >
      <DateBlock iso={a.start} />
      <div className="p-appointment-main">
        <div className="p-appointment-head">
          <strong>{type?.label[locale]}</strong>
          <StatusPill status={a.status} />
        </div>
        <p className="p-muted">
          {date(a.start)} · {time(a.start)}–{time(a.end)}
          {a.status === "confirmed" && (
            <> · {fill(t.booking.withHost, { name: "LDgenX" })}</>
          )}
        </p>
        {a.change && (
          <p className="p-change">
            {fill(t.booking.changePending, { date: dateTime(a.change.start) })}
          </p>
        )}
        {a.topic && <p className="p-quote">{a.topic}</p>}
        {a.reply && (
          <p className="p-reply">
            <strong>{t.booking.teamReply}</strong> {a.reply}
          </p>
        )}
        {live && a.status === "confirmed" && (
          <div className="p-row">
            {a.meetingUrl && (
              <a
                className="p-button"
                data-variant="primary"
                data-size="small"
                href={a.meetingUrl}
                target="_blank"
                rel="noreferrer"
              >
                {t.booking.join}
              </a>
            )}
            <AddToCalendar appointment={a} config={config} />
          </div>
        )}
      </div>
      {live && (
        <div className="p-appointment-actions">
          {!a.change && (
            <Button variant="ghost" size="small" onClick={() => onChange(a)}>
              {t.booking.change}
            </Button>
          )}
          <Button variant="quiet" size="small" onClick={() => onCancel(a)}>
            {a.status === "requested"
              ? t.booking.cancelRequest
              : t.booking.cancel}
          </Button>
        </div>
      )}
    </li>
  );
}

export function ClientAppointmentsPage() {
  const { t } = useI18n();
  const list = useData(() => api.listAppointments(), []);
  const config = useData(() => api.getBookingConfig(), []);
  const { run } = useAction();
  const confirm = useConfirm();
  const [requesting, setRequesting] = useState(false);
  const [changing, setChanging] = useState<Appointment | null>(null);
  useEffect(() => {
    api
      .markActivityRead({
        kinds: [
          "appointment_confirmed",
          "appointment_declined",
          "appointment_cancelled",
          "appointment_moved",
          "change_declined",
        ],
      })
      .catch(() => {});
  }, []);
  const now = Date.now();
  const all = list.data ?? [];
  const upcoming = all.filter(
    (a) =>
      (a.status === "requested" || a.status === "confirmed") &&
      Date.parse(a.end) > now,
  );
  const past = all.filter((a) => !upcoming.includes(a)).reverse();
  const cancel = async (a: Appointment) => {
    if (
      await confirm.ask(
        t.booking.cancelConfirm,
        a.status === "requested" ? t.booking.cancelRequest : t.booking.cancel,
      )
    )
      run(() => api.cancelAppointment(a.id), t.booking.cancelledToast);
  };
  const rows = (items: Appointment[]) =>
    config.data && (
      <ul className="p-appointments">
        {items.map((a) => (
          <AppointmentRow
            key={a.id}
            appointment={a}
            config={config.data!}
            onChange={setChanging}
            onCancel={cancel}
          />
        ))}
      </ul>
    );
  return (
    <>
      <PageHeader
        title={t.nav.appointments}
        actions={
          !requesting && (
            <Button onClick={() => setRequesting(true)}>
              <CalendarPlus size={18} aria-hidden="true" /> {t.booking.request}
            </Button>
          )
        }
      />
      {requesting && (
        <Card
          title={t.booking.request}
          action={
            <button
              type="button"
              className="p-link"
              onClick={() => setRequesting(false)}
            >
              {t.common.close}
            </button>
          }
        >
          <RequestFlow onDone={() => setRequesting(false)} />
        </Card>
      )}
      <Card title={t.booking.upcoming} pad={false}>
        {list.error || config.error ? (
          <ErrorNote
            onRetry={() => {
              list.reload();
              config.reload();
            }}
          />
        ) : !list.data || !config.data ? (
          <Loading />
        ) : upcoming.length ? (
          rows(upcoming)
        ) : (
          <Empty>{t.booking.none}</Empty>
        )}
      </Card>
      {!!past.length && (
        <Card title={t.booking.past} pad={false}>
          {rows(past)}
        </Card>
      )}
      <ChangeDialog appointment={changing} onClose={() => setChanging(null)} />
      {confirm.element}
    </>
  );
}

export function AccountPage() {
  const { t, locale, setLocale } = useI18n();
  const user = useUser();
  const { setUser } = useSession();
  const { run, busy } = useAction();
  const [profile, setProfile] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    organisation: user.organisation,
    phone: user.phone,
  });
  const [notify, setNotify] = useState(user.notify);
  const [passwords, setPasswords] = useState({ current: "", next: "" });
  const set =
    (key: keyof typeof profile) => (event: { target: { value: string } }) =>
      setProfile({ ...profile, [key]: event.target.value });
  const save = async (
    patch: Parameters<typeof api.updateProfile>[0],
    syncLocale = true,
  ) => {
    const updated = await run(() => api.updateProfile(patch), t.common.saved);
    if (updated) setUser(updated, syncLocale);
  };
  return (
    <>
      <PageHeader title={t.common.account} lead={user.email} />
      <div className="p-columns" data-even>
        <Card title={t.account.profile}>
          <form
            className="p-form"
            onSubmit={(event) => {
              event.preventDefault();
              save(profile);
            }}
          >
            <div className="p-grid-2">
              <Field label={t.auth.firstName}>
                {(id) => (
                  <input
                    id={id}
                    value={profile.firstName}
                    onChange={set("firstName")}
                  />
                )}
              </Field>
              <Field label={t.auth.lastName}>
                {(id) => (
                  <input
                    id={id}
                    value={profile.lastName}
                    onChange={set("lastName")}
                  />
                )}
              </Field>
              <Field label={t.auth.organisation}>
                {(id) => (
                  <input
                    id={id}
                    value={profile.organisation}
                    onChange={set("organisation")}
                  />
                )}
              </Field>
              <Field label={t.auth.phone} optional>
                {(id) => (
                  <input
                    id={id}
                    type="tel"
                    value={profile.phone}
                    onChange={set("phone")}
                  />
                )}
              </Field>
            </div>
            <Field label={t.account.languagePref}>
              {(id) => (
                <select
                  id={id}
                  value={locale}
                  onChange={(e) => {
                    const next = e.target.value as "fr" | "en";
                    setLocale(next);
                    save({ locale: next }, false);
                  }}
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              )}
            </Field>
            <div className="p-form-actions">
              <Button type="submit" busy={busy}>
                {t.common.save}
              </Button>
            </div>
          </form>
        </Card>
        <div className="p-stack">
          <Card title={t.account.notifications}>
            {(Object.keys(notify) as (keyof typeof notify)[])
              .filter((key) => user.role === "client" || key !== "weeklyPurge")
              .map((key) => (
                <Switch
                  key={key}
                  label={t.account.notify[key]}
                  checked={notify[key]}
                  onChange={(value) => {
                    const next = { ...notify, [key]: value };
                    setNotify(next);
                    save({ notify: next });
                  }}
                />
              ))}
          </Card>
          <Card title={t.account.password}>
            <form
              className="p-form"
              onSubmit={async (event) => {
                event.preventDefault();
                if (passwords.next.length < 8) return;
                const done = await run(async () => {
                  await api.changePassword(passwords.current, passwords.next);
                  return true;
                }, t.account.passwordChanged);
                if (done) setPasswords({ current: "", next: "" });
              }}
            >
              <Field label={t.account.currentPassword}>
                {(id) => (
                  <input
                    id={id}
                    type="password"
                    autoComplete="current-password"
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords({ ...passwords, current: e.target.value })
                    }
                  />
                )}
              </Field>
              <Field
                label={t.account.newPassword}
                help={t.auth.passwordHint}
                error={
                  passwords.next && passwords.next.length < 8
                    ? t.auth.passwordShort
                    : null
                }
              >
                {(id, d) => (
                  <input
                    id={id}
                    aria-describedby={d}
                    type="password"
                    autoComplete="new-password"
                    value={passwords.next}
                    onChange={(e) =>
                      setPasswords({ ...passwords, next: e.target.value })
                    }
                  />
                )}
              </Field>
              <div className="p-form-actions">
                <Button
                  type="submit"
                  variant="secondary"
                  busy={busy}
                  disabled={!passwords.current || passwords.next.length < 8}
                >
                  {t.account.changePassword}
                </Button>
              </div>
            </form>
          </Card>
          {user.role === "client" && (
            <Card title={t.account.deleteTitle}>
              <p className="p-muted">
                <Fill
                  text={t.account.deleteText}
                  values={{
                    email: <a href="mailto:info@ldgenx.fr">info@ldgenx.fr</a>,
                  }}
                />
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

/** Requesting an appointment without an account: visitors reach it from the public site. */
export function PublicBookingPage() {
  const { t } = useI18n();
  return (
    <OpenLayout>
      <div className="p-public-booking">
        <p className="p-eyebrow">LDgenX</p>
        <h1>{t.booking.request}</h1>
        <p className="p-lead">{t.booking.publicLead}</p>
        <Card>
          <RequestFlow publicMode />
        </Card>
      </div>
    </OpenLayout>
  );
}
