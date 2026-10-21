// The site for language models (https://llmstxt.org): llms.txt, a short index with the key facts
// and a link to each page; llms-full.txt, the whole content as Markdown. Both are written from
// the same catalogues as the pages, so they say exactly what the site says.

const clean = (text = '') => text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
const plain = (text = '') => clean(text).replace(/\*/g, '');

export function buildLlms({ catalogs, pages, company }) {
  const url = (locale, kind, id) => {
    const page = pages.find(
      (p) => p.locale === locale && p.kind === kind && (id === undefined || p.id === id),
    );
    return page ? company.origin + page.path : company.origin;
  };
  const words = {
    fr: {
      facts: 'L’essentiel',
      location: 'Implantation',
      registry: 'Entreprise',
      registryText: (c) =>
        `LDgenX SAS, créée le 1er mai 2023, SIREN ${c.siren} · Label Deep Tech (Bpifrance) · agréée au titre du crédit d’impôt recherche (CIR)`,
      team: 'Équipe',
      contact: 'Contact',
      languages: 'Langues',
      services: 'Expertises',
      applications: 'Applications',
      studies: 'Études de cas et travaux',
      publications: 'Publications de l’équipe',
      resources: 'Ressources',
      company: 'L’entreprise',
      species: 'Espèces pour lesquelles LDgenX dispose d’amorces et de sondes (dPCR)',
      kits: 'Kits d’échantillonnage',
      equipment: 'Matériel de filtration',
      full: 'Texte intégral du site (français et anglais)',
      approaches: 'Approches',
      prestations: 'Prestations',
      uses: 'Champs d’application',
      cases: 'Cas d’études',
      needs: 'Questions traitées',
      examples: 'Exemples de projets',
      deliverables: 'Livrables',
      question: 'Question',
      approach: 'Approche',
      finding: 'Ce que l’article apporte',
      limit: 'Limites',
      result: 'Résultat',
      context: 'Contexte',
      authors: 'Auteurs',
      summary: 'Synthèse',
      faq: 'Questions fréquentes',
      glossary: 'Glossaire',
      orcid: 'ORCID',
    },
    en: {
      facts: 'Key facts',
      location: 'Location',
      registry: 'Company',
      registryText: (c) =>
        `LDgenX SAS, founded on 1 May 2023, SIREN ${c.siren} · Deep Tech label (Bpifrance) · approved for the French research tax credit (CIR)`,
      team: 'Team',
      contact: 'Contact',
      languages: 'Languages',
      services: 'Services',
      applications: 'Applications',
      studies: 'Case studies and scientific work',
      publications: 'Publications by the team',
      resources: 'Resources',
      company: 'The company',
      species: 'Species for which LDgenX holds primers and probes (dPCR)',
      kits: 'Sampling kits',
      equipment: 'Filtration equipment',
      full: 'Full text of the site (French and English)',
      approaches: 'Approaches',
      prestations: 'Services provided',
      uses: 'Fields of application',
      cases: 'Case studies',
      needs: 'Questions addressed',
      examples: 'Example projects',
      deliverables: 'Deliverables',
      question: 'Question',
      approach: 'Approach',
      finding: 'What the article shows',
      limit: 'Limits',
      result: 'Result',
      context: 'Context',
      authors: 'Authors',
      summary: 'Summary',
      faq: 'Frequently asked questions',
      glossary: 'Glossary',
      orcid: 'ORCID',
    },
  };

  const facts = (locale) => {
    const c = catalogs[locale];
    const w = words[locale];
    return [
      `- ${w.location}: ${company.site}, ${company.street}, ${company.postalCode} ${company.locality} (Hérault, Occitanie, France)`,
      `- ${w.registry}: ${w.registryText(company)}`,
      `- ${w.team}: ${c.people.map((p) => `${p.name} (${p.role})`).join('; ')}`,
      `- ${w.contact}: ${company.email} · ${url(locale, 'contact')}`,
      `- ${w.languages}: ${company.origin}/ (français), ${company.origin}/en (English)`,
    ].join('\n');
  };

  const index = (locale) => {
    const c = catalogs[locale];
    const w = words[locale];
    const list = (items) => items.join('\n');
    return [
      `## ${w.services}`,
      list(
        c.services.map((s) => `- [${s.title}](${url(locale, 'service', s.id)}): ${plain(s.scope)}`),
      ),
      `\n## ${w.applications}`,
      list(
        c.applications.map(
          (s) => `- [${s.title}](${url(locale, 'application', s.id)}): ${plain(s.scope)}`,
        ),
      ),
      `\n## ${w.studies}`,
      list([
        ...c.studies.map(
          (s) => `- [${plain(s.title)}](${url(locale, 'study', s.id)}): ${plain(s.subtitle)}`,
        ),
        ...c.works.map((x) => `- [${x.title}](${url(locale, 'work', x.id)}): ${plain(x.summary)}`),
        ...c.innovations.map(
          (x) => `- [${x.title}](${url(locale, 'innovation', x.id)}): ${plain(x.intro)}`,
        ),
      ]),
      `\n## ${w.publications}`,
      list(
        c.research.publications.map(
          (p) =>
            `- [${p.seoTitle}](${url(locale, 'publication', p.id)}): ${p.journal}, ${p.year}. https://doi.org/${p.doi}`,
        ),
      ),
      `\n## ${w.company}`,
      list([
        `- [${c.ui.seo.about.label}](${url(locale, 'about')})`,
        `- [${c.ui.seo.team.label}](${url(locale, 'team')})`,
        ...c.people
          .filter((p) => p.slug)
          .map((p) => `- [${p.name}](${url(locale, 'person', p.id)}): ${p.role}`),
        `- [${c.ui.seo.partners.label}](${url(locale, 'partners')})`,
      ]),
      `\n## ${w.resources}`,
      list([
        `- [${w.faq}](${url(locale, 'faq')})`,
        `- [${w.glossary}](${url(locale, 'glossary')})`,
        ...c.resources.map(
          (x) => `- [${plain(x.title)}](${url(locale, 'article', x.id)}): ${plain(x.intro)}`,
        ),
      ]),
    ].join('\n');
  };

  const llmsTxt = [
    '# LDgenX',
    '',
    `> ${catalogs.fr.ui.seo.home.description} ${catalogs.fr.ui.seo.llms.summary}`,
    '',
    facts('fr'),
    '',
    index('fr'),
    '',
    '## English',
    '',
    `> ${catalogs.en.ui.seo.home.description}`,
    '',
    index('en'),
    '',
    '## Optional',
    `- [${words.fr.full}](${company.origin}/llms-full.txt)`,
    '',
  ].join('\n');

  const full = (locale) => {
    const c = catalogs[locale];
    const w = words[locale];
    const out = [];
    const h = (level, text) => out.push(`\n${'#'.repeat(level)} ${plain(text)}\n`);
    const p = (text) => text && out.push(clean(text));
    const bullets = (items) =>
      items.length && out.push(items.map((x) => `- ${clean(x)}`).join('\n'));

    h(1, locale === 'fr' ? 'LDgenX — site en français' : 'LDgenX — English site');
    p(c.ui.seo.home.description);
    out.push(facts(locale));

    h(2, w.company);
    p(c.pageCopy.about.intro);
    p(c.companyStory.mission);
    p(c.companyStory.ambition);
    p(c.companyStory.deeptech);
    p(c.companyStory.status);
    h(3, c.cir.title);
    p(`${c.cir.text} ${c.cir.note}`);

    h(2, w.services);
    for (const s of c.services) {
      h(3, s.title);
      p(url(locale, 'service', s.id));
      p(`${plain(s.headline)} ${s.intro}`);
      p(s.need);
      out.push(`${w.approaches}:`);
      bullets(s.approaches.map((a) => `${a.title}: ${a.text}`));
      if (s.prestations.length) {
        out.push(`${w.prestations}:`);
        bullets(s.prestations);
      }
      out.push(`${w.uses}:`);
      bullets(s.uses);
      if (s.cases.length) {
        out.push(`${w.cases}:`);
        bullets(s.cases.map((x) => x.title));
      }
      p(s.delivery);
      if (s.id === 'tests-adn-cibles') {
        out.push(`${w.species}:`);
        bullets(
          c.customAssay.targets.map(
            (x) => `${x.name} (${x.latin}), ${c.customAssay.catalog.groups[x.category]}`,
          ),
        );
        bullets(c.customAssay.steps.map((x) => `${x.title}: ${x.text}`));
        p(c.customAssay.quantNote);
      }
      if (s.id === 'materiel') {
        out.push(`${w.kits}:`);
        bullets(c.samplingKits.kits.map((k) => `${k.name}: ${k.text}`));
        out.push(`${w.equipment}:`);
        bullets(c.equipment.map((e) => `${e.name}: ${e.summary} ${e.specs.join(' ; ')}`));
      }
    }

    h(2, w.applications);
    for (const s of c.applications) {
      h(3, s.title);
      p(url(locale, 'application', s.id));
      p(`${plain(s.headline)} ${s.intro}`);
      out.push(`${w.needs}:`);
      bullets(s.needs.map((n) => `${n.title} ${n.text}`));
      if (s.uses.length) {
        out.push(`${w.uses}:`);
        bullets(s.uses);
      }
      if (s.examples.length) {
        out.push(`${w.examples}:`);
        bullets(s.examples);
      }
      if (s.approaches) bullets(s.approaches.map((a) => `${a.title}: ${a.text}`));
      if (s.deliverables) {
        out.push(`${w.deliverables}:`);
        bullets(s.deliverables);
      }
      if (s.erc) {
        p(c.erc.intro);
        bullets(c.erc.states.map((x) => `${x.moment}, ${x.label}: ${x.text}`));
        p(c.erc.caution);
        p(c.erc.role);
      }
      if (s.cir) p(`${c.cir.title} ${c.cir.text}`);
    }

    h(2, w.studies);
    for (const s of c.studies) {
      h(3, s.title);
      p(url(locale, 'study', s.id));
      p(s.subtitle);
      bullets(s.facts.map((f) => `${f.label}: ${f.value}`));
      p(`${w.context}: ${s.context}`);
      p(`${w.question}: ${s.question}`);
      p(`${w.approach}: ${s.approach}`);
      if (s.result) p(`${w.result}: ${s.result}`);
      if (s.details) {
        const d = s.details;
        out.push(`${d.regionsTitle}:`);
        bullets(d.regions.map((x) => `${x.name}: ${x.value}`));
        out.push(`${d.funnelTitle}:`);
        bullets(d.funnel.map((x) => `${x.value} ${x.label}`));
        out.push(`${d.findingsTitle}:`);
        bullets(d.findings);
        p(`${d.perspectiveTitle}: ${d.perspective}`);
        bullets(d.roles);
        bullets(d.documents.map((x) => `${x.label} (${x.meta}): ${x.url}`));
      }
      if (s.id === c.featuredStudy.slug) {
        bullets(c.featuredStudy.steps.map((x) => `${x.title}: ${x.text}`));
        p(c.featuredStudy.outcome);
      }
    }
    for (const x of c.works) {
      h(3, x.title);
      p(url(locale, 'work', x.id));
      for (const section of x.sections) {
        h(4, section.title);
        section.paragraphs.forEach(p);
      }
    }
    for (const x of c.innovations) {
      h(3, x.title);
      p(url(locale, 'innovation', x.id));
      p(`${x.headline} ${x.intro} ${x.body}`);
    }

    h(2, w.team);
    for (const person of c.people) {
      h(3, person.name);
      if (person.slug) p(url(locale, 'person', person.id));
      p(person.role);
      person.biography.forEach(p);
      if (person.orcid) p(`${w.orcid}: https://orcid.org/${person.orcid}`);
    }

    h(2, w.publications);
    for (const x of c.research.publications) {
      h(3, x.readingTitle);
      p(url(locale, 'publication', x.id));
      if (plain(x.readingTitle) !== x.title) p(x.title);
      p(
        `${w.authors}: ${x.authors.join(', ')}. ${x.journal}, ${x.year}, ${x.issue}. https://doi.org/${x.doi}`,
      );
      p(`${w.summary}: ${x.summary}`);
      bullets([
        `${w.question}: ${x.question}`,
        `${w.approach}: ${x.approach}`,
        `${w.finding}: ${x.finding}`,
        `${w.limit}: ${x.limit}`,
      ]);
    }

    h(2, w.faq);
    for (const group of c.knowledge.faq.groups)
      for (const item of group.items) {
        h(3, item.question);
        p(item.answer);
      }

    h(2, w.glossary);
    bullets(
      c.knowledge.glossary.terms.map(
        (x) => `${x.term}${x.also ? ` (${x.also})` : ''}: ${x.definition}`,
      ),
    );

    h(2, w.resources);
    for (const x of c.resources) {
      h(3, x.title);
      p(url(locale, 'article', x.id));
      p(x.intro);
      for (const section of x.sections) p(`${section.title}. ${section.text}`);
    }
    return out.join('\n\n').replace(/\n{3,}/g, '\n\n');
  };

  return { llmsTxt, llmsFull: `${full('fr')}\n\n---\n\n${full('en')}\n` };
}
