import { useRef, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AnimatedHeading, useEntrance, usePointerVars } from './motion';
import { AmbientField } from './AmbientField';
import { DecodeOnce } from './Decode';
import { breadcrumbs, type PageMeta } from '../lib/pages';
import { useCatalog, useRoutes, useLocale } from '../i18n';
import { appointmentLink } from '../lib/appointment-link';
import { imageUrl, imageWidths } from '../lib/images';
import { clientPhotos } from '../content/client-photos';
import { equipmentMedia } from '../content/equipment-media';
import { licensedPhotos } from '../content/licensed-photos';

export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const phase = useEntrance(ref);
  return (
    <div
      ref={ref}
      className={className}
      data-reveal={phase}
      style={{ '--reveal-delay': `${delay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}

export function Photo({
  name,
  alt,
  className = '',
  eager = false,
  sizes = '(max-width: 700px) 100vw, 55vw',
}: {
  name: string;
  alt: string;
  className?: string;
  eager?: boolean;
  sizes?: string;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const phase = useEntrance(ref);
  const widths = imageWidths(name);
  const { ui } = useCatalog();
  // Credits are listed in the legal notice, not printed on the pictures.
  const metadata = clientPhotos[name] ?? equipmentMedia[name] ?? licensedPhotos[name];
  const picture = (
    <img
      ref={ref}
      data-photo-reveal={phase}
      className={`photo ${className}`}
      data-image={name}
      data-media-kind={equipmentMedia[name]?.kind}
      src={imageUrl(name, widths[Math.min(1, widths.length - 1)])}
      srcSet={widths.map((w) => `${imageUrl(name, w)} ${w}w`).join(', ')}
      sizes={sizes}
      alt={alt && metadata ? (ui.htmlLang === 'fr' ? metadata.altFr : metadata.altEn) : alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      width={metadata?.width ?? 1536}
      height={metadata?.height ?? 1024}
      decoding="async"
      // An image that cannot load leaves its frame's background, never a broken-image icon.
      onError={(event) => event.currentTarget.setAttribute('data-failed', '')}
    />
  );
  return picture;
}

/** Every image is in place from the start, so changing the active one is a pure crossfade:
 *  nothing is mounted or downloaded at the moment the visitor moves on. */
export function PhotoStack({
  items,
  active,
  sizes,
  className = '',
}: {
  items: { image: string; alt: string }[];
  active: number;
  sizes: string;
  className?: string;
}) {
  return (
    <div className={`photo-stack ${className}`}>
      {items.map((item, i) => (
        <div
          key={`${item.image}-${i}`}
          className="photo-stack-layer"
          data-active={i === active || undefined}
          aria-hidden={i === active ? undefined : true}
        >
          <Photo name={item.image} alt={item.alt} sizes={sizes} />
        </div>
      ))}
    </div>
  );
}

export function Button({
  to,
  href,
  children,
  variant = 'primary',
  className = '',
}: {
  to?: string;
  /** External destination, opened in a new tab. */
  href?: string;
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'light' | 'ghost';
  className?: string;
}) {
  const classes = `button button-${variant} ${className}`;
  const { ui } = useCatalog();
  const r = useRoutes();
  return href ? (
    <a className={classes} href={href} target="_blank" rel="noreferrer">
      {children}
      <span className="sr-only">{ui.common.newTab}</span>
    </a>
  ) : (
    <Link className={classes} to={to ?? r.contact}>
      {children}
    </Link>
  );
}

/** The two ways to start a project: a quote request and a booked call. */
export function ProjectActions({ light = false }: { light?: boolean }) {
  const { copy } = useCatalog();
  const locale = useLocale();
  return (
    <div className="project-actions">
      <Button variant={light ? 'light' : 'primary'}>{copy.labels.quote}</Button>
      <Button href={appointmentLink(locale)} variant={light ? 'ghost' : 'outline'}>
        {copy.labels.appointment}
      </Button>
    </div>
  );
}

/** A card that leans towards the pointer under a soft light, its picture settling in. */
export function TiltLink({
  to,
  className = '',
  children,
}: {
  to: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  usePointerVars(ref, 5);
  return (
    <Link ref={ref} to={to} className={`tilt ${className}`}>
      {children}
      <span className="tilt-light" aria-hidden="true" />
    </Link>
  );
}

export function TextLink({
  to,
  children,
  className = '',
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link to={to} className={`text-link ${className}`}>
      {children}
    </Link>
  );
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`eyebrow ${light ? 'eyebrow-light' : ''}`}>{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  link,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  link?: { to: string; label: string };
}) {
  return (
    <div className="section-heading">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <AnimatedHeading className="display-small" text={title} />
      </div>
      <Reveal className="section-heading-aside" delay={0.12}>
        {body && <p>{body}</p>}
        {link && <TextLink to={link.to}>{link.label}</TextLink>}
      </Reveal>
    </div>
  );
}

export function Breadcrumbs({ meta }: { meta: PageMeta }) {
  const { ui } = useCatalog();
  return (
    <nav aria-label={ui.common.breadcrumb} className="breadcrumbs">
      {breadcrumbs(meta).map((c, i, arr) => (
        <span key={c.path}>
          {i > 0 && (
            <span className="crumb-separator" aria-hidden="true">
              /
            </span>
          )}
          {i === arr.length - 1 ? (
            <span aria-current="page">{c.name}</span>
          ) : (
            <Link to={c.path}>{c.name}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHero({
  meta,
  eyebrow,
  title,
  intro,
  image,
  dark = false,
}: {
  meta: PageMeta;
  eyebrow: string;
  title: string;
  intro?: string;
  image?: string;
  dark?: boolean;
}) {
  return (
    <section
      className={`page-hero ${image ? 'page-hero-split' : ''} ${dark ? 'page-hero-dark' : ''}`}
    >
      {/* A page without a picture gets the slow helix of the site behind its title. */}
      {!image && <AmbientField tone={dark ? 'dark' : 'light'} className="page-hero-field" />}
      <div className="container">
        <Breadcrumbs meta={meta} />
        <div className="page-hero-grid">
          <div className="page-hero-copy intro-copy">
            <Eyebrow light={dark}>
              <DecodeOnce text={eyebrow} play delay={350} />
            </Eyebrow>
            <AnimatedHeading as="h1" text={title} intro />
            {intro && <p className="lead">{intro}</p>}
            {image && <ProjectActions light={dark} />}
          </div>
          {image && (
            <div className="page-hero-image intro-image">
              <Photo
                name={image}
                alt={meta.label}
                eager
                sizes={
                  ['bioinformatique-client', 'terrain-kayak', 'dpcr-operateur'].includes(image)
                    ? '(max-width: 700px) 90vw, 380px'
                    : undefined
                }
              />
              <span className="page-hero-sheen" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function FinalCTA() {
  const { copy, company, ui } = useCatalog();
  return (
    <section className="final-cta">
      <AmbientField lane="bottom" className="final-cta-field" />
      <div className="container">
        <div className="cta-inner">
          <div>
            <Eyebrow>{copy.cta.eyebrow}</Eyebrow>
            <AnimatedHeading text={copy.cta.title} />
          </div>
          <Reveal delay={0.15}>
            <p>{copy.cta.body}</p>
            <ProjectActions />
            <p className="cta-email">
              {ui.common.orWrite} <a href={`mailto:${company.email}`}>{company.email}</a>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
