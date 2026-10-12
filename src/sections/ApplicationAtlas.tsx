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
import { applications, services } from '../content/fr';
import { Photo } from '../components/ui';
import { useMediaQuery, useReducedMotion } from '../components/motion';

/* "Vos terrains d'application" as an illustrated coastal atlas. One generated landscape (see
   ldgenx-atlas-2d/), a water layer that catches the light, turbines whose rotors turn, and six
   places, one per sector. Choosing a place flies the view to it and opens its card. The geography
   is illustrative; every word in the cards comes from the sector pages. */

const IMAGE_RATIO = 4000 / 2251;
const ZOOM_MS = 1200;
// Arrival: the map window opens while the view descends from a low, close angle to above.
const INTRO_MS = 2000;

// Where each sector sits in the landscape (fraction of the image), and how its label leaves the
// point: a short leader up and to the right, longer where turbines stand above it.
const PLACES: Record<
  string,
  { at: [number, number]; leader: [number, number]; side: 'left' | 'right' }
> = {
  'biodiversite-conservation': { at: [0.262, 0.502], leader: [26, -30], side: 'right' },
  'aquaculture-peche': { at: [0.651, 0.392], leader: [26, -30], side: 'right' },
  'agriculture-agroecologie': { at: [0.712, 0.73], leader: [26, -34], side: 'right' },
  'environnement-bureaux-d-etudes': { at: [0.925, 0.598], leader: [26, -30], side: 'left' },
  'recherche-publique-privee': { at: [0.752, 0.555], leader: [26, -30], side: 'left' },
  // Above the turbines, in open sea.
  'energies-marines-renouvelables': { at: [0.832, 0.276], leader: [34, -128], side: 'right' },
};
const sectors = applications.map((a) => ({ ...a, place: PLACES[a.slug] }));

