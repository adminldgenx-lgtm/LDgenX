import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Link2, Search, X } from 'lucide-react';
import type { ResearchFeatured, ResearchPublication } from '../content/types';
import { useCatalog, useRoutes } from '../i18n';
import { type PageMeta } from '../lib/pages';
import { Eyebrow, FinalCTA, PageHero, Reveal, TextLink } from '../components/ui';
import { AnimatedHeading, useNearViewport, useReducedMotion, useSeen } from '../components/motion';
import { DecodeOnce } from '../components/Decode';
import { Figure } from '../components/Figure';

/* "Recherche & publications": the articles co-written by the team. Three topics are put
   forward with charts drawn only from values stated in their published abstracts; the
   catalogue lists every reference with search and filters kept in the address, so a filtered
   list or an open publication can be shared, and closing a publication returns to the list as
   it was. */

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
  const { research, people, ui } = useCatalog();
  const t = ui.research;
  const r = useRoutes();
  const navigate = useNavigate();
  const location = useLocation();
  const { params, setSearchParams } = useResearchQuery();
  const openId = params.get('publication');
  const open = research.publications.find((p) => p.id === openId) ?? null;

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setSearchParams(next, { replace: true, preventScrollReset: true });
  };
  const openPublication = (id: string) => {
    const next = new URLSearchParams(params);
    next.set('publication', id);
    setSearchParams(next, { preventScrollReset: true, state: { fromList: true } });
  };
  const closePublication = () => {
    if ((location.state as { fromList?: boolean } | null)?.fromList) navigate(-1);
    else update({ publication: null });
  };

  return (
    <>
      <PageHero meta={meta} eyebrow={t.eyebrow} title={t.title} intro={t.intro} />
      <FeaturedResearch items={research.featured} onOpen={openPublication} />
      <Catalogue params={params} update={update} onOpen={openPublication} openId={openId} />
      <section className="section-space research-distinct">
        <div className="container detail-intro">
          <div>
            <Eyebrow>{t.distinctEyebrow}</Eyebrow>
            <AnimatedHeading text={t.distinctTitle} />
          </div>
          <Reveal>
            <ul className="research-distinct-list">
              {t.distinct.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div className="person-links">
              <TextLink to={r.innovations}>{t.seeRd}</TextLink>
              <TextLink to={r.studies}>{t.seeStudies}</TextLink>
            </div>
          </Reveal>
        </div>
      </section>
      <FinalCTA />
      <PublicationPanel publication={open} people={people} onClose={closePublication} />
    </>
  );
}

/* ----------------------------------------------------------------------------------------- */
/* Featured topics                                                                           */
/* ----------------------------------------------------------------------------------------- */

function FeaturedResearch({
  items,
  onOpen,
}: {
  items: ResearchFeatured[];
  onOpen: (id: string) => void;
}) {
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
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => onOpen(publication.id)}
                >
                  {t.readSummary}
                </button>
                {service && <TextLink to={r.service(service.id)}>{service.title}</TextLink>}
              </div>
            </div>
            <figure className="research-chart">
              <figcaption className="research-chart-title">{item.chartTitle}</figcaption>
              <ResearchChart item={item} />
              <p className="research-chart-note">
                {item.chartNote}{' '}
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
  const reduced = useReducedMotion();
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
    if (reduced) {
      draw(1);
      return;
    }
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
  }, [total, selected, live, reduced]);
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
  const reduced = useReducedMotion();
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
                <DecodeOnce text={String(b.value)} play={seen && !reduced} delay={300 + i * 160} />{' '}
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
  onOpen,
  openId,
}: {
  params: URLSearchParams;
  update: (changes: Record<string, string | null>) => void;
  onOpen: (id: string) => void;
  openId: string | null;
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
                current={p.id === openId}
                onOpen={onOpen}
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
  current,
  onOpen,
}: {
  publication: ResearchPublication;
  index: number;
  dim: boolean;
  current: boolean;
  onOpen: (id: string) => void;
}) {
  const { ui } = useCatalog();
  const t = ui.research;
  return (
    <li
      className="research-card"
      data-dim={dim || undefined}
      data-current={current || undefined}
      style={{ '--i': Math.min(index, 10) } as CSSProperties}
    >
      <div className="research-card-meta">
        <span className="research-card-year">{p.year}</span>
        <span>{p.journal}</span>
        {p.type === 'review' && <span className="research-card-badge">{t.review}</span>}
      </div>
      <div className="research-card-body">
        <h3>
          <button type="button" className="research-card-open" onClick={() => onOpen(p.id)}>
            {p.readingTitle}
          </button>
        </h3>
        <p className="research-card-title" lang="en">
          {p.title}
        </p>
        <p className="research-card-authors">
          <AuthorLine publication={p} />
        </p>
        <ul className="research-card-themes" aria-label={t.theme}>
          {p.themes.map((id) => (
            <li key={id}>{t.themes[id]}</li>
          ))}
        </ul>
      </div>
      <div className="research-card-actions">
        <button type="button" className="research-card-read" onClick={() => onOpen(p.id)}>
          {t.readSummary}
          <ArrowRight size={16} aria-hidden="true" />
        </button>
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
/* Publication panel                                                                         */
/* ----------------------------------------------------------------------------------------- */

function PublicationPanel({
  publication,
  people,
  onClose,
}: {
  publication: ResearchPublication | null;
  people: { id: string; name: string }[];
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);
  const [shown, setShown] = useState<ResearchPublication | null>(publication);
  if (publication && publication !== shown) setShown(publication);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (publication && !element.open) {
      opener.current = document.activeElement;
      element.showModal();
      element.scrollTop = 0;
    } else if (!publication && element.open) {
      element.close();
      if (opener.current instanceof HTMLElement) opener.current.focus({ preventScroll: true });
    }
  }, [publication]);

  return (
    <dialog
      ref={dialog}
      className="research-panel"
      aria-labelledby="research-panel-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {shown && <PanelContent publication={shown} people={people} onClose={onClose} />}
    </dialog>
  );
}

