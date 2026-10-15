// English catalogue: same shape as fr.ts. Wording follows ldgenx.com where the page exists
// (services, applications, about, innovation, equipment, contact); the rest is translated
// from ldgenx.fr. Ids stay French so every page pairs with its French counterpart.
import type { Expertise, Sector } from './fr';
import { people } from './extra.en';

export { company } from './site';

export const copy = {
  navigation: {
    services: 'Services',
    applications: 'Applications',
    studies: 'Case studies',
    innovation: 'Innovation',
    research: 'Research',
    about: 'About us',
    resources: 'Resources',
    contact: 'Ask for a quote',
  },
  home: {
    eyebrow: 'Environmental DNA · Genomics · Bioinformatics',
    intro:
      'From DNA analyses to the interpretation of results, we support your environmental projects.',
    primary: 'Ask for a quote',
    secondary: 'Explore our services',
    // Each fact is published by LDgenX: ldgenx.com (home, about) and ldgenx.fr (partners, contact).
    facts: [
      { value: '10+ years', label: 'of experience for our scientific team' },
      { value: 'Deep Tech', label: 'company labelled by Bpifrance' },
      { value: 'End to end', label: 'from sampling to decision support' },
      { value: 'Station Ifremer', label: 'a team based in Palavas-les-Flots' },
    ],
    introductionTitle: 'From sample\nto decision.',
    introduction:
      'A sample holds far more than DNA. It carries information about species, populations and ecosystems. Our role: help you understand it and put it to use.',
    introductionBody:
      'LDgenX supports public and private organisations across the whole scientific chain. We bring molecular biology, sequencing and bioinformatics together around a single question: yours.',
    workflowTitle: 'One scientific chain.\nOne overall view.',
    workflowIntro:
      'Every step counts. Together we build a coherent approach, from the first question to the interpretation of the data.',
    servicesTitle: 'Understanding life,\nat every scale.',
    servicesIntro:
      'Complementary areas of expertise, brought together according to your scientific question and the specifics of your project.',
    applicationsTitle: 'Science comes into its own\nin the field.',
    applicationsIntro:
      'From natural ecosystems to production sectors, genomics sheds new light on your challenges.',
    studiesTitle: 'Concrete questions.\nScientific approaches.',
    innovationTitle: 'Exploring today.\nInforming tomorrow.',
    innovationIntro:
      'Where environmental DNA, sequencing and bioinformatics meet, we develop the biodiversity knowledge tools of tomorrow.',
    teamTitle: 'Science is also\na human story.',
    teamIntro:
      'Research backgrounds, complementary expertise and a shared drive: putting genomics at the service of life.',
    trustTitle: 'They work\nwith us.',
    trustIntro:
      'Public agencies, consultancies, companies, universities and research institutes: the organisations LDgenX presents.',
  },
  cta: {
    eyebrow: 'Let’s discuss your project',
    title: 'Your question.\nOur next starting point.',
    body: 'A project in biodiversity, genomics or bioinformatics? Describe your needs to receive a proposal, or book a first conversation with our scientific team.',
    button: 'Ask for a quote',
    appointment: 'Schedule a meeting',
  },
  labels: {
    allServices: 'All our services',
    allApplications: 'All sectors',
    allStudies: 'Explore the studies',
    team: 'Meet the team',
    innovation: 'Discover our R&D',
    source: 'View the source',
    learn: 'Discover this service',
    related: 'The services to bring in',
    back: 'Back',
    approach: 'Our approach',
    applications: 'Applications',
    deliverables: 'From analysis to interpretation',
    contact: 'Talk to a scientist',
    quote: 'Ask for a quote',
    appointment: 'Schedule a meeting',
    faq: 'Frequently asked questions',
  },
};

// Steps follow https://www.ldgenx.com/about-us and the value chain of ldgenx.fr/services.
export const workflow = [
  {
    title: 'Scientific project design',
    text: 'Your question is the starting point. Together we set the objectives and the approaches to bring in.',
    detail: 'Literature review, definition of objectives and indicators.',
    image: 'conception',
  },
  {
    title: 'Sampling strategy',
    text: 'Information starts in the field. The choice of matrices and the sampling strategy are designed for your question.',
    detail:
      'Water, soil, sediment or biofilms. Triple pump, StickPump and towed Yellow Submarine for filtering in the field.',
    image: 'terrain-prelevement',
  },
  {
    title: 'Molecular analyses',
    text: 'Molecular biology links your samples to the data.',
    detail: 'From nucleic acid extraction on complex matrices to sequencing library preparation.',
    image: 'equipe-maxime',
  },
  {
    title: 'Sequencing & dPCR',
    text: 'Amplicons, genomes or targeted detection: technologies are chosen according to the scientific objectives.',
    detail:
      'Long reads (Nanopore, PacBio) and short reads (Illumina, AVITI), targeted sequencing and microsatellites (qPCR, Sanger, KASP), digital PCR.',
    image: 'sequencage',
  },
  {
    title: 'Bioinformatics',
    text: 'Data are processed and analysed with bioinformatics approaches suited to your biological question.',
    detail:
      'Bioinformatics and biostatistics: metabarcoding, metagenomics, RAD-seq, RNA-seq, WGS, epigenetics, GWAS.',
    image: 'bioinformatique',
  },
  {
    title: 'Interpretation',
    text: 'We place the analyses back in their biological context and help you understand the results.',
    detail: 'Interpretation and reporting of the results in an expert report.',
    image: 'interpretation',
  },
  {
    title: 'Decision support',
    text: 'Scientific knowledge becomes actionable information for your management, conservation or innovation projects.',
    detail: 'Actionable results for decision-making.',
    image: 'decision',
  },
];

