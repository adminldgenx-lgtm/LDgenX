// The DNA of the "De l'échantillon à la décision" section: 17,000 particles taken from
// models/dna-ldgenx-particles.glb ("DNA" by LucasPresoto, CC BY 4.0, recoloured for LDgenX), drawn
// as small crisp points with WebGL. A small renderer of our own: no 3D library is loaded for it.
// The helix lies across the screen, from top right to bottom left.

export type DnaState = {
  /** 0 → 7 across the seven stages; drives the camera, the rotation and the green marker. */
  stage: number;
  /** Seconds, for the drift of the particles. */
  time: number;
  /** 0 → 1 as the helix gathers on arrival. */
  reveal: number;
  /** 1 just after the stage changes, fading to 0. */
  pulse: number;
  /** Phones show a steeper helix in the upper half, above the text. */
  compact: boolean;
};

const VERTEX = `
attribute vec3 aPosition;
attribute float aColour;
attribute float aSize;
attribute float aSeed;
uniform mat4 uView;
uniform mat4 uProjection;
uniform vec2 uShift;
uniform float uRotation;
uniform float uRoll;
uniform float uTime;
uniform float uReveal;
uniform float uFocusY;
uniform float uFocus;
uniform float uWhole;
uniform float uPulse;
uniform float uPixels;
varying vec3 vColour;
varying float vAlpha;

void main() {
  vec3 p = aPosition;
  // Gathering on arrival: each particle comes in from a looser, wider helix.
  float settle = clamp(uReveal * 1.6 - aSeed * 0.6, 0.0, 1.0);
  settle = settle * settle * (3.0 - 2.0 * settle);
  vec3 scattered = vec3(p.x * (2.6 + 2.0 * aSeed), p.y * (1.0 + 0.25 * aSeed), p.z * (2.6 + 2.0 * fract(aSeed * 7.3)));
  p = mix(scattered, p, settle);
  // Suspended matter: a slow private orbit for every particle.
  // Living matter: every particle floats on its own slow orbit, and a gentle ripple breathes
  // along the strands.
  float w = uTime * (0.45 + 0.6 * aSeed) + aSeed * 40.0;
  p += vec3(cos(w), sin(w * 1.3 + aSeed * 3.0), sin(w * 0.8 + aSeed * 6.0)) * (0.016 + 0.018 * aSeed);
  float breath = 1.0 + 0.035 * sin(aPosition.y * 2.2 - uTime * 0.9);
  p.xz *= breath;
  // Turn about its own axis, then lie across the screen.
  float c = cos(uRotation), s = sin(uRotation);
  p = vec3(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
  float rc = cos(uRoll), rs = sin(uRoll);
  p = vec3(p.x * rc - p.y * rs, p.x * rs + p.y * rc, p.z);

  vec4 view = uView * vec4(p, 1.0);
  gl_Position = uProjection * view;
  gl_Position.xy += uShift * gl_Position.w;

  vec3 ice = vec3(0.55, 0.78, 0.96);
  vec3 green = vec3(0.56, 0.88, 0.24);
  vec3 pearl = vec3(0.92, 0.96, 1.0);
  vec3 colour = mix(mix(ice, green, step(0.5, aColour)), pearl, step(1.5, aColour));
  // The green marker of the current stage: a band of the helix lights up.
  float width = 0.34 + 0.1 * uPulse;
  float band = exp(-pow((aPosition.y - uFocusY) / width, 2.0)) * uFocus;
  float lit = clamp(band * (0.85 + 0.3 * uPulse) + uWhole * 0.35, 0.0, 1.0);
  vColour = mix(colour, vec3(0.55, 0.86, 0.22), lit);

  float depth = -view.z;
  gl_PointSize = max(1.5, aSize * uPixels / depth);
  // Particles at the back of the helix recede into the blue; the front ones stay solid.
  float back = clamp((p.z + 0.8) / 1.6, 0.0, 1.0);
  vAlpha = (0.35 + 0.6 * back) * settle;
}`;

const FRAGMENT = `
precision mediump float;
varying vec3 vColour;
varying float vAlpha;
void main() {
  // A crisp round particle with a hair of antialiasing: no halo.
  float d = length(gl_PointCoord - 0.5);
  float a = (1.0 - smoothstep(0.38, 0.5, d)) * vAlpha;
  gl_FragColor = vec4(vColour * a, a);
}`;

function perspective(fovy: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fovy / 2),
    nf = 1 / (near - far);
  return new Float32Array([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) * nf,
    -1,
    0,
    0,
    2 * far * near * nf,
    0,
  ]);
}

function lookAt(eye: number[], target: number[]) {
  const z = eye.map((v, i) => v - target[i]);
  const zl = Math.hypot(...z);
  z.forEach((_, i) => (z[i] /= zl));
  const x = [z[2], 0, -z[0]];
  const xl = Math.hypot(...x);
  x.forEach((_, i) => (x[i] /= xl));
  const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
  const dot = (a: number[]) => a[0] * eye[0] + a[1] * eye[1] + a[2] * eye[2];
  return new Float32Array([
    x[0],
    y[0],
    z[0],
    0,
    x[1],
    y[1],
    z[1],
    0,
    x[2],
    y[2],
    z[2],
    0,
    -dot(x),
    -dot(y),
    -dot(z),
    1,
  ]);
}

