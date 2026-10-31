import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PageContent } from "../../App";
import { getPage } from "../../lib/pages";
import { EditorialProvider } from "../../editorial/context";
import { editorialMeta } from "../../editorial/meta";
import type { PublishedDocument } from "../../../supabase/functions/_shared/editorial";

/** The real page template, in a frame so the public stylesheet cannot restyle the administration. */
export default function PagePreview({
  content,
}: {
  content: PublishedDocument;
}) {
  const [html, setHtml] = useState(""),
    [root, setRoot] = useState<HTMLElement | null>(null),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    void fetch("/")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.text();
      })
      .then((text) => {
        const doc = new DOMParser().parseFromString(text, "text/html");
        const urls = Array.from(
          doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
        )
          .map((l) => new URL(l.getAttribute("href")!, window.location.origin))
          .filter(
            (u) =>
              u.origin === window.location.origin &&
              u.pathname.startsWith("/assets/") &&
              u.pathname.endsWith(".css"),
          );
        const inlineStyles = Array.from(doc.head.querySelectorAll("style"))
          .map((style) => style.outerHTML)
          .join("");
        if (!urls.length && !inlineStyles) throw new Error();
        const styles = inlineStyles + urls
          .map(
            (u) =>
              '<link rel="stylesheet" href="' +
              u.href.replaceAll("&", "&amp;").replaceAll('"', "&quot;") +
              '">',
          )
          .join("");
        if (alive)
          setHtml(
            '<!doctype html><html lang="' +
              content.locale +
              '"><head><meta name="viewport" content="width=device-width, initial-scale=1">' +
              styles +
              '</head><body><div id="preview-root"></div></body></html>',
          );
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [content.locale]);
  if (failed)
    return (
      <p role="alert">
        {content.locale === "fr"
          ? "L’aperçu de la page n’a pas pu être chargé. Fermez puis réessayez."
          : "The page preview could not load. Close it and retry."}
      </p>
    );
  if (!html)
    return (
      <p role="status">
        {content.locale === "fr"
          ? "Chargement de la présentation…"
          : "Loading page layout…"}
      </p>
    );
  return (
    <>
      <iframe
        title={
          content.locale === "fr"
            ? "Aperçu privé de la page"
            : "Private page preview"
        }
        className="cms-page-preview-frame"
        srcDoc={html}
        onLoad={(e) =>
          setRoot(
            e.currentTarget.contentDocument?.getElementById("preview-root") ??
              null,
          )
        }
      />
      {root &&
        createPortal(
          <EditorialProvider
            preview
            initial={{ index: [content], document: content }}
          >
            <div
              onClickCapture={(e) => {
                if ((e.target as HTMLElement).closest("a")) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              onSubmitCapture={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <PageContent
                meta={
                  content.kind === "page"
                    ? getPage(content.path)
                    : editorialMeta(content, [content])
                }
              />
            </div>
          </EditorialProvider>,
          root,
        )}
    </>
  );
}
