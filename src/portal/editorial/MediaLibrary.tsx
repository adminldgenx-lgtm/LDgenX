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
  const upload = async (files: File[]) => {
    setBusy(true);
    setError("");
    try {
      let last: EditorialMedia | undefined;
      for (const [index, file] of files.entries()) {
        setReport(
          `${l("Optimisation et import", "Optimising and uploading")}${files.length > 1 ? ` (${index + 1}/${files.length})` : ""}…`,
        );
        const type =
          kind ?? (file.type.startsWith("video/") ? "video" : "image");
        const { media, delivered } = await uploadMedia(file, type);
        last = media;
        setItems((old) => [media, ...old.filter((m) => m.id !== media.id)]);
        onChange?.();
        window.dispatchEvent(new Event("cms-media-changed"));
        setReport(
          type === "image"
            ? `${l("Image optimisée", "Image optimised")} · ${megabytes(file.size)} → ${megabytes(delivered)} ${l("en WebP, sans perte visible", "as WebP, with no visible loss")}`
            : l("Vidéo importée", "Video uploaded"),
        );
      }
      if (last && pick && files.length === 1) pick(last);
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
          "Chaque image est automatiquement convertie en WebP et allégée avant l’envoi, en quatre tailles, sans perte de qualité visible. Les pages chargent ainsi la bonne taille pour chaque écran.",
          "Every image is automatically converted to WebP and lightened before upload, in four sizes, with no visible loss of quality. Pages then load the right size for each screen.",
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
          multiple={!pick}
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
            const files = [...(e.target.files ?? [])];
            if (files.length) void upload(files);
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
                {m.kind === "image" ? "WebP" : l("Vidéo", "Video")}
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