export const services: Expertise[] = [
  {
    id: 'adn-environnemental-adne',
    slug: 'environmental-dna-edna',
    title: 'Environmental DNA',
    short: 'Traces of life become a source of knowledge.',
    scope:
      'Detection and monitoring of species through the analysis of DNA traces present in the environment.',
    image: 'terrain-prelevement',
    headline: 'Monitor biodiversity using environmental DNA (eDNA).',
    intro:
      'Environmental DNA (eDNA) enables the detection and identification of species present in an ecosystem from water, soil, sediment or biofilm samples. LDgenX provides tailored eDNA solutions to support biodiversity monitoring, conservation and environmental impact assessments.',
    need: 'Do you need to survey a site, monitor a species or inform a management decision? The approach is built from your question, the environment studied and the biological groups you are interested in.',
    approaches: [
      {
        title: 'Metabarcoding',
        text: 'Biodiversity assessment using targeted genetic markers (e.g. 12S, COI, 18S, ITS).',
      },
      {
        title: 'Metagenomics',
        text: 'Comprehensive analysis of biological communities through untargeted sequencing.',
      },
      {
        title: 'Targeted dPCR',
        text: 'Ultra-sensitive detection and quantification of target species or pathogens using digital PCR (dPCR).',
      },
      {
        title: 'Long-read sequencing',
        text: 'Enhanced taxonomic resolution and expanded analytical capabilities through long-read sequencing technologies.',
      },
    ],
    uses: [
      'Biodiversity surveys',
      'Environmental impact assessments',
      'Invasive species detection',
      'Protected species monitoring',
    ],
    sectors: [
      'biodiversite-conservation',
      'environnement-bureaux-d-etudes',
      'energies-marines-renouvelables',
    ],
    delivery:
      'From sampling to bioinformatics, the analyses are tied to your objective. The reporting and the level of support are defined with the scientific team when the project is scoped.',
    prestations: [
      'Project design',
      'Primer design (if not available)',
      'DNA extraction',
      'Sequencing',
      'Bioinformatics analyses',
      'Statistical analyses',
      'Diversity analyses',
      'Decision-support report',
      'Digital PCR',
      'Mapping and visualisation',
    ],
    cases: [
      {
        title: 'Ichthyological survey for the Artois-Picardie Water Agency',
        image: 'carte-artois-picardie',
        link: { kind: 'study', id: 'ichtyofaune-artois-picardie' },
      },
      {
        title: 'Detection and monitoring of fish communities in turbid waters',
        image: 'terrain-prelevement',
      },
      {
        title: 'Baseline marine biodiversity assessment at a pilot site',
        image: 'terrain-palavas',
      },
      {
        title: 'Biodiversity monitoring of offshore wind farms',
        image: 'cas-eolien-offshore',
        link: { kind: 'study', id: 'biodiversite-eolien-offshore' },
      },
    ],
    source: 'https://www.ldgenx.com/services/environmental-dna-edna',
  },
  {
    id: 'genomique-des-populations',
    slug: 'population-genomics',
    title: 'Population genomics',
    short: 'Understanding diversity, connectivity and adaptation.',
    scope: 'Assessment of genetic diversity, population connectivity and local adaptation.',
    image: 'cas-vanneau',
    headline: 'Understanding genetic diversity to better manage and conserve populations.',
    intro:
      'Population genomics enables the characterisation of genetic diversity, population connectivity and adaptive potential to support effective conservation and management strategies. LDgenX develops tailored genomic approaches for biodiversity conservation, population management and scientific research.',
    need: 'How do populations differ? What exchanges connect them? How can their diversity be studied? Your management or research question determines the choice of genomic tools.',
    approaches: [
      {
        title: 'Reduced-representation sequencing · 3D-GBS',
        text: 'Genotyping thousands of genome-wide markers to assess genetic diversity, population structure and connectivity.',
      },
      {
        title: 'Whole-genome sequencing · WGS',
        text: 'Comprehensive genome analysis for variant discovery, adaptive genomics and evolutionary studies.',
      },
      {
        title: 'Custom SNP panels',
        text: 'Development of tailored SNP panels for genetic monitoring, individual assignment, parentage testing and conservation programmes.',
      },
      {
        title: 'Genetic marker discovery',
        text: 'Identification of SNPs, indels and other genetic variants tailored to the objectives of your project.',
      },
    ],
    uses: [
      'Conservation genetics',
      'Population management',
      'National Action Plans (NAPs)',
      'Inbreeding, hybridisation and individual assignment',
    ],
    sectors: ['biodiversite-conservation', 'aquaculture-peche', 'recherche-publique-privee'],
    delivery:
      'Interpretation brings the genetic data together with the context of the populations studied. The biological questions, the available samples and the field information guide the work.',
    prestations: [
      'DNA extraction',
      'Library preparation',
      'Sequencing',
      'Bioinformatics analyses',
      'Genetic marker discovery (SNP, indel)',
      'Decision-support report',
      'Genetic analyses (GWAS)',
      'Scientific support',
      'Project design',
    ],
    cases: [
      {
        title: 'Genetic diversity',
        image: 'cas-truites',
        link: { kind: 'work', id: 'conservation' },
      },
      { title: 'Genetic map', image: 'fig-puce-truite', link: { kind: 'work', id: 'tracabilite' } },
      {
        title: 'The northern lapwing',
        image: 'cas-vanneau',
        link: { kind: 'external', href: 'https://hal.science/hal-05490664' },
      },
    ],
    source: 'https://www.ldgenx.com/services/population-genomics',
  },
  {
    id: 'analyse-des-communautes-microbiennes',
    slug: 'microbial-community-analysis',
    title: 'Microbial communities',
    short: 'Exploring the diversity we cannot see.',
    scope:
      'Characterisation of bacterial, fungal and microbial communities using high-throughput sequencing technologies.',
    image: 'microbiologie',
    headline: 'Characterise the microbial diversity of your samples.',
    intro:
      'LDgenX supports projects investigating bacterial, fungal and other microbial communities, using high-throughput sequencing technologies to characterise their diversity, composition and functional potential.',
    need: 'The composition of a microbiome is a scientific question in its own right. The choice of approach depends on the organisms studied, the matrix and the level of characterisation sought.',
    approaches: [
      {
        title: '16S sequencing',
        text: 'Analysis of bacterial community diversity and composition.',
      },
      { title: 'ITS sequencing', text: 'Characterisation of fungal communities.' },
      {
        title: 'Microbial metabarcoding',
        text: 'Comprehensive assessment of microbial diversity using targeted genetic markers.',
      },
      {
        title: 'Metagenomics',
        text: 'In-depth taxonomic and functional analysis of microbial communities through untargeted sequencing.',
      },
    ],
    uses: ['Water quality assessment', 'Agricultural soil monitoring', 'Aquaculture', 'Research'],
    sectors: ['agriculture-agroecologie', 'aquaculture-peche', 'environnement-bureaux-d-etudes'],
    delivery:
      'The team supports project preparation, molecular analyses and bioinformatics interpretation. The biological question stays at the centre of how the data are read.',
    prestations: [
      'DNA extraction',
      'Library preparation',
      'Sequencing',
      'Bioinformatics analyses',
      'Statistical analyses',
      'Decision-support report',
    ],
    cases: [
      {
        title: 'Microbial community profiling on microplastics',
        image: 'cas-microplastiques',
        link: { kind: 'study', id: 'communautes-microplastiques' },
      },
    ],
    source: 'https://www.ldgenx.com/services/microbial-community-analysis',
  },
  {
    id: 'selection',
    slug: 'genomic-selection',
    title: 'Genomic selection',
    short: 'Bringing genetic information into your programmes.',
    scope: 'Development of genetic tools to support breeding and selection programmes.',
    image: 'cas-crevettes',
    headline: 'Accelerate breeding programmes with genomic tools.',
    intro:
      'LDgenX develops genomic tools that integrate genetic information into breeding programmes, supporting more accurate and efficient selection decisions, notably in aquaculture and agriculture.',
    need: 'Do you want to study a trait of interest, design a marker panel or structure a breeding programme? The approach must connect the biological question, the genetic data and the available phenotypic data.',
    approaches: [
      {
        title: 'Custom SNP panels',
        text: 'Developing genotyping tools aligned with the breeding objectives.',
      },
      { title: 'WGS', text: 'Using whole-genome sequencing to study variants.' },
      {
        title: 'GWAS',
        text: 'Studying associations between genetic markers and traits of interest.',
      },
      {
        title: 'Selection models',
        text: 'Analysing genetic and phenotypic data within breeding programmes.',
      },
    ],
    uses: [
      'Growth performance',
      'Disease resistance',
      'Robustness',
      'Marker-assisted selection',
      'Variety development',
    ],
    sectors: ['aquaculture-peche', 'agriculture-agroecologie', 'recherche-publique-privee'],
    delivery:
      'The project is built around the available data and the objectives of the sector. Tools and analyses are discussed with your team before they are put in place.',
    prestations: [
      'Genetic marker discovery (SNP, indel)',
      'SNP panel development',
      'Genetic analyses (GWAS)',
      'Genomic prediction models (BLUP)',
    ],
    cases: [
      {
        title: 'The European sea bass',
        image: 'cas-bar',
        link: { kind: 'work', id: 'selection-genomique' },
      },
      { title: 'Development of a SNP panel', image: 'cas-crevettes' },
    ],
    source: 'https://www.ldgenx.com/services/genomic-selection',
  },
  {
    id: 'bioinformatique',
    slug: 'bioinformatics',
    title: 'Bioinformatics',
    short: 'Bringing out the meaning of your genomic data.',
    scope: 'Analysis, processing and interpretation of genomic data.',
    image: 'bioinformatique',
    headline: 'Transform your sequencing data into actionable insights.',
    intro:
      'LDgenX provides tailored bioinformatics solutions for research, biodiversity and innovation projects. Processing, analysis and interpretation are built around your biological question.',
    need: 'Sequencing data do not answer a scientific question on their own. Choosing the right analyses and understanding the context are essential to turn them into usable information.',
    approaches: [
      {
        title: 'Diversity and communities',
        text: 'Analysis of metabarcoding and metagenomics data.',
      },
      { title: 'Genomics', text: 'Analysis of WGS, RAD-seq and long-read sequencing data.' },
      {
        title: 'Expression and epigenetics',
        text: 'Support for RNA-seq and epigenomic analyses.',
      },
      {
        title: 'Pipelines and GWAS',
        text: 'Development of dedicated pipelines and genome-wide association analyses.',
      },
    ],
    uses: [
      'Metabarcoding & metagenomics',
      'RAD-seq & RNA-seq',
      'Whole-genome sequencing (WGS)',
      'Epigenetics',
      'Genome-wide association studies (GWAS)',
    ],
    sectors: ['recherche-publique-privee', 'biodiversite-conservation', 'agriculture-agroecologie'],
    delivery:
      'Our team connects computational analyses with questions about living organisms. The scope, the input data and the reporting are agreed together.',
    prestations: [
      'Quality control',
      'Pipeline development',
      'Statistical analyses',
      'Diversity analyses',
      'Mapping and visualisation',
      'Reproducible analyses',
      'Data management',
      'Scientific support',
    ],
    cases: [],
    source: 'https://www.ldgenx.com/services/bioinformatics',
  },
  {
    id: 'sequencage-dpcr',
    slug: 'sequencing-dpcr',
    title: 'Sequencing & dPCR',
    short: 'Reading DNA. Detecting the targets that matter to you.',
    scope:
      'Amplicon sequencing, short- and long-read sequencing, and development and analysis of digital PCR (dPCR) assays.',
    image: 'equipe-maxime',
    headline: 'The technology suited to your scientific question.',
    intro:
      'Amplicon sequencing, long reads, whole genomes or species detection by dPCR: LDgenX supports your projects, from the design of specific primers and probes to the interpretation of results, including the quantification of a target species’ environmental DNA.',
    need: 'Amplicon sequencing, long reads or targeted detection: the choice of technology must be tied to the samples and to the information you are looking for.',
    approaches: [
      {
        title: 'Amplicon sequencing',
        text: '16S, ITS, COI, 12S, 18S and custom genetic markers.',
      },
      {
        title: 'Metagenomics',
        text: 'Taxonomic and functional analysis of biological communities.',
      },
      { title: 'Whole-genome sequencing · WGS', text: 'Comprehensive genome analysis.' },
      {
        title: 'RAD-seq & custom SNP panels',
        text: 'Population genomics and genotyping applications.',
      },
      {
        title: 'Long-read sequencing',
        text: 'Oxford Nanopore sequencing for long-read genomic analyses.',
      },
      {
        title: 'Digital PCR (dPCR)',
        text: 'Ultra-sensitive detection and quantification of target species, pathogens or genetic variants.',
      },
    ],
    uses: [
      'Amplicon sequencing',
      'Short- and long-read sequencing',
      'Whole and partial genome sequencing',
      'Target species and genetic variant detection',
    ],
    sectors: ['recherche-publique-privee', 'environnement-bureaux-d-etudes', 'aquaculture-peche'],
    delivery:
      'Support can link molecular biology, sequencing and bioinformatics. The approach and the reporting are defined from your objectives.',
    prestations: [
      'DNA extraction',
      'Library preparation',
      'Sequencing',
      'Primer design (if not available)',
      'Digital PCR',
      'Scientific support',
    ],
    cases: [
      { title: 'Epigenomics of Sparidae', image: 'cas-sar' },
      { title: 'Detection of iconic Mediterranean species using dPCR', image: 'cas-requin' },
      {
        title: 'Detection of the purple sea urchin (*Paracentrotus lividus*)',
        image: 'cas-oursin',
      },
    ],
    source: 'https://www.ldgenx.com/services/sequencing-dpcr',
    seo: {
      title: 'Sequencing and species detection by dPCR | LDgenX',
      description:
        'Amplicon and long-read sequencing, species detection by dPCR, quantification of environmental DNA, specific primers and probes: custom targeted DNA assays.',
    },
  },
  {
    id: 'recherche-developpement',
    slug: 'research-development',
    title: 'Research & Development',
    short: 'Building the scientific approaches of tomorrow.',
    scope:
      'Grant proposal support, scientific consulting, project support and guidance for your research.',
    image: 'dna-ecotrace',
    headline: 'Your question can open a new path.',
    intro:
      'Partner with LDgenX to accelerate your research and innovation projects. The team welcomes scientific, technical and industrial collaborations and develops new approaches combining environmental DNA, sequencing and bioinformatics.',
    need: 'A molecular development need, an open question or a collaborative project? A first conversation clarifies the question and the expertise to bring together.',
    approaches: [
      {
        title: 'Scientific design',
        text: 'Setting the objectives and exploring the relevant approaches.',
      },
      {
        title: 'Molecular development',
        text: 'Designing tools suited to a biological question.',
      },
      {
        title: 'Bioinformatics',
        text: 'Developing the analysis approaches specific to the project.',
      },
      {
        title: 'Collaboration',
        text: 'Bringing together complementary scientific and technical expertise.',
      },
    ],
    uses: [
      'Grant proposal support',
      'Scientific consulting',
      'Project support and guidance',
      'Genomic innovation',
    ],
    sectors: [
      'recherche-publique-privee',
      'biodiversite-conservation',
      'energies-marines-renouvelables',
    ],
    delivery:
      'Every R&D project starts with joint scoping. The development objectives, the steps and the terms of collaboration are defined with the project partners.',
    prestations: [
      'Grant proposal support',
      'Project support and guidance',
      'Scientific consulting',
    ],
    cases: [
      {
        title: 'DNA EcoTrace',
        image: 'dna-ecotrace',
        link: { kind: 'innovation', id: 'dna-ecotrace' },
      },
      { title: 'eDNAClock', image: 'ednaclock', link: { kind: 'innovation', id: 'edna-clock' } },
    ],
    source: 'https://www.ldgenx.com/about-us/innovation',
  },
  {
    id: 'materiel',
    slug: 'equipment',
    title: 'Sampling equipment',
    short: 'Preparing the ground for your analyses.',
    scope: 'Triple pump, StickPump and towed Yellow Submarine to filter water in the field.',
    image: 'materiel-pompe',
    headline: 'An analysis starts with a sample.',
    intro:
      'Triple pump, StickPump and Yellow Submarine: LDgenX offers the water filtration equipment used for environmental DNA, with its capsules and filters.',
    need: 'Before a campaign, share the environment studied, the objectives and the field constraints. This information helps discuss the equipment and the sampling strategy.',
    approaches: [
      { title: 'Your environment', text: 'Specify the matrices and the sampling conditions.' },
      { title: 'Your question', text: 'Link the field campaign to the planned analyses.' },
      {
        title: 'Your campaign',
        text: 'Discuss how sampling is organised with the scientific team.',
      },
    ],
    uses: ['Environmental DNA projects', 'Field sampling', 'Environmental monitoring'],
    sectors: ['environnement-bureaux-d-etudes', 'biodiversite-conservation'],
    delivery:
      'Prices are published excluding VAT on ldgenx.fr. A quote specifies the equipment suited to your environment, its availability and the terms of sale.',
    prestations: ['Triple pump', 'StickPump', 'Yellow Submarine', 'Capsules and filters'],
    cases: [],
    source: 'https://www.ldgenx.com/services/equipment',
  },
];

