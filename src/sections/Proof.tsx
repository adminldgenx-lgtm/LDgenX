import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useCatalog, useRoutes } from '../i18n';
import type { Catalog } from '../content/catalog';
import { SectionHeading } from '../components/ui';
import { Decode } from '../components/Decode';
import {
  useEntrance,
  useNearViewport,
  usePointerVars,
  useSeen,
} from '../components/motion';

type Fact = Catalog['copy']['home']['facts'][number];

/* Key facts under the hero. Each value is read like a sequence: its letters run through the
   four bases before settling, left to right. The text itself never changes. */
export function KeyFacts() {
  const { copy, ui } = useCatalog();
  const ref = useRef<HTMLElement>(null);
  const phase = useEntrance(ref);
  const seen = useSeen(ref, '0px 0px -6% 0px');
  return (
    <section ref={ref} className="facts-band" data-phase={phase} aria-label={ui.facts.label}>
      <div className="container facts-grid">
        {copy.home.facts.map((fact, i) => (
          <FactCell key={fact.value} fact={fact} index={i} play={seen} />
        ))}
      </div>
    </section>
  );
}

function FactCell({ fact, index, play }: { fact: Fact; index: number; play: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(0);
  usePointerVars(ref);
  useEffect(() => {
    if (!play) return;
    const timer = window.setTimeout(() => setRun((r) => r + 1), 420 + index * 160);
    return () => window.clearTimeout(timer);
  }, [play, index]);
  return (
    <div
      ref={ref}
      className="fact"
      style={{ '--i': index } as CSSProperties}
      onPointerEnter={(event) => {
        if (play && event.pointerType === 'mouse') setRun((r) => r + 1);
      }}
    >
      <p className="fact-value">
        <Decode text={fact.value} run={run} />
      </p>
      <p className="fact-label">{fact.label}</p>
    </div>
  );
}

// The ecosystem: LDgenX at the centre, the three groups published on ldgenx.fr on three tilted
// orbits seen in perspective. Names in front are larger and brighter; they turn slowly, and
// pointing at a name or a group brings it forward. The real lists stay in the page for assistive
// technology and search engines; on phones the groups become three gliding rows.
const RINGS = [
  { group: 1, radius: 0.18, period: 70, direction: 1 },
  { group: 2, radius: 0.335, period: 105, direction: -1 },
  { group: 0, radius: 0.49, period: 140, direction: 1 },
];
const TILT = 0.42;
const ASPECT = 0.47; // stage height / width

export function TrustWall() {
  const { copy, ui } = useCatalog();
  const r = useRoutes();
  return (
    <section className="section-space trust-wall-section">
      <div className="container">
        <SectionHeading
          eyebrow={ui.eco.eyebrow}
          title={copy.home.trustTitle}
          body={copy.home.trustIntro}
          link={{ to: r.partners, label: ui.eco.link }}
        />
        <Ecosystem />
      </div>
    </section>
  );
}

/** The orbit itself, for the homepage and the pages about LDgenX. */
export function Ecosystem() {
  const { partners, ui } = useCatalog();
  const stage = useRef<HTMLDivElement>(null);
  const names = useRef<(HTMLSpanElement | null)[]>([]);
  const near = useNearViewport(stage, '0px');
  const seen = useSeen(stage, '0px 0px -20% 0px');
  const [focus, setFocus] = useState<number | null>(null);
  const hover = useRef(false);

  // Every name, with its ring and its share of the orbit (longer names get more room).
  const orbit = RINGS.flatMap((ring, r) => {
    const list = partners[ring.group].names;
    const weights = list.map((n) => n.length + 9);
    const total = weights.reduce((a, b) => a + b, 0);
    let at = r * 0.9;
    return list.map((name, i) => {
      const angle = at + (weights[i] / total) * Math.PI;
      at += (weights[i] / total) * Math.PI * 2;
      return { name, ring: r, group: ring.group, angle };
    });
  });

  useEffect(() => {
    const element = stage.current;
    if (!element || !near) return;
    let frame = 0,
      last = 0,
      clock = 0,
      speed = 1;
    const start = performance.now();
    const place = (now: number) => {
      const width = element.clientWidth,
        height = element.clientHeight;
      const dt = last ? Math.min(64, now - last) / 1000 : 0;
      last = now;
      speed += ((hover.current ? 0.12 : 1) - speed) * Math.min(1, dt * 3);
      clock += dt * speed;
      const intro = seen ? Math.min(1, (now - start) / 1600) : 0;
      orbit.forEach((item, i) => {
        const el = names.current[i];
        if (!el) return;
        const ring = RINGS[item.ring];
        const grow = easeOut(Math.min(1, Math.max(0, intro * 1.4 - item.ring * 0.15)));
        const theta = item.angle + (clock / ring.period) * Math.PI * 2 * ring.direction;
        const rx = width * ring.radius * grow;
        const x = width / 2 + Math.cos(theta) * rx;
        const y = height / 2 + Math.sin(theta) * rx * TILT;
        const depth = (Math.sin(theta) + 1) / 2;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${(0.74 + 0.34 * depth).toFixed(3)})`;
        el.style.setProperty('--depth', depth.toFixed(3));
        el.style.setProperty('--o', (grow * (0.28 + 0.72 * depth)).toFixed(3));
        el.style.zIndex = String(Math.round(depth * 100));
      });
      frame = requestAnimationFrame(place);
    };
    frame = requestAnimationFrame(place);
    return () => cancelAnimationFrame(frame);
    // `orbit` is derived from static content and never changes.
  }, [near, seen]);

  return (
    <div className="eco" data-focus={focus ?? undefined} data-seen={seen || undefined}>
      <div className="eco-legend" role="group" aria-label={ui.eco.groups}>
        {RINGS.map((ring) => (
          <button
            key={ring.group}
            type="button"
            aria-pressed={focus === ring.group}
            data-group={ring.group}
            onPointerEnter={(e) => e.pointerType === 'mouse' && setFocus(ring.group)}
            onPointerLeave={(e) => e.pointerType === 'mouse' && setFocus(null)}
            onClick={() => setFocus(focus === ring.group ? null : ring.group)}
          >
            {partners[ring.group].title}
          </button>
        ))}
      </div>
      <div
        ref={stage}
        className="eco-stage"
        aria-hidden="true"
        onPointerEnter={() => (hover.current = true)}
        onPointerLeave={() => (hover.current = false)}
      >
        <svg className="eco-orbits" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          {RINGS.map((ring) => (
            <ellipse
              key={ring.group}
              data-group={ring.group}
              cx="500"
              cy="500"
              rx={ring.radius * 1000}
              ry={(ring.radius * 1000 * TILT) / ASPECT}
              pathLength={1}
            />
          ))}
        </svg>
        <div className="eco-core">
          <img src="/brand/lockup-navy-160.webp" alt="" width="570" height="160" />
        </div>
        {orbit.map((item, i) => (
          <span
            key={item.name}
            ref={(el) => {
              names.current[i] = el;
            }}
            className="eco-name"
            data-group={item.group}
          >
            {item.name}
          </span>
        ))}
      </div>
      <div className="eco-rows" aria-hidden="true">
        {partners.map((group, g) => (
          <div key={group.title} className="eco-row" data-group={g}>
            <p>{group.title}</p>
            <div className="eco-lane">
              <div className="eco-track" style={{ '--count': group.names.length } as CSSProperties}>
                {[0, 1].map((copyIndex) => (
                  <span key={copyIndex}>
                    {group.names.map((name) => (
                      <span key={name}>{name}</span>
                    ))}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="sr-only">
        {partners.map((group) => (
          <div key={group.title}>
            <h3>{group.title}</h3>
            <ul>
              {group.names.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
