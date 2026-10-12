import { useEffect, useRef, useState } from 'react';
import { heroFilms, heroPortraitQuery } from '../lib/hero';

const films = heroFilms;

type Film = { src: string; start: number };

function pickFilm(film: keyof typeof films): Film {
  const probe = document.createElement('video');
  const { sources, start } = films[film];
  const source = sources.find((s) => probe.canPlayType(s.type) === 'probably') ?? sources.at(-1)!;
  return { src: source.src, start };
}

/** Decorative film behind the homepage hero. The server renders the poster only; the
 *  browser then downloads the single file that suits the screen, and nothing at all when
 *  the visitor prefers reduced motion or has asked to save data. */
export function HeroVideo() {
  const [film, setFilm] = useState<Film | null>(null);
  const src = film?.src ?? null;
  const [playingSrc, setPlayingSrc] = useState<string | null>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const portrait = window.matchMedia(heroPortraitQuery);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ===
      true;
    const update = () =>
      setFilm(
        reduced.matches || saveData ? null : pickFilm(portrait.matches ? 'portrait' : 'landscape'),
      );
    // The film waits for the page to finish loading: on a slow network the poster, the text
    // and the fonts come first.
    const start = () => {
      update();
      portrait.addEventListener('change', update);
      reduced.addEventListener('change', update);
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      window.removeEventListener('load', start);
      portrait.removeEventListener('change', update);
      reduced.removeEventListener('change', update);
    };
  }, []);

  // The film only plays while the hero is on screen.
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    element.muted = true;
    const observer = new IntersectionObserver(([entry]) => {
      // A refused autoplay (battery saver, browser policy) simply leaves the poster in place.
      if (entry.isIntersecting) element.play().catch(() => {});
      else element.pause();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div className="dna-hero-media" aria-hidden="true">
      <picture>
        <source
          media={heroPortraitQuery}
          srcSet={films.portrait.poster}
          type="image/webp"
          width={1080}
          height={1920}
        />
        <img
          src={films.landscape.poster}
          alt=""
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      {film && (
        <video
          key={film.src}
          ref={video}
          className="dna-hero-video"
          src={`${film.src}#t=${film.start}`}
          muted
          autoPlay
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
          data-playing={playingSrc === src}
          onPlaying={() => setPlayingSrc(src)}
        />
      )}
    </div>
  );
}
