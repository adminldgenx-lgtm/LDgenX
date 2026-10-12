import { useRef, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { copy, innovations } from '../content/fr';
import { AnimatedHeading, useNearViewport, usePointerVars } from '../components/motion';
import { Eyebrow, Reveal, TextLink } from '../components/ui';

/* "La recherche comme moteur": the two R&D projects, each with a moving illustration of its
   idea and its four stages as a pipeline that a signal runs through. The illustrations are
   pictures of the principle (long reads being read; a clock of marks on the DNA), not data. */

export function InnovationShowcase() {
  const ref = useRef<HTMLElement>(null);
  const live = useNearViewport(ref, '0px');
  usePointerVars(ref);
  return (
    <section ref={ref} className="innovation-section" data-live={live || undefined}>
      <div className="container">
        <div className="innovation-heading">
          <div>
            <Eyebrow light>La recherche comme moteur</Eyebrow>
            <AnimatedHeading className="display-large" text={copy.home.innovationTitle} />
          </div>
          <Reveal>
            <p>{copy.home.innovationIntro}</p>
            <TextLink to="/innovation">{copy.labels.innovation}</TextLink>
          </Reveal>
        </div>
        <div className="innovation-projects">
          {innovations.map((project, i) => (
            <Reveal key={project.slug} delay={i * 0.12}>
              <Link className="innovation-project" to={`/innovation/${project.slug}`}>
                <div className="innovation-visual" aria-hidden="true">
                  {i === 0 ? <ReadsVisual /> : <ClockVisual />}
                </div>
                <span className="item-category">{project.label}</span>
                <h3>{project.title}</h3>
                <p>{project.intro}</p>
                <ol className="innovation-pipeline">
                  {project.steps.map((step, k) => (
                    <li key={step} style={{ '--i': k } as CSSProperties}>
                      {step}
                    </li>
                  ))}
                </ol>
                <span className="innovation-read">Explorer le projet</span>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="innovation-support">
          <p>Recherche soutenue par Bpifrance et Créalia Occitanie.</p>
        </div>
      </div>
    </section>
  );
}

// A small seeded generator: the same picture on the server and in the browser.
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const READ_COLOURS = ['#73b50f', '#4f9fc4', '#c3dc9c', '#2f6f99'];
const READS = (() => {
  const random = seeded(7);
  return Array.from({ length: 7 }, (_, row) => {
    const segments: { x: number; width: number; colour: string; opacity: number }[] = [];
    let x = random() * 20;
    while (x < 560) {
      const width = 10 + random() * 64;
      segments.push({
        x,
        width: Math.min(width, 560 - x),
        colour: READ_COLOURS[Math.floor(random() * READ_COLOURS.length)],
        opacity: 0.35 + random() * 0.5,
      });
      x += width + 5 + random() * 12;
    }
    return { y: 30 + row * 20, duration: 16 + random() * 14, segments };
  });
})();

/** DNA EcoTrace: long reads stream past a reading head, which lights them as they cross. */
function ReadsVisual() {
  const rows = (bright: boolean) =>
    READS.map((row, r) => (
      <g
        key={r}
        className="reads-row"
        style={{ animationDuration: `${row.duration.toFixed(1)}s` } as CSSProperties}
      >
        {[0, 560].map((offset) =>
          row.segments.map((s, k) => (
            <rect
              key={`${offset}-${k}`}
              x={s.x + offset}
              y={row.y}
              width={s.width}
              height={6}
              rx={3}
              fill={bright ? '#e9f6d2' : s.colour}
              opacity={bright ? 1 : s.opacity}
            />
          )),
        )}
      </g>
    ));
  return (
    <svg className="reads-visual" viewBox="0 0 560 180" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="reads-fade" x1="0" x2="1">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.18" stopColor="white" stopOpacity="1" />
          <stop offset="0.82" stopColor="white" stopOpacity="1" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="reads-mask">
          <rect width="560" height="180" fill="url(#reads-fade)" />
        </mask>
        <clipPath id="reads-head">
          <rect x="326" y="0" width="22" height="180" />
        </clipPath>
        <linearGradient id="reads-glow" x1="0" x2="1">
          <stop offset="0" stopColor="#73b50f" stopOpacity="0" />
          <stop offset="0.5" stopColor="#73b50f" stopOpacity="0.32" />
          <stop offset="1" stopColor="#73b50f" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g mask="url(#reads-mask)">
        <g className="reads-stream">{rows(false)}</g>
        <rect
          className="reads-head-glow"
          x="300"
          y="12"
          width="74"
          height="156"
          fill="url(#reads-glow)"
        />
        <g clipPath="url(#reads-head)">
          <g className="reads-stream">{rows(true)}</g>
        </g>
        <line className="reads-head" x1="337" x2="337" y1="14" y2="166" />
      </g>
    </svg>
  );
}

/** eDNAClock: a hand sweeps a ring of marks, which glow as it passes and slowly fade; growth
 *  rings widen from the centre. */
function ClockVisual() {
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const angle = (i / 72) * Math.PI * 2 - Math.PI / 2;
    const long = i % 6 === 0;
    const r1 = long ? 54 : 58,
      r2 = 68;
    return {
      x1: 280 + Math.cos(angle) * r1,
      y1: 90 + Math.sin(angle) * r1,
      x2: 280 + Math.cos(angle) * r2,
      y2: 90 + Math.sin(angle) * r2,
      i,
    };
  });
  return (
    <svg className="clock-visual" viewBox="0 0 560 180" preserveAspectRatio="xMidYMid slice">
      <g className="clock-rings">
        {[0, 1, 2].map((k) => (
          <circle
            key={k}
            cx="280"
            cy="90"
            r="44"
            style={{ animationDelay: `${k * 2}s` } as CSSProperties}
          />
        ))}
      </g>
      <circle className="clock-track" cx="280" cy="90" r="76" />
      <g className="clock-ticks">
        {ticks.map((t) => (
          <line key={t.i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
        ))}
      </g>
      <g className="clock-marks">
        {ticks.map((t) => (
          <line
            key={t.i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            style={{ animationDelay: `${((t.i / 72) * 12 - 12).toFixed(3)}s` } as CSSProperties}
          />
        ))}
      </g>
      <g className="clock-hand">
        <line x1="280" y1="90" x2="280" y2="16" />
      </g>
      <circle className="clock-centre" cx="280" cy="90" r="3.5" />
    </svg>
  );
}
