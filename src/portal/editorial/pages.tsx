import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
} from "lucide-react";
import { Button, Dialog } from "../ui";
import { useI18n } from "../i18n";
import { cms, cmsRequest } from "./api";
import { cmsError, kindNames, useWords } from "./labels";
import { MediaLibrary } from "./MediaLibrary";
import { ImageFields, RichEditor, type RichHandle } from "./RichEditor";
import { MediaImage } from "../../editorial/media-view";
import { catalogItems, legacyDocument } from "../../editorial/legacy";
import { LocaleProvider } from "../../i18n";
import { loadCatalog, type Catalog } from "../../content/catalog";
import {
  contentPath,
  documentText,
  publicationIssues,
  summarize,
  validateDocument,
  videoEmbed,
  type ContentImage,
  type EditorialDocument,
  type EditorialEntry,
  type EditorialMedia,
  type EditorialRevision,
  type PublishedDocument,
} from "../../../supabase/functions/_shared/editorial";
import "../../editorial/editorial.css";
import "./admin.css";
import { entryState, issueText, stateWords } from "./ContentHub";
import { sectionOfKind } from "./sections";
import { fieldOptions, TemplateFields, tidyFields } from "./TemplateFields";
import { FieldsDisabled } from "./fields-context";
import {
  scientificOutline,
  outlineLabels,
  canStartStructure,
  readWritingRecovery,
} from "./writing";
const SitePagePreview = lazy(() => import("./PagePreview"));

