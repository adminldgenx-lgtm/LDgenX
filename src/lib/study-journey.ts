import type { studyGeo as StudyGeo } from './study-geo';

/* The chart of the Artois-Picardie journey, drawn on one canvas: the sea, the moving water, the
   land, rivers, borders and coast, at any zoom from all of France down to a single harbour.
   The water is a field of particles following the coast towards the North Sea, as the residual
   current runs through the strait. It is an illustration: nothing here is a measurement. */

type Geo = typeof StudyGeo;
export type Box = { x0: number; y0: number; x1: number; y1: number };
export type Camera = { x: number; y: number; scale: number };
export type Layer = 'none' | 'courants' | 'turbidite' | 'marees';
export type Mode = 'calm' | 'sample' | 'analyse' | 'compare';
export type JourneyFrame = {
  camera: Camera;
  /** Where the camera centre sits on the stage, in CSS pixels. */
  focus: { x: number; y: number };
  layer: Layer;
  mode: Mode;
  /** The site the camera visits, or -1. */
  site: number;
  /** The site under the pointer, or -1. */
  hover: number;
  /** How strongly the study frame is outlined (the France view). */
  frame: number;
};

type Particle = {
  x: number;
  y: number;
  px: number;
  py: number;
  age: number;
  life: number;
  seed: number;
};

const GRID = 36;
const NORTH_EAST = { x: 0.62, y: -0.78 };
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Fits a world box into an area of the stage. */
export function fit(box: Box, area: Box): Camera {
  const scale = Math.min(
    (area.x1 - area.x0) / (box.x1 - box.x0),
    (area.y1 - area.y0) / (box.y1 - box.y0),
  );
  return { x: (box.x0 + box.x1) / 2, y: (box.y0 + box.y1) / 2, scale };
}

/** From one camera to another, the target staying put while the zoom changes (a dive). */
export function between(a: Camera, b: Camera, t: number): Camera {
  const scale = Math.exp(Math.log(a.scale) + (Math.log(b.scale) - Math.log(a.scale)) * t);
  const ratio = Math.abs(b.scale - a.scale) / Math.max(a.scale, b.scale);
  let k = t;
  if (ratio > 0.08) k = (1 / scale - 1 / a.scale) / (1 / b.scale - 1 / a.scale);
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, scale };
}

