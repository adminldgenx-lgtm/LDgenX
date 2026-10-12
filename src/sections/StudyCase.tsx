import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type RefObject,
} from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { featuredStudy, studies } from '../content/fr';
import {
  useEntrance,
  useNearViewport,
  usePointerVars,
  useReducedMotion,
} from '../components/motion';
import { Photo, Reveal } from '../components/ui';
import { studyMap, studySites, type StudySite } from '../lib/study-map';
import { createStudyFlow, type FlowLayer, type FlowState } from '../lib/study-flow';

/* "La génomique en pratique": the Artois-Picardie study told on its own map. The coast from the
   Somme to Dunkerque is redrawn from OpenStreetMap; the eight sites are those named on the
   sampling map published with the study, placed at their town, port or river mouth. The water
   moves: particles stand for the traces of DNA it carries. The three steps of the approach play
   in turn and the map follows them; the three constraints named by the publication can be shown
   on it. Nothing on the map stands for a result: the study's data are not public. */

const SETTING: Record<StudySite['setting'], string> = {
  port: 'Port',
  baie: 'Baie',
  estuaire: 'Estuaire',
};
const OSM = 'https://www.openstreetmap.org/copyright';
const STEP_MS = 6500;
const pct = (value: number, total: number) => `${((value / total) * 100).toFixed(2)}%`;

