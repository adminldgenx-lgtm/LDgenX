# LDgenX — pre-production review (21 October 2026)

**Historical report.** Current findings, completed corrections and launch requirements: [26 October review](PRE-PROD-REVIEW-2026-10-26.md). Portrait, report/case-study, UNIMA and message-retention approvals have since been confirmed.

Scope: all 140 built pages (FR + EN), read from the actual rendered output, plus the source content files. Build, lint, typecheck, typography, assay and HTML checks all pass. The hero video stays as it is.

**Verdict: not ready to go public yet.** The code is ready. What blocks is (A) legal pages that still say "draft", (B) an event banner that expires today, (C) three AI-generated team portraits that nobody has approved, and (D) the copy: across the site it reads like a third party describing LDgenX with sources, not like LDgenX speaking to a client. Your feeling about the text is right; the details are below.

Each item has an ID. Reply with the IDs you approve (e.g. "A1–A3, C1 option B, D all"), and I'll do everything approved in one pass.

---

## A. Blockers (must be fixed before publishing)

| ID | Problem | Where | What's needed |
|---|---|---|---|
| A1 | The legal notice says, on the public page: *"Cette version de travail doit être complétée, avant sa publication, par l'identité du responsable de publication et les coordonnées de l'hébergeur…"*. A French legal notice must name the publication director, the host and the registered address. | /mentions-legales, /en/legal-notice | **From client:** publication director's name, registered office address, phone, host name + address. I'll write the final page. |
| A2 | The privacy page says *"cette version du site"* and *"doivent être confirmées par LDgenX avant la publication de la politique définitive"*. | /politique-confidentialite, /en/privacy-policy | **From client:** how long they keep emails and quote requests. I'll write the final text. |
| A3 | Banner: *"BlueTechShow : retrouvez LDgenX les 20 et 21 octobre à Canet-en-Roussillon"*. The event ends today. | Homepage hero (FR + EN) | Remove it (or replace it with the next event, if the client has one). |
| A4 | The portraits of Maeva, Emilie and Maxime are **ChatGPT studio portraits** generated from their real photos. Each person was supposed to approve them, and that hasn't happened. Given the client's "authenticity" rule, this is the same issue as the equipment images. Damien's portrait is a real photo, so the team section mixes styles. | Homepage, /a-propos, /a-propos/equipe, profile pages | **Choose:** (a) each person approves their portrait, or (b) switch all four to real photos (the originals are in `images/official/`, web resolution), or (c) the client sends new real portraits. I recommend (b) now and (c) later. |
| A5 | Terms of sale (CGV): reproduced word for word from ldgenx.fr, with errors in the legal text itself ("Tribunal compétant", "le bureau d'étude bureau d'études", "Donnée génomique… fournis", "ne saura être tenu", references to article 1148 of the Code civil, which is now article 1218). The page also says *"Texte reproduit tel que publié sur ldgenx.fr"*, which makes no sense once this site *is* ldgenx.fr. | /cgvs/cgvs | I'll remove the "reproduit" sentence. The legal wording itself should be corrected by the client (ideally their legal adviser); I won't change a contract on my own. |

## B. The hero (first screen)

