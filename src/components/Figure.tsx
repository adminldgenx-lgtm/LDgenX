import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../i18n';
import { imageUrl } from '../lib/images';
import { Photo } from './ui';

/** A published scientific figure with its caption. The picture opens at full size in a new tab,
 *  so the small print of a chart stays readable. */
export function Figure({
  image,
  alt,
  caption,
  legend,
  className = '',
  sizes = '(max-width: 800px) 92vw, 60vw',
}: {
  image: string;
  alt: string;
  caption: ReactNode;
  legend?: string;
  className?: string;
  sizes?: string;
}) {
  const { ui } = useCatalog();
  return (
    <figure className={`sci-figure ${className}`}>
      <a className="sci-figure-frame" href={imageUrl(image)} target="_blank" rel="noreferrer">
        <Photo name={image} alt={alt} sizes={sizes} />
        <span className="sr-only">
          {ui.common.figure}
          {ui.common.newTab}
        </span>
      </a>
      <figcaption>
        {legend && (
          <span className="sci-figure-legend">
            <RichText text={legend} />
          </span>
        )}
        <span className="sci-figure-caption">{caption}</span>
      </figcaption>
    </figure>
  );
}

/** Text as published, with its [links](url) and *italics* (Latin names, journal titles). */
export function RichText({ text }: { text: string }) {
  const { ui } = useCatalog();
  const parts: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*([^*]+)\*/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const at = match.index ?? 0;
    if (at > last) parts.push(text.slice(last, at));
    if (match[3]) parts.push(<em key={at}>{match[3]}</em>);
    else if (match[2].startsWith('/'))
      parts.push(
        <Link key={at} to={match[2]}>
          {match[1]}
        </Link>,
      );
    else
      parts.push(
        <a key={at} href={match[2]} target="_blank" rel="noreferrer">
          <RichText text={match[1]} />
          <span className="sr-only">{ui.common.newTab}</span>
        </a>,
      );
    last = at + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>{part}</Fragment>
      ))}
    </>
  );
}
