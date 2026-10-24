// Builds public/models/dna-particles.bin: the particle double helix of the "De l'échantillon à
// la décision" section, generated here from a few measurements (no third-party model). Two
// strands wind around the axis, joined by base pairs: one strand ice blue, the other pearl and
// ice, with three green bands across the helix. Every particle also gets a size.
// The same seed always gives the same file.
//
// Format, little endian: uint32 count, float32 scale, float32 largest radius, then per particle
// int16 x, y, z (position / scale * 32767), uint8 colour (0 ice blue, 1 LDgenX green, 2 pearl),
// uint8 size (radius / largest * 255). Read by loadParticles in src/lib/dna-scene.ts.
//
// Usage: node scripts/build-dna-particles.mjs
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const COUNT = 17000;
const Y0 = -2.72; // the helix lies along y
const Y1 = 2.68;
const TWIST = -2.295; // radians per unit of length: about two turns in all
const PHASE = 0.976; // angle of the first strand at y = 0
const STRAND = { radius: 0.645, radial: 0.155, across: 0.3, along: 0.1 };
const BASE_PAIRS = 20;
const PAIR_SHARE = 0.16; // share of the particles in the base pairs
const LARGEST = 0.01407; // largest particle radius
const GREEN_BANDS = [-2.0, 0, 2.0]; // centres along y, each 0.24 long
const PEARL = 0.35; // share of pearl particles on the second strand

let seed = 20261024;
const random = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;

/** A point drawn evenly inside the unit ball. */
function inBall() {
  for (;;) {
    const p = [random() * 2 - 1, random() * 2 - 1, random() * 2 - 1];
    if (p[0] ** 2 + p[1] ** 2 + p[2] ** 2 <= 1) return p;
  }
}

/** 0 ice blue, 1 green, 2 pearl, for a particle at height y on a strand (0 or 1). */
function colourAt(y, strand) {
  if (GREEN_BANDS.some((c) => Math.abs(y - c) < 0.12)) return 1;
  return strand === 1 && random() < PEARL ? 2 : 0;
}

const particles = [];
const pairs = Math.round(COUNT * PAIR_SHARE);
for (let i = 0; i < COUNT; i++) {
  let x, y, z, colour;
  if (i < pairs) {
    // A base pair: a thin rung through the axis, from one strand to the other.
    const k = i % BASE_PAIRS;
    const yk = Y0 + ((k + 0.5) / BASE_PAIRS) * (Y1 - Y0);
    y = yk + (random() - 0.5) * 0.14;
    const angle = PHASE + TWIST * yk;
    const side = random() < 0.5 ? 0 : 1;
    const r = (side ? -1 : 1) * random() * (STRAND.radius - STRAND.radial);
    colour = colourAt(yk, side);
    const across = (random() + random() + random() - 1.5) * 0.05;
    x = r * Math.cos(angle) - across * Math.sin(angle);
    z = r * Math.sin(angle) + across * Math.cos(angle);
  } else {
    // A strand: an elongated section around its line, the second strand opposite the first.
    const [dr, dt, dy] = inBall();
    y = Y0 + random() * (Y1 - Y0) + dy * STRAND.along;
    const strand = random() < 0.5 ? 0 : 1;
    const angle = PHASE + TWIST * y + strand * Math.PI;
    colour = colourAt(y, strand);
    const r = STRAND.radius + dr * STRAND.radial;
    const across = dt * STRAND.across;
    x = r * Math.cos(angle) - across * Math.sin(angle);
    z = r * Math.sin(angle) + across * Math.cos(angle);
  }
  // Mostly small particles, a few large ones.
  const size = Math.round(96 + 159 * random() ** 2.4);
  particles.push([x, y, z, colour, size]);
}

const scale = Math.max(...particles.flatMap((p) => p.slice(0, 3).map(Math.abs))) * 1.001;
const out = Buffer.alloc(12 + COUNT * 8);
out.writeUInt32LE(COUNT, 0);
out.writeFloatLE(scale, 4);
out.writeFloatLE(LARGEST, 8);
particles.forEach(([x, y, z, colour, size], i) => {
  const o = 12 + i * 8;
  out.writeInt16LE(Math.round((x / scale) * 32767), o);
  out.writeInt16LE(Math.round((y / scale) * 32767), o + 2);
  out.writeInt16LE(Math.round((z / scale) * 32767), o + 4);
  out.writeUInt8(colour, o + 6);
  out.writeUInt8(size, o + 7);
});
writeFileSync(path.join(root, 'public/models/dna-particles.bin'), out);
console.log(`${COUNT} particles, scale ${scale.toFixed(3)}, ${out.length} bytes`);
