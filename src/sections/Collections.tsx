import { Link } from 'react-router-dom';
import { useCatalog, useRoutes } from '../i18n';
import type { Catalog } from '../content/catalog';
import { Photo, Reveal, TiltLink } from '../components/ui';
import { useRef, type CSSProperties } from 'react';
import { useSeen } from '../components/motion';
import { DecodeOnce } from '../components/Decode';

export function ApplicationGrid() {
  const { applications } = useCatalog();
  const r = useRoutes();
  return (
    <div className="application-grid">
      {applications.map((s, i) => (
        <Reveal
          key={s.id}
          className={`application-tile application-tile-${i}`}
          delay={(i % 2) * 0.08}
        >
          <Link to={r.application(s.id)}>
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

/** Facts of a study; their values decode, one after another, when they come into view. */
export function StudyFacts({ facts }: { facts: { label: string; value: string }[] }) {
  const ref = useRef<HTMLDListElement>(null);
  const seen = useSeen(ref);
  return (
    <dl ref={ref} className="study-facts">
      {facts.map((f, i) => (
        <div key={f.label}>
          <dt>{f.label}</dt>
          <dd>
            <DecodeOnce text={f.value} play={seen} delay={150 + i * 160} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ResourceGrid({ items }: { items?: Catalog['resources'] }) {
  const { resources } = useCatalog();
  const r = useRoutes();
  return (
    <div className="resource-grid">
      {(items ?? resources).map((item, i) => (
        <Reveal key={item.id} delay={i * 0.06}>
          <TiltLink className="editorial-item" to={r.resource(item.id)}>
            <div className="editorial-image">
              <Photo name={item.image} alt="" sizes="(max-width: 700px) 90vw, 33vw" />
            </div>
            <p className="item-category">{item.category}</p>
            <h3>{item.title}</h3>
            <p>{item.intro}</p>
          </TiltLink>
        </Reveal>
      ))}
    </div>
  );
}

/** The partners as published on ldgenx.fr: one wall of logos per group, each logo lifting into
 *  colour as the wall comes into view. */
export function PartnerList() {
  const { partnerIntro } = useCatalog();
  return (
    <div className="partner-groups">
      {partnerIntro.groups.map((group) => (
        <PartnerGroup key={group.title} group={group} />
      ))}
    </div>
  );
}

function PartnerGroup({ group }: { group: Catalog['partnerIntro']['groups'][number] }) {
  const ref = useRef<HTMLUListElement>(null);
  const seen = useSeen(ref);
  return (
    <Reveal className="partner-group">
      <div>
        <h2>{group.title}</h2>
        {group.text && <p>{group.text}</p>}
      </div>
      <ul ref={ref} className="partner-logos" data-seen={seen || undefined}>
        {group.members.map((m, i) => (
          <li key={m.logo} style={{ '--i': i } as CSSProperties}>
            <img src={`/partners/${m.logo}.webp`} alt={m.name} loading="lazy" decoding="async" />
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
