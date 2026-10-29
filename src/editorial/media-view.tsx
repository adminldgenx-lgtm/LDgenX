import { useState, type CSSProperties } from "react";
import { Play } from "lucide-react";
import {
  videoEmbed,
  type ContentImage,
  type EditorialMedia,
  type ContentNode,
} from "../../supabase/functions/_shared/editorial";

export function MediaImage({
  image,
  media,
  className = "",
  eager = false,
  sizes = "(max-width: 800px) 94vw, 960px",
}: {
  image: ContentImage;
  media?: EditorialMedia | null;
  className?: string;
  eager?: boolean;
  sizes?: string;
}) {
  const variants =
    media?.variants.slice().sort((a, b) => a.width - b.width) ?? [];
  const main = variants.at(-1);
  const src = image.staticSrc || (main ? media?.urls[String(main.width)] : "");
  if (!src) return null;
  return (
    <img
      className={className}
      src={src}
      srcSet={
        variants.length > 1
          ? variants
              .map((v) => `${media?.urls[String(v.width)]} ${v.width}w`)
              .join(", ")
          : undefined
      }
      sizes={sizes}
      alt={image.alt}
      width={main?.width}
      height={main?.height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : undefined}
    />
  );
}
export function ContentVideo({
  node,
  media = [],
  locale = "fr",
}: {
  node: ContentNode;
  media?: EditorialMedia[];
  locale?: string;
}) {
  const a = node.attrs ?? {},
    [play, setPlay] = useState(false);
  const uploaded = media.find((m) => m.id === a.mediaId);
  const poster = media.find((m) => m.id === a.posterId);
  const title = String(a.title ?? ""),
    caption = String(a.caption ?? ""),
    transcript = String(a.transcript ?? "");
  const source = uploaded ? Object.values(uploaded.urls)[0] : "";
  let embed = "";
  if (a.url) {
    try {
      embed = videoEmbed(String(a.url)).url;
    } catch {
      /* Invalid remote source is never embedded. */
    }
  }
  return (
    <figure className="cms-video">
      {source ? (
        <video
          controls
          preload="none"
          playsInline
          poster={poster ? Object.values(poster.urls).at(-1) : undefined}
          aria-label={title}
        >
          <source src={source} type={uploaded?.variants[0]?.mime} />
          <a href={source}>{title}</a>
        </video>
      ) : embed ? (
        <div
          className="cms-video-frame"
          style={{ aspectRatio: "16/9" } as CSSProperties}
        >
          {play ? (
            <iframe
              src={embed}
              title={title}
              allow="fullscreen; picture-in-picture"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-presentation"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlay(true)}
              aria-label={`${locale === "fr" ? "Lire" : "Play"} : ${title}`}
            >
              <Play size={36} aria-hidden="true" />
              <strong>{title}</strong>
              <span>
                {locale === "fr"
                  ? "Charger le lecteur vidéo externe"
                  : "Load the external video player"}
              </span>
            </button>
          )}
        </div>
      ) : null}
      {(title || caption) && (
        <figcaption>
          <strong>{title}</strong>
          {caption && <p>{caption}</p>}
        </figcaption>
      )}
      {transcript && (
        <details>
          <summary>
            {locale === "fr"
              ? "Transcription / description"
              : "Transcript / description"}
          </summary>
          <p>{transcript}</p>
        </details>
      )}
    </figure>
  );
}
