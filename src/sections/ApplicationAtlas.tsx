import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Minimize2,
  ZoomIn,
} from 'lucide-react';
import { useCatalog, useRoutes } from '../i18n';
import { applicationIds } from '../content/site';
import { Photo } from '../components/ui';
import { useMediaQuery, useMotionLevel } from '../components/motion';
import { scrollBehavior } from '../lib/motion-preference';

/* "Vos terrains d'application" as an illustrated coastal atlas. One generated landscape (see
   ldgenx-atlas-2d/), a water layer that catches the light, turbines whose rotors turn, and six
   places, one per sector. Choosing a place flies the view to it and opens its card. The geography
   is illustrative; every word in the cards comes from the sector pages. */

const IMAGE_RATIO = 3840 / 2160;
const ZOOM_MS = 1200;
// Arrival: the map window opens while the view descends from a low, close angle to above.
const INTRO_MS = 2000;

// Where each sector sits in the landscape (fraction of the image), and how its label leaves the
// point: a short leader up and to the right, longer where turbines stand above it.
const PLACES: Record<
  string,
  { at: [number, number]; leader: [number, number]; side: 'left' | 'right' }
> = {
  // From the forest to the open sea: wetland, farmland, research station, harbour, fish farm.
  'biodiversite-conservation': { at: [0.305, 0.475], leader: [26, -24], side: 'right' },
  'agriculture-agroecologie': { at: [0.48, 0.74], leader: [26, -34], side: 'right' },
  'recherche-publique-privee': { at: [0.64, 0.51], leader: [26, -30], side: 'left' },
  'environnement-bureaux-d-etudes': { at: [0.75, 0.61], leader: [26, -30], side: 'right' },
  'aquaculture-peche': { at: [0.85, 0.44], leader: [26, -30], side: 'left' },
  // At the foot of the nearest turbine; its name sits in the open sea to the right.
  'energies-marines-renouvelables': { at: [0.78, 0.197], leader: [22, -30], side: 'right' },
};
// Geometry only: the places are the same in every language (titles come from the catalogue).
const allSectors = applicationIds.map((id) => ({ id, place: PLACES[id] }));

// Turbines: four in the open sea at the upper right, smaller as they stand further out, and two
// on the hills inland. Tower
// and rotor are two cut-outs: the rotor turns about its hub, which is not the centre of its image.
const TOWER = { width: 1024, height: 1536, base: [499, 1493], hub: [398, 109] };
const ROTOR = { width: 1254, height: 1254, hub: [628, 764], radius: 726 };
const TURBINES = [
  { base: [0.63, 0.11], height: 0.064, seconds: 11, phase: 0, squash: 0.78 },
  { base: [0.68, 0.138], height: 0.071, seconds: 12.5, phase: 40, squash: 0.76 },
  { base: [0.73, 0.167], height: 0.078, seconds: 12, phase: 80, squash: 0.73 },
  { base: [0.78, 0.197], height: 0.086, seconds: 13.5, phase: 120, squash: 0.7 },
  // Onshore: two turbines on the wooded hills, so renewable energy is not read as offshore only.
  { base: [0.115, 0.45], height: 0.075, seconds: 12, phase: 200, squash: 0.74 },
  { base: [0.185, 0.478], height: 0.08, seconds: 13, phase: 290, squash: 0.72 },
].map((t) => {
  // In image units: x as a fraction of the width, y of the height.
  const scale = t.height / (TOWER.base[1] - TOWER.hub[1]);
  const sx = (scale * 0.45) / IMAGE_RATIO;
  const hub = [
    t.base[0] + (TOWER.hub[0] - TOWER.base[0]) * sx,
    t.base[1] + (TOWER.hub[1] - TOWER.base[1]) * scale,
  ];
  const rs = (t.height * 0.5) / ROTOR.radius;
  return {
    ...t,
    tower: {
      left: t.base[0] - TOWER.base[0] * sx,
      top: t.base[1] - TOWER.base[1] * scale,
      width: TOWER.width * sx,
      height: TOWER.height * scale,
    },
    rotor: {
      left: hub[0] - (ROTOR.hub[0] * rs) / IMAGE_RATIO,
      top: hub[1] - ROTOR.hub[1] * rs,
      width: (ROTOR.width * rs) / IMAGE_RATIO,
      height: ROTOR.height * rs,
    },
  };
});
const ROTOR_ORIGIN = `${(ROTOR.hub[0] / ROTOR.width) * 100}% ${(ROTOR.hub[1] / ROTOR.height) * 100}%`;
const pct = (v: number) => `${v * 100}%`;

