import { ArrowDown } from 'lucide-react';

/** Leaves a scene held on screen while the page scrolls (the DNA helix, the study chart) in one
 *  tap: the page lands on what follows the section, and focus moves there too. */
export function SceneSkip({
  label,
  hint,
  className = '',
}: {
  label: string;
  hint: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`scene-skip ${className}`}
      aria-label={hint}
      title={hint}
      onClick={(event) => skipPast(event.currentTarget.closest('section'))}
    >
      {label}
      <ArrowDown size={13} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}

function skipPast(section: HTMLElement | null) {
  if (!section) return;
  const header =
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0;
  const top = section.getBoundingClientRect().bottom + window.scrollY - header;
  // At once: smooth scrolling would play the whole scene in fast forward.
  window.scrollTo({ top, behavior: 'instant' });
  const next = section.nextElementSibling;
  if (next instanceof HTMLElement) {
    if (!next.hasAttribute('tabindex')) next.setAttribute('tabindex', '-1');
    next.focus({ preventScroll: true });
  }
}
