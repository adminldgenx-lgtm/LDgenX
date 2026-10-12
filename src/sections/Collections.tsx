import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { applications, studies, resources, team, partners } from '../content/fr';
import { Photo, Reveal } from '../components/ui';
import { usePointerVars } from '../components/motion';

export function ApplicationGrid() {
  return (
    <div className="application-grid">
      {applications.map((s, i) => (
        <Reveal
          key={s.slug}
          className={`application-tile application-tile-${i}`}
          delay={(i % 2) * 0.08}
        >
          <Link to={`/applications/${s.slug}`}>
            <Photo
              name={s.image}
              alt=""
              sizes="(max-width: 700px) 90vw, (max-width: 1000px) 50vw, 40vw"
            />
            <div className="application-tile-content">
              <h3>{s.title}</h3>
              <p className="application-scope">{s.scope}</p>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

export function StudyFacts({ facts }: { facts: { label: string; value: string }[] }) {
  return (
    <dl className="study-facts">
      {facts.map((f) => (
        <div key={f.label}>
          <dt>{f.label}</dt>
          <dd>{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function StudyGrid({ all = false }: { all?: boolean }) {
  return (
    <div className={`study-grid ${all ? 'study-grid-all' : ''}`}>
      {studies.slice(0, all ? 4 : 2).map((s, i) => (
        <Reveal key={s.slug} delay={(i % 2) * 0.1}>
          <Link className="editorial-item study-card" to={`/etudes-de-cas/${s.slug}`}>
            <div className="editorial-image">
              <Photo name={s.image} alt="" sizes="(max-width: 700px) 90vw, 50vw" />
            </div>
            <p className="item-category">{s.category}</p>
            <h3>{s.title}</h3>
            <StudyFacts facts={s.facts} />
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

export function ResourceGrid({ items = resources }: { items?: typeof resources }) {
  return (
    <div className="resource-grid">
      {items.map((r, i) => (
        <Reveal key={r.slug} delay={i * 0.06}>
          <Link className="editorial-item" to={`/ressources/${r.slug}`}>
            <div className="editorial-image">
              <Photo name={r.image} alt="" sizes="(max-width: 700px) 90vw, 33vw" />
            </div>
            <p className="item-category">{r.category}</p>
            <h3>{r.title}</h3>
            <p>{r.intro}</p>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

export function TeamList({ detailed = false }: { detailed?: boolean }) {
  return (
    <div className={`team-list ${detailed ? 'team-list-detailed' : ''}`}>
      {team.map((p, i) => (
        <Reveal key={p.name} className="team-person" delay={i * 0.12}>
          <TeamPortrait photo={p.photo} />
          <div>
            <h3>{p.name}</h3>
            <p className="team-role">{p.role}</p>
            {detailed && <p className="team-bio">{p.bio}</p>}
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/** A portrait that leans towards the pointer, the face moving a little less than the frame. */
function TeamPortrait({ photo }: { photo: string }) {
  const ref = useRef<HTMLElement>(null);
  usePointerVars(ref, 6);
  return (
    <figure ref={ref} className="team-portrait">
      <Photo name={photo} alt="" sizes="(max-width: 700px) 90vw, 30vw" />
      <span className="team-portrait-glare" aria-hidden="true" />
    </figure>
  );
}

export function PartnerList() {
  return (
    <div className="partner-groups">
      {partners.map((p) => (
        <Reveal key={p.title} className="partner-group">
          <div>
            <h2>{p.title}</h2>
            <p>{p.description}</p>
          </div>
          <ul>
            {p.names.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </Reveal>
      ))}
    </div>
  );
}
