import { useEffect, useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import { calendarApi, calendarRequest } from "./calendar-api";
import { useData } from "./state";
import { useI18n } from "./i18n";
import { Button } from "./ui";
export function CalendarSyncInfo({
  kind,
  id,
}: {
  kind: "appointment" | "block";
  id: string;
}) {
  const { locale } = useI18n(),
    fr = locale === "fr",
    info = useData(() => calendarApi.item(kind, id), [kind, id]);
  const [busy, setBusy] = useState(false),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    const timer = window.setInterval(
      info.reload,
      info.data?.state === "pending" ? 5000 : 30000,
    );
    return () => clearInterval(timer);
  }, [info.reload, info.data?.state]);
  const labels = {
    removed: fr ? "Retiré de Google" : "Removed from Google",
    synced: fr ? "Synchronisé avec Google" : "Synced with Google",
    pending: fr ? "Envoi à Google en cours" : "Google export pending",
    error: fr
      ? "Synchronisation à vérifier"
      : "Synchronization needs attention",
    disabled: fr
      ? "Google Agenda non connecté"
      : "Google Calendar not connected",
    not_exported: fr
      ? "Pas encore envoyé à Google"
      : "Not yet exported to Google",
  };
  const retry = async () => {
    setBusy(true);
    setFailed(false);
    try {
      await calendarRequest("/sync", "POST");
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
      info.reload();
    }
  };
  return (
    <section
      className="p-calendar-sync"
      aria-label={fr ? "Synchronisation Google" : "Google synchronization"}
    >
      <strong role="status">
        {info.error
          ? fr
            ? "Statut Google indisponible"
            : "Google status unavailable"
          : info.data
            ? labels[info.data.state]
            : fr
              ? "Vérification Google…"
              : "Checking Google…"}
      </strong>
      {info.data?.syncedAt && (
        <p className="p-help">
          {fr ? "Dernier envoi" : "Last export"} :{" "}
          {new Date(info.data.syncedAt).toLocaleString(fr ? "fr-FR" : "en-GB", {
            timeZone: "Europe/Paris",
          })}
        </p>
      )}
      {info.data?.links.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-link"
        >
          <ExternalLink size={14} aria-hidden="true" />{" "}
          {fr ? "Voir dans Google" : "View in Google"} ·{" "}
          {link.calendar === "Équipe"
            ? fr
              ? "Équipe"
              : "Team"
            : link.calendar}
        </a>
      ))}
      {(info.error ||
        info.data?.state === "error" ||
        info.data?.state === "not_exported" ||
        failed) && (
        <>
          <p className="p-help">
            {fr
              ? "Les données restent enregistrées dans LDgenX. Vérifiez la connexion Google si l’envoi ne reprend pas."
              : "Your data is saved in LDgenX. Check the Google connection if exports do not resume."}
          </p>
          <Button variant="secondary" size="small" busy={busy} onClick={retry}>
            <RefreshCw size={14} />
            {fr ? "Relancer la synchronisation" : "Retry synchronization"}
          </Button>
        </>
      )}
    </section>
  );
}