// Offshore turbines (positions from ldgenx-atlas-2d/data/layers.json). Tower and rotor are two
// cut-outs: the rotor turns about its hub, which is not the centre of its image.
const TOWER = { width: 1024, height: 1536, base: [499, 1493], hub: [398, 109] };
const ROTOR = { width: 1254, height: 1254, hub: [628, 764], radius: 726 };
const TURBINES = [
  { base: [0.718, 0.236], height: 0.098, seconds: 11, phase: 0, squash: 0.78 },
  { base: [0.794, 0.268], height: 0.092, seconds: 12.5, phase: 40, squash: 0.76 },
  { base: [0.867, 0.296], height: 0.083, seconds: 12, phase: 80, squash: 0.73 },
  { base: [0.941, 0.328], height: 0.078, seconds: 13.5, phase: 120, squash: 0.7 },
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

export function ApplicationAtlas() {
  const reduced = useReducedMotion();
  const compact = useMediaQuery('(max-width: 800px)');
  const stage = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const spot = useRef<HTMLDivElement>(null);
  const markers = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(true);
  const [intro, setIntro] = useState<Intro>('static');
  const arrived = useRef(false);
  const chips = useRef<HTMLDivElement>(null);

  // Everything the animation loop reads, kept outside React so it never waits for a render.
  const live = useRef({
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
    flips: [] as boolean[],
    rises: [] as number[],
    labels: [] as { w: number; h: number }[],
    duration: ZOOM_MS,
    introStart: 0,
    cardSide: 'left' as 'left' | 'right',
    // The card's box in stage coordinates, when it floats over the landscape.
    card: null as { left: number; top: number; right: number; bottom: number } | null,
  });
  const card = useRef<HTMLElement>(null);
  live.current.active = active;
  live.current.focused = focused;
  // In a place, the card stands on the side away from it, so the place keeps the open ground.
  const cardSide: 'left' | 'right' =
    focused && !compact && sectors[active].place.at[0] < 0.45 ? 'right' : 'left';
  live.current.cardSide = cardSide;

  // The view that frames the current choice: the whole landscape, or one place, set where the
  // card leaves it room (right of centre on wide screens, centre on phones).
  const targetView = useCallback((): View => {
    const { w, h, iw, ih } = live.current.size;
    const state = live.current;
    const z = state.focused ? (compact ? 1.55 : 1.45) : compact ? 1.18 : 1;
    let x = 0,
      y = 0;
    const at = sectors[state.active].place.at;
    if (state.focused) {
      const spotX = compact ? 0.5 : state.cardSide === 'right' ? 0.36 : 0.64;
      x = w * (spotX - 0.5) - z * (at[0] - 0.5) * iw;
      // A place too near the edge to reach its spot stays above the card instead.
      const mx = Math.max(0, (iw * z - w) / 2);
      const placeX = w / 2 + Math.min(mx, Math.max(-mx, x)) + z * (at[0] - 0.5) * iw;
      const box = state.card;
      const placeY =
        box && placeX > box.left - 40 && placeX < box.right + 40
          ? Math.min(h * 0.5, box.top - 120)
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
      scene.current.style.transform = reduced
        ? ''
        : `perspective(1600px) rotateX(${p.y * -1.4 + arrival * 24}deg) rotateY(${p.x * 1.8}deg)`;
    sectors.forEach((s, i) => {
      const el = markers.current[i];
      if (!el) return;
      const x = w / 2 + view.x + view.z * (s.place.at[0] - 0.5) * iw;
      const y = h / 2 + view.y + view.z * (s.place.at[1] - 0.5) * ih;
      el.style.left = '0';
      el.style.top = '0';
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      const size = state.labels[i] ?? { w: 180, h: 40 };
      const label = size.w;
      // A long leader shortens when the name would leave the top of the map.
      const rise = Math.max(s.place.leader[1], Math.min(-24, -(y - size.h - 12)));
      if (state.rises[i] !== rise) {
        state.rises[i] = rise;
        const [dx] = s.place.leader;
        el.style.setProperty('--dy', `${rise}px`);
        el.style.setProperty('--len', `${Math.hypot(dx, rise)}px`);
        el.style.setProperty('--angle', `${Math.atan2(rise, dx)}rad`);
      }
      // A name goes where it fits, and never over the card.
      const dx = s.place.leader[0];
      const top = y + rise - size.h,
        bottom = y + rise;
      const clear = (left: number, right: number) =>
        !state.card ||
        right < state.card.left ||
        left > state.card.right ||
        bottom < state.card.top ||
        top > state.card.bottom;
      const room = {
        left: x - dx - label >= 12 && clear(x - dx - label, x),
        right: x + dx + label <= w - 12 && clear(x, x + dx + label),
      };
      const flip = s.place.side === 'left' ? room.left || !room.right : !room.right && room.left;
      if (state.flips[i] !== flip) {
        state.flips[i] = flip;
        el.toggleAttribute('data-flip', flip);
      }
      if (i === (state.hover >= 0 && !state.focused ? state.hover : state.active) && spot.current) {
        spot.current.style.setProperty('--sx', `${x}px`);
        spot.current.style.setProperty('--sy', `${y}px`);
      }
    });
  }, [reduced]);

  const loop = useCallback(
    (now: number) => {
      const state = live.current;
      const t = reduced ? 1 : Math.min(1, (now - state.start) / state.duration);
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
    [paint, reduced],
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

  // Phones: the row of sectors keeps the chosen one in view.
  useEffect(() => {
    const row = chips.current;
    const chip = row?.children[active] as HTMLElement | undefined;
    if (!row || !chip || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: chip.offsetLeft - 20, behavior: reduced ? 'auto' : 'smooth' });
  }, [active, reduced]);

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
    if (!reduced && !arrived.current) setIntro('pending');
    const arrival = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || arrived.current) return;
        arrived.current = true;
        setReady(true);
        if (reduced) return;
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
  }, [kick, reduced, targetView, travel]);

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
    if (event.pointerType === 'mouse' && !reduced) {
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

  const sector = sectors[active];
  const expertises = services.filter((s) => sector.services.includes(s.slug));

  return (
    <section
      className="atlas"
      data-focused={focused || undefined}
      data-ready={ready || undefined}
      data-intro={intro === 'static' ? undefined : intro}
      data-card-side={cardSide}
      data-paused={paused || reduced || undefined}
      aria-labelledby="atlas-title"
    >
      <div className="atlas-intro">
        <p className="atlas-eyebrow">Vos terrains d’application</p>
        <h2 id="atlas-title">
          <span>Une même science.</span> <span>Tout un monde d’applications.</span>
        </h2>
        <p className="atlas-lead">Explorez votre environnement.</p>
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
                srcSet="/atlas/landscape-2400.webp"
                type="image/webp"
              />
              <img
                className="atlas-landscape"
                src="/atlas/landscape-4000.webp"
                alt="Illustration d’un littoral méditerranéen : lagune, élevages en mer, station de recherche, vignes et éoliennes en mer."
                width={4000}
                height={2251}
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
          <div className="atlas-places" role="group" aria-label="Les secteurs sur la carte">
            {sectors.map((s, i) => (
              <button
                key={s.slug}
                ref={(el) => {
                  markers.current[i] = el;
                }}
                type="button"
                className="atlas-place"
                aria-label={s.title}
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
                <span className="atlas-label">{s.title}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="atlas-hint" aria-hidden="true">
          Glissez pour explorer
        </p>
        {focused ? (
          <button type="button" className="atlas-corner" onClick={overview}>
            <span>Vue d’ensemble</span>
            <Minimize2 size={15} strokeWidth={1.8} aria-hidden="true" />
          </button>
        ) : (
          <Link className="atlas-corner" to="/applications">
            <span>Tous les secteurs</span>
            <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
          </Link>
        )}
      </div>

      <div ref={chips} className="atlas-chips" role="group" aria-label="Choisir un secteur">
        {sectors.map((s, i) => (
          <button
            key={s.slug}
            type="button"
            aria-pressed={active === i && focused}
            onClick={() => choose(i)}
          >
            {s.title}
          </button>
        ))}
      </div>
      <article ref={card} id="atlas-card" className="atlas-card" aria-live="polite">
        <div className="atlas-card-inner" key={`${sector.slug}-${focused}`}>
          <header className="atlas-card-head">
            <Photo name={sector.image} alt="" sizes="(max-width: 800px) 100vw, 580px" />
            <p className="atlas-card-kicker">Application</p>
            <h3>{sector.title}</h3>
          </header>
          <div className="atlas-card-body">
            <p className="atlas-card-text">{focused ? sector.headline : sector.scope}</p>
            {focused && (
              <>
                <p className="atlas-card-scope">{sector.scope}</p>
                <ul className="atlas-card-needs" aria-label="Vos besoins">
                  {sector.needs.map((n) => (
                    <li key={n.title}>{n.title}</li>
                  ))}
                </ul>
                <p className="atlas-card-services">
                  <span>Expertises mobilisées</span>
                  {expertises.map((e, i) => (
                    <span key={e.slug}>
                      {i > 0 && ' · '}
                      <Link to={`/services/${e.slug}`}>{e.title}</Link>
                    </span>
                  ))}
                </p>
              </>
            )}
            <div className="atlas-card-actions">
              <Link className="atlas-card-link" to={`/applications/${sector.slug}`}>
                <span>Explorer cette application</span>
                <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
              </Link>
              {focused ? (
                <span className="atlas-card-steps">
                  <span className="atlas-card-pager" aria-hidden="true">
                    {sectors.map((s, i) => (
                      <i key={s.slug} data-on={i === active || undefined} />
                    ))}
                  </span>
                  <button type="button" onClick={() => step(-1)} aria-label="Secteur précédent">
                    <ChevronLeft size={18} />
                  </button>
                  <button type="button" onClick={() => step(1)} aria-label="Secteur suivant">
                    <ChevronRight size={18} />
                  </button>
                </span>
              ) : (
                <button type="button" className="atlas-card-zoom" onClick={() => choose(active)}>
                  <ZoomIn size={15} strokeWidth={1.8} aria-hidden="true" />
                  <span>Zoomer</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
