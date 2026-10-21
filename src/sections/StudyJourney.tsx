import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useCatalog, useRoutes } from '../i18n';
import { useMediaQuery, useNearViewport, useReducedMotion } from '../components/motion';
import type { StudySite } from '../lib/study-geo';
import type { Box, Camera, JourneyFrame, Layer } from '../lib/study-journey';

/* The Artois-Picardie study as a journey along the coast. The chart stays on screen while the
   page scrolls; scrolling moves the camera, from France down to the Côte d'Opale, along the eight
   sampling sites, then back out, and the card beside it follows the chapters of the study.
   Coast, rivers, towns and borders are real (OpenStreetMap); the moving water is illustration. */

type Geo = typeof import('../lib/study-geo').studyGeo;
type Journey = NonNullable<ReturnType<typeof import('../lib/study-journey').createJourney>>;

// Six chapters; their names come from the catalogue.
const N = 6;
const LAYERS: Layer[] = ['courants', 'turbidite', 'marees'];
const OSM = 'https://www.openstreetmap.org/copyright';
// The sites, north to south, with their kind of setting; names come from the catalogue.
const SETTINGS: Record<string, StudySite['setting']> = {
  'dunkerque-est': 'port',
  'dunkerque-ouest': 'port',
  calais: 'port',
  slack: 'estuaire',
  boulogne: 'port',
  canche: 'baie',
  authie: 'baie',
  somme: 'estuaire',
};
const SITE_COUNT = Object.keys(SETTINGS).length;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const around = (x: number, y: number, size: number): Box => ({
  x0: x - size / 2,
  y0: y - size / 2,
  x1: x + size / 2,
  y1: y + size / 2,
});
// Where the camera stands for each chapter, in world units (1000 units ≈ 1.16° of longitude).
const VIEWS = {
  france: { x0: -5600, y0: -150, x1: 7250, y1: 13400 },
  coast: { x0: -60, y0: -50, x1: 1060, y1: 1430 },
  analyse: { x0: -80, y0: -60, x1: 1080, y1: 1450 },
  milieu: { x0: -20, y0: 330, x1: 780, y1: 1340 },
  apports: { x0: -420, y0: -340, x1: 1520, y1: 1680 },
};

type State = { chapter: number; local: number; site: number; layer: Layer; sub: number };

