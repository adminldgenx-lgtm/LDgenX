import { useItemDocument } from "./context";
import { DocumentBody } from "./PublicDocument";

/** Text, figures and videos added to a page, under its template's own sections. */
export function PageWriting({ path }: { path: string }) {
  const content = useItemDocument(path);
  if (
    !content ||
    !(content.document.body.content ?? []).some(
      (n) => n.type !== "paragraph" || n.content?.length,
    )
  )
    return null;
  return (
    <section className="section-space cms-page-writing">
      <div className="container cms-document-body">
        <DocumentBody
          body={content.document.body}
          media={content.media}
          locale={content.locale}
        />
        {content.document.references.length > 0 && (
          <div className="cms-references">
            <h2>
              {content.locale === "fr"
                ? "Sources & références"
                : "Sources & references"}
            </h2>
            <ol>
              {content.document.references.map((r, i) => (
                <li key={i}>
                  {r.url ? <a href={r.url}>{r.label}</a> : r.label}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