export const applications: Sector[] = [
  {
    id: 'biodiversite-conservation',
    slug: 'biodiversity-conservation',
    title: 'Biodiversity & Conservation',
    scope: 'Understanding populations and informing conservation action with genomic tools.',
    image: 'riviere',
    headline: 'Genomic tools for biodiversity conservation.',
    intro:
      'Conservation genomics, genetic diversity, population connectivity, species monitoring: LDgenX provides conservation managers, public authorities, associations and research teams with genetic data to understand populations and inform their conservation action.',
    needs: [
      {
        title: 'Monitoring species',
        text: 'Detection and monitoring of protected, threatened or invasive species, in line with conservation objectives.',
      },
      {
        title: 'Understanding populations',
        text: 'Population genetics: genetic diversity, inbreeding, hybridisation and connectivity between populations.',
      },
      {
        title: 'Supporting management',
        text: 'Genomic information for reintroduction and ecological restoration projects and National Action Plans.',
      },
    ],
    services: [
      'adn-environnemental-adne',
      'genomique-des-populations',
      'bioinformatique',
      'sequencage-dpcr',
    ],
    uses: [
      'Monitoring of threatened and protected species',
      'National Action Plans (NAPs)',
      'Assessment of genetic diversity',
      'Detection of inbreeding',
      'Hybridisation studies',
      'Ecological connectivity analyses',
      'Individual assignment and origin tracing',
      'Detection and monitoring of invasive species',
      'Reintroduction and ecological restoration programmes',
    ],
    examples: [
      'Assessment of genetic diversity and population structure',
      'Detection of hybridisation between populations and species',
      'Monitoring of threatened species',
    ],
    source: 'https://www.ldgenx.com/applications/biodiversity-conservation',
    seo: {
      title: 'Conservation genomics and species monitoring | LDgenX',
      description:
        'Genetic diversity, population genetics, connectivity and species monitoring: genomic tools to understand populations and guide conservation.',
    },
    related: {
      id: 'environnement-bureaux-d-etudes',
      text: 'Is your need a baseline survey, an impact assessment or the environmental monitoring of a project?',
    },
  },
  {
    id: 'aquaculture-peche',
    slug: 'aquaculture-fisheries',
    title: 'Aquaculture & Fisheries',
    scope: 'Genomic selection, stock management, product traceability, health surveillance.',
    image: 'aquaculture',
    headline: 'Optimising the management and performance of aquatic resources.',
    intro:
      'Genomic technologies provide new opportunities to improve the management of exploited populations, optimise breeding programmes and enhance the sustainability of aquaculture production. LDgenX supports producers, research organisations and fisheries managers.',
    needs: [
      {
        title: 'Structuring selection',
        text: 'Development of SNP panels and search for markers associated with traits of interest.',
      },
      {
        title: 'Managing populations',
        text: 'Genetic diversity of breeding stocks, broodstock management and inbreeding control.',
      },
      {
        title: 'Studying the environment',
        text: 'Aquatic microbiome, pathogen surveillance and management of fisheries resources.',
      },
    ],
    services: [
      'adn-environnemental-adne',
      'selection',
      'sequencage-dpcr',
      'genomique-des-populations',
      'bioinformatique',
    ],
    uses: [
      'Genomic selection',
      'Broodstock management',
      'Inbreeding monitoring',
      'Improvement of production traits',
      'Disease resistance',
      'Fisheries stock management',
      'Product traceability',
      'Health surveillance',
      'Aquatic microbiome studies',
    ],
    examples: [
      'Development of custom SNP panels for genomic selection',
      'Assessment of genetic diversity in breeding stocks',
      'Discovery of genetic markers associated with traits of interest',
      'Pathogen monitoring using dPCR',
    ],
    source: 'https://www.ldgenx.com/applications/aquaculture-fisheries',
  },
  {
    id: 'agriculture-agroecologie',
    slug: 'agriculture-agroecology',
    title: 'Agriculture & Agroecology',
    scope: 'Soil microbiomes, molecular markers, marker-assisted breeding.',
    image: 'agriculture',
    headline: 'Genomic solutions to support the ecological transition.',
    intro:
      'Genomic approaches provide powerful tools to better understand agricultural ecosystems, develop innovative breeding strategies and assess the environmental impact of human activities. LDgenX supports public and private stakeholders in these projects.',
    needs: [
      {
        title: 'Exploring soils',
        text: 'Microbiome analysis and environmental metagenomics to study agricultural ecosystems.',
      },
      {
        title: 'Developing breeding',
        text: 'Molecular markers, plant breeding and marker-assisted breeding programmes.',
      },
      {
        title: 'Monitoring biodiversity',
        text: 'Genomic approaches to understand environments and monitor agricultural biodiversity.',
      },
    ],
    services: [
      'adn-environnemental-adne',
      'sequencage-dpcr',
      'analyse-des-communautes-microbiennes',
      'bioinformatique',
    ],
    uses: [
      'Plant breeding and genetic improvement',
      'Development of molecular markers',
      'Soil microbiome analysis',
      'Agricultural biodiversity monitoring',
      'Soil health assessment',
      'Environmental metagenomics',
      'Candidate gene discovery',
      'Development of marker-assisted breeding programmes',
    ],
    examples: [
      'Analysis of agricultural soil microbiomes',
      'Development of targeted dPCR assays',
      'Development of genetic markers for breeding',
    ],
    source: 'https://www.ldgenx.com/applications/agriculture-agroecology',
  },
  {
    id: 'environnement-bureaux-d-etudes',
    slug: 'environment-consultancies',
    title: 'Environmental studies',
    scope:
      'Documenting biodiversity and supporting the environmental monitoring of your projects with DNA analyses.',
    image: 'terrain-palavas',
    headline: 'Documenting the biodiversity of your projects, from baseline to monitoring.',
    intro:
      'Local authorities, developers, environmental consultancies and project owners: environmental DNA provides non-invasive data for your biodiversity surveys, ecological baselines, impact assessments and biodiversity monitoring. LDgenX carries out the analyses and helps you interpret them in your process.',
    needs: [
      {
        title: 'Which species use the site?',
        text: 'eDNA biodiversity surveys in water, soil or sediment, to complement field surveys during a baseline study.',
      },
      {
        title: 'Is a protected or invasive species present?',
        text: 'Detection of species of interest, by metabarcoding or by a targeted DNA assay when the question concerns one precise species.',
      },
      {
        title: 'How is the environment changing?',
        text: 'Repeated sampling with the same protocol, to monitor biodiversity over time, during and after the works.',
      },
    ],
    services: [
      'adn-environnemental-adne',
      'analyse-des-communautes-microbiennes',
      'sequencage-dpcr',
      'bioinformatique',
      'materiel',
    ],
    uses: [
      'Environmental impact assessments',
      'Baseline environmental surveys',
      'Biodiversity monitoring',
      'Long-term environmental monitoring',
      'Detection of protected species',
      'Detection of invasive species',
      'Ecological compensation',
      'Land development projects',
      'Onshore and offshore renewable energy projects',
    ],
    examples: [
      'eDNA biodiversity surveys',
      'Early detection of invasive species',
      'Environmental monitoring',
      'Development of targeted dPCR assays for species monitoring',
    ],
    source: 'https://www.ldgenx.com/applications/environment-consultancies',
    seo: {
      title: 'eDNA for baseline surveys and impact assessments | LDgenX',
      description:
        'eDNA biodiversity surveys, ecological baselines, impact assessments and biodiversity monitoring: DNA analyses that document the mitigation hierarchy of your projects.',
    },
    approaches: [
      {
        title: 'Environmental DNA',
        text: 'DNA traces sampled from water, soil, sediment or biofilms, without capturing or disturbing the species.',
      },
      {
        title: 'Metabarcoding',
        text: 'A survey of many species at once, from targeted genetic markers (12S, COI, 18S, ITS…).',
      },
      {
        title: 'Targeted dPCR assays',
        text: 'Detection and quantification of the DNA of one precise species, with specific primers and a probe designed when needed.',
      },
      {
        title: 'Microbial communities',
        text: '16S or ITS sequencing to characterise the bacterial and fungal communities of an environment.',
      },
    ],
    deliverables: [
      'Design of the protocol and sampling strategy',
      'Filtration equipment and sampling support',
      'Molecular analyses, sequencing or dPCR',
      'Bioinformatics and statistical analyses',
      'Mapping and visualisation of the results',
      'Decision-support report, with the interpretation of the results',
    ],
    erc: true,
    related: {
      id: 'biodiversite-conservation',
      text: 'Is your question about the genetics of a species: diversity, connectivity, hybridisation or the management of a population?',
    },
  },
  {
    id: 'recherche-publique-privee',
    slug: 'public-private-research',
    title: 'Public & private research',
    scope: 'Scientific design, grant proposal support, project guidance.',
    image: 'recherche',
    headline: 'One scientific question. Expertise to bring together.',
    intro:
      'Does your project involve molecular biology, sequencing or genomic data analysis? LDgenX supports the design and implementation of suitable approaches.',
    needs: [
      {
        title: 'Designing an approach',
        text: 'Linking your scientific objectives to the analyses and the available data.',
      },
      {
        title: 'Analysing the data',
        text: 'Bioinformatics for WGS, RAD-seq, RNA-seq, metagenomics and epigenetics data.',
      },
      {
        title: 'Developing together',
        text: 'Scientific and technical collaborations around new applications of genomics.',
      },
    ],
    services: ['recherche-developpement', 'bioinformatique', 'sequencage-dpcr'],
    uses: [],
    examples: [],
    source: 'https://www.ldgenx.com/about-us/innovation',
  },
  {
    id: 'energies-marines-renouvelables',
    slug: 'renewable-energy',
    title: 'Renewable energy',
    scope:
      'Onshore wind, offshore wind and solar: documenting the biodiversity around your projects.',
    image: 'energies-renouvelables',
    headline: 'Knowing the biodiversity around your energy projects.',
    intro:
      'Onshore wind, offshore wind, solar: these projects come with a baseline survey and environmental monitoring. LDgenX DNA analyses contribute to biodiversity surveys and their monitoring, on land and at sea, in support of environmental studies.',
    needs: [
      {
        title: 'Building knowledge',
        text: 'Surveying by eDNA the biodiversity of the terrestrial, freshwater or marine environments concerned by the project.',
      },
      {
        title: 'Organising monitoring',
        text: 'Defining a monitoring question and a reproducible sampling strategy, from construction to operation.',
      },
      {
        title: 'Interpreting in context',
        text: 'Relating the analyses to the environmental issues of the site and to your studies.',
      },
    ],
    services: ['adn-environnemental-adne', 'sequencage-dpcr', 'bioinformatique', 'materiel'],
    uses: ['Onshore wind', 'Offshore wind', 'Solar'],
    examples: ['Biodiversity monitoring of offshore wind farms'],
    source: 'https://www.ldgenx.com/applications/environment-consultancies',
    seo: {
      title: 'Environmental DNA and renewable energy | LDgenX',
      description:
        'Onshore wind, offshore wind, solar: biodiversity surveys and monitoring by environmental DNA, on land and at sea.',
    },
    related: {
      id: 'environnement-bureaux-d-etudes',
      text: 'Baseline surveys, impact assessments and the mitigation hierarchy (avoid, reduce, offset) are detailed in Environmental studies.',
    },
  },
];

