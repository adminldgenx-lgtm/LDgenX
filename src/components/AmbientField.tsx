import { useEffect, useRef } from 'react';
import { useNearViewport, useReducedMotion } from './motion';

/* A quiet living background for page heroes and closing sections: a double helix of points
   lying across the area, turning slowly, with a little loose dust around it. Points near the
   pointer step aside and brighten. It runs only on screen; with reduced motion it is drawn once,
   still. Decoration only. */

type Tone = 'light' | 'dark';

const PAIRS = 70;
const DUST = 46;

export function AmbientField({
  tone = 'light',
  lane = 'diagonal',
  className = '',
}: {
  tone?: Tone;
  /** Diagonal across the area, or low along its bottom edge, under any text. */
  lane?: 'diagonal' | 'bottom';
  className?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const near = useNearViewport(canvas, '80px 0px');
  const reduced = useReducedMotion();

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!element || !context || (!near && !reduced)) return;
    let width = 0,
      height = 0,
      frame = 0,
      mx = -1e4,
      my = -1e4;
    const dust = Array.from({ length: DUST }, (_, i) => ({
      x: ((i * 0.618) % 1) + 0.0,
      y: (i * 0.377) % 1,
      v: 0.00012 + ((i * 7) % 5) * 0.00005,
    }));
    const ink = tone === 'dark' ? '214, 236, 246' : '3, 37, 75';
    const accent = tone === 'dark' ? '166, 215, 91' : '42, 116, 22';
    const resize = () => {
      const box = element.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = box.width;
      height = box.height;
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    const host = element.parentElement;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const box = element.getBoundingClientRect();
      mx = e.clientX - box.left;
      my = e.clientY - box.top;
    };
    const leave = () => {
      mx = my = -1e4;
    };
    host?.addEventListener('pointermove', move);
    host?.addEventListener('pointerleave', leave);

    const draw = (now: number) => {
      const t = reduced ? 0 : now / 1000;
      context.clearRect(0, 0, width, height);
      // The helix lies along a gentle diagonal, from lower left to upper right, or low and flat.
      const low = lane === 'bottom';
      const ax = width * 0.02,
        ay = height * (low ? 0.9 : 0.78),
        bx = width * 0.98,
        by = height * (low ? 0.84 : 0.26);
      const dx = bx - ax,
        dy = by - ay;
      const length = Math.hypot(dx, dy);
      const nx = -dy / length,
        ny = dx / length;
      const amplitude = low ? Math.min(height * 0.06, 26) : Math.min(height * 0.2, 90);
      const points: { x: number; y: number; depth: number; strand: number }[] = [];
      for (let i = 0; i < PAIRS; i++) {
        const s = (i / PAIRS + t * 0.008) % 1;
        const phase = s * Math.PI * 2 * 3.2 + t * 0.6;
        for (const strand of [-1, 1]) {
          const offset = Math.sin(phase) * amplitude * strand;
          let x = ax + dx * s + nx * offset,
            y = ay + dy * s + ny * offset;
          const pdx = x - mx,
            pdy = y - my;
          const d = Math.hypot(pdx, pdy);
          if (d < 130 && d > 0) {
            const push = (1 - d / 130) * 18;
            x += (pdx / d) * push;
            y += (pdy / d) * push;
          }
          points.push({ x, y, depth: Math.cos(phase) * strand, strand });
        }
      }
      // Rungs between the two strands.
      context.lineWidth = 1;
      for (let i = 0; i < points.length; i += 2) {
        const a = points[i],
          b = points[i + 1];
        const fade = Math.min(1, Math.min(a.x, width - a.x) / 120);
        context.strokeStyle = `rgba(${ink}, ${0.07 * fade})`;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const fade = Math.min(1, Math.min(p.x, width - p.x) / 120);
        const near = Math.max(0, 1 - Math.hypot(p.x - mx, p.y - my) / 160);
        const front = (p.depth + 1) / 2;
        const marked = Math.floor(i / 2) % 9 === 4;
        context.fillStyle = `rgba(${marked ? accent : ink}, ${fade * (0.12 + 0.3 * front + 0.4 * near)})`;
        context.beginPath();
        context.arc(p.x, p.y, 1.2 + 1.6 * front + (marked ? 0.8 : 0), 0, Math.PI * 2);
        context.fill();
      }
      for (const d of dust) {
        const x = ((d.x + t * d.v * 60) % 1) * width,
          y = (d.y + Math.sin(t * 0.3 + d.x * 9) * 0.02) * height;
        context.fillStyle = `rgba(${ink}, 0.14)`;
        context.beginPath();
        context.arc(x, y, 1.1, 0, Math.PI * 2);
        context.fill();
      }
    };
    const loop = (now: number) => {
      draw(now);
      frame = requestAnimationFrame(loop);
    };
    if (reduced) draw(0);
    else frame = requestAnimationFrame(loop);
    const observer = new ResizeObserver(() => {
      resize();
      if (reduced) draw(0);
    });
    observer.observe(element);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      host?.removeEventListener('pointermove', move);
      host?.removeEventListener('pointerleave', leave);
    };
  }, [near, reduced, tone, lane]);

  return <canvas ref={canvas} className={`ambient-field ${className}`} aria-hidden="true" />;
}
