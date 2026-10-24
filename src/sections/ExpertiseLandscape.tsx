import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCatalog, useRoutes } from '../i18n';
import type { Expertise } from '../content/fr';
import { Photo, TextLink } from '../components/ui';
import { AnimatedHeading, useMediaQuery, useMotionLevel, usePresence } from '../components/motion';

/* An illustrative landscape: one summit per discipline, drawn as particles on a canvas with a
   hand-made perspective camera. It encodes no data, axis or measurement; it is a way in.
   On arrival the particles gather as a globe, then spread into the landscape. */

type RGB = [number, number, number];
type Peak = { slug: string; short: string; x: number; z: number; h: number; s: number; rgb: RGB };

// Near summits are low and far ones high, alternating across the width, so labels never meet.
const PEAKS: Peak[] = [
  {
    slug: 'adn-environnemental-adne',
    short: 'ADNe',
    x: -0.8,
    z: 0.26,
    h: 0.44,
    s: 0.17,
    rgb: [143, 209, 79],
  },
  {
    slug: 'genomique-des-populations',
    short: 'Populations',
    x: -0.44,
    z: 1.0,
    h: 0.74,
    s: 0.16,
    rgb: [170, 200, 255],
  },
  {
    slug: 'analyse-des-communautes-microbiennes',
    short: 'Microbiomes',
    x: -0.08,
    z: 0.44,
    h: 0.3,
    s: 0.13,
    rgb: [111, 214, 224],
  },
  {
    slug: 'selection',
    short: 'Sélection',
    x: 0.24,
    z: 1.06,
    h: 0.58,
    s: 0.15,
    rgb: [178, 224, 106],
  },
  {
    slug: 'bioinformatique',
    short: 'Bioinformatique',
    x: 0.52,
    z: 0.3,
    h: 0.46,
    s: 0.16,
    rgb: [228, 236, 244],
  },
  {
    slug: 'sequencage-dpcr',
    short: 'Séquençage',
    x: 0.98,
    z: 0.82,
    h: 0.6,
    s: 0.15,
    rgb: [124, 196, 255],
  },
];
// Summits are matched to expertises by id, the same in every language.
type Item = { peak: Peak; service: Expertise };

const BASE: RGB = [96, 140, 186];
const SELECTED: RGB = [150, 222, 74];
const INTRO_MS = 1300;
const INTRO_SPREAD = 0.35; // share of the intro over which particles leave one after another

function influence(peak: Peak, x: number, z: number) {
  return Math.exp(-((x - peak.x) ** 2 + (z - peak.z) ** 2) / (2 * peak.s * peak.s));
}
function height(x: number, z: number) {
  let h = 0;
  for (const p of PEAKS) h += p.h * influence(p, x, z);
  return (
    h +
    0.035 * Math.sin(x * 4.1 + 0.7) * Math.cos(z * 5.3 - 0.4) +
    0.018 * Math.sin(x * 9.7 + z * 7.1)
  );
}

