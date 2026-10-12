import { studyMap, studySites } from './study-map';

/* The living water of the study map, drawn on a canvas that sits between the sea and the land.
   Particles stand for traces of DNA carried by the water. They follow a flow field built from
   the coastline: along the shore towards the North Sea, as the coastal current runs there, and
   towards the north-east further out. Everything here is illustration, not measurement. */

export type FlowLayer = 'none' | 'courants' | 'turbidite' | 'marees';
export type FlowState = {
  /** The step of the approach on show: 0 sampling, 1 analysis, 2 comparison. */
  step: number;
  layer: FlowLayer;
  /** The site under the pointer, or -1. */
  hover: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  seed: number;
};

const W = studyMap.width;
const H = studyMap.height;
const COLS = 48;
const ROWS = Math.round((COLS * H) / W);
const CELL = W / COLS;
const TURBID = studySites.filter((s) => s.setting !== 'port').map((s) => studySites.indexOf(s));

const points = (d: string) => {
  const numbers = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  const out: [number, number][] = [];
  for (let i = 0; i + 1 < numbers.length; i += 2) out.push([numbers[i], numbers[i + 1]]);
  return out;
};

/** Direction and strength of the water for every cell, and which cells are sea. */
function buildField() {
  const coast = points(studyMap.coast);
  const probe = document.createElement('canvas');
  probe.width = Math.ceil(W);
  probe.height = Math.ceil(H);
  const context = probe.getContext('2d');
  const land = studyMap.land.map((d) => new Path2D(d));
  const field = new Float32Array(COLS * ROWS * 3);
  const sea = new Uint8Array(COLS * ROWS);
  const seaCells: number[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cx = (col + 0.5) * CELL,
        cy = (row + 0.5) * CELL;
      const cell = row * COLS + col;
      const onLand = context ? land.some((p) => context.isPointInPath(p, cx, cy)) : false;
      if (!onLand) {
        sea[cell] = 1;
        seaCells.push(cell);
      }
      // Nearest stretch of coast; the coast runs from Belgium (index 0) to the Somme.
      let best = Infinity,
        index = 0;
      for (let i = 0; i < coast.length; i++) {
        const dx = coast[i][0] - cx,
          dy = coast[i][1] - cy;
        const d = dx * dx + dy * dy;
        if (d < best) {
          best = d;
          index = i;
        }
      }
      const from = coast[Math.min(coast.length - 1, index + 8)];
      const to = coast[Math.max(0, index - 8)];
      let tx = to[0] - from[0],
        ty = to[1] - from[1];
      const length = Math.hypot(tx, ty) || 1;
      tx /= length;
      ty /= length;
      const distance = Math.sqrt(best);
      const along = Math.exp(-distance / 220);
      let fx = tx * along + 0.6 * (1 - along),
        fy = ty * along - 0.8 * (1 - along);
      const norm = Math.hypot(fx, fy) || 1;
      fx /= norm;
      fy /= norm;
      field[cell * 3] = fx;
      field[cell * 3 + 1] = fy;
      field[cell * 3 + 2] = 0.55 + 0.45 * Math.exp(-distance / 160);
    }
  }
  return { field, sea, seaCells };
}

const approach = (value: number, target: number, rate: number) => value + (target - value) * rate;