type View = { x: number; y: number; z: number };
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t: number) => 1 - (1 - t) ** 3;
type Intro = 'static' | 'pending' | 'playing';
type Box = { left: number; top: number; right: number; bottom: number };
const overlaps = (a: Box, b: Box, gap = 8) =>
  a.left < b.right + gap &&
  a.right + gap > b.left &&
  a.top < b.bottom + gap &&
  a.bottom + gap > b.top;

// Only the label and its leader move. The geographic anchor always stays at PLACES.at.
function fitLabel(
  x: number,
  y: number,
  width: number,
  height: number,
  side: 'left' | 'right',
  dx: number,
  dy: number,
  w: number,
  h: number,
  obstacles: Box[],
  points: { x: number; y: number }[],
) {
  const preferred = { left: side === 'left' ? x - dx - width : x + dx, top: y + dy - height };
  const boundX = (v: number) => Math.max(12, Math.min(w - width - 12, v));
  const boundY = (v: number) => Math.max(12, Math.min(h - height - 12, v));
  const candidates: { box: Box; score: number }[] = [];
  for (const left of [preferred.left, x + dx, x - dx - width, x - width / 2, 12, w - width - 12]) {
    for (const offset of [0, -1, 1, -2, 2, -3, 3, -4, 4]) {
      const l = boundX(left),
        top = boundY(preferred.top + offset * (height + 12));
      const box = { left: l, top, right: l + width, bottom: top + height };
      const collisions = obstacles.filter((other) => overlaps(box, other)).length;
      const coveredPoints = points.filter((p) =>
        overlaps(box, { left: p.x - 8, top: p.y - 8, right: p.x + 8, bottom: p.y + 8 }, 0),
      ).length;
      const distance = Math.hypot(l - preferred.left, top - preferred.top);
      candidates.push({ box, score: (collisions + coveredPoints) * 10000 + distance });
    }
  }
  return candidates.sort((a, b) => a.score - b.score)[0].box;
}

