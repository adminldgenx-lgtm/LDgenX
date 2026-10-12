import { useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { featuredStudy, studies } from '../content/fr';
import { useEntrance } from '../components/motion';
import { Photo, Reveal } from '../components/ui';
import { studyMap, studySites, type StudySite } from '../lib/study-map';

/* "La génomique en pratique": the Artois-Picardie study told on its own map. The coast from the
   Somme to Dunkerque is redrawn from OpenStreetMap; the eight sites are those named on the
   sampling map published with the study, placed at their town, port or river mouth. Nothing on
   the map stands for a result: the study's data are not public. */

const SETTING: Record<StudySite['setting'], string> = {
  port: 'Port',
  baie: 'Baie',
  estuaire: 'Estuaire',
};
const OSM = 'https://www.openstreetmap.org/copyright';
const pct = (value: number, total: number) => `${((value / total) * 100).toFixed(2)}%`;

export function StudyCase() {
  const study = studies.find((s) => s.slug === featuredStudy.slug) ?? studies[0];
  const others = studies.filter((s) => s !== study);
  return (
    <div className="study-case">
      <div className="study-case-main">
        <StudyMap />
        <div className="study-case-copy">
          <Reveal>
            <p className="item-category">{study.category}</p>
            <h3 className="study-case-title">{study.title}</h3>
            <dl className="study-case-credits">
              <div>
                <dt>Commanditaire</dt>
                <dd>{featuredStudy.client}</dd>
              </div>
              <div>
                <dt>Réalisation</dt>
                <dd>{featuredStudy.team}</dd>
              </div>
            </dl>
          </Reveal>
          <Reveal className="study-case-question" delay={0.06}>
            <p className="study-case-label">La question posée</p>
            <blockquote>
              <p>{`« ${study.question.replace(/\s*\?$/, '')} ? »`}</p>
            </blockquote>
          </Reveal>
          <Reveal className="study-case-steps" delay={0.1}>
            <p className="study-case-label">L’approche</p>
            <ol>
              {featuredStudy.steps.map((step, i) => (
                <li key={step.title} style={{ '--i': i } as CSSProperties}>
                  <h4>{step.title}</h4>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal className="study-case-outcome" delay={0.14}>
            <p className="study-case-label">Ce que l’étude apporte</p>
            <p className="study-case-outcome-text">{featuredStudy.outcome}</p>
            <p className="study-case-constraints-label">{featuredStudy.constraintsLabel}</p>
            <ul className="study-case-constraints">
              {featuredStudy.constraints.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="study-case-actions" delay={0.18}>
            <Link className="study-link" to={`/etudes-de-cas/${study.slug}`}>
              Voir l’étude
            </Link>
            <a className="study-case-source" href={study.source} target="_blank" rel="noreferrer">
              {featuredStudy.sourceLabel}
              <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
          </Reveal>
        </div>
      </div>

      <div className="study-tiles">
        {others.map((s, i) => (
          <Reveal key={s.slug} delay={i * 0.08}>
            <Link className="study-tile" to={`/etudes-de-cas/${s.slug}`}>
              <figure className="study-tile-image">
                <Photo name={s.image} alt="" sizes="(max-width: 800px) 90vw, 30vw" />
              </figure>
              <p className="item-category">{s.category}</p>
              <h3>{s.title}</h3>
              <p className="study-tile-text">{s.subtitle}</p>
              <span className="study-link">Voir l’étude</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/** The study area: sea, land and coastline, the graticule, the eight sites, a scale bar and a
 *  locator of France. The list below the map names every site, so the map itself is a picture
 *  for assistive technology; pointing at a site in either place shows it in both. */
function StudyMap() {
  const ref = useRef<HTMLElement>(null);
  const phase = useEntrance(ref);
  const [active, setActive] = useState<string | null>(null);
  const { width, height } = studyMap;
  const site = studySites.find((s) => s.id === active);
  const point = (id: string) => ({
    onPointerEnter: (e: PointerEvent) => e.pointerType === 'mouse' && setActive(id),
    onPointerLeave: (e: PointerEvent) => e.pointerType === 'mouse' && setActive(null),
  });

  return (
    <figure ref={ref} className="study-map" data-phase={phase}>
      <div
        className="study-map-canvas"
        style={{ aspectRatio: `${width} / ${height}` }}
        onClick={(e) => {
          if (!(e.target as Element).closest('.study-site')) setActive(null);
        }}
      >
        <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
          <rect className="study-map-sea" width={width} height={height} />
          <path className="study-map-shallows" d={studyMap.coast} />
          {studyMap.land.map((d) => (
            <path key={d.slice(0, 24)} className="study-map-land" d={d} />
          ))}
          <g className="study-map-grid">
            {studyMap.meridians.map((m) => (
              <line key={m.label} x1={m.at} x2={m.at} y1={0} y2={height} />
            ))}
            {studyMap.parallels.map((p) => (
              <line key={p.label} x1={0} x2={width} y1={p.at} y2={p.at} />
            ))}
          </g>
          <path className="study-map-coast" d={studyMap.coast} pathLength={1} />
          <g className="study-map-inset" transform="translate(30 30) scale(1.75)">
            <rect x={-9} y={-9} width={118} height={114} />
            <path d={studyMap.inset.france} />
            <rect className="study-map-inset-frame" {...studyMap.inset.frame} />
          </g>
        </svg>

        <div className="study-map-labels" aria-hidden="true">
          <span className="study-map-sea-label" style={{ left: '5%', top: '63%' }}>
            Manche
          </span>
          <span className="study-map-sea-label" style={{ left: '50%', top: '3.4%' }}>
            Mer du Nord
          </span>
          {studyMap.areas.map((a) => (
            <span
              key={a.name}
              className="study-map-area"
              style={{ left: pct(a.x, width), top: pct(a.y, height) }}
            >
              {a.name}
            </span>
          ))}
          {studyMap.meridians.map((m) => (
            <span
              key={m.label}
              className="study-map-tick study-map-tick-x"
              style={{ left: pct(m.at, width) }}
            >
              {m.label}
            </span>
          ))}
          {studyMap.parallels.map((p) => (
            <span
              key={p.label}
              className="study-map-tick study-map-tick-y"
              style={{ top: pct(p.at, height) }}
            >
              {p.label}
            </span>
          ))}
          <span
            className="study-map-scale"
            style={{ width: pct(studyMap.scaleWidth, width) }}
          >{`${studyMap.scaleKm} km`}</span>
        </div>

        <div className="study-map-sites" aria-hidden="true">
          {studySites.map((s, i) => (
            <span
              key={s.id}
              className="study-site"
              data-active={active === s.id || undefined}
              style={{ left: pct(s.x, width), top: pct(s.y, height), '--i': i } as CSSProperties}
              onClick={() => setActive(s.id)}
              {...point(s.id)}
            />
          ))}
          {site && (
            <span
              key={site.id}
              className="study-map-tip"
              data-side={
                site.y < height * 0.12 ? 'below' : site.x > width * 0.62 ? 'left' : 'right'
              }
              style={{ left: pct(site.x, width), top: pct(site.y, height) }}
            >
              <span className="study-map-tip-kind">{SETTING[site.setting]}</span>
              <strong>{site.name}</strong>
              <span className="study-map-tip-area">{site.area}</span>
            </span>
          )}
        </div>
      </div>

      <figcaption>
        <p className="study-case-label">Les huit sites échantillonnés, du nord au sud</p>
        <ol className="study-sites">
          {studySites.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                data-active={active === s.id || undefined}
                onFocus={() => setActive(s.id)}
                onBlur={() => setActive(null)}
                onClick={() => setActive(s.id)}
                {...point(s.id)}
              >
                <span className="study-sites-name">{s.name}</span>
                <span className="study-sites-kind">{SETTING[s.setting]}</span>
              </button>
            </li>
          ))}
        </ol>
        <p className="study-map-credit">
          Emplacements indicatifs, d’après la carte publiée avec l’étude. Trait de côte ©{' '}
          <a href={OSM} target="_blank" rel="noreferrer">
            contributeurs OpenStreetMap
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
          .
        </p>
      </figcaption>
    </figure>
  );
}
