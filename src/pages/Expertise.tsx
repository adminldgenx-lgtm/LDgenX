import { useRef, type CSSProperties } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { Expertise as ExpertiseData, Sector } from '../content/fr';
import type { CaseRef, EquipmentItem } from '../content/types';
import { useCatalog, useRoutes } from '../i18n';
import { type PageMeta } from '../lib/pages';
import {
  PageHero,
  Eyebrow,
  Photo,
  Reveal,
  TextLink,
  TiltLink,
  FinalCTA,
  SectionHeading,
  Button,
} from '../components/ui';
import { AnimatedHeading, useSeen } from '../components/motion';
import { RichText } from '../components/Figure';
import { AmbientField } from '../components/AmbientField';
import { LiveList, StepRows } from '../components/Steps';
import { ExpertiseLandscape } from '../sections/ExpertiseLandscape';
import { ApplicationAtlas } from '../sections/ApplicationAtlas';
import { ApplicationGrid, StudyFacts } from '../sections/Collections';
import { Workflow } from '../sections/Workflow';
import { PublicationLinks, researchLink } from './Research';
import { CustomAssay, CustomAssayTeaser, SpeciesWall } from '../sections/CustomAssay';
import { CirBlock } from '../sections/Cir';
import { SamplingKits } from '../sections/SamplingKits';
import { ErcModule } from '../sections/Erc';
import { Faq, ProjectPractice } from '../sections/Practice';

function RelatedServices({ ids }: { ids: string[] }) {
  const { services } = useCatalog();
  const r = useRoutes();
  return (
    <div className="related-links">
      {ids
        .map((id) => services.find((s) => s.id === id))
        .filter((s): s is ExpertiseData => Boolean(s))
        .map((s, i) => (
          <Reveal key={s.id} delay={i * 0.1}>
            <TiltLink className="related-link" to={r.service(s.id)}>
              <span className="related-picture">
                <Photo name={s.image} alt="" sizes="(max-width: 700px) 90vw, 33vw" />
              </span>
              <div>
                <h3>{s.title}</h3>
              </div>
              <p>{s.short}</p>
            </TiltLink>
          </Reveal>
        ))}
    </div>
  );
}

/** The team's articles that share this expertise's field: the topics put forward first. */
function RelatedPublications({ id }: { id: string }) {
  const { research, ui } = useCatalog();
  const r = useRoutes();
  const t = ui.research;
  const featured = research.featured.map((f) => f.publication);
  const items = research.publications
    .filter((p) => p.services.includes(id))
    .sort(
      (a, b) =>
        Number(featured.includes(b.id)) - Number(featured.includes(a.id)) || b.year - a.year,
    );
  if (!items.length) return null;
  return (
    <section className="section-space related-publications">
      <div className="container">
        <SectionHeading
          eyebrow={t.relatedEyebrow}
          title={t.relatedTitle}
          link={{
            to: researchLink(r.publications, { expertise: id }),
            label: t.relatedAll(items.length),
          }}
        />
        <PublicationLinks items={items.slice(0, 3)} />
      </div>
    </section>
  );
}

/** A case study: the one given, or the first one that relies on the expertise. */
function RelatedStudy({ id, studyId }: { id?: string; studyId?: string }) {
  const { studies, ui } = useCatalog();
  const r = useRoutes();
  const study = studies.find((s) => (studyId ? s.id === studyId : s.service === id));
  if (!study) return null;
  return (
    <section className="section-space studies-section">
      <div className="container">
        <SectionHeading
          eyebrow={ui.expertisePage.insight}
          title={study.title}
          body={study.subtitle}
          link={{ to: r.study(study.id), label: ui.expertisePage.exploreStudy }}
        />
        <Reveal className="case-sheet">
          <p className="case-sheet-title">{ui.common.inBrief}</p>
          <StudyFacts facts={study.facts} />
        </Reveal>
      </div>
    </section>
  );
}