export const studies = [
  {
    id: 'ichtyofaune-artois-picardie',
    slug: 'artois-picardie-fish-survey',
    title: 'Reading the biodiversity of ports and estuaries.',
    category: 'Environmental DNA',
    image: 'carte-artois-picardie',
    imageAlt: 'Map of the sampled sites along the coast, from Dunkirk to the Somme estuary',
    subtitle: 'A fish survey for the Artois-Picardie Water Agency.',
    facts: [
      { label: 'Client', value: 'Artois-Picardie Water Agency' },
      { label: 'Carried out by', value: 'Qualyse, LDgenX and Prelevmar consortium' },
      { label: 'Environments', value: 'Ports and estuaries of the coastline' },
      { label: 'Approach', value: 'Environmental DNA from water samples' },
    ],
    context:
      'In 2025, the Artois-Picardie Water Agency commissioned a study of fish biodiversity in the ports and estuaries of its coastline.',
    question:
      'How can knowledge of fish communities be improved, and how does eDNA compare with conventional data collection methods?',
    approach:
      'The study was carried out by the Qualyse, LDgenX and Prelevmar consortium. Water samples collected in late autumn 2025 at eight sites were analysed by environmental DNA.',
    result:
      'The median number of species is fairly similar between estuaries and ports, except for the Slack estuary, but species are not distributed in the same way. The study feeds the discussion on using eDNA to monitor aquatic environments and identifies the constraints of marine and estuarine settings: currents, turbidity and tides.',
    service: 'adn-environnemental-adne',
    source:
      'https://www.eau-artois-picardie.fr/etude-de-la-biodiversite-de-lichtyofaune-dans-les-estuaires-et-les-ports-avec-ladn-environnemental',
  },
  {
    id: 'biodiversite-eolien-offshore',
    slug: 'offshore-wind-biodiversity',
    title: 'Exploring the biodiversity of offshore wind farms.',
    category: 'Marine biodiversity',
    image: 'cas-eolien-offshore',
    subtitle: 'An environmental DNA case study presented by LDgenX.',
    facts: [
      { label: 'Context', value: 'Offshore wind farms' },
      { label: 'Environment', value: 'Marine biodiversity' },
      { label: 'Approach', value: 'Environmental DNA' },
    ],
    context:
      'Biodiversity monitoring of offshore wind farms is listed among the case studies of the official environmental DNA page.',
    question:
      'How can marine biodiversity be documented in the context of renewable energy projects?',
    approach:
      'LDgenX presents environmental DNA as an approach to understand and monitor environments. The scope of a study is defined by the question and the site.',
    result: '',
    service: 'adn-environnemental-adne',
    source: 'https://www.ldgenx.com/services/environmental-dna-edna',
  },
  {
    id: 'communautes-microplastiques',
    slug: 'microplastic-microbial-communities',
    title: 'The microbial communities of microplastics.',
    category: 'Microbiology',
    image: 'cas-microplastiques',
    subtitle: 'A subject at the interface of microbiology and the environment.',
    facts: [
      { label: 'Substrates', value: 'Microplastics' },
      { label: 'Field', value: 'Environmental microbiology' },
      { label: 'Subject', value: 'Microbial community profiling' },
    ],
    context: 'LDgenX lists microbial community profiling on microplastics among its case studies.',
    question: 'Which microbial communities can be characterised on these substrates?',
    approach:
      'The expertise presented by LDgenX includes 16S and ITS sequencing, microbial metabarcoding and metagenomics. The choice of analysis follows the objective of the project.',
    result: '',
    service: 'analyse-des-communautes-microbiennes',
    source: 'https://www.ldgenx.com/services/microbial-community-analysis',
  },
];

