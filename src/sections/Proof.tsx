import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { copy, partners } from '../content/fr';
import { Reveal, SectionHeading } from '../components/ui';
import { useEntrance, usePointerVars, useReducedMotion, useSeen } from '../components/motion';

type Fact = (typeof copy.home.facts)[number];

/* Key facts under the hero. Each value is read like a sequence: its letters run through the
   four bases before settling, left to right. The text itself never changes. */
export function KeyFacts() {
  const ref = useRef<HTMLElement>(null);
  const phase = useEntrance(ref);
  const reduced = useReducedMotion();
  const seen = useSeen(ref, '0px 0px -6% 0px');
  return (
    <section ref={ref} className="facts-band" data-phase={phase} aria-label="LDgenX en bref">
      <div className="container facts-grid">
        {copy.home.facts.map((fact, i) => (
          <FactCell key={fact.value} fact={fact} index={i} play={seen && !reduced} />
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

const BASES = 'ACGT';

/** Plays the decoding over the real text, which stays in place (transparent) for layout and
 *  assistive technology. `run` replays it each time it changes. */
function Decode({ text, run }: { text: string; run: number }) {
  const [glyphs, setGlyphs] = useState<{ char: string; settled: boolean }[] | null>(null);
  useEffect(() => {
    if (!run) return;
    const chars = [...text];
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const step = Math.floor(elapsed / 55);
      let done = true;
      const next = chars.map((char, i) => {
        if (!/[\p{L}\p{N}]/u.test(char) || elapsed >= 140 + i * 48) return { char, settled: true };
        done = false;
        const pick = (i * 7 + step * 13 + ((step * (i + 3)) % 5)) % 4;
        return {
          char: /\d/.test(char) ? String((step + i * 3) % 10) : BASES[pick],
          settled: false,
        };
      });
      setGlyphs(done ? null : next);
      if (!done) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [run, text]);
  return (
    <span className="decode" data-running={glyphs ? '' : undefined}>
      <span className="decode-text">{text}</span>
      {glyphs && (
        <span className="decode-live" aria-hidden="true">
          {glyphs.map((g, i) => (
            <span key={i} data-settled={g.settled || undefined}>
              {g.char}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}

// Partner names are typeset: the published logos are low-resolution composites.
export function TrustWall() {
  return (
    <section className="section-space trust-wall-section">
      <div className="container">
        <SectionHeading
          eyebrow="Références & écosystème"
          title={copy.home.trustTitle}
          body={copy.home.trustIntro}
          link={{ to: '/a-propos/partenaires', label: 'Découvrir nos partenaires' }}
        />
        <div className="trust-rows">
          {partners.map((group, i) => (
            <Reveal key={group.title} className="trust-row" delay={i * 0.06}>
              <h3 className="trust-row-title">{group.title}</h3>
              <ul>
                {group.names.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
