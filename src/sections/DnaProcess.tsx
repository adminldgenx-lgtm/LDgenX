import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCatalog, useRoutes } from '../i18n';
import { AnimatedHeading, useMediaQuery, useReducedMotion } from '../components/motion';
import { Eyebrow, Photo, Reveal } from '../components/ui';
import { createDnaScene, loadParticles } from '../lib/dna-scene';

/* "De l'échantillon à la décision": the seven stages told along a DNA helix lying across the
   screen, from top right to bottom left. The scene holds still while the page scrolls past it;
   scrolling moves the camera along the helix and the stages arrive in turn in the two free
   corners. Positions along the helix are chapter markers only: they map nothing in the molecule. */

// The seven steps of the workflow, the same in every catalogue.
const STAGES = 7;
const MODEL_CREDIT = 'https://sketchfab.com/3d-models/dna-547d42f6c0184232a945051b6952a39e';

type Corner = 'start' | 'end';
const cornerOf = (index: number): Corner => (index % 2 === 0 ? 'start' : 'end');

export function DnaProcess() {
  const { copy, workflow, ui } = useCatalog();
  const r = useRoutes();
  const reduced = useReducedMotion();
  const compact = useMediaQuery('(max-width: 800px)');
  const track = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState(false);
  // Each corner keeps the last stage it showed, so it can leave while showing it.
  const [shown, setShown] = useState<Record<Corner, number>>({ start: 0, end: 1 });
  const activeRef = useRef(0);

  if (shown[cornerOf(active)] !== active && !compact)
    setShown({ ...shown, [cornerOf(active)]: active });

  useEffect(() => {
    const container = track.current,
      element = canvas.current;
    if (!container || !element) return;
    let scene: ReturnType<typeof createDnaScene> = null;
    let frame = 0,
      idle = 0,
      visible = false,
      cancelled = false,
      revealStart = 0,
      pulseStart = -1e9;
    const started = performance.now();

    // Continuous position through the stages, from the scroll position alone.
    const stageNow = () => {
      if (reduced) return 0;
      const box = container.getBoundingClientRect();
      const sticky = container.firstElementChild as HTMLElement;
      const run = box.height - sticky.offsetHeight;
      const progress = run > 0 ? Math.min(1, Math.max(0, -box.top / run)) : 0;
      return Math.min(STAGES - 0.001, progress * STAGES);
    };
    const follow = (stage: number, now: number) => {
      const index = Math.floor(stage);
      if (index === activeRef.current) return;
      activeRef.current = index;
      pulseStart = now;
      setActive(index);
    };

    const draw = (now: number) => {
      const stage = stageNow();
      follow(stage, now);
      if (!scene) return;
      if (!revealStart && visible) revealStart = now;
      scene.draw({
        stage,
        time: reduced ? 0 : (now - started) / 1000,
        reveal: reduced ? 1 : revealStart ? Math.min(1, (now - revealStart) / 1800) : 0,
        pulse: reduced ? 0 : Math.max(0, 1 - (now - pulseStart) / 900),
        compact,
      });
    };
    const loop = (now: number) => {
      draw(now);
      frame = visible && !reduced ? requestAnimationFrame(loop) : 0;
    };
    const start = () => {
      if (!frame) frame = requestAnimationFrame(loop);
    };

    // The particles load when the section comes near, once the page is idle; the scene renders
    // only while it is on screen.
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        const load = () =>
          loadParticles('/models/dna-particles.bin')
            .then((particles) => {
              if (cancelled) return;
              scene = createDnaScene(element, particles);
              if (!scene) return;
              setLoaded(true);
              if (reduced || visible) draw(performance.now());
              if (visible) start();
            })
            .catch(() => {});
        idle =
          typeof window.requestIdleCallback === 'function'
            ? window.requestIdleCallback(load, { timeout: 1500 })
            : window.setTimeout(load, 200);
      },
      { rootMargin: '600px 0px' },
    );
    near.observe(container);
    const onScreen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !reduced) start();
    });
    onScreen.observe(container);
    const onScroll = () => {
      if (!reduced && visible) follow(stageNow(), performance.now());
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    const onResize = () => scene && draw(performance.now());
    window.addEventListener('resize', onResize);
    return () => {
      cancelled = true;
      near.disconnect();
      onScreen.disconnect();
      if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idle);
      window.clearTimeout(idle);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frame);
      scene?.dispose();
    };
  }, [reduced, compact]);

  // Jump to a stage: the middle of its stretch of scroll.
  const goTo = (index: number) => {
    const container = track.current;
    if (!container) return;
    const sticky = container.firstElementChild as HTMLElement;
    const run = container.offsetHeight - sticky.offsetHeight;
    const top = container.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: top + ((index + 0.5) / STAGES) * run,
      behavior: reduced ? 'auto' : 'smooth',
    });
  };

  const progress = (
    <ol className="dna-progress" aria-hidden="true">
      {workflow.map((s, i) => (
        <li key={s.title} data-state={i < active ? 'done' : i === active ? 'now' : undefined} />
      ))}
    </ol>
  );

  // The way out of the sequence, offered with the last stage.
  const cta = (
    <div className="dna-cta" data-shown={active === STAGES - 1 || undefined}>
      <Link className="dna-cta-button" to={r.contact}>
        <span>{copy.labels.contact}</span>
        <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" />
      </Link>
    </div>
  );

  return (
    <section className="dna-process" data-static={reduced || undefined}>
      <div className="container section-heading process-heading dna-process-intro">
        <div>
          <Eyebrow>{ui.dna.eyebrow}</Eyebrow>
          <AnimatedHeading className="display-large" text={copy.home.introductionTitle} />
        </div>
        <Reveal className="section-heading-aside" delay={0.1}>
          <p className="lead">{copy.home.introduction}</p>
          <p>{copy.home.introductionBody}</p>
        </Reveal>
      </div>

      <div ref={track} className="dna-track">
        <div className="dna-sticky" data-loaded={loaded || undefined}>
          <canvas ref={canvas} className="dna-canvas" aria-hidden="true" />
          {reduced ? (
            <div className="container dna-static">
              <ol className="dna-static-steps">
                {workflow.map((s, i) => (
                  <li key={s.title}>
                    <StageCard index={i} />
                  </li>
                ))}
              </ol>
            </div>
          ) : compact ? (
            <div className="dna-corner" data-corner="end" data-visible>
              {progress}
              <div aria-hidden="true">
                <StageCard index={active} key={active} side={cornerOf(active)} />
              </div>
              {cta}
            </div>
          ) : (
            (['start', 'end'] as const).map((corner) => (
              <div
                key={corner}
                className="dna-corner"
                data-corner={corner}
                data-visible={cornerOf(active) === corner || undefined}
                aria-hidden="true"
              >
                <StageCard index={shown[corner]} key={shown[corner]} side={corner} />
              </div>
            ))
          )}
          {!reduced && (
            <nav className="dna-rail" aria-label={ui.dna.rail}>
              <ol>
                {workflow.map((s, i) => (
                  <li key={s.title}>
                    <button
                      type="button"
                      aria-current={active === i ? 'step' : undefined}
                      data-done={i < active || undefined}
                      onClick={() => goTo(i)}
                    >
                      <span className="dna-rail-name">{s.title}</span>
                      <span className="dna-rail-dot" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          {!reduced && !compact && cta}
          <p className="dna-credit">
            {ui.dna.credit}{' '}
            <a href={MODEL_CREDIT} target="_blank" rel="noreferrer">
              « DNA », LucasPresoto
              <span className="sr-only">{ui.common.newTab}</span>
            </a>
            {ui.dna.creditLicence}
          </p>
        </div>
      </div>
      {!reduced && (
        <ol className="sr-only">
          {workflow.map((s) => (
            <li key={s.title}>
              {s.title}. {s.text} {s.detail}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/** One stage: its image in a bubble, the movement it belongs to, its title, its text and what
 *  it involves in practice. */
function StageCard({ index, side = 'start' }: { index: number; side?: Corner }) {
  const { workflow, ui } = useCatalog();
  const step = workflow[index];
  return (
    <article className="dna-stage" data-side={side} style={{ '--i': index } as CSSProperties}>
      <figure className="dna-bubble">
        <Photo name={step.image} alt="" sizes="152px" />
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="48.5" pathLength={1} />
        </svg>
      </figure>
      <div className="dna-stage-body">
        <p className="dna-stage-part">{ui.dna.parts[index]}</p>
        <h3>{step.title}</h3>
        <p className="dna-stage-text">{step.text}</p>
        <p className="dna-stage-detail">
          <span className="dna-stage-detail-label">{ui.dna.practice}</span>
          {step.detail}
        </p>
      </div>
    </article>
  );
}