// The homepage tells the Artois-Picardie study in full. Every line restates the Agency's
// publication, the final report or the restitution presentation (see extra.en.ts).
export const featuredStudy = {
  slug: 'ichtyofaune-artois-picardie',
  client: 'Artois-Picardie Water Agency',
  team: 'Qualyse, LDgenX and Prelevmar consortium',
  steps: [
    {
      title: 'Sample',
      text: 'In late November and early December 2025, three water replicates filtered simultaneously at 15 stations across eight ports and estuaries.',
    },
    {
      title: 'Analyse',
      text: 'Two genetic markers, Teleo for bony fish and Elas02 for elasmobranchs: 23 and 13 taxa identified.',
    },
    {
      title: 'Compare',
      text: 'In the Somme estuary, eDNA finds the four key species of the beam trawl monitoring (herring, whiting, common goby, sea bass) and detects species the trawl did not catch.',
    },
  ],
  outcome:
    'Median richness close between ports and estuaries, except for the Slack, but a different distribution of species; assemblages consistent with the expected ecological guilds. The study feeds the discussion on eDNA for monitoring aquatic environments.',
  constraintsLabel: 'Constraints of the setting highlighted by the publication',
  constraintsHint: 'Choose one to see it at work on the map.',
  // Each line explains the phenomenon in general terms; none describes a measurement.
  constraints: [
    {
      id: 'courants',
      label: 'Currents',
      text: 'Currents move water, and with it the traces of DNA it carries.',
    },
    {
      id: 'turbidite',
      label: 'Turbidity',
      text: 'Abundant in estuaries, suspended particles cloud the water.',
    },
    {
      id: 'marees',
      label: 'Tides',
      text: 'The tide changes the water level and how waters mix through the day.',
    },
  ],
  mapNote:
    'Illustrative animation: the particles and their movements do not represent any measurement from the study.',
  sourceLabel: 'The Water Agency’s publication',
};