// Seeded so the landscape is the same on every visit.
function random(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Field = {
  count: number;
  x: Float32Array;
  y: Float32Array;
  z: Float32Array;
  /** Position on the globe the particles start from. */
  gx: Float32Array;
  gy: Float32Array;
  gz: Float32Array;
  delay: Float32Array;
  phase: Float32Array;
  speed: Float32Array;
  size: Float32Array;
  /** Particles grouped by colour, so the canvas changes fill style a few hundred times only. */
  buckets: { style: string; index: Uint32Array }[];
  /** Particles of each summit, redrawn in green when it is chosen. */
  regions: Uint32Array[];
  lines: Float32Array[];
};

const GLOBE = { x: 0.08, y: 0.5, z: 0.6, r: 0.42 };

function buildField(count: number): Field {
  const rand = random(7);
  const gauss = () => Math.sqrt(-2 * Math.log(rand() + 1e-9)) * Math.cos(2 * Math.PI * rand());
  const f = {
    x: new Float32Array(count),
    y: new Float32Array(count),
    z: new Float32Array(count),
    gx: new Float32Array(count),
    gy: new Float32Array(count),
    gz: new Float32Array(count),
    delay: new Float32Array(count),
    phase: new Float32Array(count),
    speed: new Float32Array(count),
    size: new Float32Array(count),
  };
  const styles = new Map<string, number[]>();
  const regions: number[][] = PEAKS.map(() => []);
  let n = 0;
  while (n < count) {
    let px: number, pz: number, py: number;
    if (rand() < 0.16) {
      // Dense crowns on the summits.
      const p = PEAKS[Math.floor(rand() * PEAKS.length)];
      px = p.x + gauss() * p.s * 0.32;
      pz = p.z + gauss() * p.s * 0.32;
      py = height(px, pz) + Math.abs(gauss()) * 0.022;
    } else {
      px = -1.4 + rand() * 2.8;
      pz = -0.2 + rand() * 1.5;
      const h = height(px, pz);
      if (rand() > 0.1 + 0.9 * Math.min(1, Math.max(0, h) / 0.45) ** 1.2) continue;
      py = h + rand() ** 3 * 0.03;
    }
    let region = -1,
      best = 0.2;
    PEAKS.forEach((p, i) => {
      const w = influence(p, px, pz);
      if (w > best) {
        best = w;
        region = i;
      }
    });
    const mix = region < 0 ? 0 : Math.min(1, best * 1.15);
    const tone = region < 0 ? BASE : PEAKS[region].rgb;
    const lift = Math.max(0, (py - 0.35) * 0.9);
    const rgb = BASE.map((b, k) => {
      const c = b + (tone[k] - b) * mix;
      return Math.round((c + (255 - c) * lift) / 12) * 12;
    });
    const depth = 1 - Math.min(1, Math.max(0, (pz + 0.2) / 1.5));
    const alpha = Math.round((0.28 + 0.6 * depth * (0.55 + 0.45 * mix)) * 10) / 10;
    const style = `rgba(${rgb.join(',')},${alpha})`;
    if (!styles.has(style)) styles.set(style, []);
    styles.get(style)!.push(n);
    if (region >= 0 && best > 0.3) regions[region].push(n);
    // A point on the globe, thicker towards its shell, like a planet seen through dust.
    const gxn = gauss(),
      gyn = gauss(),
      gzn = gauss();
    const len = Math.hypot(gxn, gyn, gzn) || 1;
    const shell = GLOBE.r * (0.86 + 0.14 * rand() ** 0.4);
    f.gx[n] = (gxn / len) * shell;
    f.gy[n] = (gyn / len) * shell;
    f.gz[n] = (gzn / len) * shell;
    // Particles leave the globe from left to right, with a little disorder.
    f.delay[n] = INTRO_SPREAD * (0.65 * ((px + 1.4) / 2.8) + 0.35 * rand());
    f.x[n] = px;
    f.y[n] = py;
    f.z[n] = pz;
    f.phase[n] = rand() * Math.PI * 2;
    f.speed[n] = 0.6 + rand() * 0.8;
    f.size[n] = 0.7 + rand() * 0.8 + mix * 0.5;
    n++;
  }
  // Faint contour lines that follow the ground, across and along the landscape.
  const lines: Float32Array[] = [];
  for (let i = 0; i <= 16; i++) {
    const lz = -0.2 + (1.5 * i) / 16;
    const line = new Float32Array(80 * 3);
    for (let j = 0; j < 80; j++) {
      const lx = -1.4 + (2.8 * j) / 79;
      line.set([lx, height(lx, lz), lz], j * 3);
    }
    lines.push(line);
  }
  for (let i = 0; i <= 22; i++) {
    const lx = -1.4 + (2.8 * i) / 22;
    const line = new Float32Array(60 * 3);
    for (let j = 0; j < 60; j++) {
      const lz = -0.2 + (1.5 * j) / 59;
      line.set([lx, height(lx, lz), lz], j * 3);
    }
    lines.push(line);
  }
  return {
    count,
    ...f,
    buckets: [...styles].map(([style, index]) => ({ style, index: Uint32Array.from(index) })),
    regions: regions.map((r) => Uint32Array.from(r)),
    lines,
  };
}

type Camera = { focal: number; height: number; distance: number; pitch: number; anchor: number };
const DESKTOP: Camera = { focal: 0.68, height: 0.95, distance: 2.25, pitch: 0.4, anchor: 0.66 };
const MOBILE: Camera = { focal: 1, height: 1.05, distance: 2.1, pitch: 0.46, anchor: 0.7 };

function projector(cam: Camera, width: number, heightPx: number, yaw: number, tilt: number) {
  const c = Math.cos(yaw),
    s = Math.sin(yaw),
    pitch = cam.pitch + tilt,
    cp = Math.cos(pitch),
    sp = Math.sin(pitch),
    f = cam.focal * width;
  return (x: number, y: number, z: number, out: number[]) => {
    const pz = z - 0.55;
    const rx = x * c - pz * s,
      rz = x * s + pz * c;
    const vy = y - cam.height,
      vz = rz + cam.distance;
    const y2 = vy * cp + vz * sp,
      z2 = -vy * sp + vz * cp;
    out[0] = width / 2 + (f * rx) / z2;
    out[1] = heightPx * cam.anchor - (f * y2) / z2;
    out[2] = 1 / z2;
  };
}

/** Where each summit's label sits, as a fraction of the landscape, before the canvas exists. */
function restingPositions(cam: Camera, aspect: number) {
  const project = projector(cam, 1, aspect, 0, 0);
  const out = [0, 0, 0];
  return PEAKS.map((p) => {
    project(p.x, p.h + 0.04, p.z, out);
    return { left: out[0] * 100, top: (out[1] / aspect) * 100 };
  });
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

type Phase = 'globe' | 'spreading' | 'ready';

export function ExpertiseLandscape({
  title,
  allLink = true,
}: {
  /** The band's heading; the Expertises page gives its own, its hero already says this one. */
  title?: string;
  allLink?: boolean;
} = {}) {
  const { copy, services, ui } = useCatalog();
  const r = useRoutes();
  const items: Item[] = PEAKS.map((peak) => ({
    peak,
    service: services.find((s) => s.id === peak.slug)!,
  }));
  const others = services.filter((s) => !PEAKS.some((p) => p.slug === s.id));
  const mobile = useMediaQuery('(max-width: 800px)');
  // Up to tablet width the card docks under the landscape, with the list of expertises.
  const docked = useMediaQuery('(max-width: 1250px)');
  // Reduced motion keeps the intro and the sway, but the camera no longer follows the pointer.
  const calm = useMotionLevel() === 'reduced';
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const points = useRef<(HTMLButtonElement | null)[]>([]);
  const positions = useRef<{ x: number; y: number }[]>([]);
  const card = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [pinned, setPinned] = useState(false);
  const [phase, setPhase] = useState<Phase>('ready');
  const [placement, setPlacement] = useState<{
    left: number;
    top: number;
    origin: string;
    line: string;
  } | null>(null);
  const selection = useRef<number | null>(null);
  const hovered = useRef<number | null>(null);
  const pointer = useRef({ x: 0, y: 0, inside: false });
  const inCard = useRef(false);
  const phaseRef = useRef<Phase>('ready');
  const introStart = useRef(0);
  const redraw = useRef<() => void>(() => {});
  const closeTimer = useRef(0);
  const intentTimer = useRef(0);
  const camera = mobile ? MOBILE : DESKTOP;
  const resting = restingPositions(camera, mobile ? 0.95 : 0.48);

  selection.current = active;
  hovered.current = hover;
  phaseRef.current = phase;

  // The intro plays once, the first time the landscape is well into view.
  useEffect(() => {
    setPhase('globe');
    const element = stage.current;
    if (!element) return;
    let timer = 0;
    const watcher = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || phaseRef.current !== 'globe') return;
        watcher.disconnect();
        timer = window.setTimeout(() => {
          introStart.current = performance.now();
          setPhase('spreading');
          timer = window.setTimeout(() => setPhase('ready'), INTRO_MS * (1 + INTRO_SPREAD));
        }, 280);
      },
      { threshold: 0.45 },
    );
    watcher.observe(element);
    return () => {
      watcher.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  // The canvas: built once per layout, animated only while on screen.
  useEffect(() => {
    const element = canvas.current,
      container = stage.current;
    if (!element || !container) return;
    const context = element.getContext('2d');
    if (!context) return;
    const field = buildField(mobile ? 2600 : 7200);
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const halo: number[] = [];
    const point = [0, 0, 0];
    let width = 0,
      heightPx = 0,
      frame = 0,
      visible = false,
      clock = 0,
      last = 0,
      glow = 0,
      hoverGlow = 0,
      yaw = 0,
      tilt = 0,
      lens = 0;

    const draw = (now: number) => {
      const delta = last ? Math.min(64, now - last) : 16;
      last = now;
      clock += delta;
      const chosen = selection.current;
      const hoveredPeak = hovered.current;
      const k = Math.min(1, delta / 220);
      glow += ((chosen === null ? 0 : 1) - glow) * k;
      hoverGlow += ((hoveredPeak === null || hoveredPeak === chosen ? 0 : 1) - hoverGlow) * k;
      // The camera follows the pointer, sways a little at rest, and holds while a card is open,
      // so the card stays beside its summit.
      if (chosen === null) {
        const { inside, x, y } = calm ? { inside: false, x: 0, y: 0 } : pointer.current;
        const targetYaw = inside ? (x / width - 0.5) * 0.16 : 0.05 * Math.sin(clock * 0.00011);
        const targetTilt = inside ? (y / heightPx - 0.5) * 0.06 : 0;
        yaw += (targetYaw - yaw) * Math.min(1, delta / 600);
        tilt += (targetTilt - tilt) * Math.min(1, delta / 600);
      }
      lens += ((pointer.current.inside && !calm ? 1 : 0) - lens) * k;

      // Intro: 0 on the globe, 1 in the landscape.
      const intro =
        phaseRef.current === 'ready'
          ? 1
          : phaseRef.current === 'globe'
            ? 0
            : Math.min(1, (now - introStart.current) / INTRO_MS / (1 + INTRO_SPREAD));
      const spin = clock * 0.00035;
      const cs = Math.cos(spin),
        sn = Math.sin(spin);

      const project = projector(camera, width, heightPx, yaw, tilt);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, heightPx);
      context.globalCompositeOperation = 'source-over';

      const ground = easeInOut(Math.max(0, (intro - 0.55) / 0.45));
      if (ground > 0) {
        context.globalAlpha = ground;
        context.strokeStyle = 'rgba(130, 176, 214, 0.06)';
        context.lineWidth = 1;
        for (const line of field.lines) {
          context.beginPath();
          for (let j = 0; j < line.length; j += 3) {
            project(line[j], line[j + 1], line[j + 2], point);
            if (j === 0) context.moveTo(point[0], point[1]);
            else context.lineTo(point[0], point[1]);
          }
          context.stroke();
        }
      }

      context.globalCompositeOperation = 'lighter';
      const scale = width / (mobile ? 260 : 900);
      const { x: mx, y: my } = pointer.current;
      const radius = mobile ? 0 : 120;
      const t = clock * 0.001;
      halo.length = 0;
      const plot = (i: number, grow: number, collect: boolean) => {
        let px = field.x[i],
          py = field.y[i],
          pz = field.z[i];
        // Suspended matter: every particle drifts on its own slow orbit.
        const w = t * field.speed[i] + field.phase[i];
        px += 0.006 * Math.cos(w * 0.7);
        py += 0.009 * Math.sin(w);
        pz += 0.006 * Math.sin(w * 0.8 + 1.3);
        if (intro < 1) {
          const p = easeInOut(
            Math.min(1, Math.max(0, (intro * (1 + INTRO_SPREAD) - field.delay[i]) / 1)),
          );
          const gx = field.gx[i] * cs - field.gz[i] * sn,
            gz = field.gx[i] * sn + field.gz[i] * cs;
          px = GLOBE.x + gx + (px - GLOBE.x - gx) * p;
          py = GLOBE.y + field.gy[i] + (py - GLOBE.y - field.gy[i]) * p;
          pz = GLOBE.z + gz + (pz - GLOBE.z - gz) * p;
        }
        project(px, py, pz, point);
        let sx = point[0],
          sy = point[1];
        // The pointer parts the particles like a hand in the water, and lights them up.
        if (radius && lens > 0.01) {
          const dx = sx - mx,
            dy = sy - my,
            d = Math.hypot(dx, dy);
          if (d < radius && d > 0.001) {
            const push = (1 - d / radius) ** 2 * 22 * lens;
            sx += (dx / d) * push;
            sy += (dy / d) * push;
            if (collect) halo.push(sx, sy, field.size[i] * point[2] * scale);
          }
        }
        const r = field.size[i] * point[2] * scale * grow;
        context.fillRect(sx - r / 2, sy - r / 2, r, r);
      };

      context.globalAlpha = 1 - 0.45 * glow;
      for (const bucket of field.buckets) {
        context.fillStyle = bucket.style;
        for (const i of bucket.index) plot(i, 1, true);
      }
      if (hoveredPeak !== null && hoveredPeak !== chosen && hoverGlow > 0.01) {
        context.globalAlpha = 0.55 * hoverGlow;
        context.fillStyle = 'rgba(214, 238, 196, 0.7)';
        for (const i of field.regions[hoveredPeak]) plot(i, 1.2, false);
      }
      if (chosen !== null && glow > 0.01) {
        context.globalAlpha = glow;
        context.fillStyle = `rgba(${SELECTED.join(',')},0.85)`;
        for (const i of field.regions[chosen]) plot(i, 1.35, false);
      }
      if (halo.length) {
        context.globalAlpha = 0.6 * lens;
        context.fillStyle = 'rgba(205, 240, 170, 0.55)';
        for (let j = 0; j < halo.length; j += 3) {
          const r = halo[j + 2] * 1.5;
          context.fillRect(halo[j] - r / 2, halo[j + 1] - r / 2, r, r);
        }
      }

      // Labels follow their summits.
      PEAKS.forEach((p, i) => {
        project(p.x, p.h + 0.04, p.z, point);
        positions.current[i] = { x: point[0], y: point[1] };
        const button = points.current[i];
        if (button) {
          button.style.left = `${(point[0] / width) * 100}%`;
          button.style.top = `${(point[1] / heightPx) * 100}%`;
        }
      });
    };

    const loop = (now: number) => {
      draw(now);
      frame = visible ? requestAnimationFrame(loop) : 0;
    };
    const start = () => {
      if (!frame) frame = requestAnimationFrame(loop);
    };
    redraw.current = () => (visible ? start() : draw(performance.now()));

    const resize = () => {
      width = container.clientWidth;
      heightPx = container.clientHeight;
      element.width = Math.round(width * ratio);
      element.height = Math.round(heightPx * ratio);
      draw(performance.now());
    };
    const sizes = new ResizeObserver(resize);
    sizes.observe(container);
    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      last = 0;
      if (visible) start();
    });
    watcher.observe(container);
    resize();
    return () => {
      sizes.disconnect();
      watcher.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [mobile, calm, camera]);

  useEffect(() => redraw.current(), [active, hover, phase]);

  const open = useCallback((index: number) => {
    window.clearTimeout(closeTimer.current);
    window.clearTimeout(intentTimer.current);
    setActive(index);
  }, []);
  const close = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    window.clearTimeout(intentTimer.current);
    setActive(null);
    setPinned(false);
  }, []);

  // Hovering near a summit lights it; resting there a moment opens its card. Leaving closes it,
  // unless the pointer has moved into the card.
  const lastHover = useRef<number | null>(null);
  useEffect(() => {
    const left = lastHover.current !== null && hover === null;
    lastHover.current = hover;
    if (docked || pinned) return;
    window.clearTimeout(intentTimer.current);
    if (hover !== null) {
      window.clearTimeout(closeTimer.current);
      if (hover !== active)
        intentTimer.current = window.setTimeout(() => setActive(hover), active === null ? 140 : 70);
    } else if (left && active !== null && !inCard.current) {
      // Only the pointer leaving a summit closes; a card opened from the keyboard stays.
      closeTimer.current = window.setTimeout(() => setActive(null), 280);
    }
  }, [hover, active, docked, pinned]);

  const nearestSummit = (x: number, y: number, reach: number) => {
    let found: number | null = null,
      best = Infinity;
    positions.current.forEach((p, i) => {
      // An oval reaching up over the label and down the slope.
      const d = Math.hypot((x - p.x) / reach, (y - p.y + 18) / (reach * 0.95));
      if (d < 1 && d < best) {
        best = d;
        found = i;
      }
    });
    return found;
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || phase !== 'ready') return;
    const box = event.currentTarget.getBoundingClientRect();
    pointer.current = { x: event.clientX - box.left, y: event.clientY - box.top, inside: true };
    if (card.current?.contains(event.target as Node)) return;
    const button = (event.target as Element).closest('.landscape-point');
    const index = button
      ? points.current.indexOf(button as HTMLButtonElement)
      : nearestSummit(pointer.current.x, pointer.current.y, 90);
    if (index !== hover) setHover(index);
  };
  const onPointerLeave = () => {
    pointer.current.inside = false;
    setHover(null);
  };
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as Element;
    if (card.current?.contains(target) || target.closest('.landscape-point')) return;
    const box = event.currentTarget.getBoundingClientRect();
    const index = nearestSummit(
      event.clientX - box.left,
      event.clientY - box.top,
      event.pointerType === 'mouse' ? 90 : 56,
    );
    if (index === null) close();
    else {
      open(index);
      setPinned(true);
    }
  };

  useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const index = active;
      close();
      points.current[index]?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, close]);

  // The card stays mounted while it closes; it keeps showing the last expertise meanwhile.
  const cardState = usePresence(active !== null, 200);
  const [shown, setShown] = useState<number | null>(null);
  if (active !== null && active !== shown) setShown(active);
  const current = shown === null ? null : items[shown];

  // Floating card beside its summit on wide screens: never over its own summit, never outside
  // the landscape, close to the summit, and hiding as little of the others as possible.
  useLayoutEffect(() => {
    if (docked || active === null || !card.current || !stage.current) return;
    const point = positions.current[active];
    const ownButton = points.current[active];
    if (!point || !ownButton) return;
    const stageBox = stage.current.getBoundingClientRect();
    const w = card.current.offsetWidth,
      h = card.current.offsetHeight,
      gap = ownButton.offsetWidth / 2 + 22;
    const box = (el: Element) => {
      const r = el.getBoundingClientRect();
      return { x: r.left - stageBox.left, y: r.top - stageBox.top, w: r.width, h: r.height };
    };
    const own = box(ownButton);
    const rivals = points.current.filter((b, i) => b && i !== active).map((b) => box(b!));
    const overlap = (left: number, top: number, o: ReturnType<typeof box>) => {
      const dx = Math.min(left + w, o.x + o.w) - Math.max(left, o.x);
      const dy = Math.min(top + h, o.y + o.h) - Math.max(top, o.y);
      return dx > 0 && dy > 0 ? dx * dy : 0;
    };
    // The foot of the field stays clear for the section tag and the hint.
    const clampTop = (top: number) => Math.min(Math.max(16, top), stageBox.height - h - 48);
    const clampLeft = (left: number) => Math.min(Math.max(16, left), stageBox.width - w - 16);
    const lefts = [
      point.x + gap,
      point.x + gap + 60,
      point.x - gap - w,
      point.x - gap - w - 60,
      point.x - w / 2,
      16,
      stageBox.width - w - 16,
    ].map(clampLeft);
    const tops = [
      point.y - h * 0.35,
      point.y - h + 40,
      point.y - h / 2,
      point.y + 30,
      16,
      stageBox.height - h - 48,
    ].map(clampTop);
    const candidates = lefts
      .flatMap((left) => tops.map((top) => ({ left, top })))
      .filter(({ left, top }) => overlap(left, top, own) === 0);
    if (!candidates.length) candidates.push({ left: 16, top: clampTop(point.y + 40) });
    const score = ({ left, top }: { left: number; top: number }) =>
      // Hiding another summit costs far more than standing a little further away.
      12 * rivals.reduce((sum, o) => sum + overlap(left, top, o), 0) +
      40 * Math.hypot(left + w / 2 - point.x, top + h / 2 - point.y);
    const best = candidates.reduce((a, b) => (score(b) < score(a) ? b : a));
    // A thread from the summit to the nearest point of the card's edge.
    const ex = Math.min(Math.max(point.x, best.left), best.left + w);
    const ey = Math.min(Math.max(point.y, best.top), best.top + h);
    setPlacement({
      left: best.left,
      top: best.top,
      origin: `${point.x - best.left}px ${point.y - best.top}px`,
      line: `M${point.x} ${point.y} L${ex} ${ey}`,
    });
  }, [active, docked]);

  return (
    <section className="landscape-section">
      {/* The heading comes first: on the homepage it carries the reader on from the chain of
          stages above, in the same dark chapter. */}
      <div className="landscape-band">
        <div className="container landscape-band-inner">
          <div>
            <p className="eyebrow eyebrow-light">{ui.landscape.eyebrow}</p>
            <AnimatedHeading className="display-small" text={title ?? copy.home.servicesTitle} />
          </div>
          <div className="landscape-band-aside">
            <p>{copy.home.servicesIntro}</p>
            <p className="landscape-also">
              {ui.landscape.also}{' '}
              {others.map((s, i) => (
                <span key={s.id}>
                  {i > 0 && ' · '}
                  <Link to={r.service(s.id)}>{s.title}</Link>
                </span>
              ))}
            </p>
            {allLink && <TextLink to={r.services}>{copy.labels.allServices}</TextLink>}
          </div>
        </div>
      </div>
      <div
        ref={stage}
        className="landscape-stage"
        data-phase={phase}
        data-active={active === null ? undefined : ''}
        data-hover={hover === null ? undefined : ''}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
      >
        <canvas ref={canvas} className="landscape-canvas" aria-hidden="true" />
        {!docked && placement && cardState !== 'closed' && (
          <svg className="landscape-thread" data-state={cardState} aria-hidden="true">
            <path key={placement.line} d={placement.line} pathLength={1} />
          </svg>
        )}
        <div className="landscape-points" role="group" aria-label={ui.landscape.explore}>
          {items.map(({ peak, service }, i) => (
            <button
              key={peak.slug}
              ref={(el) => {
                points.current[i] = el;
              }}
              type="button"
              className="landscape-point"
              style={
                {
                  left: `${resting[i].left}%`,
                  top: `${resting[i].top}%`,
                  '--i': i,
                } as CSSProperties
              }
              aria-label={service.title}
              aria-expanded={active === i}
              aria-controls="landscape-card"
              data-active={active === i || undefined}
              data-hover={(hover === i && active !== i) || undefined}
              onFocus={(event) => {
                if (event.currentTarget.matches(':focus-visible')) open(i);
              }}
              onClick={() => {
                if (active === i && pinned) close();
                else {
                  open(i);
                  setPinned(true);
                }
              }}
            >
              <span className="landscape-label" aria-hidden="true">
                {mobile ? (ui.landscape.short[peak.slug] ?? peak.short) : service.title}
              </span>
              <span className="landscape-dot" aria-hidden="true" />
            </button>
          ))}
        </div>
        <p className="landscape-hint" aria-hidden="true">
          {docked ? ui.landscape.hintTouch : ui.landscape.hintHover}
        </p>
        {!docked && current && cardState !== 'closed' && placement && (
          <ExpertiseCard
            cardRef={card}
            item={current}
            state={cardState}
            style={{ left: placement.left, top: placement.top, transformOrigin: placement.origin }}
            onPointerEnter={() => {
              inCard.current = true;
              window.clearTimeout(closeTimer.current);
            }}
            onPointerLeave={() => {
              inCard.current = false;
              if (!pinned && hovered.current === null)
                closeTimer.current = window.setTimeout(() => setActive(null), 280);
            }}
          />
        )}
        {/* Measures the card before its first placement, so it opens where it belongs. */}
        {!docked && current && !placement && (
          <ExpertiseCard cardRef={card} item={current} state="open" measuring />
        )}
      </div>
      {docked && (
        <div className="landscape-chips" role="group" aria-label={ui.landscape.choose}>
          {items.map(({ peak, service }, i) => (
            <button
              key={peak.slug}
              type="button"
              aria-pressed={active === i}
              onClick={() => (active === i ? close() : open(i))}
            >
              {service.title}
            </button>
          ))}
        </div>
      )}
      {docked && current && cardState !== 'closed' && (
        <ExpertiseCard item={current} state={cardState} docked />
      )}
    </section>
  );
}

