// The homepage hero film. Portrait screens get the dedicated portrait film, every other screen
// the landscape one. The same queries drive the poster preload, the video and the hero layout
// in global.css.
export const heroPortraitQuery =
  '(max-width: 767px), (max-width: 1100px) and (orientation: portrait)';
/** The exact complement of the portrait query. */
export const heroLandscapeQuery =
  '(min-width: 1101px), (min-width: 768px) and (orientation: landscape)';

// A seawater sample in which suspended particles form a DNA helix. Each poster is the frame at
// `start` seconds, where the helix is complete: the film begins on that frame, so the poster
// hands over to the moving picture without a jump.
export const heroFilms = {
  landscape: {
    poster: '/videos/hero-sample-desktop-poster.webp',
    start: 4.5,
    sources: [
      { src: '/videos/hero-sample-desktop.webm', type: 'video/webm; codecs="vp9"' },
      { src: '/videos/hero-sample-desktop.mp4', type: 'video/mp4; codecs="avc1.640029"' },
    ],
  },
  portrait: {
    poster: '/videos/hero-sample-mobile-poster.webp',
    start: 2.25,
    sources: [{ src: '/videos/hero-sample-mobile.mp4', type: 'video/mp4; codecs="avc1.640029"' }],
  },
};

/** The poster is the first image of the homepage: the browser fetches it before the page body. */
export const heroPosterPreload = [
  [heroFilms.portrait.poster, heroPortraitQuery],
  [heroFilms.landscape.poster, heroLandscapeQuery],
]
  .map(
    ([href, media]) =>
      `<link rel="preload" as="image" type="image/webp" href="${href}" media="${media}" fetchpriority="high" />`,
  )
  .join('\n    ');