export function ContentEditorPage() {
  const { id } = useParams();
  const l = useWords();
  const [entry, setEntry] = useState<EditorialEntry | null>(null),
    [catalog, setCatalog] = useState<Catalog | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    setEntry(null);
    setError("");
    let current = true;
    void (async () => {
      const value = await cms.get(id!);
      const content = await loadCatalog(value.locale);
      // A built-in item opens on what the site shows until it has saved fields of its own.
      const original =
        value.legacyId &&
        value.kind !== "page" &&
        !Object.keys(value.document.fields ?? {}).length
          ? legacyDocument(value.kind, value.legacyId, content)
          : null;
      if (!current) return;
      setCatalog(content);
      setEntry(
        original
          ? { ...value, document: { ...original, reviewed: false } }
          : {
              ...value,
              document: { ...value.document, fields: value.document.fields ?? {} },
            },
      );
    })().catch((e) => {
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
  if (!entry || !catalog)
    return (
      <p role="status">{l("Chargement du document…", "Loading document…")}</p>
    );
  if (entry.deletedAt)
    return <TrashedContent entry={entry} onRestored={setEntry} />;
  return <DocumentEditor key={entry.id} initial={entry} catalog={catalog} />;
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
      <Link to="/admin/contenus/corbeille">← {l("Corbeille", "Trash")}</Link>
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
function DocumentEditor({
  initial,
  catalog,
}: {
  initial: EditorialEntry;
  catalog: Catalog;
}) {
  const l = useWords(),
    { locale } = useI18n(),
    navigate = useNavigate();
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
    [picker, setPicker] = useState<
      "cover" | "figure" | "video" | "field" | null
    >(null),
    [videoOpen, setVideoOpen] = useState(false),
    [videoUrl, setVideoUrl] = useState(""),
    [videoFile, setVideoFile] = useState<EditorialMedia | null>(null),
    [videoTitle, setVideoTitle] = useState("");
  const editor = useRef<RichHandle | null>(null),
    pictureTarget = useRef<
      ((name: string, media: EditorialMedia) => void) | null
    >(null),
    backupKey = `ldgenx-editorial-${entry.id}`;
  const section = sectionOfKind(entry.kind),
    back = section
      ? `/admin/contenus/rubrique/${section.id}`
      : "/admin/contenus/pages",
    backLabel = section ? l(...section.name) : l("Autres pages", "Other pages"),
    options = useMemo(() => fieldOptions(catalog), [catalog]),
    freshDraft = !entry.legacyId && !entry.publishedVersion;
  const [recovery, setRecovery] = useState<{
    document: EditorialDocument;
    slug: string;
  } | null>(() => {
    try {
      return readWritingRecovery(
        localStorage.getItem(backupKey),
        initial.document,
        initial.slug,
        initial.kind,
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
    const fields = tidyFields(entry.kind, doc.fields);
    const checked = validateDocument(
      {
        ...doc,
        fields,
        author:
          entry.kind === "publication"
            ? ((fields.authors as string[] | undefined) ?? []).join("; ")
            : doc.author,
      },
      entry.kind,
    );
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
    if (picker === "field") {
      pictureTarget.current?.(`cms-media:${m.id}`, m);
      pictureTarget.current = null;
    }
    setPicker(null);
  };
  const publishIssues = publicationIssues(doc, entry.kind);
  const path = contentPath(entry.kind, entry.locale, slug),
    words = documentText(doc.body).trim().split(/\s+/).filter(Boolean).length;
  const previewContent: PublishedDocument = {
    ...summarize(
      {
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
      },
      doc,
    ),
    coverMedia: media.find((m) => m.id === doc.cover?.mediaId) ?? null,
    document: doc,
    media,
  };
  return (
    <div className="cms-admin cms-editor-page">
      <header className="cms-page-head">
        <div>
          <Link className="p-link" to={back}>
            <ArrowLeft size={15} />
            {backLabel}
          </Link>
          <p className="cms-eyebrow">
            {kindNames[locale][entry.kind]} ·{" "}
            {entry.locale === "fr" ? "Français" : "English"}
          </p>
          <h1>
            {doc.title.replace(/\*/g, "") ||
              l("Nouveau contenu", "New content")}
          </h1>
          <span
            className="cms-status"
            data-state={dirty ? "draft" : entryState(entry)}
          >
            {dirty
              ? l("Modifications non enregistrées", "Unsaved changes")
              : l(...stateWords[entryState(entry)])}
          </span>
        </div>
        <div className="cms-actions">
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => setPreview(true)}
          >
            <Eye size={17} />
            {l("Aperçu de la page", "Page preview")}
          </Button>
          <Button
            variant="secondary"
            busy={busy}
            onClick={() => void persistDraft()}
          >
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
          <a href="#cms-writing">{l("Contenu", "Content")}</a>
          <a href="#cms-publishing">{l("Publication", "Publishing")}</a>
        </nav>
        <span className="cms-save-state">
          {entry.kind === "article" && (
            <>
              {words} {words === 1 ? l("mot", "word") : l("mots", "words")}
              {words > 0 && (
                <>
                  {" "}
                  · {l("lecture", "reading")} ≈{" "}
                  {Math.max(1, Math.ceil(words / 200))} min
                </>
              )}
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
              <li key={key}>{issueText(key, entry.kind, l)}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="cms-editor-layout">
        <div className="cms-editor-main" id="cms-writing">
          <p className="cms-notice">
            {entry.kind === "page"
              ? l(
                  "Le modèle de cette page et ses sections restent en place. Les blocs rédigés plus bas s’ajoutent après son introduction.",
                  "This page’s template and sections stay in place. Blocks written below appear after its introduction.",
                )
              : l(
                  "Remplissez les champs : la page reprend automatiquement le design et les animations du site. « Aperçu de la page » vous la montre avant de publier.",
                  "Fill in the fields: the page automatically takes the website’s design and animations. “Page preview” shows it to you before publishing.",
                )}
          </p>
          {entry.kind !== "publication" && (
          <fieldset
            disabled={busy}
            className="cms-panel cms-cover-panel"
            id="cms-cover"
          >
            <div className="cms-section-head">
              <h2>{l("Image principale", "Main image")}</h2>
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
                  {l("Retirer l’image", "Remove image")}
                </Button>
              </>
            ) : (
              <button
                type="button"
                className="cms-cover-add"
                onClick={() => setPicker("cover")}
              >
                <ImagePlus size={30} />
                <strong>{l("Ajouter une image", "Add an image")}</strong>
                <span>
                  {l(
                    "Elle est convertie et allégée automatiquement, puis apparaît sur la page, sur sa carte et dans les partages.",
                    "It is converted and lightened automatically, then appears on the page, its card and when shared.",
                  )}
                </span>
              </button>
            )}
          </fieldset>
          )}
          <fieldset disabled={busy} className="cms-panel">
            <h2>{l("Présentation", "Presentation")}</h2>
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
                  "Pour un nom latin, entourez-le d’astérisques : *Dicentrarchus labrax*.",
                  "For a Latin name, surround it with asterisks: *Dicentrarchus labrax*.",
                )}
              </small>
            </label>
            <label>
              {l("Introduction", "Introduction")}
              <textarea
                className="p-input"
                aria-label={l("Introduction", "Introduction")}
                maxLength={600}
                rows={3}
                value={doc.summary}
                onChange={(e) => change("summary", e.target.value)}
              />
              <small>{doc.summary.length}/600</small>
            </label>
            {(entry.kind === "article" ||
              entry.kind === "study" ||
              entry.kind === "page") && (
              <div className="cms-form-grid">
                <label>
                  {l("Catégorie", "Category")}
                  <input
                    className="p-input"
                    maxLength={100}
                    value={doc.category}
                    onChange={(e) => change("category", e.target.value)}
                  />
                </label>
                {entry.kind === "article" && (
                  <label>
                    {l("Auteur(s)", "Author(s)")}
                    <input
                      className="p-input"
                      maxLength={1000}
                      value={doc.author}
                      onChange={(e) => change("author", e.target.value)}
                    />
                  </label>
                )}
              </div>
            )}
            {entry.kind === "publication" && (
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
            )}
          </fieldset>
          {entry.kind !== "page" && entry.kind !== "article" && (
            <FieldsDisabled.Provider value={busy}>
              <section className="cms-panel">
                <h2>{l("Contenu de la page", "Page content")}</h2>
                <TemplateFields
                  kind={entry.kind}
                  values={doc.fields}
                  options={options}
                  media={media}
                  pickPicture={(use) => {
                    pictureTarget.current = use;
                    setPicker("field");
                  }}
                  onChange={(value) => change("fields", value)}
                />
              </section>
            </FieldsDisabled.Provider>
          )}
          <div className="cms-section-head">
            <h2>
              {entry.kind === "article"
                ? l("Texte de l’article", "Article text")
                : l(
                    "Contenu supplémentaire (facultatif)",
                    "Additional content (optional)",
                  )}
            </h2>
            {entry.kind === "article" && (
              <span>
                {words} {words === 1 ? l("mot", "word") : l("mots", "words")}
              </span>
            )}
          </div>
          {entry.kind === "article" && (
            <p className="p-help">
              {l(
                "Chaque titre de niveau 2 devient une partie, avec son lien dans le sommaire de la page.",
                "Each level-2 heading becomes a part, with its link in the page’s table of contents.",
              )}
            </p>
          )}
          {canStartStructure(doc.body) &&
            entry.kind === "article" &&
            !entry.legacyId && (
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
          {entry.kind === "article" && (
            <fieldset disabled={busy} className="cms-panel">
              <h2>{l("Expertise liée", "Related expertise")}</h2>
              <FieldsDisabled.Provider value={busy}>
                <TemplateFields
                  kind="article"
                  values={doc.fields}
                  options={options}
                  media={media}
                  pickPicture={() => {}}
                  onChange={(value) => change("fields", value)}
                />
              </FieldsDisabled.Provider>
            </fieldset>
          )}
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
                "« Enregistrer » garde votre travail en privé. Le site ne change que lorsque vous cliquez sur « Publier ».",
                "“Save draft” keeps your work private. The website changes only when you click “Publish”.",
              )}
            </p>
            <details
              className="cms-preflight"
              open={publishIssues.length > 0 || undefined}
            >
              <summary>
                {publishIssues.length
                  ? `${publishIssues.length} ${l(publishIssues.length === 1 ? "élément à compléter" : "éléments à compléter", publishIssues.length === 1 ? "item to complete" : "items to complete")}`
                  : l("Tout est complet", "Everything is complete")}
              </summary>
              {publishIssues.length > 0 ? (
                <ul>
                  {publishIssues.map((key) => (
                    <li key={key}>{issueText(key, entry.kind, l)}</li>
                  ))}
                </ul>
              ) : (
                <p className="p-help">
                  {l(
                    "Vérifiez l’aperçu de la page avant de publier.",
                    "Check the page preview before publishing.",
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
                  "J’ai relu ce contenu et il peut être publié.",
                  "I have reviewed this content and it can be published.",
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
                      "Publié. Le site est à jour dans quelques secondes et les moteurs de recherche sont prévenus.",
                      "Published. The website updates within seconds and search engines are notified.",
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
            {(entryState(entry) === "live" ||
              entryState(entry) === "pending") && (
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
                    : l("Retirer du site", "Take offline")}
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
                      ...(entry.legacyId && entry.kind !== "page"
                        ? await translationAddress(entry)
                        : {}),
                    }));
                  navigate(`/admin/contenus/${next.id}`);
                })
              }
            >
              {entry.locale === "fr"
                ? l("Version anglaise", "English version")
                : l("Version française", "French version")}{" "}
              →
            </Button>
            <Button
              variant="ghost"
              disabled={busy}
              onClick={exportDraft}
              title={l("Exporter une copie JSON", "Export a JSON copy")}
            >
              <Download size={16} />
              {l("Exporter une copie", "Export a copy")}
            </Button>
            <Button variant="danger" onClick={() => setDeleting(true)}>
              <Trash2 size={16} />
              {entry.kind === "page"
                ? l("Supprimer les modifications", "Delete page changes")
                : l("Supprimer le contenu", "Delete content")}
            </Button>
          </fieldset>
          <fieldset disabled={busy} className="cms-panel">
            <h2>{l("Adresse & Google", "Address & Google")}</h2>
            <label>
              {l("Adresse courte", "URL slug")}
              <input
                className="p-input"
                aria-label={l("Adresse courte", "URL slug")}
                value={slug}
                maxLength={100}
                disabled={!freshDraft}
                onChange={(e) => setSlug(e.target.value)}
              />
              <small>
                {l(
                  "Créée à partir du titre. Elle ne change plus après la première publication, pour ne pas casser les liens.",
                  "Made from the title. It no longer changes after first publication, so links never break.",
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
                "Sans saisie, le titre et l’introduction sont utilisés. À la publication, la page rejoint sa rubrique, le plan du site et les sitemaps, et les moteurs de recherche sont prévenus.",
                "If left empty, the title and introduction are used. On publication, the page joins its section, the site map and sitemaps, and search engines are notified.",
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
                "La page disparaît du site, des listes et des résultats de recherche. Le contenu reste disponible pour être remis en ligne.",
                "The page leaves the website, its lists and search results. The content stays available to go back online.",
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
                  navigate(back);
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
/** The other language of a built-in item, at its own address in the site's routes. */
async function translationAddress(entry: EditorialEntry) {
  const other = await loadCatalog(entry.locale === "fr" ? "en" : "fr");
  const item = catalogItems(entry.kind, other).find(
    (candidate) => candidate.id === entry.legacyId,
  );
  return { legacyId: entry.legacyId, slug: item?.slug };
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
        <Suspense
          fallback={<p>{l("Chargement de la page…", "Loading page…")}</p>}
        >
          <SitePagePreview content={content} />
        </Suspense>
      </LocaleProvider>
    </div>
  );
}
