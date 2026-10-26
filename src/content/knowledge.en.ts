// English version of knowledge.fr.ts.
import type { FaqItem, GlossaryTerm } from './knowledge.fr';

export const knowledge = {
  faq: {
    eyebrow: 'Frequently asked questions',
    title: 'Your questions about DNA\nand applied genomics.',
    intro:
      'Environmental DNA, species assays, population genomics, sampling and the French research tax credit: answers to the questions we are asked most often.',
    groups: [
      {
        title: 'Environmental DNA',
        items: [
          {
            question: 'What is environmental DNA (eDNA)?',
            answer:
              'Environmental DNA is the trace of DNA that organisms leave in their surroundings: cells, mucus, faeces or gametes. Collected from water, soil, sediment or biofilms, these traces reveal which species are present without capturing or directly observing them.',
            link: {
              to: { kind: 'service', id: 'adn-environnemental-adne' },
              label: 'Our environmental DNA service',
            },
          },
          {
            question: 'Does eDNA replace field surveys?',
            answer:
              'No. eDNA reveals that a species’ DNA is present in a sample; it complements field surveys and ecological expertise without replacing them, and does not directly give the size of a population.',
          },
          {
            question: 'What is the difference between metabarcoding and dPCR?',
            answer:
              'Metabarcoding surveys multiple species using genetic markers shared by the target groups (12S, COI, 18S, ITS…). Digital PCR (dPCR) detects and quantifies targeted DNA sequences. Our species assays use specific primers and a probe; multiplex assays can investigate several targets when the protocol supports them.',
            link: {
              to: { kind: 'service', id: 'tests-adn-cibles' },
              label: 'Targeted DNA tests',
            },
          },
          {
            question: 'Can dPCR count individuals?',
            answer:
              'No. dPCR estimates an amount of target DNA, as a number of copies. This helps compare samples or sites, but does not directly count the individuals present.',
          },
          {
            question: 'Which environments can you analyse?',
            answer:
              'Seawater and freshwater, soil, sediment and biofilms. LDgenX offers sampling kits suited to each environment, including air.',
            link: {
              to: { kind: 'service', id: 'materiel' },
              label: 'Sampling equipment and kits',
            },
          },
        ],
      },
      {
        title: 'Your projects',
        items: [
          {
            question: 'Do I need samples before contacting you?',
            answer:
              'No. LDgenX works on complete studies, single analysis steps or specific developments. The first conversation can take place before fieldwork, to design the sampling strategy together.',
          },
          {
            question: 'Do you have assays for a specific species?',
            answer:
              'LDgenX holds primers and probes for 22 species (mammals, fish, a reptile and invertebrates) and designs custom assays for new targets. Matrices, conditions of use and performance are evaluated for each project.',
            link: {
              to: { kind: 'service', id: 'tests-adn-cibles' },
              label: 'See the target species',
            },
          },
          {
            question: 'Can you analyse sequencing data that already exists?',
            answer:
              'Yes. Our bioinformatics support covers the processing, analysis and interpretation of existing data: metabarcoding, metagenomics, WGS, RADseq, RNAseq or epigenetics.',
            link: {
              to: { kind: 'service', id: 'bioinformatique' },
              label: 'Our bioinformatics service',
            },
          },
          {
            question: 'Do you supply sampling equipment?',
            answer:
              'Yes. LDgenX prepares sampling kits for each environment (seawater, freshwater, soil, air) and offers water filtration equipment: triple pump, StickPump and Yellow Submarine. Their contents are agreed with the team according to your protocol.',
          },
          {
            question: 'Do you contribute to impact assessments and the mitigation hierarchy?',
            answer:
              'LDgenX provides DNA data for baseline surveys, impact assessments and monitoring, supporting consultancies and developers: sampling strategy, analyses and interpretation. The regulatory file and the definition of measures remain the developer’s responsibility.',
            link: {
              to: { kind: 'application', id: 'environnement-bureaux-d-etudes' },
              label: 'Environmental studies',
            },
          },
          {
            question: 'Are your services eligible for the French research tax credit?',
            answer:
              'LDgenX is approved for the French research tax credit (CIR). Eligible R&D work you outsource to us may count towards your CIR, subject to the conditions applying to your company and project. A provider’s approval does not automatically make every service eligible.',
            link: {
              to: { kind: 'application', id: 'recherche-publique-privee' },
              label: 'Public and private research',
            },
          },
          {
            question: 'How is the quote prepared?',
            answer:
              'The scope of the service, the reporting, the timeline and the quote are defined from your needs when the project is scoped. The more precise your request, the more precise the proposal.',
          },
        ],
      },
      {
        title: 'The company',
        items: [
          {
            question: 'Where is LDgenX based?',
            answer:
              'The team works at the Ifremer station in Palavas-les-Flots, near Montpellier (Hérault, Occitanie, France). Its studies also cover other regions, such as the ports and estuaries of Artois-Picardie.',
          },
          {
            question: 'Who is in the team?',
            answer:
              'Dr Maeva Leitwein and Dr Emilie Delpuech, co-founders, specialised in population genomics and bioinformatics; Maxime Lambert, laboratory engineer in molecular biology; Dr Damien Crestel, bioinformatician in population and quantitative genetics.',
          },
          {
            question: 'Does the team publish its work?',
            answer:
              'Yes. Team members co-author articles in peer-reviewed journals such as Molecular Ecology, Genetics Selection Evolution, Heredity and Evolutionary Applications. Each article is presented with a summary on the Research page.',
          },
        ],
      },
    ] as { title: string; items: FaqItem[] }[],
  },
  glossary: {
    eyebrow: 'Glossary',
    title: 'The words of genomics,\nexplained simply.',
    intro:
      'eDNA, metabarcoding, dPCR, SNP, GWAS: the terms we use on this site, defined in a few lines.',
    filterLabel: 'Go to letter',
    terms: [
      {
        id: 'adn-environnemental',
        term: 'Environmental DNA',
        also: 'eDNA',
        definition:
          'Traces of DNA that organisms leave in their surroundings (cells, mucus, faeces, gametes). Analysed from a water, soil, sediment or biofilm sample, they reveal species without capturing them.',
        link: {
          to: { kind: 'service', id: 'adn-environnemental-adne' },
          label: 'Environmental DNA',
        },
      },
      {
        id: 'amorce-sonde',
        term: 'Primers and probe',
        definition:
          'Short DNA fragments designed for one species: the two primers frame a region of its genome that PCR copies, and the fluorescent probe recognises that region. Their specificity avoids confusing the target with related species.',
        link: { to: { kind: 'service', id: 'tests-adn-cibles' }, label: 'Targeted DNA tests' },
      },
      {
        id: 'asv',
        term: 'ASV',
        also: 'amplicon sequence variant',
        definition:
          'A unique sequence found in metabarcoding data after sequencing errors are corrected. Each ASV is then compared with reference databases to assign it to a species or group.',
      },
      {
        id: 'assignation-taxonomique',
        term: 'Taxonomic assignment',
        definition:
          'The bioinformatics step that assigns a species, genus or family to a DNA sequence by comparing it with reference sequence databases.',
      },
      {
        id: 'bioinformatique',
        term: 'Bioinformatics',
        definition:
          'The discipline that processes and analyses biological data, especially DNA sequences, using software, statistics and reproducible analysis pipelines.',
        link: { to: { kind: 'service', id: 'bioinformatique' }, label: 'Bioinformatics' },
      },
      {
        id: 'cir',
        term: 'Research tax credit',
        also: 'CIR, crédit d’impôt recherche',
        definition:
          'A tax credit on eligible research and development expenditure. In mainland France, the rate is 30% up to €100 million of expenditure, then 5% above that threshold. Work outsourced to an approved organisation such as LDgenX may qualify, subject to the conditions applying to the project, expenditure and company.',
        link: {
          to: { kind: 'application', id: 'recherche-publique-privee' },
          label: 'Public & private research',
        },
      },
      {
        id: 'consanguinite',
        term: 'Inbreeding',
        also: 'Fis',
        definition:
          'Mating between related individuals, which increases the probability of carrying two copies of an allele inherited from a common ancestor. Fis measures a deficit or excess of heterozygotes relative to expectations under random mating within a population; a value near 0 does not, on its own, demonstrate the absence of genetic structure.',
      },
      {
        id: 'dpcr',
        term: 'Digital PCR',
        also: 'dPCR',
        definition:
          'A technique that splits a sample into thousands of partitions before amplification: those containing the target DNA give a signal, so the DNA can be detected and quantified as a number of copies, without a standard curve.',
        link: { to: { kind: 'service', id: 'tests-adn-cibles' }, label: 'Targeted DNA tests' },
      },
      {
        id: 'epigenetique',
        term: 'Epigenetics',
        also: 'DNA methylation',
        definition:
          'Chemical marks, such as DNA methylation, that modulate gene activity without changing the sequence. They can vary with the environment or with age.',
      },
      {
        id: 'genomique-des-populations',
        term: 'Population genomics',
        definition:
          'The study of genetic variation within and between populations at genome scale: diversity, structure, connectivity, inbreeding and adaptation.',
        link: {
          to: { kind: 'service', id: 'genomique-des-populations' },
          label: 'Population genomics',
        },
      },
      {
        id: 'gbs',
        term: 'Genotyping by sequencing',
        also: 'GBS, 3D-GBS',
        definition:
          'A method that sequences a reduced fraction of the genome, cut by restriction enzymes, to genotype thousands of SNP markers in many individuals at low cost. 3D-GBS combines three enzymes.',
      },
      {
        id: 'gwas',
        term: 'GWAS',
        also: 'genome-wide association study',
        definition:
          'An analysis that tests associations between genetic markers and a trait (growth, disease resistance, sex…) across the genome. Associated regions guide the search for candidate genes, without establishing a causal relationship on their own.',
      },
      {
        id: 'heritabilite',
        term: 'Heritability',
        definition:
          'The share of variation in a trait attributable to genetic differences in a particular population and environment. Heritability does not measure the genetic share of an individual’s trait; the response to selection also depends on available genetic variation and the breeding programme.',
      },
      {
        id: 'introgression',
        term: 'Introgression',
        also: 'hybridisation',
        definition:
          'The lasting transfer of genes from one population or species to another through hybridisation and backcrossing. It can be traced along the genome with genetic markers.',
      },
      {
        id: 'marqueur-genetique',
        term: 'Genetic marker',
        also: '12S, COI, 16S, 18S, ITS',
        definition:
          'A region of DNA whose variation identifies species or individuals. Metabarcoding uses marker genes: 12S for fish, COI for many animals, 16S for bacteria, ITS for fungi.',
      },
      {
        id: 'metabarcoding',
        term: 'Metabarcoding',
        definition:
          'Surveying many species from a single sample: a genetic marker is amplified and sequenced, and each sequence is assigned to a species or group.',
        link: {
          to: { kind: 'service', id: 'adn-environnemental-adne' },
          label: 'Environmental DNA',
        },
      },
      {
        id: 'metagenomique',
        term: 'Metagenomics',
        definition:
          'Sequencing all the DNA in a sample, without targeting a marker, to describe the composition and potential functions of the communities it contains.',
        link: {
          to: { kind: 'service', id: 'analyse-des-communautes-microbiennes' },
          label: 'Microbial communities',
        },
      },
      {
        id: 'panel-snp',
        term: 'SNP panel',
        definition:
          'A set of a few dozen to a few thousand SNPs chosen to answer a question: assigning individuals, checking parentage, monitoring a population or a breeding programme.',
      },
      {
        id: 'qpcr',
        term: 'qPCR',
        also: 'quantitative PCR',
        definition:
          'Amplification of a DNA region monitored in real time by fluorescence. qPCR detects a target and supports absolute quantification using a standard curve, or relative quantification against a reference.',
      },
      {
        id: 'qtl',
        term: 'QTL',
        also: 'quantitative trait locus',
        definition:
          'A region of the genome associated with variation in a measurable trait, such as disease resistance. A QTL guides the search for candidate genes and can be used in selection.',
      },
      {
        id: 'radseq',
        term: 'RADseq',
        definition:
          'Sequencing the DNA fragments around restriction sites spread across the genome. It provides thousands of SNPs for population genomics without sequencing whole genomes.',
      },
      {
        id: 'selection-genomique',
        term: 'Genomic selection',
        definition:
          'Choosing breeders from genetic values predicted by markers covering the genome, calibrated on a reference population whose traits are measured.',
        link: { to: { kind: 'service', id: 'selection' }, label: 'Genomic selection' },
      },
      {
        id: 'sequence-erc',
        term: 'Mitigation hierarchy',
        also: 'avoid, reduce, offset (ERC in France)',
        definition:
          'The approach that organises how development projects take the environment into account: avoid impacts, reduce those that cannot be avoided, offset residual impacts.',
        link: {
          to: { kind: 'application', id: 'environnement-bureaux-d-etudes' },
          label: 'Environmental studies',
        },
      },
      {
        id: 'sequencage-longue-lecture',
        term: 'Long-read sequencing',
        also: 'Nanopore',
        definition:
          'Sequencing long DNA fragments in one piece, often several thousand bases long. Depending on the protocol and available references, it can improve genome assembly or taxonomic resolution.',
      },
      {
        id: 'snp',
        term: 'SNP',
        also: 'single nucleotide polymorphism',
        definition:
          'A position in the genome where a single base (A, C, G or T) varies between individuals. Being very numerous, SNPs serve as markers to measure the diversity, structure or ancestry of populations.',
      },
      {
        id: 'wgs',
        term: 'WGS',
        also: 'whole-genome sequencing',
        definition:
          'Sequencing that aims to cover an individual’s whole genome to investigate variants, adaptation, history or the genetic architecture of traits. Coverage and detectable variants depend on the technology, sequencing depth and analysis.',
      },
    ] as GlossaryTerm[],
  },
  siteMap: {
    eyebrow: 'Site map',
    title: 'Every page\nof LDgenX.',
    intro:
      'Services, applications, case studies, publications and resources: the whole site, page by page.',
    groups: {
      main: 'Essentials',
      services: 'Services',
      applications: 'Applications',
      studies: 'Case studies and scientific work',
      research: 'Publications',
      company: 'The company',
      resources: 'Resources',
      legal: 'Information',
    },
  },
};

