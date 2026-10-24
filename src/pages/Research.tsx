import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Copy, Search, X } from 'lucide-react';
import type { ResearchFeatured, ResearchPublication } from '../content/types';
import { useCatalog, useRoutes } from '../i18n';
import { type PageMeta } from '../lib/pages';
import { Breadcrumbs, Eyebrow, FinalCTA, PageHero, Reveal, TextLink } from '../components/ui';
import { AmbientField } from '../components/AmbientField';
import { AnimatedHeading, useNearViewport, useSeen } from '../components/motion';
import { DecodeOnce } from '../components/Decode';
import { Figure, RichText } from '../components/Figure';

/** A title marked for display (*Latin names*), as plain text. */
export const plainTitle = (text: string) => text.replace(/\*/g, '');

/* "Recherche & publications": the articles co-written by the team. Three topics are put
   forward with charts drawn only from values stated in their published abstracts; the
   catalogue lists every reference with search and filters kept in the address, so a filtered
   list can be shared. Each article has a page of its own, with its summary and reference. */

const PARAMS = ['q', 'theme', 'author', 'year', 'expertise'] as const;

/** The address of the research page with the given query. */
export function researchLink(base: string, query: Record<string, string>) {
  const search = new URLSearchParams(query).toString();
  return search ? `${base}?${search}` : base;
}

/** The query, read only after hydration: the prerendered page is the unfiltered list. */
function useResearchQuery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const params = ready ? searchParams : new URLSearchParams();
  return { params, setSearchParams };
}

