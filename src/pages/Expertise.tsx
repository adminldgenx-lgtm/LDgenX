import { pageCopy } from '../content/pages.fr';
import { Link } from 'react-router-dom';
import {
  services,
  applications,
  studies,
  copy,
  type Expertise as ExpertiseData,
  type Sector,
} from '../content/fr';
import { type PageMeta } from '../lib/pages';
import {
  PageHero,
  Eyebrow,
  Photo,
  Reveal,
  TextLink,
  FinalCTA,
  SectionHeading,
} from '../components/ui';
import { ServicesExplorer } from '../sections/Services';
import { ApplicationGrid, StudyFacts } from '../sections/Collections';
import { Workflow } from '../sections/Workflow';
import { Faq, ProjectPractice } from '../sections/Practice';

function RelatedServices({ slugs }: { slugs: string[] }) {
  return (
    <div className="related-links">
      {slugs
        .map((slug) => services.find((s) => s.slug === slug))
        .filter((s): s is ExpertiseData => Boolean(s))
        .map((s) => (
          <Link className="related-link" key={s.slug} to={`/services/${s.slug}`}>
            <Photo name={s.image} alt="" sizes="(max-width: 700px) 90vw, 33vw" />
            <div>
              <h3>{s.title}</h3>
            </div>
            <p>{s.short}</p>
          </Link>
        ))}
    </div>
  );
}

function RelatedStudy({ slug }: { slug: string }) {
  const study = studies.find((s) => s.service === slug);
  if (!study) return null;
  return (
    <section className="section-space studies-section">
      <div className="container">
        <SectionHeading
          eyebrow="Un éclairage concret"
          title={study.title}
          body={study.subtitle}
          link={{ to: `/etudes-de-cas/${study.slug}`, label: 'Explorer cette étude' }}
        />
        <Reveal className="case-sheet">
          <p className="case-sheet-title">En bref</p>
          <StudyFacts facts={study.facts} />
        </Reveal>
      </div>
    </section>
  );
}

export function ServicesPage({ meta }: { meta: PageMeta }) {
  return (
    <>
      <PageHero meta={meta} {...pageCopy.services} />
      <section className="section-space" aria-labelledby="services-title">
        <div className="container">
          <h2 id="services-title" className="sr-only">
            Nos expertises
          </h2>
          <ServicesExplorer />
        </div>
      </section>
      <section className="detail-section">
        <div className="container detail-intro">
          <Reveal>
            <Eyebrow>Une approche qui vous ressemble</Eyebrow>
            <h2>
              La question d’abord.
              <br />
              La technologie ensuite.
            </h2>
          </Reveal>
          <Reveal>
            <p>
              Votre objectif est notre point de départ. Une étude complète, une étape d’analyse ou
              un développement spécifique : nous échangeons avec vous pour définir les expertises
              utiles.
            </p>
            <p className="detail-note">
              Les matrices, les données disponibles et les besoins d’interprétation sont abordés
              ensemble au cadrage du projet.
            </p>
            <TextLink to="/contact">{copy.labels.contact}</TextLink>
          </Reveal>
        </div>
      </section>
      <Workflow />
      <Faq />
      <FinalCTA />
    </>
  );
}

