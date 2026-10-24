# LDgenX — SEO & GEO base (21 October 2026)

What is built into the site so that search engines (Google, Bing, Qwant, DuckDuckGo) and AI assistants (ChatGPT, Claude, Perplexity, Gemini, Copilot, Mistral Le Chat) find, understand and cite LDgenX. Then what has to happen outside the code (launch steps, backlinks, content), and the rules to keep when the backend and admin panel arrive.

## 1. What the site now does

**Pages: 147 (143 indexable, French + English).** New this round:

| Page type | Count | Why it matters |
|---|---|---|
| One page per publication (`/recherche/<article>`, `/en/research/<article>`) | 27 × 2 | Each article can rank for its topic and be cited by AI assistants: faithful French title, summary, question, approach, findings, limits, DOI, authors linked to team profiles, `ScholarlyArticle` structured data. Before, articles were only a dialog on one page. |
| Targeted DNA tests (`/services/tests-adn-cibles`) | 2 | Captures "détection espèce ADN", "test ADN espèce", "dPCR ADNe", and every species name: the 22 species are in the page text and in structured data as taxa (common + Latin names). |
| Lapwing case study (`/etudes-de-cas/genomique-vanneau-huppe`) | 2 | A real, data-rich case study (HAL report, 438 birds, 40,746 SNPs), with the client named (Fédération nationale des chasseurs). |
| FAQ (`/faq`) | 2 | 15 answered questions, `FAQPage` structured data. The format AI assistants quote most. |
| Glossary (`/glossaire`) | 2 | 26 defined terms (ADNe, dPCR, qPCR, SNP, GWAS, CIR…), `DefinedTermSet`: definitional queries and AI answers. |
| HTML site map (`/plan-du-site`) | 2 | A crawl path to every page, for people and bots. |
| Dr Damien Crestel profile | 2 | Author entity with ORCID, linked to his 6 articles. |

**Technical base** (generated at every build, checked by `npm run check:seo`):

- **Rendering.** Every page is complete HTML before JavaScript (prerendered). Bots never depend on scripts.
- **Head.** One `h1` per page, unique titles (≤ 70 characters) and descriptions (≤ 170), canonical URL, `hreflang` fr/en plus `x-default`, and `max-image-preview:large` so Google can show large images, rich snippets and AI overviews.
- **Social cards.** A 1200 × 630 JPEG card for every shared picture (LinkedIn, Facebook, WhatsApp, X), plus `og:locale:alternate`.
- **Sitemaps.** `/sitemap.xml` is an index of 5 sitemaps (pages, expertises, études, recherche, ressources):
  - 143 URLs and about 470 images, each URL with its language versions;
  - each URL has a *real* `lastmod`: `data/lastmod.json` keeps a content hash per page, and the date changes only when the content changes;
  - Google ignores `lastmod` on sites that always say "today".
