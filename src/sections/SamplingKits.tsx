import { useRef, type CSSProperties } from 'react';
import { useCatalog, useRoutes } from '../i18n';
import { Button, Eyebrow, Reveal } from '../components/ui';
import { AnimatedHeading, useNearViewport } from '../components/motion';

/* The sampling kits, one per environment. Each card carries a small moving texture of its
   environment (swell, current, grains, drifting particles): an evocation, not a picture of the
   kit, whose contents are agreed with the team for each protocol. */

function Texture({ kind }: { kind: string }) {
  if (kind === 'eau-de-mer')
    return (
      <svg viewBox="0 0 240 90" aria-hidden="true" className="kit-texture kit-sea">
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M-60 ${30 + i * 14} q30 -12 60 0 t60 0 t60 0 t60 0 t60 0 t60 0`}
            style={{ '--i': i } as CSSProperties}
          />
        ))}
      </svg>
    );
  if (kind === 'eau-douce')
    return (
      <svg viewBox="0 0 240 90" aria-hidden="true" className="kit-texture kit-river">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line
            key={i}
            x1="-40"
            x2="40"
            y1={14 + i * 12}
            y2={14 + i * 12}
            style={{ '--i': i } as CSSProperties}
          />
        ))}
      </svg>
    );
  if (kind === 'sol')
    return (
      <svg viewBox="0 0 240 90" aria-hidden="true" className="kit-texture kit-soil">
        {Array.from({ length: 34 }, (_, i) => (
          <circle
            key={i}
            cx={(i * 53) % 236}
            cy={18 + ((i * 29) % 66)}
            r={2 + (i % 4)}
            style={{ '--i': i % 7 } as CSSProperties}
          />
        ))}
      </svg>
    );
  return (
    <svg viewBox="0 0 240 90" aria-hidden="true" className="kit-texture kit-air">
      {Array.from({ length: 22 }, (_, i) => (
        <circle
          key={i}
          cx={(i * 41) % 236}
          cy={10 + ((i * 37) % 72)}
          r={1.4 + (i % 3) * 0.8}
          style={{ '--i': i % 9 } as CSSProperties}
        />
      ))}
    </svg>
  );
}

export function SamplingKits() {
  const { samplingKits: t } = useCatalog();
  const r = useRoutes();
  const ref = useRef<HTMLDivElement>(null);
  const live = useNearViewport(ref, '0px');
  return (
    <section className="section-space kits-section" aria-labelledby="kits-title">
      <div className="container">
        <div className="kits-head">
          <div>
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <AnimatedHeading text={t.title} />
            <h2 id="kits-title" className="sr-only">
              {t.title}
            </h2>
          </div>
          <Reveal delay={0.1}>
            <p>{t.intro}</p>
            <Button to={r.contact} variant="outline">
              {t.action}
            </Button>
          </Reveal>
        </div>
        <div ref={ref} className="kits-grid" data-live={live || undefined}>
          {t.kits.map((kit, i) => (
            <Reveal key={kit.id} delay={i * 0.07} className="kit-card">
              <Texture kind={kit.id} />
              <h3>{kit.name}</h3>
              <p>{kit.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
