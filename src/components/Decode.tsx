import { useEffect, useState } from 'react';

/* Text read like a sequence: its letters run through the four bases of DNA before settling, left
   to right. The real text stays in place (transparent while it plays) for layout and assistive
   technology. */

const BASES = 'ACGT';

/** Plays the decoding over the real text, which stays in place (transparent) for layout and
 *  assistive technology. `run` replays it each time it changes. */
export function Decode({ text, run }: { text: string; run: number }) {
  const [glyphs, setGlyphs] = useState<{ char: string; settled: boolean }[] | null>(null);
  useEffect(() => {
    if (!run) return;
    const chars = [...text];
    // Long texts settle faster, so no text takes much more than a second.
    const pace = Math.min(48, 900 / Math.max(1, chars.length));
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const step = Math.floor(elapsed / 55);
      let done = true;
      const next = chars.map((char, i) => {
        if (!/[\p{L}\p{N}]/u.test(char) || elapsed >= 140 + i * pace)
          return { char, settled: true };
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

/** Decodes once, `delay` ms after `play` turns true. */
export function DecodeOnce({
  text,
  play,
  delay = 0,
}: {
  text: string;
  play: boolean;
  delay?: number;
}) {
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (!play) return;
    const timer = window.setTimeout(() => setRun(1), delay);
    return () => window.clearTimeout(timer);
  }, [play, delay]);
  return <Decode text={text} run={run} />;
}
