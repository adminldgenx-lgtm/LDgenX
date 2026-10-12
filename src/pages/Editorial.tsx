import { pageCopy } from '../content/pages.fr';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { innovations, studies, resources, services } from '../content/fr';
import { type PageMeta } from '../lib/pages';
import { PageHero, Photo, Reveal, Eyebrow, FinalCTA, TextLink, Button } from '../components/ui';
import { StudyGrid, ResourceGrid, StudyFacts } from '../sections/Collections';
import { ScientificDiagram } from '../components/ScientificDiagram';

export function StudiesPage({ meta }: { meta: PageMeta }) {
  return (
    <>
      <PageHero meta={meta} {...pageCopy.studies} />
      <section className="section-space" aria-labelledby="studies-title">
        <div className="container">
          <h2 id="studies-title" className="sr-only">
            Les études
          </h2>
          <StudyGrid all />
        </div>
      </section>
      <FinalCTA />
    </>
  );
}
export function StudyPage({ meta }: { meta: PageMeta }) {
  const s = studies.find((s) => s.slug === meta.slug)!;
  const service = services.find((x) => x.slug === s.service)!;
  const rows = [
    { label: 'Le contexte', text: s.context },
    { label: 'La question', text: s.question },
    { label: 'L’approche', text: s.approach },
    ...(s.result ? [{ label: 'Les enseignements', text: s.result }] : []),
  ];
  return (
    <>
      <PageHero meta={meta} eyebrow={s.category} title={s.title} intro={s.subtitle} />
      <section className="detail-section">
        <div className="container">
          <Reveal className="article-wide-image">
            <Photo name={s.image} alt={('imageAlt' in s && s.imageAlt) || ''} eager />
          </Reveal>
          <Reveal className="case-sheet">
            <p className="case-sheet-title">En bref</p>
            <StudyFacts facts={s.facts} />
          </Reveal>
          <div className="case-content">
            {rows.map((r) => (
              <Reveal className="case-row" key={r.label}>
                <div>
                  <h2>{r.label}</h2>
                </div>
                <p>{r.text}</p>
              </Reveal>
            ))}
            {!s.result && (
              <p className="form-note">
                Cette présentation s’appuie sur le sujet cité par LDgenX. Les résultats détaillés ne
                sont pas publiés dans la source consultée.
              </p>
            )}
            <a className="source-link" href={s.source} target="_blank" rel="noreferrer">
              Consulter la référence publiée
            </a>
          </div>
        </div>
      </section>
      <section className="section-space">
        <div className="container detail-intro">
          <Reveal>
            <Eyebrow>L’expertise associée</Eyebrow>
            <h2>{service.title}</h2>
          </Reveal>
          <Reveal>
            <p>{service.short}</p>
            <TextLink to={`/services/${service.slug}`}>Explorer cette expertise</TextLink>
          </Reveal>
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

export function InnovationsPage({ meta }: { meta: PageMeta }) {
  return (
    <>
      <PageHero meta={meta} {...pageCopy.innovations} image="innovation" dark />
      <section className="section-space delivery-section">
        <div className="container">
          {innovations.map((p) => (
            <Reveal className="innovation-overview detail-intro" key={p.slug}>
              <div className="innovation-overview-image">
                <Photo name={p.image} alt="" />
              </div>
              <div>
                <Eyebrow>{p.label}</Eyebrow>
                <h2>{p.title}</h2>
                <p className="innovation-overview-intro">{p.intro}</p>
                <TextLink to={`/innovation/${p.slug}`}>Explorer le projet</TextLink>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="use-section">
        <div className="container detail-intro">
          <Reveal>
            <Eyebrow light>Collaborations scientifiques</Eyebrow>
            <h2>
              L’innovation se
              <br />
              construit ensemble.
            </h2>
          </Reveal>
          <Reveal>
            <p>
              Développer une méthode, explorer une nouvelle application ou construire un projet
              collaboratif : notre équipe est ouverte aux collaborations scientifiques, techniques
              et industrielles.
            </p>
            <Button variant="light" to="/services/recherche-developpement">
              Notre accompagnement R&D
            </Button>
          </Reveal>
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

export function InnovationPage({ meta }: { meta: PageMeta }) {
  const p = innovations.find((p) => p.slug === meta.slug)!;
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
            <Reveal>
              <Eyebrow>{p.label}</Eyebrow>
              <h2>
                {p.title}
                <br />
                Une voie à explorer.
              </h2>
            </Reveal>
            <Reveal>
              <p>{p.body}</p>
              <p className="detail-note">
                Ce projet relève de la recherche et du développement. Les objectifs présentés ne
                constituent pas une promesse de résultat ou une performance commerciale annoncée.
              </p>
            </Reveal>
          </div>
          <ScientificDiagram steps={p.steps} />
          <a
            className="source-link"
            href="https://www.ldgenx.fr/a-propos/innovation"
            target="_blank"
            rel="noreferrer"
          >
            Présentation officielle des projets
          </a>
        </div>
      </section>
      <section className="section-space">
        <div className="container">
          <Eyebrow>Explorer la recherche</Eyebrow>
          <h2>Des expertises qui se rencontrent.</h2>
          <div className="related-links">
            {services
              .filter((s) =>
                ['adn-environnemental-adne', 'bioinformatique', 'recherche-developpement'].includes(
                  s.slug,
                ),
              )
              .map((s) => (
                <Link key={s.slug} className="related-link" to={`/services/${s.slug}`}>
                  <Photo name={s.image} alt="" />
                  <div>
                    <h3>{s.title}</h3>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

export function ResourcesPage({ meta }: { meta: PageMeta }) {
  const [category, setCategory] = useState('Tout explorer');
  const [query, setQuery] = useState('');
  const categories = ['Tout explorer', ...new Set(resources.map((r) => r.category))];
  const filtered = resources.filter(
    (r) =>
      (category === 'Tout explorer' || r.category === category) &&
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
            Explorer les ressources
          </h2>
          <div className="filters" role="group" aria-label="Filtrer les ressources">
            {categories.map((c) => (
              <button key={c} aria-pressed={category === c} onClick={() => setCategory(c)}>
                {c}
              </button>
            ))}
            <label className="resource-search">
              <span className="sr-only">Rechercher une ressource</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un sujet"
              />
              <Search size={15} aria-hidden="true" />
            </label>
          </div>
          <div aria-live="polite">
            <span className="sr-only">
              {filtered.length} ressource{filtered.length > 1 ? 's' : ''}
            </span>
            {filtered.length ? (
              <div className="filter-results" key={`${category}|${query.trim()}`}>
                <ResourceGrid items={filtered} />
              </div>
            ) : (
              <p className="no-results">
                Aucune ressource pour cette recherche. Essayez un autre sujet ou sélectionnez « Tout
                explorer ».
              </p>
            )}
          </div>
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

export function ArticlePage({ meta }: { meta: PageMeta }) {
  const r = resources.find((r) => r.slug === meta.slug)!;
  return (
    <>
      <PageHero meta={meta} eyebrow={r.category} title={r.title} intro={r.intro} />
      <article className="detail-section">
        <div className="container">
          <div className="article-wide-image">
            <Photo name={r.image} alt="" eager />
          </div>
          <div className="article-layout">
            <nav className="article-aside" aria-label="Sommaire de l’article">
              <p>DANS CETTE RESSOURCE</p>
              {r.sections.map((s, i) => (
                <a key={s.title} href={`#partie-${i + 1}`}>
                  {s.title}
                </a>
              ))}
            </nav>
            <div className="article-content">
              {r.sections.map((s, i) => (
                <Reveal key={s.title}>
                  <section id={`partie-${i + 1}`}>
                    <h2>{s.title}</h2>
                    <p>{s.text}</p>
                  </section>
                </Reveal>
              ))}
              <a className="source-link" href={r.source} target="_blank" rel="noreferrer">
                Source : présentation scientifique LDgenX
              </a>
              <div className="article-service">
                <TextLink to={`/services/${r.service}`}>Découvrir l’expertise associée</TextLink>
              </div>
            </div>
          </div>
        </div>
      </article>
      <FinalCTA />
    </>
  );
}
