# LDgenX — content and pre-production review, 26 October 2026

**The content audit and local production checks are complete. Full launch approval remains on hold for the client terms of sale and email-dependent portal journeys.** The new website has not been published. This report supersedes earlier launch-status notes; those remain as history.

## What was reviewed and corrected

The French and English catalogues cover nine services, six application sectors, six case studies, three scientific write-ups, three resource articles, 28 research publications, four team members, equipment, FAQ, glossary, legal/privacy pages and interface text. The text inventory contains 3,451 distinct source strings; the French/English spelling pass checked prose, and scientific names, original English publication titles/captions and proper names were reviewed separately from dictionary flags.

[The correction log](preprod-2026-10-26/corrections.json) records 84 changes to factual claims, scientific explanations, grammar and privacy metadata. In particular:

- The 12,204-SNP trout reference resource is distinguished from the **192-SNP panel** tested on 1,862 fish from five rivers. Mapped trout/brook-trout marker counts and the 611-fish/24-population dataset are corrected.
- Fis near zero is described as no marked heterozygote deficit in the analysed groups. It does not establish panmixia or identify each lapwing's breeding origin.
- WGS, long-read sequencing, qPCR, dPCR, GWAS and heritability explanations now state their scope and limitations. Unsupported exhaustive-detection and sensitivity guarantees are removed.
- Genomic selection no longer inherits a 12.5%-per-generation figure that the source attributes to selective breeding more generally. Acute laboratory heat-stress results are distinguished from field heatwave observations.
- CIR wording makes eligibility conditional on the work, expenditure and company. The mainland 30%/5% thresholds are stated with a direct link to the [official conditions](https://entreprendre.service-public.gouv.fr/vosdroits/F23533); approval of a provider does not make every invoice eligible.
- Estuary **26 taxa refers to pooled short-read results**; the long-read subset reports 14 taxa, including 12 shared and two additional taxa. The site totals for short reads are Bègles 6, Cadillac 11 and Le Verdon 17. Associations with turbidity are not presented as isolated causal proof.
- The estuary commissioner follows the name on the supplied report cover, **Thibault Dindart**. The unsupported institutional commission and fieldwork attribution are removed. The report does not establish those additional roles.
- The privacy metadata now describes actual use of the website and contact with the team rather than the old email-draft-only form.

All 28 DOI records were checked against publisher-deposited Crossref metadata: title, journal, publication year, author count and order. The two language catalogues preserve the same original titles, author lists and DOI values. Abstracts were checked through Europe PMC for 25 indexed papers and through publisher/Crossref sources for the other three. This is a source-consistency audit, not an independent scientific peer review of the underlying papers. Evidence: [bibliography.json](preprod-2026-10-26/bibliography.json).

The 17 reproduced publication figures retain their original captions and author citations, with direct CC BY 4.0 licence links. The media regression check now distinguishes these scholarly attributions from retired decorative image credits. Original wording and typographical imperfections inside quoted captions or raster report figures are preserved as source material.

## Source documents and unresolved dates

- **Lapwings:** the [HAL report and original PDF](https://hal.science/hal-05490664) confirm 479 muscle samples collected in 2018–2023, 438 retained individuals and 40,746 unlinked SNPs. The nine regional counts total 476, with three samples lacking regional information. The report's brief introductory mention of 480 is not used in place of its detailed methods count.
- **Pyrenean bears:** the supplied 36-page report supports the historical 2024 estimate of 104 bears (97–123), 13 microsatellites, 2,475 simulated genealogies, the tested introduction scenarios and the recommendation of 30 bears over ten years with approximately 70% females. These are attributed historical observations/model projections, not a new 2026 census or guaranteed outcomes.
- **Artois-Picardie:** the [Water Agency article](https://www.eau-artois-picardie.fr/etude-de-la-biodiversite-de-lichtyofaune-dans-les-estuaires-et-les-ports-avec-ladn-environnemental), final report and restitution material support the eight sites, marker-specific taxa and reported analysis values. Methods and results from different markers are kept distinct.
- **Gironde estuary:** the supplied 24-page file is titled “ADNe Estuaire 2025”, with a supplied filename identifying a 6 March 2026 report and 30 June 2026 erratum, while its methods mention sampling in October 2026 and receipt in November 2026. **The documents do not establish two campaigns.** Following the owner's request to follow the files, the website says “October campaign” without assigning a sampling year. LDgenX can supply an internally consistent date later. The report file itself has not been altered.
- **Taxonomy:** the 22 client-confirmed assay targets are preserved. In particular, the confirmed scientific target *Neomys anomalus* is not silently replaced by another taxon on the basis of changing common-name usage.
- **Company identity:** the [official company register](https://recherche-entreprises.api.gouv.fr/search?q=952193837) confirms active LDGENX, SIREN 952193837, NAF 72.11Z, creation on 1 May 2023, the Fabrègues registered office and Maeva Leitwein as president. The laboratory address in Palavas-les-Flots remains distinct from the registered office. Evidence: [company-register.json](preprod-2026-10-26/company-register.json).

## Confirmations received

On 26 October the owner confirmed the approvals requested for the generated team portraits, permission to publish the supplied reports/case studies and UNIMA photograph, and the stated maximum three-year retention of messages after the last exchange. These are no longer pending approval items. This records the owner's confirmation; it does not purport to independently inspect permission contracts.

Both historical booking destinations still present LDgenX meetings: Cal.com offers a 15-minute discovery meeting; Axonaut describes a 30-minute video meeting. The normal build uses the new internal Supabase booking flow. The public-only fallback remains Cal.com, consistent with its 15-minute wording. No test appointment was made on either external service.

## Checks and results

| Check | Result |
| --- | --- |
| TypeScript and production build | Passed; 153 prerendered public pages, plus separate portal application |
| ESLint, HTML, SEO, French typography | Passed |
| Internal destinations, assets, headings, canonicals, social metadata | Passed generated-output checks |
| HTTP preview | 153 routes, 95 redirects and a true 404 passed |
| Public Chrome sweep | 153 routes × 320/1440 px = **306 checks**, zero detected horizontal overflows, broken images, JavaScript errors or production-CSP violations |
| Bilingual content | Matching entity IDs/list lengths, quantitative parity and publication metadata; case-study totals passed |
| Assays | 22 source and 22 published targets, no duplicate scientific targets |
| Media | Nine retired visuals absent; social images present; scientific licence links retained |
| External destinations | 74 checked/reconciled; no detected 404/410. One Wiley destination returned HTTP 403 and remains unverified by this automated request; its DOI metadata is verified |
| Browser credential patterns | No management-token/secret-key patterns detected; earlier full backend credential scan also passed |
| Supabase regression evidence | Earlier same-day checks: eight domain/security tests, 76 live API/RLS/Storage/concurrency assertions and client/admin browser journeys passed; [backend QA](qa-2026-10-26/README.md) |

Representative screenshots of the corrected estuary, SNP publication and CIR block are in `preprod-2026-10-26/`.

Detailed output: [public browser results](preprod-2026-10-26/public-browser-results.json), [external links](preprod-2026-10-26/external-links.json). The browser sweep checks rendered structure and runtime failures; it is not a guarantee of perfect appearance on every device. Reduced-motion rendering was used for the all-route sweep; the earlier portal/animation QA is documented separately.

## Remaining launch decisions and work

### 1. Client terms of sale

The supplied CGV PDF contains real spelling/agreement errors and substantive ambiguities. Clause 7.5 mixes late-payment rules and starts an indemnity from a quote date; clause 8.3 appears to reverse who receives damages; clause 11 cites the former force-majeure article 1148 instead of current article 1218. The source was explicitly supplied as the client contract to reproduce, so these clauses have not been silently rewritten.

[CGV-REVIEW.md](preprod-2026-10-26/CGV-REVIEW.md) provides the exact clause issues, editorial corrections, official legal references and concrete proposed replacements for 7.5 and 11. LDgenX must validate an updated contract, including the intended meaning of 8.3, before replacing the published source. The audit does not legally validate the remaining contract terms.

### 2. Email and live Auth configuration

Email was deferred at the owner's request. A read-only live check on 26 October found **no custom SMTP provider**, and `mailer_autoconfirm: true`: signup email addresses are currently automatically confirmed. This differs from the setup script's `false` setting and the earlier backend notes. This audit has not changed the live authentication settings or sent emails.

The in-portal messages, public contact submissions and appointment records work independently of email. Delivery of verification messages, invitations, password-reset messages, appointment replies and notifications has **not** been accepted for production. Before enabling those customer journeys, configure the chosen email provider, restore the intended verification setting and test receipt and links from the production domain. Google sign-in remains a separate later task, as requested.

### 3. Publication and production smoke check

No Cloudflare deployment or domain/DNS change was performed. After the final build is published, check the actual `https://www.ldgenx.fr` host, TLS, apex/canonical redirects, security headers, sitemap, robots, old-address redirects and production portal callbacks/contact/booking. Local checks simulate the generated CSP but cannot certify the hosting provider's live behavior.

## Reproduce the checks

After `npm run build`, run `npm run lint`, `npm run check:html`, `npm run check:seo`, `npm run check:typography`, `npm run check:assays`, `npm run check:content` and `npm run check:media`. With `npm run preview` serving port 4173, run `npm run check:http` and `npm run check:launch-browser`. `npm run check:external-links` requires network access. `npm run audit:publications` validates the current catalogue against the saved publisher evidence; append `-- --refresh` to fetch fresh Crossref records.

Private source extracts and temporary spelling data are ignored by Git. Reports, credentials and administrator setup links are not included in the public build.
