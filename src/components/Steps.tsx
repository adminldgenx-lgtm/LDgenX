import { useRef, type CSSProperties } from 'react';
import { useActiveRow, useEntrance } from './motion';

/* Steps that light up as they are read: the row nearest the reading line comes forward, a rail
   on the left fills down to it, the rows already read stay marked. Rows enter in turn. */
export function StepRows({
  items,
  as: Heading = 'h3',
  className = '',
}: {
  items: { title: string; text: string }[];
  as?: 'h2' | 'h3';
  className?: string;
}) {
  const section = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLDivElement | null)[]>([]);
  const active = useActiveRow(section, rows);
  const phase = useEntrance(section);
  return (
    <div
      ref={section}
      className={`step-rows ${className}`}
      data-phase={phase}
      style={{ '--fill': (active + 1) / items.length } as CSSProperties}
    >
      <span className="step-rows-rail" aria-hidden="true" />
      {items.map((item, i) => (
        <div
          key={item.title}
          ref={(el) => {
            rows.current[i] = el;
          }}
          className="step-row"
          data-state={i < active ? 'done' : i === active ? 'now' : undefined}
          style={{ '--i': i } as CSSProperties}
        >
          <Heading>{item.title}</Heading>
          <p>{item.text}</p>
        </div>
      ))}
    </div>
  );
}

/** A list whose items arrive one after another, each drawing its line. */
export function LiveList({ items, className = '' }: { items: string[]; className?: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const phase = useEntrance(ref);
  return (
    <ul ref={ref} className={`live-list ${className}`} data-phase={phase}>
      {items.map((item, i) => (
        <li key={item} style={{ '--i': i } as CSSProperties}>
          {item}
        </li>
      ))}
    </ul>
  );
}
