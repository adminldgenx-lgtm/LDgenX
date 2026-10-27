import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCatalog, useRoutes } from '../i18n';
import { Photo, TextLink } from '../components/ui';
import { AnimatedHeading, useNearViewport, useSeen } from '../components/motion';
import { listedExpertises } from '../lib/expertises';

/* The expertises on the homepage, after the DNA helix: a sequencing trace, the curve a DNA
   reader draws, with one peak per expertise. The chosen expertise's peak rises in its colour and
   its card opens below; when nobody points at it, the trace moves from one to the next. The
   trace is illustrative: its peaks encode no data. The full particle landscape stays on the
   Expertises page. */

const IDS = [
  'adn-environnemental-adne',
  'genomique-des-populations',
  'analyse-des-communautes-microbiennes',
  'selection',
  'bioinformatique',
  'sequencage-dpcr',
];
// One colour per expertise, deep enough to read on the light ground.
const COLORS = ['#5f9e1f', '#3f6fb5', '#1c94a2', '#7a9e12', '#2e4d6b', '#2b7dc2'];
// The same hues, darkened for text (contrast of at least 4.5:1 on the light ground).
const INKS = ['#3d6b10', '#2f5896', '#11666f', '#4f670a', '#2e4d6b', '#1d5c93'];
// Resting heights vary a little, so the trace reads as a reading, not a chart.
const REST = [0.34, 0.42, 0.28, 0.38, 0.31, 0.4];
const PEAK = 0.94;
const CYCLE_MS = 5200;

const W = 1000,
  H = 210,
  BASE = 186,
  SIGMA = 30;
const peakX = (i: number) => ((i + 0.5) * W) / IDS.length;
// The marker sits just above its peak.
const dotY = (h: number) => BASE - h * (BASE - 18) - 8;

/** The trace through the given peak heights, with a faint ripple that moves with time. */
function tracePath(heights: number[], t: number) {
  let d = '';
  for (let x = 0; x <= W; x += 4) {
    let y = 0;
    heights.forEach((h, i) => {
      y += h * Math.exp(-((x - peakX(i)) ** 2) / (2 * SIGMA * SIGMA));
    });
    y += 0.022 * Math.sin(x * 0.045 + t * 1.3) + 0.012 * Math.sin(x * 0.13 - t * 2.1);
    d += `${x ? 'L' : 'M'}${x} ${(BASE - y * (BASE - 18)).toFixed(1)}`;
  }
  return d;
}