export const innovations = [
  {
    id: 'dna-ecotrace',
    slug: 'dna-ecotrace',
    title: 'DNA EcoTrace',
    image: 'dna-ecotrace',
    label: 'Environmental DNA · biodiversity',
    headline: 'Making biodiversity knowledge more accessible.',
    intro:
      'DNA EcoTrace is an innovative project developed by LDgenX to automate and simplify biodiversity monitoring using environmental DNA (eDNA).',
    body: 'The project combines non-invasive sampling, long-read sequencing, artificial intelligence, automated data analysis and user-friendly reporting. Its objective is to provide environmental managers, public authorities, consultancies and companies with reliable information on ecosystem health.',
    steps: [
      'Environmental DNA',
      'Long-read sequencing',
      'Bioinformatics & AI',
      'Reporting the information',
    ],
  },
  {
    id: 'edna-clock',
    slug: 'ednaclock',
    title: 'eDNAClock',
    image: 'ednaclock',
    label: 'Environmental DNA · epigenetics',
    headline: 'Exploring the traces of time in DNA.',
    intro:
      'eDNAClock is an innovative project aimed at estimating the age of fish from traces of environmental DNA.',
    body: 'By combining environmental DNA, epigenetics and next-generation sequencing, the project explores the potential of epigenetic clocks to characterise the demographic structure of aquatic populations, for fisheries management, species conservation and aquatic ecosystem monitoring. It is a research and development line.',
    steps: ['DNA traces', 'Epigenetics', 'Sequencing', 'Demographic insight'],
  },
];

