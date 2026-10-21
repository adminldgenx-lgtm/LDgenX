import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';

/** Selecting a species from elsewhere on the page (the species wall) opens it in the module. */
const SELECT_EVENT = 'ldgenx:assay-select';
import { Link } from 'react-router-dom';
import { ArrowRight, Pause, Play, Search } from 'lucide-react';
import { useCatalog, useRoutes } from '../i18n';
import { Button, Eyebrow, Photo, Reveal } from '../components/ui';
import { AnimatedHeading, useNearViewport, useReducedMotion } from '../components/motion';
import type { AssayCategory } from '../content/types';

/* "Votre espèce cible, un test ADN sur mesure": the four steps of developing a targeted assay,
   told by a small scene. The species' own region lights up, two primers frame it and a probe
   settles on it, a related species is not recognised, then dPCR partitions light up. The scene
   is an illustration of the principle; it shows no measurement. */

const STEP_MS = 3600;
// Partitions lit in the last step: a fixed, illustrative pattern (no count is implied).
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, ' ')
    .toLowerCase();

const LIT = new Set([3, 8, 14, 17, 22, 29, 33, 38, 41, 47, 52, 58, 61, 66]);

/** The module. On the targeted DNA tests page (`variant="page"`), the page's own title replaces
 *  the module's heading. */
