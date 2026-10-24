// How much the site moves:
// - 'full' by default;
// - 'reduced' when the system asks for reduced motion, or when the visitor chooses it with the
//   footer switch (remembered on this browser). The site stays alive: fades, scenes and the film
//   keep playing, but nothing slides in, zooms, tilts or scrolls smoothly.
// The footer switch also lets a visitor whose system asks for reduced motion choose 'full'.
// public/motion.js applies the same rule before the first paint, as `data-motion` on <html>.
export type MotionLevel = 'full' | 'reduced';

const KEY = 'ldgenx-motion';
const QUERY = '(prefers-reduced-motion: reduce)';
const listeners = new Set<() => void>();
// Used when the browser refuses storage (private browsing): the choice lasts for the visit.
let memory: string | null = null;

function choice(): string | null {
  try {
    return localStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
}

export function motionLevel(): MotionLevel {
  const chosen = choice();
  // 'on' and 'off' are the values of the earlier on/off switch.
  if (chosen === 'reduced' || chosen === 'off') return 'reduced';
  if (chosen === 'full' || chosen === 'on') return 'full';
  return window.matchMedia(QUERY).matches ? 'reduced' : 'full';
}

/** How the page scrolls to a target: never smoothly with reduced motion. */
export function scrollBehavior(): ScrollBehavior {
  return motionLevel() === 'full' ? 'smooth' : 'auto';
}

function notify() {
  document.documentElement.dataset.motion = motionLevel();
  listeners.forEach((listener) => listener());
}

export function setMotionLevel(level: MotionLevel) {
  memory = level;
  try {
    localStorage.setItem(KEY, level);
  } catch {
    // Kept in memory only.
  }
  notify();
}

export function subscribeMotion(listener: () => void) {
  listeners.add(listener);
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', notify);
  return () => {
    listeners.delete(listener);
    media.removeEventListener('change', notify);
  };
}