// The team: see extra.en.ts for the full biographies and publication lists.
export const team = people;

// Grouping and names follow https://www.ldgenx.com/about-us/partners.
export const partners = [
  {
    title: 'Organisations that trust us',
    description: 'Organisations listed in LDgenX’s public references.',
    names: [
      'Artois-Picardie Water Agency',
      'Biotope',
      'Qualyse',
      'Groupe Barba',
      'Fédération Nationale des Chasseurs',
      'Université de Corse',
      'EPHE',
      'Line Up Ocean',
      'Plastic at Sea',
      'Pays de l’Ours – ADET',
    ],
  },
  {
    title: 'Scientific ecosystem',
    description:
      'The public research institutes where the team trained and carried out its first projects.',
    names: ['Ifremer', 'INRAE', 'CNRS', 'University of Montpellier', 'MARBEC'],
  },
  {
    title: 'Support & guidance',
    description: 'Organisations that support and guide the development of LDgenX.',
    names: [
      'Bpifrance · Deep Tech label',
      'Créalia Occitanie',
      'Pôle Mer Méditerranée',
      'INRAE Start and Grow',
      'Initium',
      'Agrovallée',
      'Montpellier Business School',
      'Incubateur 1.618',
      'Celimer',
      'Pépite Deeptech',
    ],
  },
];

