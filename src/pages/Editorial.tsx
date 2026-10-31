import { useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useCatalog, useRoutes } from '../i18n';
import { useItemDocument } from '../editorial/context';
import { PageWriting } from '../editorial/PageWriting';
import { RichNodes } from '../editorial/PublicDocument';
import { type PageMeta } from '../lib/pages';
import {
  PageHero,
  Photo,
  Reveal,
  Eyebrow,
  FinalCTA,
  TextLink,
  TiltLink,
  Button,
} from '../components/ui';
import { AnimatedHeading, useActiveRow } from '../components/motion';
import { AmbientField } from '../components/AmbientField';
import { LiveList, StepRows } from '../components/Steps';
import { ResourceGrid, StudyFacts } from '../sections/Collections';
import { StudyPanels } from '../sections/StudyPanels';
import { StudyDetails } from '../sections/StudyDetails';
import { StudyJourney } from '../sections/StudyJourney';
import { Lab } from '../sections/Innovation';
import { StudyResults } from '../sections/StudyResults';
import { WorkCards } from './Works';

export function StudiesPage({ meta }: { meta: PageMeta }) {
  const { pageCopy, ui } = useCatalog();
  const r = useRoutes();
  const t = ui.studyPage;
  return (
    <>
      <PageHero meta={meta} {...pageCopy.studies} />
      <section className="section-space studies-more" aria-labelledby="studies-title">
        <div className="container">
          <h2 id="studies-title" className="sr-only">
            {t.studiesSr}
          </h2>
          <StudyPanels all label={ui.panels.allLabel} />
        </div>
      </section>
      <section className="section-space delivery-section" aria-label={t.worksEyebrow}>
        <div className="container">
          <div className="detail-intro works-intro">
            <div>
              <Eyebrow>{t.worksEyebrow}</Eyebrow>
              <AnimatedHeading text={t.worksTitle} />
            </div>
            <Reveal>
              <p>{t.worksText}</p>
              <TextLink to={r.publications}>{t.publications}</TextLink>
            </Reveal>
          </div>
          <WorkCards />
        </div>
      </section>
      <FinalCTA />
    </>
  );
}
export function StudyPage({ meta }: { meta: PageMeta }) {
  const { studies, services, featuredStudy, ui } = useCatalog();
  const r = useRoutes();
  const t = ui.studyPage;
  const s = studies.find((s) => s.id === meta.id);
  if (!s) return null;
  const service = services.find((x) => x.id === s.service);
  const rows = [
    { title: t.context, text: s.context },
    { title: t.question, text: s.question },
    { title: t.approach, text: s.approach },
    ...(s.result ? [{ title: t.lessons, text: s.result }] : []),
  ];
  const journey = s.id === featuredStudy.slug;
  return (
    <>
      <PageHero meta={meta} eyebrow={s.category} title={s.title} intro={s.subtitle} />
      {journey ? (
        <>
          <h2 className="sr-only">{t.alongCoast}</h2>
          <StudyJourney />
          <StudyResults />
        </>
      ) : (
        <section className="detail-section">
          <div className="container">
            <Reveal className="article-wide-image">
              <Photo name={s.image} alt={s.imageAlt ?? ''} eager />
            </Reveal>
            <Reveal className="case-sheet">
              <p className="case-sheet-title">{ui.common.inBrief}</p>
              <StudyFacts facts={s.facts} />
            </Reveal>
            <div className="case-content">
              <StepRows items={rows} as="h2" className="case-steps" />
              {!s.result && !s.details && (
                <p className="form-note">
                  {s.status === 'ongoing' && `${t.ongoing} `}
                  {t.noResults}
                </p>
              )}
              {s.source && !/ldgenx\.(fr|com)/.test(s.source) && (
                <a className="source-link" href={s.source} target="_blank" rel="noreferrer">
                  {t.reference}
                  <span className="sr-only">{ui.common.newTab}</span>
                </a>
              )}
            </div>
          </div>
        </section>
      )}
      {s.details && <StudyDetails details={s.details} />}
      <PageWriting path={meta.path} />
      {service && (
        <section className="section-space">
          <div className="container detail-intro">
            <div>
              <Eyebrow>{t.expertiseEyebrow}</Eyebrow>
              <AnimatedHeading text={service.title} />
            </div>
            <Reveal>
              <p>{service.short}</p>
              <TextLink to={r.service(service.id)}>{t.exploreExpertise}</TextLink>
            </Reveal>
          </div>
        </section>
      )}
      <section className="section-space studies-more">
        <div className="container">
          <StudyPanels all exclude={s.id} label={ui.panels.otherLabel} />
        </div>
      </section>
      <FinalCTA />
    </>
  );
}
export function InnovationsPage({ meta }: { meta: PageMeta }) {
  const { pageCopy, companyStory, applications, ui } = useCatalog();
  const r = useRoutes();
  const t = ui.innovationPage;
  const research = applications.find((a) => a.id === 'recherche-publique-privee');
  return (
    <>
      <PageHero meta={meta} {...pageCopy.innovations} image="equipe-maxime" dark />
      <section className="innovation-section lab-band" aria-label={t.sr}>
        <div className="container">
          <Lab />
        </div>
      </section>
      <section className="use-section">
        <AmbientField tone="dark" className="use-field" />
        <div className="container detail-intro">
          <div>
            <Eyebrow light>{t.collaborationEyebrow}</Eyebrow>
            <AnimatedHeading text={t.collaborationTitle} />
          </div>
          <Reveal>
            <p>{t.collaborationText}</p>
            {research && (
              <Button variant="light" to={r.application(research.id)}>
                {t.collaborationAction}
              </Button>
            )}
          </Reveal>
        </div>
      </section>
      <section className="section-space">
        <div className="container detail-intro">
          <div>
            <Eyebrow>{t.deeptechEyebrow}</Eyebrow>
            <AnimatedHeading text={ui.about.deeptechTitle} />
            <Reveal delay={0.1}>
              <p>{companyStory.deeptech}</p>
              <p className="detail-note">{companyStory.status}</p>
            </Reveal>
          </div>
          <Reveal>
            <p className="support-title">{t.supportsTitle}</p>
            <LiveList items={companyStory.supports} />
          </Reveal>
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

export function InnovationPage({ meta }: { meta: PageMeta }) {
  const { innovations, services, ui } = useCatalog();
  const r = useRoutes();
  const t = ui.innovationPage;
  const p = innovations.find((p) => p.id === meta.id)!;
  return (
    <>
      <PageHero
        meta={meta}
        eyebrow={p.title}
        title={p.headline}
        intro={p.intro}
        image={p.image}
        dark
      />
      <section className="detail-section">
        <div className="container">
          <div className="detail-intro">
            <div>
              <Eyebrow>{p.label}</Eyebrow>
              <AnimatedHeading text={`${p.title}\n${t.projectSubtitle}`} />
            </div>
            <Reveal>
              <p>{p.body}</p>
              <p className="detail-note">{t.projectNote}</p>
            </Reveal>
          </div>
        </div>
      </section>
      <section className="innovation-section lab-band" aria-label={t.principle}>
        <div className="container">
          <Lab only={innovations.indexOf(p)} />
        </div>
      </section>
      <section className="section-space">
        <div className="container">
          <Eyebrow>{t.exploreEyebrow}</Eyebrow>
          <AnimatedHeading text={t.exploreTitle} />
          <div className="related-links">
            {services
              .filter((s) =>
                ['adn-environnemental-adne', 'bioinformatique', 'sequencage-dpcr'].includes(
                  s.id,
                ),
              )
              .map((s, i) => (
                <Reveal key={s.id} delay={i * 0.1}>
                  <TiltLink className="related-link" to={r.service(s.id)}>
                    <span className="related-picture">
                      <Photo name={s.image} alt="" />
                    </span>
                    <div>
                      <h3>{s.title}</h3>
                    </div>
                  </TiltLink>
                </Reveal>
              ))}
          </div>
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

export function ResourcesPage({ meta }: { meta: PageMeta }) {
  const { pageCopy, resources, ui } = useCatalog();
  const t = ui.resourcesPage;
  const [category, setCategory] = useState(t.all);
  const [query, setQuery] = useState('');
  const categories = [t.all, ...new Set(resources.map((r) => r.category))];
  const filtered = resources.filter(
    (r) =>
      (category === t.all || r.category === category) &&
      `${r.title} ${r.intro} ${r.category}`
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .includes(
          query
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim(),
        ),
  );
  return (
    <>
      <PageHero meta={meta} {...pageCopy.resources} />
      <section className="section-space delivery-section" aria-labelledby="resources-title">
        <div className="container">
          <h2 id="resources-title" className="sr-only">
            {t.sr}
          </h2>
          <div className="filters" role="group" aria-label={t.filters}>
            {categories.map((c) => (
              <button key={c} aria-pressed={category === c} onClick={() => setCategory(c)}>
                {c}
              </button>
            ))}
            <label className="resource-search">
              <span className="sr-only">{t.search}</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.placeholder}
              />
              <Search size={15} aria-hidden="true" />
            </label>
          </div>
          <div aria-live="polite">
            <span className="sr-only">{t.count(filtered.length)}</span>
            {filtered.length ? (
              <div className="filter-results" key={`${category}|${query.trim()}`}>
                <ResourceGrid items={filtered} />
              </div>
            ) : (
              <p className="no-results">{t.empty}</p>
            )}
          </div>
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

export function ArticlePage({ meta }: { meta: PageMeta }) {
  const { resources, ui } = useCatalog();
  const routes = useRoutes();
  const t = ui.resourcesPage;
  const r = resources.find((r) => r.id === meta.id);
  const content = useItemDocument(meta.path);
  const body = useRef<HTMLDivElement>(null);
  const parts = useRef<(HTMLElement | null)[]>([]);
  const reading = useActiveRow(body, parts);
  if (!r) return null;
  const references = content?.document.references ?? [];
  return (
    <>
      <PageHero meta={meta} eyebrow={r.category} title={r.title} intro={r.intro} />
      <article className="detail-section">
        <div className="container">
          <div className="article-wide-image">
            <Photo name={r.image} alt="" eager />
          </div>
          <div className="article-layout">
            <nav className="article-aside" aria-label={t.contents}>
              <p>{t.contentsTitle}</p>
              {r.sections.map(
                (s, i) =>
                  s.title && (
                    <a
                      key={s.title}
                      href={`#partie-${i + 1}`}
                      aria-current={i === reading ? 'location' : undefined}
                    >
                      {s.title}
                    </a>
                  ),
              )}
            </nav>
            <div ref={body} className="article-content">
              {r.sections.map((s, i) => (
                <Reveal key={`${i}-${s.title}`}>
                  <section
                    id={`partie-${i + 1}`}
                    ref={(el) => {
                      parts.current[i] = el;
                    }}
                    data-reading={i === reading || undefined}
                  >
                    {s.title && <h2>{s.title}</h2>}
                    {s.nodes ? (
                      <RichNodes nodes={s.nodes} media={content?.media} locale={meta.locale} />
                    ) : (
                      <p>{s.text}</p>
                    )}
                  </section>
                </Reveal>
              ))}
              {references.length > 0 && (
                <section className="cms-references">
                  <h2>{ui.lang === 'fr' ? 'Sources & références' : 'Sources & references'}</h2>
                  <ol>
                    {references.map((item, i) => (
                      <li key={i}>
                        {item.url ? (
                          <a href={item.url} rel="noreferrer">
                            {item.label}
                          </a>
                        ) : (
                          item.label
                        )}
                      </li>
                    ))}
                  </ol>
                </section>
              )}
              {r.service && (
                <div className="article-service">
                  <TextLink to={routes.service(r.service)}>{t.expertise}</TextLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
      <FinalCTA />
    </>
  );
}