const smooth = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};

// The helix runs from y = -2.73 to 2.69. The camera approaches its upper part, travels down it
// through the first six stages, then steps back to show the whole of it for the decision.
const WIDE = { y: 0, distance: 7.6 };
const NEAR = { top: 1.6, bottom: -1.6, distance: 6.2 };

export function cameraFor(stage: number) {
  const approach = smooth(stage / 0.7);
  const retreat = smooth((stage - 6) / 0.7);
  const travel = Math.min(1, Math.max(0, (stage - 0.5) / 5.5));
  const nearY = NEAR.top + (NEAR.bottom - NEAR.top) * travel;
  const close = approach * (1 - retreat);
  return {
    y: WIDE.y + (nearY - WIDE.y) * close,
    distance: WIDE.distance + (NEAR.distance - WIDE.distance) * close,
    focus: close,
    focusY: nearY,
    whole: retreat,
  };
}

export async function loadParticles(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`DNA particles: ${response.status}`);
  const buffer = await response.arrayBuffer();
  const view = new DataView(buffer);
  const count = view.getUint32(0, true),
    scale = view.getFloat32(4, true),
    largest = view.getFloat32(8, true);
  const position = new Float32Array(count * 3),
    colour = new Float32Array(count),
    size = new Float32Array(count),
    seed = new Float32Array(count);
  for (let i = 0, o = 12; i < count; i++, o += 8) {
    position[i * 3] = (view.getInt16(o, true) / 32767) * scale;
    position[i * 3 + 1] = (view.getInt16(o + 2, true) / 32767) * scale;
    position[i * 3 + 2] = (view.getInt16(o + 4, true) / 32767) * scale;
    colour[i] = view.getUint8(o + 6);
    size[i] = (view.getUint8(o + 7) / 255) * largest;
    // A stable pseudo-random value per particle, for drift and arrival.
    seed[i] = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    if (seed[i] < 0) seed[i] += 1;
  }
  return { count, position, colour, size, seed };
}

export type Particles = Awaited<ReturnType<typeof loadParticles>>;

export function createDnaScene(canvas: HTMLCanvasElement, particles: Particles) {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
  });
  if (!gl) return null;
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      throw new Error(gl.getShaderInfoLog(shader) ?? 'shader');
    return shader;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(program) ?? 'program');
  gl.useProgram(program);
  const attribute = (name: string, data: Float32Array, width: number) => {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const location = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, width, gl.FLOAT, false, 0, 0);
  };
  attribute('aPosition', particles.position, 3);
  attribute('aColour', particles.colour, 1);
  attribute('aSize', particles.size, 1);
  attribute('aSeed', particles.seed, 1);
  const u = (name: string) => gl.getUniformLocation(program, name);
  const uniforms = {
    view: u('uView'),
    projection: u('uProjection'),
    shift: u('uShift'),
    rotation: u('uRotation'),
    roll: u('uRoll'),
    time: u('uTime'),
    reveal: u('uReveal'),
    focusY: u('uFocusY'),
    focus: u('uFocus'),
    whole: u('uWhole'),
    pulse: u('uPulse'),
    pixels: u('uPixels'),
  };
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const fov = (32 * Math.PI) / 180;
  return {
    draw(state: DnaState) {
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      const width = Math.round(canvas.clientWidth * ratio),
        height = Math.round(canvas.clientHeight * ratio);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const camera = cameraFor(state.stage);
      // Desktop: the helix runs from the top right to the bottom left, the text takes the two
      // free corners. Phones: a steeper helix in the upper half, over the text.
      const roll = state.compact ? -0.42 : -1.02;
      const distance = camera.distance * (state.compact ? 1.45 : 1);
      // The camera looks at the point of the axis being told, wherever the roll has put it.
      const target = [-Math.sin(roll) * camera.y, Math.cos(roll) * camera.y, 0];
      const eye = [target[0], target[1] + 0.3, distance];
      gl.uniformMatrix4fv(uniforms.view, false, lookAt(eye, target));
      gl.uniformMatrix4fv(uniforms.projection, false, perspective(fov, width / height, 0.1, 60));
      gl.uniform2f(uniforms.shift, 0, state.compact ? 0.42 : 0);
      gl.uniform1f(uniforms.roll, roll);
      gl.uniform1f(uniforms.rotation, state.stage * 0.6 + state.time * 0.025);
      gl.uniform1f(uniforms.time, state.time);
      gl.uniform1f(uniforms.reveal, state.reveal);
      gl.uniform1f(uniforms.focusY, camera.focusY);
      gl.uniform1f(uniforms.focus, camera.focus);
      gl.uniform1f(uniforms.whole, camera.whole);
      gl.uniform1f(uniforms.pulse, state.pulse);
      // Particle diameter in pixels per world unit at unit distance.
      gl.uniform1f(uniforms.pixels, (height / (2 * Math.tan(fov / 2))) * 2 * 1.05);
      gl.drawArrays(gl.POINTS, 0, particles.count);
    },
    dispose() {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
