import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ExternalLink, RefreshCw } from "lucide-react";
import {
  calendarApi,
  calendarRequest,
  CalendarApiError,
  type CalendarStatus,
} from "../calendar-api";
import { useI18n } from "../i18n";
import { useData } from "../state";
import { Button, Card, ErrorNote, Field, Loading, useConfirm } from "../ui";

export function GoogleCalendarPanel() {
  const { locale } = useI18n(),
    fr = locale === "fr";
  const status = useData(calendarApi.status, []);
  const [params] = useSearchParams();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const confirm = useConfirm();
  const issue = (code: string) => {
    if (code === "connected")
      return fr
        ? "Connexion autorisée. Vérifiez les agendas de chaque personne ci-dessous."
        : "Connection authorized. Check each person’s calendars below.";
    if (code === "owner_mismatch")
      return fr
        ? "Connectez le compte admin.ldgenx@gmail.com. Aucun autre compte ne peut activer cette connexion."
        : "Connect admin.ldgenx@gmail.com. Other accounts cannot enable this connection.";
    if (code === "consent_cancelled")
      return fr
        ? "Autorisation annulée. Vous pouvez réessayer."
        : "Authorization cancelled. You can try again.";
    if (
      [
        "scope_required",
        "refresh_required",
        "credentials_unavailable",
      ].includes(code)
    )
      return fr
        ? "Reconnectez le compte et accordez les deux autorisations Agenda demandées pour permettre la synchronisation en arrière-plan."
        : "Reconnect the account and grant both requested Calendar permissions for background synchronization.";
    if (["invalid_input", "invalid_calendar_mapping"].includes(code))
      return fr
        ? "Vérifiez les identifiants : un agenda externe par ligne, 15 maximum par personne. Les agendas créés par LDgenX sont déjà inclus automatiquement."
        : "Check the IDs: one external calendar per line, up to 15 per person. LDgenX-created calendars are already included automatically.";
    if (code === "not_configured")
      return fr
        ? "La connexion Google n’est pas encore configurée sur le serveur."
        : "The Google connection is not yet configured on the server.";
    return fr
      ? "Google Agenda ne peut pas être vérifié. Vérifiez les accès aux agendas, reconnectez le compte si nécessaire, puis réessayez. Les réservations restent protégées lorsque la connexion est activée."
      : "Google Calendar cannot be checked. Check calendar access, reconnect if needed and try again. Bookings remain protected while the connection is enabled.";
  };
  useEffect(() => {
    setNotice("");
  }, [locale]);
  useEffect(() => {
    const timer = window.setInterval(status.reload, 60000);
    return () => window.clearInterval(timer);
  }, [status.reload]);
  async function act(task: () => Promise<unknown>, message = "") {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await task();
      setNotice(message);
    } catch (e) {
      setError(e instanceof CalendarApiError ? e.code : "google_unavailable");
    } finally {
      setBusy(false);
      status.reload();
    }
  }
  if (status.error) return <ErrorNote onRetry={status.reload} />;
  if (!status.data) return <Loading />;
  const s = status.data,
    result = params.get("calendar");
  return (
    <div className="p-stack">
      <Card title={fr ? "Google Agenda" : "Google Calendar"}>
        <p>
          {fr
            ? "Les rendez-vous et les créneaux bloqués dans LDgenX sont envoyés vers un agenda dédié par personne. Les indisponibilités Google bloquent les créneaux correspondants dans le portail."
            : "LDgenX appointments and blocked times are sent to a dedicated calendar per person. Google busy times block the corresponding portal slots."}
        </p>
        <p className="p-help">
          {fr ? "Compte à autoriser : " : "Account to authorize: "}
          <strong>{s.expectedOwner}</strong>
        </p>
        <p role="status">
          <strong>
            {s.enabled
              ? s.connected && !s.lastError
                ? fr
                  ? "Connexion active"
                  : "Connection active"
                : fr
                  ? "Connexion à vérifier"
                  : "Connection needs attention"
              : fr
                ? "Synchronisation non activée"
                : "Synchronization not enabled"}
          </strong>
        </p>
        {s.enabled && !s.connected && (
          <p className="p-notice" data-tone="amber">
            {fr
              ? "La connexion a été interrompue. Reconnectez Google pour vérifier les disponibilités et reprendre les réservations."
              : "The connection was interrupted. Reconnect Google to check availability and resume bookings."}
          </p>
        )}
        {result && (
          <p className="p-notice" role="status">
            {issue(result)}
          </p>
        )}
        {s.lastError && s.connected && (
          <p className="p-notice" data-tone="amber">
            {issue(s.lastError)}
          </p>
        )}
        {s.refreshExpires && (
          <p className="p-notice" data-tone="amber">
            {fr
              ? "L’accès Google actuel expire le "
              : "Current Google access expires on "}
            {new Date(s.refreshExpires).toLocaleString(fr ? "fr-FR" : "en-GB")}.{" "}
            {fr
              ? "Passez l’application Google en production puis reconnectez-la."
              : "Publish the Google app to production, then reconnect it."}
          </p>
        )}
        <div className="p-row" style={{ flexWrap: "wrap" }}>
          <Button
            busy={busy}
            disabled={!s.configured}
            onClick={() =>
              act(async () => {
                const value = await calendarRequest<{ url: string }>(
                  "/connect",
                  "POST",
                );
                const url = new URL(value.url);
                if (url.origin !== "https://accounts.google.com")
                  throw new CalendarApiError("google_unavailable");
                window.location.assign(url.href);
              })
            }
          >
            <ExternalLink size={16} />
            {s.connected
              ? fr
                ? "Reconnecter Google"
                : "Reconnect Google"
              : fr
                ? "Connecter Google Agenda"
                : "Connect Google Calendar"}
          </Button>
          {s.enabled && s.connected && (
            <Button
              variant="secondary"
              busy={busy}
              onClick={() =>
                act(
                  () => calendarRequest("/sync", "POST"),
                  fr
                    ? "Synchronisation demandée. Consultez le statut des envois."
                    : "Synchronization requested. Check the export status.",
                )
              }
            >
              <RefreshCw size={16} />
              {fr ? "Synchroniser maintenant" : "Sync now"}
            </Button>
          )}
        </div>
        <p className="p-help">
          {fr
            ? "Dernière vérification Google : "
            : "Last Google availability check: "}
          {s.lastBusyCheck
            ? new Date(s.lastBusyCheck).toLocaleString(fr ? "fr-FR" : "en-GB")
            : "—"}
        </p>
        <p className="p-help">
          {fr ? "Dernier envoi réussi : " : "Last successful export: "}
          {s.lastSync
            ? new Date(s.lastSync).toLocaleString(fr ? "fr-FR" : "en-GB")
            : "—"}{" "}
          · {s.pending} {fr ? "envoi(s) en attente" : "export(s) pending"}
        </p>
        <p className="p-help">
          {fr
            ? "Les titres et descriptions de vos événements privés ne sont pas copiés. Les rendez-vous exportés ne contiennent ni nom de client, ni adresse e-mail, ni sujet. Aucune invitation Google n’est envoyée."
            : "Private event titles and descriptions are not copied. Exported appointments contain no client name, email address or subject. No Google invitations are sent."}
        </p>
        <p className="p-help">
          {fr
            ? "Modifiez et annulez les rendez-vous dans LDgenX. Les événements ajoutés manuellement dans les agendas dédiés bloquent aussi la personne concernée."
            : "Edit and cancel appointments in LDgenX. Events added manually to dedicated calendars also block the relevant person."}
        </p>
      </Card>
      {s.connected && (
        <CalendarMapping
          key={JSON.stringify(s.busy) + JSON.stringify(s.managed)}
          status={s}
          disabled={busy}
          save={(map) =>
            act(
              () => calendarRequest("/config", "PUT", { busy: map }),
              fr
                ? "Agendas vérifiés et enregistrés."
                : "Calendars checked and saved.",
            )
          }
        />
      )}
      <Card
        title={
          fr
            ? "Avant d’activer la synchronisation"
            : "Before enabling synchronization"
        }
      >
        <p>
          {fr
            ? "Dans Google Cloud, l’application OAuth doit être « En production ». Le mode « Test » limite normalement l’autorisation Agenda à sept jours."
            : "The Google Cloud OAuth app must be “In production”. “Testing” normally limits Calendar authorization to seven days."}
        </p>
        <p>
          {fr
            ? "Chaque personne doit partager avec le compte connecté tous les agendas qui doivent bloquer ses rendez-vous, avec au moins l’accès aux disponibilités. Un agenda non partagé ou non renseigné ne peut pas être vérifié."
            : "Each person must share every calendar that should block their appointments with the connected account, with at least free/busy access. An unshared or unlisted calendar cannot be checked."}
        </p>
      </Card>
      {s.connected && (
        <Button
          variant="danger"
          disabled={busy}
          onClick={async () => {
            if (
              await confirm.ask(
                fr
                  ? "Déconnecter Google ? Les nouvelles réservations et déplacements seront suspendus jusqu’à la reconnexion. Les rendez-vous et agendas existants seront conservés."
                  : "Disconnect Google? New bookings and moves will pause until reconnection. Existing appointments and calendars will be retained.",
                fr ? "Déconnecter" : "Disconnect",
              )
            )
              act(() => calendarRequest("/disconnect", "POST"));
          }}
        >
          {fr ? "Déconnecter Google Agenda" : "Disconnect Google Calendar"}
        </Button>
      )}
      {error && (
        <p className="p-notice" role="alert" data-tone="amber">
          {issue(error)}
        </p>
      )}
      {notice && (
        <p className="p-notice" role="status">
          {notice}
        </p>
      )}
      {confirm.element}
    </div>
  );
}
function CalendarMapping({
  status,
  disabled,
  save,
}: {
  status: CalendarStatus;
  disabled: boolean;
  save: (map: Record<string, string[]>) => void;
}) {
  const { locale } = useI18n(),
    fr = locale === "fr";
  const [values, setValues] = useState(
    Object.fromEntries(
      status.hosts.map((h) => [
        h.id,
        (status.busy[h.id] ?? ["primary"]).join("\n"),
      ]),
    ),
  );
  return (
    <Card
      title={
        fr ? "Agendas à vérifier par personne" : "Calendars to check per person"
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save(
            Object.fromEntries(
              Object.entries(values).map(([id, value]) => [
                id,
                [
                  ...new Set(
                    value
                      .split(/\r?\n/)
                      .map((x) => x.trim())
                      .filter(Boolean),
                  ),
                ],
              ]),
            ),
          );
        }}
        className="p-stack"
      >
        <p className="p-help">
          {fr
            ? "« primary » désigne l’agenda principal du compte connecté ; il est inclus par défaut pour chaque personne. Remplacez-le ou complétez-le avec les identifiants des agendas réellement utilisés par chaque personne (Google Agenda → Paramètres de l’agenda → Intégrer l’agenda → Identifiant de l’agenda)."
            : "“primary” means the connected account’s main calendar and is included by default for each person. Replace or supplement it with the IDs of the calendars each person actually uses (Google Calendar → Calendar settings → Integrate calendar → Calendar ID)."}
        </p>
        {status.hosts.map((host) => (
          <section key={host.id} className="p-stack">
            <Field
              label={host.name}
              help={
                fr
                  ? "Un identifiant d’agenda externe par ligne. Les agendas LDgenX sont déjà pris en compte."
                  : "One external calendar ID per line. LDgenX calendars are already checked."
              }
            >
              {(id, describedBy) => (
                <textarea
                  id={id}
                  aria-describedby={describedBy}
                  rows={3}
                  value={values[host.id] ?? ""}
                  maxLength={4000}
                  disabled={disabled}
                  onChange={(e) =>
                    setValues({ ...values, [host.id]: e.target.value })
                  }
                />
              )}
            </Field>
            <p className="p-help">
              {fr ? "Agenda des rendez-vous : " : "Appointment calendar: "}
              <span style={{ overflowWrap: "anywhere" }}>
                {status.managed[host.id] ?? "—"}
              </span>
            </p>
          </section>
        ))}
        <Button type="submit" busy={disabled}>
          {fr ? "Vérifier et enregistrer" : "Check and save"}
        </Button>
      </form>
    </Card>
  );
}
