import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Plus,
  Save,
  Eye,
  Send,
  History,
  Download,
  ImagePlus,
  Trash2,
  RotateCcw,
  Pencil,
} from "lucide-react";
import { Button, Dialog } from "../ui";
import { useI18n } from "../i18n";
import { cms, cmsRequest } from "./api";
import { cmsError, issueLabels, kindNames, useWords } from "./labels";
import { MediaLibrary, StorageMeter } from "./MediaLibrary";
import { ImageFields, RichEditor, type RichHandle } from "./RichEditor";
import { MediaImage } from "../../editorial/media-view";
import { EditorialDocumentView } from "../../editorial/PublicDocument";
import { LocaleProvider } from "../../i18n";
import { loadCatalog } from "../../content/catalog";
import {
  contentPath,
  documentText,
  publicationIssues,
  validateDocument,
  videoEmbed,
  type ContentImage,
  type ContentKind,
  type EditorialDocument,
  type EditorialEntry,
  type EditorialMedia,
  type EditorialRevision,
  type PublishedDocument,
  type EditorialPageTemplate,
} from "../../../supabase/functions/_shared/editorial";
import "../../editorial/editorial.css";
import "./admin.css";
import { searchText } from "../../lib/search";
import {
  scientificOutline,
  outlineLabels,
  canStartStructure,
  readWritingRecovery,
} from "./writing";
const SitePagePreview = lazy(() => import("./PagePreview"));

