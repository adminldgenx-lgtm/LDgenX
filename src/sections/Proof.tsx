import { copy, partners } from '../content/fr';
import { Reveal, SectionHeading } from '../components/ui';

export function KeyFacts() {
  return (
    <section className="facts-band" aria-label="LDgenX en bref">
      <div className="container facts-grid">
        {copy.home.facts.map((fact, i) => (
          <Reveal key={fact.value} className="fact" delay={i * 0.06}>
            <p className="fact-value">{fact.value}</p>
            <p className="fact-label">{fact.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// Partner names are typeset: the published logos are low-resolution composites.
export function TrustWall() {
  return (
    <section className="section-space trust-wall-section">
      <div className="container">
        <SectionHeading
          eyebrow="Références & écosystème"
          title={copy.home.trustTitle}
          body={copy.home.trustIntro}
          link={{ to: '/a-propos/partenaires', label: 'Découvrir nos partenaires' }}
        />
        <div className="trust-rows">
          {partners.map((group, i) => (
            <Reveal key={group.title} className="trust-row" delay={i * 0.06}>
              <h3 className="trust-row-title">{group.title}</h3>
              <ul>
                {group.names.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
