import { listedExpertises } from "../lib/expertises";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useCatalog, useRoutes } from "../i18n";
import { type PageMeta } from "../lib/pages";
import { FinalCTA, PageHero, Reveal } from "../components/ui";
import { useEntrance } from "../components/motion";
import { AmbientField } from "../components/AmbientField";
import { RichText } from "../components/Figure";
import { useEditorial } from "../editorial/context";

/* Reference pages: frequently asked questions, the glossary and the site map. Their text is in
   the page's HTML from the start (answers inside <details> are part of the document), so search
   engines and AI assistants read all of it. */

/** The questions, by theme. Each answer opens in place; one link leads further when useful. */
export function FaqPage({ meta }: { meta: PageMeta }) {
  const { knowledge } = useCatalog();
  const r = useRoutes();
  const t = knowledge.faq;
  return (
    <>
      <PageHero
        meta={meta}
        eyebrow={t.eyebrow}
        title={t.title}
        intro={t.intro}
      />
      <section className="section-space faq-page">
        <AmbientField className="faq-field" />
        <div className="container faq-layout">
          <nav className="faq-index" aria-label={t.eyebrow}>
            {t.groups.map((group, i) => (
              <a key={group.title} href={`#theme-${i + 1}`}>
                {group.title}
                <span>{group.items.length}</span>
              </a>
            ))}
          </nav>
          <div className="faq-groups">
            {t.groups.map((group, gi) => (
              <section
                key={group.title}
                id={`theme-${gi + 1}`}
                className="faq-group"
              >
                <h2>{group.title}</h2>
                {group.items.map((item, i) => (
                  <Reveal key={item.question} delay={Math.min(i, 4) * 0.05}>
                    <details className="faq-item" open={gi === 0 && i === 0}>
                      <summary>
                        <h3>{item.question}</h3>
                        <span className="faq-toggle" aria-hidden="true" />
                      </summary>
                      <div className="faq-answer">
                        <p>{item.answer}</p>
                        {item.link && (
                          <Link className="text-link" to={r.link(item.link.to)}>
                            {item.link.label}
                          </Link>
                        )}
                      </div>
                    </details>
                  </Reveal>
                ))}
              </section>
            ))}
          </div>
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

const initial = (term: string) =>
  term.normalize("NFD").replace(/[̀-ͯ]/g, "").charAt(0).toUpperCase();

/** The glossary: terms in alphabetical order, a letter index that follows the reading. */
export function GlossaryPage({ meta }: { meta: PageMeta }) {
  const { knowledge, ui } = useCatalog();
  const r = useRoutes();
  const t = knowledge.glossary;
  const terms = useMemo(
    () =>
      [...t.terms].sort((a, b) => a.term.localeCompare(b.term, ui.htmlLang)),
    [t.terms, ui.htmlLang],
  );
  const letters = [...new Set(terms.map((x) => initial(x.term)))];
  const list = useRef<HTMLDListElement>(null);
  const phase = useEntrance(list);
  const [current, setCurrent] = useState(letters[0]);
  useEffect(() => {
    const items = list.current?.querySelectorAll<HTMLElement>("[data-letter]");
    if (!items?.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length)
          setCurrent((visible[0].target as HTMLElement).dataset.letter!);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <PageHero
        meta={meta}
        eyebrow={t.eyebrow}
        title={t.title}
        intro={t.intro}
      />
      <section className="section-space glossary-page">
        <div className="container glossary-layout">
          <nav className="glossary-letters" aria-label={t.filterLabel}>
            {letters.map((letter) => (
              <a
                key={letter}
                href={`#lettre-${letter.toLowerCase()}`}
                aria-current={letter === current ? "location" : undefined}
              >
                {letter}
              </a>
            ))}
          </nav>
          <dl ref={list} className="glossary-list" data-phase={phase}>
            {terms.map((x, i) => {
              const first =
                i === 0 || initial(terms[i - 1].term) !== initial(x.term);
              return (
                <div
                  key={x.id}
                  id={x.id}
                  className="glossary-term"
                  data-letter={initial(x.term)}
                  style={{ "--i": Math.min(i, 12) } as CSSProperties}
                >
                  {first && (
                    <span
                      className="glossary-letter"
                      id={`lettre-${initial(x.term).toLowerCase()}`}
                      aria-hidden="true"
                    >
                      {initial(x.term)}
                    </span>
                  )}
                  <dt>
                    {x.term}
                    {x.also && <span className="glossary-also">{x.also}</span>}
                  </dt>
                  <dd>
                    <RichText text={x.definition} />
                    {x.link && (
                      <Link className="glossary-link" to={r.link(x.link.to)}>
                        {x.link.label}
                        <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

/** Every page of the site, grouped as in the navigation: a path for readers and for crawlers. */
export function SiteMapPage({ meta }: { meta: PageMeta }) {
  const editorial = useEditorial().index.filter(
    (r) => r.locale === meta.locale && r.status === "published" && !r.legacyId,
  );
  const catalog = useCatalog();
  const { knowledge, ui, copy } = catalog;
  const r = useRoutes();
  const g = knowledge.siteMap.groups;
  const seo = ui.seo;
  const groups: {
    title: string;
    links: { to: string; label: string; meta?: string }[];
  }[] = [
    {
      title: g.main,
      links: [
        { to: r.home, label: seo.home.label },
        { to: r.services, label: seo.services.label },
        { to: r.applications, label: seo.applications.label },
        { to: r.studies, label: seo.studies.label },
        { to: r.innovations, label: seo.innovations.label },
        { to: r.publications, label: seo.publications.label },
        { to: r.resources, label: seo.resources.label },
        ...catalog.services
          .filter((s) => s.id === "materiel")
          .map((s) => ({ to: r.service(s.id), label: s.title })),
        { to: r.contact, label: copy.labels.quote },
      ],
    },
    {
      title: g.services,
      links: listedExpertises(catalog.services).map((s) => ({
        to: r.service(s.id),
        label: s.title,
        meta: s.short,
      })),
    },
    {
      title: g.applications,
      links: catalog.applications.map((s) => ({
        to: r.application(s.id),
        label: s.title,
      })),
    },
    {
      title: g.studies,
      links: [
        ...catalog.studies.map((s) => ({ to: r.study(s.id), label: s.title })),
        ...catalog.works.map((w) => ({
          to: r.work(w.id),
          label: w.title,
          meta: w.category,
        })),
        ...catalog.innovations.map((s) => ({
          to: r.innovation(s.id),
          label: s.title,
        })),
      ],
    },
    {
      title: g.research,
      links: catalog.research.publications.map((p) => ({
        to: r.publication(p.id),
        label: p.seoTitle,
        meta: `${p.journal}, ${p.year}`,
      })),
    },
    {
      title: g.company,
      links: [
        { to: r.about, label: seo.about.label },
        { to: r.team, label: seo.team.label },
        ...catalog.people
          .filter((p) => p.slug)
          .map((p) => ({ to: r.person(p.id), label: p.name, meta: p.title })),
        { to: r.partners, label: seo.partners.label },
      ],
    },
    {
      title: g.resources,
      links: [
        ...catalog.resources.map((s) => ({
          to: r.resource(s.id),
          label: s.title,
        })),
        { to: r.faq, label: seo.faq.label },
        { to: r.glossary, label: seo.glossary.label },
      ],
    },
    {
      title: g.legal,
      links: [
        { to: r.legal, label: seo.legal.label },
        { to: r.privacy, label: seo.privacy.label },
        { to: r.terms, label: seo.terms.label },
      ],
    },
  ];
  for (const row of editorial) {
    if (row.kind === "page") continue;
    const title =
      row.kind === "service"
        ? g.services
        : row.kind === "application"
          ? g.applications
          : row.kind === "study"
            ? g.studies
            : row.kind === "publication"
              ? g.research
              : g.resources;
    groups
      .find((group) => group.title === title)
      ?.links.push({ to: row.path, label: row.title, meta: row.category });
  }
  return (
    <>
      <PageHero
        meta={meta}
        eyebrow={knowledge.siteMap.eyebrow}
        title={knowledge.siteMap.title}
        intro={knowledge.siteMap.intro}
      />
      <section className="section-space site-map">
        <div className="container site-map-grid">
          {groups.map((group, gi) => (
            <Reveal
              key={group.title}
              delay={(gi % 3) * 0.06}
              className="site-map-group"
            >
              <h2>{group.title}</h2>
              <ul>
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to}>{link.label}</Link>
                    {link.meta && <span>{link.meta}</span>}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