The title **« Éclairer vos décisions avec l'ADN »** and the intro sentence came from the client's 15 October feedback (via GPT's prompt), so the title is the client's choice. Everything around it is weak:

| ID | Current | Problem | Proposal |
|---|---|---|---|
| B1 | Intro: *« Des analyses ADN à l'interprétation des résultats, nous accompagnons vos projets environnementaux. »* | Repeats "ADN" from the title; flat structure; and **"projets environnementaux" excludes half the business** (aquaculture, agriculture, genomic selection, research). | Three options; pick one: **(a)** « Biodiversité, populations, sélection : nous concevons l'étude, analysons l'ADN et traduisons les résultats en décisions. » **(b)** « Du prélèvement sur le terrain au rapport d'aide à la décision, une équipe de scientifiques vous accompagne sur toute la chaîne génomique. » **(c)** « ADN environnemental, génomique des populations, bioinformatique : des données fiables pour gérer, préserver et sélectionner le vivant. » (takes up the mission wording on /a-propos) |
| B2 | Stat: *« +10 ans — d'expérience pour notre équipe scientifique »* | "pour" is wrong here. | « +10 ans — d'expérience scientifique dans l'équipe » |
| B3 | Stat: *« De A à Z — du prélèvement à l'aide à la décision »* | "De A à Z" then "du… à…" again: two "from–to" in a row; it sounds informal. | « Toute la chaîne — du prélèvement à l'aide à la décision » |
| B4 | Stat: *« Deep Tech — entreprise labellisée par Bpifrance »* | OK, but the site spells it three ways: "Deep Tech", "DeepTech", "Deeptech". | « Label Deep Tech — attribué par Bpifrance », and "Deep Tech" everywhere (except the official name "Pépite Deeptech"). |
| B5 | Eyebrow: *« ADN environnemental · Génomique · Bioinformatique »* | Fine with B1 (a) or (b). With (c) it would repeat the intro. | With (c): « Génomique appliquée · Station Ifremer de Palavas » |

The same corrections will be mirrored in English ("Informing your decisions with DNA").

## C. The main problem with the text: LDgenX doesn't speak, it is described

To respect the "no invented facts" rule, a lot of text was written as **traceability notes**: it tells the reader where each piece of information comes from. That was useful during the build, but on the live site it reads like an external auditor talking about LDgenX, and once the site *is* ldgenx.fr, "as published on ldgenx.fr" makes no sense.

| ID | Examples (verbatim) | Where | Proposal |
|---|---|---|---|
| C1 | « Les études présentées par LDgenX » · « les organisations présentées par LDgenX » · « Les relations présentées par LDgenX » · « Des études et des champs d'application présentés dans les références publiques de LDgenX. Chaque sujet est relié à sa source. » | Homepage, /etudes-de-cas, /a-propos/partenaires | Speak in the first person: « Nos études », « Ils nous font confiance », « Des questions concrètes, traitées avec nos partenaires. » |
| C2 | « Page d'origine sur ldgenx.fr » · « Présentation d'origine de cette expertise » · « Source : présentation scientifique LDgenX » · « Prix hors taxes, tels que publiés sur ldgenx.fr » · « ils sont repris de ldgenx.fr avec leurs figures et leurs références » | All 9 expertise pages, the 3 research write-ups (conservation, traceability, selection), the 3 resources, profiles, equipment | Remove these links and mentions. Keep **real** external sources (DOIs, the Water Agency report, the ERC ministry page). |
| C3 | « LDgenX présente un inventaire des communautés microbiennes sur les microplastiques parmi ses cas d'étude. » · « La biodiversité des parcs éoliens offshore est citée parmi les cas d'étude de la page officielle consacrée à l'ADNe. » · « Cette présentation s'appuie sur le sujet cité par LDgenX. Les résultats détaillés ne sont pas publiés dans la source consultée. » | Offshore-wind and microplastics case studies | See D1: these two pages are empty shells. |
| C4 | « Références vérifiées sur les articles publiés : titre, revue, année et DOI. » · « Un lien vers une expertise indique un champ commun ; il ne signifie pas que l'article a mobilisé toutes ses techniques. » · « ce ne sont pas des prestations réalisées pour des clients » · the whole « À ne pas confondre — Publications, projets R&D et études de cas » block | /recherche, profiles, expertise pages | Remove these. Distinguishing publications from client work is already clear from the page structure. |
| C5 | « Ce projet relève de la recherche et du développement. Les objectifs présentés ne constituent pas une promesse de résultat ou une performance commerciale annoncée. » | DNA EcoTrace | Shorter and positive: « Projet de R&D en cours, soutenu par Bpifrance et Créalia Occitanie. » |
| C6 | Mentions légales: « Les illustrations générées pour ce site ne constituent pas un reportage photographique… » | /mentions-legales | Keep a short accurate line (depends on A4 and E2). |

**What stays:** honest scientific caveats that help the client. For example: « L'ADNe révèle la présence d'ADN… il ne remplace pas à lui seul les inventaires naturalistes », « La dPCR estime une quantité d'ADN cible… elle ne compte pas les individus », and the role of LDgenX in the ERC sequence. Those are good and professional.

## D. Repetitive and template-like copy

| ID | Problem | Proposal |
|---|---|---|
| D1 | **Two case studies have no content.** Offshore wind and microplastics: one question, one empty "approach", no result, plus disclaimers. They sit next to the very rich Artois-Picardie study, which makes them look worse. | **Client:** send 5–10 lines + 1 real photo for each (context, what was sampled, what was learned). **Until then:** remove the two pages and keep them as short "other topics" mentions on the eDNA expertise page. |
| D2 | **The same 7 headings on every expertise page:** « La bonne approche commence par votre question. » · « Des outils choisis pour leur sens. » · « Ce que nous prenons en charge. » · « Des analyses reliées à vos enjeux. » · « Des questions déjà explorées. » · « La génomique sur votre terrain. » · « Aller plus loin, ensemble. » A visitor who reads two expertise pages sees the same text twice. | Write a specific heading per page, e.g. for Bioinformatique: « Des données brutes à la réponse biologique. »; for Population genomics: « Diversité, structure, connectivité : ce que disent les génomes. » I'll write all 9. |
| D3 | **Same on every application page:** « Votre contexte guide la démarche. » · « La génomique au service de votre problématique. » · « Référence LDgenX » (an odd label above a list) · « Vos questions de terrain » (even for public research, which has no "terrain"). | Page-specific headings; replace « Référence LDgenX » by « Ce que nous traitons ». |
| D4 | **The Artois-Picardie study (fish in ports) is the "concrete example" on all 6 application pages.** It's irrelevant to Agriculture, Aquaculture, Renewable energy and Public research. | Show it only on Biodiversity and Environmental studies. Elsewhere, show the matching research write-up (selection → aquaculture/agri, publications → research) or nothing. |
| D5 | The equipment page uses the generic headings where they don't fit: « Des outils choisis pour leur sens » above « Votre milieu / Votre question / Votre campagne » (these aren't tools); « Des analyses reliées à vos enjeux » (the page sells equipment, not analyses); « Nos prestations » repeats the 3 devices listed just above. | Rewrite the page's sections: « Préparer votre campagne », remove the duplicated list. |
| D6 | Homepage process: step 1 « Conception scientifique » is labelled « Sur le terrain », but it happens before the field work. | « En amont » for step 1. |
| D7 | Contact: « poser vos questions à une experte fondatrice du projet » (it's a company, not a project) · « Un simple échange peut être le point de départ d'une belle collaboration. » (cliché) · checkbox « J'ai lu la politique de confidentialité. Je souhaite préparer un message à l'équipe LDgenX. » (awkward). Two different titles for the same booking: « Réserver un échange » / « Prenez un rendez-vous ». | Tighter wording; one name for the booking. |
| D8 | /recherche: « Trois sujets pour entrer » (literally "three subjects to enter"). | « Trois articles pour commencer » |

## E. Language, consistency and small errors

| ID | Problem | Fix |
|---|---|---|
| E1 | Partners page in the feminine plural, written when the team was the two founders: « où nous avons été **formées** » · « Nous sommes **soutenues et accompagnées** ». The team now includes Maxime and Damien. | « …où l'équipe s'est formée » · « Ils nous soutiennent et nous accompagnent » |
| E2 | Anglicisms and mixed terms: « Digital PCR » in a French list (ADNe and Séquençage pages) · « Design d'amorces » · « Préparation des **librairies** » while the homepage says « banques de séquençage » · « Analyses de diversités ». | « PCR digitale (dPCR) » · « Conception d'amorces » · « Préparation des banques » · « Analyses de diversité » |
| E3 | Literal asterisks shown on the page: « Détection des oursins \*Paracentrotus lividus\* » (FR and EN). | Render the name in italics. |
| E4 | English summary of the Artois-Picardie study uses French spacing: « Sample : », « Currents : », « Client : » (7 places, screen-reader/no-JS version). | English punctuation. |
| E5 | Damien Crestel did a doctorate (his bio says so) but has no « Dr » while Maeva and Emilie do. Maxime and Damien have no profile page. | **Client:** confirm "Dr Damien Crestel". |

## F. Scientific write-ups: needs the scientists' sign-off

These three pages (conservation, traceability, genomic selection) are copied from the current ldgenx.fr. They contain errors that a scientific reader will notice. I can correct the French; Maeva or Emilie must confirm the science.

| ID | Text | Problem |
|---|---|---|
| F1 | « Publications : Delpuech et al. 2022, Aliakbari et al., Griot et al. 2021 » and figure « Delpuech et al. (2022), bioRxiv » | The /recherche page lists it as **2023, Genetics Selection Evolution** (the published version). Aliakbari has no year (2020). → « Delpuech et al. 2023, Aliakbari et al. 2020, Griot et al. 2021 », with the figure credited to the published article. |
| F2 | « nous avons pu identifier deux gènes d'intérêt, **dont** ZDHHC14 et IFI6 » | "dont" means "among which"; with two genes → « deux gènes d'intérêt, ZDHHC14 et IFI6 ». « une avancée considérable dans le domaine » is self-praise; suggest removing. |
| F3 | « …la précision ne pourra qu'augmenter pour des caractères (Figure 3). » | The sentence is cut off, and "ne pourra qu'augmenter" is a stronger claim than the article makes. Suggest: « …la précision peut être améliorée (Figure 3). » |
| F4 | Under "beneficial effects": « Les allèles domestiques apportent (i) de la diversité… et (ii) des allèles récessifs potentiellement délétères. » | Point (ii) is not beneficial: it contradicts the heading. Maeva should rephrase. |

## G. Technical and other open points (not blocking unless stated)

| ID | Point |
|---|---|
| G1 | **Hosting:** the `_redirects` file format depends on the host (Netlify or Cloudflare Pages). The host chosen is also needed for A1. |
| G2 | **Booking link:** the site uses `cal.com/ldgenx-echange/decouverte`; the old site also had an Axonaut booking page. Client should confirm which one is live. |
| G3 | Header overflows by about 29 px on 320 px-wide phones (very small, older devices). I can fix it. |
| G4 | Mobile Lighthouse performance is 87–89 (desktop is fine). Acceptable for launch. |
| G5 | No analytics on the site (privacy page says so). If the client wants visit statistics, it changes the privacy page (A2). |
| G6 | Remaining AI images with no equipment: `interpretation` (map and pencil, /services) and `ednaclock` (fish). Fine under the current rule; replace if the client wants a fully photographic site. |
| G7 | Pending client inputs from earlier rounds: target species for the "Neomys anomalus" test (hidden for now), real photos of the sequencing platform and the other equipment slots, HD originals, image rights. |
| G8 | English version: same structure, so every FR change above will be mirrored. I'll reread the English after the French is settled. |

---

## What I need from you

1. **Your decisions** by ID: hero option B1 (a/b/c), portraits A4 (a/b/c), case studies D1 (remove now or wait).
2. **From the client:** A1 legal details, A2 data retention, D1 case-study content (or OK to remove), E5 "Dr", F1–F4 sign-off, G1 host, G2 booking link.

Once I have them, I do the whole copy pass (A3, A5, B, C, D, E, and F once confirmed) in French and English, re-run every check, and the site is ready to publish. Nothing has been committed or published.

---

## Applied on 21 October 2026

You asked me to choose and apply the best options, and to leave the legal pages for later.

| ID | Decision |
|---|---|
| A1, A2, A5 (legal wording) | **Left for later**, as asked. The CGV text itself is untouched; only the "reproduit tel que publié sur ldgenx.fr" line and the "Source · ldgenx.fr" link were removed (they are traceability notes, see C). The English CGV page says "Our terms of sale are published in French." |
| A3 | No change needed: the banner hides itself after 21 October (`news.until`). Build the production site from 22 October so the static pages no longer contain it. |
| A4 | **Option (b): real photos.** Maeva, Emilie and Maxime now use their photos from ldgenx.fr, cropped to 4:5, like Damien. The AI studio portraits are no longer used. |
| B1 | New intro: « Biodiversité, aquaculture, agriculture : nous concevons l'étude, analysons vos échantillons et vous aidons à interpréter les résultats. » (EN: "Biodiversity, aquaculture, agriculture: we design the study, analyse your samples and help you interpret the results.") The client's title is kept. |
| B2–B5 | « d'expérience scientifique dans l'équipe » · « Toute la chaîne » · « label attribué par Bpifrance » · "Deep Tech" spelled the same everywhere (except the official name "Pépite Deeptech"). Eyebrow unchanged. |
| C1–C5 | All traceability notes removed or rewritten in LDgenX's voice: no more "présenté par LDgenX", "Page d'origine sur ldgenx.fr", "Présentation d'origine", "Source : présentation scientifique", "Références vérifiées", "texte intégral non consulté", "À ne pas confondre". External sources (DOIs, Water Agency documents, ERC ministry page) are kept. |
| D1 | **Kept, not removed.** Removing the two thin case studies would have left "Études de cas" with a single study, and the client lists them as theirs. They are rewritten in LDgenX's voice with general method text only (no invented results). The disclaimer is replaced by an invitation: « Un projet comparable ? … ». The client should still send real content for both. |
| D2, D3 | Each expertise page and each application page now has its own section headings (FR + EN). The shared defaults remain only where a page has nothing specific. |
| D4 | Artois-Picardie now appears only on Biodiversity and Environmental studies; Renewable energy shows the offshore-wind study; the other application pages show no unrelated study. |
| D5 | Equipment page: headings fitted to equipment, duplicated list removed, new closing line. |
| D6–D8 | « En amont » for step 1 · contact wording tightened, one name « Réserver un échange » · « Trois articles pour commencer ». |
| E1–E4 | Done (gender agreement, anglicisms, italic Latin name, English colons). |
| E5 | **Not changed:** "Dr" for Damien Crestel still needs the client's confirmation. |
| F1–F4 | Done, consistent with the published articles: Delpuech et al. 2023 / Aliakbari et al. 2020; "deux gènes, ZDHHC14 et IFI6"; IFI6 described as the article does ("strong candidate gene"); precision "peut être améliorée pour certains caractères" (matches the Aliakbari summary on /recherche); (ii) « le masquage d'allèles récessifs potentiellement délétères » (associative overdominance, Leitwein et al. 2021). **Maeva and Emilie should still reread F3–F4.** |
| G3 | See the QA results below. |
| Extra | Team cards: the "Expertise" and "Biographie" links no longer run into each other. |

### QA after the changes (21 October 2026)

- `lint`, `typecheck`, `check:typography`, `check:assays`, `build`, `check:html`: all pass.
- `check-http`: 81 pages, 60 redirects (301) and the 404 respond correctly.
- Browser sweep of every built page (FR + EN) at 320, 390 (reduced motion), 768 and 1440 px: no broken image, no console error, no failed request. The only overflow was at 320 px, caused by the footer links (not the header): they now wrap. Re-run at 320 px: no overflow left.
- Image provenance: no AI image showing equipment or lab material is left. Remaining AI images show no equipment: `interpretation` (map, /services) and `ednaclock` (fish). The hero video is kept as decided.

---

## Applied on 23 October 2026 (client's e-mail)

| ID | Status |
|---|---|
| A1 | **Mostly done.** Host OVH, NAF code 72.11Z (was 7112B), registered office in Fabrègues. Only the publication director's name is missing: one field, `ui.legal.director`. |
| A4 | **Reversed, at your request:** Maeva, Emilie and Maxime use the studio portraits again; Damien keeps his real photo. Each person still has to approve their portrait; Maeva will send a new one. |
| A5 | The CGV now follow the PDF the client sent (clauses 5.3 and 9.2 changed). |
| D1 | Settled: microplastics says LDgenX did the sequencing only; offshore wind is marked "Étude en cours". Two new studies from the client's reports: Pyrenean brown bears, eDNA in turbid estuaries. |
| E5 | Confirmed: "Dr Damien Crestel"; Maxime Lambert is not a doctor. |
| G1 | The host is OVH. If the site is deployed on OVH web hosting (Apache), `_redirects` and `_headers` are ignored: the 301 redirects, the client-area rewrites and the `noindex` headers then need an `.htaccess`. |
| G7 | *Neomys anomalus* confirmed: 22 species published. The blurred mink is replaced by a licensed European mink photo. |
| New | Homepage shortened after « Des questions concrètes. Des approches scientifiques. ». Publications keep their original titles (no French translation). Maxime's publications: waiting for the list at the bottom of the client's e-mail. |

---

## Applied on 24 October 2026 (ready to go live)

| ID | Status |
|---|---|
| A1 | **Done.** Publication director: Maeva Leitwein, président of the SAS (company register). Host: Cloudflare (the site goes on Cloudflare Pages). |
| G1 | **Replaced:** hosting is Cloudflare Pages, which reads `_redirects` and `_headers` directly. Pages are written as flat files (`/page`, no trailing slash), so URLs match the canonical ones; strict security headers (CSP, HSTS, no framing). The client area is left out of the production build until its backend exists. README has the setup. |
| Credits | Every licence credit is removed from pictures, the map and the 3D model. They are all listed under « Crédits » in the legal notice (footer link). The map keeps « © OpenStreetMap », which its licence requires on the map itself. |
| Motion | Three levels instead of "no animation at all" for people whose system asks for reduced motion: fades instead of movements, film and scenes kept. A footer switch turns everything off for anyone, and the hero film has a pause button. |
| D1 | The two new studies now have their own photos (brown bear; Gironde estuary from the air), a bar chart from the report's figures, and the report's figures themselves. |
| Panels | The case-study panels go on rows of up to three, so that six studies keep readable titles at every width. |
| Open | Privacy: confirm the three-year retention of messages. Maxime's publications: still waiting for the list. Ask for the original exports of report figures 4 and S3 (the PDF holds low-resolution copies). |

### QA (24 October 2026)

- `lint`, `typecheck`, `check:typography`, `check:assays`, `build`, `check:html` (151 pages), `check:seo` (0 errors, 3 known warnings), media check, `check-http` (151 pages, 94 redirects, 404): all pass. `npm audit`: 0 vulnerabilities.
- Every built page (243 with the redirect stubs) loaded under the production CSP: no violation, no client error. 320 px sweep: no overflow.
- Case-study panel titles checked closed and open at 1024, 1180, 1280, 1440 and 1920 px: none cut, none overflowing.

---

## Second round, 24 October 2026

| ID | Status |
|---|---|
| Credits | **None left on the site.** The four pictures that required one are replaced by public-domain or CC0 pictures (mink, brown bear, Gironde estuary from the ISS, CDC biofilm); the 3D DNA model is replaced by a helix generated by `scripts/build-dna-particles.mjs`; the « Crédits » section and footer link are gone. The study map keeps the OpenStreetMap attribution its licence requires, folded into an ⓘ button after five seconds. The legal notice keeps one sentence on AI-made content (EU AI Act transparency). |
| Motion | **Two levels.** Full by default; reduced when the system asks or the visitor chooses it in the footer. Reduced keeps the film, scenes, map and counters, with fades instead of movements. There is no frozen mode any more. |
| Maxime | His EMBO Journal article (October 2026, affiliated with LDgenX) is on the research page. Older Xylella papers by a Maxime Lambert at CBGP are not added: the identity is uncertain. |
| SEO | Three page titles shortened: `check:seo` reports 0 errors, 0 warnings. |
| Open | UNIMA: confirm no credit is required for the shrimp photo. Privacy: confirm the three-year retention. Maxime's full list. Original exports of report figures 4 and S3. |