export function createJourney(
  canvas: HTMLCanvasElement,
  geo: Geo,
  onCatch: (site: number) => void,
) {
  const context = canvas.getContext('2d');
  if (!context) return null;
  const trail = document.createElement('canvas');
  const trails = trail.getContext('2d');
  if (!trails) return null;

  const shape = {
    land: new Path2D(geo.land),
    coast: new Path2D(geo.coast),
    riversMajor: new Path2D(geo.riversMajor),
    riversMinor: new Path2D(geo.riversMinor),
    countries: new Path2D(geo.countryBorders),
    departements: new Path2D(geo.departementBorders),
    france: new Path2D(geo.france),
    neighbours: new Path2D(geo.neighbours),
  };
  const { frame } = geo;
  const cols = Math.ceil((frame.x1 - frame.x0) / GRID);
  const rows = Math.ceil((frame.y1 - frame.y0) / GRID);

  // The water: which cells are sea, and where the water goes in each. The field is built a few
  // rows per frame, nearest rows first, so building it never holds the page up; particles are
  // only born in rows already known.
  const sea = new Uint8Array(cols * rows);
  const flow = new Float32Array(cols * rows * 3);
  const probe = document.createElement('canvas').getContext('2d');
  // Shore points with their direction (towards the North Sea), sorted into buckets.
  const BUCKET = 180;
  const bucketCols = Math.ceil((frame.x1 - frame.x0) / BUCKET);
  const bucketRows = Math.ceil((frame.y1 - frame.y0) / BUCKET);
  const buckets: number[][] = Array.from({ length: bucketCols * bucketRows }, () => []);
  const shore: number[] = [];
  for (const flat of geo.flow) {
    const n = flat.length / 2;
    for (let i = 0; i < n; i++) {
      const a = Math.max(0, i - 2),
        b = Math.min(n - 1, i + 2);
      let ux = flat[b * 2] - flat[a * 2],
        uy = flat[b * 2 + 1] - flat[a * 2 + 1];
      const length = Math.hypot(ux, uy) || 1;
      ux /= length;
      uy /= length;
      // Along any shore, the water runs towards the North Sea.
      if (ux * NORTH_EAST.x + uy * NORTH_EAST.y < 0) {
        ux = -ux;
        uy = -uy;
      }
      const x = flat[i * 2],
        y = flat[i * 2 + 1];
      const bc = Math.floor((x - frame.x0) / BUCKET),
        br = Math.floor((y - frame.y0) / BUCKET);
      if (bc < 0 || br < 0 || bc >= bucketCols || br >= bucketRows) continue;
      buckets[br * bucketCols + bc].push(shore.length / 4);
      shore.push(x, y, ux, uy);
    }
  }
  const nearestShore = (x: number, y: number) => {
    const bc = Math.floor((x - frame.x0) / BUCKET),
      br = Math.floor((y - frame.y0) / BUCKET);
    let best = Infinity,
      found = -1;
    for (let ring = 0; ring < Math.max(bucketCols, bucketRows); ring++) {
      if (found >= 0 && (ring - 1) * BUCKET > Math.sqrt(best)) break;
      for (let r = br - ring; r <= br + ring; r++) {
        if (r < 0 || r >= bucketRows) continue;
        for (let c = bc - ring; c <= bc + ring; c++) {
          if (c < 0 || c >= bucketCols) continue;
          if (Math.max(Math.abs(r - br), Math.abs(c - bc)) !== ring) continue;
          for (const k of buckets[r * bucketCols + c]) {
            const dx = shore[k * 4] - x,
              dy = shore[k * 4 + 1] - y;
            const d = dx * dx + dy * dy;
            if (d < best) {
              best = d;
              found = k;
            }
          }
        }
      }
    }
    return { found, distance: Math.sqrt(best) };
  };
  const buildRow = (row: number) => {
    for (let col = 0; col < cols; col++) {
      const cell = row * cols + col;
      const x = frame.x0 + (col + 0.5) * GRID,
        y = frame.y0 + (row + 0.5) * GRID;
      sea[cell] = probe && probe.isPointInPath(shape.land, x, y, 'evenodd') ? 0 : 1;
      if (!sea[cell]) continue;
      const { found, distance } = nearestShore(x, y);
      const tx = found >= 0 ? shore[found * 4 + 2] : NORTH_EAST.x,
        ty = found >= 0 ? shore[found * 4 + 3] : NORTH_EAST.y;
      const along = Math.exp(-distance / 260);
      let fx = tx * along + NORTH_EAST.x * (1 - along),
        fy = ty * along + NORTH_EAST.y * (1 - along);
      const n = Math.hypot(fx, fy) || 1;
      fx /= n;
      fy /= n;
      flow[cell * 3] = fx;
      flow[cell * 3 + 1] = fy;
      flow[cell * 3 + 2] = 0.6 + 0.6 * Math.exp(-distance / 180);
    }
  };
  // Rows near the study coast first: they are the ones on screen first.
  const studyRow = Math.floor(((geo.study.y0 + geo.study.y1) / 2 - frame.y0) / GRID);
  const order = Array.from({ length: rows }, (_, r) => r).sort(
    (a, b) => Math.abs(a - studyRow) - Math.abs(b - studyRow),
  );
  let built = 0;
  const buildSome = (budgetMs: number) => {
    const start = performance.now();
    while (built < rows && performance.now() - start < budgetMs) buildRow(order[built++]);
  };
  const seaAt = (x: number, y: number) => {
    const col = Math.floor((x - frame.x0) / GRID),
      row = Math.floor((y - frame.y0) / GRID);
    if (col < 0 || row < 0 || col >= cols || row >= rows) return -1;
    const cell = row * cols + col;
    return sea[cell] ? cell : -1;
  };

  let width = 0,
    height = 0,
    ratio = 1,
    last = 0,
    previous: Camera | null = null;
  let particles: Particle[] = [];
  const mix = { courants: 0, turbidite: 0, marees: 0, sample: 0, analyse: 0, compare: 0, water: 0 };
  const estuaries = geo.sites.filter((s) => s.setting !== 'port');

  const resize = () => {
    const box = canvas.getBoundingClientRect();
    if (!box.width) return;
    width = box.width;
    height = box.height;
    // Phones draw at 1.5x: the chart is soft light on dark water, and weaker GPUs keep up.
    ratio = Math.min(window.devicePixelRatio || 1, width < 700 ? 1.5 : 2);
    canvas.width = trail.width = Math.round(width * ratio);
    canvas.height = trail.height = Math.round(height * ratio);
    const count = width < 700 ? 650 : 1300;
    if (particles.length !== count)
      particles = Array.from({ length: count }, () => ({
        x: 0,
        y: 0,
        px: 0,
        py: 0,
        age: 0,
        life: 0,
        seed: 0,
      }));
    for (const p of particles) p.life = 0;
    previous = null;
  };
  resize();

  // Particles are born inside the view, so the water looks as dense at every zoom.
  const spawn = (p: Particle, view: Box) => {
    for (let tries = 0; tries < 10; tries++) {
      const x = view.x0 + Math.random() * (view.x1 - view.x0);
      const y = view.y0 + Math.random() * (view.y1 - view.y0);
      if (seaAt(x, y) >= 0) {
        p.x = p.px = x;
        p.y = p.py = y;
        p.age = 0;
        p.life = 90 + Math.random() * 160;
        p.seed = Math.random() * 6.283;
        return;
      }
    }
    p.life = 0;
  };

  const draw = (now: number, f: JourneyFrame) => {
    if (built < rows) buildSome(5);
    const dt = last ? Math.min(2.5, (now - last) / 16.67) : 1;
    last = now;
    const t = now / 1000;
    const { camera, focus } = f;
    const scale = camera.scale;
    const toScreen = (x: number, y: number) => [
      (x - camera.x) * scale + focus.x,
      (y - camera.y) * scale + focus.y,
    ];
    const view: Box = {
      x0: camera.x - focus.x / scale,
      y0: camera.y - focus.y / scale,
      x1: camera.x + (width - focus.x) / scale,
      y1: camera.y + (height - focus.y) / scale,
    };
    // The zoom decides what is drawn: France and its neighbours far out, the chart up close.
    const detail = smooth(0.075, 0.14, scale);
    const wide = 1 - smooth(0.11, 0.24, scale);

    const ease = (key: keyof typeof mix, on: boolean, rate = 0.05) => {
      mix[key] += ((on ? 1 : 0) - mix[key]) * Math.min(1, rate * dt);
    };
    ease('courants', f.layer === 'courants');
    ease('turbidite', f.layer === 'turbidite', 0.04);
    ease('marees', f.layer === 'marees', 0.04);
    ease('sample', f.mode === 'sample');
    ease('analyse', f.mode === 'analyse');
    ease('compare', f.mode === 'compare');
    mix.water = detail;

    // Sea.
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const sky = context.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#051a2d');
    sky.addColorStop(1, '#072540');
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);

    const world = () =>
      context.setTransform(
        ratio * scale,
        0,
        0,
        ratio * scale,
        ratio * (focus.x - camera.x * scale),
        ratio * (focus.y - camera.y * scale),
      );
    const px = (n: number) => n / scale;

    // The wide view: France among its neighbours.
    if (wide > 0.01) {
      world();
      context.globalAlpha = wide;
      context.fillStyle = '#0b2639';
      context.fill(shape.neighbours);
      context.strokeStyle = 'rgba(255,255,255,0.12)';
      context.lineWidth = px(1);
      context.stroke(shape.neighbours);
      context.fillStyle = '#123a55';
      context.fill(shape.france);
      context.strokeStyle = 'rgba(190,228,255,0.5)';
      context.lineWidth = px(1.2);
      context.stroke(shape.france);
      context.globalAlpha = 1;
    }

    // The detailed chart.
    if (detail > 0.01) {
      world();
      context.globalAlpha = detail;
      // Graticule, every half degree of longitude and quarter degree of latitude.
      context.strokeStyle = 'rgba(255,255,255,0.045)';
      context.lineWidth = px(1);
      context.beginPath();
      const unitsPerDegLat = geo.unitsPerKm * 111.32;
      const unitsPerDegLon = unitsPerDegLat * Math.cos((50.6 * Math.PI) / 180);
      for (let lon = 0.5; lon <= 3.5; lon += 0.5) {
        const x = (lon - 1.3) * unitsPerDegLon;
        context.moveTo(x, frame.y0);
        context.lineTo(x, frame.y1);
      }
      for (let lat = 49.75; lat <= 51.5; lat += 0.25) {
        const y = (51.12 - lat) * unitsPerDegLat;
        context.moveTo(frame.x0, y);
        context.lineTo(frame.x1, y);
      }
      context.stroke();
      // Beyond the detailed frame, the coarse outlines carry the land on to the screen's edge.
      context.save();
      context.beginPath();
      context.rect(
        frame.x0 - 1e5,
        frame.y0 - 1e5,
        2e5 + frame.x1 - frame.x0,
        2e5 + frame.y1 - frame.y0,
      );
      context.rect(frame.x0, frame.y0, frame.x1 - frame.x0, frame.y1 - frame.y0);
      context.clip('evenodd');
      context.fillStyle = context.strokeStyle = '#10324a';
      context.lineWidth = px(3);
      for (const outline of [shape.neighbours, shape.france]) {
        context.fill(outline);
        context.stroke(outline);
      }
      context.restore();
      // Shallow water along the shore; with the tides it breathes.
      const tide = mix.marees * (0.5 + 0.5 * Math.sin((t * 2 * Math.PI) / 7));
      context.lineJoin = 'round';
      context.strokeStyle = 'rgba(70,150,195,0.10)';
      context.lineWidth = Math.max(px(10), 26 + 60 * tide);
      context.stroke(shape.coast);
      context.strokeStyle = 'rgba(90,170,215,0.12)';
      context.lineWidth = Math.max(px(5), 9 + 26 * tide);
      context.stroke(shape.coast);
      // Turbid plumes at the mouths of rivers and bays.
      if (mix.turbidite > 0.01) {
        estuaries.forEach((s, k) => {
          const drift = Math.sin(t * 0.45 + k * 1.7);
          const x = s.x - 52 + drift * 12,
            y = s.y - 22 - drift * 20;
          const radius = 150 + 26 * Math.sin(t * 0.7 + k);
          const g = context.createRadialGradient(x, y, 0, x, y, radius);
          g.addColorStop(0, `rgba(196, 160, 96, ${0.36 * mix.turbidite})`);
          g.addColorStop(0.5, `rgba(176, 140, 82, ${0.16 * mix.turbidite})`);
          g.addColorStop(1, 'rgba(176, 140, 82, 0)');
          context.fillStyle = g;
          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fill();
        });
      }
      context.globalAlpha = 1;
    }

    // The moving water, kept on its own canvas so it can leave trails.
    trails.setTransform(1, 0, 0, 1, 0, 0);
    const moved =
      !previous ||
      Math.abs(previous.scale - scale) / scale > 0.002 ||
      Math.hypot(previous.x - camera.x, previous.y - camera.y) * scale > 0.6;
    trails.globalCompositeOperation = 'destination-out';
    trails.fillStyle = `rgba(0,0,0,${moved ? 0.5 : 0.11})`;
    trails.fillRect(0, 0, trail.width, trail.height);
    trails.globalCompositeOperation = 'source-over';
    previous = { ...camera };
    if (detail > 0.02) {
      const speed = (0.9 + 1.6 * mix.courants - 0.3 * mix.turbidite) * (1 / scale) * 0.55;
      const tideFlow = 1 - mix.marees + mix.marees * Math.sin((t * 2 * Math.PI) / 7) * 1.6;
      const reach = 92 / scale;
      trails.setTransform(
        ratio * scale,
        0,
        0,
        ratio * scale,
        ratio * (focus.x - camera.x * scale),
        ratio * (focus.y - camera.y * scale),
      );
      trails.lineCap = 'round';
      trails.lineWidth = (1.1 + 0.5 * mix.courants) / scale;
      const batches: Record<string, number[]> = { water: [], green: [], sand: [] };
      for (const p of particles) {
        const outside =
          p.x < view.x0 - 40 / scale ||
          p.x > view.x1 + 40 / scale ||
          p.y < view.y0 - 40 / scale ||
          p.y > view.y1 + 40 / scale;
        if (p.life <= 0 || p.age > p.life || outside) {
          spawn(p, view);
          continue;
        }
        const cell = seaAt(p.x, p.y);
        if (cell < 0) {
          p.life = 0;
          continue;
        }
        const wobble = Math.sin(t * 0.6 + p.seed) * 0.4;
        const fx = flow[cell * 3],
          fy = flow[cell * 3 + 1];
        const strength = flow[cell * 3 + 2] * speed * tideFlow;
        let vx = (fx * Math.cos(wobble) - fy * Math.sin(wobble)) * strength;
        let vy = (fx * Math.sin(wobble) + fy * Math.cos(wobble)) * strength;
        let nearest = Infinity;
        for (let i = 0; i < geo.sites.length; i++) {
          const s = geo.sites[i];
          const dx = s.x - p.x,
            dy = s.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d < nearest) nearest = d;
          const pulled = i === f.hover || (i === f.site && mix.sample > 0.3);
          const radius = pulled ? reach * 1.9 : reach * mix.sample * 0.8;
          if (d < radius && d > 0) {
            const pull = ((pulled ? 3.2 : 1.6) * (1 - d / radius)) / scale;
            vx += (dx / d) * pull;
            vy += (dy / d) * pull;
            if (d < 6 / scale) {
              onCatch(i);
              p.life = 0;
            }
          }
        }
        p.px = p.x;
        p.py = p.y;
        p.x += vx * dt;
        p.y += vy * dt;
        p.age += dt;
        const fade = Math.min(1, p.age / 20, (p.life - p.age) / 30);
        if (fade < 0.15) continue;
        const green = mix.analyse * clamp(1 - (nearest * scale) / 140);
        const kind =
          green > 0.25 ? 'green' : mix.turbidite > 0.3 && nearest < 190 ? 'sand' : 'water';
        batches[kind].push(p.px, p.py, p.x, p.y);
      }
      const colours: Record<string, string> = {
        water: `rgba(185, 225, 255, ${0.5 + 0.3 * mix.courants})`,
        green: 'rgba(160, 222, 80, 0.85)',
        sand: 'rgba(214, 180, 118, 0.7)',
      };
      for (const kind of Object.keys(batches)) {
        const list = batches[kind];
        if (!list.length) continue;
        trails.strokeStyle = colours[kind];
        trails.beginPath();
        for (let i = 0; i < list.length; i += 4) {
          trails.moveTo(list[i], list[i + 1]);
          trails.lineTo(list[i + 2], list[i + 3]);
        }
        trails.stroke();
      }
    }
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.globalAlpha = detail;
    context.drawImage(trail, 0, 0);
    context.globalAlpha = 1;

    if (detail > 0.01) {
      world();
      context.globalAlpha = detail;
      context.fillStyle = '#10324a';
      context.fill(shape.land, 'evenodd');
      // Rivers, borders, coast: hairlines whatever the zoom.
      context.lineJoin = 'round';
      context.lineCap = 'round';
      context.strokeStyle = 'rgba(92, 170, 215, 0.35)';
      context.lineWidth = px(0.9);
      context.stroke(shape.riversMinor);
      context.strokeStyle = 'rgba(120, 200, 240, 0.7)';
      context.lineWidth = px(1.4);
      context.stroke(shape.riversMajor);
      context.setLineDash([px(4), px(4)]);
      context.strokeStyle = 'rgba(255,255,255,0.13)';
      context.lineWidth = px(1);
      context.stroke(shape.departements);
      context.setLineDash([px(8), px(5)]);
      context.strokeStyle = 'rgba(255,255,255,0.32)';
      context.lineWidth = px(1.3);
      context.stroke(shape.countries);
      context.setLineDash([]);
      context.strokeStyle = 'rgba(140, 205, 245, 0.22)';
      context.lineWidth = px(5);
      context.stroke(shape.coast);
      context.strokeStyle = 'rgba(205, 236, 255, 0.92)';
      context.lineWidth = px(1.3);
      context.stroke(shape.coast);
      // During the analysis, a halo gathers round every site.
      if (mix.analyse > 0.01 || mix.compare > 0.01) {
        geo.sites.forEach((s, i) => {
          const beat =
            mix.compare * (0.5 + 0.5 * Math.sin(t * 2.6)) +
            mix.analyse * (0.5 + 0.5 * Math.sin(t * 2.2 - i * 0.7));
          const radius = px(26 + 30 * beat);
          const g = context.createRadialGradient(s.x, s.y, 0, s.x, s.y, radius);
          g.addColorStop(0, `rgba(140, 210, 60, ${0.34 * Math.max(mix.analyse, mix.compare)})`);
          g.addColorStop(1, 'rgba(140, 210, 60, 0)');
          context.fillStyle = g;
          context.beginPath();
          context.arc(s.x, s.y, radius, 0, Math.PI * 2);
          context.fill();
        });
      }
      context.globalAlpha = 1;
    }

    // The study area, outlined on the map of France.
    if (f.frame > 0.01) {
      world();
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
      const s = geo.study;
      context.globalAlpha = f.frame;
      context.fillStyle = `rgba(115, 181, 15, ${0.12 + 0.1 * pulse})`;
      context.fillRect(s.x0, s.y0, s.x1 - s.x0, s.y1 - s.y0);
      context.strokeStyle = '#8fd13a';
      context.lineWidth = px(1.6);
      context.strokeRect(s.x0, s.y0, s.x1 - s.x0, s.y1 - s.y0);
      const grow = px(10 + 22 * pulse);
      context.strokeStyle = `rgba(143, 209, 58, ${0.5 * (1 - pulse)})`;
      context.strokeRect(s.x0 - grow, s.y0 - grow, s.x1 - s.x0 + grow * 2, s.y1 - s.y0 + grow * 2);
      context.globalAlpha = 1;
    }

    return { toScreen, detail, wide, scale };
  };

  return { draw, resize, wake: () => ((last = 0), (previous = null)) };
}
