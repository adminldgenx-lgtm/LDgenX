// Sets the motion level on <html> before the first paint (rule in src/lib/motion-preference.ts).
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var chosen = null;
  try {
    chosen = localStorage.getItem('ldgenx-motion');
  } catch {
    // Storage refused: the system preference decides.
  }
  var level = reduce ? 'reduced' : 'full';
  if (chosen === 'reduced' || chosen === 'off') level = 'reduced';
  else if (chosen === 'full' || chosen === 'on') level = 'full';
  document.documentElement.setAttribute('data-motion', level);
})();
