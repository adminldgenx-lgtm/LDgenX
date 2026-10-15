import { useRef } from 'react';
import { useCatalog, useRoutes } from '../i18n';
import { type PageMeta } from '../lib/pages';
import { Eyebrow, FinalCTA, PageHero, Photo, Reveal, TextLink, TiltLink } from '../components/ui';
import { AnimatedHeading, useActiveRow } from '../components/motion';
import { Figure, RichText } from '../components/Figure';
import { StudyFacts } from '../sections/Collections';
import { PublicationLinks } from './Research';

// The articles each scientific work draws on, in the research catalogue.
const WORK_PUBLICATIONS: Record<string, string[]> = {
  conservation: [
    'truite-orb-diversite-2016',
    'omble-recombinaison-ascendance-2019',
    'omble-ascendance-repeuplement-2021',
  ],
  tracabilite: ['truite-trois-ascendances-2018', 'truite-ressource-snp-2019'],
  'selection-genomique': ['bar-resistance-vnn-2023', 'porc-prediction-genomique-2020'],
};

/* The team's scientific works, as published on ldgenx.fr: sections of text with their figures,
   captions and references. The contents follow the reading. */

export function WorkPage({ meta }: { meta: PageMeta }) {
  const { works, services, research, ui } = useCatalog();
  const r = useRoutes();
  const t = ui.works;
  const w = works.find((w) => w.id === meta.id)!;
  const service = services.find((s) => s.id === w.service);
  const linked = (WORK_PUBLICATIONS[w.id] ?? [])
    .map((id) => research.publications.find((p) => p.id === id))
    .filter((p) => p !== undefined);
  const body = useRef<HTMLDivElement>(null);
  const parts = useRef<(HTMLElement | null)[]>([]);
  const reading = useActiveRow(body, parts);
  return (
    <>
      <PageHero meta={meta} eyebrow={w.category} title={w.title} intro={w.summary} />
      <article className="detail-section work-article">
        <div className="container">
          <Reveal className="case-sheet">
            <p className="case-sheet-title">{ui.common.inBrief}</p>
            <StudyFacts facts={w.facts} />
          </Reveal>
          <p className="work-note">{t.note}</p>
          <div className="article-layout">
            <nav className="article-aside" aria-label={t.contents}>
              <p>{t.contents}</p>
              {w.sections.map((s, i) => (
                <a
                  key={s.title}
                  href={`#partie-${i + 1}`}
                  aria-current={i === reading ? 'location' : undefined}
                >
                  {s.title}
                </a>
              ))}
            </nav>
            <div ref={body} className="article-content work-content">
              {w.sections.map((s, i) => (
                <section
                  key={s.title}
                  id={`partie-${i + 1}`}
                  ref={(el) => {
                    parts.current[i] = el;
                  }}
                  data-reading={i === reading || undefined}
                >
                  <Reveal>
                    <h2>{s.title}</h2>
                    {s.paragraphs.map((p) => (
                      <p key={p.slice(0, 40)}>
                        <RichText text={p} />
                      </p>
                    ))}
                  </Reveal>
                  {s.figure && (
                    <Reveal>
                      <Figure
                        image={s.figure.image}
                        alt={s.figure.alt}
                        legend={s.figure.legend}
                        caption={<RichText text={s.figure.caption} />}
                      />
                    </Reveal>
                  )}
                </section>
              ))}
              <a className="source-link" href={w.source} target="_blank" rel="noreferrer">
                {t.source}
                <span className="sr-only">{ui.common.newTab}</span>
              </a>
              {service && (
                <div className="article-service">
                  <TextLink to={r.service(service.id)}>
                    {t.expertise} · {service.title}
                  </TextLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
      {linked.length > 0 && (
        <section className="section-space related-publications">
          <div className="container">
            <Eyebrow>{ui.research.relatedEyebrow}</Eyebrow>
            <AnimatedHeading text={ui.research.workRelated} />
            <PublicationLinks items={linked} />
          </div>
        </section>
      )}
      <section className="section-space delivery-section">
        <div className="container">
          <Eyebrow>{t.others}</Eyebrow>
          <AnimatedHeading text={ui.studyPage.worksTitle} />
          <WorkCards exclude={w.id} />
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

/** The scientific works as cards, in the style of the resources. */
export function WorkCards({ exclude }: { exclude?: string }) {
  const { works } = useCatalog();
  const r = useRoutes();
  return (
    <div className="resource-grid work-grid">
      {works
        .filter((w) => w.id !== exclude)
        .map((w, i) => (
          <Reveal key={w.id} delay={i * 0.06}>
            <TiltLink className="editorial-item" to={r.work(w.id)}>
              <div className="editorial-image work-image">
                <Photo name={w.image} alt="" sizes="(max-width: 700px) 90vw, 33vw" />
              </div>
              <p className="item-category">{w.category}</p>
              <h3>{w.title}</h3>
              <p>{w.summary}</p>
            </TiltLink>
          </Reveal>
        ))}
    </div>
  );
}
