import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog, useRoutes } from '../i18n';
import { researchLink } from '../pages/Research';
import {
  useMediaQuery,
  useNearViewport,
  usePointerVars,
  useReducedMotion,
} from '../components/motion';
import { Photo, Reveal } from '../components/ui';

/* The team on the homepage: three portraits in arched frames on a quiet stage of drifting
   points. One person is in the light at a time: their frame widens and their biography and
   expertise come in below. Pointing at a portrait brings that person forward; when nobody does,
   the light moves from one to the next. On phones, the portraits slide side by side. */

const CYCLE_MS = 7000;

export function TeamStage() {
  const { services, team, research, ui } = useCatalog();
  const r = useRoutes();
  const ref = useRef<HTMLDivElement>(null);
  const live = useNearViewport(ref, '0px');
  const reduced = useReducedMotion();
  const phone = useMediaQuery('(max-width: 800px)');
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const cycling = live && !held && !reduced && !phone;

  useEffect(() => {
    if (!cycling) return;
    const timer = window.setTimeout(() => setActive((a) => (a + 1) % team.length), CYCLE_MS);
    return () => window.clearTimeout(timer);
  }, [cycling, active]);

  return (
    <div ref={ref} className="team-stage" onPointerLeave={() => setHeld(false)}>
      <TeamField live={live && !reduced} />
      <div className="team-stage-row">
        {team.map((p, i) => (
          <Reveal key={p.name} className="team-stage-slot" delay={i * 0.12}>
            <article
              className="team-stage-person"
              data-active={i === active || undefined}
              onPointerEnter={(e) => {
                if (e.pointerType !== 'mouse') return;
                setActive(i);
                setHeld(true);
              }}
            >
              <ArchPortrait photo={p.photo} />
              {i === active && cycling && (
                <span
                  key={active}
                  className="team-stage-timer"
                  aria-hidden="true"
                  style={{ '--cycle': `${CYCLE_MS}ms` } as CSSProperties}
                />
              )}
              <h3>
                <button
                  type="button"
                  aria-pressed={i === active}
                  onClick={() => {
                    setActive(i);
                    setHeld(true);
                  }}
                  onFocus={() => {
                    setActive(i);
                    setHeld(true);
                  }}
                >
                  {p.name}
                </button>
              </h3>
              <p className="team-stage-role">{p.role}</p>
              <div className="team-stage-more">
                <div className="team-stage-more-inner">
                  <p className="team-stage-bio">{p.bio}</p>
                  {services
                    .filter((s) => s.id === p.service)
                    .map((s) => (
                      <Link
                        key={s.id}
                        className="team-stage-expertise"
                        to={r.service(s.id)}
                        onFocus={() => {
                          setActive(i);
                          setHeld(true);
                        }}
                      >
                        <span>{ui.teamStage.expertise}</span>
                        {s.title}
                      </Link>
                    ))}
                  {p.slug && (
                    <Link
                      className="team-stage-expertise team-stage-profile"
                      to={r.person(p.id)}
                      onFocus={() => {
                        setActive(i);
                        setHeld(true);
                      }}
                    >
                      <span>{ui.teamStage.profile}</span>
                      {p.name}
                    </Link>
                  )}
                  {research.publications.some((x) => x.members.includes(p.id)) && (
                    <Link
                      className="team-stage-expertise team-stage-profile"
                      to={researchLink(r.publications, { author: p.id })}
                      onFocus={() => {
                        setActive(i);
                        setHeld(true);
                      }}
                    >
                      <span>{ui.research.eyebrow}</span>
                      {ui.research.seeMember}
                    </Link>
                  )}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function ArchPortrait({ photo }: { photo: string }) {
  const ref = useRef<HTMLElement>(null);
  usePointerVars(ref, 5);
  return (
    <figure ref={ref} className="team-arch">
      <Photo name={photo} alt="" sizes="(max-width: 800px) 80vw, 34vw" />
      <span className="team-arch-light" aria-hidden="true" />
    </figure>
  );
}

/** Drifting points joined by faint lines, gently pushed aside by the pointer. */
function TeamField({ live }: { live: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!element || !context || !live) return;
    let width = 0,
      height = 0,
      frame = 0,
      mouseX = -1e4,
      mouseY = -1e4;
    const points = Array.from({ length: 64 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0004,
      vy: (Math.random() - 0.5) * 0.0004,
    }));
    const resize = () => {
      const box = element.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = box.width;
      height = box.height;
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    const move = (e: PointerEvent) => {
      const box = element.getBoundingClientRect();
      mouseX = e.clientX - box.left;
      mouseY = e.clientY - box.top;
    };
    const leave = () => {
      mouseX = mouseY = -1e4;
    };
    const host = element.parentElement;
    host?.addEventListener('pointermove', move);
    host?.addEventListener('pointerleave', leave);
    const loop = () => {
      context.clearRect(0, 0, width, height);
      for (const p of points) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        const dx = p.x * width - mouseX,
          dy = p.y * height - mouseY;
        const d = Math.hypot(dx, dy);
        if (d < 140 && d > 0) {
          p.x += (dx / d) * 0.0016 * (1 - d / 140);
          p.y += (dy / d) * 0.0016 * (1 - d / 140);
        }
      }
      context.lineWidth = 1;
      for (let i = 0; i < points.length; i++) {
        const a = points[i];
        for (let j = i + 1; j < points.length; j++) {
          const b = points[j];
          const d = Math.hypot((a.x - b.x) * width, (a.y - b.y) * height);
          if (d > 150) continue;
          context.strokeStyle = `rgba(3, 37, 75, ${0.09 * (1 - d / 150)})`;
          context.beginPath();
          context.moveTo(a.x * width, a.y * height);
          context.lineTo(b.x * width, b.y * height);
          context.stroke();
        }
      }
      context.fillStyle = 'rgba(42, 116, 22, 0.35)';
      for (const p of points) {
        context.beginPath();
        context.arc(p.x * width, p.y * height, 1.6, 0, Math.PI * 2);
        context.fill();
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      host?.removeEventListener('pointermove', move);
      host?.removeEventListener('pointerleave', leave);
    };
  }, [live]);
  return <canvas ref={canvas} className="team-field" aria-hidden="true" />;
}
