import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type RefObject,
} from 'react';

// One motion language for the whole site, without an animation library: CSS keyframes and
// transitions do the drawing, these hooks only decide when. Scrolling always stays native.

export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (callback: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', callback);
      return () => media.removeEventListener('change', callback);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

// A single observer serves every element that enters on scroll.
const entranceCallbacks = new WeakMap<Element, () => void>();
let entranceObserver: IntersectionObserver | null = null;

function observeEntrance(element: Element, onEnter: () => void) {
  entranceObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entranceObserver?.unobserve(entry.target);
        entranceCallbacks.get(entry.target)?.();
        entranceCallbacks.delete(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  entranceCallbacks.set(element, onEnter);
  entranceObserver.observe(element);
  return () => {
    entranceCallbacks.delete(element);
    entranceObserver?.unobserve(element);
  };
}

export type EntrancePhase = 'static' | 'pending' | 'visible';

/** Server-rendered content stays visible. Only content still below the screen when the page
 *  becomes interactive waits for its entrance: nothing already in view ever disappears. */
export function useEntrance(ref: RefObject<Element | null>): EntrancePhase {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<EntrancePhase>('static');
  useEffect(() => {
    const element = ref.current;
    if (!element || reduced) return;
    const bounds = element.getBoundingClientRect();
    if (bounds.top < window.innerHeight) return;
    setPhase('pending');
    return observeEntrance(element, () => setPhase('visible'));
  }, [ref, reduced]);
  return reduced ? 'static' : phase;
}

/** Whether an element is on or near the screen, for work that only matters there. */
export function useNearViewport(ref: RefObject<Element | null>, margin = '200px 0px') {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      rootMargin: margin,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, margin]);
  return near;
}

/** Keeps a panel mounted while its closing animation plays: 'open' → 'closing' → 'closed'. */
export function usePresence(open: boolean, closeDuration: number) {
  const [state, setState] = useState<'open' | 'closing' | 'closed'>(open ? 'open' : 'closed');
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    setState(open ? 'open' : closeDuration > 0 ? 'closing' : 'closed');
  }
  useEffect(() => {
    if (state !== 'closing') return;
    const timer = window.setTimeout(() => setState('closed'), closeDuration);
    return () => window.clearTimeout(timer);
  }, [state, closeDuration]);
  return state;
}

/** Index of the row closest to the reading line (52% of the viewport). Positions are read
 *  only while the section is near the screen, at most once per frame. Native scrolling. */
export function useActiveRow(
  section: RefObject<Element | null>,
  rows: RefObject<(Element | null)[]>,
) {
  const [active, setActive] = useState(0);
  const visible = useNearViewport(section);
  useEffect(() => {
    if (!visible) return;
    let frame = 0;
    const update = () => {
      const target = window.innerHeight * 0.52;
      let nearest = 0,
        distance = Infinity;
      rows.current.forEach((row, index) => {
        if (!row) return;
        const bounds = row.getBoundingClientRect();
        const delta = Math.abs(bounds.top + bounds.height / 2 - target);
        if (delta < distance) {
          distance = delta;
          nearest = index;
        }
      });
      setActive(nearest);
    };
    const schedule = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          update();
          frame = 0;
        });
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, [visible, rows]);
  return active;
}

export function AnimatedHeading({
  text,
  as: Tag = 'h2',
  className = '',
  delay = 0,
  intro = false,
}: {
  text: string;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  delay?: number;
  intro?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const phase = useEntrance(ref);
  // Headings rise line by line, the same motion as the homepage hero: never word by word.
  const lines = text.replace(/\\n/g, '\n').split('\n');
  return (
    <Tag
      ref={ref}
      className={`animated-heading ${className}`}
      data-text-reveal={intro ? 'intro' : phase}
    >
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          <span className="line-mask">
            <span
              className="line-reveal"
              style={{ '--line-delay': `${delay + i * 0.09}s` } as CSSProperties}
            >
              {line}
            </span>
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}

/** Becomes true the first time the element reaches the screen, and stays true. */
export function useSeen(ref: RefObject<Element | null>, margin = '0px 0px -12% 0px') {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || seen) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        observer.disconnect();
      },
      { rootMargin: margin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, margin, seen]);
  return seen;
}

/** The pointer over an element, as CSS variables: --px and --py from 0 to 1, and, with a
 *  tilt, --tilt-x and --tilt-y in degrees. `data-pointer` marks the hover. Mouse and trackpad
 *  only, never with reduced motion; at most one style write per frame. */
export function usePointerVars(ref: RefObject<HTMLElement | null>, tilt = 0) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0,
      x = 0.5,
      y = 0.5;
    const apply = () => {
      frame = 0;
      element.style.setProperty('--px', x.toFixed(3));
      element.style.setProperty('--py', y.toFixed(3));
      if (tilt) {
        element.style.setProperty('--tilt-x', `${((0.5 - y) * tilt).toFixed(2)}deg`);
        element.style.setProperty('--tilt-y', `${((x - 0.5) * tilt).toFixed(2)}deg`);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const box = element.getBoundingClientRect();
      x = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
      y = Math.min(1, Math.max(0, (event.clientY - box.top) / box.height));
      element.setAttribute('data-pointer', '');
      schedule();
    };
    const leave = () => {
      x = 0.5;
      y = 0.5;
      element.removeAttribute('data-pointer');
      schedule();
    };
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerleave', leave);
    return () => {
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', leave);
      cancelAnimationFrame(frame);
    };
  }, [ref, tilt]);
}
