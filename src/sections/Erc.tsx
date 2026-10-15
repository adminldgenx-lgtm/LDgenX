import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useCatalog } from '../i18n';
import { Eyebrow, Reveal } from '../components/ui';
import { AnimatedHeading } from '../components/motion';

/* "Des données pour éclairer la séquence ERC": three moments of a project (baseline, monitoring,
   measures). Choosing one moves the line along the project and lights the steps of the
   "Éviter, Réduire, Compenser" sequence it informs; the text says what the analyses bring and
   what is delivered. */

export function ErcModule() {
  const { erc, ui } = useCatalog();
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const state = erc.states[active];
  const onKey = (event: KeyboardEvent) => {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (active + delta + erc.states.length) % erc.states.length;
    setActive(next);
    tabs.current[next]?.focus();
  };
  return (
    <section className="section-space erc-section" aria-labelledby="erc-title">
      <div className="container">
        <div className="erc-head">
          <div>
            <Eyebrow>{erc.eyebrow}</Eyebrow>
            <AnimatedHeading text={erc.title} />
            <h2 id="erc-title" className="sr-only">
              {erc.title.replace('\n', ' ')}
            </h2>
          </div>
          <Reveal delay={0.1}>
            <p>{erc.intro}</p>
          </Reveal>
        </div>

        <div
          className="erc-board"
          style={{ '--at': active / (erc.states.length - 1) } as CSSProperties}
        >
          <ol className="erc-letters" aria-label="Éviter, Réduire, Compenser">
            {erc.letters.map((word, i) => (
              <li key={word} data-on={state.letters.includes(i) || undefined}>
                <span className="erc-letter" aria-hidden="true">
                  {word[0]}
                </span>
                <span className="erc-word">{word}</span>
              </li>
            ))}
          </ol>
          <div className="erc-timeline">
            <span className="erc-rail" aria-hidden="true">
              <span className="erc-rail-fill" />
            </span>
            <div className="erc-states" role="tablist" aria-label={erc.statesLabel}>
              {erc.states.map((s, i) => (
                <button
                  key={s.label}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`erc-tab-${i}`}
                  aria-selected={i === active}
                  aria-controls="erc-panel"
                  tabIndex={i === active ? 0 : -1}
                  className="erc-state"
                  data-past={i < active || undefined}
                  onClick={() => setActive(i)}
                  onKeyDown={onKey}
                >
                  <span className="erc-dot" aria-hidden="true" />
                  <span className="erc-moment">{s.moment}</span>
                  <span className="erc-label">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div
            id="erc-panel"
            role="tabpanel"
            aria-labelledby={`erc-tab-${active}`}
            className="erc-panel"
          >
            <div className="erc-panel-inner" key={active}>
              <p className="erc-text">{state.text}</p>
              <div className="erc-deliverable">
                <span>{erc.deliverableLabel}</span>
                {state.deliverable}
              </div>
            </div>
          </div>
        </div>

        <div className="erc-notes">
          <p>{erc.caution}</p>
          <p>{erc.role}</p>
          <a className="source-link" href={erc.source.url} target="_blank" rel="noreferrer">
            {erc.source.label}
            <ArrowUpRight size={14} aria-hidden="true" />
            <span className="sr-only">{ui.common.newTab}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
