import { Fragment, useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ContentVideo, MediaImage } from "./media-view";
import { useEditorial } from "./context";
import {
  contentBases,
  type ContentNode,
  type ContentImage,
  type EditorialMedia,
  type PublishedDocument,
  type EditorialSummary,
} from "../../supabase/functions/_shared/editorial";
import { useLocale } from "../i18n";
import { LegacyStudyEvidence } from "../pages/Editorial";
function ScientificTitle({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(\*[^*]+\*)/)
        .map((part, i) =>
          part.startsWith("*") && part.endsWith("*") ? (
            <em key={i}>{part.slice(1, -1)}</em>
          ) : (
            part
          ),
        )}
    </>
  );
}

function richNode(
  node: ContentNode,
  media: EditorialMedia[],
  locale: string,
  key: number,
): ReactNode {
  if (node.type === "text") {
    let output: ReactNode = node.text;
    for (const mark of node.marks ?? []) {
      if (mark.type === "bold") output = <strong>{output}</strong>;
      if (mark.type === "italic") output = <em>{output}</em>;
      if (mark.type === "underline") output = <u>{output}</u>;
      if (mark.type === "strike") output = <s>{output}</s>;
      if (mark.type === "subscript") output = <sub>{output}</sub>;
      if (mark.type === "superscript") output = <sup>{output}</sup>;
      if (mark.type === "link")
        output = (
          <a href={mark.attrs?.href} rel="noreferrer">
            {output}
          </a>
        );
    }
    return <Fragment key={key}>{output}</Fragment>;
  }
  const children = node.content?.map((child, i) =>
    richNode(child, media, locale, i),
  );
  switch (node.type) {
    case "doc":
      return <Fragment key={key}>{children}</Fragment>;
    case "paragraph":
      return <p key={key}>{children?.length ? children : <br />}</p>;
    case "heading": {
      const Tag = `h${Number(node.attrs?.level) || 2}` as "h2" | "h3" | "h4";
      return <Tag key={key}>{children}</Tag>;
    }
    case "hardBreak":
      return <br key={key} />;
    case "horizontalRule":
      return <hr key={key} />;
    case "blockquote":
      return <blockquote key={key}>{children}</blockquote>;
    case "bulletList":
      return <ul key={key}>{children}</ul>;
    case "orderedList":
      return (
        <ol key={key} start={Number(node.attrs?.start) || 1}>
          {children}
        </ol>
      );
    case "listItem":
      return <li key={key}>{children}</li>;
    case "table":
      return (
        <div className="cms-table" tabIndex={0} key={key}>
          <table>
            <tbody>{children}</tbody>
          </table>
        </div>
      );
    case "tableRow":
      return <tr key={key}>{children}</tr>;
    case "tableCell":
      return (
        <td
          key={key}
          colSpan={Number(node.attrs?.colspan) || 1}
          rowSpan={Number(node.attrs?.rowspan) || 1}
        >
          {children}
        </td>
      );
    case "tableHeader":
      return (
        <th
          key={key}
          scope="col"
          colSpan={Number(node.attrs?.colspan) || 1}
          rowSpan={Number(node.attrs?.rowspan) || 1}
        >
          {children}
        </th>
      );
    case "figure": {
      const img = node.attrs as unknown as ContentImage;
      const asset = media.find((m) => m.id === img.mediaId);
      const full = img.staticSrc ?? Object.values(asset?.urls ?? {}).at(-1);
      return (
        <figure className="cms-figure" key={key}>
          <a
            href={full}
            target="_blank"
            rel="noreferrer"
            title={
              locale === "fr"
                ? "Ouvrir la figure en grand"
                : "Open full-size figure"
            }
          >
            <MediaImage image={img} media={asset} />
          </a>
          <figcaption>
            {img.caption && <p>{img.caption}</p>}
            {img.credit && (
              <span>
                {img.credit}
                {img.licenceUrl && (
                  <>
                    {" "}
                    ·{" "}
                    <a href={img.licenceUrl} rel="noreferrer">
                      {locale === "fr"
                        ? "Licence / source"
                        : "Licence / source"}
                    </a>
                  </>
                )}
              </span>
            )}
          </figcaption>
        </figure>
      );
    }
    case "video":
      return (
        <ContentVideo key={key} node={node} media={media} locale={locale} />
      );
    case "studyEvidence":
      return (
        <div className="cms-study-evidence" key={key}>
          <LegacyStudyEvidence id={String(node.attrs?.id)} />
        </div>
      );
    default:
      return null;
  }
}
export function DocumentBody({
  body,
  media = [],
  locale = "fr",
}: {
  body: ContentNode;
  media?: EditorialMedia[];
  locale?: string;
}) {
  return <div className="cms-prose">{richNode(body, media, locale, 0)}</div>;
}
export function EditorialDocumentView({
  content,
  preview = false,
}: {
  content: PublishedDocument;
  preview?: boolean;
}) {
  const d = content.document,
    fr = content.locale === "fr";
  const parent = contentBases[content.locale][content.kind];
  const label =
    content.kind === "study"
      ? fr
        ? "Études de cas"
        : "Case studies"
      : content.kind === "publication"
        ? fr
          ? "Recherche & publications"
          : "Research & publications"
        : fr
          ? "Articles & guides"
          : "Articles & guides";
  return (
    <article className="cms-document">
      <header className="cms-document-hero container">
        {!preview && (
          <nav
            className="breadcrumbs"
            aria-label={fr ? "Fil d’Ariane" : "Breadcrumb"}
          >
            <Link to={fr ? "/" : "/en"}>{fr ? "Accueil" : "Home"}</Link>
            <span aria-hidden="true"> / </span>
            <Link to={parent}>{label}</Link>
          </nav>
        )}
        <p className="eyebrow">
          {content.kind === "publication"
            ? fr
              ? "Résumé de publication scientifique"
              : "Scientific publication summary"
            : d.category || label}
        </p>
        <h1>
          <ScientificTitle text={d.title} />
        </h1>
        <p className="cms-lead">{d.summary}</p>
        <div className="cms-byline">
          <span>
            {content.kind === "publication" &&
              (fr ? "Auteurs de l’article : " : "Paper authors: ")}
            {d.author}
          </span>
          {!preview && (
            <time dateTime={content.updatedAt}>
              {content.kind === "publication" &&
                (fr ? "Résumé mis à jour le " : "Summary updated on ")}
              {new Intl.DateTimeFormat(fr ? "fr-FR" : "en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(new Date(content.updatedAt))}
            </time>
          )}
        </div>
        {content.kind === "publication" && (
          <p className="cms-journal">
            {d.journal} {d.year && `· ${d.year}`}
            {d.doi && (
              <>
                {" "}
                ·{" "}
                <a href={`https://doi.org/${d.doi}`} rel="noreferrer">
                  DOI : {d.doi}
                </a>
              </>
            )}
          </p>
        )}
      </header>
      {d.cover && (
        <figure className="container cms-cover">
          <MediaImage
            image={d.cover}
            media={content.media.find((m) => m.id === d.cover?.mediaId)}
            eager
          />
          {(d.cover.caption || d.cover.credit !== "LDgenX") && (
            <figcaption>
              {d.cover.caption}
              {d.cover.credit && <> · {d.cover.credit}</>}
              {d.cover.licenceUrl && (
                <>
                  {" "}
                  ·{" "}
                  <a href={d.cover.licenceUrl} rel="noreferrer">
                    {fr ? "Licence / source" : "Licence / source"}
                  </a>
                </>
              )}
            </figcaption>
          )}
        </figure>
      )}
      <div className="container cms-document-body">
        <DocumentBody
          body={d.body}
          media={content.media}
          locale={content.locale}
        />
        {d.references.length > 0 && (
          <section className="cms-references">
            <h2>{fr ? "Sources & références" : "Sources & references"}</h2>
            <ol>
              {d.references.map((r, i) => (
                <li key={i}>
                  {r.url ? (
                    <a href={r.url} rel="noreferrer">
                      {r.label}
                    </a>
                  ) : (
                    r.label
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </article>
  );
}
export function PublishedEditorialPage({ row }: { row: EditorialSummary }) {
  const state = useEditorial(),
    content = state.documents[row.path],
    failure = state.failures[row.path];
  useEffect(() => {
    if (!content) state.load(row.path);
  }, [row.path, content]);
  if (content) return <EditorialDocumentView content={content} />;
  return (
    <section className="container cms-loading" aria-live="polite">
      <h1>{row.title}</h1>
      <p>
        {failure
          ? row.locale === "fr"
            ? "Ce contenu est momentanément indisponible. Réessayez dans un instant."
            : "This content is temporarily unavailable. Please try again shortly."
          : row.locale === "fr"
            ? "Chargement du contenu…"
            : "Loading content…"}
      </p>
      {failure && (
        <button type="button" onClick={() => state.load(row.path)}>
          {row.locale === "fr" ? "Réessayer" : "Try again"}
        </button>
      )}
    </section>
  );
}
export function EditorialCards({
  kind,
  onlyNew = true,
  entries: selected,
}: {
  kind: EditorialSummary["kind"];
  onlyNew?: boolean;
  entries?: EditorialSummary[];
}) {
  const { index } = useEditorial(),
    locale = useLocale();
  const entries =
    selected ??
    index.filter(
      (r) =>
        r.status === "published" &&
        r.locale === locale &&
        r.kind === kind &&
        (!onlyNew || !r.legacyId),
    );
  if (!entries.length) return null;
  return (
    <div className="cms-card-grid">
      {entries.map((r) => (
        <Link to={r.path} key={r.id} className="cms-card">
          {r.cover && (
            <MediaImage
              image={r.cover}
              media={r.coverMedia}
              sizes="(max-width: 700px) 92vw, 480px"
            />
          )}
          <span className="eyebrow">{r.category}</span>
          <h3>
            <ScientificTitle text={r.title} />
          </h3>
          <p>{r.summary}</p>
          <span className="text-link">
            {locale === "fr" ? "Lire la suite" : "Read more"} →
          </span>
        </Link>
      ))}
    </div>
  );
}
