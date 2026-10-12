import { useRef, type CSSProperties } from 'react';
import { useEntrance } from './motion';
import { visualCopy } from '../content/visuals.fr';

function Connector() {
  return (
    <svg
      className="diagram-connector"
      viewBox="0 0 100 20"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path className="diagram-line-base" d="M0 10H100" />
      <path className="diagram-line-draw" pathLength="1" d="M0 10H100" />
    </svg>
  );
}

export function ScientificDiagram({ steps }: { steps: string[] }) {
  const ref = useRef<HTMLElement>(null);
  const phase = useEntrance(ref);
  return (
    <figure
      ref={ref}
      className="scientific-diagram research-diagram"
      data-diagram-reveal={phase}
    >
      <ol style={{ '--stage-count': steps.length } as CSSProperties}>
        {steps.map((title, i) => (
          <li key={title} style={{ '--stage-delay': `${i * 0.14}s` } as CSSProperties}>
            {i < steps.length - 1 && <Connector />}
            <h3>{title}</h3>
          </li>
        ))}
      </ol>
      <figcaption>{visualCopy.process.caption}</figcaption>
    </figure>
  );
}