function ExpertiseCard({
  item,
  state,
  docked = false,
  measuring = false,
  style,
  cardRef,
  onPointerEnter,
  onPointerLeave,
}: {
  item: Item;
  state: 'open' | 'closing';
  docked?: boolean;
  measuring?: boolean;
  style?: CSSProperties;
  cardRef?: RefObject<HTMLDivElement | null>;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}) {
  const { service } = item;
  const { ui } = useCatalog();
  const r = useRoutes();
  return (
    <div
      ref={cardRef}
      id={measuring ? undefined : 'landscape-card'}
      className={`landscape-card ${docked ? 'landscape-card-docked' : ''}`}
      data-state={state}
      data-measuring={measuring || undefined}
      style={style}
      role={measuring ? undefined : 'region'}
      aria-label={measuring ? undefined : service.title}
      aria-hidden={measuring || undefined}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div className="landscape-card-inner" key={service.slug}>
        <figure className="landscape-card-image">
          <Photo name={service.image} alt="" sizes="340px" />
        </figure>
        <div className="landscape-card-body">
          <p className="landscape-card-label">{ui.landscape.cardLabel}</p>
          <h3>{service.title}</h3>
          <p className="landscape-card-text">{service.scope}</p>
          <ul className="landscape-card-tags" aria-label={ui.landscape.approaches}>
            {service.approaches.slice(0, 3).map((a) => (
              <li key={a.title}>{a.title}</li>
            ))}
          </ul>
        </div>
        <Link
          className="landscape-card-link"
          to={r.service(service.id)}
          tabIndex={measuring ? -1 : undefined}
        >
          <span>{ui.landscape.discover}</span>
          <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
