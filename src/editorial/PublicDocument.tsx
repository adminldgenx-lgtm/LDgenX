import { Fragment, useEffect, type ReactNode } from "react";
import { ContentVideo, MediaImage } from "./media-view";
import { useEditorial } from "./context";
import { largestUrl } from "./meta";
import type {
  ContentNode,
  ContentImage,
  EditorialMedia,
  EditorialSummary,
} from "../../supabase/functions/_shared/editorial";

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
      const full = img.staticSrc ?? largestUrl(asset);
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
    default:
      return null;
  }
}
/** Formatted text laid straight into a template, which brings its own typography. */
export function RichNodes({
  nodes,
  media = [],
  locale = "fr",
}: {
  nodes: ContentNode[];
  media?: EditorialMedia[];
  locale?: string;
}) {
  return <>{nodes.map((node, i) => richNode(node, media, locale, i))}</>;
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
/** A published item takes its page template once its text has arrived. A built-in item already
 *  has one to show meanwhile; the server sends the text with the page, so nothing waits there. */
export function PublishedPage({
  row,
  children,
}: {
  row: EditorialSummary;
  children: ReactNode;
}) {
  const state = useEditorial(),
    content = state.documents[row.path],
    failure = state.failures[row.path];
  useEffect(() => {
    if (!content) state.load(row.path);
  }, [row.path, content]);
  if (content || row.legacyId) return <>{children}</>;
  return (
    <section className="container cms-loading" aria-live="polite">
      <h1>{row.title.replace(/\*/g, "")}</h1>
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