- **robots.txt.** Open to all, with an explicit `Allow` for 22 search and AI crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended, Applebot-Extended, MistralAI-User, Bingbot, Qwantbot…). This also protects against a host's "block AI bots" default.
- **llms.txt and llms-full.txt.** The [llms.txt](https://llmstxt.org) convention:
  - `llms.txt` (21 KB) gives key facts and a link to every page;
  - `llms-full.txt` (≈190 KB) holds the whole site content as Markdown, French then English;
  - both are generated from the same data as the pages, and kept out of Google results with `X-Robots-Tag: noindex` in `_headers`.
- **Structured data: one connected graph per page.**
  - `Organization` + `ProfessionalService` with:
    - legal name, SIREN 952 193 837 and founding date 1 May 2023 (public registry);
    - address and GPS coordinates of the Ifremer station (OpenStreetMap);
    - founders and employees, contact point and area served;
    - the Deep Tech label, `knowsAbout` and the catalogue of services.
  - `Person` (with ORCID) for the team.
  - `Service`, plus `Taxon` list on the dPCR page.
  - `ScholarlyArticle` with `alternativeHeadline` (French title), DOI and authors.
  - `Article` for case studies, with the client as funder.
  - `ResearchProject`, `FAQPage`, `DefinedTermSet`, `BreadcrumbList`.
  - Page types `ProfilePage`, `CollectionPage`, `AboutPage`, `ContactPage`, `ItemPage`, with `dateModified`.
- **IndexNow.** Key file `/86cc2638fcd11cbeedcfed21379e0459.txt`. `node scripts/indexnow.mjs --changed` notifies Bing, which also feeds ChatGPT search and Copilot, plus Yandex, Seznam and Naver, after each deployment.
- **Verification slots.** `company.verification` in `src/content/site.ts` takes the Google Search Console and Bing Webmaster codes when you have them.
- **Checks.** `npm run check:seo` verifies, on every built page:
  - titles, descriptions and the single `h1`;
  - canonicals and hreflang reciprocity;
  - sharing pictures, structured data and alternative text;
  - internal links (≈11,800), and that sitemaps list exactly the indexable pages.

  It currently reports 0 errors. Run it before every deployment, together with `check:html`.

**GEO, meaning being chosen by AI assistants:**

- **A clear entity.** The same name, address, people and facts everywhere: pages, structured data, llms.txt. The registry facts are machine-readable.
- **Answer-shaped content.** FAQ, glossary, "question / approach / finding / limits" on every publication, and a factual list of species and methods.
- **Citations.** DOIs, the HAL report, ENA accessions, the Water Agency documents: assistants favour sources that cite sources.
- **Freshness.** Real `lastmod` and `dateModified`, IndexNow pings, and the publication watcher.

## 2. Keyword map (French first)

| Page | Main queries |
|---|---|
| Home | génomique appliquée, analyses ADN environnement, LDgenX |
| ADN environnemental | ADN environnemental, analyse ADNe, laboratoire ADNe, métabarcoding, inventaire biodiversité ADN |
| Tests ADN ciblés | test ADN espèce, détection espèce ADN eau, dPCR ADNe, PCR digitale espèce, ADNe vison d'Europe, ADN thon rouge, requins ADNe, tortue caouanne ADN |
| Génomique des populations | génomique des populations, génétique de la conservation, diversité génétique population, panel SNP, 3D-GBS |
| Communautés microbiennes | analyse microbiome, séquençage 16S ITS, métagénomique sol eau |
| Sélection génomique | sélection génomique aquaculture, panel SNP sélection, GWAS |
| Bioinformatique | prestataire bioinformatique, analyse données séquençage, analyse métabarcoding |
| Séquençage & dPCR | séquençage amplicons, séquençage Nanopore, génotypage |
| Matériel | kit prélèvement ADNe, pompe filtration ADN environnemental |
| Études environnementales | ADNe état initial, étude d'impact ADN, séquence ERC biodiversité |
| Énergies renouvelables | suivi biodiversité éolien en mer ADNe |
| Recherche publique & privée | prestataire R&D agréé CIR génomique, sous-traitance R&D CIR |
| Lapwing study | vanneau huppé génétique, populations vanneaux France |
| Publications | each article's topic (e.g. résistance nodavirose bar, introgression bar européen) |
| FAQ / Glossary | "qu'est-ce que l'ADN environnemental", "différence métabarcoding dPCR", definitions |

Local: Palavas-les-Flots, Montpellier, Hérault, Occitanie appear in the about and contact pages, the FAQ and the structured data. Don't create "ADNe + city" pages: Google treats near-identical local pages as doorway spam.

## 3. Launch checklist (in order)

1. **Legal pages:** done (24 October 2026): registered office in Fabrègues, NAF code 72.11Z, publication director Maeva Leitwein (president), host Cloudflare.
2. **Host**:
   - serve `https://www.ldgenx.fr` with `ldgenx.fr` → 301 → `www`;
   - point `ldgenx.com` here (its old addresses are already redirected by `_redirects`);
   - turn **off** any "block AI crawlers" option (Cloudflare has one);
   - keep `_headers` and `_redirects`.
3. **Deploy**, then open a few pages and `/sitemap.xml`, `/robots.txt` and `/llms.txt` in a browser.
4. **Google Search Console**:
   - add a *Domain* property (DNS record);
   - submit `https://www.ldgenx.fr/sitemap.xml`;
   - request indexing of the home, Tests ADN ciblés, ADN environnemental and Recherche pages.
5. **Bing Webmaster Tools**: import from Search Console, submit the sitemap, then run `node scripts/indexnow.mjs`. This also covers ChatGPT search and Copilot, which use Bing.
6. **Google Business Profile**:
   - create "LDgenX" at the Station Ifremer address, with categories close to research and biotechnology;
   - link to the site and add real photos.

   Then do the same in **Apple Business Connect** and **Bing Places**. This is the main lever for "Montpellier / Occitanie" searches.
7. **Profiles that link back** (each is a strong, legitimate backlink and an entity signal for AI assistants):
   - the LinkedIn company page;
   - the team's ORCID records (add the website link);
   - Google Scholar profiles with LDgenX as affiliation;
   - an HAL structure page for LDgenX;
   - ResearchGate.
8. **Wikidata.** Create an item for LDgenX (company, founded 2023, SIREN, website, founders) once a couple of independent sources mention it. The Water Agency article and partner pages count. Don't write a Wikipedia article yourselves.

## 4. Backlinks: what works, what to avoid

Rankings in a small niche depend on a few strong, relevant links far more than on many weak ones. **Buying links, link farms, private blog networks or mass directory submissions break Google's spam policies.** They can get the domain demoted, and they don't influence AI assistants. The plan below only uses links LDgenX can legitimately earn.

**Priority 1: organisations that already work with LDgenX** (listed on the partners page). Ask each one for a link on their partner, portfolio, laureate or project page:

- **Supports:** Bpifrance (Deep Tech), Créalia Occitanie, Pôle Mer Méditerranée, INRAE Start and Grow, Initium, Agrovallée, Incubateur 1.618, Celimer, Pépite Deeptech, Montpellier Business School.
- **Clients and partners:**
  - Agence de l'eau Artois-Picardie: ask for a link from its study article to the case study page;
  - Fédération nationale des chasseurs: the lapwing study;
  - Biotope, Qualyse, Groupe Barba, Université de Corse, EPHE, Line Up Ocean, Plastic at Sea, Pays de l'Ours – ADET.
- **Research ecosystem:** Ifremer (the Palavas station hosts LDgenX), MARBEC, INRAE, Université de Montpellier.

**Priority 2: events and trade bodies.**

- Exhibitor pages: BlueTechShow and future trade shows.
- Regional innovation directories: AD'OCC (Occitanie innovation agency), French Tech Méditerranée, the Bpifrance Deep Tech map.
- Professional networks of environmental consultancies, which are LDgenX's clients for ERC studies.

**Priority 3: content others want to cite.**

- The publication pages and the glossary are cite-worthy.
- A clear guide such as "ADN environnemental : comment ça marche" earns links from students, associations and journalists.
- Data from case studies (with client permission) is the strongest link magnet.
- **Local press:** Midi Libre, Objectif LR, La Tribune Occitanie. Pitch real news: the CIR approval, a new species test, a published study, the team's new articles.

**Outreach email (French, to adapt):**

> Objet : Lien vers LDgenX sur votre page partenaires
>
> Bonjour [Prénom],
>
> LDgenX, entreprise de génomique appliquée implantée à la station Ifremer de Palavas-les-Flots, a [été accompagnée par / réalisé une étude pour] [organisation] en [année]. Notre nouveau site présente ce travail : [URL de la page précise].
>
> Serait-il possible d'ajouter un lien vers notre site sur votre page [partenaires / lauréats / projet] ([URL]) ? Nous citons [organisation] sur notre page partenaires.
>
> Bien cordialement,
> [Signature]

## 5. Content plan (what keeps rankings growing)

- **Monthly.** One new piece:
  - a case study (with the client's permission and figures);
  - a guide answering a real question:
    - "ADNe ou inventaire classique : que choisir ?";
    - "dPCR ou qPCR pour détecter une espèce ?";
    - "Comment prélever de l'eau pour l'ADN environnemental";
    - "ADNe et séquence ERC";
    - "La sélection génomique en aquaculture";
  - or news (events, approvals, publications).
- **New publications.** Run `node scripts/check-publications.mjs` (OpenAlex, by ORCID). This round it found 6 articles by Maeva and Emilie missing from the site; they are now added. Each new article still needs a faithful French title and a reviewed summary.
- **Photos.** Real photos of the team, lab and field work (with captions and alt text) rank in Google Images and strengthen trust.

## 6. Rules for the backend and admin panel

The SEO base survives the backend only if these stay true:

1. **Pages stay pre-rendered or server-rendered.** The admin panel edits content, then a build or SSR produces complete HTML. Never load page content client-side only.
2. **One source of truth.** Pages, sitemaps, structured data, llms files and social cards are generated from the same content model (`src/content/types.ts` shows the shapes). The admin panel should write that model, not a parallel copy.
3. **Publishing triggers:** rebuild, `npm run check:seo` (block publishing on errors), then `node scripts/indexnow.mjs --changed`.
4. **Changing a slug creates a 301 redirect** (the redirect table is in `src/lib/pages.ts`; make it data). Never break an indexed URL.
5. **Keep `data/lastmod.json` behaviour.** A date changes only when content changes.
6. **Images:** each upload gets alternative text in both languages, a credit and licence field, WebP variants and a social card (`scripts/make-social-images.mjs` shows the layout).
7. **Preview and staging environments must send `noindex`**, so they never compete with the real site.
8. **AI-assisted publication entries:** the admin panel can query OpenAlex like `check-publications.mjs`, then have an AI draft the French title and summary from the abstract, for a scientist to validate before publishing. Never publish unreviewed AI summaries of scientific work.

## 7. Measuring

- Google Search Console and Bing Webmaster Tools: impressions, clicks and positions per query and page.
- Privacy-friendly analytics if wanted (Plausible or Matomo, which changes the privacy page).
- Brand checks every quarter: ask ChatGPT, Perplexity, Claude and Gemini "Qui fait des analyses d'ADN environnemental en Occitanie ?" or "Laboratoire dPCR détection espèce France" and note whether LDgenX is cited.

## 8. Realistic expectations

No one can guarantee first place in Google or in an AI answer. What is in our control is now done: a technically clean, fast, bilingual, fully described site with more expert content than most competitors.

- **Brand searches** ("LDgenX") should rank first within days of indexing.
- **Niche and long-tail queries** (a species and dPCR, lapwing genetics, CIR genomics provider, publication topics) can rank within weeks to a few months, because competition is low.
- **Broad queries** ("ADN environnemental", "analyse ADNe") are contested by established players and public bodies. For example, SPYGEN is a long-established French eDNA laboratory. Ranking there depends on the backlinks and content of sections 4 and 5, over months.