function PanelContent({
  publication: p,
  onClose,
}: {
  publication: ResearchPublication;
  people: { id: string; name: string }[];
  onClose: () => void;
}) {
  const { services, ui } = useCatalog();
  const r = useRoutes();
  const t = ui.research;
  const [copied, setCopied] = useState(false);
  const online =
    p.online &&
    new Intl.DateTimeFormat(ui.htmlLang, { day: 'numeric', month: 'long', year: 'numeric' }).format(
      new Date(p.online),
    );
  const related = services.filter((s) => p.services.includes(s.id));
  return (
    <div className="research-panel-inner" key={p.id}>
      <div className="research-panel-bar">
        <span>{t.dialog}</span>
        <div>
          <button
            type="button"
            className="research-panel-share"
            onClick={() => {
              navigator.clipboard
                ?.writeText(window.location.href)
                .then(() => {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2200);
                })
                .catch(() => {});
            }}
          >
            <Link2 size={15} aria-hidden="true" />
            <span aria-live="polite">{copied ? t.copied : t.share}</span>
          </button>
          <button type="button" className="research-panel-close" onClick={onClose}>
            <X size={18} aria-hidden="true" />
            <span className="sr-only">{t.close}</span>
          </button>
        </div>
      </div>
      <p className="research-panel-kicker">
        {p.journal} · {p.year}
        {online && ` · ${t.online} ${online}`}
        {p.type === 'review' && ` · ${t.review}`}
      </p>
      <h2 id="research-panel-title">{p.readingTitle}</h2>
      <p className="research-panel-title" lang="en">
        {p.title}
      </p>
      <p className="research-panel-authors">
        <AuthorLine publication={p} full />
      </p>
      {p.authorNote && <p className="research-panel-note">{p.authorNote}</p>}
      <div className="research-panel-links">
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
      <p className="research-panel-basis">{t.text[p.text]}</p>
      <p className="research-panel-summary">{p.summary}</p>
      <dl className="research-panel-points">
        {(
          [
            [t.question, p.question],
            [t.approach, p.approach],
            [t.finding, p.finding],
            [t.limit, p.limit],
          ] as const
        ).map(([label, text], i) => (
          <div
            key={label}
            style={{ '--i': i } as CSSProperties}
            data-kind={i === 3 ? 'limit' : undefined}
          >
            <dt>{label}</dt>
            <dd>{text}</dd>
          </div>
        ))}
      </dl>
      <section className="research-panel-figures" aria-label={t.figures}>
        <h3>{t.figures}</h3>
        {p.figures.length ? (
          p.figures.map((f) => (
            <Figure
              key={f.image}
              image={f.image}
              alt={`${f.label}, ${p.readingTitle}`}
              sizes="(max-width: 800px) 92vw, 640px"
              legend={`${f.label}. ${f.caption}`}
              caption={
                <>
                  {t.caption}. {f.credit}. {t.licence}{' '}
                  <a
                    href="https://creativecommons.org/licenses/by/4.0/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {f.licence}
                    <span className="sr-only">{ui.common.newTab}</span>
                  </a>
                  .
                </>
              }
            />
          ))
        ) : (
          <p className="research-panel-nofig">{t.noFigures}</p>
        )}
      </section>
      <section className="research-panel-services" aria-label={t.services}>
        <h3>{t.services}</h3>
        <ul>
          {related.map((s) => (
            <li key={s.id}>
              <Link to={r.service(s.id)} onClick={onClose}>
                {s.title}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
        <p>{t.servicesNote}</p>
      </section>
    </div>
  );
}

/* ----------------------------------------------------------------------------------------- */
/* Lists used on other pages                                                                 */
/* ----------------------------------------------------------------------------------------- */

/** A short list of publications, each opening on the research page. */
export function PublicationLinks({ items }: { items: ResearchPublication[] }) {
  const { ui } = useCatalog();
  const r = useRoutes();
  return (
    <ul className="publication-links">
      {items.map((p, i) => (
        <li key={p.id} style={{ '--i': i } as CSSProperties}>
          <Link to={researchLink(r.publications, { publication: p.id })}>
            <span className="publication-links-meta">
              {p.year} · {p.journal}
            </span>
            <span className="publication-links-title">{p.readingTitle}</span>
            <span className="publication-links-ref" lang="en">
              {p.title}
            </span>
            <span className="publication-links-more">
              {ui.research.readSummary}
              <ArrowRight size={15} aria-hidden="true" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
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
                <Link to={researchLink(r.publications, { publication: p.id })}>
                  <span className="research-teaser-label">
                    {f.label} · {f.species}
                  </span>
                  <span className="research-teaser-title">{p.readingTitle}</span>
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
