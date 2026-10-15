import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Pause, Play } from 'lucide-react';
import { useCatalog, useRoutes } from '../i18n';
import { Button, Eyebrow, Photo, Reveal } from '../components/ui';
import { AnimatedHeading, useNearViewport, useReducedMotion } from '../components/motion';

/* "Votre espèce cible, un test ADN sur mesure": the four steps of developing a targeted assay,
   told by a small scene. The species' own region lights up, two primers frame it and a probe
   settles on it, a related species is not recognised, then dPCR partitions light up. The scene
   is an illustration of the principle; it shows no measurement. */

const STEP_MS = 3600;
// Partitions lit in the last step: a fixed, illustrative pattern (no count is implied).
const LIT = new Set([3, 8, 14, 17, 22, 29, 33, 38, 41, 47, 52, 58, 61, 66]);

export function CustomAssay() {
  const { customAssay: t } = useCatalog();
  const r = useRoutes();
  const section = useRef<HTMLElement>(null);
  const live = useNearViewport(section, '0px');
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [held, setHeld] = useState(false);
  const [paused, setPaused] = useState(false);
  const [target, setTarget] = useState(t.targets[0]?.id ?? '');
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const playing = live && !held && !paused && !reduced;

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
    if (!delta) return;
    event.preventDefault();
    const next = (step + delta + t.steps.length) % t.steps.length;
    choose(next);
    tabs.current[next]?.focus();
  };
  const current = t.targets.find((x) => x.id === target);

  return (
    <section
      ref={section}
      id={t.anchor}
      className="section-space assay-section"
      aria-labelledby="assay-title"
    >
      <div className="container">
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
          </Reveal>
        </div>

        <div className="assay-layout">
          <div
            className="assay-visual"
            onPointerEnter={(e) => e.pointerType === 'mouse' && setHeld(true)}
            onPointerLeave={() => setHeld(false)}
          >
            {t.targets.length > 0 && (
              <div className="assay-targets" role="group" aria-label={t.targetsLabel}>
                <p className="assay-targets-label">{t.targetsLabel}</p>
                <div className="assay-target-list">
                  {t.targets.map((x) => (
                    <button
                      key={x.id}
                      type="button"
                      className="assay-target"
                      aria-pressed={target === x.id}
                      onClick={() => setTarget(x.id)}
                    >
                      {x.image && (
                        <span className="assay-target-picture">
                          <Photo name={x.image} alt="" sizes="48px" />
                        </span>
                      )}
                      <span>
                        <span className="assay-target-name">{x.name}</span>
                        {x.latin && (
                          <em className="assay-target-latin" lang="la">
                            {x.latin}
                          </em>
                        )}
                        {x.status && <span className="assay-target-status">{x.status}</span>}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
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

/** The homepage's way to the module. */
export function CustomAssayTeaser() {
  const { customAssay: t, services } = useCatalog();
  const r = useRoutes();
  const service = services.find((s) => s.id === 'sequencage-dpcr');
  if (!service) return null;
  return (
    <section className="assay-teaser">
      <div className="container">
        <Link className="assay-teaser-link" to={`${r.service(service.id)}#${t.anchor}`}>
          <span className="assay-teaser-eyebrow">{t.home.eyebrow}</span>
          <span className="assay-teaser-title">{t.home.title}</span>
          <span className="assay-teaser-text">{t.home.text}</span>
          <span className="assay-teaser-more">
            {t.home.link}
            <ArrowRight size={17} aria-hidden="true" />
          </span>
        </Link>
      </div>
    </section>
  );
}