export function ServicesPage({ meta }: { meta: PageMeta }) {
  const { pageCopy, copy, ui } = useCatalog();
  const r = useRoutes();
  const t = ui.expertisePage;
  return (
    <>
      <PageHero meta={meta} {...pageCopy.services} />
      <ExpertiseLandscape title={ui.landscape.pageTitle} allLink={false} />
      <section className="detail-section">
        <div className="container detail-intro">
          <div>
            <Eyebrow>{t.approachEyebrow}</Eyebrow>
            <AnimatedHeading text={t.approachTitle} />
          </div>
          <Reveal>
            <p>{t.approachText}</p>
            <p className="detail-note">{t.approachNote}</p>
            <TextLink to={r.contact}>{copy.labels.contact}</TextLink>
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
  const { services, applications, equipment, ui } = useCatalog();
  const r = useRoutes();
  const t = ui.expertisePage;
  const s = services.find((s) => s.id === meta.id)!;
  const h = s.headings ?? {};
  const dark = ['bioinformatique', 'sequencage-dpcr', 'recherche-developpement'].includes(s.id);
  const related = services
    .filter(
      (x) =>
        x.id !== s.id &&
        ['bioinformatique', 'sequencage-dpcr', 'adn-environnemental-adne'].includes(x.id),
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
          <div>
            <Eyebrow>{t.needEyebrow}</Eyebrow>
            <AnimatedHeading
              text={h.need ?? (s.id === 'materiel' ? t.needField : t.needQuestion)}
            />
          </div>
          <Reveal>
            <p>{s.need}</p>
          </Reveal>
        </div>
      </section>
      {s.id === 'materiel' && <SamplingKits />}
      {s.id === 'materiel' && <EquipmentShowcase items={equipment} />}
      {s.id === 'tests-adn-cibles' && <SpeciesWall />}
      <section className="approach-section">
        <div className="container approach-layout">
          <div className="approach-heading">
            <Eyebrow>{t.methodsEyebrow}</Eyebrow>
            <AnimatedHeading text={h.methods ?? t.methodsTitle} />
            <Reveal delay={0.1}>
              <p>{h.methodsText ?? t.methodsText}</p>
            </Reveal>
          </div>
          <StepRows items={s.approaches} />
        </div>
      </section>
      {s.id === 'tests-adn-cibles' && <CustomAssay variant="page" />}
      {s.id === 'sequencage-dpcr' && <CustomAssayTeaser />}
      {s.cir && <CirBlock />}
      {s.prestations.length > 0 && (
        <section className="section-space prestation-section">
          <div className="container prestation-layout">
            <div>
              <Eyebrow>{t.prestationsEyebrow}</Eyebrow>
              <AnimatedHeading text={h.prestations ?? t.prestationsTitle} />
              <Reveal delay={0.1}>
                <p>{t.prestationsText}</p>
              </Reveal>
            </div>
            <LiveList className="prestation-list" items={s.prestations} />
          </div>
        </section>
      )}
      <section className="use-section">
        <AmbientField tone="dark" className="use-field" />
        <div className="container use-layout">
          <div>
            <Eyebrow light>{t.usesEyebrow}</Eyebrow>
            <AnimatedHeading text={h.uses ?? t.usesTitle} />
          </div>
          <LiveList className="use-list" items={s.uses} />
        </div>
      </section>
      {s.cases.length > 0 && (
        <section className="section-space cases-section">
          <div className="container">
            <Eyebrow>{t.casesEyebrow}</Eyebrow>
            <AnimatedHeading text={h.cases ?? t.casesTitle} />
            <CaseCards cases={s.cases} />
          </div>
        </section>
      )}
      <ProjectPractice intro={s.delivery} />
      {!s.cases.some((c) => c.link?.kind === 'study') && <RelatedStudy id={s.id} />}
      <RelatedPublications id={s.id} />
      <section className="section-space">
        <div className="container">
          <Eyebrow>{t.sectorsEyebrow}</Eyebrow>
          <AnimatedHeading text={t.sectorsTitle} />
          <div className="related-links">
            {s.sectors
              .map((id) => applications.find((a) => a.id === id))
              .filter((a): a is Sector => Boolean(a))
              .map((a, i) => (
                <Reveal key={a.id} delay={i * 0.1}>
                  <TiltLink className="related-link" to={r.application(a.id)}>
                    <span className="related-picture">
                      <Photo name={a.image} alt="" />
                    </span>
                    <div>
                      <h3>{a.title}</h3>
                    </div>
                  </TiltLink>
                </Reveal>
              ))}
          </div>
        </div>
      </section>
      <section className="section-space delivery-section">
        <div className="container">
          <Eyebrow>{t.moreEyebrow}</Eyebrow>
          <AnimatedHeading text={t.moreTitle} />
          <RelatedServices ids={related.map((x) => x.id)} />
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

/** The cases shown on an expertise page: a picture and a title, linked to the study, the
 *  scientific work or the publication when there is one. */
function CaseCards({ cases }: { cases: CaseRef[] }) {
  const { ui } = useCatalog();
  const r = useRoutes();
  return (
    <div className="case-cards">
      {cases.map((c, i) => {
        const body = (
          <>
            <span className="case-card-picture">
              {c.image && <Photo name={c.image} alt="" sizes="(max-width: 700px) 90vw, 30vw" />}
            </span>
            <span className="case-card-title">
              <RichText text={c.title} />
            </span>
            {c.link?.kind === 'external' && (
              <ArrowUpRight className="case-card-out" size={16} aria-hidden="true" />
            )}
          </>
        );
        return (
          <Reveal key={c.title} delay={(i % 3) * 0.08} className="case-card-slot">
            {!c.link ? (
              <div className="case-card">{body}</div>
            ) : c.link.kind === 'external' ? (
              <a className="case-card tilt" href={c.link.href} target="_blank" rel="noreferrer">
                {body}
                <span className="sr-only">{ui.common.newTab}</span>
              </a>
            ) : (
              <TiltLink className="case-card" to={r.link(c.link)}>
                {body}
              </TiltLink>
            )}
          </Reveal>
        );
      })}
    </div>
  );
}

/** The sampling equipment: for each tool, its pictures, its characteristics and its published
 *  prices. Pictures follow one another while the tool is in view. */
function EquipmentShowcase({ items }: { items: EquipmentItem[] }) {
  const { ui, copy } = useCatalog();
  const t = ui.equipment;
  return (
    <section className="section-space equipment-section" aria-label={t.eyebrow}>
      <div className="container">
        <div className="equipment-head">
          <div>
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <AnimatedHeading text={t.title} />
          </div>
          <Reveal delay={0.1}>
            <p>{t.text}</p>
          </Reveal>
        </div>
        <div className="equipment-list">
          {items.map((item) => (
            <EquipmentCard key={item.id} item={item} />
          ))}
        </div>
        <Reveal className="equipment-foot">
          <p>{t.priceNote}</p>
          <Button>{copy.labels.quote}</Button>
        </Reveal>
      </div>
    </section>
  );
}

function EquipmentCard({ item }: { item: EquipmentItem }) {
  const { ui } = useCatalog();
  const t = ui.equipment;
  const ref = useRef<HTMLElement>(null);
  const seen = useSeen(ref);
  return (
    <Reveal className="equipment-card-slot">
      <article ref={ref} className="equipment-card" data-seen={seen || undefined}>
        <div
          className="equipment-pictures"
          data-count={item.images.length}
          style={{ '--count': item.images.length } as CSSProperties}
        >
          {item.images.map((image, i) => (
            <figure key={image.name} style={{ '--i': i } as CSSProperties}>
              <Photo name={image.name} alt={image.alt} sizes="(max-width: 800px) 90vw, 30vw" />
            </figure>
          ))}
        </div>
        <div className="equipment-body">
          <h3>{item.name}</h3>
          <p className="equipment-summary">{item.summary}</p>
          <h4>{t.specs}</h4>
          <ul className="equipment-specs">
            {item.specs.map((spec) => (
              <li key={spec}>{spec}</li>
            ))}
          </ul>
        </div>
      </article>
    </Reveal>
  );
}

export function ApplicationsPage({ meta }: { meta: PageMeta }) {
  const { pageCopy, ui } = useCatalog();
  const t = ui.expertisePage;
  return (
    <>
      <PageHero meta={meta} {...pageCopy.applications} />
      <ApplicationAtlas />
      <section className="section-space applications-section" aria-labelledby="sectors-title">
        <div className="container">
          <Eyebrow>{t.allSectorsEyebrow}</Eyebrow>
          <AnimatedHeading text={t.allSectorsTitle} />
          <h2 id="sectors-title" className="sr-only">
            {t.sectorsSr}
          </h2>
          <ApplicationGrid />
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

export function ApplicationPage({ meta }: { meta: PageMeta }) {
  const { applications, ui } = useCatalog();
  const r = useRoutes();
  const t = ui.expertisePage;
  const s = applications.find((s) => s.id === meta.id)!;
  const related = s.related && applications.find((a) => a.id === s.related!.id);
  return (
    <>
      <PageHero meta={meta} eyebrow={s.title} title={s.headline} intro={s.intro} image={s.image} />
      <section className="detail-section">
        <div className="container approach-layout">
          <div className="approach-heading">
            <Eyebrow>{s.headings?.fieldEyebrow ?? t.fieldEyebrow}</Eyebrow>
            <AnimatedHeading text={s.headings?.field ?? t.fieldTitle} />
            <Reveal delay={0.1}>
              <p>{t.fieldText}</p>
            </Reveal>
          </div>
          <StepRows items={s.needs} />
        </div>
      </section>
      {s.cir && <CirBlock />}
      {s.approaches && (
        <section className="section-space sector-approaches">
          <div className="container">
            <Eyebrow>{t.approachesEyebrow}</Eyebrow>
            <AnimatedHeading text={t.approachesTitle} />
            <ol className="sector-approach-list">
              {s.approaches.map((a, i) => (
                <li key={a.title}>
                  <Reveal delay={i * 0.06}>
                    <h3>{a.title}</h3>
                    <p>{a.text}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
      {(s.uses.length > 0 || s.examples.length > 0) && (
        <section className="use-section">
          <AmbientField tone="dark" className="use-field" />
          <div className="container use-layout use-layout-pair">
            {s.uses.length > 0 && (
              <div>
                <Eyebrow light>{t.applicationUses}</Eyebrow>
                <LiveList className="use-list" items={s.uses} />
              </div>
            )}
            {s.examples.length > 0 && (
              <div>
                <Eyebrow light>{t.applicationExamples}</Eyebrow>
                <LiveList className="use-list" items={s.examples} />
              </div>
            )}
          </div>
        </section>
      )}
      {s.erc && <ErcModule />}
      {s.deliverables && (
        <section className="section-space sector-deliverables">
          <div className="container approach-layout">
            <div className="approach-heading">
              <Eyebrow>{t.deliverablesEyebrow}</Eyebrow>
              <AnimatedHeading text={t.deliverablesTitle} />
              <Reveal delay={0.1}>
                <p>{t.deliverablesText}</p>
                <Button to={r.contact}>{t.nextStep}</Button>
              </Reveal>
            </div>
            <LiveList className="live-list-light sector-deliverable-list" items={s.deliverables} />
          </div>
        </section>
      )}
      <section className="section-space">
        <div className="container">
          <SectionHeading
            eyebrow={t.relatedEyebrow}
            title={s.headings?.related ?? t.relatedTitle}
            body={t.relatedBody}
          />
          <RelatedServices ids={s.services} />
        </div>
      </section>
      {related && (
        <section className="sector-related">
          <div className="container">
            <TiltLink className="sector-related-link" to={r.application(related.id)}>
              <span className="sector-related-picture">
                <Photo name={related.image} alt="" sizes="(max-width: 800px) 92vw, 160px" />
              </span>
              <span className="sector-related-body">
                <span className="sector-related-question">{s.related!.text}</span>
                <span className="sector-related-title">
                  {t.seeAlso} · {related.title}
                </span>
                <span className="sector-related-scope">{related.scope}</span>
              </span>
              <ArrowRight className="sector-related-arrow" size={20} aria-hidden="true" />
            </TiltLink>
          </div>
        </section>
      )}
      <ProjectPractice intro={t.practiceIntro} />
      {s.study && <RelatedStudy studyId={s.study} />}
      <FinalCTA />
    </>
  );
}