export const cir = {
  eyebrow: 'French research tax credit',
  sourceLabel: 'Official CIR conditions',
  sourceUrl: 'https://entreprendre.service-public.gouv.fr/vosdroits/F23533',
  value: '30%',
  valueLabel: 'rate on eligible R&D expenditure in mainland France',
  title: 'LDgenX is CIR-approved.',
  text: 'Eligible R&D work you outsource to us may count towards your French research tax credit. Eligibility depends on the nature of the work and your company’s circumstances.',
  note: 'In mainland France: 30% up to €100 million of eligible expenditure, then 5% above that threshold, within the conditions and ceilings of article 244 quater B of the French general tax code.',
  action: 'Discuss your R&D project',
};

export const samplingKits = {
  eyebrow: 'Sampling kits',
  title: 'A kit for every environment.',
  intro:
    'LDgenX prepares sampling kits suited to the environment you study. Their contents are agreed with the team according to your protocol and planned analyses.',
  kits: [
    {
      id: 'eau-de-mer',
      name: 'Seawater',
      text: 'For sampling at sea, in ports and estuaries.',
    },
    {
      id: 'eau-douce',
      name: 'Freshwater',
      text: 'For rivers, lakes, ponds and wetlands.',
    },
    { id: 'sol', name: 'Soil', text: 'For agricultural, forest or natural soils.' },
    { id: 'air', name: 'Air', text: 'For capturing the DNA present in ambient air.' },
  ],
  action: 'Ask for a kit',
};