export function StudyJourney() {
  const { featuredStudy, studies, artoisPicardie, ui } = useCatalog();
  // French puts a non-breaking space before the colon; English does not.
  const colon = ui.lang === 'fr' ? '\u00a0:' : ':';
  const r = useRoutes();
  const t = ui.journey;
  const CHAPTERS = t.chapters;
  const SETTING = t.settings;
  const study = studies.find((s) => s.id === featuredStudy.slug) ?? studies[0];
  const SITES = t.sites.map((s) => ({
    ...s,
    setting: SETTINGS[s.id],
    sectors: artoisPicardie.sites.find((x) => x.id === s.id)?.sectors.length ?? 1,
  }));
  const reduced = useReducedMotion();
  const compact = useMediaQuery('(max-width: 800px)');
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const siteEls = useRef<(HTMLSpanElement | null)[]>([]);
  const townEls = useRef<(HTMLSpanElement | null)[]>([]);
  const labelEls = useRef<(HTMLSpanElement | null)[]>([]);
  const tipEl = useRef<HTMLSpanElement>(null);
  const scaleEl = useRef<HTMLSpanElement>(null);
  const near = useNearViewport(track, '600px 0px');
  const [geo, setGeo] = useState<Geo | null>(null);
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<State>({
    chapter: 0,
    local: 0,
    site: -1,
    layer: 'none',
    sub: 0,
  });
  const [manual, setManual] = useState<{ chapter: number; layer: Layer } | null>(null);
  const [hover, setHover] = useState(-1);
  const live = useRef({ hover: -1, manual: null as Layer | null, manualChapter: -1 });
  live.current.hover = hover;
  live.current.manual = manual?.layer ?? null;
  live.current.manualChapter = manual?.chapter ?? -1;

  // The chart's data and code load when the section comes near.
  useEffect(() => {
    if (!near || geo) return;
    let cancelled = false;
    import('../lib/study-geo').then((m) => !cancelled && setGeo(m.studyGeo));
    return () => {
      cancelled = true;
    };
  }, [near, geo]);

  useEffect(() => {
    const element = canvas.current,
      trackEl = track.current,
      stageEl = stage.current,
      sheetEl = card.current;
    if (!geo || !element || !trackEl || !stageEl) return;
    let journey: Journey | null = null;
    let frame = 0,
      visible = false,
      cancelled = false;
    const blinked: number[] = [];
    let reported = '';

    // Phones: the card is a sheet at the foot of the chart, as tall as the chapter it shows
    // (easing between chapters); the chart keeps the room of the longest chapter, so the camera
    // never moves when the card changes.
    let sheet = 0,
      sheetAt = 0;
    const sheetSize = () => {
      const el = sheetEl;
      const list = el?.querySelector<HTMLElement>('.journey-chapters');
      if (!el || !list) return null;
      const style = getComputedStyle(el);
      // offsetTop counts from inside the top border.
      const foot =
        parseFloat(style.paddingBottom) +
        parseFloat(style.borderBottomWidth) +
        parseFloat(style.borderTopWidth);
      const bodies = [...list.children] as HTMLElement[];
      const active = bodies.find((b) => b.hasAttribute('data-active')) ?? bodies[0];
      const most = stageEl.clientHeight * 0.62;
      return {
        now: Math.min(most, list.offsetTop + (active?.offsetHeight ?? 0) + foot),
        room: Math.min(
          most,
          list.offsetTop + Math.max(...bodies.map((b) => b.offsetHeight)) + foot,
        ),
      };
    };
    const fitSheet = (now: number, target: number) => {
      const el = sheetEl;
      if (!el) return;
      const dt = sheetAt ? Math.min(64, now - sheetAt) : 1000;
      sheetAt = now;
      sheet = sheet ? sheet + (target - sheet) * Math.min(1, dt / 90) : target;
      const next = `${sheet.toFixed(1)}px`;
      if (el.style.height !== next) el.style.height = next;
    };

    const area = (
      size: ReturnType<typeof sheetSize>,
    ): { box: Box; focus: { x: number; y: number } } => {
      const w = stageEl.clientWidth,
        h = stageEl.clientHeight;
      const cardBox = card.current?.getBoundingClientRect();
      const stageBox = stageEl.getBoundingClientRect();
      let box: Box;
      if (reduced) {
        box = { x0: 24, y0: 24, x1: element.clientWidth - 24, y1: element.clientHeight - 24 };
      } else if (compact) {
        const top = size ? h - 12 - size.room : h * 0.55;
        box = { x0: 16, y0: 16, x1: w - 16, y1: Math.max(160, top - 12) };
      } else {
        const right = cardBox ? cardBox.right - stageBox.left : w * 0.38;
        box = { x0: right + 48, y0: 28, x1: w - 40, y1: h - 40 };
      }
      return { box, focus: { x: (box.x0 + box.x1) / 2, y: (box.y0 + box.y1) / 2 } };
    };

    const progress = () => {
      if (reduced) return 1.5;
      const box = trackEl.getBoundingClientRect();
      const run = trackEl.offsetHeight - stageEl.offsetHeight;
      return run > 0 ? clamp(-box.top / run) * (N - 0.0001) : 0;
    };

    const cameraFor = (p: number, fitBox: Box) => {
      const fitTo = (b: Box) => fitCamera(b, fitBox);
      const sites = geo.sites;
      const site = (i: number) => fitTo(around(sites[i].x, sites[i].y, compact ? 420 : 380));
      const chapter = Math.min(N - 1, Math.floor(p)),
        local = p - chapter;
      const start: Camera[] = [
        fitTo(VIEWS.france),
        fitTo(VIEWS.coast),
        site(0),
        fitTo(VIEWS.analyse),
        fitTo(VIEWS.milieu),
        fitTo(VIEWS.apports),
      ];
      const end = [...start];
      end[2] = site(sites.length - 1);
      let current: Camera = start[chapter];
      let visiting = -1;
      if (chapter === 2) {
        const u = clamp((local - 0.3) / 0.62);
        const along = u * (sites.length - 1);
        const s = Math.min(sites.length - 2, Math.floor(along));
        const k = smooth(0.22, 0.78, along - s);
        const a = site(s),
          b = site(s + 1);
        current = { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, scale: a.scale };
        visiting = k < 0.5 ? s : s + 1;
      }
      if (chapter > 0 && local < 0.3) {
        const t = smooth(0, 0.3, local);
        current = betweenCamera(end[chapter - 1], chapter === 2 ? site(0) : current, t);
      }
      return { camera: current, chapter, local, visiting };
    };

    let fitCamera: typeof import('../lib/study-journey').fit;
    let betweenCamera: typeof import('../lib/study-journey').between;

    const render = (now: number) => {
      if (!journey) return;
      const p = progress();
      const size = compact && !reduced ? sheetSize() : null;
      const { box, focus } = area(size);
      if (size) fitSheet(now, size.now);
      const view = cameraFor(p, box);
      const { chapter, local } = view;
      const manualHere = live.current.manualChapter === chapter ? live.current.manual : null;
      let layer: Layer = 'none';
      let sub = 0;
      if (chapter === 4) {
        sub = local < 0.3 ? 0 : 1 + Math.min(2, Math.floor((local - 0.3) / 0.234));
        layer = manualHere ?? (sub ? LAYERS[sub - 1] : 'none');
      }
      if (chapter === 3) sub = local < 0.6 ? 0 : 1;
      const mode =
        chapter === 2 ? 'sample' : chapter === 3 ? (sub ? 'compare' : 'analyse') : 'calm';
      const frameData: JourneyFrame = {
        camera: view.camera,
        focus,
        layer,
        mode,
        site: view.visiting,
        hover: live.current.hover,
        frame: chapter === 0 ? 1 : chapter === 1 ? 1 - smooth(0, 0.22, local) : 0,
      };
      const out = journey.draw(now, frameData);
      // Overlays follow the camera.
      const sitesShown = out.detail * (chapter === 0 ? smooth(0.6, 1, local) : 1);
      geo.sites.forEach((s, i) => {
        const el = siteEls.current[i];
        if (!el) return;
        const [x, y] = out.toScreen(s.x, s.y);
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        el.style.opacity = sitesShown.toFixed(3);
        el.toggleAttribute('data-current', i === view.visiting);
      });
      geo.towns.forEach((town, i) => {
        const el = townEls.current[i];
        if (!el) return;
        const [x, y] = out.toScreen(town.x, town.y);
        const shown =
          out.detail *
          (town.rank === 1 ? smooth(0.2, 0.3, out.scale) : smooth(0.6, 0.78, out.scale));
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        el.style.opacity = shown.toFixed(3);
      });
      geo.labels.forEach((label, i) => {
        const el = labelEls.current[i];
        if (!el) return;
        const [x, y] = out.toScreen(label.x, label.y);
        const shown =
          label.kind === 'sea'
            ? out.detail * smooth(0.16, 0.24, out.scale)
            : out.detail * smooth(0.12, 0.18, out.scale) * (1 - smooth(0.5, 0.75, out.scale));
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
        el.style.opacity = shown.toFixed(3);
      });
      const tip = tipEl.current;
      const hovered = live.current.hover;
      if (tip && hovered >= 0) {
        const [x, y] = out.toScreen(geo.sites[hovered].x, geo.sites[hovered].y);
        tip.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      }
      // A scale bar of a round number of kilometres, about 110 px long.
      const kmPerPx = 1 / (view.camera.scale * geo.unitsPerKm);
      const target = 110 * kmPerPx;
      const nice = [1, 2, 5, 10, 20, 50, 100, 200, 500].reduce((a, b) =>
        Math.abs(b - target) < Math.abs(a - target) ? b : a,
      );
      if (scaleEl.current) {
        scaleEl.current.style.width = `${(nice / kmPerPx).toFixed(1)}px`;
        scaleEl.current.textContent = `${nice} km`;
        scaleEl.current.style.opacity = String(out.detail);
      }
      const key = `${chapter}|${view.visiting}|${layer}|${sub}`;
      if (key !== reported) {
        reported = key;
        setState({ chapter, local, site: view.visiting, layer, sub });
      }
    };

    const loop = (now: number) => {
      render(now);
      frame = visible && !reduced ? requestAnimationFrame(loop) : 0;
    };
    const start = () => {
      if (!frame && journey) {
        journey.wake();
        frame = requestAnimationFrame(loop);
      }
    };

    import('../lib/study-journey').then((m) => {
      if (cancelled) return;
      fitCamera = m.fit;
      betweenCamera = m.between;
      const build = () => {
        if (cancelled) return;
        journey = m.createJourney(element, geo, (index) => {
          const el = siteEls.current[index];
          const now = performance.now();
          if (!el || now - (blinked[index] ?? 0) < 380) return;
          blinked[index] = now;
          el.removeAttribute('data-catch');
          void el.offsetWidth;
          el.setAttribute('data-catch', '');
        });
        if (!journey) return;
        setReady(true);
        render(performance.now());
        if (visible) start();
      };
      if (typeof window.requestIdleCallback === 'function')
        window.requestIdleCallback(build, { timeout: 1200 });
      else window.setTimeout(build, 60);
    });

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    observer.observe(trackEl);
    const resize = new ResizeObserver(() => {
      journey?.resize();
      if (journey) render(performance.now());
    });
    resize.observe(element);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      sheetEl?.style.removeProperty('height');
    };
  }, [geo, reduced, compact]);

  // Jump to a moment of the journey: a chapter, and for the sampling, a site.
  const goTo = (chapter: number, local = 0.45) => {
    const trackEl = track.current,
      stageEl = stage.current;
    if (!trackEl || !stageEl || reduced) return;
    const run = trackEl.offsetHeight - stageEl.offsetHeight;
    const top = trackEl.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + ((chapter + local) / N) * run, behavior: 'smooth' });
  };
  const goToSite = (index: number) => goTo(2, 0.3 + (index / (SITE_COUNT - 1)) * 0.62);
  const pointing = (index: number) => ({
    onPointerEnter: (e: PointerEvent) => e.pointerType === 'mouse' && setHover(index),
    onPointerLeave: (e: PointerEvent) => e.pointerType === 'mouse' && setHover(-1),
  });

  const { chapter, site, layer, sub } = state;
  const shownSite = SITES[site >= 0 ? site : 0];
  const constraint = featuredStudy.constraints.find((c) => c.id === layer);
  const hoverSite = hover >= 0 ? SITES[hover] : null;

  const chapters = [
    <>
      <p className="journey-kicker">
        {study.category}
        {t.kickerSuffix}
      </p>
      <p className="journey-title">{study.title}</p>
      <p className="journey-lead">{study.subtitle}</p>
      <dl className="journey-credits">
        <div>
          <dt>{t.client}</dt>
          <dd>{featuredStudy.client}</dd>
        </div>
        <div>
          <dt>{t.team}</dt>
          <dd>{featuredStudy.team}</dd>
        </div>
      </dl>
    </>,
    <>
      <p className="journey-kicker">{t.question}</p>
      <blockquote className="journey-quote">
        <p>
          {ui.lang === 'fr'
            ? `«\u00a0${study.question.replace(/\s*\?$/, '')}\u202f?\u00a0»`
            : `“${study.question}”`}
        </p>
      </blockquote>
      <p className="journey-note">{t.sitesNote}</p>
    </>,
    <>
      <p className="journey-kicker">{featuredStudy.steps[0].title}</p>
      <p className="journey-text">{featuredStudy.steps[0].text}</p>
      <div className="journey-site" key={shownSite.id}>
        <span>{SETTING[shownSite.setting]}</span>
        <strong>{shownSite.name}</strong>
        <span>
          {shownSite.area} · {t.sectors(shownSite.sectors)}
        </span>
      </div>
      <ol className="journey-sites">
        {SITES.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              aria-current={i === site ? 'true' : undefined}
              onClick={() => goToSite(i)}
              {...pointing(i)}
            >
              {s.name}
            </button>
          </li>
        ))}
      </ol>
    </>,
    <>
      {featuredStudy.steps.slice(1).map((s, i) => (
        <div key={s.title} className="journey-step" data-active={sub === i || undefined}>
          <p className="journey-kicker">{s.title}</p>
          <p className="journey-text">{s.text}</p>
        </div>
      ))}
    </>,
    <>
      <p className="journey-kicker">{featuredStudy.constraintsLabel}</p>
      <div className="journey-layers" role="group" aria-label={t.layers}>
        {featuredStudy.constraints.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={layer === c.id}
            onClick={() =>
              setManual(
                manual?.layer === c.id && manual.chapter === 4
                  ? null
                  : { chapter: 4, layer: c.id as Layer },
              )
            }
          >
            {c.label}
          </button>
        ))}
      </div>
      <p className="journey-text journey-layer-text" key={layer}>
        {constraint ? constraint.text : featuredStudy.constraintsHint}
      </p>
    </>,
    <>
      <p className="journey-kicker">{t.outcome}</p>
      <p className="journey-text journey-outcome">{featuredStudy.outcome}</p>
      <div className="journey-actions">
        <Link className="journey-cta" to={r.study(study.id)}>
          {t.cta}
        </Link>
        <a className="journey-source" href={study.source} target="_blank" rel="noreferrer">
          {featuredStudy.sourceLabel}
          <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
          <span className="sr-only">{ui.common.newTab}</span>
        </a>
      </div>
    </>,
  ];

  return (
    <section
      className="journey"
      aria-label={t.sectionLabel}
      data-static={reduced || undefined}
      data-ready={ready || undefined}
    >
      <a className="journey-skip" href="#apres-etude">
        {t.skip}
      </a>
      <div ref={track} className="journey-track">
        <div ref={stage} className="journey-stage">
          <canvas ref={canvas} className="journey-canvas" aria-hidden="true" />
          <div className="journey-overlay" aria-hidden="true">
            {geo?.labels.map((l, i) => (
              <span
                key={l.name}
                ref={(el) => {
                  labelEls.current[i] = el;
                }}
                className="journey-label"
                data-kind={l.kind}
              >
                {t.labels[l.name] ?? l.name}
              </span>
            ))}
            {geo?.towns.map((t, i) => (
              <span
                key={t.name}
                ref={(el) => {
                  townEls.current[i] = el;
                }}
                className="journey-town"
              >
                {ui.journey.towns[t.name] ?? t.name}
              </span>
            ))}
            {geo?.sites.map((s, i) => (
              <span
                key={s.id}
                ref={(el) => {
                  siteEls.current[i] = el;
                }}
                className="journey-site-marker"
                data-hover={hover === i || undefined}
                style={{ '--i': i } as CSSProperties}
                onClick={() => setHover(hover === i ? -1 : i)}
                {...pointing(i)}
              >
                <i />
              </span>
            ))}
            {hoverSite && (
              <span ref={tipEl} key={hoverSite.id} className="journey-tip">
                <span>{SETTING[hoverSite.setting]}</span>
                <strong>{hoverSite.name}</strong>
                <span>{hoverSite.area}</span>
              </span>
            )}
            <span ref={scaleEl} className="journey-scale" />
          </div>

          <div ref={card} className="journey-card">
            <ol className="journey-progress">
              {CHAPTERS.map((name, i) => (
                <li
                  key={name}
                  data-state={i < chapter ? 'done' : i === chapter ? 'now' : undefined}
                >
                  <button
                    type="button"
                    aria-label={name}
                    title={name}
                    aria-current={i === chapter ? 'step' : undefined}
                    onClick={() => goTo(i)}
                  >
                    <span />
                  </button>
                </li>
              ))}
            </ol>
            <div className="journey-chapters">
              {chapters.map((content, i) => (
                <div
                  key={i}
                  className="journey-chapter-body"
                  data-active={reduced || i === chapter || undefined}
                  inert={!reduced && i !== chapter}
                  aria-hidden={(!reduced && i !== chapter) || undefined}
                >
                  {content}
                </div>
              ))}
            </div>
          </div>

          <p className="journey-credit">
            <span className="journey-credit-long">
              {t.creditLong} {featuredStudy.mapNote}{' '}
            </span>
            <span className="journey-credit-short">{t.creditShort}</span>©{' '}
            <a href={OSM} target="_blank" rel="noreferrer">
              {t.osm}
              <span className="sr-only">{ui.common.newTab}</span>
            </a>
            {t.naturalEarth}
          </p>
        </div>
      </div>

      {/* The whole account, in order, for assistive technology and search engines. */}
      <div className="sr-only">
        <h3>{study.title}</h3>
        <p>
          {`${study.subtitle} ${t.client}${colon} ${featuredStudy.client}. ${t.team}${colon} ${featuredStudy.team}.`}
        </p>
        <h4>{t.question}</h4>
        <p>{study.question}</p>
        <h4>{t.srSites}</h4>
        <ul>
          {SITES.map((s) => (
            <li key={s.id}>
              {s.name} ({SETTING[s.setting]}, {s.area})
            </li>
          ))}
        </ul>
        <h4>{t.srApproach}</h4>
        <ul>
          {featuredStudy.steps.map((s) => (
            <li key={s.title}>{`${s.title}${colon} ${s.text}`}</li>
          ))}
        </ul>
        <h4>{featuredStudy.constraintsLabel}</h4>
        <ul>
          {featuredStudy.constraints.map((c) => (
            <li key={c.id}>{`${c.label}${colon} ${c.text}`}</li>
          ))}
        </ul>
        <h4>{t.outcome}</h4>
        <p>{featuredStudy.outcome}</p>
      </div>
      <span id="apres-etude" className="journey-end" />
    </section>
  );
}
