import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { heroFilms, heroPortraitQuery } from '../lib/hero';
import { useCatalog } from '../i18n';

const films = heroFilms;

type Film = { src: string; start: number };

function pickFilm(film: keyof typeof films): Film {
  const probe = document.createElement('video');
  const { sources, start } = films[film];
  const source = sources.find((s) => probe.canPlayType(s.type) === 'probably') ?? sources.at(-1)!;
  return { src: source.src, start };
}

/** Decorative film behind the homepage hero. The server renders the poster only; the
 *  browser then downloads the single file that suits the screen, and nothing at all when the
 *  visitor asked to save data. It plays with reduced motion too; a button pauses it. */
export function HeroVideo() {
  const { ui } = useCatalog();
  const [film, setFilm] = useState<Film | null>(null);
  const src = film?.src ?? null;
  const [playingSrc, setPlayingSrc] = useState<string | null>(null);
  // Paused by the visitor: it stays paused until they press play again.
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const portrait = window.matchMedia(heroPortraitQuery);
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ===
      true;
    const update = () =>
      setFilm(saveData ? null : pickFilm(portrait.matches ? 'portrait' : 'landscape'));
    // The film waits for the page to finish loading: on a slow network the poster, the text
    // and the fonts come first.
    const start = () => {
      update();
      portrait.addEventListener('change', update);
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      window.removeEventListener('load', start);
      portrait.removeEventListener('change', update);
    };
  }, []);

  // The film only plays while the hero is on screen.
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    element.muted = true;
    const observer = new IntersectionObserver(([entry]) => {
      // A refused autoplay (battery saver, browser policy) simply leaves the poster in place.
      if (entry.isIntersecting && !pausedRef.current) element.play().catch(() => {});
      else element.pause();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [src]);

  const toggle = () => {
    const next = !paused;
    pausedRef.current = next;
    setPaused(next);
    if (next) video.current?.pause();
    else video.current?.play().catch(() => {});
  };

  return (
    <>
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
      {film && (
        <button type="button" className="dna-hero-pause" aria-pressed={paused} onClick={toggle}>
          {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
          <span className="sr-only">{ui.hero.pauseFilm}</span>
        </button>
      )}
    </>
  );
}
