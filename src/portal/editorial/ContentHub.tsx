import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  EyeOff,
  FileStack,
  FlaskConical,
  ImagePlus,
  Images,
  Layers,
  Microscope,
  Newspaper,
  Pencil,
  Plus,
  RotateCcw,
  Send,
  Sprout,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { Button, Dialog } from "../ui";
import { useI18n } from "../i18n";
import { cms, cmsRequest } from "./api";
import { cmsError, issueLabels, useWords } from "./labels";
import { siteSections, type SiteSection } from "./sections";
import { fieldLabels } from "./TemplateFields";
import { StorageMeter } from "./MediaLibrary";
import { imageUrl, imageWidths } from "../../lib/images";
import { catalogItems } from "../../editorial/legacy";
import { MediaImage } from "../../editorial/media-view";
import { loadCatalog, type Catalog } from "../../content/catalog";
import { searchText } from "../../lib/search";
import {
  contentPath,
  type ContentKind,
  type ContentLocale,
  type EditorialEntry,
  type EditorialPageTemplate,
} from "../../../supabase/functions/_shared/editorial";
import "../../editorial/editorial.css";
import "./admin.css";

const icons: Record<string, LucideIcon> = {
  expertises: Microscope,
  applications: Sprout,
  "etudes-de-cas": FlaskConical,
  publications: FileStack,
  ressources: Newspaper,
};
type State = "live" | "pending" | "draft" | "offline";
interface Item {
  key: string;
  legacyId: string | null;
  slug: string;
  title: string;
  summary: string;
  image: string;
  path: string;
  entry?: EditorialEntry;
  state: State;
}
export const stateWords: Record<State, [string, string]> = {
  live: ["En ligne", "Live"],
  pending: ["En ligne · modifications à publier", "Live · changes to publish"],
  draft: ["Brouillon", "Draft"],
  offline: ["Hors ligne", "Offline"],
};
export function entryState(entry?: EditorialEntry): State {
  if (entry?.publication?.status === "published")
    return entry.version === entry.publishedVersion ? "live" : "pending";
  if (entry?.publication?.status === "withdrawn") return "offline";
  if (entry?.legacyId) return entry.version > 1 ? "pending" : "live";
  return entry ? "draft" : "live";
}
function useContent() {
  const l = useWords();
  const [entries, setEntries] = useState<EditorialEntry[]>([]),
    [catalogs, setCatalogs] = useState<Partial<Record<ContentLocale, Catalog>>>({}),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const reload = async () => {
    try {
      const [list, fr, en] = await Promise.all([
        cms.list(),
        loadCatalog("fr"),
        loadCatalog("en"),
      ]);
      setEntries(list);
      setCatalogs({ fr, en });
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
  return { entries, catalogs, error, loading, reload };
}
function itemsOf(
  kind: ContentKind,
  locale: ContentLocale,
  entries: EditorialEntry[],
  catalog: Catalog | undefined,
): Item[] {
  if (!catalog) return [];
  const own = entries.filter(
    (e) => e.kind === kind && e.locale === locale && !e.deletedAt,
  );
  const trashed = entries.filter(
    (e) => e.kind === kind && e.locale === locale && e.deletedAt,
  );
  const added = own
    .filter((e) => !e.legacyId)
    .map((entry) => ({
      key: entry.id,
      legacyId: null,
      slug: entry.slug,
      title: entry.document.title,
      summary: entry.document.summary,
      image: "",
      path: contentPath(kind, locale, entry.slug),
      entry,
      state: entryState(entry),
    }));
  const builtIn = catalogItems(kind, catalog)
    .filter((item) => !trashed.some((e) => e.legacyId === item.id))
    .map((item) => {
      const entry = own.find((e) => e.legacyId === item.id);
      // A saved edit is what the admin wrote last; an untouched copy repeats the catalogue.
      const edited = entry && entry.version > 1;
      return {
        key: `${kind}:${item.id}`,
        legacyId: item.id,
        slug: item.slug,
        title: (edited && entry.document.title) || item.title,
        summary: (edited && entry.document.summary) || item.summary,
        image: item.image,
        path: item.path,
        entry,
        state: entryState(entry),
      };
    });
  return [...added, ...builtIn];
}
const smallest = (name: string) => imageUrl(name, imageWidths(name)[0]);
function Thumbnail({ item }: { item: Item }) {
  const cover = item.entry?.document.cover;
  return (
    <span className="cms-entry-image">
      {cover?.mediaId && item.entry?.coverMedia ? (
        <MediaImage image={cover} media={item.entry.coverMedia} sizes="160px" />
      ) : item.image ? (
        <img src={smallest(item.image)} alt="" loading="lazy" />
      ) : (
        <ImagePlus size={26} aria-hidden="true" />
      )}
    </span>
  );
}

/** The overview: every section of the site, each leading to its own page. */
export function ContentHubPage() {
  const l = useWords(),
    { locale } = useI18n();
  const { entries, catalogs, error, loading, reload } = useContent();
  const count = (section: SiteSection) => {
    const items = itemsOf(section.kind, locale, entries, catalogs[locale]);
    return {
      total: items.length,
      live: items.filter((i) => i.state === "live").length,
      waiting: items.filter((i) => i.state === "draft" || i.state === "pending")
        .length,
    };
  };
  const trashed = entries.filter((e) => e.deletedAt).length;
  return (
    <div className="cms-admin">
      <header className="cms-page-head">
        <div>
          <h1>{l("Contenus du site", "Website content")}</h1>
          <p>
            {l(
              "Choisissez une rubrique pour ajouter, modifier, publier ou supprimer ses contenus. Le design et les animations du site restent les mêmes : seul le contenu change.",
              "Choose a section to add, edit, publish or delete its content. The website’s design and animations stay the same: only the content changes.",
            )}
          </p>
        </div>
      </header>
      {error && (
        <div role="alert" className="p-error">
          {error}{" "}
          <Button variant="secondary" onClick={() => void reload()}>
            {l("Réessayer", "Retry")}
          </Button>
        </div>
      )}
      <div className="cms-hub">
        {siteSections.map((section) => {
          const Icon = icons[section.id];
          const counts = count(section);
          return (
            <Link
              key={section.id}
              className="cms-hub-card"
              to={`/admin/contenus/rubrique/${section.id}`}
            >
              <Icon size={24} aria-hidden="true" />
              <h2>{l(...section.name)}</h2>
              <p>{l(...section.text)}</p>
              <span className="cms-hub-count">
                {loading ? (
                  "…"
                ) : (
                  <>
                    {counts.live} {l("en ligne", "live")}
                    {counts.waiting > 0 && (
                      <strong>
                        {counts.waiting} {l("à publier", "to publish")}
                      </strong>
                    )}
                  </>
                )}
              </span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          );
        })}
        <Link className="cms-hub-card" to="/admin/contenus/pages">
          <Layers size={24} aria-hidden="true" />
          <h2>{l("Autres pages", "Other pages")}</h2>
          <p>
            {l(
              "Accueil, À propos, Équipe, FAQ, Contact… : titre, introduction, image et blocs ajoutés.",
              "Home, About, Team, FAQ, Contact…: title, introduction, image and added blocks.",
            )}
          </p>
          <span className="cms-hub-count" />
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
      <nav className="cms-hub-links" aria-label={l("Outils", "Tools")}>
        <Link to="/admin/medias">
          <Images size={17} aria-hidden="true" />
          {l("Médiathèque", "Media library")}
        </Link>
        <Link to="/admin/contenus/corbeille">
          <Trash2 size={17} aria-hidden="true" />
          {l("Corbeille", "Trash")} ({trashed})
        </Link>
      </nav>
      <StorageMeter />
    </div>
  );
}

function LanguageTabs({
  value,
  onChange,
}: {
  value: ContentLocale;
  onChange: (locale: ContentLocale) => void;
}) {
  const l = useWords();
  return (
    <div
      className="cms-tabs"
      role="group"
      aria-label={l("Langue du contenu", "Content language")}
    >
      {(["fr", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          aria-pressed={value === code}
          onClick={() => onChange(code)}
        >
          {code === "fr" ? "Français" : "English"}
        </button>
      ))}
    </div>
  );
}

/** One section of the site: everything it shows, and everything that can be done with it. */
export function SectionPage() {
  const { section: id } = useParams();
  const section = siteSections.find((s) => s.id === id);
  if (!section)
    return (
      <div className="cms-admin">
        <Link className="p-link" to="/admin/contenus">
          ← Contenus
        </Link>
      </div>
    );
  return <Section key={section.id} section={section} />;
}
function Section({ section }: { section: SiteSection }) {
  const l = useWords(),
    { locale: interfaceLocale } = useI18n(),
    navigate = useNavigate();
  const { entries, catalogs, error, loading, reload } = useContent();
  const [locale, setLocale] = useState<ContentLocale>(interfaceLocale),
    [filter, setFilter] = useState<State | "all">("all"),
    [query, setQuery] = useState(""),
    [busy, setBusy] = useState(""),
    [actionError, setActionError] = useState(""),
    [notice, setNotice] = useState(""),
    [dialog, setDialog] = useState<{
      type: "publish" | "withdraw" | "delete";
      item: Item;
    } | null>(null),
    [reviewed, setReviewed] = useState(false);
  const items = useMemo(
    () => itemsOf(section.kind, locale, entries, catalogs[locale]),
    [section, locale, entries, catalogs],
  );
  const shown = items.filter(
    (item) =>
      (filter === "all" || item.state === filter) &&
      searchText(`${item.title} ${item.summary} ${item.slug}`).includes(
        searchText(query),
      ),
  );
  const workingCopy = async (item: Item) =>
    item.entry ??
    cmsRequest<EditorialEntry>("/entries", "POST", {
      kind: section.kind,
      locale,
      legacyId: item.legacyId,
      slug: item.slug,
    });
  const run = async (key: string, task: () => Promise<void>) => {
    setBusy(key);
    setActionError("");
    setNotice("");
    try {
      await task();
    } catch (e) {
      setActionError(cmsError(e, l));
    } finally {
      setBusy("");
    }
  };
  const create = () =>
    run("create", async () => {
      const entry = await cmsRequest<EditorialEntry>("/entries", "POST", {
        kind: section.kind,
        locale,
      });
      navigate(`/admin/contenus/${entry.id}`);
    });
  const edit = (item: Item) =>
    run(item.key, async () => {
      navigate(`/admin/contenus/${(await workingCopy(item)).id}`);
    });
  const publish = (item: Item) =>
    run(item.key, async () => {
      const entry = await workingCopy(item);
      try {
        await cmsRequest(`/entries/${entry.id}/publish`, "POST", {
          version: entry.version,
          reviewed: true,
        });
      } catch (e) {
        // What is missing is shown in the form, next to the fields to fill.
        if ((e as { code?: string }).code === "publication_incomplete") {
          navigate(`/admin/contenus/${entry.id}`);
          return;
        }
        throw e;
      }
      setNotice(
        l(
          "Publié. Le site est à jour dans quelques secondes et les moteurs de recherche sont prévenus.",
          "Published. The website updates within seconds and search engines are notified.",
        ),
      );
      setDialog(null);
      await reload();
    });
  const withdraw = (item: Item) =>
    run(item.key, async () => {
      const entry = await workingCopy(item);
      await cmsRequest(`/entries/${entry.id}/withdraw`, "POST", {
        version: entry.version,
      });
      setNotice(
        l(
          "Retiré du site. Le contenu reste ici, prêt à être remis en ligne.",
          "Taken off the website. The content stays here, ready to go back online.",
        ),
      );
      setDialog(null);
      await reload();
    });
  const reinstate = (item: Item) =>
    run(item.key, async () => {
      const entry = item.entry!;
      // Published edits come back as they were; otherwise a built-in page returns as it was built.
      if (entry.legacyId && !entry.publishedVersion)
        await cmsRequest(`/entries/${entry.id}/reinstate`, "POST", {
          version: entry.version,
        });
      else
        await cmsRequest(`/entries/${entry.id}/publish`, "POST", {
          version: entry.version,
          reviewed: true,
        });
      setNotice(l("Remis en ligne.", "Back online."));
      await reload();
    });
  const remove = (item: Item) =>
    run(item.key, async () => {
      const entry = await workingCopy(item);
      await cmsRequest(`/entries/${entry.id}/trash`, "POST", {
        version: entry.version,
      });
      setNotice(
        l(
          "Déplacé dans la corbeille. Vous pouvez le restaurer à tout moment.",
          "Moved to trash. You can restore it at any time.",
        ),
      );
      setDialog(null);
      await reload();
    });
  const counts = (state: State) =>
    items.filter((item) => item.state === state).length;
  const headerEntry = catalogs[locale] && section.page[locale];
  return (
    <div className="cms-admin">
      <Link className="p-link" to="/admin/contenus">
        <ArrowLeft size={15} aria-hidden="true" />
        {l("Contenus du site", "Website content")}
      </Link>
      <header className="cms-page-head">
        <div>
          <h1>{l(...section.name)}</h1>
          <p>{l(...section.text)}</p>
        </div>
        <div className="cms-actions">
          <a
            className="p-button"
            data-variant="secondary"
            href={section.page[locale]}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={15} aria-hidden="true" />
            {l("Voir sur le site", "View on website")}
          </a>
          <Button busy={busy === "create"} onClick={() => void create()}>
            <Plus size={17} aria-hidden="true" />
            {l(...section.add)}
          </Button>
        </div>
      </header>
      <div className="cms-toolbar-row">
        <LanguageTabs
          value={locale}
          onChange={(value) => {
            setLocale(value);
            setFilter("all");
          }}
        />
        <div className="cms-chips" role="group" aria-label={l("État", "Status")}>
          {(
            [
              ["all", l("Tous", "All"), items.length],
              ["live", l("En ligne", "Live"), counts("live")],
              ["pending", l("À publier", "To publish"), counts("pending")],
              ["draft", l("Brouillons", "Drafts"), counts("draft")],
              ["offline", l("Hors ligne", "Offline"), counts("offline")],
            ] as const
          ).map(([key, label, n]) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              disabled={key !== "all" && !n}
              onClick={() => setFilter(key)}
            >
              {label} <span>{n}</span>
            </button>
          ))}
        </div>
        <input
          className="p-input"
          type="search"
          aria-label={l("Rechercher", "Search")}
          placeholder={l("Rechercher…", "Search…")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {notice && (
        <p className="cms-notice" role="status">
          {notice}
        </p>
      )}
      {(actionError || error) && !dialog && (
        <p className="p-error" role="alert">
          {actionError || error}
        </p>
      )}
      {loading ? (
        <p role="status">{l("Chargement…", "Loading…")}</p>
      ) : (
        <div className="cms-entry-list">
          {shown.map((item) => (
            <article key={item.key} className="cms-entry">
              <button
                type="button"
                className="cms-entry-main"
                onClick={() => void edit(item)}
              >
                <Thumbnail item={item} />
                <div>
                  <h2>
                    {item.title.replace(/\*/g, "") || l("Sans titre", "Untitled")}
                  </h2>
                  <p>{item.summary}</p>
                  <small>{item.path}</small>
                </div>
              </button>
              <div className="cms-entry-meta">
                <span className="cms-status" data-state={item.state}>
                  {l(...stateWords[item.state])}
                </span>
                <div className="cms-entry-actions">
                  <Button
                    size="small"
                    variant="secondary"
                    busy={busy === item.key}
                    onClick={() => void edit(item)}
                  >
                    <Pencil size={15} aria-hidden="true" />
                    {l("Modifier", "Edit")}
                  </Button>
                  {(item.state === "draft" || item.state === "pending") &&
                    item.entry && (
                      <Button
                        size="small"
                        disabled={!!busy}
                        onClick={() => {
                          setReviewed(false);
                          setActionError("");
                          setDialog({ type: "publish", item });
                        }}
                      >
                        <Send size={15} aria-hidden="true" />
                        {l("Publier", "Publish")}
                      </Button>
                    )}
                  {(item.state === "live" || item.state === "pending") && (
                    <>
                      <a
                        className="p-button"
                        data-variant="ghost"
                        href={item.path}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink size={15} aria-hidden="true" />
                        {l("Voir", "View")}
                      </a>
                      <Button
                        size="small"
                        variant="ghost"
                        disabled={!!busy}
                        onClick={() => {
                          setActionError("");
                          setDialog({ type: "withdraw", item });
                        }}
                      >
                        <EyeOff size={15} aria-hidden="true" />
                        {l("Retirer du site", "Take offline")}
                      </Button>
                    </>
                  )}
                  {item.state === "offline" && (
                    <Button
                      size="small"
                      disabled={!!busy}
                      onClick={() => void reinstate(item)}
                    >
                      <RotateCcw size={15} aria-hidden="true" />
                      {l("Remettre en ligne", "Put back online")}
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="danger"
                    disabled={!!busy}
                    aria-label={`${l("Supprimer", "Delete")} ${item.title.replace(/\*/g, "") || l("Sans titre", "Untitled")}`}
                    onClick={() => {
                      setActionError("");
                      setDialog({ type: "delete", item });
                    }}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    {l("Supprimer", "Delete")}
                  </Button>
                </div>
              </div>
            </article>
          ))}
          {!shown.length && <p>{l("Aucun contenu ici.", "Nothing here.")}</p>}
        </div>
      )}
      {headerEntry && (
        <p className="p-help cms-section-foot">
          {l(
            "Pour changer le titre et l’introduction en haut de cette rubrique sur le site :",
            "To change the title and introduction at the top of this section on the website:",
          )}{" "}
          <Link to={`/admin/contenus/pages?page=${encodeURIComponent(section.page[locale])}`}>
            {l("modifier l’en-tête de la page", "edit the page header")}
          </Link>
        </p>
      )}
      <Dialog
        open={!!dialog}
        onClose={() => !busy && setDialog(null)}
        title={
          dialog?.type === "publish"
            ? l("Publier sur le site ?", "Publish on the website?")
            : dialog?.type === "withdraw"
              ? l("Retirer du site ?", "Take off the website?")
              : l("Supprimer ce contenu ?", "Delete this content?")
        }
        footer={
          <>
            <Button
              variant="secondary"
              disabled={!!busy}
              onClick={() => setDialog(null)}
            >
              {l("Annuler", "Cancel")}
            </Button>
            {dialog?.type === "publish" ? (
              <Button
                busy={!!busy}
                disabled={!reviewed}
                onClick={() => void publish(dialog.item)}
              >
                {l("Publier", "Publish")}
              </Button>
            ) : (
              <Button
                variant="danger"
                busy={!!busy}
                onClick={() =>
                  dialog &&
                  void (dialog.type === "withdraw" ? withdraw : remove)(
                    dialog.item,
                  )
                }
              >
                {dialog?.type === "withdraw"
                  ? l("Retirer du site", "Take offline")
                  : l("Déplacer dans la corbeille", "Move to trash")}
              </Button>
            )}
          </>
        }
      >
        <p>
          <strong>{dialog?.item.title.replace(/\*/g, "")}</strong>
        </p>
        {dialog?.type === "publish" && (
          <label className="cms-confirm">
            <input
              type="checkbox"
              checked={reviewed}
              onChange={(e) => setReviewed(e.target.checked)}
            />
            <span>
              {l(
                "J’ai relu ce contenu et il peut être publié.",
                "I have reviewed this content and it can be published.",
              )}
            </span>
          </label>
        )}
        {dialog?.type === "withdraw" && (
          <p>
            {l(
              "La page disparaît du site, des listes et des résultats de recherche. Le contenu reste ici pour être remis en ligne.",
              "The page leaves the website, its lists and search results. The content stays here to go back online.",
            )}
          </p>
        )}
        {dialog?.type === "delete" && (
          <p>
            {l(
              "Le contenu quitte le site et va dans la corbeille, d’où vous pouvez le restaurer.",
              "The content leaves the website and goes to trash, where you can restore it.",
            )}
          </p>
        )}
        {actionError && (
          <p className="p-error" role="alert">
            {actionError}
          </p>
        )}
      </Dialog>
    </div>
  );
}

/** The other pages of the site keep their sections: title, introduction, image and added blocks. */
export function OtherPagesPage() {
  const l = useWords(),
    { locale: interfaceLocale } = useI18n(),
    navigate = useNavigate();
  const { entries, error, loading } = useContent();
  const wanted = new URLSearchParams(window.location.search).get("page");
  const [locale, setLocale] = useState<ContentLocale>(
    wanted?.startsWith("/en") ? "en" : interfaceLocale,
  );
  const [templates, setTemplates] = useState<EditorialPageTemplate[]>([]),
    [query, setQuery] = useState(wanted ?? ""),
    [busy, setBusy] = useState(""),
    [actionError, setActionError] = useState("");
  useEffect(() => {
    void cmsRequest<EditorialPageTemplate[]>("/page-templates")
      .then(setTemplates)
      .catch((e) => setActionError(cmsError(e, l)));
  }, []);
  const pages = templates.filter(
    (p) =>
      p.locale === locale &&
      !["service", "application"].includes(p.kind) &&
      searchText(`${p.label} ${p.title} ${p.path}`).includes(searchText(query)),
  );
  const open = async (template: EditorialPageTemplate) => {
    setBusy(template.path);
    setActionError("");
    try {
      const entry = await cmsRequest<EditorialEntry>("/entries", "POST", {
        kind: "page",
        locale,
        pagePath: template.path,
      });
      navigate(`/admin/contenus/${entry.id}`);
    } catch (e) {
      setActionError(cmsError(e, l));
    } finally {
      setBusy("");
    }
  };
  return (
    <div className="cms-admin">
      <Link className="p-link" to="/admin/contenus">
        <ArrowLeft size={15} aria-hidden="true" />
        {l("Contenus du site", "Website content")}
      </Link>
      <header className="cms-page-head">
        <div>
          <h1>{l("Autres pages", "Other pages")}</h1>
          <p>
            {l(
              "Ces pages gardent leurs sections et leurs animations. Vous pouvez changer leur titre, leur introduction et leur image, et ajouter du texte, des figures ou des vidéos.",
              "These pages keep their sections and animations. You can change their title, introduction and image, and add text, figures or videos.",
            )}
          </p>
        </div>
      </header>
      <div className="cms-toolbar-row">
        <LanguageTabs value={locale} onChange={setLocale} />
        <input
          className="p-input"
          type="search"
          aria-label={l("Rechercher une page", "Search a page")}
          placeholder={l("Rechercher une page…", "Search a page…")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {(actionError || error) && (
        <p className="p-error" role="alert">
          {actionError || error}
        </p>
      )}
      {loading ? (
        <p role="status">{l("Chargement…", "Loading…")}</p>
      ) : (
        <div className="cms-page-list">
          {pages.map((template) => {
            const entry = entries.find(
              (e) =>
                e.kind === "page" &&
                e.legacyId === `page:${template.path}` &&
                !e.deletedAt,
            );
            const state: State =
              entry?.publication?.status === "published"
                ? entryState(entry)
                : entry && entry.version > 1
                  ? "pending"
                  : "live";
            return (
              <button
                key={template.path}
                type="button"
                className="cms-page-row"
                disabled={busy === template.path}
                onClick={() => void open(template)}
              >
                <span>
                  <strong>{template.label}</strong>
                  <small>{template.path}</small>
                </span>
                <span className="cms-status" data-state={state}>
                  {l(
                    ...(entry?.publication?.status === "published" &&
                    state === "live"
                      ? (["Modifiée", "Edited"] as [string, string])
                      : stateWords[state]),
                  )}
                </span>
                <Pencil size={16} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TrashPage() {
  const l = useWords();
  const { entries, error, loading, reload } = useContent();
  const [busy, setBusy] = useState(""),
    [actionError, setActionError] = useState(""),
    [notice, setNotice] = useState("");
  const trashed = entries.filter((e) => e.deletedAt);
  const act = async (
    entry: EditorialEntry,
    task: () => Promise<unknown>,
    done: string,
  ) => {
    setBusy(entry.id);
    setActionError("");
    try {
      await task();
      setNotice(done);
      await reload();
    } catch (e) {
      setActionError(cmsError(e, l));
    } finally {
      setBusy("");
    }
  };
  return (
    <div className="cms-admin">
      <Link className="p-link" to="/admin/contenus">
        <ArrowLeft size={15} aria-hidden="true" />
        {l("Contenus du site", "Website content")}
      </Link>
      <header className="cms-page-head">
        <div>
          <h1>{l("Corbeille", "Trash")}</h1>
          <p>
            {l(
              "Restaurer redonne un brouillon, à publier quand il est prêt. Un contenu déjà publié garde son adresse réservée.",
              "Restoring gives back a draft to publish when ready. Content published before keeps its address reserved.",
            )}
          </p>
        </div>
      </header>
      {notice && (
        <p className="cms-notice" role="status">
          {notice}
        </p>
      )}
      {(actionError || error) && (
        <p className="p-error" role="alert">
          {actionError || error}
        </p>
      )}
      {loading ? (
        <p role="status">{l("Chargement…", "Loading…")}</p>
      ) : trashed.length ? (
        <div className="cms-page-list">
          {trashed.map((entry) => (
            <div key={entry.id} className="cms-page-row" data-static>
              <span>
                <strong>
                  {entry.document.title.replace(/\*/g, "") ||
                    l("Sans titre", "Untitled")}
                </strong>
                <small>{contentPath(entry.kind, entry.locale, entry.slug)}</small>
              </span>
              <span className="cms-actions">
                <Button
                  size="small"
                  variant="secondary"
                  busy={busy === entry.id}
                  onClick={() =>
                    void act(
                      entry,
                      () =>
                        cmsRequest(`/entries/${entry.id}/untrash`, "POST", {
                          version: entry.version,
                        }),
                      l(
                        "Restauré en brouillon dans sa rubrique.",
                        "Restored as a draft in its section.",
                      ),
                    )
                  }
                >
                  <RotateCcw size={15} aria-hidden="true" />
                  {l("Restaurer", "Restore")}
                </Button>
                {!entry.legacyId && !entry.publishedVersion && (
                  <Button
                    size="small"
                    variant="danger"
                    disabled={!!busy}
                    onClick={() =>
                      window.confirm(
                        l(
                          "Supprimer définitivement ce brouillon ?",
                          "Permanently delete this draft?",
                        ),
                      ) &&
                      void act(
                        entry,
                        () => cmsRequest(`/entries/${entry.id}`, "DELETE"),
                        l("Supprimé définitivement.", "Permanently deleted."),
                      )
                    }
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    {l("Supprimer définitivement", "Delete permanently")}
                  </Button>
                )}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p>{l("La corbeille est vide.", "Trash is empty.")}</p>
      )}
    </div>
  );
}

/** Words for what is still missing before a document can be published. */
export function issueText(
  key: string,
  kind: ContentKind,
  l: (fr: string, en: string) => string,
) {
  if (key.startsWith("field:")) {
    const label = fieldLabels[kind][key.slice("field:".length)];
    return label ? l(...label.label) : key;
  }
  return issueLabels[key] ? l(...issueLabels[key]) : key;
}
