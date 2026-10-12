import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { copy, innovations } from '../content/fr';
import { Button, Eyebrow, SectionHeading, FinalCTA } from '../components/ui';
import { HeroVideo } from '../components/HeroVideo';
import { DnaProcess } from '../sections/DnaProcess';
import { KeyFacts, TrustWall } from '../sections/Proof';
import { ExpertiseLandscape } from '../sections/ExpertiseLandscape';
import { TeamList } from '../sections/Collections';
import { StudyCase } from '../sections/StudyCase';
import { ApplicationAtlas } from '../sections/ApplicationAtlas';
import { InnovationShowcase } from '../sections/Innovation';

export function Home() {
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
                {/* Four short lines, set large: the headline answers the film. */}
                <h1 id="hero-title" className="dna-hero-title">
                  <span className="dna-hero-line">
                    <span className="dna-hero-segment">Lire l’ADN</span>{' '}
                    <span className="dna-hero-segment">
                      du <span className="dna-hero-accent">vivant.</span>
                    </span>
                  </span>{' '}
                  <span className="dna-hero-line">
                    <span className="dna-hero-segment">Éclairer vos</span>{' '}
                    <span className="dna-hero-segment">décisions.</span>
                  </span>
                </h1>
              </div>
              <div className="dna-hero-body">
                <p className="dna-hero-intro">{copy.home.intro}</p>
                <div className="dna-hero-actions">
                  <Button variant="light">{copy.home.primary}</Button>
                  <Button to="/services" variant="ghost">
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
          <Link className="dna-hero-news" to={`/innovation/${innovations[0].slug}`}>
            <span className="dna-hero-news-label">Innovation</span>
            <span>{`${innovations[0].title}\u00a0: automatiser le suivi de la biodiversité`}</span>
            <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
          </Link>
          {/* Markers for the header: scrolling has begun, then the hero has passed beneath it. */}
          <span className="dna-hero-marker dna-hero-start" data-hero-start aria-hidden="true" />
          <span className="dna-hero-marker dna-hero-end" data-hero-end aria-hidden="true" />
        </section>
      </div>
      <KeyFacts />
      <DnaProcess />
      <ExpertiseLandscape />
      <ApplicationAtlas />
      <section className="section-space studies-section">
        <div className="container">
          <SectionHeading
            eyebrow="La génomique en pratique"
            title={copy.home.studiesTitle}
            link={{ to: '/etudes-de-cas', label: copy.labels.allStudies }}
          />
          <StudyCase />
        </div>
      </section>
      <InnovationShowcase />
      <TrustWall />
      <section className="section-space team-section">
        <div className="container">
          <SectionHeading
            eyebrow="L’équipe scientifique"
            title={copy.home.teamTitle}
            body={copy.home.teamIntro}
            link={{ to: '/a-propos/equipe', label: copy.labels.team }}
          />
          <TeamList detailed />
        </div>
      </section>
      <FinalCTA />
    </>
  );
}