function useEntries() {
  const l = useWords();
  const [entries, setEntries] = useState<EditorialEntry[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const reload = async () => {
    setLoading(true);
    try {
      setEntries(await cms.list());
      setError("");
    } catch (e) {
      setError(cmsError(e, l));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void reload();
  }, []);
  return { entries, error, loading, reload };
}
function status(entry: EditorialEntry, l: (fr: string, en: string) => string) {
  return entry.deletedAt
    ? l("Corbeille", "Trash")
    : entry.publication?.status === "withdrawn"
      ? l("Retiré", "Withdrawn")
      : entry.publication
        ? entry.version === entry.publishedVersion
          ? l("Publié", "Published")
          : l(
              "Publié · modifications en brouillon",
              "Published · draft changes",
            )
        : entry.legacyId
          ? l("Site actuel · copie de travail", "Existing site · working copy")
          : l("Brouillon privé", "Private draft");
}
export function ContentListPage() {
  const l = useWords(),
    { locale } = useI18n(),
    navigate = useNavigate(),
    { entries, error, loading, reload } = useEntries();
  const [query, setQuery] = useState(""),
    [kind, setKind] = useState("all"),
    [language, setLanguage] = useState("all"),
    [state, setState] = useState("all"),
    [create, setCreate] = useState(false),
    [newKind, setNewKind] = useState<ContentKind>("article"),
    [newLocale, setNewLocale] = useState<"fr" | "en">(locale),
    [busy, setBusy] = useState(false),
    [actionError, setActionError] = useState(""),
    [deletion, setDeletion] = useState<EditorialEntry | null>(null),
    [notice, setNotice] = useState("");
  const [pageTemplates, setPageTemplates] = useState<EditorialPageTemplate[]>(
      [],
    ),
    [pagePath, setPagePath] = useState(""),
    [templateError, setTemplateError] = useState(false);
  const loadTemplates = () => {
    setTemplateError(false);
    void cmsRequest<EditorialPageTemplate[]>("/page-templates")
      .then(setPageTemplates)
      .catch(() => setTemplateError(true));
  };
  useEffect(loadTemplates, []);
  const availablePages = pageTemplates.filter((p) => p.locale === newLocale);
  const selectedPage = availablePages.some((p) => p.path === pagePath)
    ? pagePath
    : availablePages[0]?.path;
  const trashCount = entries.filter((e) => e.deletedAt).length;
  const restoreEntry = async (e: EditorialEntry) => {
    setBusy(true);
    setActionError("");
    try {
      await cmsRequest(`/entries/${e.id}/untrash`, "POST", {
        version: e.version,
      });
      setNotice(
        l(
          "Contenu restauré en brouillon. Relisez-le avant de le republier.",
          "Content restored as a draft. Review it before publishing again.",
        ),
      );
      reload();
    } catch (error) {
      setActionError(cmsError(error, l));
    } finally {
      setBusy(false);
    }
  };
  const filtered = entries.filter(
    (e) =>
      (state === "trash" ? !!e.deletedAt : !e.deletedAt) &&
      (kind === "all" || e.kind === kind) &&
      (language === "all" || e.locale === language) &&
      (state === "all" ||
        state === "trash" ||
        (state === "draft" && !e.publication && !e.legacyId) ||
        (state === "published" && e.publication?.status === "published") ||
        (state === "existing" && !!e.legacyId && !e.publication) ||
        (state === "withdrawn" && e.publication?.status === "withdrawn")) &&
      searchText(
        `${e.document.title} ${e.document.summary} ${e.slug}`,
      ).includes(searchText(query)),
  );
  return (
    <div className="cms-admin">
      <header className="cms-page-head">
        <div>
          <p className="cms-eyebrow">
            LDgenX · {l("Édition scientifique", "Scientific publishing")}
          </p>
          <h1>{l("Contenus", "Content")}</h1>
          <p>
            {l(
              "Rédiger, relire et publier. Les brouillons restent privés.",
              "Write, review and publish. Drafts remain private.",
            )}
          </p>
        </div>
        <div className="cms-actions">
          <Button
            variant="secondary"
            onClick={() => {
              setNewKind("page");
              setCreate(true);
            }}
          >
            {l("Modifier une page du site", "Edit a website page")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setState(state === "trash" ? "all" : "trash")}
          >
            <Trash2 size={16} />
            {state === "trash"
              ? l("Tous les contenus", "All content")
              : `${l("Corbeille", "Trash")} (${trashCount})`}
          </Button>
          <Link
            className="p-button"
            data-variant="secondary"
            to="/admin/medias"
          >
            {l("Médiathèque", "Media library")}
          </Link>
          <Button
            onClick={() => {
              setNewKind("article");
              setCreate(true);
            }}
          >
            <Plus size={17} />
            {l("Nouveau contenu", "New content")}
          </Button>
        </div>
      </header>
      <StorageMeter />
      <div className="cms-filters">
        <input
          className="p-input"
          type="search"
          placeholder={l(
            "Titre, sujet ou adresse…",
            "Title, topic or address…",
          )}
          aria-label={l("Rechercher les contenus", "Search content")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label={l("Type de contenu", "Content type")}
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        >
          <option value="all">{l("Tous les types", "All types")}</option>
          {Object.entries(kindNames[locale]).map(([k, v]) => (
            <option value={k} key={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          aria-label={l("Langue", "Language")}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="all">FR + EN</option>
          <option value="fr">FR</option>
          <option value="en">EN</option>
        </select>
        <select
          aria-label={l("État", "Status")}
          value={state}
          onChange={(e) => setState(e.target.value)}
        >
          {[
            ["all", l("Tous les états", "All statuses")],
            ["draft", l("Brouillons", "Drafts")],
            ["published", l("Publiés", "Published")],
            ["existing", l("Site actuel", "Existing site")],
            ["withdrawn", l("Retirés", "Withdrawn")],
            ["trash", l("Corbeille", "Trash")],
          ].map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      {notice && (
        <p className="cms-notice" role="status">
          {notice}
        </p>
      )}
      {actionError && !create && !deletion && (
        <p className="p-error" role="alert">
          {actionError}
        </p>
      )}
      {error && (
        <div role="alert" className="p-error">
          {error}{" "}
          <Button variant="secondary" onClick={reload}>
            {l("Réessayer", "Retry")}
          </Button>
        </div>
      )}
      {loading ? (
        <p role="status">{l("Chargement des contenus…", "Loading content…")}</p>
      ) : (
        <>
          <p className="p-help">
            {filtered.length} {l("document(s)", "document(s)")}
          </p>
          <div className="cms-entry-list">
            {filtered.map((e) => (
              <article key={e.id} className="cms-entry">
                <Link className="cms-entry-main" to={`/admin/contenus/${e.id}`}>
                  <span className="cms-entry-image">
                    {e.document.cover &&
                    (e.document.cover.staticSrc || e.coverMedia) ? (
                      <MediaImage
                        image={e.document.cover}
                        media={e.coverMedia ?? undefined}
                        sizes="160px"
                      />
                    ) : (
                      <ImagePlus size={28} aria-hidden="true" />
                    )}
                  </span>
                  <div>
                    <span className="cms-eyebrow">
                      {e.locale.toUpperCase()} · {kindNames[locale][e.kind]}
                    </span>
                    <h2>{e.document.title || l("Sans titre", "Untitled")}</h2>
                    <p>{e.document.summary}</p>
                    <small>{contentPath(e.kind, e.locale, e.slug)}</small>
                  </div>
                </Link>
                <div className="cms-entry-meta">
                  <span
                    className="cms-status"
                    data-state={e.publication?.status ?? "draft"}
                  >
                    {status(e, l)}
                  </span>
                  <time dateTime={e.updatedAt}>
                    {new Date(e.updatedAt).toLocaleDateString(
                      locale === "fr" ? "fr-FR" : "en-GB",
                    )}
                  </time>
                  <div className="cms-entry-actions">
                    {e.deletedAt ? (
                      <Button
                        variant="secondary"
                        size="small"
                        disabled={busy}
                        onClick={() => void restoreEntry(e)}
                      >
                        <RotateCcw size={15} />
                        {l("Restaurer", "Restore")}
                      </Button>
                    ) : (
                      <>
                        <Link
                          className="p-button"
                          data-variant="secondary"
                          to={`/admin/contenus/${e.id}`}
                        >
                          <Pencil size={15} />
                          {l("Modifier", "Edit")}
                        </Link>
                        <Link
                          className="p-button"
                          data-variant="ghost"
                          to={`/admin/contenus/${e.id}?couverture=1`}
                        >
                          <ImagePlus size={15} />
                          {e.document.cover
                            ? l("Changer l’image", "Change image")
                            : l("Ajouter une image", "Add image")}
                        </Link>
                        <Button
                          variant="danger"
                          size="small"
                          disabled={busy}
                          aria-label={`${l("Supprimer", "Delete")} ${e.document.title || l("Sans titre", "Untitled")}`}
                          onClick={() => {
                            setActionError("");
                            setDeletion(e);
                          }}
                        >
                          <Trash2 size={15} />
                          {l("Supprimer", "Delete")}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!filtered.length && (
            <p>
              {l("Aucun document ne correspond.", "No matching documents.")}
            </p>
          )}
        </>
      )}
      <Dialog
        open={!!deletion}
        onClose={() => !busy && setDeletion(null)}
        title={l("Supprimer ce contenu ?", "Delete this content?")}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => setDeletion(null)}
            >
              {l("Annuler", "Cancel")}
            </Button>
            <Button
              variant="danger"
              busy={busy}
              onClick={async () => {
                if (!deletion) return;
                setBusy(true);
                setActionError("");
                try {
                  await cmsRequest(`/entries/${deletion.id}/trash`, "POST", {
                    version: deletion.version,
                  });
                  setDeletion(null);
                  setNotice(
                    l(
                      "Contenu déplacé dans la corbeille. Il peut être restauré.",
                      "Content moved to trash. It can be restored.",
                    ),
                  );
                  reload();
                } catch (error) {
                  setActionError(cmsError(error, l));
                } finally {
                  setBusy(false);
                }
              }}
            >
              {l("Déplacer dans la corbeille", "Move to trash")}
            </Button>
          </>
        }
      >
        <p>
          <strong>
            {deletion?.document.title || l("Sans titre", "Untitled")}
          </strong>
        </p>
        <p>
          {deletion?.kind === "page"
            ? l(
                "Les modifications seront placées dans la corbeille. La page d’origine restera accessible.",
                "The changes will be moved to trash. The original page remains accessible.",
              )
            : l(
                "Le contenu sera retiré du site et déplacé dans la corbeille. Son texte, ses images et son historique seront conservés pour une restauration.",
                "The content will be removed from the website and moved to trash. Text, images and history are retained for recovery.",
              )}
        </p>
        {actionError && (
          <p className="p-error" role="alert">
            {actionError}
          </p>
        )}
      </Dialog>
      <Dialog
        open={create}
        onClose={() => !busy && setCreate(false)}
        title={l("Nouveau contenu", "New content")}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => setCreate(false)}
            >
              {l("Annuler", "Cancel")}
            </Button>
            <Button
              busy={busy}
              disabled={newKind === "page" && !selectedPage}
              onClick={async () => {
                setBusy(true);
                setActionError("");
                try {
                  const e = await cmsRequest<EditorialEntry>(
                    "/entries",
                    "POST",
                    {
                      kind: newKind,
                      locale: newLocale,
                      ...(newKind === "page" ? { pagePath: selectedPage } : {}),
                    },
                  );
                  navigate(`/admin/contenus/${e.id}`);
                } catch (e) {
                  setActionError(cmsError(e, l));
                } finally {
                  setBusy(false);
                }
              }}
            >
              {l("Créer le brouillon", "Create draft")}
            </Button>
          </>
        }
      >
        <div className="cms-form-grid">
          <label>
            {l("Type", "Type")}
            <select
              aria-label={l("Type", "Type")}
              value={newKind}
              onChange={(e) => setNewKind(e.target.value as ContentKind)}
            >
              {Object.entries(kindNames[locale]).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label>
            {l("Langue du texte", "Text language")}
            <select
              aria-label={l("Langue du texte", "Text language")}
              value={newLocale}
              onChange={(e) => setNewLocale(e.target.value as "fr" | "en")}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>
        {newKind === "page" && (
          <>
            <label>
              {l("Page à modifier", "Page to edit")}
              <select
                aria-label={l("Page à modifier", "Page to edit")}
                value={selectedPage ?? ""}
                onChange={(e) => setPagePath(e.target.value)}
                disabled={!availablePages.length}
              >
                <option value="" disabled>
                  {l("Choisir une page", "Choose a page")}
                </option>
                {availablePages.map((p) => (
                  <option key={p.path} value={p.path}>
                    {p.label} · {p.path}
                  </option>
                ))}
              </select>
            </label>
            <p>
              {l(
                "Le modèle, les animations et les sections existantes sont conservés. Vous pouvez modifier le titre, l’introduction, l’image et ajouter du texte, des figures et des vidéos.",
                "The template, animations and existing sections are preserved. Edit the title, introduction and image, and add text, figures and videos.",
              )}
            </p>
            {templateError && (
              <p role="alert" className="p-error">
                {l(
                  "Les pages n’ont pas pu être chargées.",
                  "Pages could not be loaded.",
                )}{" "}
                <Button onClick={loadTemplates}>
                  {l("Réessayer", "Retry")}
                </Button>
              </p>
            )}
          </>
        )}
        <p>
          {l(
            "Chaque langue est rédigée et validée séparément. Vous pourrez lier une traduction depuis l’éditeur.",
            "Each language is written and reviewed separately. You can link a translation from the editor.",
          )}
        </p>
        {actionError && (
          <p className="p-error" role="alert">
            {actionError}
          </p>
        )}
      </Dialog>
    </div>
  );
}
export function ContentEditorPage() {
  const { id } = useParams();
  const l = useWords();
  const [entry, setEntry] = useState<EditorialEntry | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    setEntry(null);
    setError("");
    let current = true;
    void cms
      .get(id!)
      .then((value) => {
        if (current) setEntry(value);
      })
      .catch((e) => {
        if (current) setError(cmsError(e, l));
      });
    return () => {
      current = false;
    };
  }, [id]);
  if (error)
    return (
      <div className="cms-admin">
        <p role="alert" className="p-error">
          {error}
        </p>
        <Button onClick={() => window.location.reload()}>
          {l("Réessayer", "Retry")}
        </Button>
      </div>
    );
  if (!entry)
    return (
      <p role="status">{l("Chargement du document…", "Loading document…")}</p>
    );
  if (entry.deletedAt)
    return <TrashedContent entry={entry} onRestored={setEntry} />;
  return <DocumentEditor key={entry.id} initial={entry} />;
}
function TrashedContent({
  entry,
  onRestored,
}: {
  entry: EditorialEntry;
  onRestored: (entry: EditorialEntry) => void;
}) {
  const l = useWords();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <div className="cms-admin">
      <Link to="/admin/contenus">
        ← {l("Tous les contenus", "All content")}
      </Link>
      <h1>
        {entry.document.title || l("Contenu supprimé", "Deleted content")}
      </h1>
      <p>
        {l(
          "Ce contenu est dans la corbeille. Restaurez-le pour reprendre la rédaction. La restauration ne le remet pas en ligne.",
          "This content is in trash. Restore it to resume editing. Restoring does not publish it.",
        )}
      </p>
      <Button
        busy={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            onRestored(
              await cmsRequest<EditorialEntry>(
                `/entries/${entry.id}/untrash`,
                "POST",
                { version: entry.version },
              ),
            );
          } catch (error) {
            setError(cmsError(error, l));
          } finally {
            setBusy(false);
          }
        }}
      >
        <RotateCcw size={16} />
        {l("Restaurer le brouillon", "Restore draft")}
      </Button>
      {error && (
        <p role="alert" className="p-error">
          {error}
        </p>
      )}
    </div>
  );
}
function DocumentEditor({ initial }: { initial: EditorialEntry }) {
  const l = useWords(),
    { locale } = useI18n(),
    navigate = useNavigate(),
    [params] = useSearchParams();
  const [entry, setEntry] = useState(initial),
    [doc, setDoc] = useState(initial.document),
    [slug, setSlug] = useState(initial.slug),
    [media, setMedia] = useState<EditorialMedia[]>([]),
    [mediaError, setMediaError] = useState(false),
    [editorReady, setEditorReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [issues, setIssues] = useState<string[]>([]),
    [preview, setPreview] = useState(false),
    [history, setHistory] = useState<EditorialRevision[] | null>(null),
    [withdraw, setWithdraw] = useState(false),
    [deleting, setDeleting] = useState(false),
    [picker, setPicker] = useState<"cover" | "figure" | "video" | null>(
      params.get("couverture") === "1" ? "cover" : null,
    ),
    [videoOpen, setVideoOpen] = useState(false),
    [videoUrl, setVideoUrl] = useState(""),
    [videoFile, setVideoFile] = useState<EditorialMedia | null>(null),
    [videoTitle, setVideoTitle] = useState("");
  const editor = useRef<RichHandle | null>(null),
    backupKey = `ldgenx-editorial-${entry.id}`;
  const [recovery, setRecovery] = useState<{
    document: EditorialDocument;
    slug: string;
  } | null>(() => {
    try {
      return readWritingRecovery(
        localStorage.getItem(backupKey),
        initial.document,
        initial.slug,
      );
    } catch {
      return null;
    }
  });
  const dirty =
    JSON.stringify(doc) !== JSON.stringify(entry.document) ||
    slug !== entry.slug;
  const mediaRequest = useRef(0),
    mediaCheckedAt = useRef(0);
  const loadMedia = async () => {
    mediaCheckedAt.current = Date.now();
    const request = ++mediaRequest.current;
    try {
      const value = await cms.media();
      if (request === mediaRequest.current) {
        const ids = new Set(value.map((item) => item.id));
        setMedia((current) => [
          ...value,
          ...current.filter((item) => !ids.has(item.id)),
        ]);
        setMediaError(false);
      }
    } catch {
      if (request === mediaRequest.current) setMediaError(true);
    }
  };
  useEffect(() => {
    const refresh = () => {
      if (
        document.visibilityState === "visible" &&
        Date.now() - mediaCheckedAt.current >= 30 * 60 * 1000
      )
        void loadMedia();
    };
    refresh();
    // Private image links last one hour. Renew during long writing sessions and on return.
    const timer = window.setInterval(refresh, 30 * 60 * 1000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      mediaRequest.current++;
    };
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (dirty)
          localStorage.setItem(
            backupKey,
            JSON.stringify({ document: doc, slug, version: entry.version }),
          );
        else if (!recovery) localStorage.removeItem(backupKey);
      } catch {
        /* Draft export remains available if local storage is full. */
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [doc, slug, dirty, backupKey, recovery, entry.version]);
  useEffect(() => {
    if (!dirty) return;
    const unload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    const click = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (
        a &&
        !a.target &&
        !a.hasAttribute("download") &&
        a.getAttribute("href") &&
        !a.getAttribute("href")!.startsWith("#") &&
        !window.confirm(
          l(
            "Quitter avec des modifications non enregistrées ? Une copie locale de secours est conservée dans ce navigateur.",
            "Leave with unsaved changes? A local recovery copy is kept in this browser.",
          ),
        )
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", click, true);
    };
  }, [dirty, locale]);
  const change = (key: keyof EditorialDocument, value: unknown) => {
    setDoc((old) => ({
      ...old,
      [key]: value,
      reviewed: key === "reviewed" ? value === true : false,
    }));
    setNotice("");
    setIssues([]);
  };
  const apply = (next: EditorialEntry) => {
    setEntry(next);
    setDoc(next.document);
    setSlug(next.slug);
    editor.current?.set(next.document.body);
    try {
      localStorage.removeItem(backupKey);
    } catch {
      /* Storage may be disabled. */
    }
    setRecovery(null);
    window.dispatchEvent(new Event("cms-media-changed"));
  };
  const save = async () => {
    const checked = validateDocument(doc);
    const result = await cmsRequest<EditorialEntry>(
      `/entries/${entry.id}`,
      "PATCH",
      {
        version: entry.version,
        document: checked,
        slug: slug.startsWith("document-") ? undefined : slug,
        checkpoint: true,
      },
    );
    apply(result);
    return result;
  };
  const action = async (run: () => Promise<void>) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await run();
    } catch (e) {
      setError(cmsError(e, l));
      if (
        e &&
        typeof e === "object" &&
        "details" in e &&
        Array.isArray(e.details)
      )
        setIssues(e.details);
    } finally {
      setBusy(false);
    }
  };
  const persistDraft = () =>
    action(async () => {
      await save();
      setNotice(
        l(
          "Brouillon enregistré. Le site public reste sur sa dernière version publiée.",
          "Draft saved. The public site keeps its last published version.",
        ),
      );
    });
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey &&
        !event.isComposing &&
        !event.defaultPrevented &&
        event.key.toLowerCase() === "s"
      ) {
        event.preventDefault();
        if (!busy && dirty && !event.repeat) void persistDraft();
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [doc, slug, entry.version, dirty, busy, locale]);
  const exportDraft = () => {
    const blob = new Blob(
        [
          JSON.stringify(
            { kind: entry.kind, locale: entry.locale, slug, document: doc },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `ldgenx-${slug}-brouillon.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const choose = (m: EditorialMedia) => {
    setMedia((old) => [m, ...old.filter((a) => a.id !== m.id)]);
    if (picker === "cover")
      change("cover", {
        mediaId: m.id,
        alt: "",
        caption: "",
        credit: "",
        licenceUrl: "",
      });
    if (picker === "figure")
      editor.current?.insert({
        type: "figure",
        attrs: {
          mediaId: m.id,
          alt: "",
          caption: "",
          credit: "",
          licenceUrl: "",
        },
      });
    if (picker === "video") {
      setVideoFile(m);
      setVideoUrl("");
      setVideoOpen(true);
    }
    setPicker(null);
  };
  const publishIssues = publicationIssues(doc, entry.kind);
  const path = contentPath(entry.kind, entry.locale, slug),
    words = documentText(doc.body).trim().split(/\s+/).filter(Boolean).length;
  const previewContent: PublishedDocument = {
    id: entry.id,
    kind: entry.kind,
    locale: entry.locale,
    slug,
    groupId: entry.groupId,
    legacyId: entry.legacyId,
    path,
    status: "published",
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: doc.title,
    summary: doc.summary,
    category: doc.category,
    author: doc.author,
    cover: doc.cover,
    seoTitle: doc.seoTitle,
    seoDescription: doc.seoDescription,
    document: doc,
    media,
  };
  return (
    <div className="cms-admin cms-editor-page">
      <header className="cms-page-head">
        <div>
          <Link className="p-link" to="/admin/contenus">
            <ArrowLeft size={15} />
            {l("Tous les contenus", "All content")}
          </Link>
          <p className="cms-eyebrow">
            {kindNames[locale][entry.kind]} · {entry.locale.toUpperCase()}
          </p>
          <h1>{l("Éditer le document", "Edit document")}</h1>
          <span
            className="cms-status"
            data-state={dirty ? "draft" : entry.publication?.status}
          >
            {dirty
              ? l("Modifications non enregistrées", "Unsaved changes")
              : status(entry, l)}
          </span>
        </div>
        <div className="cms-actions">
          <Button
            variant="secondary"
            disabled={busy}
            onClick={exportDraft}
            title={l("Exporter une copie JSON", "Export a JSON copy")}
          >
            <Download size={17} />
            {l("Exporter", "Export")}
          </Button>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => setPreview(true)}
          >
            <Eye size={17} />
            {l("Aperçu", "Preview")}
          </Button>
          <Button busy={busy} onClick={() => void persistDraft()}>
            <Save size={17} />
            {l("Enregistrer", "Save draft")}
          </Button>
        </div>
      </header>
      <div
        className="cms-editor-dock"
        aria-label={l("Navigation et enregistrement", "Navigation and saving")}
      >
        <nav aria-label={l("Sections du document", "Document sections")}>
          <a href="#cms-writing">{l("Rédaction", "Writing")}</a>
          <a href="#cms-sources">{l("Sources", "Sources")}</a>
          <a href="#cms-publishing">{l("Publication", "Publishing")}</a>
        </nav>
        <span className="cms-save-state">
          {words} {words === 1 ? l("mot", "word") : l("mots", "words")}
          {words > 0 && (
            <>
              {" "}
              · {l("lecture", "reading")} ≈{" "}
              {Math.max(1, Math.ceil(words / 200))} min
            </>
          )}
          <small>
            {dirty
              ? l(
                  "À enregistrer · copie locale de secours",
                  "Unsaved · local recovery copy",
                )
              : `${l("Enregistré", "Saved")} ${new Date(entry.updatedAt).toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" })} · Paris`}
          </small>
        </span>
        <Button
          size="small"
          disabled={!dirty || busy}
          busy={busy}
          onClick={() => void persistDraft()}
          title={l(
            "Enregistrer le brouillon · ⌘/Ctrl+S",
            "Save draft · ⌘/Ctrl+S",
          )}
          aria-label={l(
            "Enregistrer le brouillon · ⌘/Ctrl+S",
            "Save draft · ⌘/Ctrl+S",
          )}
        >
          <Save size={15} />
          {l("Enregistrer", "Save draft")}
        </Button>
      </div>
      {recovery && (
        <div className="cms-notice">
          <p>
            {l(
              "Une copie locale non enregistrée a été retrouvée. Récupérez-la pour la comparer au document enregistré.",
              "An unsaved local copy was found. Recover it to compare it with the saved document.",
            )}
          </p>
          <Button
            variant="secondary"
            disabled={busy || !editorReady}
            onClick={() => {
              setDoc(recovery.document);
              setSlug(recovery.slug);
              editor.current?.set(recovery.document.body);
              setRecovery(null);
            }}
          >
            {l("Récupérer la copie", "Recover copy")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              localStorage.removeItem(backupKey);
              setRecovery(null);
            }}
          >
            {l("Ignorer", "Dismiss")}
          </Button>
        </div>
      )}
      {error && (
        <p className="p-error cms-notice" role="alert">
          {error}
        </p>
      )}
      {mediaError && (
        <div className="cms-notice" role="alert">
          <p>
            {l(
              "Les médias n’ont pas pu être chargés. Réessayez avant de contrôler les figures et l’aperçu.",
              "Media could not be loaded. Retry before checking figures and preview.",
            )}
          </p>
          <Button
            variant="secondary"
            size="small"
            onClick={() => void loadMedia()}
          >
            {l("Recharger les médias", "Reload media")}
          </Button>
        </div>
      )}
      {notice && (
        <p className="cms-notice" role="status">
          {notice}
        </p>
      )}
      {issues.length > 0 && (
        <div role="alert" className="cms-issues">
          <strong>
            {l("À compléter avant publication", "Required before publication")}
          </strong>
          <ul>
            {issues.map((key) => (
              <li key={key}>
                {issueLabels[key] ? l(...issueLabels[key]) : key}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="cms-editor-layout">
        <div className="cms-editor-main" id="cms-writing">
          {entry.kind === "page" && (
            <p className="cms-notice">
              {l(
                "Vous modifiez une page existante. Son modèle et ses sections restent en place. Les blocs rédigés ci-dessous s’ajoutent après son introduction.",
                "You are editing an existing page. Its template and sections remain in place. Blocks written below appear after its introduction.",
              )}
            </p>
          )}
          <fieldset
            disabled={busy}
            className="cms-panel cms-cover-panel"
            id="cms-cover"
          >
            <div className="cms-section-head">
              <h2>{l("Image de couverture", "Cover image")}</h2>
              <Button
                variant="secondary"
                size="small"
                onClick={() => setPicker("cover")}
              >
                <ImagePlus size={16} />
                {doc.cover
                  ? l("Changer l’image", "Change image")
                  : l("Ajouter une image", "Add image")}
              </Button>
            </div>
            {doc.cover ? (
              <>
                <MediaImage
                  image={doc.cover}
                  media={media.find((m) => m.id === doc.cover?.mediaId)}
                />
                <ImageFields
                  image={doc.cover}
                  onChange={(value: ContentImage) => change("cover", value)}
                />
                <Button variant="ghost" onClick={() => change("cover", null)}>
                  {l("Retirer la couverture", "Remove cover")}
                </Button>
              </>
            ) : (
              <button
                type="button"
                className="cms-cover-add"
                onClick={() => setPicker("cover")}
              >
                <ImagePlus size={30} />
                <strong>
                  {l("Ajouter une image de couverture", "Add a cover image")}
                </strong>
                <span>
                  {l(
                    "Importer une photo ou choisir dans la médiathèque. Elle apparaîtra sur la page et sa carte.",
                    "Upload a photo or choose from the media library. It will appear on the page and its card.",
                  )}
                </span>
              </button>
            )}
          </fieldset>
          <fieldset disabled={busy}>
            <label>
              {l("Titre", "Title")}
              <textarea
                aria-label={l("Titre", "Title")}
                className="p-input cms-title-input"
                maxLength={260}
                rows={2}
                value={doc.title}
                onChange={(e) => change("title", e.target.value)}
              />
              <small>
                {l(
                  "Pour un nom latin dans le titre, entourez-le d’astérisques : *Dicentrarchus labrax*.",
                  "For a Latin name in the title, surround it with asterisks: *Dicentrarchus labrax*.",
                )}
              </small>
            </label>
            <label>
              {l("Résumé / introduction", "Summary / introduction")}
              <textarea
                className="p-input"
                aria-label={l(
                  "Résumé / introduction",
                  "Summary / introduction",
                )}
                maxLength={600}
                rows={3}
                value={doc.summary}
                onChange={(e) => change("summary", e.target.value)}
              />
              <small>{doc.summary.length}/600</small>
            </label>
            <div className="cms-form-grid">
              <label>
                {l("Catégorie / thème", "Category / topic")}
                <input
                  className="p-input"
                  maxLength={100}
                  value={doc.category}
                  onChange={(e) => change("category", e.target.value)}
                />
              </label>
              <label>
                {entry.kind === "publication"
                  ? l("Auteurs de l’article", "Paper authors")
                  : l("Auteur(s) / équipe", "Author(s) / team")}
                <input
                  className="p-input"
                  maxLength={1000}
                  value={doc.author}
                  onChange={(e) => change("author", e.target.value)}
                />
              </label>
            </div>
            {entry.kind === "publication" && (
              <section className="cms-panel">
                <h2>
                  {l("Référence de la publication", "Publication reference")}
                </h2>
                <div className="cms-form-grid">
                  <label>
                    DOI
                    <input
                      className="p-input"
                      value={doc.doi}
                      maxLength={300}
                      placeholder="10.xxxx/…"
                      onChange={(e) => change("doi", e.target.value)}
                    />
                  </label>
                  <label>
                    {l("Revue", "Journal")}
                    <input
                      className="p-input"
                      value={doc.journal}
                      maxLength={240}
                      onChange={(e) => change("journal", e.target.value)}
                    />
                  </label>
                  <label>
                    {l("Année de publication", "Publication year")}
                    <input
                      className="p-input"
                      value={doc.year}
                      maxLength={4}
                      inputMode="numeric"
                      onChange={(e) => change("year", e.target.value)}
                    />
                  </label>
                </div>
              </section>
            )}
          </fieldset>
          <div className="cms-section-head">
            <h2>
              {entry.kind === "page"
                ? l(
                    "Contenu complémentaire de la page",
                    "Additional page content",
                  )
                : l("Texte & figures", "Body & figures")}
            </h2>
            <span>
              {words} {words === 1 ? l("mot", "word") : l("mots", "words")}
            </span>
          </div>
          {canStartStructure(doc.body) && !entry.legacyId && (
            <div className="cms-writing-start">
              <div>
                <strong>
                  {l(
                    "Une trame pour structurer votre texte",
                    "A structure for your writing",
                  )}
                </strong>
                <p>{outlineLabels(entry.kind, entry.locale).join(" · ")}</p>
                <small>
                  {l(
                    "Seuls les titres sont ajoutés. Rédigez les résultats, les limites et les références à partir de vos sources.",
                    "Only section headings are added. Write results, limitations and references from your sources.",
                  )}
                </small>
              </div>
              <Button
                variant="secondary"
                disabled={busy || !editorReady}
                onClick={() => {
                  const body = scientificOutline(entry.kind, entry.locale);
                  change("body", body);
                  editor.current?.set(body);
                }}
              >
                <Plus size={16} />
                {l("Utiliser cette trame", "Use this structure")}
              </Button>
            </div>
          )}
          <RichEditor
            body={initial.document.body}
            onChange={(body) => change("body", body)}
            media={media}
            disabled={busy}
            onImage={() => setPicker("figure")}
            onVideo={() => {
              setVideoUrl("");
              setVideoFile(null);
              setVideoTitle("");
              setVideoOpen(true);
            }}
            handle={editor}
            onReady={setEditorReady}
          />
          <fieldset disabled={busy} className="cms-panel" id="cms-sources">
            <div className="cms-section-head">
              <h2>{l("Sources & références", "Sources & references")}</h2>
              <Button
                variant="secondary"
                size="small"
                disabled={doc.references.length >= 50}
                onClick={() =>
                  change("references", [
                    ...doc.references,
                    { label: "", url: "" },
                  ])
                }
              >
                <Plus size={15} />
                {l("Ajouter", "Add")}
              </Button>
            </div>
            <p className="p-help">
              {l(
                "Citez les travaux, rapports ou jeux de données utilisés. Distinguez résultats, interprétation et limites dans le texte.",
                "Cite the papers, reports or datasets used. Distinguish results, interpretation and limitations in the text.",
              )}
            </p>
            {doc.references.map((r, i) => (
              <div className="cms-reference-row" key={i}>
                <label>
                  {l("Référence", "Reference")} {i + 1}
                  <input
                    className="p-input"
                    value={r.label}
                    maxLength={1000}
                    onChange={(e) =>
                      change(
                        "references",
                        doc.references.map((x, n) =>
                          n === i ? { ...x, label: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  {l("Lien HTTPS (facultatif)", "HTTPS link (optional)")}
                  <input
                    className="p-input"
                    type="url"
                    value={r.url}
                    maxLength={2000}
                    onChange={(e) =>
                      change(
                        "references",
                        doc.references.map((x, n) =>
                          n === i ? { ...x, url: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </label>
                <Button
                  variant="ghost"
                  onClick={() =>
                    change(
                      "references",
                      doc.references.filter((_, n) => n !== i),
                    )
                  }
                >
                  {l("Retirer", "Remove")}
                </Button>
              </div>
            ))}
          </fieldset>
        </div>
        <aside className="cms-editor-aside">
          <fieldset disabled={busy} className="cms-panel" id="cms-publishing">
            <h2>{l("Publication", "Publishing")}</h2>
            <p className="p-help">
              {l(
                "Les enregistrements et restaurations modifient le brouillon uniquement. « Publier » diffuse explicitement cette version.",
                "Saving and restoring affect the draft only. “Publish” explicitly releases this version.",
              )}
            </p>
            <details
              className="cms-preflight"
              open={publishIssues.length > 0 || undefined}
            >
              <summary>
                {publishIssues.length
                  ? `${publishIssues.length} ${l(publishIssues.length === 1 ? "élément à compléter" : "éléments à compléter", publishIssues.length === 1 ? "item to complete" : "items to complete")}`
                  : l(
                      "Éléments obligatoires complétés",
                      "Required items complete",
                    )}
              </summary>
              {publishIssues.length > 0 ? (
                <ul>
                  {publishIssues.map((key) => (
                    <li key={key}>
                      {issueLabels[key] ? l(...issueLabels[key]) : key}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-help">
                  {l(
                    "La validation scientifique reste sous votre responsabilité. Vérifiez l’aperçu avant de publier.",
                    "Scientific validation remains your responsibility. Check the preview before publishing.",
                  )}
                </p>
              )}
            </details>
            <label className="cms-review">
              <input
                type="checkbox"
                checked={doc.reviewed}
                onChange={(e) => change("reviewed", e.target.checked)}
              />
              <span>
                {l(
                  "J’ai relu les informations scientifiques, les sources, les limites et les droits de diffusion des textes et médias.",
                  "I have reviewed the science, references, limitations and publishing rights for the text and media.",
                )}
              </span>
            </label>
            <Button
              className="cms-publish"
              busy={busy}
              onClick={() => {
                if (publishIssues.length) {
                  setIssues(publishIssues);
                  return;
                }
                void action(async () => {
                  const saved = await save();
                  const result = await cmsRequest<EditorialEntry>(
                    `/entries/${entry.id}/publish`,
                    "POST",
                    { version: saved.version },
                  );
                  apply(result);
                  setNotice(
                    l(
                      "Contenu publié. La mise à jour du site peut prendre jusqu’à 30 secondes.",
                      "Content published. The website may take up to 30 seconds to update.",
                    ),
                  );
                });
              }}
            >
              <Send size={16} />
              {entry.publication?.status === "published"
                ? l("Publier les modifications", "Publish changes")
                : l("Publier", "Publish")}
            </Button>
            {(entry.legacyId || entry.publication?.status === "published") && (
              <>
                <a
                  className="p-link"
                  href={contentPath(entry.kind, entry.locale, entry.slug)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {l("Voir la page publique", "View public page")}{" "}
                  <ExternalLink size={14} />
                </a>
                <Button
                  variant="ghost"
                  disabled={entry.publication?.status === "withdrawn"}
                  onClick={() => setWithdraw(true)}
                >
                  {entry.kind === "page"
                    ? l("Retirer les modifications", "Withdraw page changes")
                    : l("Retirer du site", "Withdraw from site")}
                </Button>
              </>
            )}
            <hr />
            <Button
              variant="secondary"
              onClick={() =>
                action(async () => {
                  if (dirty) await save();
                  setHistory(await cms.revisions(entry.id));
                })
              }
            >
              <History size={16} />
              {l("Historique", "History")}
            </Button>
            <p className="p-help">
              {l(
                "10 versions au maximum. Restaurer une version ne la publie pas.",
                "Up to 10 revisions. Restoring a version does not publish it.",
              )}
            </p>
            <Button
              variant="ghost"
              onClick={() =>
                action(async () => {
                  if (dirty) await save();
                  const all = await cms.list(),
                    other = all.find(
                      (e) =>
                        e.groupId === entry.groupId &&
                        e.locale !== entry.locale,
                    );
                  const next =
                    other ??
                    (await cmsRequest<EditorialEntry>("/entries", "POST", {
                      kind: entry.kind,
                      locale: entry.locale === "fr" ? "en" : "fr",
                      translationOf: entry.id,
                    }));
                  navigate(`/admin/contenus/${next.id}`);
                })
              }
            >
              {l("Version", "Version")} {entry.locale === "fr" ? "EN" : "FR"} →
            </Button>
            <Button variant="danger" onClick={() => setDeleting(true)}>
              <Trash2 size={16} />
              {entry.kind === "page"
                ? l("Supprimer les modifications", "Delete page changes")
                : l("Supprimer le contenu", "Delete content")}
            </Button>
          </fieldset>
          <fieldset disabled={busy} className="cms-panel">
            <h2>{l("Adresse & référencement", "Address & search engines")}</h2>
            <label>
              {l("Adresse courte", "URL slug")}
              <input
                className="p-input"
                aria-label={l("Adresse courte", "URL slug")}
                value={slug}
                maxLength={100}
                disabled={!!entry.legacyId || !!entry.publishedVersion}
                onChange={(e) => setSlug(e.target.value)}
              />
              <small>
                {l(
                  "Stable après la première publication. Pour un nouveau document, le titre sert d’adresse par défaut.",
                  "Fixed after first publication. For a new document, the title is used by default.",
                )}
              </small>
            </label>
            <p className="cms-path">{path}</p>
            <label>
              {l(
                "Titre pour les moteurs (facultatif)",
                "Search title (optional)",
              )}
              <input
                className="p-input"
                aria-label={l(
                  "Titre pour les moteurs (facultatif)",
                  "Search title (optional)",
                )}
                value={doc.seoTitle}
                maxLength={100}
                onChange={(e) => change("seoTitle", e.target.value)}
              />
              <small>{doc.seoTitle.length}/100</small>
            </label>
            <label>
              {l(
                "Description pour les moteurs (facultative)",
                "Search description (optional)",
              )}
              <textarea
                className="p-input"
                aria-label={l(
                  "Description pour les moteurs (facultative)",
                  "Search description (optional)",
                )}
                value={doc.seoDescription}
                rows={3}
                maxLength={220}
                onChange={(e) => change("seoDescription", e.target.value)}
              />
              <small>{doc.seoDescription.length}/220</small>
            </label>
            <p className="p-help">
              {l(
                "Sans saisie, le titre et le résumé sont utilisés. La page, les listes, le pied de page et les sitemaps sont mis à jour ensemble.",
                "If left empty, the title and summary are used. The page, listings, footer and sitemaps update together.",
              )}
            </p>
          </fieldset>
        </aside>
      </div>
      <Dialog
        wide
        open={!!picker}
        title={
          picker === "video"
            ? l("Choisir une vidéo", "Choose video")
            : l("Choisir une image", "Choose image")
        }
        onClose={() => setPicker(null)}
      >
        <MediaLibrary
          key={picker}
          kind={picker === "video" ? "video" : "image"}
          pick={choose}
        />
      </Dialog>
      <Dialog
        wide
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        title={l("Ajouter une vidéo", "Add video")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setVideoOpen(false)}>
              {l("Annuler", "Cancel")}
            </Button>
            <Button
              onClick={() => {
                try {
                  if (!videoTitle.trim()) throw new Error();
                  const attrs = videoFile
                    ? {
                        mediaId: videoFile.id,
                        title: videoTitle,
                        caption: "",
                        transcript: "",
                      }
                    : {
                        url: videoEmbed(videoUrl).url,
                        title: videoTitle,
                        caption: "",
                        transcript: "",
                      };
                  editor.current?.insert({ type: "video", attrs });
                  setVideoOpen(false);
                  setError("");
                } catch {
                  setError(
                    l(
                      "Ajoutez un titre et un lien YouTube/Vimeo valide, ou choisissez un fichier vidéo.",
                      "Add a title and valid YouTube/Vimeo link, or choose a video file.",
                    ),
                  );
                }
              }}
            >
              {l("Insérer", "Insert")}
            </Button>
          </>
        }
      >
        <label>
          {l("Titre de la vidéo", "Video title")}
          <input
            className="p-input"
            value={videoTitle}
            maxLength={300}
            onChange={(e) => setVideoTitle(e.target.value)}
          />
        </label>
        <label>
          {l("Lien YouTube ou Vimeo", "YouTube or Vimeo link")}
          <input
            className="p-input"
            type="url"
            value={videoUrl}
            disabled={!!videoFile}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </label>
        <p className="p-help">
          {l(
            "Le lecteur externe est chargé uniquement après un clic du visiteur.",
            "The external player only loads after the visitor clicks.",
          )}
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            setVideoOpen(false);
            setPicker("video");
          }}
        >
          {l(
            "Choisir / importer une courte vidéo",
            "Choose / upload a short video",
          )}
        </Button>
        {videoFile && (
          <p>
            {videoFile.name}{" "}
            <Button variant="ghost" onClick={() => setVideoFile(null)}>
              {l("Retirer", "Remove")}
            </Button>
          </p>
        )}
        {error && (
          <p role="alert" className="p-error">
            {error}
          </p>
        )}
      </Dialog>
      <Dialog
        wide
        open={preview}
        onClose={() => setPreview(false)}
        title={l("Aperçu du brouillon · privé", "Draft preview · private")}
      >
        <DraftPreview content={previewContent} />
      </Dialog>
      <Dialog
        wide
        open={history !== null}
        onClose={() => setHistory(null)}
        title={l("Historique du document", "Document history")}
      >
        {history?.length ? (
          history.map((r) => (
            <div key={r.id} className="cms-revision">
              <div>
                <strong>
                  {new Date(r.createdAt).toLocaleString(
                    locale === "fr" ? "fr-FR" : "en-GB",
                  )}
                </strong>
                <p>
                  {r.author} · {l("Version", "Version")} {r.version} ·{" "}
                  {r.reason}
                </p>
                <p>{r.document?.title}</p>
              </div>
              <Button
                disabled={busy}
                variant="secondary"
                onClick={() =>
                  action(async () => {
                    const next = await cmsRequest<EditorialEntry>(
                      `/entries/${entry.id}/restore`,
                      "POST",
                      { version: entry.version, revision: r.id },
                    );
                    apply(next);
                    setHistory(null);
                    setNotice(
                      l(
                        "Version restaurée en brouillon. Relisez-la avant de publier.",
                        "Revision restored as a draft. Review it before publishing.",
                      ),
                    );
                  })
                }
              >
                {l("Restaurer en brouillon", "Restore as draft")}
              </Button>
            </div>
          ))
        ) : (
          <p>
            {l(
              "Aucune version antérieure. Enregistrez pour créer un point de restauration.",
              "No previous versions. Save to create a restoration point.",
            )}
          </p>
        )}
      </Dialog>
      <Dialog
        open={withdraw}
        onClose={() => !busy && setWithdraw(false)}
        title={l("Retirer ce contenu du site ?", "Withdraw this content?")}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => setWithdraw(false)}
            >
              {l("Annuler", "Cancel")}
            </Button>
            <Button
              variant="danger"
              busy={busy}
              onClick={() =>
                action(async () => {
                  const saved = dirty ? await save() : entry;
                  const next = await cmsRequest<EditorialEntry>(
                    `/entries/${entry.id}/withdraw`,
                    "POST",
                    { version: saved.version },
                  );
                  apply(next);
                  setWithdraw(false);
                  setNotice(
                    l(
                      "Contenu retiré du site. Le brouillon est conservé.",
                      "Content withdrawn. The draft is retained.",
                    ),
                  );
                })
              }
            >
              {l("Retirer du site", "Withdraw")}
            </Button>
          </>
        }
      >
        <p>
          {entry.kind === "page"
            ? l(
                "Les modifications publiées seront retirées. La page retrouvera sa présentation d’origine ; votre brouillon restera disponible.",
                "Published changes will be withdrawn. The page returns to its original presentation; your draft remains available.",
              )
            : l(
                "La page publique affichera « contenu retiré » et disparaîtra des listes, du pied de page et des sitemaps. Le brouillon et son historique restent disponibles.",
                "The public page will show “content withdrawn” and disappear from listings, the footer and sitemaps. The draft and history remain available.",
              )}
        </p>
      </Dialog>
      <Dialog
        open={deleting}
        onClose={() => !busy && setDeleting(false)}
        title={l("Supprimer ce contenu ?", "Delete this content?")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(false)}>
              {l("Annuler", "Cancel")}
            </Button>
            <Button
              variant="danger"
              busy={busy}
              onClick={() =>
                action(async () => {
                  const saved = dirty ? await save() : entry;
                  await cmsRequest(`/entries/${entry.id}/trash`, "POST", {
                    version: saved.version,
                  });
                  localStorage.removeItem(backupKey);
                  setDoc(entry.document);
                  setSlug(entry.slug);
                  navigate("/admin/contenus");
                })
              }
            >
              {l("Supprimer", "Delete")}
            </Button>
          </>
        }
      >
        <p>
          {entry.kind === "page"
            ? l(
                "Les modifications seront retirées et conservées dans la corbeille. La page d’origine restera accessible.",
                "The changes will be withdrawn and retained in trash. The original page remains accessible.",
              )
            : l(
                "Le contenu sera retiré du site et placé dans la corbeille. Son brouillon, ses images et son historique pourront être restaurés.",
                "The content will be removed from the website and moved to trash. Its draft, images and history can be restored.",
              )}
        </p>
      </Dialog>
    </div>
  );
}
function DraftPreview({ content }: { content: PublishedDocument }) {
  const l = useWords(),
    [ready, setReady] = useState(false);
  useEffect(() => {
    void loadCatalog(content.locale).then(() => setReady(true));
  }, [content.locale]);
  if (!ready) return <p>{l("Chargement de l’aperçu…", "Loading preview…")}</p>;
  return (
    <div className="cms-preview">
      <LocaleProvider locale={content.locale}>
        {["page", "service", "application"].includes(content.kind) ? (
          <Suspense
            fallback={<p>{l("Chargement de la page…", "Loading page…")}</p>}
          >
            <SitePagePreview content={content} />
          </Suspense>
        ) : (
          <EditorialDocumentView content={content} preview />
        )}
      </LocaleProvider>
    </div>
  );
}