export function CustomAssay({ variant = 'section' }: { variant?: 'section' | 'page' }) {
  const { customAssay: t } = useCatalog();
  const r = useRoutes();
  const section = useRef<HTMLElement>(null);
  const live = useNearViewport(section, '0px');
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [held, setHeld] = useState(false);
  const [paused, setPaused] = useState(false);
  const [target, setTarget] = useState(t.targets[0]?.id ?? '');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<AssayCategory | 'all'>('all');
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const playing = live && !held && !paused && !reduced;
  useEffect(() => {
    const select = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      setQuery('');
      setCategory('all');
      setTarget(id);
    };
    window.addEventListener(SELECT_EVENT, select);
    return () => window.removeEventListener(SELECT_EVENT, select);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setStep((s) => (s + 1) % t.steps.length), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [playing, step, t.steps.length]);

  const choose = (i: number) => {
    setStep(i);
    setHeld(true);
  };
  const onKey = (event: KeyboardEvent) => {
    const delta =
      event.key === 'ArrowDown' || event.key === 'ArrowRight'
        ? 1
        : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
          ? -1
          : 0;
    if (!delta && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? t.steps.length - 1
          : (step + delta + t.steps.length) % t.steps.length;
    choose(next);
    tabs.current[next]?.focus();
  };
  const filtered = t.targets.filter(
    (x) =>
      (category === 'all' || x.category === category) &&
      normalize([x.name, x.latin, ...x.searchNames].join(' ')).includes(normalize(query.trim())),
  );
  // Keep the selected target when it matches; otherwise show the first matching entry.
  const current = filtered.find((x) => x.id === target) ?? filtered[0];
  const reset = () => {
    setQuery('');
    setCategory('all');
  };
  const groups = Object.entries(t.catalog.groups) as [AssayCategory, string][];

  return (
    <section
      ref={section}
      id={t.anchor}
      className="section-space assay-section"
      aria-labelledby="assay-title"
    >
      <div className="container">
        {variant === 'section' && (
          <div className="assay-head">
            <div>
              <Eyebrow>{t.eyebrow}</Eyebrow>
              <AnimatedHeading text={t.title} />
              <h2 id="assay-title" className="sr-only">
                {t.title.replace('\n', ' ')}
              </h2>
            </div>
            <Reveal delay={0.1}>
              <p>{t.intro}</p>
              <figure className="assay-context-photo">
                <Photo
                  name={t.contextImage.name}
                  alt={t.contextImage.alt}
                  sizes="(max-width: 700px) 80vw, 300px"
                />
                <figcaption>{t.contextImage.caption}</figcaption>
              </figure>
            </Reveal>
          </div>
        )}
        {variant === 'page' && (
          <h2 id="assay-title" className="sr-only">
            {t.title.replace('\n', ' ')}
          </h2>
        )}

        <div className="assay-catalog" aria-labelledby="assay-catalog-title">
          <div className="assay-catalog-browser">
            <h3 id="assay-catalog-title">{t.targetsLabel}</h3>
            <label className="assay-search">
              <span className="sr-only">{t.catalog.search}</span>
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.catalog.searchPlaceholder}
                autoComplete="off"
                aria-controls="assay-results"
              />
            </label>
            <div className="assay-filters" role="group" aria-label={t.catalog.filterLabel}>
              {([['all', t.catalog.all], ...groups] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={category === id}
                  onClick={() => setCategory(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="assay-results-meta">
              <p role="status">
                {filtered.length} / {t.targets.length} {t.catalog.resultLabel}
              </p>
              <button type="button" onClick={reset} disabled={!query && category === 'all'}>
                {t.catalog.reset}
              </button>
            </div>
            <div id="assay-results">
              {filtered.length > 0 ? (
                <>
                  <label className="assay-mobile-select">
                    <span>{t.catalog.select}</span>
                    <select
                      value={current?.id ?? ''}
                      onChange={(event) => setTarget(event.target.value)}
                      aria-controls="assay-target-detail"
                    >
                      {filtered.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.name} · {x.latin}
                        </option>
                      ))}
                    </select>
                  </label>
                  <ul className="assay-target-list" aria-label={t.catalog.select}>
                    {filtered.map((x) => (
                      <li key={x.id}>
                        <button
                          type="button"
                          className="assay-target"
                          aria-pressed={current?.id === x.id}
                          aria-controls="assay-target-detail"
                          onClick={() => setTarget(x.id)}
                        >
                          <span>
                            <span className="assay-target-name">{x.name}</span>
                            <em className="assay-target-latin" lang="la">
                              {x.latin}
                            </em>
                          </span>
                          <ArrowRight size={16} aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="assay-empty">{t.catalog.empty}</p>
              )}
            </div>
          </div>
          <div
            id="assay-target-detail"
            className="assay-target-detail"
            aria-live="polite"
            aria-atomic="true"
          >
            {current ? (
              <div key={current.id} className="assay-detail-body">
                <p className="assay-detail-category">{t.catalog.groups[current.category]}</p>
                <h4>{current.name}</h4>
                <em className="assay-detail-latin" lang="la">
                  {current.latin}
                </em>
                <p className="assay-inventory">{t.catalog.inventory}</p>
                <p>{t.catalog.detail}</p>
                <p className="assay-detail-scope">{t.catalog.scope}</p>
                <Button to={r.contact} variant="outline">
                  {t.catalog.contact}
                </Button>
              </div>
            ) : (
              <div className="assay-detail-body">
                <h4>{t.otherTitle}</h4>
                <p>{t.otherText}</p>
                <Button to={r.contact} variant="outline">
                  {t.otherAction}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="assay-layout">
          <div
            className="assay-visual"
            onPointerEnter={(e) => e.pointerType === 'mouse' && setHeld(true)}
            onPointerLeave={() => setHeld(false)}
          >
            <figure className="assay-stage" data-step={step} data-reduced={reduced || undefined}>
              <div className="assay-stage-head">
                <span className="assay-stage-label">
                  {current ? (
                    <>
                      {current.name}
                      {current.latin && (
                        <em lang="la">
                          {' · '}
                          {current.latin}
                        </em>
                      )}
                    </>
                  ) : (
                    t.stage.yourSpecies
                  )}
                </span>
                {!reduced && (
                  <button
                    type="button"
                    className="assay-play"
                    onClick={() => {
                      setPaused(!paused);
                      setHeld(false);
                    }}
                  >
                    {paused ? (
                      <Play size={14} aria-hidden="true" />
                    ) : (
                      <Pause size={14} aria-hidden="true" />
                    )}
                    <span className="sr-only">{paused ? t.play : t.pause}</span>
                  </button>
                )}
              </div>
              <AssayScene labels={t.stage} />
              <figcaption className="assay-caption">{t.illustration}</figcaption>
            </figure>
          </div>

          <div className="assay-steps">
            <p className="assay-steps-label" id="assay-steps-label">
              {t.stepsLabel}
            </p>
            <div role="tablist" aria-labelledby="assay-steps-label" aria-orientation="vertical">
              {t.steps.map((s, i) => (
                <button
                  key={s.title}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`assay-tab-${i}`}
                  aria-selected={i === step}
                  aria-controls="assay-panel"
                  tabIndex={i === step ? 0 : -1}
                  className="assay-step"
                  data-done={i < step || undefined}
                  onClick={() => choose(i)}
                  onFocus={() => setHeld(true)}
                  onBlur={() => setHeld(false)}
                  onKeyDown={onKey}
                >
                  <span className="assay-step-title">{s.title}</span>
                  {i === step && playing && (
                    <span
                      key={step}
                      className="assay-step-timer"
                      style={{ '--step': `${STEP_MS}ms` } as CSSProperties}
                      aria-hidden="true"
                    />
                  )}
                </button>
              ))}
            </div>
            <div
              id="assay-panel"
              role="tabpanel"
              aria-labelledby={`assay-tab-${step}`}
              className="assay-panel"
            >
              <p key={step}>{t.steps[step].text}</p>
            </div>
            <p className="assay-note">{t.quantNote}</p>
          </div>
        </div>

        <Reveal className="assay-other">
          <div>
            <h3>{t.otherTitle}</h3>
            <p>{t.otherText}</p>
          </div>
          <Button to={r.contact}>{t.otherAction}</Button>
        </Reveal>
      </div>
    </section>
  );
}

/** The scene: a stretch of DNA, primers, probe, a related species, then dPCR partitions. */
function AssayScene({
  labels,
}: {
  labels: { target: string; related: string; primers: string; probe: string; partitions: string };
}) {
  const rungs = Array.from({ length: 50 }, (_, i) => 20 + i * 12);
  return (
    <svg className="assay-scene" viewBox="0 0 640 300" aria-hidden="true">
      <g className="assay-dna">
        <rect className="assay-region" x="254" y="96" width="132" height="68" rx="6" />
        <line className="assay-strand" x1="20" x2="620" y1="110" y2="110" />
        <line className="assay-strand" x1="20" x2="620" y1="150" y2="150" />
        {rungs.map((x) => (
          <line
            key={x}
            className="assay-rung"
            data-in={(x > 254 && x < 386) || undefined}
            x1={x}
            x2={x}
            y1="112"
            y2="148"
          />
        ))}
        <text className="assay-label assay-label-region" x="320" y="84" textAnchor="middle">
          {labels.target}
        </text>
        <g className="assay-primer assay-primer-f">
          <rect x="258" y="98" width="38" height="8" rx="2" />
          <path d="M296 94 L306 102 L296 110 Z" />
        </g>
        <g className="assay-primer assay-primer-r">
          <rect x="344" y="154" width="38" height="8" rx="2" />
          <path d="M344 150 L334 158 L344 166 Z" />
        </g>
        <g className="assay-probe">
          <rect x="300" y="122" width="40" height="8" rx="4" />
          <circle className="assay-dye" cx="344" cy="126" r="6" />
        </g>
        <text className="assay-label assay-label-primers" x="200" y="186" textAnchor="middle">
          {labels.primers}
        </text>
        <text className="assay-label assay-label-probe" x="440" y="186" textAnchor="middle">
          {labels.probe}
        </text>
      </g>
      <g className="assay-related">
        <line className="assay-strand" x1="160" x2="480" y1="236" y2="236" />
        <line className="assay-strand" x1="160" x2="480" y1="262" y2="262" />
        {[284, 314, 344].map((x) => (
          <line key={x} className="assay-mismatch" x1={x} x2={x} y1="236" y2="262" />
        ))}
        <g className="assay-primer assay-primer-ghost">
          <rect x="258" y="212" width="38" height="8" rx="2" />
          <path d="M296 208 L306 216 L296 224 Z" />
        </g>
        <text className="assay-label" x="160" y="290">
          {labels.related}
        </text>
      </g>
      <g className="assay-partitions">
        {Array.from({ length: 72 }, (_, i) => (
          <circle
            key={i}
            className="assay-partition"
            data-lit={LIT.has(i) || undefined}
            cx={170 + (i % 12) * 27}
            cy={70 + Math.floor(i / 12) * 27}
            r="10"
            style={{ '--i': i } as CSSProperties}
          />
        ))}
        <text className="assay-label" x="320" y="260" textAnchor="middle">
          {labels.partitions}
        </text>
      </g>
    </svg>
  );
}

/** All the species at a glance, by group: each opens its card in the module below. */
export function SpeciesWall() {
  const { customAssay: t } = useCatalog();
  const r = useRoutes();
  const groups = Object.entries(t.catalog.groups) as [AssayCategory, string][];
  const pick = (id: string) => window.dispatchEvent(new CustomEvent(SELECT_EVENT, { detail: id }));
  return (
    <section className="section-space species-wall" aria-labelledby="species-wall-title">
      <div className="container">
        <div className="species-wall-head">
          <div>
            <Eyebrow>{t.wall.eyebrow}</Eyebrow>
            <AnimatedHeading text={t.wall.title} />
            <h2 id="species-wall-title" className="sr-only">
              {t.wall.title.replace('\n', ' ')}
            </h2>
          </div>
          <Reveal delay={0.1}>
            <p>{t.wall.intro}</p>
          </Reveal>
        </div>
        <div className="species-wall-groups">
          {groups.map(([category, label]) => {
            const items = t.targets.filter((x) => x.category === category);
            if (!items.length) return null;
            return (
              <div key={category} className="species-group" data-category={category}>
                <h3>
                  {label} <span>{items.length}</span>
                </h3>
                <ul>
                  {items.map((x, i) => (
                    <li key={x.id} style={{ '--i': i } as CSSProperties}>
                      <a href={`#${t.anchor}`} onClick={() => pick(x.id)}>
                        <span className="species-name">{x.name}</span>
                        <em lang="la">{x.latin}</em>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          <Reveal className="species-group species-other">
            <h3>{t.wall.otherTitle}</h3>
            <p>{t.wall.otherText}</p>
            <Button to={r.contact} variant="outline">
              {t.otherAction}
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** The homepage's way to the targeted DNA tests: a species photograph, the number of species
 *  held in house and their names passing by. */
export function CustomAssayTeaser() {
  const { customAssay: t } = useCatalog();
  const r = useRoutes();
  const names = t.targets.map((x) => x.name);
  return (
    <section className="assay-teaser">
      <div className="container">
        <Link className="assay-teaser-link" to={r.service('tests-adn-cibles')}>
          <span className="assay-teaser-picture">
            <Photo
              name={t.contextImage.name}
              alt={t.contextImage.alt}
              sizes="(max-width: 800px) 90vw, 420px"
            />
          </span>
          <span className="assay-teaser-body">
            <span className="assay-teaser-eyebrow">{t.home.eyebrow}</span>
            <span className="assay-teaser-title">{t.home.title}</span>
            <span className="assay-teaser-text">{t.home.text}</span>
            <span className="assay-teaser-count">
              <strong>{t.targets.length}</strong>
              {t.home.count}
            </span>
            <span className="assay-teaser-species" aria-hidden="true">
              <span className="assay-teaser-track">
                {[...names, ...names].map((name, i) => (
                  <span key={`${name}-${i}`}>{name}</span>
                ))}
              </span>
            </span>
            <span className="assay-teaser-more">
              {t.home.link}
              <ArrowRight size={17} aria-hidden="true" />
            </span>
          </span>
        </Link>
      </div>
    </section>
  );
}
