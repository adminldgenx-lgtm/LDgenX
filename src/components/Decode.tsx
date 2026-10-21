import { Fragment, useEffect, useRef, useState } from 'react';

/* Text read like a sequence: its letters run through the four bases of DNA before settling, left
   to right. The real text stays in place (transparent while it plays) for layout and assistive
   technology. */

const BASES = 'ACGT';

/** Plays the decoding over the real text, which stays in place (transparent) for layout and
 *  assistive technology. `run` replays it each time it changes. */
export function Decode({ text, run }: { text: string; run: number }) {
  const real = useRef<HTMLSpanElement>(null);
  const [glyphs, setGlyphs] = useState<{ char: string; settled: boolean; br: boolean }[] | null>(
    null,
  );
  useEffect(() => {
    if (!run) return;
    const chars = [...text];
    // The letters running through the bases are wider than most letters, so the sequence keeps
    // the real text's lines instead of wrapping on its own.
    const lineStart = linesOf(real.current, chars);
    // Long texts settle faster, so no text takes much more than a second.
    const pace = Math.min(48, 900 / Math.max(1, chars.length));
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      // A frame's time can precede `start` by a fraction of a millisecond.
      const elapsed = Math.max(0, now - start);
      const step = Math.floor(elapsed / 55);
      let done = true;
      const next = chars.map((char, i) => {
        const br = lineStart[i];
        if (!/[\p{L}\p{N}]/u.test(char) || elapsed >= 140 + i * pace)
          return { char, settled: true, br };
        done = false;
        const pick = (i * 7 + step * 13 + ((step * (i + 3)) % 5)) % 4;
        // A letter keeps its case (lowercase bases are the usual soft-masked notation), so the
        // sequence stays about as wide as the word it stands over.
        const base = /\p{Ll}/u.test(char) ? BASES[pick].toLowerCase() : BASES[pick];
        return {
          char: /\d/.test(char) ? String((step + i * 3) % 10) : base,
          settled: false,
          br,
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
      <span ref={real} className="decode-text">
        {text}
      </span>
      {glyphs && (
        <span className="decode-live" aria-hidden="true">
          {glyphs.map((g, i) => (
            <Fragment key={i}>
              {g.br && <br />}
              <span data-settled={g.settled || undefined}>{g.char}</span>
            </Fragment>
          ))}
        </span>
      )}
    </span>
  );
}

/** For each character of the text shown in `element`, whether a new line starts with it. */
function linesOf(element: HTMLElement | null, chars: string[]) {
  const starts = chars.map(() => false);
  const node = element?.firstChild;
  if (!(node instanceof Text)) return starts;
  const range = document.createRange();
  let offset = 0;
  let top: number | null = null;
  chars.forEach((char, i) => {
    range.setStart(node, offset);
    range.setEnd(node, (offset += char.length));
    const rect = range.getClientRects()[0];
    if (!rect || !/\S/.test(char)) return;
    if (top !== null && rect.top > top + rect.height / 2) starts[i] = true;
    top = rect.top;
  });
  return starts;
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
