// English catalogue: same shape as fr.ts. Wording follows ldgenx.com where the page exists
// (services, applications, about, innovation, equipment, contact); the rest is translated
// from ldgenx.fr. Ids stay French so every page pairs with its French counterpart.
import type { Expertise, Sector, Study } from './fr';
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
      'Biodiversity, aquaculture, agriculture: we design the study, analyse your samples and help you interpret the results.',
    primary: 'Ask for a quote',
    secondary: 'Explore our services',
    // Each fact is published by LDgenX: ldgenx.com (home, about) and ldgenx.fr (partners, contact).
    facts: [
      { value: '15+ years', label: 'of scientific experience' },
      { value: 'Deep Tech', label: 'label awarded by Bpifrance' },
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
      'Public agencies, consultancies, companies, universities and research institutes: they trust us or support our growth.',
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
    image: 'schema-protocole',
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
      'Long reads (Nanopore) and short reads (Illumina, AVITI), targeted sequencing and microsatellites (qPCR, Sanger, KASP), digital PCR.',
    image: 'dpcr-chargement',
  },
  {
    title: 'Bioinformatics',
    text: 'Data are processed and analysed with bioinformatics approaches suited to your biological question.',
    detail:
      'Bioinformatics and biostatistics: metabarcoding, metagenomics, RAD-seq, RNA-seq, WGS, epigenetics, GWAS.',
    image: 'bioinformatique-client',
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
    image: 'decision-amphitheatre',
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
        link: { kind: 'study', id: 'adne-estuaire-milieu-turbide' },
      },
      {
        title: 'Baseline marine biodiversity assessment at a pilot site',
        image: 'terrain-palavas',
      },
      {
        title: 'Biodiversity monitoring of offshore wind farms (study in progress)',
        image: 'cas-eolien-offshore',
        link: { kind: 'study', id: 'biodiversite-eolien-offshore' },
      },
    ],
    headings: {
      need: 'One question, one environment,\nspecies to know.',
      methods: 'Four ways to read\ntraces of DNA.',
      prestations: 'From protocol\nto decision-support report.',
      uses: 'Where eDNA\nprovides answers.',
      cases: 'Environments\nalready explored.',
    },
    source: 'https://www.ldgenx.com/services/environmental-dna-edna',
  },
  {
    id: 'genomique-des-populations',
    slug: 'population-genomics',
    title: 'Population genomics',
    short: 'Understanding diversity, connectivity and adaptation.',
    scope: 'Assessment of genetic diversity, population connectivity and local adaptation.',
    image: 'populations-huitriers',
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
        link: { kind: 'study', id: 'genomique-vanneau-huppe' },
      },
      {
        title: 'The Pyrenean brown bear',
        image: 'ours-brun',
        link: { kind: 'study', id: 'demogenetique-ours-pyrenees' },
      },
    ],
    headings: {
      need: 'Diversity, structure,\nconnectivity.',
      methods: 'From SNP panels\nto whole genomes.',
      prestations: 'From sample\nto genetic markers.',
      uses: 'Genetic data\nto manage populations.',
      cases: 'Populations\nalready studied.',
    },
    source: 'https://www.ldgenx.com/services/population-genomics',
  },
  {
    id: 'analyse-des-communautes-microbiennes',
    slug: 'microbial-community-analysis',
    title: 'Microbial communities',
    short: 'Exploring the diversity we cannot see.',
    scope:
      'Characterisation of bacterial, fungal and microbial communities using high-throughput sequencing technologies.',
    image: 'biofilm-microbien',
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
        title: 'Sequencing microbial communities on microplastics',
        image: 'cas-microplastiques',
        link: { kind: 'study', id: 'communautes-microplastiques' },
      },
    ],
    headings: {
      need: 'Who makes up\nthe community?',
      methods: 'Bacteria, fungi,\nfunctions.',
      prestations: 'From extraction\nto interpretation.',
      uses: 'From water to soil,\nfrom farms to research.',
      cases: 'A subject\nalready explored.',
    },
    source: 'https://www.ldgenx.com/services/microbial-community-analysis',
  },
  {
    id: 'selection',
    slug: 'genomic-selection',
    title: 'Genomic selection',
    short: 'Bringing genetic information into your programmes.',
    scope: 'Development of genetic tools to support breeding and selection programmes.',
    image: 'selection-unima',
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
    headings: {
      need: 'A trait, a programme,\nthe data.',
      methods: 'From markers\nto selection models.',
      prestations: 'Tools\nfor your programmes.',
      uses: 'The traits\nthat matter to your sector.',
      cases: 'Work\nalready carried out.',
    },
    source: 'https://www.ldgenx.com/services/genomic-selection',
  },
  {
    id: 'bioinformatique',
    slug: 'bioinformatics',
    title: 'Bioinformatics',
    short: 'Bringing out the meaning of your genomic data.',
    scope: 'Analysis, processing and interpretation of genomic data.',
    image: 'bioinformatique-alignement',
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
    headings: {
      need: 'From raw data\nto a biological answer.',
      methods: 'Each type of data,\nits own analysis.',
      prestations: 'From data quality\nto reporting.',
      uses: 'The data\nwe analyse.',
    },
    source: 'https://www.ldgenx.com/services/bioinformatics',
  },
  {
    id: 'sequencage-dpcr',
    slug: 'sequencing-dpcr',
    title: 'Sequencing & dPCR',
    short: 'Reading DNA. Detecting the targets that matter to you.',
    scope:
      'Amplicon sequencing, short- and long-read sequencing, and development and analysis of digital PCR (dPCR) assays.',
    image: 'dpcr-instrument',
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
    headings: {
      need: 'Read genomes\nor detect one species?',
      methods: 'From amplicons\nto whole genomes.',
      prestations: 'From extraction\nto digital PCR.',
      uses: 'What we sequence\nand detect.',
      cases: 'Targets\nalready studied.',
    },
    source: 'https://www.ldgenx.com/services/sequencing-dpcr',
    seo: {
      title: 'Sequencing and species detection by dPCR | LDgenX',
      description:
        'Amplicon, long-read and whole-genome sequencing, species detection by dPCR: technologies chosen for your scientific question.',
    },
  },
  {
    id: 'tests-adn-cibles',
    slug: 'targeted-dna-tests-dpcr',
    title: 'Targeted DNA tests',
    short: 'Detect and quantify the DNA of one species.',
    scope:
      'Primers and probes for 22 species and custom assays: detection and quantification by digital PCR.',
    image: 'dpcr-operateur',
    headline: 'Your target species, a custom DNA test.',
    intro:
      'European mink, Atlantic bluefin tuna, sharks, loggerhead turtle: LDgenX holds primers and probes for 22 species and designs assays for new targets. Digital PCR (dPCR) detects and quantifies the DNA of the species you are looking for in water, soil or sediment.',
    need: 'A protected species to confirm, an invasive species to detect early, a pathogen to monitor? When the question is about one species, a targeted test answers it more directly than a survey.',
    approaches: [
      {
        title: 'Detect a species',
        text: 'Find out whether the DNA of one species is present in a water, soil or sediment sample.',
      },
      {
        title: 'Quantify its DNA',
        text: 'Estimate the amount of target DNA, as a number of copies, to compare samples or sites.',
      },
      {
        title: 'Rare or invasive species',
        text: 'Look for a protected, threatened or invasive species when the question is about one target.',
      },
      {
        title: 'Pathogens',
        text: 'Monitor a pathogen by dPCR, for instance in aquaculture.',
      },
    ],
    uses: ['Protected species', 'Invasive species', 'Fisheries species', 'Pathogens'],
    sectors: ['environnement-bureaux-d-etudes', 'biodiversite-conservation', 'aquaculture-peche'],
    delivery:
      'Each test is defined with you: the species, the related species it must not confuse, the matrices and the sampling plan. Assay performance is evaluated for each project.',
    prestations: [
      'Primer and probe design',
      'Specificity assessment',
      'DNA extraction',
      'Digital PCR (dPCR)',
      'Interpretation of results',
      'Decision-support report',
    ],
    cases: [
      { title: 'Detection of iconic Mediterranean species using dPCR', image: 'cas-requin' },
      {
        title: 'Detection of the purple sea urchin (*Paracentrotus lividus*)',
        image: 'cas-oursin',
      },
    ],
    source: 'https://www.ldgenx.com/services/sequencing-dpcr',
    seo: {
      title: 'Targeted DNA tests by dPCR: detect a species | LDgenX',
      description:
        'Primers and probes for 22 species (European mink, bluefin tuna, sharks, loggerhead turtle…) and custom assays: DNA detection and quantification by digital PCR.',
    },
    headings: {
      need: 'One question,\none species.',
      methods: 'Detect, quantify,\nmonitor.',
      prestations: 'From design\nto report.',
      uses: 'The most frequent\ntargets.',
      cases: 'Targets\nalready studied.',
    },
  },
  {
    id: 'recherche-developpement',
    slug: 'research-development',
    title: 'Research & Development',
    short: 'Building the scientific approaches of tomorrow.',
    scope:
      'Grant proposal support, scientific consulting, project support and guidance for your research.',
    image: 'terrain-kayak',
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
    cir: true,
    prestations: [
      'Grant proposal support',
      'Project support and guidance',
      'Scientific consulting',
    ],
    cases: [
      {
        title: 'DNA EcoTrace',
        image: 'schema-ecotrace',
        link: { kind: 'innovation', id: 'dna-ecotrace' },
      },
      { title: 'eDNAClock', image: 'ednaclock', link: { kind: 'innovation', id: 'edna-clock' } },
    ],
    headings: {
      need: 'An open question?\nLet’s build the method.',
      methods: 'Design, develop,\ncollaborate.',
      prestations: 'Support\nat every stage.',
      uses: 'Fields\nto explore together.',
      cases: 'Our research\nprojects.',
    },
    source: 'https://www.ldgenx.com/about-us/innovation',
  },
  {
    id: 'materiel',
    slug: 'equipment',
    title: 'Sampling equipment',
    short: 'Preparing the ground for your analyses.',
    scope:
      'Sampling kits for each environment (seawater, freshwater, soil, air) and water filtration equipment.',
    image: 'materiel-pompe',
    headline: 'An analysis starts with a sample.',
    intro:
      'Sampling kits for seawater, freshwater, soil and air, and water filtration equipment (triple pump, StickPump, Yellow Submarine): LDgenX equips your environmental DNA campaigns.',
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
      'The right equipment depends on the environment, the volumes to filter and the planned analyses: the team helps you prepare the campaign before going into the field.',
    prestations: [],
    cases: [],
    headings: {
      methods: 'Preparing\nyour campaign.',
      methodsText:
        'Equipment is chosen according to the environment, the question and how sampling is organised.',
      uses: 'For which\nprojects?',
    },
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
    study: 'genomique-vanneau-huppe',
    headings: {
      field: 'Monitor, understand,\nsupport management.',
      related: 'From eDNA\nto population genomics.',
    },
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
    image: 'selection-unima',
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
    headings: {
      fieldEyebrow: 'Your industry questions',
      field: 'From hatchery\nto stock monitoring.',
      related: 'Selection, populations,\ntargeted detection.',
    },
    source: 'https://www.ldgenx.com/applications/aquaculture-fisheries',
  },
  {
    id: 'agriculture-agroecologie',
    slug: 'agriculture-agroecology',
    title: 'Agriculture & Agroecology',
    scope: 'Soil microbiomes, molecular markers, marker-assisted breeding.',
    image: 'schema-agroecologie',
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
    headings: {
      field: 'From soils\nto breeding programmes.',
      related: 'Microbiomes, markers\nand targeted detection.',
    },
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
    study: 'ichtyofaune-artois-picardie',
    headings: {
      field: 'Three questions\nat the heart of your projects.',
      related: 'eDNA, dPCR, microbiology\nand field equipment.',
    },
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
    image: 'schema-recherche',
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
    cir: true,
    uses: [],
    examples: [],
    headings: {
      fieldEyebrow: 'Your research questions',
      field: 'From design\nto data analysis.',
      related: 'Molecular biology,\nsequencing, bioinformatics.',
    },
    source: 'https://www.ldgenx.com/about-us/innovation',
  },
  {
    id: 'energies-marines-renouvelables',
    slug: 'renewable-energy',
    title: 'Renewable energy',
    scope:
      'Onshore wind, offshore wind and solar: documenting the biodiversity around your projects.',
    image: 'eolien-en-mer',
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
    study: 'biodiversite-eolien-offshore',
    headings: {
      field: 'From baseline\nto operational monitoring.',
      related: 'eDNA, targeted detection\nand field equipment.',
    },
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

export const studies: Study[] = [
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
    id: 'genomique-vanneau-huppe',
    slug: 'northern-lapwing-genomics',
    title: 'Where do the lapwings wintering in France come from?',
    category: 'Population genomics',
    image: 'cas-vanneau',
    imageAlt: 'Northern lapwing',
    subtitle:
      'A genomic study of 438 northern lapwings for the French national hunters’ federation, as part of the VanConnect project.',
    facts: [
      {
        label: 'Client',
        value: 'Fédération nationale des chasseurs (French national hunters’ federation)',
      },
      { label: 'Project', value: 'VanConnect, Écocontribution no. 1274, action 1' },
      { label: 'Species', value: 'Northern lapwing, Vanellus vanellus' },
      { label: 'Approach', value: 'Genotyping by sequencing (3D-GBS), 40,746 SNPs' },
      { label: 'Period', value: '2024-2025' },
    ],
    context:
      'A huntable migratory species listed in Annex II of the EU Birds Directive, the northern lapwing is declining, mainly because of low productivity. Birds wintering in France are thought to come from the United Kingdom, Scandinavia or Eastern Europe, but their origin and population structure were poorly known.',
    question:
      'Where do the lapwings wintering in France come from, and are their populations genetically structured?',
    approach:
      'Analysis of 479 muscle samples collected from 2018 to 2023 in nine French regions, genotyped by 3D-GBS. After quality control, 438 birds and 40,746 SNPs were analysed: genetic diversity, ADMIXTURE, principal component analysis, identity by state and by descent.',
    result:
      'All analyses converge: no marked genetic structure and high genetic diversity. The lapwings sampled in France come from a single, well-mixed and weakly structured population.',
    service: 'genomique-des-populations',
    source: 'https://hal.science/hal-05490664',
    details: {
      regionsTitle: 'The birds analysed, by region',
      regionsNote:
        'Number of samples per region (table 1 of the report). Three birds have no region recorded. The distribution reflects winter bird density and sampling effort.',
      regions: [
        { name: 'Normandy', value: 149 },
        { name: 'Hauts-de-France', value: 109 },
        { name: 'Pays de la Loire', value: 91 },
        { name: 'Nouvelle-Aquitaine', value: 56 },
        { name: 'Brittany', value: 30 },
        { name: 'Centre-Val de Loire', value: 21 },
        { name: 'Grand Est', value: 10 },
        { name: 'Corsica', value: 5 },
        { name: 'Occitanie', value: 5 },
      ],
      funnelTitle: 'From samples to data',
      funnel: [
        { value: '479', label: 'muscle samples, collected from 2018 to 2023' },
        { value: '471', label: 'birds sequenced with enough reads' },
        { value: '930,912', label: 'SNPs detected on the lapwing reference genome' },
        { value: '438', label: 'birds kept after filtering missing data' },
        { value: '40,746', label: 'independent SNPs for the structure analyses' },
      ],
      findingsTitle: 'What the analyses show',
      findings: [
        'ADMIXTURE: the most likely number of genetic groups is K = 1.',
        'Inbreeding coefficient (Fis) close to 0 in every region: an overall well-mixed population.',
        'Principal component analysis: no grouping by region, sex, age, year or month of sampling; three groups stand out very subtly on the first axis.',
        'Identity by state: most pairs of birds between 0.75 and 0.85, as expected in a weakly structured natural population.',
        'Identity by descent: only five pairs of birds appear related.',
      ],
      perspectiveTitle: 'Going further',
      perspective:
        'Adding birds sampled at their breeding sites, in the United Kingdom, Scandinavia and Eastern Europe, would identify the origin of the lapwings wintering in France.',
      rolesTitle: 'Who did what',
      roles: [
        'Report: Maeva Leitwein and Emilie Delpuech (LDgenX), Carole Bodin and Pascal Lapébie (French national hunters’ federation).',
        'Samples: carcasses collected by the Ardennes departmental hunters’ federation, thanks to hunters who volunteered.',
        'DNA extraction, library preparation and sequencing: IBIS platform, Université Laval (Quebec), on an AVITI sequencer.',
      ],
      documentsTitle: 'Source documents',
      documents: [
        {
          label:
            'Genomic analysis report on northern lapwing populations wintering in France (in French)',
          meta: 'HAL, 3 February 2026 · PDF, 24 pages',
          url: 'https://hal.science/hal-05490664',
        },
        {
          label: 'Raw data: individual BAM files and VCF',
          meta: 'European Nucleotide Archive, PRJEB88728',
          url: 'https://www.ebi.ac.uk/ena/browser/view/PRJEB88728',
        },
      ],
    },
  },
  {
    id: 'demogenetique-ours-pyrenees',
    slug: 'pyrenean-brown-bear-demogenetics',
    title: 'What genetic future for the Pyrenean brown bear?',
    category: 'Population genomics',
    image: 'ours-brun',
    imageAlt: 'A brown bear crossing a forest clearing',
    subtitle:
      'A demo-genetic study of the brown bear population for the Pays de l’Ours – ADET association.',
    facts: [
      { label: 'Client', value: 'Pays de l’Ours – ADET association' },
      { label: 'Scientific partner', value: 'UMR BIOGECO (INRAE, University of Bordeaux)' },
      { label: 'Species', value: 'Brown bear, Ursus arctos' },
      { label: 'Data', value: 'Population monitoring, 1975 to 2024' },
      { label: 'Approach', value: 'Demo-genetic modelling, projections to 2050' },
      { label: 'Year', value: '2025' },
    ],
    context:
      'Close to extinction in the Pyrenees in the mid-1990s, the brown bear population was reinforced from 1996 with bears released from Slovenia. It was estimated at 104 individuals in 2024. Descended from a small number of founders, it remains genetically fragile: its inbreeding has been rising since the early 2000s, even as its numbers grow.',
    question:
      'What is the genetic status of the population, and which additions of bears would limit inbreeding by 2050?',
    approach:
      'A synthesis of the population monitoring data: a pedigree built from thirteen microsatellite markers, on hair and scats, from 1975 to 2024. After estimating the demographic parameters, the population is simulated from 2024 to 2050: from 0 to 200 bears introduced between 2030 and 2040, with 0 to 100% males, giving 2,475 simulated genealogies.',
    result:
      'Without new bears, inbreeding keeps rising until 2050. A moderate but structured reinforcement is the most effective measure: 30 bears introduced over ten years, about 70% of them females, slow the rise in inbreeding and increase the effective size of the population. Keeping the two population cores connected and coordinating management between France, Spain and Andorra complete these measures.',
    service: 'genomique-des-populations',
    source: '',
    details: {
      regionsTitle: 'Time between two litters',
      regionsNote:
        'Share of the females’ reproductions by the number of years since their last litter, from the monitoring data up to 2024 (figure 3 of the report); 1.86 years on average. “0 years”: litters with several fathers, counted as two reproductions.',
      regionsUnit: '%',
      regions: [
        { name: '0 years', value: 7.5 },
        { name: '1 year', value: 11.3 },
        { name: '2 years', value: 64.2 },
        { name: '3 years', value: 11.3 },
        { name: '4 years', value: 5.7 },
      ],
      figuresTitle: 'The report’s figures',
      figures: [
        {
          image: 'fig-ours-consanguinite',
          caption:
            'Figure 6 of the report: simulated mean inbreeding, without introductions (a) and with 30 bears introduced over ten years (b); median of 50 simulations.',
        },
        {
          image: 'fig-ours-effectifs',
          caption:
            'Figure 4 of the report: population numbers, observed from 2000 to 2024, then simulated to 2050.',
          size: 'medium',
        },
      ],
      funnelTitle: 'From monitoring data to projections',
      funnel: [
        { value: '1975-2024', label: 'years of population monitoring analysed' },
        {
          value: '13',
          label: 'microsatellite markers to identify each bear and build the pedigree',
        },
        { value: '104', label: 'bears estimated in 2024, within an interval of 97 to 123' },
        { value: '2,475', label: 'genealogies simulated to 2050' },
        { value: '0 to 200', label: 'bears introduced across the scenarios, with 0 to 100% males' },
      ],
      findingsTitle: 'What the simulations show',
      findings: [
        'Without intervention, genetic erosion continues slowly but steadily: mean inbreeding keeps rising until 2050.',
        'In the model, numbers reach the set carrying capacity around 2035, with more than 400 bears.',
        'The more bears are introduced, the more the effective size and genetic diversity increase: allelic richness rises from 5.6 to more than 7 alleles per locus.',
        'For the same number of bears, mostly female introductions can double the genetic effective size. Inbreeding ranges from 0.40, with few and mostly male introductions, to 0.14 with many and mostly female ones.',
        'The recommended scenario, 30 bears over ten years with about 70% females, slows the rise in inbreeding compared with no introductions.',
      ],
      perspectiveTitle: 'Going further',
      perspective:
        'The projections should be updated with new monitoring data. LDgenX offers to share and co-develop its simulation models with the French Biodiversity Agency (OFB), to refine the management strategies for the population.',
      rolesTitle: 'Who did what',
      roles: [
        'Commissioned by: Alain Reynes, Pays de l’Ours – ADET association.',
        'Report: Maeva Leitwein and Emilie Delpuech (LDgenX). Scientific coordination: Maeva Leitwein.',
        'Modelling tools and statistics: Emilie Delpuech and Virgil Fivet (UMR BIOGECO), as part of the internship of Anouk Glazmann d’Hont, a second-year Master’s (M2) student at the École pratique des hautes études (EPHE), recruited for the project.',
        'Scientific partner: UMR BIOGECO (INRAE, University of Bordeaux).',
        'Monitoring data: the Brown Bear Network, led by the French Biodiversity Agency (OFB) with the Spanish and Andorran services.',
      ],
    },
  },
  {
    id: 'adne-estuaire-milieu-turbide',
    slug: 'estuary-edna-turbid-water',
    title: 'Reading fish DNA in turbid water.',
    category: 'Environmental DNA',
    image: 'estuaire-gironde',
    imageAlt: 'The mouth of the Gironde estuary seen from space, its waters laden with sediment',
    subtitle:
      'A pilot project in the Gironde comparing water filtration methods in turbid estuaries.',
    facts: [
      { label: 'Client', value: 'INRAE' },
      { label: 'Project', value: 'ADNe Estuaire, pilot project' },
      { label: 'Sites', value: 'Bègles, Cadillac and Le Verdon (Gironde, France)' },
      { label: 'Turbidity', value: 'From 14 to more than 800 NTU' },
      { label: 'Samples', value: '43, analysed in duplicate' },
      { label: 'Approach', value: 'eDNA metabarcoding, fish 12S marker' },
      { label: 'Period', value: 'October 2025' },
    ],
    context:
      'In estuaries, water loaded with particles makes environmental DNA harder: filters clog quickly and particles can interfere with the analyses. This pilot project aimed to optimise eDNA protocols in turbid water.',
    question:
      'Which devices and filter sizes suit which turbidity, and which fish can be detected?',
    approach:
      'In October 2025, water from three sites with contrasting turbidity was filtered with two systems: a triple pump with Waterra capsules (0.45, 1.2 and 5 µm pores) and a high-flow Stick Pump (20 µm filter), from 2 to 30 litres depending on clogging. The 43 samples were analysed by metabarcoding on the fish 12S marker (Teleo, Illumina short reads), in duplicate; 12 of them were also sequenced as long fragments (Oxford Nanopore).',
    result:
      'Turbidity weighs heavily on detection: at Bègles (740 to 800 NTU), only a few hardy species show up, such as European sea bass and thinlip grey mullet, whereas Le Verdon (14 NTU) has the highest richness. In all, 26 taxa are identified. The 5 µm filters concentrate the strongest signals, finer filters a more diffuse but more diverse signal. The project recommends repeating the sampling over time and cross-checking bioinformatic tools.',
    service: 'adn-environnemental-adne',
    source: '',
    details: {
      regionsTitle: 'Species detected per site',
      regionsNote:
        'Species richness per site, all visits combined, from short reads (table 5 of the report), from the most turbid site to the clearest: Bègles, Cadillac, Le Verdon.',
      regions: [
        { name: 'Bègles', value: 6 },
        { name: 'Cadillac', value: 11 },
        { name: 'Le Verdon', value: 17 },
      ],
      figuresTitle: 'The report’s figures',
      figures: [
        {
          image: 'fig-estuaire-taxons',
          caption:
            'Figure 2 of the report: species detected from short reads, by site, turbidity and filter size; circle size follows the relative abundance of sequences.',
        },
        {
          bars: [
            { name: 'Short reads only', value: 14 },
            { name: 'Both read types', value: 12 },
            { name: 'Long reads only', value: 2 },
          ],
          caption:
            'After supplementary figure 3 of the report: number of species detected by short reads only, by long reads only or by both.',
        },
      ],
      funnelTitle: 'From the field to species',
      funnel: [
        { value: '3', label: 'sites, from 14 to more than 800 NTU' },
        { value: '43', label: 'samples filtered, extracted and analysed in duplicate' },
        { value: '36,730,010', label: 'raw short-read sequences' },
        { value: '12', label: 'samples also sequenced as long fragments (full 12S)' },
        { value: '26', label: 'taxa identified across the sites' },
      ],
      findingsTitle: 'What the analyses show',
      findings: [
        'Bègles, the most turbid site (740 to 800 NTU): only three species, including sea bass and thinlip grey mullet, with weak signals.',
        'Le Verdon, in clear water (14 NTU): the highest richness, with coastal marine, intertidal and freshwater species.',
        'When turbidity drops between two visits to the same site, the sea bass signal becomes much stronger: turbidity alone could explain a large part of the variation in detection.',
        'The 5 µm filters concentrate the strongest signals; the 0.45 and 1.2 µm filters capture a more diffuse but more diverse signal.',
        'Short and long reads overlap: 12 shared species, 86% of the long-fragment taxa, which add two more, the goldsinny wrasse and the ruffe.',
        'Reanalysed with a second bioinformatic tool, the short reads yield 26 taxa, against 2 species in the first analysis: cross-checking analysis tools is one of the recommendations.',
      ],
      perspectiveTitle: 'Going further',
      perspective:
        'Repeating the sampling over time at each site and combining markers of different lengths: these are the two avenues chosen to consolidate the protocol, before any public release of the occurrences.',
      rolesTitle: 'Who did what',
      roles: [
        'Commissioned by: INRAE.',
        'Sampling: Thibault Dindard and Bertrand Villeneuve.',
        'Report: Maeva Leitwein and Emilie Delpuech (LDgenX).',
        'DNA extraction, long-fragment sequencing (MinION) and bioinformatic analyses: LDgenX.',
        'Amplification and short-read sequencing: PGTB platform (Bordeaux), on an Illumina MiSeq i100.',
      ],
    },
  },
  {
    id: 'biodiversite-eolien-offshore',
    slug: 'offshore-wind-biodiversity',
    title: 'Exploring the biodiversity of offshore wind farms.',
    category: 'Marine biodiversity',
    image: 'cas-eolien-offshore',
    subtitle: 'Environmental DNA for monitoring marine environments around wind farms.',
    status: 'ongoing',
    facts: [
      { label: 'Status', value: 'Study in progress' },
      { label: 'Context', value: 'Offshore wind farms' },
      { label: 'Environment', value: 'Marine biodiversity' },
      { label: 'Approach', value: 'Environmental DNA' },
    ],
    context:
      'Offshore wind projects come with a baseline survey and monitoring of the marine environment, from construction to operation.',
    question:
      'How can marine biodiversity be documented in the context of renewable energy projects?',
    approach:
      'Environmental DNA surveys biodiversity from water samples, without capturing any species. The protocol, the groups targeted and the sampling frequency are set according to the site and the question.',
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
    subtitle: 'Sequencing the microbial communities that colonise microplastics.',
    facts: [
      { label: 'LDgenX’s role', value: 'Sequencing' },
      { label: 'Substrates', value: 'Microplastics' },
      { label: 'Field', value: 'Environmental microbiology' },
    ],
    context:
      'In water, microplastics are colonised by communities of microorganisms. Characterising them helps to understand these particles and their place in the environment.',
    question: 'Which microbial communities can be characterised on these substrates?',
    approach: 'Our part in this project was limited to sequencing its samples.',
    result: '',
    service: 'sequencage-dpcr',
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
  sourceLabel: 'The Water Agency’s publication',
};

export const innovations = [
  {
    id: 'dna-ecotrace',
    slug: 'dna-ecotrace',
    title: 'DNA EcoTrace',
    image: 'schema-ecotrace',
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
    description: 'Agencies, consultancies, companies and research organisations.',
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
        text: 'Environmental DNA is DNA studied from samples taken in an environment. We study it in water, soil, sediment and biofilms to identify species and answer monitoring questions.',
      },
      {
        title: 'The question sets the approach',
        text: 'Surveying a community and looking for one species do not lead to the same analysis. Metabarcoding, metagenomics, dPCR or long reads: each approach answers a type of question.',
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
    image: 'bioinformatique-client',
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
    image: 'selection-unima',
    intro: 'Diversity, selection and monitoring: complementary questions around aquatic resources.',
    sections: [
      {
        title: 'Knowing the populations',
        text: 'Genetic diversity, broodstock management, inbreeding: these questions link genetic data to the management of breeding stocks.',
      },
      {
        title: 'Building selection tools',
        text: 'SNP panels and the search for markers associated with traits of interest: genetic data are studied in light of the breeding programme’s objectives.',
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