export function ResearchPage({ meta }: { meta: PageMeta }) {
  const { research, ui } = useCatalog();
  const t = ui.research;
  const r = useRoutes();
  const navigate = useNavigate();
  const { params, setSearchParams } = useResearchQuery();
  const legacy = params.get('publication');
  useEffect(() => {
    if (legacy && research.publications.some((p) => p.id === legacy))
      navigate(r.publication(legacy), { replace: true });
  }, [legacy, research.publications, navigate, r]);

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setSearchParams(next, { replace: true, preventScrollReset: true });
  };

  return (
    <>
      <PageHero meta={meta} eyebrow={t.eyebrow} title={t.title} intro={t.intro} />
      <FeaturedResearch items={research.featured} />
      <Catalogue params={params} update={update} />
      <section className="section-space research-distinct">
        <div className="container detail-intro">
          <div>
            <Eyebrow>{t.distinctEyebrow}</Eyebrow>
            <AnimatedHeading text={t.distinctTitle} />
          </div>
          <Reveal>
            <p>{t.distinct}</p>
            <div className="person-links">
              <TextLink to={r.innovations}>{t.seeRd}</TextLink>
              <TextLink to={r.studies}>{t.seeStudies}</TextLink>
            </div>
          </Reveal>
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

/* ----------------------------------------------------------------------------------------- */
/* Featured topics                                                                           */
/* ----------------------------------------------------------------------------------------- */

function FeaturedResearch({ items }: { items: ResearchFeatured[] }) {
  const { research, services, ui } = useCatalog();
  const r = useRoutes();
  const t = ui.research;
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (event: KeyboardEvent) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (active + step + items.length) % items.length;
    setActive(next);
    tabs.current[next]?.focus();
  };
  const item = items[active];
  const publication = research.publications.find((p) => p.id === item.publication)!;
  const service = services.find((s) => s.id === publication.services[0]);
  return (
    <section className="section-space research-featured" aria-label={t.featuredEyebrow}>
      <div className="container">
        <div className="research-featured-head">
          <div>
            <Eyebrow>{t.featuredEyebrow}</Eyebrow>
            <AnimatedHeading text={t.featuredTitle} />
          </div>
          <div className="research-topics" role="tablist" aria-label={t.featuredLabel}>
            {items.map((f, i) => (
              <button
                key={f.publication}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`topic-tab-${i}`}
                aria-selected={i === active}
                aria-controls="topic-panel"
                tabIndex={i === active ? 0 : -1}
                className="research-topic"
                onClick={() => setActive(i)}
                onKeyDown={onKey}
              >
                <span className="research-topic-label">{f.label}</span>
                <span className="research-topic-species">{f.species}</span>
              </button>
            ))}
          </div>
        </div>
        <div
          id="topic-panel"
          role="tabpanel"
          aria-labelledby={`topic-tab-${active}`}
          className="research-topic-panel"
        >
          <div className="research-topic-inner" key={item.publication}>
            <div className="research-topic-text">
              <p className="research-topic-kicker">
                {item.species} · {publication.journal}, {publication.year}
              </p>
              <h3>{publication.question}</h3>
              <ol className="research-steps">
                {item.steps.map((s, i) => (
                  <li key={s.label} style={{ '--i': i } as CSSProperties}>
                    <strong>{s.value}</strong>
                    <span>{s.label}</span>
                  </li>
                ))}
              </ol>
              <div className="research-topic-actions">
                <Link className="button button-primary" to={r.publication(publication.id)}>
                  {t.readSummary}
                </Link>
                {service && <TextLink to={r.service(service.id)}>{service.title}</TextLink>}
              </div>
            </div>
            <figure className="research-chart">
              <figcaption className="research-chart-title">{item.chartTitle}</figcaption>
              <ResearchChart item={item} />
              <p className="research-chart-note">
                <span className="research-chart-source">
                  {`${t.chartSource}${ui.lang === 'fr' ? '\u00a0: ' : ': '}${publication.authors[0]} et al. (${publication.year}), ${publication.journal}.`}
                </span>
              </p>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResearchChart({ item }: { item: ResearchFeatured }) {
  const chart = item.chart;
  if (chart.kind === 'panel') return <PanelChart total={chart.total} selected={chart.selected} />;
  if (chart.kind === 'survival') return <SurvivalChart groups={chart.groups} />;
  return <RegionsChart bars={chart.bars} shared={chart.shared} common={chart.common} />;
}

/** One dot per SNP, the kept ones lighting up: the counts are the article's, the layout is not. */
function PanelChart({ total, selected }: { total: number; selected: number }) {
  const { ui } = useCatalog();
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useNearViewport(canvas, '0px');
  const format = new Intl.NumberFormat(ui.htmlLang);
  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!element || !context) return;
    const box = element.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    element.width = Math.round(box.width * ratio);
    element.height = Math.round(box.height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const columns = Math.round(Math.sqrt((total * box.width) / box.height));
    const rows = Math.ceil(total / columns);
    const cell = Math.min(box.width / columns, box.height / rows);
    const offsetX = (box.width - cell * columns) / 2;
    // The kept SNPs are scattered evenly: one per cell of a coarse grid, at a seeded random
    // place within it, so they read as spread across the genome rather than in rows.
    let seed = 192;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const cellsX = Math.round(Math.sqrt((selected * columns) / rows));
    const cellsY = Math.ceil(selected / cellsX);
    const kept = new Set(
      Array.from({ length: selected }, (_, k) => {
        const column = Math.floor(((k % cellsX) + random()) * (columns / cellsX));
        const row = Math.floor((Math.floor(k / cellsX) + random()) * (rows / cellsY));
        return Math.min(total - 1, row * columns + column);
      }),
    );
    const draw = (progress: number) => {
      context.clearRect(0, 0, box.width, box.height);
      for (let i = 0; i < total; i++) {
        const x = offsetX + (i % columns) * cell + cell / 2;
        const y = Math.floor(i / columns) * cell + cell / 2;
        const isKept = kept.has(i);
        const fade = isKept ? Math.min(1, Math.max(0, progress * 1.6 - 0.4)) : 0;
        context.fillStyle =
          isKept && fade > 0 ? `rgba(95, 158, 31, ${0.35 + fade * 0.65})` : 'rgba(3, 37, 75, 0.16)';
        const size = isKept ? cell * (0.42 + fade * 0.55) : cell * 0.34;
        context.beginPath();
        context.arc(x, y, size / 1.6, 0, Math.PI * 2);
        context.fill();
      }
    };
    if (!live) {
      draw(0);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const progress = Math.min(1, (now - start) / 1600);
      draw(1 - (1 - progress) ** 3);
      if (progress < 1) frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [total, selected, live]);
  return (
    <div className="panel-chart">
      <canvas ref={canvas} className="panel-chart-canvas" aria-hidden="true" />
      <p className="panel-chart-legend">
        <span className="panel-chart-key" data-kind="all" aria-hidden="true" />
        {format.format(total)} SNP
        <span className="panel-chart-key" data-kind="kept" aria-hidden="true" />
        {format.format(selected)} SNP
      </p>
    </div>
  );
}

/** Survival by genotype, from the abstract: two populations, two genotypes, in percent. */
function SurvivalChart({
  groups,
}: {
  groups: { label: string; susceptible: number; resistant: number }[];
}) {
  const { ui } = useCatalog();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useSeen(ref);
  const fr = ui.lang === 'fr';
  const percent = (n: number) =>
    `${new Intl.NumberFormat(ui.htmlLang, { maximumFractionDigits: 1 }).format(n)}${fr ? ' %' : '%'}`;
  const names = fr
    ? { susceptible: 'Génotype sensible', resistant: 'Génotype résistant', axis: 'Survie (%)' }
    : {
        susceptible: 'Susceptible genotype',
        resistant: 'Resistant genotype',
        axis: 'Survival (%)',
      };
  return (
    <div ref={ref} className="bar-chart" data-seen={seen || undefined}>
      <div className="bar-chart-plot" aria-hidden="true">
        {[0, 25, 50, 75, 100].map((v) => (
          <span key={v} className="bar-chart-grid" style={{ '--v': v / 100 } as CSSProperties}>
            <span>{v}</span>
          </span>
        ))}
        {groups.map((g, gi) => (
          <div key={g.label} className="bar-chart-group">
            {(['susceptible', 'resistant'] as const).map((kind, ki) => (
              <div
                key={kind}
                className="bar-chart-bar"
                data-kind={kind}
                style={{ '--v': g[kind] / 100, '--i': gi * 2 + ki } as CSSProperties}
              >
                <span className="bar-chart-value">{percent(g[kind])}</span>
              </div>
            ))}
            <span className="bar-chart-label">{g.label}</span>
          </div>
        ))}
      </div>
      <p className="bar-chart-legend" aria-hidden="true">
        <span className="bar-chart-key" data-kind="susceptible" />
        {names.susceptible}
        <span className="bar-chart-key" data-kind="resistant" />
        {names.resistant}
        <span className="bar-chart-axis">{names.axis}</span>
      </p>
      <table className="sr-only">
        <thead>
          <tr>
            <th scope="col">{names.axis}</th>
            <th scope="col">{names.susceptible}</th>
            <th scope="col">{names.resistant}</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={g.label}>
              <th scope="row">{g.label}</th>
              <td>{percent(g.susceptible)}</td>
              <td>{percent(g.resistant)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Regions detected by each analysis design, and how few they share, from the abstract. */
function RegionsChart({
  bars,
  shared,
  common,
}: {
  bars: { label: string; value: number }[];
  shared: number;
  common: number;
}) {
  const { ui } = useCatalog();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useSeen(ref);
  const max = 50;
  const fr = ui.lang === 'fr';
  return (
    <div ref={ref} className="regions-chart" data-seen={seen || undefined}>
      <dl className="regions-bars">
        {bars.map((b, i) => (
          <div key={b.label} style={{ '--v': b.value / max, '--i': i } as CSSProperties}>
            <dt>{b.label}</dt>
            <dd>
              <span className="regions-bar" aria-hidden="true" />
              <span className="regions-value">
                <DecodeOnce text={String(b.value)} play={seen} delay={300 + i * 160} />{' '}
                {fr ? 'régions' : 'regions'}
              </span>
            </dd>
          </div>
        ))}
      </dl>
      <div className="regions-overlap">
        <p>
          <strong>{shared}</strong>
          {fr ? 'partagées par au moins deux analyses' : 'shared by at least two analyses'}
        </p>
        <p>
          <strong>{common}</strong>
          {fr ? 'commune aux trois analyses' : 'common to all three analyses'}
        </p>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------------------- */
/* Catalogue                                                                                 */
/* ----------------------------------------------------------------------------------------- */

const fold = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function Catalogue({
  params,
  update,
}: {
  params: URLSearchParams;
  update: (changes: Record<string, string | null>) => void;
}) {
  const { research, people, services, ui } = useCatalog();
  const t = ui.research;
  const [preview, setPreview] = useState<string | null>(null);
  const query = params.get('q') ?? '';
  const theme = params.get('theme');
  const author = params.get('author');
  const year = params.get('year');
  const expertise = params.get('expertise');
  const [draft, setDraft] = useState(query);
  useEffect(() => setDraft(query), [query]);

  const authors = people.filter((p) => research.publications.some((x) => x.members.includes(p.id)));
  const years = [...new Set(research.publications.map((p) => p.year))].sort((a, b) => b - a);
  const themes = Object.keys(t.themes);
  const expertiseTitle = services.find((s) => s.id === expertise)?.title;

  const items = useMemo(() => {
    const needle = fold(query.trim());
    return research.publications.filter(
      (p) =>
        (!theme || p.themes.includes(theme)) &&
        (!author || p.members.includes(author)) &&
        (!year || String(p.year) === year) &&
        (!expertise || p.services.includes(expertise)) &&
        (!needle ||
          fold(
            [p.readingTitle, p.title, p.journal, p.authors.join(' '), p.summary].join(' '),
          ).includes(needle)),
    );
  }, [research.publications, query, theme, author, year, expertise]);
  const filtered = PARAMS.some((key) => params.get(key));
  const signature = PARAMS.map((key) => params.get(key) ?? '').join('|');

  return (
    <section className="section-space research-catalogue" aria-labelledby="catalogue-title">
      <div className="container">
        <Eyebrow>{t.catalogEyebrow}</Eyebrow>
        <AnimatedHeading text={t.catalogTitle} />
        <h2 id="catalogue-title" className="sr-only">
          {t.catalogEyebrow}
        </h2>
        <div className="research-filters" role="group" aria-label={t.filtersLabel}>
          <form
            className="research-search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              update({ q: draft.trim() || null });
            }}
          >
            <label>
              <span className="sr-only">{t.searchLabel}</span>
              <input
                type="search"
                value={draft}
                placeholder={t.search}
                onChange={(e) => {
                  setDraft(e.target.value);
                  update({ q: e.target.value.trim() || null });
                }}
              />
              <Search size={16} aria-hidden="true" />
            </label>
          </form>
          <div className="research-filter-row">
            <span className="research-filter-name">{t.theme}</span>
            <div className="research-chips" onPointerLeave={() => setPreview(null)}>
              <button type="button" aria-pressed={!theme} onClick={() => update({ theme: null })}>
                {t.allThemes}
              </button>
              {themes.map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={theme === id}
                  onClick={() => update({ theme: theme === id ? null : id })}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && setPreview(id)}
                  onFocus={() => setPreview(id)}
                  onBlur={() => setPreview(null)}
                >
                  {t.themes[id]}
                </button>
              ))}
            </div>
          </div>
          <div className="research-filter-row research-filter-pair">
            <div>
              <span className="research-filter-name">{t.author}</span>
              <div className="research-chips">
                <button
                  type="button"
                  aria-pressed={!author}
                  onClick={() => update({ author: null })}
                >
                  {t.allAuthors}
                </button>
                {authors.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={author === p.id}
                    onClick={() => update({ author: author === p.id ? null : p.id })}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            <label className="research-year">
              <span className="research-filter-name">{t.year}</span>
              <select value={year ?? ''} onChange={(e) => update({ year: e.target.value || null })}>
                <option value="">{t.allYears}</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {(expertiseTitle || filtered) && (
            <div className="research-active">
              {expertiseTitle && (
                <button
                  type="button"
                  className="research-active-chip"
                  onClick={() => update({ expertise: null })}
                >
                  {`${t.expertise}${ui.lang === 'fr' ? '\u00a0: ' : ': '}${expertiseTitle}`}
                  <X size={14} aria-hidden="true" />
                  <span className="sr-only">{t.removeFilter}</span>
                </button>
              )}
              {filtered && (
                <button
                  type="button"
                  className="research-reset"
                  onClick={() => update(Object.fromEntries(PARAMS.map((key) => [key, null])))}
                >
                  {t.reset}
                </button>
              )}
            </div>
          )}
        </div>
        <p className="research-count" aria-live="polite">
          {t.count(items.length)}
        </p>
        {items.length ? (
          <ol className="research-list" key={signature} data-preview={preview || undefined}>
            {items.map((p, i) => (
              <PublicationCard
                key={p.id}
                publication={p}
                index={i}
                dim={Boolean(preview) && !p.themes.includes(preview!)}
              />
            ))}
          </ol>
        ) : (
          <div className="research-empty">
            <p>{t.empty}</p>
            <button
              type="button"
              className="button button-outline"
              onClick={() => update(Object.fromEntries(PARAMS.map((key) => [key, null])))}
            >
              {t.reset}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/** Authors as published, team members marked. Long lists are shortened unless `full`. */
export function AuthorLine({
  publication,
  full = false,
}: {
  publication: ResearchPublication;
  full?: boolean;
}) {
  const { people, ui } = useCatalog();
  const surnames = people
    .filter((p) => publication.members.includes(p.id))
    .map((p) => p.name.split(' ').pop()!);
  const shown =
    full || publication.authors.length <= 6 ? publication.authors : publication.authors.slice(0, 5);
  return (
    <span className="author-line">
      {shown.map((a, i) => {
        const member = surnames.some((s) => a.startsWith(s));
        return (
          <span key={a}>
            {i > 0 && ', '}
            {member ? <strong title={ui.research.member}>{a}</strong> : a}
          </span>
        );
      })}
      {shown.length < publication.authors.length && ', et al.'}
    </span>
  );
}

function PublicationCard({
  publication: p,
  index,
  dim,
}: {
  publication: ResearchPublication;
  index: number;
  dim: boolean;
}) {
  const { ui } = useCatalog();
  const r = useRoutes();
  const t = ui.research;
  return (
    <li
      className="research-card"
      data-dim={dim || undefined}
      style={{ '--i': Math.min(index, 10) } as CSSProperties}
    >
      <div className="research-card-meta">
        <span className="research-card-year">{p.year}</span>
        <span>{p.journal}</span>
        {p.type === 'review' && <span className="research-card-badge">{t.review}</span>}
      </div>
      <div className="research-card-body">
        <h3 lang="en">
          <Link className="research-card-open" to={r.publication(p.id)}>
            <RichText text={p.readingTitle} />
          </Link>
        </h3>
        <p className="research-card-authors">
          <AuthorLine publication={p} />
        </p>
        {p.themes.length > 0 && (
          <ul className="research-card-themes" aria-label={t.theme}>
            {p.themes.map((id) => (
              <li key={id}>{t.themes[id]}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="research-card-actions">
        <Link className="research-card-read" to={r.publication(p.id)} tabIndex={-1}>
          {t.readSummary}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noreferrer">
          DOI
          <ArrowUpRight size={14} aria-hidden="true" />
          <span className="sr-only">
            {' '}
            {p.doi}
            {ui.common.newTab}
          </span>
        </a>
      </div>
    </li>
  );
}

/* ----------------------------------------------------------------------------------------- */
/* Publication page                                                                          */
/* ----------------------------------------------------------------------------------------- */

/** The reference of an article, as it is cited. */
export function citation(p: ResearchPublication) {
  const authors =
    p.authors.length > 6 ? `${p.authors.slice(0, 6).join(', ')}, et al.` : p.authors.join(', ');
  return `${authors} (${p.year}). ${p.title}. ${p.journal}, ${p.issue}. https://doi.org/${p.doi}`;
}

/** One article of the team: its summary, the points to remember, its figures and reference. */
export function PublicationPage({ meta }: { meta: PageMeta }) {
  const { research, people, services, ui } = useCatalog();
  const r = useRoutes();
  const t = ui.research;
  const p = research.publications.find((x) => x.id === meta.id)!;
  const [copied, setCopied] = useState(false);
  const related = services.filter((s) => p.services.includes(s.id));
  const members = people.filter((person) => p.members.includes(person.id));
  // Other articles sharing a theme, newest first.
  const others = research.publications
    .filter((x) => x.id !== p.id && x.themes.some((theme) => p.themes.includes(theme)))
    .slice(0, 3);
  const online =
    p.online &&
    new Intl.DateTimeFormat(ui.htmlLang, { day: 'numeric', month: 'long', year: 'numeric' }).format(
      new Date(p.online),
    );
  return (
    <>
      <section className="publication-hero">
        <AmbientField className="page-hero-field" />
        <div className="container publication-hero-inner">
          <Breadcrumbs meta={meta} />
          <p className="publication-kicker">
            {p.journal} · {p.year}
            {online && ` · ${t.online} ${online}`}
            {p.type === 'review' && ` · ${t.review}`}
          </p>
          <h1 className="publication-title" lang="en">
            <RichText text={p.readingTitle} />
          </h1>
          <p className="publication-authors">
            <AuthorLine publication={p} full />
          </p>
          {p.authorNote && <p className="research-panel-note">{p.authorNote}</p>}
          <div className="publication-links-row">
            <a
              className="button button-primary"
              href={`https://doi.org/${p.doi}`}
              target="_blank"
              rel="noreferrer"
            >
              {t.readArticle}
              <ArrowUpRight size={16} aria-hidden="true" />
              <span className="sr-only">{ui.common.newTab}</span>
            </a>
            {p.preprint && (
              <a className="text-link" href={p.preprint} target="_blank" rel="noreferrer">
                {t.preprint}
                <span className="sr-only">{ui.common.newTab}</span>
              </a>
            )}
            {p.links.map((l) => (
              <a key={l.url} className="text-link" href={l.url} target="_blank" rel="noreferrer">
                {l.label}
                <span className="sr-only">{ui.common.newTab}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
      <section className="section-space publication-body">
        <div className="container publication-layout">
          <div className="publication-main">
            <Reveal>
              <p className="publication-summary">{p.summary}</p>
            </Reveal>
            <dl className="research-panel-points publication-points">
              {(
                [
                  [t.question, p.question],
                  [t.approach, p.approach],
                  [t.finding, p.finding],
                  [t.limit, p.limit],
                ] as const
              ).map(([label, text], i) => (
                <Reveal key={label} delay={i * 0.06}>
                  <div data-kind={i === 3 ? 'limit' : undefined}>
                    <dt>{label}</dt>
                    <dd>{text}</dd>
                  </div>
                </Reveal>
              ))}
            </dl>
            <section className="research-panel-figures" aria-label={t.figures}>
              <h2>{t.figures}</h2>
              {p.figures.length ? (
                p.figures.map((f) => (
                  <Figure
                    key={f.image}
                    image={f.image}
                    alt={`${f.label}, ${plainTitle(p.readingTitle)}`}
                    sizes="(max-width: 800px) 92vw, 720px"
                    legend={`${f.label}. ${f.caption}`}
                    caption={
                      <>
                        {t.caption}. {f.credit}.
                      </>
                    }
                  />
                ))
              ) : (
                <p className="research-panel-nofig">{t.noFigures}</p>
              )}
            </section>
          </div>
          <aside className="publication-aside">
            <div className="publication-cite">
              <h2>{t.cite}</h2>
              <p>{citation(p)}</p>
              <button
                type="button"
                className="publication-copy"
                onClick={() => {
                  navigator.clipboard
                    ?.writeText(citation(p))
                    .then(() => {
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 2200);
                    })
                    .catch(() => {});
                }}
              >
                <Copy size={15} aria-hidden="true" />
                <span aria-live="polite">{copied ? t.copied : t.copyCitation}</span>
              </button>
            </div>
            {members.length > 0 && (
              <div className="publication-members">
                <h2>{t.teamAuthors}</h2>
                <ul>
                  {members.map((person) => (
                    <li key={person.id}>
                      {person.slug ? (
                        <Link to={r.person(person.id)}>{person.name}</Link>
                      ) : (
                        person.name
                      )}
                      <span>{person.role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {related.length > 0 && (
              <div className="research-panel-services">
                <h2>{t.services}</h2>
                <ul>
                  {related.map((s) => (
                    <li key={s.id}>
                      <Link to={r.service(s.id)}>
                        {s.title}
                        <ArrowRight size={15} aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {p.themes.length > 0 && (
              <ul className="research-card-themes publication-themes" aria-label={t.theme}>
                {p.themes.map((id) => (
                  <li key={id}>
                    <Link to={researchLink(r.publications, { theme: id })}>{t.themes[id]}</Link>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </section>
      {others.length > 0 && (
        <section className="section-space related-publications">
          <div className="container">
            <Eyebrow>{t.relatedEyebrow}</Eyebrow>
            <AnimatedHeading text={t.otherPublications} />
            <PublicationLinks items={others} />
            <div className="person-links">
              <TextLink to={r.publications}>{t.allPublications}</TextLink>
            </div>
          </div>
        </section>
      )}
      <FinalCTA />
    </>
  );
}

/* ----------------------------------------------------------------------------------------- */
/* Lists used on other pages                                                                 */
/* ----------------------------------------------------------------------------------------- */

/** A short list of publications, each opening on the research page. */
const SHOWN_ON_PHONES = 6;

/** Publications as cards. On phones a long list shows its first six, the others one tap away;
 *  every link stays in the page. */
export function PublicationLinks({ items }: { items: ResearchPublication[] }) {
  const { ui } = useCatalog();
  const r = useRoutes();
  const list = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const others = items.length - SHOWN_ON_PHONES;
  const collapsed = others > 0 && !open;
  return (
    <>
      <ul ref={list} className="publication-links" data-collapsed={collapsed || undefined}>
        {items.map((p, i) => (
          <li key={p.id} style={{ '--i': i } as CSSProperties}>
            <Link to={r.publication(p.id)}>
              <span className="publication-links-meta">
                {p.year} · {p.journal}
              </span>
              <span className="publication-links-title" lang="en">
                <RichText text={p.readingTitle} />
              </span>
              <span className="publication-links-more">
                {ui.research.readSummary}
                <ArrowRight size={15} aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {collapsed && (
        <button
          type="button"
          className="publication-links-toggle"
          onClick={() => {
            setOpen(true);
            // Focus moves to the first publication revealed.
            requestAnimationFrame(() =>
              list.current?.querySelectorAll('a')[SHOWN_ON_PHONES]?.focus(),
            );
          }}
        >
          {ui.research.showOthers(others)}
        </button>
      )}
    </>
  );
}

/** The homepage's way into the research page: three topics, each opening its summary. */
export function ResearchTeaser() {
  const { research, ui } = useCatalog();
  const r = useRoutes();
  const t = ui.research;
  return (
    <section className="section-space research-teaser">
      <div className="container research-teaser-layout">
        <div>
          <Eyebrow>{t.homeEyebrow}</Eyebrow>
          <AnimatedHeading className="display-small" text={t.homeTitle} />
          <Reveal delay={0.1}>
            <p>{t.homeText}</p>
            <TextLink to={r.publications}>{t.homeLink}</TextLink>
          </Reveal>
        </div>
        <ol className="research-teaser-list">
          {research.featured.map((f, i) => {
            const p = research.publications.find((x) => x.id === f.publication)!;
            return (
              <li key={f.publication} style={{ '--i': i } as CSSProperties}>
                <Link to={r.publication(p.id)}>
                  <span className="research-teaser-label">
                    {f.label} · {f.species}
                  </span>
                  <span className="research-teaser-title">{p.seoTitle}</span>
                  <span className="research-teaser-meta">
                    {p.journal}, {p.year}
                  </span>
                  <ArrowRight className="research-teaser-arrow" size={18} aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