export function ServicePage({ meta }: { meta: PageMeta }) {
  const s = services.find((s) => s.slug === meta.slug)!;
  const dark = ['bioinformatique', 'sequencage-dpcr', 'recherche-developpement'].includes(s.slug);
  const related = services
    .filter(
      (r) =>
        r.slug !== s.slug &&
        (r.slug === 'bioinformatique' ||
          r.slug === 'sequencage-dpcr' ||
          r.slug === 'adn-environnemental-adne'),
    )
    .slice(0, 3);
  return (
    <>
      <PageHero
        meta={meta}
        eyebrow={s.title}
        title={s.headline}
        intro={s.intro}
        image={s.image}
        dark={dark}
      />
      <section className="detail-section">
        <div className="container detail-intro">
          <Reveal>
            <Eyebrow>Votre besoin scientifique</Eyebrow>
            <h2>
              {s.slug === 'materiel'
                ? 'Tout commence sur le terrain.'
                : 'La bonne approche commence par votre question.'}
            </h2>
          </Reveal>
          <Reveal>
            <p>{s.need}</p>
          </Reveal>
        </div>
      </section>
      <section className="approach-section">
        <div className="container approach-layout">
          <Reveal className="approach-heading">
            <Eyebrow>Les approches à mobiliser</Eyebrow>
            <h2>
              Des outils choisis
              <br />
              pour leur sens.
            </h2>
            <p>
              Le choix des méthodes est guidé par l’objectif scientifique et le contexte de votre
              projet.
            </p>
          </Reveal>
          <div>
            {s.approaches.map((a) => (
              <Reveal key={a.title} className="approach-row">
                <div>
                  <h3>{a.title}</h3>
                  <p>{a.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="use-section">
        <div className="container use-layout">
          <Reveal>
            <Eyebrow light>Champs d’application</Eyebrow>
            <h2>
              Des analyses reliées
              <br />à vos enjeux.
            </h2>
          </Reveal>
          <ul className="use-list">
            {s.uses.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </div>
      </section>
      <ProjectPractice intro={s.delivery} />
      <RelatedStudy slug={s.slug} />
      <section className="section-space">
        <div className="container">
          <Eyebrow>Vos secteurs d’application</Eyebrow>
          <h2>La génomique sur votre terrain.</h2>
          <div className="related-links">
            {s.sectors
              .map((slug) => applications.find((a) => a.slug === slug))
              .filter((a): a is Sector => Boolean(a))
              .map((a) => (
                <Link className="related-link" key={a.slug} to={`/applications/${a.slug}`}>
                  <Photo name={a.image} alt="" />
                  <div>
                    <h3>{a.title}</h3>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>
      <section className="section-space delivery-section">
        <div className="container">
          <Eyebrow>Expertises complémentaires</Eyebrow>
          <h2>Aller plus loin, ensemble.</h2>
          <RelatedServices slugs={related.map((r) => r.slug)} />
          <a className="source-link" href={s.source} target="_blank" rel="noreferrer">
            Présentation officielle de cette expertise
          </a>
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

export function ApplicationsPage({ meta }: { meta: PageMeta }) {
  return (
    <>
      <PageHero meta={meta} {...pageCopy.applications} />
      <section className="section-space applications-section" aria-labelledby="sectors-title">
        <div className="container">
          <h2 id="sectors-title" className="sr-only">
            Les secteurs d’application
          </h2>
          <ApplicationGrid />
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

export function ApplicationPage({ meta }: { meta: PageMeta }) {
  const s = applications.find((s) => s.slug === meta.slug)!;
  return (
    <>
      <PageHero meta={meta} eyebrow={s.title} title={s.headline} intro={s.intro} image={s.image} />
      <section className="detail-section">
        <div className="container approach-layout">
          <Reveal className="approach-heading">
            <Eyebrow>Vos questions de terrain</Eyebrow>
            <h2>
              Votre contexte
              <br />
              guide la démarche.
            </h2>
            <p>
              Avant de choisir une technologie, nous prenons le temps de comprendre la question, le
              milieu et les informations dont vous avez besoin.
            </p>
          </Reveal>
          <div>
            {s.needs.map((n) => (
              <Reveal key={n.title} className="approach-row">
                <div>
                  <h3>{n.title}</h3>
                  <p>{n.text}</p>
                </div>
              </Reveal>
            ))}
            <a className="source-link" href={s.source} target="_blank" rel="noreferrer">
              Référence LDgenX
            </a>
          </div>
        </div>
      </section>
      <section className="section-space">
        <div className="container">
          <SectionHeading
            eyebrow="Les expertises à mobiliser"
            title="La génomique au service\nde votre problématique."
            body="Du prélèvement à l’interprétation, nous relions les expertises au besoin identifié avec vous."
          />
          <RelatedServices slugs={s.services} />
        </div>
      </section>
      <ProjectPractice intro="Présentez-nous le contexte, le site ou la population étudiée, les objectifs et les données existantes. Ce premier échange permet de cadrer le besoin et de discuter des étapes d’accompagnement." />
      <RelatedStudy slug={s.services[0]} />
      <FinalCTA />
    </>
  );
}