export function ExpertiseTrace() {
  const { copy, services, ui } = useCatalog();
  const r = useRoutes();
  const items = IDS.map((id) => services.find((s) => s.id === id)!);
  const others = listedExpertises(services).filter((s) => !IDS.includes(s.id));
  const section = useRef<HTMLElement>(null);
  const live = useNearViewport(section, '0px');
  const seen = useSeen(section);
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const cycling = live && !held;
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  // Drawn directly into the SVG: the heights ease towards their targets every frame.
  const line = useRef<SVGPathElement>(null);
  const fill = useRef<SVGPathElement>(null);
  const dots = useRef<(HTMLSpanElement | null)[]>([]);
  const heights = useRef(REST.map((h, i) => (i === 0 ? PEAK : h)));
  const target = useRef(0);
  target.current = active;

  useEffect(() => {
    const paint = (t: number) => {
      const path = tracePath(heights.current, t);
      line.current?.setAttribute('d', path);
      fill.current?.setAttribute('d', `${path}L${W} ${BASE}L0 ${BASE}Z`);
      dots.current.forEach((dot, i) => {
        dot?.style.setProperty('--y', String(dotY(heights.current[i]) / H));
      });
    };
    if (!live) {
      heights.current = REST.map((h, i) => (i === target.current ? PEAK : h));
      paint(0);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const loop = (now: number) => {
      heights.current = heights.current.map((h, i) => {
        const goal = i === target.current ? PEAK : REST[i];
        return h + (goal - h) * 0.08;
      });
      paint((now - start) / 1000);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [live]);

  useEffect(() => {
    if (!cycling) return;
    const timer = window.setTimeout(() => setActive((a) => (a + 1) % IDS.length), CYCLE_MS);
    return () => window.clearTimeout(timer);
  }, [cycling, active]);

  const choose = (i: number) => {
    setActive(i);
    setHeld(true);
  };
  const onKey = (event: KeyboardEvent) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? IDS.length - 1
          : (active + step + IDS.length) % IDS.length;
    choose(next);
    tabs.current[next]?.focus();
  };

  const service = items[active];
  const initialPath = tracePath(
    REST.map((h, i) => (i === 0 ? PEAK : h)),
    0,
  );
  return (
    <section
      ref={section}
      className="trace-section"
      data-live={live || undefined}
      data-seen={seen || undefined}
      style={
        {
          '--accent': COLORS[active],
          '--accent-ink': INKS[active],
          '--cycle': `${CYCLE_MS}ms`,
        } as CSSProperties
      }
      onPointerLeave={() => setHeld(false)}
    >
      <div className="container trace-head">
        <div>
          <p className="eyebrow">{ui.landscape.eyebrow}</p>
          <AnimatedHeading className="display-small" text={copy.home.servicesTitle} />
        </div>
        <div className="trace-head-aside">
          <p>{copy.home.servicesIntro}</p>
          <p className="trace-also">
            {ui.landscape.also}{' '}
            {others.map((s, i) => (
              <span key={s.id}>
                {i > 0 && ' · '}
                <Link to={r.service(s.id)}>{s.title}</Link>
              </span>
            ))}
          </p>
          <TextLink to={r.services}>{copy.labels.allServices}</TextLink>
        </div>
      </div>

      <div className="container trace-stage">
        <div className="trace-plot">
          <svg
            className="trace-graph"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="trace-fade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--accent)" stopOpacity="0.22" />
                <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
              <clipPath id="trace-focus">
                <rect
                  className="trace-focus-rect"
                  x={peakX(active) - SIGMA * 2.6}
                  y="0"
                  width={SIGMA * 5.2}
                  height={H}
                />
              </clipPath>
            </defs>
            <line className="trace-base" x1="0" x2={W} y1={BASE} y2={BASE} />
            <path
              ref={fill}
              className="trace-fill"
              d={`${initialPath}L${W} ${BASE}L0 ${BASE}Z`}
              clipPath="url(#trace-focus)"
            />
            <path ref={line} className="trace-line" d={initialPath} />
            <line className="trace-scan" x1="0" x2="0" y1="6" y2={BASE} />
          </svg>
          {IDS.map((id, i) => (
            <span
              key={id}
              ref={(el) => {
                dots.current[i] = el;
              }}
              className="trace-dot"
              data-active={i === active || undefined}
              aria-hidden="true"
              style={
                {
                  '--dot': COLORS[i],
                  '--x': (i + 0.5) / IDS.length,
                  '--y': dotY(i === 0 ? PEAK : REST[i]) / H,
                } as CSSProperties
              }
            />
          ))}
        </div>
        <div className="trace-tabs" role="tablist" aria-label={ui.landscape.choose}>
          {items.map((s, i) => (
            <button
              key={s.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`trace-tab-${i}`}
              aria-selected={i === active}
              aria-controls="trace-panel"
              tabIndex={i === active ? 0 : -1}
              className="trace-tab"
              style={{ '--tab': COLORS[i], '--tab-ink': INKS[i] } as CSSProperties}
              onClick={() => choose(i)}
              onPointerEnter={(e) => e.pointerType === 'mouse' && choose(i)}
              onKeyDown={onKey}
            >
              <span className="trace-tab-full">{s.title}</span>
              <span className="trace-tab-short">{ui.landscape.short[s.id] ?? s.title}</span>
              {i === active && cycling && (
                <span key={active} className="trace-timer" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="container">
        <div
          id="trace-panel"
          role="tabpanel"
          aria-labelledby={`trace-tab-${active}`}
          className="trace-panel"
          onPointerEnter={() => setHeld(true)}
        >
          <div className="trace-panel-inner" key={service.id}>
            <figure className="trace-panel-image">
              <Photo name={service.image} alt="" sizes="(max-width: 800px) 90vw, 300px" />
            </figure>
            <div className="trace-panel-body">
              <p className="trace-panel-label">{ui.landscape.cardLabel}</p>
              <h3>{service.title}</h3>
              <p className="trace-panel-text">{service.scope}</p>
            </div>
            <div className="trace-panel-side">
              <p className="trace-panel-label">{ui.landscape.approaches}</p>
              <ul className="trace-panel-tags">
                {service.approaches.slice(0, 4).map((a) => (
                  <li key={a.title}>{a.title}</li>
                ))}
              </ul>
              <Link className="trace-panel-link" to={r.service(service.id)}>
                <span>{ui.landscape.discover}</span>
                <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
