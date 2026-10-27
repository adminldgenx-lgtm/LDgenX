import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useCatalog, useRoutes } from '../i18n';
import { Button, Eyebrow, SectionHeading, FinalCTA, TextLink, Reveal } from '../components/ui';
import { HeroVideo } from '../components/HeroVideo';
import { DnaProcess } from '../sections/DnaProcess';
import { KeyFacts } from '../sections/Proof';
import { ExpertiseTrace } from '../sections/ExpertiseTrace';
import { CustomAssayTeaser } from '../sections/CustomAssay';
import { ApplicationAtlas } from '../sections/ApplicationAtlas';

/** Whether a dated item is still current: through the whole of its last day. */
const stillOn = (until: string) => Date.now() <= new Date(`${until}T23:59:59`).getTime();

/** Dated news, shown until the end of the event, then the R&D project again. The page is
 *  prerendered: the first render follows the server markup, the date is checked afterwards. */
function HeroNews() {
  const { news, innovations, ui } = useCatalog();
  const r = useRoutes();
  const [showNews, setShowNews] = useState(() =>
    typeof document === 'undefined'
      ? stillOn(news.until)
      : document.querySelector('.dna-hero-news[data-news]') !== null,
  );
  useEffect(() => setShowNews(stillOn(news.until)), [news.until]);
  if (showNews)
    return (
      <a className="dna-hero-news" data-news href={news.href} target="_blank" rel="noreferrer">
        <span className="dna-hero-news-label">{news.label}</span>
        <span>{news.short}</span>
        <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
        <span className="sr-only">{ui.common.newTab}</span>
      </a>
    );
  const project = innovations[0];
  return (
    <Link className="dna-hero-news" to={r.innovation(project.id)}>
      <span className="dna-hero-news-label">{ui.hero.innovationLabel}</span>
      <span>{`${project.title}${ui.lang === 'fr' ? '\u00a0: ' : ': '}${ui.hero.innovationText}`}</span>
      <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
    </Link>
  );
}

export function Home() {
  const { copy, ui, studies } = useCatalog();
  const r = useRoutes();
  const [first, second] = ui.hero.lines;
  const featuredStudy = studies.find((study) => study.id === 'ichtyofaune-artois-picardie')!;
  return (
    <>
      <div className="dna-hero-wrap">
        <section className="dna-hero" aria-labelledby="hero-title">
          <HeroVideo />
          <div className="dna-hero-shade" aria-hidden="true" />
          <div className="container dna-hero-inner">
            <div className="dna-hero-copy">
              <div className="dna-hero-head">
                <Eyebrow light>{copy.home.eyebrow}</Eyebrow>
                {/* Three short lines, set large: the headline answers the film. */}
                <h1 id="hero-title" className="dna-hero-title">
                  <span className="dna-hero-line">
                    <span className="dna-hero-segment">{first[0]}</span>
                    {first[1] && (
                      <>
                        {' '}
                        <span className="dna-hero-segment">{first[1]}</span>
                      </>
                    )}
                  </span>{' '}
                  <span className="dna-hero-line">
                    <span className="dna-hero-segment">
                      {second[0]}
                      <span className="dna-hero-accent">{second[1]}</span>
                    </span>
                  </span>
                </h1>
              </div>
              <div className="dna-hero-body">
                <p className="dna-hero-intro">{copy.home.intro}</p>
                <div className="dna-hero-actions">
                  <Button variant="light">{copy.home.primary}</Button>
                  <Button to={r.services} variant="ghost">
                    {copy.home.secondary}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          {/* Registration crosses, as on a slide or a plate under the microscope. */}
          {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
            <span
              key={corner}
              className={`dna-hero-cross dna-hero-cross-${corner}`}
              aria-hidden="true"
            />
          ))}
          <HeroNews />
          {/* Markers for the header: scrolling has begun, then the hero has passed beneath it. */}
          <span className="dna-hero-marker dna-hero-start" data-hero-start aria-hidden="true" />
          <span className="dna-hero-marker dna-hero-end" data-hero-end aria-hidden="true" />
        </section>
      </div>
      <KeyFacts />
      <ApplicationAtlas />
      <DnaProcess />
      <ExpertiseTrace />
      <CustomAssayTeaser />
      <section className="section-space studies-section">
        <div className="container">
          <SectionHeading
            eyebrow={ui.hero.studiesEyebrow}
            title={copy.home.studiesTitle}
            link={{ to: r.studies, label: copy.labels.allStudies }}
          />
          <Reveal className="home-study-teaser">
            <div>
              <Eyebrow>Artois-Picardie</Eyebrow>
              <h3>{featuredStudy.title}</h3>
              <p>{featuredStudy.subtitle}</p>
            </div>
            <TextLink to={r.study(featuredStudy.id)}>{ui.expertisePage.exploreStudy}</TextLink>
          </Reveal>
        </div>
      </section>
      {/* The page ends on the studies, at the client's request (23 October 2026): the other
          studies, R&D, partners, team and publications have their own pages. */}
      <FinalCTA />
    </>
  );
}