export function ApplicationAtlas() {
  const { applications, services, ui } = useCatalog();
  const r = useRoutes();
  const t = ui.atlas;
  // The landscape has a place for each original sector; other fields are in the list below it.
  const sectors = allSectors.filter((s) => applications.some((a) => a.id === s.id));
  const content = sectors.flatMap((s) => applications.filter((a) => a.id === s.id));
  // Reduced motion keeps the journey across the map, without the tilt and the parallax.
  const calm = useMotionLevel() === 'reduced';
  const compact = useMediaQuery('(max-width: 800px)');
  const stage = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const spot = useRef<HTMLDivElement>(null);
  const markers = useRef<(HTMLButtonElement | null)[]>([]);
  const [picked, setActive] = useState(0);
  const active = Math.max(0, Math.min(picked, sectors.length - 1));
  const [focused, setFocused] = useState(false);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(true);
  const [intro, setIntro] = useState<Intro>('static');
  const arrived = useRef(false);
  const chips = useRef<HTMLDivElement>(null);

  // Everything the animation loop reads, kept outside React so it never waits for a render.
  const live = useRef({
    sectors,
    active: 0,
    focused: false,
    hover: -1,
    size: { w: 0, h: 0, iw: 0, ih: 0 },
    view: { x: 0, y: 0, z: 1 } as View,
    from: { x: 0, y: 0, z: 1 } as View,
    to: { x: 0, y: 0, z: 1 } as View,
    start: 0,
    pointer: { x: 0, y: 0, tx: 0, ty: 0, inside: false },
    drag: 0,
    spot: 0,
    frame: 0,
    visible: false,
    furniture: [] as Box[],
    heading: null as Box | null,
    labels: [] as { w: number; h: number }[],
    duration: ZOOM_MS,
    introStart: 0,
    cardSide: 'left' as 'left' | 'right',
    // The card's box in stage coordinates, when it floats over the landscape.
    card: null as { left: number; top: number; right: number; bottom: number } | null,
  });
  const card = useRef<HTMLElement>(null);
  live.current.sectors = sectors;
  live.current.active = active;
  live.current.focused = focused;
  // In a place, the card stands on the side away from it, so the place keeps the open ground.
  const cardSide: 'left' | 'right' =
    focused && !compact && (sectors[active]?.place.at[0] ?? 1) < 0.45 ? 'right' : 'left';
  live.current.cardSide = cardSide;

  // The view that frames the current choice: the whole landscape, or one place, set where the
  // card leaves it room (right of centre on wide screens, centre on phones).
  const targetView = useCallback((): View => {
    const { w, h, iw, ih } = live.current.size;
    const state = live.current;
    const z = state.focused ? (compact ? 1.55 : 1.45) : compact ? 1.18 : 1;
    let x = 0,
      y = 0;
    const at = state.sectors[state.active]?.place.at ?? [0.5, 0.5];
    if (state.focused) {
      const spotX = compact ? 0.5 : state.cardSide === 'right' ? 0.36 : 0.64;
      x = w * (spotX - 0.5) - z * (at[0] - 0.5) * iw;
      // A place too near the edge to reach its spot stays above the card instead.
      const mx = Math.max(0, (iw * z - w) / 2);
      const placeX = w / 2 + Math.min(mx, Math.max(-mx, x)) + z * (at[0] - 0.5) * iw;
      const box = state.card;
      const placeY =
        box && placeX > box.left - 40 && placeX < box.right + 40
          ? Math.max(120, Math.min(h * 0.5, box.top - 120))
          : h * (compact ? 0.52 : 0.5);
      y = placeY - h / 2 - z * (at[1] - 0.5) * ih;
    } else if (compact) {
      // Phones see part of the landscape, around the chosen place; a drag explores the rest.
      x = -z * (at[0] - 0.5) * iw + state.drag;
      y = -z * (at[1] - 0.55) * ih;
    }
    return { x, y, z };
  }, [compact]);

  const clamp = (v: View): View => {
    const { w, h, iw, ih } = live.current.size;
    const mx = Math.max(0, (iw * v.z - w) / 2),
      my = Math.max(0, (ih * v.z - h) / 2);
    return { z: v.z, x: Math.min(mx, Math.max(-mx, v.x)), y: Math.min(my, Math.max(-my, v.y)) };
  };

  const paint = useCallback(() => {
    const state = live.current;
    const { w, h, iw, ih } = state.size;
    if (!w || !world.current) return;
    const p = state.pointer;
    // Parallax and a slight tilt with the pointer: the landscape has depth.
    const view = clamp({ x: state.view.x + p.x * 14, y: state.view.y + p.y * 9, z: state.view.z });
    world.current.style.transform = `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.z})`;
    const arrival = state.introStart
      ? 1 - easeOut(Math.min(1, (performance.now() - state.introStart) / INTRO_MS))
      : 0;
    if (scene.current)
      scene.current.style.transform = calm
        ? ''
        : `perspective(1600px) rotateX(${p.y * -1.4 + arrival * 24}deg) rotateY(${p.x * 1.8}deg)`;
    const points = state.sectors.map((s) => ({
      x: w / 2 + view.x + view.z * (s.place.at[0] - 0.5) * iw,
      y: h / 2 + view.y + view.z * (s.place.at[1] - 0.5) * ih,
    }));
    const occupied: Box[] = [...state.furniture];
    if (state.card) occupied.push(state.card);
    if (!state.focused && state.heading) occupied.push(state.heading);
    const order = state.focused
      ? [state.active, ...state.sectors.map((_, i) => i).filter((i) => i !== state.active)]
      : state.sectors.map((_, i) => i);
    order.forEach((i) => {
      const s = state.sectors[i],
        el = markers.current[i];
      if (!el) return;
      const { x, y } = points[i];
      el.style.left = '0';
      el.style.top = '0';
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      const size = state.labels[i] ?? { w: 224, h: 64 };
      const visible =
        i === state.active ||
        (!compact && !state.focused) ||
        (!compact && el.matches(':hover, :focus-visible'));
      const box = fitLabel(
        x,
        y,
        size.w,
        size.h,
        s.place.side,
        ...s.place.leader,
        w,
        h,
        visible ? occupied : [],
        points,
      );
      if (visible) occupied.push(box);
      el.style.setProperty('--label-x', `${box.left - x}px`);
      el.style.setProperty('--label-y', `${box.top - y}px`);
      // The line meets the nearest edge of its plate, including a plate centred on a phone.
      const endX = Math.max(box.left + 8, Math.min(box.right - 8, x)) - x;
      const endY = Math.max(box.top + 8, Math.min(box.bottom - 8, y)) - y;
      el.style.setProperty('--len', `${Math.hypot(endX, endY)}px`);
      el.style.setProperty('--angle', `${Math.atan2(endY, endX)}rad`);
      el.toggleAttribute('data-flip', box.right <= x);
      if (i === (state.hover >= 0 && !state.focused ? state.hover : state.active) && spot.current) {
        spot.current.style.setProperty('--sx', `${x}px`);
        spot.current.style.setProperty('--sy', `${y}px`);
      }
    });
  }, [compact, calm]);

  const loop = useCallback(
    (now: number) => {
      const state = live.current;
      const t = Math.min(1, (now - state.start) / state.duration);
      const k = ease(t);
      state.view = {
        x: state.from.x + (state.to.x - state.from.x) * k,
        y: state.from.y + (state.to.y - state.from.y) * k,
        z: state.from.z + (state.to.z - state.from.z) * k,
      };
      const p = state.pointer;
      p.x += (p.tx - p.x) * 0.08;
      p.y += (p.ty - p.y) * 0.08;
      paint();
      const arriving = state.introStart > 0 && now - state.introStart < INTRO_MS;
      const settling =
        t < 1 || arriving || Math.abs(p.tx - p.x) > 0.001 || Math.abs(p.ty - p.y) > 0.001;
      state.frame = settling && state.visible ? requestAnimationFrame(loop) : 0;
    },
    [paint],
  );
  const kick = useCallback(() => {
    const state = live.current;
    if (!state.frame) state.frame = requestAnimationFrame(loop);
  }, [loop]);

  // Fly from wherever the view is now (interruptions included) to the view of the current choice.
  // Sizes of the names and of the card, read once per change rather than on every frame.
  const measure = useCallback(() => {
    const state = live.current;
    state.labels = markers.current.map((el) => {
      const name = el?.lastElementChild as HTMLElement | null;
      return { w: name?.offsetWidth ?? 180, h: name?.offsetHeight ?? 40 };
    });
    // Where the card will stand once it has moved: it may still be gliding between sides.
    const el = card.current;
    const { w, h } = state.size;
    const stageBox = stage.current?.getBoundingClientRect();
    const relative = (node: Element | null): Box | null => {
      if (!node || !stageBox) return null;
      const b = node.getBoundingClientRect();
      return {
        left: b.left - stageBox.left,
        top: b.top - stageBox.top,
        right: b.right - stageBox.left,
        bottom: b.bottom - stageBox.top,
      };
    };
    const atlas = stage.current?.closest('.atlas');
    state.heading = compact ? null : relative(atlas?.querySelector('.atlas-intro') ?? null);
    state.furniture = [relative(atlas?.querySelector('.atlas-corner') ?? null)].filter(
      (b): b is Box => b !== null,
    );
    if (compact || !el) state.card = null;
    else {
      const cw = el.offsetWidth,
        ch = el.offsetHeight,
        edge = Math.max(28, (w - 1328) / 2);
      const left = state.cardSide === 'right' ? w - edge - cw : edge;
      state.card = { left, right: left + cw, top: h - 28 - ch, bottom: h - 28 };
    }
  }, [compact]);

  const travel = useCallback(
    (instant = false, duration = ZOOM_MS) => {
      const state = live.current;
      measure();
      state.duration = duration;
      state.from = { ...state.view };
      state.to = clamp(targetView());
      state.start = instant ? -1e9 : performance.now();
      kick();
    },
    [kick, measure, targetView],
  );

  useEffect(() => {
    travel();
  }, [active, focused, travel]);

  // Font loading, a translated title, or a resized card can change the measured plates.
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      measure();
      kick();
    });
    markers.current.forEach((el) => {
      if (el?.lastElementChild) observer.observe(el.lastElementChild);
    });
    if (card.current) observer.observe(card.current);
    return () => observer.disconnect();
  }, [kick, measure]);

  // Phones: the row of sectors keeps the chosen one in view.
  useEffect(() => {
    const row = chips.current;
    const chip = row?.children[active] as HTMLElement | undefined;
    if (!row || !chip || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: chip.offsetLeft - 20, behavior: scrollBehavior() });
  }, [active]);

  // Size the landscape to cover the stage, with a little margin for the parallax.
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const resize = () => {
      const w = element.clientWidth,
        h = element.clientHeight;
      const iw = Math.max(w, h * IMAGE_RATIO) * 1.04;
      live.current.size = { w, h, iw, ih: iw / IMAGE_RATIO };
      if (world.current) {
        Object.assign(world.current.style, {
          width: `${iw}px`,
          height: `${iw / IMAGE_RATIO}px`,
          left: `${(w - iw) / 2}px`,
          top: `${(h - iw / IMAGE_RATIO) / 2}px`,
        });
      }
      live.current.view = clamp(targetView());
      travel(true);
    };
    const sizes = new ResizeObserver(resize);
    sizes.observe(element);
    resize();
    const onScreen = new IntersectionObserver(([entry]) => {
      live.current.visible = entry.isIntersecting;
      setPaused(!entry.isIntersecting);
      if (entry.isIntersecting) kick();
    });
    onScreen.observe(element);
    // The atlas arrives once, when it is well into view: the window onto the map opens, the view
    // descends from a low, close angle, then the places, the heading and the card arrive.
    if (!arrived.current) setIntro('pending');
    const arrival = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || arrived.current) return;
        arrived.current = true;
        setReady(true);
        setIntro('playing');
        const state = live.current;
        state.introStart = performance.now();
        state.view = { ...state.view, z: state.view.z * 1.4 };
        travel(false, INTRO_MS);
      },
      { rootMargin: '0px 0px -22% 0px' },
    );
    arrival.observe(element);
    const onVisibility = () => setPaused(document.hidden || !live.current.visible);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      sizes.disconnect();
      onScreen.disconnect();
      arrival.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      cancelAnimationFrame(live.current.frame);
      live.current.frame = 0;
    };
  }, [kick, targetView, travel]);

  const choose = (index: number) => {
    live.current.drag = 0;
    setActive(index);
    setFocused(true);
  };
  const overview = useCallback(() => {
    live.current.drag = 0;
    setFocused(false);
  }, []);
  const step = (delta: number) => choose((active + delta + sectors.length) % sectors.length);

  useEffect(() => {
    if (!focused) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') overview();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focused, overview]);

  // Pointer: parallax on wide screens, a sideways drag to explore on phones.
  const dragStart = useRef<{ x: number; drag: number; moved: boolean } | null>(null);
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = live.current;
    if (event.pointerType === 'mouse' && !calm) {
      const box = event.currentTarget.getBoundingClientRect();
      state.pointer.tx = ((event.clientX - box.left) / box.width - 0.5) * 2;
      state.pointer.ty = ((event.clientY - box.top) / box.height - 0.5) * 2;
      kick();
    }
    if (dragStart.current && !state.focused) {
      if (Math.abs(event.clientX - dragStart.current.x) > 8) dragStart.current.moved = true;
      state.drag = dragStart.current.drag + (event.clientX - dragStart.current.x);
      const view = clamp(targetView());
      state.drag += view.x - targetView().x;
      state.view = view;
      state.to = view;
      state.start = -1e9;
      kick();
    }
  };
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' || !compact) return;
    dragStart.current = { x: event.clientX, drag: live.current.drag, moved: false };
  };
  const dragged = useRef(false);
  const endDrag = () => {
    dragged.current = dragStart.current?.moved ?? false;
    dragStart.current = null;
  };
  const onPointerLeave = () => {
    const state = live.current;
    state.pointer.tx = 0;
    state.pointer.ty = 0;
    state.hover = -1;
    kick();
    endDrag();
  };

  const preview = (index: number) => {
    live.current.hover = index;
    if (!focused) setActive(index);
    kick();
  };

  const sector = content[active];
  if (!sector) return null;
  const expertises = services.filter((s) => sector.services.includes(s.id));

  return (
    <section
      className="atlas"
      data-focused={focused || undefined}
      data-ready={ready || undefined}
      data-intro={intro === 'static' ? undefined : intro}
      data-card-side={cardSide}
      data-paused={paused || undefined}
      aria-labelledby="atlas-title"
    >
      <div className="atlas-intro">
        <p className="atlas-eyebrow">{t.eyebrow}</p>
        <h2 id="atlas-title">
          <span>{t.title[0]}</span> <span>{t.title[1]}</span>
        </h2>
        <p className="atlas-lead">{t.lead}</p>
      </div>

      <div
        ref={stage}
        className="atlas-stage"
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={onPointerLeave}
        onClickCapture={(event) => {
          // The end of a drag is not a tap on whatever lies under the finger.
          if (dragged.current) {
            event.preventDefault();
            event.stopPropagation();
            dragged.current = false;
          }
        }}
      >
        <div ref={scene} className="atlas-scene">
          <div ref={world} className="atlas-world">
            <picture>
              <source
                media="(max-width: 800px)"
                srcSet="/atlas/mainland-2400.webp"
                type="image/webp"
              />
              <img
                className="atlas-landscape"
                src="/atlas/mainland-3840.webp"
                alt={t.alt}
                width={3840}
                height={2160}
                loading="lazy"
                decoding="async"
              />
            </picture>
            <div className="atlas-water" aria-hidden="true">
              <span className="atlas-flash" />
            </div>
            {TURBINES.map((t, i) => (
              <div key={i} aria-hidden="true">
                <img
                  className="atlas-tower"
                  src="/atlas/turbine-tower.webp"
                  alt=""
                  style={{
                    left: pct(t.tower.left),
                    top: pct(t.tower.top),
                    width: pct(t.tower.width),
                    height: pct(t.tower.height),
                  }}
                />
                <div
                  className="atlas-rotor"
                  style={{
                    left: pct(t.rotor.left),
                    top: pct(t.rotor.top),
                    width: pct(t.rotor.width),
                    height: pct(t.rotor.height),
                    transformOrigin: ROTOR_ORIGIN,
                    transform: `scaleX(${t.squash}) skewY(-6deg)`,
                  }}
                >
                  <img
                    src="/atlas/turbine-rotor.webp"
                    alt=""
                    style={{
                      transformOrigin: ROTOR_ORIGIN,
                      animationDuration: `${t.seconds}s`,
                      animationDelay: `${(-t.seconds * t.phase) / 360}s`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="atlas-shade" aria-hidden="true" />
          <div ref={spot} className="atlas-spot" aria-hidden="true" />
          <div className="atlas-places" role="group" aria-label={t.places}>
            {sectors.map((s, i) => (
              <button
                key={s.id}
                ref={(el) => {
                  markers.current[i] = el;
                }}
                type="button"
                className="atlas-place"
                aria-label={content[i].title}
                style={
                  {
                    left: pct(s.place.at[0]),
                    top: pct(s.place.at[1]),
                    '--dx': `${s.place.leader[0]}px`,
                    '--dy': `${s.place.leader[1]}px`,
                    '--len': `${Math.hypot(...s.place.leader)}px`,
                    '--angle': `${Math.atan2(s.place.leader[1], s.place.leader[0])}rad`,
                    '--i': i,
                  } as CSSProperties
                }
                aria-pressed={active === i}
                aria-controls="atlas-card"
                data-active={active === i || undefined}
                onPointerEnter={(event) => event.pointerType === 'mouse' && preview(i)}
                onFocus={() => preview(i)}
                onClick={() => (focused && active === i ? overview() : choose(i))}
              >
                <span className="atlas-dot" aria-hidden="true" />
                <span className="atlas-leader" aria-hidden="true" />
                <span className="atlas-label">{content[i].title}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="atlas-hint" aria-hidden="true">
          {t.drag}
        </p>
        {focused ? (
          <button type="button" className="atlas-corner" onClick={overview}>
            <span>{t.overview}</span>
            <Minimize2 size={15} strokeWidth={1.8} aria-hidden="true" />
          </button>
        ) : (
          <Link className="atlas-corner" to={r.applications}>
            <span>{t.all}</span>
            <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
          </Link>
        )}
      </div>

      <div ref={chips} className="atlas-chips" role="group" aria-label={t.choose}>
        {content.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={active === i && focused}
            onClick={() => choose(i)}
          >
            {s.title}
          </button>
        ))}
      </div>
      <article ref={card} id="atlas-card" className="atlas-card" aria-live="polite">
        <div className="atlas-card-inner" key={`${sector.id}-${focused}`}>
          <header className="atlas-card-head">
            <Photo name={sector.image} alt="" sizes="(max-width: 800px) 100vw, 580px" />
            <p className="atlas-card-kicker">{t.kicker}</p>
            <h3>{sector.title}</h3>
          </header>
          <div className="atlas-card-body">
            <p className="atlas-card-text">{focused ? sector.headline : sector.scope}</p>
            {focused && (
              <>
                <p className="atlas-card-scope">{sector.scope}</p>
                <ul className="atlas-card-needs" aria-label={t.needs}>
                  {sector.needs.map((n) => (
                    <li key={n.title}>{n.title}</li>
                  ))}
                </ul>
                <p className="atlas-card-services">
                  <span>{t.expertises}</span>
                  {expertises.map((e, i) => (
                    <span key={e.id}>
                      {i > 0 && ' · '}
                      <Link to={r.service(e.id)}>{e.title}</Link>
                    </span>
                  ))}
                </p>
              </>
            )}
            <div className="atlas-card-actions">
              <Link className="atlas-card-link" to={r.application(sector.id)}>
                <span>{t.explore}</span>
                <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
              </Link>
              {focused ? (
                <span className="atlas-card-steps">
                  <span className="atlas-card-pager" aria-hidden="true">
                    {sectors.map((s, i) => (
                      <i key={s.id} data-on={i === active || undefined} />
                    ))}
                  </span>
                  <button type="button" onClick={() => step(-1)} aria-label={t.previous}>
                    <ChevronLeft size={18} />
                  </button>
                  <button type="button" onClick={() => step(1)} aria-label={t.next}>
                    <ChevronRight size={18} />
                  </button>
                </span>
              ) : (
                <button type="button" className="atlas-card-zoom" onClick={() => choose(active)}>
                  <ZoomIn size={15} strokeWidth={1.8} aria-hidden="true" />
                  <span>{t.zoom}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
