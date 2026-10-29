import { useEffect, useRef, useState } from "react";
import { ImagePlus, Film, Trash2, RefreshCw } from "lucide-react";
import type { EditorialMedia } from "../../../supabase/functions/_shared/editorial";
import { Button, Dialog } from "../ui";
import { cms, cmsRequest, megabytes } from "./api";
import { cmsError, useWords } from "./labels";
import { uploadMedia } from "./media";
import "./admin.css";

export function MediaLibrary({
  pick,
  kind,
  onChange,
}: {
  pick?: (m: EditorialMedia) => void;
  kind?: "image" | "video";
  onChange?: () => void;
}) {
  const l = useWords(),
    input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<EditorialMedia[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [query, setQuery] = useState(""),
    [report, setReport] = useState("");
  const [remove, setRemove] = useState<EditorialMedia | null>(null);
  const refresh = async () => {
    setLoading(true);
    try {
      setItems(await cms.media());
      setError("");
      onChange?.();
      window.dispatchEvent(new Event("cms-media-changed"));
    } catch (e) {
      setError(cmsError(e, l));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void refresh();
  }, []);
  const upload = async (file: File) => {
    setBusy(true);
    setError("");
    setReport(l("Préparation et import en cours…", "Preparing and uploading…"));
    try {
      const type = kind ?? (file.type.startsWith("video/") ? "video" : "image");
      const result = await uploadMedia(file, type);
      setItems((old) => [result, ...old.filter((m) => m.id !== result.id)]);
      onChange?.();
      window.dispatchEvent(new Event("cms-media-changed"));
      setReport(
        `${l("Import terminé", "Upload complete")} · ${megabytes(file.size)} → ${megabytes(result.bytes)} ${type === "image" ? "WebP" : ""}`,
      );
    } catch (e) {
      setError(cmsError(e, l));
      setReport("");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };
  return (
    <div className="cms-library">
      <p className="p-help">
        {l(
          "Les images sont converties en WebP dans votre navigateur, redimensionnées sans agrandissement et proposées en trois tailles au maximum. Vérifiez la lisibilité des figures après l’import.",
          "Images are converted to WebP in your browser, resized without upscaling and stored in up to three sizes. Check scientific figures remain readable after uploading.",
        )}
      </p>
      <p className="p-help">
        {l(
          "Vidéos : MP4/WebM, 20 MB et 3 minutes maximum. Pour les formats longs, le lecteur accepte YouTube et Vimeo sans stocker la vidéo sur Supabase.",
          "Video: MP4/WebM, up to 20 MB and 3 minutes. For longer videos, the editor supports YouTube and Vimeo without storing the video in Supabase.",
        )}
      </p>
      <div className="cms-actions">
        <Button
          variant="ghost"
          disabled={busy || loading}
          onClick={async () => {
            setBusy(true);
            setError("");
            try {
              const result = await cmsRequest<{ removed: number }>(
                "/media/cleanup",
                "POST",
                {},
              );
              await refresh();
              setReport(
                `${l("Imports interrompus nettoyés", "Interrupted uploads cleaned")}: ${result.removed}`,
              );
            } catch (e) {
              setError(cmsError(e, l));
            } finally {
              setBusy(false);
            }
          }}
        >
          {l("Nettoyer les imports interrompus", "Clean interrupted uploads")}
        </Button>
        <input
          ref={input}
          type="file"
          className="cms-file-input"
          aria-label={l("Importer un média", "Upload media")}
          accept={
            kind === "video"
              ? "video/mp4,video/webm"
              : kind === "image"
                ? "image/jpeg,image/png,image/webp,image/avif"
                : "image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
          }
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
          }}
        />
        <Button busy={busy} onClick={() => input.current?.click()}>
          <ImagePlus size={17} />
          {l("Importer", "Upload")}
        </Button>
        <Button
          variant="secondary"
          disabled={busy || loading}
          onClick={refresh}
        >
          <RefreshCw size={16} />
          {l("Actualiser", "Refresh")}
        </Button>
        <input
          type="search"
          className="p-input"
          aria-label={l("Rechercher un média", "Search media")}
          placeholder={l("Rechercher un média…", "Search media…")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {error && (
        <p role="alert" className="p-error">
          {error}
        </p>
      )}
      {report && (
        <p role="status" className="cms-notice">
          {report}
        </p>
      )}
      {loading && <p role="status">{l("Chargement…", "Loading…")}</p>}
      <div className="cms-media-grid">
        {items
          .filter(
            (m) =>
              (!kind || m.kind === kind) &&
              m.name.toLowerCase().includes(query.toLowerCase()),
          )
          .map((m) => (
            <div className="cms-media-card" key={m.id}>
              {m.kind === "image" ? (
                <img
                  src={Object.values(m.urls)[0]}
                  alt={m.name}
                  loading="lazy"
                />
              ) : (
                <div className="cms-video-icon">
                  <Film size={36} />
                  <span>MP4 / WebM</span>
                </div>
              )}
              <strong title={m.name}>{m.name}</strong>
              <span>
                {megabytes(m.bytes)} ·{" "}
                {m.kind === "image"
                  ? `${m.variants.length} WebP`
                  : l("Vidéo", "Video")}
              </span>
              <small>
                {m.isPublic
                  ? l("Déjà diffusé publiquement", "Previously published")
                  : l("Privé", "Private")}{" "}
                · {m.uses ?? 0} {l("document(s)", "document(s)")}
              </small>
              <div className="cms-actions">
                {pick && (
                  <Button size="small" onClick={() => pick(m)}>
                    {l("Choisir", "Select")}
                  </Button>
                )}
                <Button
                  size="small"
                  variant="ghost"
                  disabled={busy || !!m.uses}
                  onClick={() => setRemove(m)}
                  aria-label={`${l("Supprimer", "Delete")} ${m.name}`}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
      </div>
      {!loading && !items.length && (
        <p>{l("Aucun média importé.", "No uploaded media yet.")}</p>
      )}
      <Dialog
        open={!!remove}
        onClose={() => !busy && setRemove(null)}
        title={l("Supprimer ce média ?", "Delete this media?")}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setRemove(null)}
              disabled={busy}
            >
              {l("Annuler", "Cancel")}
            </Button>
            <Button
              variant="danger"
              busy={busy}
              onClick={async () => {
                if (!remove) return;
                setBusy(true);
                try {
                  await cmsRequest(`/media/${remove.id}`, "DELETE");
                  setRemove(null);
                  await refresh();
                } catch (e) {
                  setError(cmsError(e, l));
                  setRemove(null);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {l("Supprimer définitivement", "Delete permanently")}
            </Button>
          </>
        }
      >
        <p>{remove?.name}</p>
        <p>
          {l(
            "Cette suppression retire les fichiers du stockage. Les médias utilisés sont protégés.",
            "This removes the files from storage. Media used by documents or revisions are protected.",
          )}
        </p>
      </Dialog>
    </div>
  );
}
export function MediaPage() {
  const l = useWords();
  return (
    <div className="cms-admin">
      <header className="cms-page-head">
        <div>
          <p className="cms-eyebrow">LDgenX · {l("Édition", "Editorial")}</p>
          <h1>{l("Médiathèque", "Media library")}</h1>
        </div>
      </header>
      <StorageMeter />
      <MediaLibrary />
    </div>
  );
}
export function StorageMeter() {
  const l = useWords();
  const [stats, setStats] = useState<{
    mediaBytes: number;
    mediaLimit: number;
    projectBytes: number;
    projectLimit: number;
  } | null>(null);
  useEffect(() => {
    const update = () =>
      void cmsRequest<typeof stats>("/stats")
        .then(setStats)
        .catch(() => {});
    update();
    window.addEventListener("cms-media-changed", update);
    return () => window.removeEventListener("cms-media-changed", update);
  }, []);
  if (!stats) return null;
  return (
    <div className="cms-storage">
      <div>
        <strong>{l("Stockage éditorial", "Editorial storage")}</strong>
        <span>
          {megabytes(stats.mediaBytes)} / {megabytes(stats.mediaLimit)}
        </span>
      </div>
      <meter min={0} max={stats.mediaLimit} value={stats.mediaBytes} />
      <p>
        {l(
          "Les copies privées et publiques sont comptées. Le budget éditorial de 250 MB réserve de la place aux autres usages du projet.",
          "Both private and public copies are counted. The 250 MB editorial budget leaves room for other project uses.",
        )}{" "}
        {l("Projet complet", "Whole project")}: {megabytes(stats.projectBytes)}.
      </p>
    </div>
  );
}
