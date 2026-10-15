import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog, useRoutes } from '../i18n';
import { type PageMeta } from '../lib/pages';
import { directContact } from '../lib/contact';
import {
  PageHero,
  Eyebrow,
  Reveal,
  Photo,
  FinalCTA,
  SectionHeading,
  TextLink,
} from '../components/ui';
import { PartnerList } from '../sections/Collections';
import { AnimatedHeading, useActiveRow } from '../components/motion';
import { PublicationLinks, researchLink } from './Research';
import { AmbientField } from '../components/AmbientField';
import { LiveList } from '../components/Steps';
import { KeyFacts, Ecosystem } from '../sections/Proof';
import { TeamStage } from '../sections/TeamStage';

export function AboutPage({ meta }: { meta: PageMeta }) {
  const { pageCopy, copy, companyStory, ui } = useCatalog();
  const r = useRoutes();
  const t = ui.about;
  return (
    <>
      <PageHero meta={meta} {...pageCopy.about} />
      <KeyFacts />
      <section className="detail-section">
        <div className="container">
          <div className="detail-intro">
            <div>
              <Eyebrow>{t.missionEyebrow}</Eyebrow>
              <AnimatedHeading text={t.missionTitle} />
            </div>
            <Reveal>
              <p>{companyStory.mission}</p>
              <p className="detail-note">{companyStory.ambition}</p>
            </Reveal>
          </div>
          <div className="detail-intro">
            <div>
              <Eyebrow>{t.chainEyebrow}</Eyebrow>
              <AnimatedHeading text={t.chainTitle} />
            </div>
            <Reveal>
              <p>{copy.home.introductionBody}</p>
              <p className="detail-note">{t.chainNote}</p>
            </Reveal>
          </div>
          <Reveal className="about-image">
            <Photo name="laboratoire" alt={t.imageAlt} />
          </Reveal>
        </div>
      </section>
      <section className="use-section">
        <AmbientField tone="dark" className="use-field" />
        <div className="container use-layout">
          <div>
            <Eyebrow light>{ui.innovationPage.deeptechEyebrow}</Eyebrow>
            <AnimatedHeading text={t.deeptechTitle} />
            <Reveal delay={0.1}>
              <p className="use-text">{companyStory.status}</p>
              <p className="use-text">{companyStory.deeptech}</p>
            </Reveal>
          </div>
          <div>
            <p className="use-list-title">{ui.innovationPage.supportsTitle}</p>
            <LiveList className="use-list" items={companyStory.supports} />
          </div>
        </div>
      </section>
      <section className="section-space">
        <div className="container">
          <SectionHeading
            eyebrow={t.teamEyebrow}
            title={copy.home.teamTitle}
            body={copy.home.teamIntro}
            link={{ to: r.team, label: copy.labels.team }}
          />
          <TeamStage />
        </div>
      </section>
      <section className="section-space">
        <div className="container">
          <SectionHeading
            eyebrow={t.ecoEyebrow}
            title={t.ecoTitle}
            link={{ to: r.partners, label: t.ecoLink }}
          />
          <Ecosystem />
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

export function TeamPage({ meta }: { meta: PageMeta }) {
  const { pageCopy, people, ui } = useCatalog();
  const r = useRoutes();
  return (
    <>
      <PageHero meta={meta} {...pageCopy.team} />
      <section className="section-space delivery-section" aria-labelledby="team-title">
        <div className="container">
          <h2 id="team-title" className="sr-only">
            {ui.about.teamSr}
          </h2>
          <TeamStage />
          <div className="team-profiles">
            {people
              .filter((p) => p.slug)
              .map((p, i) => (
                <Reveal key={p.id} delay={i * 0.08}>
                  <Link className="team-profile-link" to={r.person(p.id)}>
                    <span>{ui.teamStage.profile}</span>
                    {p.name}
                  </Link>
                </Reveal>
              ))}
            <Reveal delay={0.16}>
              <Link className="team-profile-link" to={r.publications}>
                <span>{ui.person.publications}</span>
                {ui.research.eyebrow}
              </Link>
            </Reveal>
          </div>
          <a
            className="source-link"
            href="https://www.ldgenx.fr/a-propos/equipe"
            target="_blank"
            rel="noreferrer"
          >
            {ui.about.teamSource}
            <span className="sr-only">{ui.common.newTab}</span>
          </a>
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

export function PartnersPage({ meta }: { meta: PageMeta }) {
  const { pageCopy, partnerIntro, ui } = useCatalog();
  return (
    <>
      <PageHero meta={meta} {...pageCopy.partners} />
      <section className="section-space trust-wall-section" aria-labelledby="ecosystem-title">
        <div className="container">
          <h2 id="ecosystem-title" className="sr-only">
            {ui.about.partnersSr}
          </h2>
          <Ecosystem />
        </div>
      </section>
      <section className="section-space delivery-section" aria-labelledby="logos-title">
        <div className="container">
          <h2 id="logos-title" className="sr-only">
            {ui.about.logos}
          </h2>
          <Reveal className="partner-intro">
            <p>{partnerIntro.text}</p>
          </Reveal>
          <PartnerList />
          <a
            className="source-link"
            href="https://www.ldgenx.fr/a-propos/partenaires"
            target="_blank"
            rel="noreferrer"
          >
            {ui.about.partnersSource}
            <span className="sr-only">{ui.common.newTab}</span>
          </a>
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

/** One person: biography as published, expertise, publications by year. */
export function PersonPage({ meta }: { meta: PageMeta }) {
  const { people, services, research, ui } = useCatalog();
  const r = useRoutes();
  const t = ui.person;
  const p = people.find((p) => p.id === meta.id)!;
  const service = services.find((s) => s.id === p.service);
  const publications = research.publications.filter((x) => x.members.includes(p.id));
  return (
    <>
      <PageHero meta={meta} eyebrow={t.eyebrow} title={p.name} intro={p.bio} />
      <section className="detail-section person-section">
        <div className="container person-layout">
          <Reveal className="person-portrait">
            <figure>
              <Photo name={p.photo} alt={p.name} sizes="(max-width: 800px) 80vw, 30vw" />
            </figure>
            <p className="person-role">{p.role}</p>
            {service && (
              <TextLink to={r.service(service.id)}>
                {t.expertise} · {service.title}
              </TextLink>
            )}
          </Reveal>
          <div className="person-biography">
            <Eyebrow>{t.biography}</Eyebrow>
            {p.biography.map((paragraph, i) => (
              <Reveal key={paragraph.slice(0, 40)} delay={Math.min(i, 3) * 0.05}>
                <p>{paragraph}</p>
              </Reveal>
            ))}
            <a className="source-link" href={p.source} target="_blank" rel="noreferrer">
              {ui.works.source}
              <span className="sr-only">{ui.common.newTab}</span>
            </a>
          </div>
        </div>
      </section>
      {publications.length > 0 && (
        <section className="section-space publications-section">
          <div className="container">
            <Eyebrow>{t.publications}</Eyebrow>
            <AnimatedHeading text={ui.research.count(publications.length)} />
            <p className="publications-note">{t.publicationsNote}</p>
            <PublicationLinks items={publications} />
            <div className="person-links">
              <TextLink to={researchLink(r.publications, { author: p.id })}>
                {ui.research.seeMember}
              </TextLink>
              <TextLink to={r.team}>{t.allTeam}</TextLink>
            </div>
          </div>
        </section>
      )}
      <FinalCTA />
    </>
  );
}

/** The terms of sale, as published: a table of contents that follows the reading. */
export function TermsPage({ meta }: { meta: PageMeta }) {
  const { cgv, ui } = useCatalog();
  const body = useRef<HTMLDivElement>(null);
  const parts = useRef<(HTMLElement | null)[]>([]);
  const reading = useActiveRow(body, parts);
  return (
    <>
      <PageHero meta={meta} eyebrow={ui.footer.terms} title={cgv.title} intro={ui.terms.note} />
      <section className="detail-section">
        <div className="container article-layout terms-layout">
          <nav className="article-aside" aria-label={ui.terms.contents}>
            <p>{ui.terms.contents}</p>
            {cgv.articles.map((a, i) => (
              <a
                key={a.title}
                href={`#article-${i + 1}`}
                aria-current={i === reading ? 'location' : undefined}
              >
                {a.title}
              </a>
            ))}
          </nav>
          <div ref={body} className="article-content terms-content" lang="fr">
            {cgv.articles.map((a, i) => (
              <section
                key={a.title}
                id={`article-${i + 1}`}
                ref={(el) => {
                  parts.current[i] = el;
                }}
                data-reading={i === reading || undefined}
              >
                <h2>{a.title}</h2>
                {a.clauses.map((clause) => (
                  <p key={clause.slice(0, 48)}>{clause}</p>
                ))}
              </section>
            ))}
            <a className="source-link" href={cgv.source} target="_blank" rel="noreferrer">
              {ui.common.source} · ldgenx.fr
              <span className="sr-only">{ui.common.newTab}</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export function LegalPage({ meta }: { meta: PageMeta }) {
  const { pageCopy, company, ui } = useCatalog();
  const r = useRoutes();
  const t = ui.legal;
  return (
    <>
      <PageHero meta={meta} {...pageCopy.legal} />
      <section className="detail-section">
        <div className="container legal-content">
          <h2>{t.publisher}</h2>
          <p>
            {t.identity.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </p>
          <p>
            {company.address}
            <br />
            {company.city}
            <br />
            <a href={`mailto:${company.email}`}>{company.email}</a>
          </p>
          <h2>{t.contentTitle}</h2>
          <p>{t.content}</p>
          <h2>{t.publicationTitle}</h2>
          <p>{t.publication}</p>
          <TextLink to={r.contact}>{t.contact}</TextLink>
        </div>
      </section>
    </>
  );
}

export function PrivacyPage({ meta }: { meta: PageMeta }) {
  const { pageCopy, company, ui } = useCatalog();
  const t = ui.privacy;
  return (
    <>
      <PageHero meta={meta} {...pageCopy.privacy} />
      <section className="detail-section">
        <div className="container legal-content">
          <h2>{t.navigationTitle}</h2>
          <p>{t.navigation}</p>
          <h2>{directContact ? t.formTitle : t.mailtoTitle}</h2>
          <p>{directContact ? t.form : t.mailto}</p>
          <p>{t.message}</p>
          <h2>{t.linksTitle}</h2>
          <p>{t.links}</p>
          <h2>{t.dataTitle}</h2>
          <p>
            {t.dataBefore}
            <a href={`mailto:${company.email}`}>{company.email}</a>
            {t.dataAfter}
          </p>
        </div>
      </section>
    </>
  );
}