export function StudyCase() {
  const study = studies.find((s) => s.slug === featuredStudy.slug) ?? studies[0];
  const others = studies.filter((s) => s !== study);
  const reduced = useReducedMotion();
  const main = useRef<HTMLDivElement>(null);
  const live = useNearViewport(main, '0px');
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const [hold, setHold] = useState(false);
  const [layer, setLayer] = useState<FlowLayer>('none');
  const [active, setActive] = useState<string | null>(null);
  const playing = auto && !reduced;
  const constraint = featuredStudy.constraints.find((c) => c.id === layer);

  return (
    <div className="study-case">
      <div ref={main} className="study-case-main">
        {/* The column spans the whole row, so the map can stay in view beside the account. */}
        <div className="study-case-figure">
          <StudyMap step={step} layer={layer} active={active} setActive={setActive} />
        </div>
        <div className="study-case-copy">
          <Reveal>
            <p className="item-category">{study.category}</p>
            <h3 className="study-case-title">{study.title}</h3>
            <dl className="study-case-credits">
              <div>
                <dt>Commanditaire</dt>
                <dd>{featuredStudy.client}</dd>
              </div>
              <div>
                <dt>Réalisation</dt>
                <dd>{featuredStudy.team}</dd>
              </div>
            </dl>
          </Reveal>
          <Reveal className="study-case-question" delay={0.06}>
            <p className="study-case-label">La question posée</p>
            <blockquote>
              <p>{`« ${study.question.replace(/\s*\?$/, '')} ? »`}</p>
            </blockquote>
          </Reveal>
          <Reveal className="study-case-steps" delay={0.1}>
            <p className="study-case-label">L’approche</p>
            <ol
              data-playing={playing || undefined}
              data-paused={!live || hold || undefined}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setHold(true)}
              onPointerLeave={() => setHold(false)}
            >
              {featuredStudy.steps.map((s, i) => (
                <li
                  key={s.title}
                  data-active={i === step || undefined}
                  style={{ '--i': i } as CSSProperties}
                >
                  <span className="study-step-bar" aria-hidden="true">
                    {i === step && playing && (
                      <span
                        key={step}
                        style={{ animationDuration: `${STEP_MS}ms` }}
                        onAnimationEnd={() => setStep((current) => (current + 1) % 3)}
                      />
                    )}
                  </span>
                  <h4>
                    <button
                      type="button"
                      aria-pressed={i === step}
                      onClick={() => {
                        setStep(i);
                        setAuto(false);
                      }}
                    >
                      {s.title}
                    </button>
                  </h4>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal className="study-case-outcome" delay={0.14}>
            <p className="study-case-label">Ce que l’étude apporte</p>
            <p className="study-case-outcome-text">{featuredStudy.outcome}</p>
            <p className="study-case-constraints-label">{featuredStudy.constraintsLabel}</p>
            <div className="study-case-constraints" role="group" aria-label="Voir sur la carte">
              {featuredStudy.constraints.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={layer === c.id}
                  onClick={() => setLayer(layer === c.id ? 'none' : (c.id as FlowLayer))}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <p className="study-case-layer-note" aria-live="polite">
              <span key={layer}>
                {constraint ? constraint.text : featuredStudy.constraintsHint}
              </span>
            </p>
          </Reveal>
          <Reveal className="study-case-actions" delay={0.18}>
            <Link className="study-link" to={`/etudes-de-cas/${study.slug}`}>
              Voir l’étude
            </Link>
            <a className="study-case-source" href={study.source} target="_blank" rel="noreferrer">
              {featuredStudy.sourceLabel}
              <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
          </Reveal>
        </div>
        <SiteList active={active} setActive={setActive} />
      </div>

      <div className="study-tiles">
        <p className="study-tiles-label">D’autres questions, d’autres approches</p>
        {others.map((s, i) => (
          <Reveal key={s.slug} delay={i * 0.1}>
            <StudyTile study={s} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/** Another study: its picture leans towards the pointer and lets its question rise. */
function StudyTile({ study }: { study: (typeof studies)[number] }) {
  const ref = useRef<HTMLAnchorElement>(null);
  usePointerVars(ref, 7);
  return (
    <Link ref={ref} className="study-tile" to={`/etudes-de-cas/${study.slug}`}>
      <figure className="study-tile-image">
        <Photo name={study.image} alt="" sizes="(max-width: 800px) 90vw, 30vw" />
        <span className="study-tile-question" aria-hidden="true">
          <span>La question</span>
          {study.question}
        </span>
        <span className="study-tile-glare" aria-hidden="true" />
      </figure>
      <p className="item-category">{study.category}</p>
      <h3>{study.title}</h3>
      <p className="study-tile-text">{study.subtitle}</p>
      <span className="study-link">Voir l’étude</span>
    </Link>
  );
}

type Pointing = { active: string | null; setActive: (id: string | null) => void };

const pointing = (id: string, setActive: Pointing['setActive']) => ({
  onPointerEnter: (e: PointerEvent) => e.pointerType === 'mouse' && setActive(id),
  onPointerLeave: (e: PointerEvent) => e.pointerType === 'mouse' && setActive(null),
});

/** The eight sites, north to south, linked to the map; then the credits of the map. */
function SiteList({ active, setActive }: Pointing) {
  return (
    <Reveal className="study-case-sites">
      <p className="study-case-label">Les huit sites échantillonnés, du nord au sud</p>
      <ol className="study-sites">
        {studySites.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              data-active={active === s.id || undefined}
              onFocus={() => setActive(s.id)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(s.id)}
              {...pointing(s.id, setActive)}
            >
              <span className="study-sites-name">{s.name}</span>
              <span className="study-sites-kind">{SETTING[s.setting]}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="study-map-credit">
        Emplacements indicatifs, d’après la carte publiée avec l’étude. {featuredStudy.mapNote}{' '}
        Trait de côte ©{' '}
        <a href={OSM} target="_blank" rel="noreferrer">
          contributeurs OpenStreetMap
          <span className="sr-only"> (nouvel onglet)</span>
        </a>
        .
      </p>
    </Reveal>
  );
}

/** The study area: sea, moving water, land and coastline, the graticule, the eight sites, a
 *  scale bar and a locator of France. The list of sites names every one, so the map itself is a
 *  picture for assistive technology; pointing at a site in either place shows it in both. */
function StudyMap({
  step,
  layer,
  active,
  setActive,
}: { step: number; layer: FlowLayer } & Pointing) {
  const ref = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const sites = useRef<(HTMLSpanElement | null)[]>([]);
  const phase = useEntrance(ref);
  const { width, height } = studyMap;
  const site = studySites.find((s) => s.id === active);
  const state = useRef<FlowState>({ step, layer, hover: -1 });
  state.current = { step, layer, hover: site ? studySites.indexOf(site) : -1 };
  const flowing = useFlow(ref, canvas, sites, state);
  const point = (id: string) => pointing(id, setActive);

  return (
    <figure
      ref={ref}
      className="study-map"
      data-phase={phase}
      data-step={step}
      data-layer={layer}
      data-flowing={flowing || undefined}
    >
      <div
        className="study-map-canvas"
        style={{ aspectRatio: `${width} / ${height}` }}
        onClick={(e) => {
          if (!(e.target as Element).closest('.study-site')) setActive(null);
        }}
      >
        <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
          <rect className="study-map-sea" width={width} height={height} />
          <path className="study-map-shallows" d={studyMap.coast} />
        </svg>
        <canvas ref={canvas} className="study-map-flow" aria-hidden="true" />
        <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
          {studyMap.land.map((d) => (
            <path key={d.slice(0, 24)} className="study-map-land" d={d} />
          ))}
          <g className="study-map-grid">
            {studyMap.meridians.map((m) => (
              <line key={m.label} x1={m.at} x2={m.at} y1={0} y2={height} />
            ))}
            {studyMap.parallels.map((p) => (
              <line key={p.label} x1={0} x2={width} y1={p.at} y2={p.at} />
            ))}
          </g>
          <path className="study-map-coast" d={studyMap.coast} pathLength={1} />
          <g className="study-map-inset" transform="translate(30 30) scale(1.75)">
            <rect x={-9} y={-9} width={118} height={114} />
            <path d={studyMap.inset.france} />
            <rect className="study-map-inset-frame" {...studyMap.inset.frame} />
          </g>
        </svg>

        <div className="study-map-labels" aria-hidden="true">
          <span className="study-map-sea-label" style={{ left: '5%', top: '63%' }}>
            Manche
          </span>
          <span className="study-map-sea-label" style={{ left: '50%', top: '3.4%' }}>
            Mer du Nord
          </span>
          {studyMap.areas.map((a) => (
            <span
              key={a.name}
              className="study-map-area"
              style={{ left: pct(a.x, width), top: pct(a.y, height) }}
            >
              {a.name}
            </span>
          ))}
          {studyMap.meridians.map((m) => (
            <span
              key={m.label}
              className="study-map-tick study-map-tick-x"
              style={{ left: pct(m.at, width) }}
            >
              {m.label}
            </span>
          ))}
          {studyMap.parallels.map((p) => (
            <span
              key={p.label}
              className="study-map-tick study-map-tick-y"
              style={{ top: pct(p.at, height) }}
            >
              {p.label}
            </span>
          ))}
          <span
            className="study-map-scale"
            style={{ width: pct(studyMap.scaleWidth, width) }}
          >{`${studyMap.scaleKm} km`}</span>
        </div>

        <div className="study-map-sites" aria-hidden="true">
          {studySites.map((s, i) => (
            <span
              key={s.id}
              ref={(element) => {
                sites.current[i] = element;
              }}
              className="study-site"
              data-active={active === s.id || undefined}
              style={{ left: pct(s.x, width), top: pct(s.y, height), '--i': i } as CSSProperties}
              onClick={() => setActive(s.id)}
              {...point(s.id)}
            >
              <i className="study-site-ping" />
              <svg className="study-site-ring" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="17" pathLength={1} />
              </svg>
            </span>
          ))}
          {site && (
            <span
              key={site.id}
              className="study-map-tip"
              data-side={
                site.y < height * 0.12 ? 'below' : site.x > width * 0.62 ? 'left' : 'right'
              }
              style={{ left: pct(site.x, width), top: pct(site.y, height) }}
            >
              <span className="study-map-tip-kind">{SETTING[site.setting]}</span>
              <strong>{site.name}</strong>
              <span className="study-map-tip-area">{site.area}</span>
            </span>
          )}
        </div>
      </div>
    </figure>
  );
}

/** Runs the moving water while the map is on screen. A site that collects a particle blinks. */
function useFlow(
  map: RefObject<HTMLElement | null>,
  canvas: RefObject<HTMLCanvasElement | null>,
  sites: RefObject<(HTMLSpanElement | null)[]>,
  state: RefObject<FlowState>,
) {
  const reduced = useReducedMotion();
  const near = useNearViewport(map, '100px 0px');
  const [ready, setReady] = useState(false);
  const flow = useRef<ReturnType<typeof createStudyFlow>>(null);

  useEffect(() => {
    const element = canvas.current;
    if (!element || reduced || !near) return;
    if (!flow.current) {
      const blinked: number[] = [];
      flow.current = createStudyFlow(element, (index) => {
        const site = sites.current[index];
        const now = performance.now();
        if (!site || now - (blinked[index] ?? 0) < 420) return;
        blinked[index] = now;
        site.removeAttribute('data-catch');
        void site.offsetWidth;
        site.setAttribute('data-catch', '');
      });
      if (!flow.current) return;
      setReady(true);
    }
    const current = flow.current;
    current.wake();
    let frame = 0;
    const loop = (now: number) => {
      current.draw(now, state.current);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    const resize = new ResizeObserver(() => current.resize());
    resize.observe(element);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
    };
  }, [canvas, sites, state, reduced, near]);

  return ready && !reduced;
}
