import { useRef } from 'react';
import { useCatalog, useRoutes } from '../i18n';
import { AnimatedHeading, useActiveRow, useReducedMotion } from '../components/motion';
import { Eyebrow, Photo, PhotoStack, TextLink } from '../components/ui';

export function Workflow() {
  const { workflow, copy, ui } = useCatalog();
  const r = useRoutes();
  const section = useRef<HTMLElement>(null);
  const rows = useRef<(HTMLDivElement | null)[]>([]);
  const active = useActiveRow(section, rows);
  const reduced = useReducedMotion();

  const goToStep = (index: number) => {
    const row = rows.current[index];
    if (!row) return;
    const bounds = row.getBoundingClientRect();
    window.scrollTo({
      top: window.scrollY + bounds.top + bounds.height / 2 - window.innerHeight * 0.52,
      behavior: reduced ? 'instant' : 'smooth',
    });
  };

  return (
    <section ref={section} className="workflow-section" id="demarche">
      <div className="container workflow-layout">
        <div className="workflow-sticky">
          <div>
            <Eyebrow>{ui.workflow.eyebrow}</Eyebrow>
            <AnimatedHeading className="display-small" text={copy.home.workflowTitle} />
            <p>{copy.home.workflowIntro}</p>
          </div>
          <PhotoStack
            className="workflow-photo"
            items={workflow.map((step) => ({ image: step.image, alt: '' }))}
            active={active}
            sizes="(max-width: 800px) 1px, 40vw"
          />
          <StagePicker active={active} onChange={goToStep} className="workflow-desktop-picker" />
          <TextLink to={r.contact}>{copy.labels.contact}</TextLink>
        </div>
        <div className="workflow-steps">
          <StagePicker active={active} onChange={goToStep} className="workflow-mobile-picker" />
          {workflow.map((step, i) => (
            <div
              ref={(el) => {
                rows.current[i] = el;
              }}
              key={step.title}
              id={`etape-${i + 1}`}
              className={`workflow-step ${active === i ? 'is-active' : ''}`}
            >
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                <figure className="workflow-mobile-photo">
                  <Photo name={step.image} alt="" sizes="(max-width: 800px) 80vw, 1px" />
                </figure>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StagePicker({
  active,
  onChange,
  className,
}: {
  active: number;
  onChange: (index: number) => void;
  className: string;
}) {
  const { workflow, visualCopy } = useCatalog();
  return (
    <label className={`workflow-stage-picker ${className}`}>
      <span>{visualCopy.workflow.caption}</span>
      <select value={active} onChange={(event) => onChange(Number(event.target.value))}>
        {workflow.map((step, i) => (
          <option key={step.title} value={i}>
            {step.title}
          </option>
        ))}
      </select>
    </label>
  );
}
