import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog, useRoutes } from '../i18n';
import { AnimatedHeading, useNearViewport, usePointerVars } from '../components/motion';
import { Eyebrow, Reveal, TextLink } from '../components/ui';
import { createLab } from '../lib/lab-scenes';

/* "La recherche comme moteur": the two R&D projects in one lab. A switch picks the project; its
   four stages play as four scenes on one canvas, in step with their names. It plays by itself,
   holds while pointed at, and a stage can be chosen. The scenes picture the principle of each
   project, not data. */

const STEP_MS = 2400;
type Auto = 'all' | 'project' | 'off';

export function InnovationShowcase() {
  const section = useRef<HTMLElement>(null);
  const live = useNearViewport(section, '0px');
  usePointerVars(section);
  const { copy, ui } = useCatalog();
  const r = useRoutes();
  return (
    <section ref={section} className="innovation-section lab-section" data-live={live || undefined}>
      <div className="container">
        <div className="innovation-heading">
          <div>
            <Eyebrow light>{ui.lab.eyebrow}</Eyebrow>
            <AnimatedHeading className="display-large" text={copy.home.innovationTitle} />
          </div>
          <Reveal>
            <p>{copy.home.innovationIntro}</p>
            <TextLink to={r.innovations}>{copy.labels.innovation}</TextLink>
          </Reveal>
        </div>
        <Lab />
        <div className="innovation-support">
          <p>{ui.lab.support}</p>
        </div>
      </div>
    </section>
  );
}

/** The lab: both projects with a switch, or, with `only`, one project's four stages. */
export function Lab({ only }: { only?: number }) {
  const { innovations, ui } = useCatalog();
  const r = useRoutes();
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useNearViewport(root, '0px');
  const [chosen, setProject] = useState(0);
  const project = only ?? chosen;
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState<Auto>(only === undefined ? 'all' : 'project');
  const [hold, setHold] = useState(false);
  const state = useRef({ project, step });
  state.current = { project, step };
  const playing = auto !== 'off' && live && !hold;
  const current = innovations[project];

  const advance = () => {
    if (step < 3) setStep(step + 1);
    else {
      setStep(0);
      if (auto === 'all') setProject((project + 1) % innovations.length);
    }
  };

  const lab = useRef<ReturnType<typeof createLab>>(null);
  useEffect(() => {
    const element = canvas.current;
    if (!element || !live) return;
    lab.current ??= createLab(element);
    const current = lab.current;
    if (!current) return;
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
  }, [live]);

  const single = only !== undefined;
  return (
    <Reveal className={`lab ${single ? 'lab-single' : ''}`}>
      <div ref={root} className="lab-root">
        {!single && (
          <div className="lab-projects">
            <div className="lab-tabs" role="tablist" aria-label={ui.lab.projects}>
              {innovations.map((p, i) => (
                <button
                  key={p.slug}
                  type="button"
                  role="tab"
                  id={`lab-tab-${p.slug}`}
                  aria-selected={i === project}
                  aria-controls="lab-panel"
                  className="lab-project"
                  onClick={() => {
                    setProject(i);
                    setStep(0);
                    setAuto('project');
                  }}
                >
                  <span className="lab-project-label">{p.label}</span>
                  <span className="lab-project-title">{p.title}</span>
                  <span className="lab-project-headline">{p.headline}</span>
                </button>
              ))}
            </div>
            <div className="lab-about" key={current.slug}>
              <p>{current.intro}</p>
              <Link className="lab-read" to={r.innovation(current.id)}>
                {ui.lab.explore} {current.title}
              </Link>
            </div>
          </div>
        )}

        <div
          id={single ? undefined : 'lab-panel'}
          role={single ? undefined : 'tabpanel'}
          aria-labelledby={single ? undefined : `lab-tab-${current.slug}`}
          className="lab-panel"
        >
          <div
            className="lab-stage"
            onPointerEnter={(e) => e.pointerType === 'mouse' && setHold(true)}
            onPointerLeave={() => setHold(false)}
          >
            <canvas ref={canvas} className="lab-canvas" aria-hidden="true" />
          </div>
          <ol className="lab-steps" data-paused={!playing || undefined}>
            {current.steps.map((name, i) => (
              <li key={name} data-state={i < step ? 'done' : i === step ? 'now' : undefined}>
                <button
                  type="button"
                  aria-current={i === step ? 'step' : undefined}
                  onClick={() => {
                    setStep(i);
                    setAuto('off');
                  }}
                >
                  <span className="lab-step-bar" aria-hidden="true">
                    {i === step && auto !== 'off' && (
                      <span
                        key={`${project}-${step}`}
                        style={{ '--step': `${STEP_MS}ms` } as CSSProperties}
                        onAnimationEnd={advance}
                      />
                    )}
                  </span>
                  <span className="lab-step-name">{name}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Reveal>
  );
}