export function createStudyFlow(canvas: HTMLCanvasElement, onCatch: (site: number) => void) {
  const context = canvas.getContext('2d');
  if (!context) return null;
  const { field, sea, seaCells } = buildField();
  if (!seaCells.length) return null;

  let particles: Particle[] = [];
  let unit = 1; // map units per CSS pixel
  let last = 0;
  // Each effect eases in and out rather than switching.
  const mix = { courants: 0, turbidite: 0, marees: 0, sample: 0, analyse: 0 };

  const spawn = (p: Particle, fresh = false) => {
    const cell = seaCells[Math.floor(Math.random() * seaCells.length)];
    p.x = ((cell % COLS) + Math.random()) * CELL;
    p.y = (Math.floor(cell / COLS) + Math.random()) * CELL;
    p.vx = 0;
    p.vy = 0;
    p.life = 260 + Math.random() * 320;
    p.age = fresh ? Math.random() * p.life : 0;
    p.seed = Math.random() * 6.283;
  };

  const resize = () => {
    const box = canvas.getBoundingClientRect();
    if (!box.width) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(box.width * ratio);
    canvas.height = Math.round(box.height * ratio);
    unit = W / box.width;
    const count = box.width < 480 ? 150 : 250;
    if (particles.length !== count) {
      particles = Array.from({ length: count }, () => {
        const p = { x: 0, y: 0, vx: 0, vy: 0, age: 0, life: 1, seed: 0 };
        spawn(p, true);
        return p;
      });
    }
  };
  resize();

  const draw = (now: number, state: FlowState) => {
    const frame = last ? Math.min(2.5, (now - last) / 16.67) : 1;
    last = now;
    const t = now / 1000;
    mix.courants = approach(mix.courants, state.layer === 'courants' ? 1 : 0, 0.05 * frame);
    mix.turbidite = approach(mix.turbidite, state.layer === 'turbidite' ? 1 : 0, 0.04 * frame);
    mix.marees = approach(mix.marees, state.layer === 'marees' ? 1 : 0, 0.04 * frame);
    mix.sample = approach(mix.sample, state.step === 0 ? 1 : 0, 0.05 * frame);
    mix.analyse = approach(mix.analyse, state.step === 1 ? 1 : 0, 0.05 * frame);
    // Flood and ebb: with the tides layer, the flow along the shore turns back and forth.
    const tide = Math.sin((t * 2 * Math.PI) / 9);
    const flow = (1 - mix.marees) * 1 + mix.marees * tide * 1.7;
    const speed = 0.42 * (1 + 1.5 * mix.courants - 0.25 * mix.turbidite);

    const scale = canvas.width / W;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, W, H);

    // Turbid plumes at the mouths of rivers and bays, carried slowly along the shore.
    if (mix.turbidite > 0.01) {
      TURBID.forEach((index, k) => {
        const site = studySites[index];
        const drift = Math.sin(t * 0.5 + k * 1.7);
        const x = site.x - 46 + drift * 10,
          y = site.y - 18 - drift * 16;
        const radius = 120 + 18 * Math.sin(t * 0.8 + k);
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(150, 116, 60, ${0.46 * mix.turbidite})`);
        gradient.addColorStop(0.55, `rgba(160, 128, 74, ${0.22 * mix.turbidite})`);
        gradient.addColorStop(1, 'rgba(160, 128, 74, 0)');
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      });
    }
    // During the analysis, a quiet halo marks every site.
    if (mix.analyse > 0.01) {
      studySites.forEach((site, i) => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 2.2 - i * 0.6);
        const radius = 34 + pulse * 22;
        const gradient = context.createRadialGradient(site.x, site.y, 0, site.x, site.y, radius);
        gradient.addColorStop(0, `rgba(115, 181, 15, ${0.28 * mix.analyse})`);
        gradient.addColorStop(1, 'rgba(115, 181, 15, 0)');
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(site.x, site.y, radius, 0, Math.PI * 2);
        context.fill();
      });
    }

    context.lineCap = 'round';
    context.lineWidth = (2 + 0.5 * mix.courants) * unit;
    const reach = 74 * mix.sample;
    for (const p of particles) {
      const col = Math.floor(p.x / CELL),
        row = Math.floor(p.y / CELL);
      const cell = row * COLS + col;
      if (col < 0 || row < 0 || col >= COLS || row >= ROWS || !sea[cell] || p.age > p.life) {
        spawn(p);
        continue;
      }
      const wobble = Math.sin(t * 0.7 + p.seed) * 0.35;
      const fx = field[cell * 3],
        fy = field[cell * 3 + 1];
      const strength = field[cell * 3 + 2] * speed * flow;
      let vx = (fx * Math.cos(wobble) - fy * Math.sin(wobble)) * strength;
      let vy = (fx * Math.sin(wobble) + fy * Math.cos(wobble)) * strength;

      // Sampling: the water near a site is drawn into it. A pointed site draws from further.
      let nearest = Infinity;
      for (let i = 0; i < studySites.length; i++) {
        const site = studySites[i];
        const dx = site.x - p.x,
          dy = site.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d < nearest) nearest = d;
        const radius = i === state.hover ? 150 : reach;
        if (d < radius && d > 0) {
          const pull = (i === state.hover ? 2.2 : 1.4) * (1 - d / radius);
          vx += (dx / d) * pull;
          vy += (dy / d) * pull;
          if (d < 8) {
            onCatch(i);
            spawn(p);
          }
        }
      }
      p.vx = approach(p.vx, vx, 0.18);
      p.vy = approach(p.vy, vy, 0.18);
      p.x += p.vx * frame;
      p.y += p.vy * frame;
      p.age += frame;

      const fade = Math.min(1, p.age / 40, (p.life - p.age) / 60);
      if (fade <= 0) continue;
      const trail = 11 + 14 * mix.courants;
      const greenness = mix.analyse * Math.max(0, 1 - nearest / 120);
      let colour = '3, 37, 75';
      if (greenness > 0.15) colour = '84, 140, 12';
      else if (mix.turbidite > 0.3 && nearest < 170) colour = '120, 92, 46';
      context.globalAlpha = fade * (0.46 + 0.3 * mix.courants + 0.4 * greenness);
      context.strokeStyle = `rgb(${colour})`;
      context.beginPath();
      context.moveTo(p.x - p.vx * trail, p.y - p.vy * trail);
      context.lineTo(p.x, p.y);
      context.stroke();
    }
    context.globalAlpha = 1;
  };

  return {
    draw,
    resize,
    /** Restart the clock after a pause, so nothing jumps. */
    wake: () => {
      last = 0;
    },
    dispose: () => {
      particles = [];
    },
  };
}
