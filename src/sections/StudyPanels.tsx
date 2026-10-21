import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog, useRoutes } from '../i18n';
import { useMediaQuery, useNearViewport, useReducedMotion } from '../components/motion';
import { Photo, Reveal } from '../components/ui';

/* The other studies, as tall photo panels side by side. One panel is open at a time: it widens,
   its picture drifts, and its question and facts come in. Pointing at a panel opens it; when
   nobody does, they open in turn. On phones every panel is open, one under the other. */

const CYCLE_MS = 6000;
// Scientific works that can stand among the studies, with the illustration their panel uses.
const WORK_PICTURES: Record<string, string> = { 'selection-genomique': 'cas-bar' };

type Panel = {
  key: string;
  to: string;
  image: string;
  category: string;
  title: string;
  label: string;
  question: string;
  facts: { label: string; value: string }[];
  cta: string;
};

export function StudyPanels({
  all = false,
  exclude,
  label,
  works = false,
}: {
  /** Every study, the featured one included. */
  all?: boolean;
  /** Also the scientific works that have a panel picture. */
  works?: boolean;
  /** A study not to list (the one on the page). */
  exclude?: string;
  label?: string;
}) {
  const catalog = useCatalog();
  const { featuredStudy, studies, ui } = catalog;
  const r = useRoutes();
  const items: Panel[] = [
    ...studies
      .filter((s) => s.id !== exclude && (all || s.id !== featuredStudy.slug))
      .map((s) => ({
        key: s.id,
        to: r.study(s.id),
        image: s.image,
        category: s.category,
        title: s.title,
        label: ui.panels.question,
        question: s.question,
        facts: s.facts,
        cta: ui.panels.cta,
      })),
    ...(works ? catalog.works : [])
      .filter((w) => WORK_PICTURES[w.id])
      .map((w) => ({
        key: w.id,
        to: r.work(w.id),
        image: WORK_PICTURES[w.id],
        category: w.category,
        title: w.title,
        label: ui.panels.work,
        question: w.summary,
        facts: w.facts,
        cta: ui.panels.workCta,
      })),
  ];
  const ref = useRef<HTMLDivElement>(null);
  const live = useNearViewport(ref, '0px');
  const reduced = useReducedMotion();
  const stacked = useMediaQuery('(max-width: 800px)');
  const [open, setOpen] = useState(0);
  const [held, setHeld] = useState(false);
  const cycling = live && !held && !reduced && !stacked;

  useEffect(() => {
    if (!cycling) return;
    const timer = window.setTimeout(() => setOpen((o) => (o + 1) % items.length), CYCLE_MS);
    return () => window.clearTimeout(timer);
  }, [cycling, open, items.length]);

  return (
    <section className="study-panels-block" aria-labelledby="study-panels-title">
      <div className="study-panels-head">
        <p className="study-case-label" id="study-panels-title">
          {label ?? ui.panels.label}
        </p>
      </div>
      <div
        ref={ref}
        className="study-panels"
        data-cycling={cycling || undefined}
        onPointerLeave={() => setHeld(false)}
      >
        {items.map((study, i) => (
          <Reveal key={study.key} className="study-panel-slot" delay={i * 0.1}>
            <Link
              className="study-panel"
              to={study.to}
              data-open={stacked || open === i || undefined}
              style={{ '--cycle': `${CYCLE_MS}ms` } as CSSProperties}
              onPointerEnter={(e) => {
                if (e.pointerType !== 'mouse') return;
                setOpen(i);
                setHeld(true);
              }}
              onFocus={() => {
                setOpen(i);
                setHeld(true);
              }}
              onBlur={() => setHeld(false)}
            >
              <span className="study-panel-picture">
                <Photo name={study.image} alt="" sizes="(max-width: 800px) 92vw, 50vw" />
              </span>
              <span className="study-panel-shade" aria-hidden="true" />
              {open === i && cycling && (
                <span key={open} className="study-panel-timer" aria-hidden="true" />
              )}
              <span className="study-panel-body">
                <span className="study-panel-category">{study.category}</span>
                <h3>{study.title}</h3>
                <span className="study-panel-more">
                  <span className="study-panel-more-inner">
                    <span className="study-panel-question">
                      <span>{study.label}</span>
                      {study.question}
                    </span>
                    <span className="study-panel-facts">
                      {study.facts.map((f) => (
                        <span key={f.label}>
                          <span>{f.label}</span>
                          {f.value}
                        </span>
                      ))}
                    </span>
                    <span className="study-panel-link">{study.cta}</span>
                  </span>
                </span>
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
