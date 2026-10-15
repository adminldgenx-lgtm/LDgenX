/* The R&D lab: one set of particles that tells each project in four scenes. Every scene gives
   each particle a place and a look; the particles glide from one scene to the next. These are
   pictures of the principle of each project (DNA in water, long reads, groups found by the
   analysis, a simple readout; marks on the DNA, a signal, a clock and an age structure), never
   data. */

export type LabState = { project: number; step: number };

type Look = 'fragment' | 'bar' | 'dot' | 'square';
type P = {
  x: number;
  y: number;
  r1: number;
  r2: number;
  r3: number;
  colour: number;
  look: Look;
  size: number;
  alpha: number;
};

const COUNT = 240;
const COLOURS = ['#9fd34a', '#4fb3d9', '#c3e08f', '#2f8fbf', '#e3c27a'];
// The analysis finds groups of unequal size; the readout shows them as bars.
const GROUP_WEIGHTS = [0.31, 0.24, 0.19, 0.15, 0.11];
const AGE_HEIGHTS = [0.4, 0.34, 0.26, 0.19, 0.13, 0.08];
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createLab(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  if (!context) return null;
  const random = seeded(11);
  const particles: P[] = Array.from({ length: COUNT }, () => ({
    x: random(),
    y: 0.2 + random() * 0.6,
    r1: random(),
    r2: random(),
    r3: random(),
    colour: 0,
    look: 'fragment' as Look,
    size: 1,
    alpha: 1,
  }));
  // Groups for the analysis and readout, and members of each.
  const group = particles.map((_, i) => {
    const u = (i + 0.5) / COUNT;
    let sum = 0;
    for (let g = 0; g < GROUP_WEIGHTS.length; g++) {
      sum += GROUP_WEIGHTS[g];
      if (u <= sum) return g;
    }
    return GROUP_WEIGHTS.length - 1;
  });
  const members = GROUP_WEIGHTS.map((_, g) =>
    particles.map((_, i) => i).filter((i) => group[i] === g),
  );
  // The helix: pairs of particles; every sixth pair carries a mark.
  const PAIRS = COUNT / 2;
  const marked = (i: number) => Math.floor(i / 2) % 6 === 2 && i % 2 === 0;
  const marks = particles.map((_, i) => i).filter(marked);
  const others = particles.map((_, i) => i).filter((i) => !marked(i));
  const ageOf = others.map((_, k) => {
    const total = AGE_HEIGHTS.reduce((a, b) => a + b, 0);
    const u = (k + 0.5) / others.length;
    let sum = 0;
    for (let c = 0; c < AGE_HEIGHTS.length; c++) {
      sum += AGE_HEIGHTS[c] / total;
      if (u <= sum) return c;
    }
    return AGE_HEIGHTS.length - 1;
  });
  const ageMembers = AGE_HEIGHTS.map((_, c) => others.filter((_, k) => ageOf[k] === c));
  // Each particle's rank in its group, among the marks, and in its age class.
  const rank = new Int16Array(COUNT);
  const ageClass = new Int8Array(COUNT);
  const ageRank = new Int16Array(COUNT);
  members.forEach((list) => list.forEach((i, k) => (rank[i] = k)));
  const markRank = new Int16Array(COUNT);
  marks.forEach((i, k) => (markRank[i] = k));
  ageMembers.forEach((list, c) =>
    list.forEach((i, k) => {
      ageClass[i] = c;
      ageRank[i] = k;
    }),
  );

  let width = 0,
    height = 0,
    ratio = 1,
    last = 0,
    sceneStart = 0,
    scene = '';
  const overlay: Record<string, number> = {};
  const fade = (key: string, on: boolean, dt: number, rate = 0.06) => {
    overlay[key] =
      (overlay[key] ?? 0) + ((on ? 1 : 0) - (overlay[key] ?? 0)) * Math.min(1, rate * dt);
    return overlay[key];
  };

  const resize = () => {
    const box = canvas.getBoundingClientRect();
    if (!box.width) return;
    width = box.width;
    height = box.height;
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
  };
  resize();

  const draw = (now: number, state: LabState) => {
    const dt = last ? Math.min(2.5, (now - last) / 16.67) : 1;
    last = now;
    const key = `${state.project}-${state.step}`;
    if (key !== scene) {
      scene = key;
      sceneStart = now;
    }
    const t = now / 1000;
    const local = (now - sceneStart) / 1000;
    const aspect = width / Math.max(1, height);
    const eco = state.project === 0;
    const step = state.step;
    const ctx = context;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const X = (v: number) => v * width;
    const Y = (v: number) => v * height;

    // Scene overlays, each easing in and out.
    const water = fade('water', step === 0, dt);
    const reader = fade('reader', (eco && step === 1) || (!eco && step === 2), dt);
    const network = fade('network', eco && step === 2, dt);
    const card = fade('card', eco && step === 3, dt, 0.05);
    const helix = fade('helix', !eco && (step === 1 || step === 2), dt);
    const signal = fade('signal', !eco && step === 2, dt);
    const dial = fade('dial', !eco && step === 3, dt, 0.05);
    const readerX = eco ? 0.42 : 0.47;

    if (water > 0.01) {
      ctx.globalAlpha = water * 0.55;
      ctx.strokeStyle = 'rgba(140, 200, 235, 0.5)';
      ctx.lineWidth = 1;
      for (let k = 0; k < 2; k++) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 8) {
          const y = Y(0.14 + k * 0.025) + Math.sin(x / 70 + t * (1.2 - k * 0.4) + k) * 4;
          if (x) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    if (reader > 0.01) {
      const g = ctx.createLinearGradient(X(readerX) - 40, 0, X(readerX) + 40, 0);
      g.addColorStop(0, 'rgba(115,181,15,0)');
      g.addColorStop(0.5, `rgba(115,181,15,${0.28 * reader})`);
      g.addColorStop(1, 'rgba(115,181,15,0)');
      ctx.fillStyle = g;
      ctx.fillRect(X(readerX) - 40, Y(0.08), 80, Y(0.84));
      ctx.strokeStyle = `rgba(225, 245, 200, ${0.9 * reader})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(X(readerX), Y(0.08));
      ctx.lineTo(X(readerX), Y(0.92));
      ctx.stroke();
    }
    const centre = (g: number) => {
      const a = (g / GROUP_WEIGHTS.length) * Math.PI * 2 - Math.PI / 2;
      return { x: 0.55 + (Math.cos(a) * 0.3) / aspect, y: 0.5 + Math.sin(a) * 0.3 };
    };
    if (network > 0.01) {
      ctx.strokeStyle = `rgba(160, 210, 235, ${0.18 * network})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let a = 0; a < 5; a++)
        for (let b = a + 1; b < 5; b++) {
          const p = centre(a),
            q = centre(b);
          ctx.moveTo(X(p.x), Y(p.y));
          ctx.lineTo(X(q.x), Y(q.y));
        }
      ctx.stroke();
      for (let g = 0; g < 5; g++) {
        const c = centre(g);
        const r = Y(0.1 + 0.015 * Math.sin(t * 2 + g));
        const glow = ctx.createRadialGradient(X(c.x), Y(c.y), 0, X(c.x), Y(c.y), r);
        glow.addColorStop(0, `${COLOURS[g]}55`);
        glow.addColorStop(1, `${COLOURS[g]}00`);
        ctx.globalAlpha = network;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(X(c.x), Y(c.y), r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    const cardBox = { x0: 0.26, x1: 0.84, y0: 0.2, y1: 0.82 };
    if (card > 0.01) {
      ctx.globalAlpha = card;
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(
        X(cardBox.x0),
        Y(cardBox.y0),
        X(cardBox.x1 - cardBox.x0),
        Y(cardBox.y1 - cardBox.y0),
        12,
      );
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.32)';
      ctx.fillRect(X(cardBox.x0 + 0.04), Y(cardBox.y0 + 0.08), X(0.2), 4);
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      ctx.fillRect(X(cardBox.x0 + 0.04), Y(cardBox.y0 + 0.08) + 12, X(0.12), 4);
      ctx.globalAlpha = 1;
    }
    const helixY = (x: number, strand: number) => {
      const phase = x * Math.PI * 2 * 2.6 + t * 1.3;
      return { y: 0.5 + (strand ? 1 : -1) * 0.12 * Math.sin(phase), depth: Math.cos(phase) };
    };
    const dialC = { x: 0.3, y: 0.52 };
    const dialR = 0.27;
    const hand = t * 1.2;
    if (dial > 0.01) {
      ctx.globalAlpha = dial;
      ctx.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(X(dialC.x), Y(dialC.y), Y(dialR) * 1.12, 0, Math.PI * 2);
      ctx.stroke();
      for (let k = 0; k < 60; k++) {
        const a = (k / 60) * Math.PI * 2;
        const r0 = Y(dialR) * (k % 5 ? 1.18 : 1.15),
          r1 = Y(dialR) * 1.22;
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.beginPath();
        ctx.moveTo(X(dialC.x) + Math.cos(a) * r0, Y(dialC.y) + Math.sin(a) * r0);
        ctx.lineTo(X(dialC.x) + Math.cos(a) * r1, Y(dialC.y) + Math.sin(a) * r1);
        ctx.stroke();
      }
      ctx.strokeStyle = '#e9f6d2';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(X(dialC.x), Y(dialC.y));
      ctx.lineTo(
        X(dialC.x) + Math.cos(hand - Math.PI / 2) * Y(dialR) * 1.05,
        Y(dialC.y) + Math.sin(hand - Math.PI / 2) * Y(dialR) * 1.05,
      );
      ctx.stroke();
      ctx.fillStyle = '#e9f6d2';
      ctx.beginPath();
      ctx.arc(X(dialC.x), Y(dialC.y), 3, 0, Math.PI * 2);
      ctx.fill();
      // The age structure: a baseline under the columns.
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.beginPath();
      ctx.moveTo(X(0.58), Y(0.82));
      ctx.lineTo(X(0.96), Y(0.82));
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Each particle: where it should be, and how it looks, in this scene.
    for (let i = 0; i < COUNT; i++) {
      const p = particles[i];
      let tx = p.x,
        ty = p.y,
        look: Look = 'fragment',
        size = 1,
        colour = Math.floor(p.r3 * 4),
        alpha = 0.85;
      if (step === 0) {
        tx = ((p.r1 + t * 0.012 * (0.5 + p.r3)) % 1.1) - 0.05;
        ty = 0.24 + p.r2 * 0.62 + 0.03 * Math.sin(t * 0.8 + p.r3 * 6);
        look = 'fragment';
      } else if (eco && step === 1) {
        const lane = i % 12;
        const laneY = 0.14 + lane * (0.72 / 11);
        const s = (p.r1 + t * 0.07 * (0.8 + 0.4 * p.r3)) % 1;
        tx = -0.1 + s * 1.25;
        if (tx < readerX) {
          ty = 0.2 + p.r2 * 0.6 + (laneY - (0.2 + p.r2 * 0.6)) * smooth(-0.1, readerX, tx);
          look = 'fragment';
        } else {
          ty = laneY;
          look = 'bar';
          size = 1 + (tx - readerX) * 9;
          colour = lane % 4;
        }
      } else if (eco && step === 2) {
        const g = group[i];
        const c = centre(g);
        const rho = 0.03 + 0.08 * p.r2;
        const a = p.r1 * Math.PI * 2 + t * 0.35 * (g % 2 ? 1 : -1);
        tx = c.x + (Math.cos(a) * rho) / aspect;
        ty = c.y + Math.sin(a) * rho;
        look = 'bar';
        size = 1.4;
        colour = g;
      } else if (eco && step === 3) {
        const g = group[i];
        const k = rank[i];
        const n = members[g].length;
        const length = (GROUP_WEIGHTS[g] / GROUP_WEIGHTS[0]) * 0.46;
        tx = cardBox.x0 + 0.05 + (k / Math.max(1, n - 1)) * length;
        ty = cardBox.y0 + 0.22 + g * 0.088;
        look = 'square';
        colour = g;
        alpha = 0.95;
      } else if (!eco && step === 1) {
        const pair = Math.floor(i / 2);
        const x = 0.05 + (pair / (PAIRS - 1)) * 0.9;
        const h = helixY(x, i % 2);
        tx = x;
        ty = h.y;
        look = 'dot';
        size = 0.8 + 0.5 * (h.depth * 0.5 + 0.5);
        alpha = 0.45 + 0.5 * (h.depth * 0.5 + 0.5);
        colour = 1;
        if (marked(i) && local > (pair / PAIRS) * 2.6) {
          colour = 0;
          size = 1.9;
          alpha = 1;
        }
      } else if (!eco && step === 2) {
        const pair = Math.floor(i / 2);
        const x = (((pair / PAIRS) * 1.1 + t * 0.05) % 1.1) - 0.05;
        tx = x;
        if (x < readerX) {
          const h = helixY(x, i % 2);
          ty = h.y;
          look = 'dot';
          colour = marked(i) ? 0 : 1;
          size = marked(i) ? 1.8 : 1;
        } else {
          ty = marked(i) ? 0.3 : 0.66;
          look = 'dot';
          colour = marked(i) ? 0 : 1;
          size = marked(i) ? 2 : 0.8;
          alpha = i % 2 && !marked(i) ? 0.25 : 0.9;
        }
      } else if (!eco && step === 3) {
        if (marked(i)) {
          const k = markRank[i];
          const a = (k / marks.length) * Math.PI * 2 - Math.PI / 2;
          tx = dialC.x + (Math.cos(a) * dialR) / aspect;
          ty = dialC.y + Math.sin(a) * dialR;
          look = 'dot';
          const passed = ((hand % (Math.PI * 2)) - (a + Math.PI / 2) + Math.PI * 4) % (Math.PI * 2);
          colour = 0;
          size = 1.6 + 1.2 * Math.exp(-passed * 1.5);
          alpha = 0.35 + 0.65 * Math.exp(-passed * 0.8);
        } else {
          const c = ageClass[i];
          const list = ageMembers[c];
          const j = ageRank[i];
          const perRow = 3;
          const row = Math.floor(j / perRow),
            colIn = j % perRow;
          const rows = Math.ceil(list.length / perRow);
          tx = 0.6 + c * 0.062 + (colIn - 1) * 0.012;
          ty = 0.8 - (row / Math.max(1, rows - 1)) * AGE_HEIGHTS[c] * 1.4;
          look = 'square';
          colour = 2 + (c % 2);
          alpha = 0.85;
        }
      }
      // Wrapping streams jump instead of flying back across the stage.
      if (Math.abs(tx - p.x) > 0.5) p.x = tx;
      const k = 1 - Math.pow(1 - 0.12, dt);
      p.x += (tx - p.x) * k;
      p.y += (ty - p.y) * k;
      p.look = look;
      p.size += (size - p.size) * k;
      p.alpha += (alpha - p.alpha) * k;
      p.colour = colour;
    }

    // Links inside each group, during the analysis.
    if (network > 0.01) {
      ctx.lineWidth = 1;
      members.forEach((list, g) => {
        ctx.strokeStyle = `${COLOURS[g]}`;
        ctx.globalAlpha = 0.16 * network;
        ctx.beginPath();
        for (let k = 0; k + 3 < list.length; k += 3) {
          const a = particles[list[k]],
            b = particles[list[k + 3]];
          ctx.moveTo(X(a.x), Y(a.y));
          ctx.lineTo(X(b.x), Y(b.y));
        }
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    }
    // Rungs of the helix.
    if (helix > 0.01) {
      ctx.strokeStyle = `rgba(150, 200, 230, ${0.2 * helix})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i + 1 < COUNT; i += 2) {
        const a = particles[i],
          b = particles[i + 1];
        if (signal > 0.5 && a.x > readerX) continue;
        ctx.moveTo(X(a.x), Y(a.y));
        ctx.lineTo(X(b.x), Y(b.y));
      }
      ctx.stroke();
    }
    // The signal: the marks read out as peaks.
    if (signal > 0.01) {
      const trace = particles
        .map((p, i) => ({ p, i }))
        .filter(({ p, i }) => p.x > readerX && i % 2 === 0)
        .sort((a, b) => a.p.x - b.p.x);
      ctx.strokeStyle = `rgba(190, 235, 130, ${0.8 * signal})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      trace.forEach(({ p }, k) => (k ? ctx.lineTo(X(p.x), Y(p.y)) : ctx.moveTo(X(p.x), Y(p.y))));
      ctx.stroke();
    }

    for (const p of particles) {
      ctx.globalAlpha = clamp(p.alpha);
      ctx.fillStyle = ctx.strokeStyle = COLOURS[p.colour];
      const x = X(p.x),
        y = Y(p.y);
      if (p.look === 'fragment') {
        const a = Math.sin(t * 0.9 + p.r1 * 6) * 1.2;
        const l = 5;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - Math.cos(a) * l, y - Math.sin(a) * l);
        ctx.quadraticCurveTo(
          x + Math.sin(a) * 3,
          y - Math.cos(a) * 3,
          x + Math.cos(a) * l,
          y + Math.sin(a) * l,
        );
        ctx.stroke();
      } else if (p.look === 'bar') {
        const l = 4 * p.size + 3;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - l, y);
        ctx.lineTo(x + l, y);
        ctx.stroke();
      } else if (p.look === 'square') {
        const s = Math.max(3, Math.min(9, width / 110));
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      } else {
        ctx.beginPath();
        ctx.arc(x, y, 2.2 * p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  };

  return { draw, resize, wake: () => (last = 0) };
}