export const resources = [
  {
    id: 'comprendre-adn-environnemental',
    slug: 'understanding-environmental-dna',
    title: 'Environmental DNA: reading the traces of life.',
    category: 'Environmental DNA',
    image: 'terrain-prelevement',
    intro: 'A first guide to how the analysis of DNA traces supports the study of biodiversity.',
    sections: [
      {
        title: 'Information present in the environment',
        text: 'Environmental DNA is DNA studied from samples taken in an environment. LDgenX presents approaches on water, soil, sediment and biofilms to identify species and support monitoring questions.',
      },
      {
        title: 'The question sets the approach',
        text: 'Surveying a community and looking for a target do not necessarily lead to the same analysis. Metabarcoding, metagenomics, dPCR and long reads are among the approaches LDgenX presents.',
      },
      {
        title: 'Thinking about the whole chain',
        text: 'Design, sampling, molecular analyses, sequencing and bioinformatics are linked. Interpretation must return to the initial question and to the context of the environment studied.',
      },
    ],
    source: 'https://www.ldgenx.com/services/environmental-dna-edna',
    service: 'adn-environnemental-adne',
  },
  {
    id: 'bioinformatique-question-biologique',
    slug: 'bioinformatics-biological-question',
    title: 'Bioinformatics: starting from the biological question.',
    category: 'Methods',
    image: 'bioinformatique',
    intro: 'Why the biological context guides the processing and interpretation of genomic data.',
    sections: [
      {
        title: 'Linking data to needs',
        text: 'Sequencing produces data whose analysis must be built around a scientific objective. LDgenX supports processing, analysis and interpretation for biodiversity, research and innovation projects.',
      },
      {
        title: 'Different datasets',
        text: 'Metabarcoding, metagenomics, WGS, RAD-seq, RNA-seq and epigenetics cannot be reduced to a single analysis. The type of data and the question asked guide the bioinformatics approach.',
      },
      {
        title: 'Preparing the scientific conversation',
        text: 'For a first conversation, share your objective, the available data and the information attached to the samples. This context helps discuss the scope of the analysis and the interpretation needs.',
      },
    ],
    source: 'https://www.ldgenx.com/services/bioinformatics',
    service: 'bioinformatique',
  },
  {
    id: 'genomique-filiere-aquacole',
    slug: 'genomics-aquaculture',
    title: 'Genomics in aquaculture.',
    category: 'Aquaculture',
    image: 'aquaculture',
    intro: 'Diversity, selection and monitoring: complementary questions around aquatic resources.',
    sections: [
      {
        title: 'Knowing the populations',
        text: 'Genetic diversity, broodstock management and inbreeding are subjects LDgenX presents for aquaculture. They link genetic data to the management of breeding stocks.',
      },
      {
        title: 'Building selection tools',
        text: 'Developing SNP panels and searching for markers associated with traits of interest are among the approaches presented. Genetic data are studied in light of the programmes’ objectives.',
      },
      {
        title: 'Considering the aquatic environment',
        text: 'Microbiome studies, health surveillance and stock management are further fields of application. A scientific discussion identifies the expertise each question needs.',
      },
    ],
    source: 'https://www.ldgenx.com/applications/aquaculture-fisheries',
    service: 'selection',
  },
];

// How a project is scoped. Every line restates what LDgenX publishes: the perimeter,
// protocol, reporting, schedule and quote are defined with the client at scoping.
export const projectPractice = {
  eyebrow: 'Your project in practice',
  title: 'Shared scoping.\nA tailored proposal.',
  prepareTitle: 'To prepare the first conversation',
  prepare: [
    'Your objective and the decision it should inform',
    'The context: site, environment, species or population studied',
    'The samples or data already available',
    'Your schedule and field constraints',
  ],
  defineTitle: 'What we define together',
  define: [
    'The scope of the service',
    'The sampling strategy and the analyses',
    'How results are reported',
    'The schedule and the quote',
  ],
};

export const faq = [
  {
    question: 'Do I need samples before contacting you?',
    answer:
      'No. LDgenX works on a complete study, a single analysis step or a specific development. The first conversation can take place before the field campaign, so the sampling strategy is built together.',
  },
  {
    question: 'Can you analyse sequencing data that already exist?',
    answer:
      'Yes. Bioinformatics support covers the processing, analysis and interpretation of existing data: metabarcoding, metagenomics, WGS, RAD-seq, RNA-seq or epigenetics. Share your objective and the available data.',
  },
  {
    question: 'Do you supply sampling equipment?',
    answer:
      'Sampling equipment is one of the services LDgenX offers. References, availability and terms are agreed with the team according to your environment and analyses.',
  },
  {
    question: 'How is the quote prepared?',
    answer:
      'The scope of the service, the reporting, the schedule and the quote are defined from your needs when the project is scoped. The more precise your request, the more precise the proposal.',
  },
  {
    question: 'Where is the team based?',
    answer:
      'The LDgenX team is based at the Ifremer station in Palavas-les-Flots, near Montpellier, France. For a first conversation, book a slot in the team’s calendar or write to info@ldgenx.fr.',
  },
];
