// English version of extra.fr.ts. Works, biographies, publications, equipment, about and
// contact texts follow ldgenx.com (collected 13 October 2026), with the same spelling fixes as
// the French; the Artois-Picardie results are translated from the Water Agency's French
// documents. Ids and figures are those of the French catalogue.
import type {
  CustomAssay,
  EquipmentItem,
  Person,
  StudySiteRecord,
  Work,
  PartnerMember,
} from './types';

export const works: Work[] = [
  {
    id: 'conservation',
    slug: 'conservation',
    title: 'Conservation',
    category: 'Scientific work · conservation genomics',
    summary:
      'Genetic diversity of trout in the Orb river, domestic ancestry in brook trout and the effects of introducing domestic alleles.',
    image: 'cas-truites',
    facts: [
      { label: 'Species', value: 'Brown trout, brook trout' },
      { label: 'Markers', value: '196K and 11,803 SNP markers' },
      { label: 'Publications', value: 'Leitwein et al. 2016, 2019 and 2021' },
    ],
    service: 'genomique-des-populations',
    source: 'https://www.ldgenx.com/services/conservation',
    sections: [
      {
        title: 'Genetic diversity of trout in the Orb river',
        paragraphs: [
          'The use of 196K SNP markers allowed us to estimate the genetic diversity and the inbreeding index of the wild (La Mare, Gravezon and Orb) and domestic (Atlantic and Mediterranean) brown trout (*Salmo trutta*) populations of the Orb basin.',
          'We were able to show that the wild Gravezon population had lower genetic diversity and a high inbreeding rate compared with the wild La Mare and Orb populations (Table 1; [Leitwein et al. 2016](https://pubmed.ncbi.nlm.nih.gov/27666575/)).',
          'Furthermore, we demonstrated that the Mediterranean domestic strain had very low diversity and was highly inbred, in contrast to the Atlantic domestic strain, which had higher genetic diversity.',
          'These results demonstrate that the Mediterranean domestic strain requires specific management to increase its genetic diversity.',
        ],
        figure: {
          image: 'fig-orb-diversite',
          alt: 'Table of genetic diversity and inbreeding indices for the trout populations of the Orb basin',
          caption:
            'Table 1 adapted from [Leitwein et al. 2016](https://pubmed.ncbi.nlm.nih.gov/27666575/), Journal of Fish Biology.',
          legend:
            'Summary for each wild river of the Orb basin (La Mare, Gravezon and Orb) and for the two domestic strains (Atlantic and Mediterranean) of (N) number of individuals, (x) mean number of SNP markers, (He) expected heterozygosity, (Ho) observed heterozygosity, (Fis) inbreeding index and (π) nucleotide diversity. *** significant value p < 0.0001.',
        },
      },
      {
        title: 'Genomic landscape of domestic ancestry in brook trout',
        paragraphs: [
          'Brook trout (*Salvelinus fontinalis*) is a species of high socio-economic interest in Canada. In the province of Quebec, a domestic strain was created about a hundred years ago to restock rivers for sport fishing. Each year, more than 650 tonnes of brook trout are released into Canadian rivers, promoting hybridisation between domestic and wild individuals ([Leitwein et al. 2019](https://onlinelibrary.wiley.com/doi/10.1111/mec.15256)).',
          'Using 11,803 SNP markers, the ancestry of individuals could be inferred and the proportion of domestic alleles in wild rivers estimated. Using linkage information and the proportion of domestic ancestry, the hybrid classes of individuals could be identified. Individuals were categorised either as (i) “recent hybrids”, offspring of early generations of crosses between wild and domestic individuals (< 10 generations), or (ii) “ancient hybrids”, offspring of distant admixture (> 10 generations). Once individuals were assigned to their hybrid class, the rate of introgression of domestic alleles along the genome could be estimated. This approach revealed high variability, with genomic regions of high or low domestic ancestry that are likely to be under natural selection (Figure 1; [Leitwein et al. 2019](https://onlinelibrary.wiley.com/doi/10.1111/mec.15256)).',
        ],
        figure: {
          image: 'fig-omble-ancestralite',
          alt: 'Domestic ancestry rates along the brook trout linkage groups',
          caption:
            'Figure 1 from [Leitwein et al. 2019](https://onlinelibrary.wiley.com/doi/10.1111/mec.15256), Molecular Ecology.',
          legend:
            'Domestic ancestry rates along the 41 brook trout linkage groups (LG) for individuals in the recent hybrid category.',
        },
      },
      {
        title: 'Effects of introducing domestic alleles',
        paragraphs: [
          'In brook trout, we observed variations of domestic ancestry in wild populations. For hybrid individuals, mainly beneficial effects of the introgression of domestic alleles into wild populations were observed. Domestic alleles bring (i) diversity to regions of the “wild” genome with low genetic diversity and (ii) potentially deleterious recessive alleles.',
          'Beyond these potential beneficial effects, however, purging of domestic alleles was also observed. These mechanisms reflect negative effects of introducing domestic alleles into some regions of the genome ([Leitwein et al. 2019](https://onlinelibrary.wiley.com/doi/10.1111/mec.15256) and [2021](https://pubmed.ncbi.nlm.nih.gov/33916757/)).',
          'For example, on linkage group 26 (Figure 2), an excess of domestic ancestry associated with potentially deleterious recessive alleles can be observed.',
        ],
        figure: {
          image: 'fig-omble-lg26',
          alt: 'Excess or deficit of domestic ancestry depending on the alleles, linkage group 26',
          caption:
            'Figure 2 adapted from [Leitwein et al. 2019](https://onlinelibrary.wiley.com/doi/10.1111/mec.15256), Molecular Ecology.',
          legend:
            'Excess or deficit of domestic ancestry depending on the presence of non-deleterious or potentially deleterious alleles on linkage group 26 in ancient hybrid brook trout.',
        },
      },
    ],
  },
  {
    id: 'tracabilite',
    slug: 'traceability',
    title: 'Traceability',
    category: 'Scientific work · population genomics',
    summary:
      'Origin of the trout of the Orb basin, age of domestic introductions and development of a high-density trout SNP chip.',
    image: 'fig-puce-truite',
    facts: [
      { label: 'Species', value: 'Brown trout (Salmo trutta)' },
      { label: 'Markers', value: '86,175 SNPs (RAD sequencing), 12,204-SNP chip' },
      { label: 'Publications', value: 'Leitwein et al. 2018, Saint-Pé et al. 2019' },
    ],
    service: 'genomique-des-populations',
    source: 'https://www.ldgenx.com/services/traceability',
    sections: [
      {
        title: 'Genomic analyses for traceability: the trout of the Orb',
        paragraphs: [
          'The Mediterranean basin of the Orb (Hérault), a river in southern France covering 1,580 km², has been restocked since the late 1960s with domestic brown trout (*Salmo trutta*) of Atlantic and Mediterranean origin, to increase the local Mediterranean populations for recreational fishing.',
          'In the study by [Leitwein et al. (2018)](https://pubmed.ncbi.nlm.nih.gov/30054960/), 86,175 SNP (single nucleotide polymorphism) markers from RAD sequencing were used to identify the proportion of domestic (Atlantic and Mediterranean) alleles in the wild populations of the Orb basin.',
          'This identified individuals of Atlantic domestic origin (fish-farm escapees) in the Gravezon river, individuals of Mediterranean domestic origin in the Mare river, and hybrid individuals carrying Atlantic and Mediterranean domestic alleles in all three wild rivers (Figure 1).',
        ],
        figure: {
          image: 'fig-orb-admixture',
          alt: 'Proportions of domestic and wild ancestry of the trout in the three rivers',
          caption:
            'Figure 1 adapted from [Leitwein et al. 2018](https://pubmed.ncbi.nlm.nih.gov/30054960/), Molecular Ecology.',
          legend:
            'Each bar shows the proportion of Atlantic domestic ancestry in blue, Mediterranean domestic in red and wild in green for the three populations of Gravezon (Grav), Mare (Mare) and Orb (Orb).',
        },
      },
      {
        title: 'The age of the introductions',
        paragraphs: [
          'Studying the Atlantic and Mediterranean domestic haplotypes (segments) also allowed us to estimate the age of the introductions in each of the three rivers.',
          'Atlantic domestic individuals were introduced on average 24.01 generations ago in the Gravezon river, 22.31 generations ago in the Mare river and 30.9 generations ago in the Orb river (Figure 2).',
          'Similarly, the introduction of Mediterranean domestic trout was estimated at 11.51 generations ago in the Gravezon river, 25.07 generations in the Mare and 23.23 in the Orb (Figure 2).',
        ],
        figure: {
          image: 'fig-orb-introductions',
          alt: 'Time in generations since domestic individuals were introduced into the three populations',
          caption:
            'Figure 2 from [Leitwein et al. 2018](https://pubmed.ncbi.nlm.nih.gov/30054960/), Molecular Ecology.',
          legend:
            'Time in generations since the introduction of Atlantic domestic (blue) and Mediterranean domestic (red) individuals into the three populations Gravezon, La Mare and Orb.',
        },
      },
      {
        title: 'Developing genomic tools: the high-density trout chip',
        paragraphs: [
          'Following this study, we developed a high-density chip of 12,204 SNP markers spread evenly along the 40 linkage groups (LG) of brown trout (*Salmo trutta*) (Figure 3; [Saint-Pé et al. 2019](https://bmcgenomics.biomedcentral.com/articles/10.1186/s12864-019-5958-9)).',
          'This chip allows low-cost, regular and comparable management across population genetic studies.',
          'It is effective both at distinguishing trout of Atlantic and Mediterranean origin and at measuring hybridisation levels.',
        ],
        figure: {
          image: 'fig-puce-truite',
          alt: 'Positions of the 12,204 SNP markers along the 40 linkage groups of brown trout',
          caption:
            'Figure 3 from [Saint-Pé et al. (2019)](https://bmcgenomics.biomedcentral.com/articles/10.1186/s12864-019-5958-9), BMC Genomics.',
          legend:
            'Positions (in centiMorgans) of the 12,204 SNP markers along the 40 linkage groups of brown trout (*Salmo trutta*).',
        },
      },
    ],
  },
  {
    id: 'selection-genomique',
    slug: 'genomic-selection-page',
    title: 'Genomic selection',
    category: 'Scientific work · genomic selection',
    summary:
      'Genes for resistance to viral nervous necrosis in European sea bass and genetic values for selecting traits of interest.',
    image: 'cas-bar',
    facts: [
      { label: 'Species', value: 'European sea bass, pig' },
      { label: 'Approaches', value: 'Whole-genome sequencing, GWAS, genomic prediction' },
      { label: 'Publications', value: 'Delpuech et al. 2022, Aliakbari et al., Griot et al. 2021' },
    ],
    service: 'selection',
    source: 'https://www.ldgenx.com/services/genomic-selection-page',
    sections: [
      {
        title: 'Identifying genes for resistance to viral nervous necrosis in sea bass',
        paragraphs: [
          'Whole-genome sequencing of nearly 400 sea bass allowed fine mapping of the viral nervous necrosis (VNN) resistance phenotype in European sea bass (*Dicentrarchus labrax*).',
          'Combining high-throughput sequencing data with medium-density genotyping data (~57K SNP markers) and phenotypic data revealed a strong association between a quantitative trait locus (QTL) on linkage group 12 (LG12) and sea bass survival when facing VNN infection (Figure 1, [Delpuech et al. 2022](https://doi.org/10.1101/2022.05.31.494209)).',
          'From the sea bass genome annotation, openly available in public databases, we identified two genes of interest, ZDHHC14 and IFI6. Showing the role of an interferon-induced protein in the mechanisms of survival to VNN is a considerable advance in the field.',
          'Hatcheries can now use this knowledge to improve the genomic selection of their lines and develop more resistant sea bass.',
        ],
        figure: {
          image: 'fig-bar-nodavirose',
          alt: 'Manhattan plot of genetic associations with VNN resistance in European sea bass',
          caption:
            'Figure 1 from [Delpuech et al. (2022)](https://doi.org/10.1101/2022.05.31.494209), bioRxiv.',
          legend:
            'Manhattan plot of the genotype–phenotype associations obtained in the study of VNN resistance in European sea bass.',
        },
      },
      {
        title: 'Studying genetic values to select traits of interest',
        paragraphs: [
          'Genomic selection has been used to improve many traits of interest with fairly high heritability. This type of approach has been applied successfully to many farmed species, and recently to aquaculture species for pathogen resistance. It has delivered an average genetic gain of 12.5% per generation for resistance to various diseases. Genomic selection is therefore a promising approach to fight diseases affecting wild as well as domestic populations ([Griot et al. 2021](https://doi.org/10.3389/fgene.2021.665920)).',
          'In a reference article on genomic prediction, [Aliakbari et al.](https://doi.org/10.1186/s12711-020-00576-0) showed similar genomic prediction using either (i) a training set of animals from genetically related lines or (ii) a training set from the target population. Where related data can be combined with data from the target population, accuracy can only increase for traits (Figure 3).',
          'These quantitative genetics results improve the design of reference populations, especially for starting genomic selection in populations with few historical samples.',
        ],
        figure: {
          image: 'fig-gebv',
          alt: 'Correlations between estimated genomic values under the training scenarios',
          caption: 'Figure 3 from [Aliakbari et al.](https://doi.org/10.1186/s12711-020-00576-0)',
          legend:
            'Correlations between GEBVp and GEBVw, with their error bars, for the HRFI (a) and LRFI (b) lines. * = significant difference from scenario 1 (control) by Williams’ t-test at the 0.05 level. RFI = residual feed intake, ADG = average daily gain, FCR = feed conversion ratio, DFI = daily feed intake, BFT = backfat thickness.',
        },
      },
    ],
  },
];

export const people: Person[] = [
  {
    id: 'maeva-leitwein',
    slug: 'dr-maeva-leitwein',
    name: 'Dr Maeva Leitwein',
    role: 'Co-founder · Population genomics',
    title: 'Co-founder of LDgenX',
    initials: 'ML',
    photo: 'portrait-maeva',
    service: 'genomique-des-populations',
    bio: 'A specialist in genomics and epigenomics, Maeva studies diversity, adaptation and the interactions between natural and domestic populations. She brings her research experience to questions of conservation and management.',
    biography: [
      'Coming from the academic world and originally from the Molène archipelago in Brittany, I am particularly interested in the use of genomic tools for biodiversity conservation.',
      'My research mainly focuses on understanding and evaluating the evolutionary mechanisms that shape intra- and inter-population biodiversity at different time scales.',
      'After a Master’s degree in marine biology, I specialised during my PhD in the use of genomics to assess the consequences of introducing domestic individuals into wild populations. During my post-doctorate in Canada, I used genomic and epigenomic tools to study the impact of fish farms on the genomic heritage and fitness of wild populations. These approaches helped me understand the evolutionary forces (positive or negative) that shape the genomic landscape of natural populations.',
      'Back in France since 2021, I now study the effects of temperature, in the context of global warming, on sex determination in European sea bass. Alongside this, I study the effects of lineage mixing (ancestry) on the phenotype of individuals and the consequences for the adaptation of species to their environment.',
      'Within LDgenX, I bring my expertise in genomics to answer conservation questions for better management of natural and domestic populations.',
    ],
    source: 'https://www.ldgenx.com/team/dr-maeva-leitwein',
  },
  {
    id: 'emilie-delpuech',
    slug: 'dr-emilie-delpuech',
    name: 'Dr Emilie Delpuech',
    role: 'Co-founder · Bioinformatics',
    title: 'Co-founder of LDgenX',
    initials: 'ED',
    photo: 'portrait-emilie',
    service: 'bioinformatique',
    bio: 'At the crossroads of life sciences and computer science, Emilie develops approaches to analyse omics data. Her background in animal genetics and genomic selection informs the analyses built for each project.',
    biography: [
      'Passionate about living organisms and their study, I devoted a large part of my academic career to learning the specificities of plant and animal biology.',
      'As methods for analysing biological data advanced, I specialised in bioinformatics. Today I have the knowledge to analyse different so-called omics datasets.',
      'Thanks to my dual training in life sciences and computer science, I can join a wide range of biology projects and set up the best possible bioinformatics approach for the question asked. In my analyses, I use several programming languages to build analysis pipelines that answer biological questions.',
      'During my PhD and my two post-doctorates, I worked on animal genetics to improve the genomic selection of farmed species from genetic and phenotypic data.',
      'I bring all my knowledge of software development to LDgenX, to carry out the analyses most specific to each subject of study.',
    ],
    source: 'https://www.ldgenx.com/team/dr-emilie-delpuech',
  },
  {
    id: 'maxime-lambert',
    slug: '',
    name: 'Maxime Lambert',
    role: 'Laboratory engineer · Molecular biology',
    title: 'Laboratory engineer',
    initials: 'ML',
    photo: 'portrait-maxime',
    service: 'sequencage-dpcr',
    bio: 'Maxime brings his expertise in nucleic acid extraction, library preparation and long-read sequencing. He designs and adapts experimental approaches to the scientific questions.',
    biography: [
      'Passionate about life sciences and innovative technologies, I have focused my academic and professional career on molecular biology and genomics.',
      'My experience has led me to develop a strong interest in molecular approaches for biodiversity research, particularly during my time at the Institute of Evolutionary Sciences of Montpellier (ISEM, University of Montpellier, CNRS, IRD, EPHE, CIRAD, INRAE).',
      'There, I gained extensive expertise in molecular biology, from nucleic acid extraction on complex matrices to sequencing library preparation.',
      'Specialising in long-read sequencing technologies, particularly Oxford Nanopore Technologies, I develop and optimise protocols for a wide range of applications, including genomics, metagenomics and the characterisation of complex organisms. My experience also includes method development and the optimisation of experimental workflows.',
      'At LDgenX, I contribute my expertise in molecular biology and sequencing to design and implement robust experimental approaches tailored to the specific needs of each project.',
    ],
    source: 'https://www.ldgenx.com/about-us/team',
  },
  {
    id: 'damien-crestel',
    slug: '',
    name: 'Damien Crestel',
    role: 'Bioinformatician · Population and quantitative genetics',
    title: 'Bioinformatician',
    initials: 'DC',
    photo: 'portrait-damien',
    service: 'bioinformatique',
    bio: 'An agronomist engineer, Damien devoted his PhD to the genetic basis of temperature adaptation in European sea bass. He brings biostatistics, modelling and genomics to projects ranging from eDNA to the evolution of natural populations.',
    biography: [
      'Having grown up in a farming community in Brittany, I trained as an agronomist engineer, specialising in fisheries and aquaculture sciences. I then completed a PhD on the genetic basis of temperature adaptation in European sea bass, a major aquaculture species in Europe. This path reflects my interest in biodiversity and the life sciences, and my wish to improve knowledge of how biodiversity evolves in the face of current global change.',
      'My experience has developed my skills from setting up and running experiments and collecting data to analysing them with biostatistical and genomic tools. Thanks to this background, I can adapt to a range of projects that require the processing of phenotypic and genomic data. In my analyses, I have used various bioinformatics tools and languages to address questions in population genetics and quantitative genetics. I have also managed large phenotypic datasets requiring modelling skills to build models of varying complexity.',
      'At LDgenX, my knowledge of evolutionary biology and of bioinformatic and statistical analysis helps answer a wide range of study questions, from the use of eDNA to the evolution of natural populations.',
    ],
    source: 'Profile provided by LDgenX (October 2026)',
  },
];

// Equipment as published on ldgenx.com/services/equipment (names) and ldgenx.fr/services/materiel
// (prices, excluding VAT; ldgenx.com publishes none).
export const equipment: EquipmentItem[] = [
  {
    id: 'pompe-triple',
    name: 'Triple pump',
    summary: 'Three separate parallel filters with Waterra capsules.',
    specs: [
      'Inlet hose size: 12 mm or 4 mm diameter',
      'Maximum height between the water surface and the pump: 1.5 m with 12 mm hoses and 5 m with a 4 mm hose (model 1); 3 m with 12 mm hoses and 15 m with a 6 mm hose (model 2)',
      'Effective pumping speed: 3 L/min (model 1) or 10 L/min (model 2)',
      'Three integrated flow meters',
      '8-hour battery life (model 1) or 10-hour battery life (model 2), Opti Battery lithium-ion battery included',
      'Pore size: 0.1 µm, 0.22 µm, 0.45 µm, 1.2 µm and 5 µm',
    ],
    prices: [
      { label: 'Triple pump, model 1', amount: 1900 },
      { label: 'Triple pump, model 2', amount: 2100 },
      { label: 'Capsules and preservation buffer', amount: 40 },
    ],
    images: [
      { name: 'materiel-pompe', alt: 'Closed eDNA triple pump with its three flow meters' },
      { name: 'materiel-pompe-interieur', alt: 'eDNA triple pump, control panel' },
      { name: 'materiel-capsules', alt: 'Waterra filtration capsules with different pore sizes' },
    ],
  },
  {
    id: 'stick-pump',
    name: 'StickPump',
    summary: 'Four filters operating in parallel.',
    specs: [
      'Pumping rate: 40 L/min',
      'Integrated flow meter',
      'Makita 18 V battery (not included)',
      '20 µm or 5 µm nylon filters, 47 mm diameter',
    ],
    prices: [
      { label: 'StickPump', amount: 1270 },
      { label: 'Filters', amount: 18 },
    ],
    images: [{ name: 'materiel-stickpump', alt: 'StickPump for eDNA filtration' }],
  },
  {
    id: 'torpille',
    name: 'Yellow Submarine',
    summary: 'Three parallel filtration channels, towed behind a boat.',
    specs: [
      'Vacuum-assisted filtration; filtered volume depends on towing speed (approximately 50 L per filter in 10 minutes at 6 knots)',
      '20 µm or 5 µm nylon filters, 47 mm diameter',
      'Designed to be towed behind a boat',
    ],
    prices: [
      { label: 'Yellow Submarine', amount: 1400 },
      { label: 'Filters', amount: 18 },
    ],
    images: [
      { name: 'materiel-torpille', alt: 'Yellow Submarine towed eDNA sampler' },
      {
        name: 'materiel-torpille-terrain',
        alt: 'Yellow Submarine towed behind a boat during sampling',
      },
    ],
  },
];

export const partnerIntro = {
  text: 'LDgenX collaborates with research institutes, universities, environmental consultancies and companies to develop innovative scientific solutions. These partnerships bring together complementary expertise to address complex challenges in biodiversity conservation, agriculture and aquaculture.',
  groups: [
    {
      title: 'Trusted by',
      text: '',
      members: [
        { name: 'Fédération Nationale des Chasseurs', logo: 'federation-nationale-des-chasseurs' },
        { name: 'Plastic at Sea', logo: 'plastic-at-sea' },
        { name: 'Qualyse', logo: 'qualyse' },
        { name: 'Université de Corse', logo: 'universite-de-corse' },
        { name: 'Pays de l’Ours – ADET', logo: 'pays-de-l-ours-adet' },
        { name: 'Artois-Picardie Water Agency', logo: 'agence-eau-artois-picardie' },
        { name: 'Groupe Barba', logo: 'groupe-barba' },
        { name: 'EPHE', logo: 'ephe' },
        { name: 'Biotope', logo: 'biotope' },
        { name: 'Line Up Ocean', logo: 'line-up-ocean' },
      ] as PartnerMember[],
    },
    {
      title: 'Public research institutes',
      text: 'Our expertise is rooted in years of experience within leading public research institutes, where we received our scientific training and carried out our first research projects.',
      members: [
        { name: 'MARBEC', logo: 'marbec' },
        { name: 'Ifremer', logo: 'ifremer' },
        { name: 'INRAE', logo: 'inrae' },
        { name: 'CNRS', logo: 'cnrs' },
        { name: 'University of Montpellier', logo: 'universite-montpellier' },
      ] as PartnerMember[],
    },
    {
      title: 'Supported by',
      text: '',
      members: [
        { name: 'INRAE Start and Grow', logo: 'inrae-start-and-grow' },
        { name: 'Créalia Occitanie', logo: 'crealia' },
        { name: 'Montpellier Business School', logo: 'montpellier-business-school' },
        { name: 'Pôle Mer Méditerranée', logo: 'pole-mer' },
        { name: 'Agrovallée and Initium incubator', logo: 'agrovallee-initium' },
        { name: 'Incubateur 1.618', logo: 'incubateur-1618' },
        { name: 'Celimer', logo: 'celimer' },
        { name: 'Bpifrance · Deep Tech label', logo: 'bpifrance-deeptech' },
        { name: 'Pépite Deeptech', logo: 'pepite-deeptech' },
      ] as PartnerMember[],
    },
  ],
};

export const companyStory = {
  mission:
    'We believe that genomic technologies are a powerful tool to improve our understanding, management and conservation of biodiversity. Our mission is to support environmental managers, researchers, public authorities, consulting firms and industry partners in harnessing these technologies to generate reliable data that inform evidence-based decision-making.',
  ambition:
    'Our ambition is to make genomic technologies accessible and actionable, empowering better decision-making to address today’s and tomorrow’s environmental challenges.',
  deeptech:
    'Innovation is at the core of LDgenX’s development. We conduct research and development to design the next generation of genomic tools for biodiversity monitoring and the sustainable management of natural resources.',
  status:
    'LDgenX is a French DeepTech company labelled Jeune Entreprise Innovante (JEI), specialising in applied genomics.',
  supports: [
    'DeepTech Label',
    'French Tech Emergence Grant',
    'Créalia',
    'Bpifrance',
    'University Innovation Hub (Pôle Universitaire d’Innovation)',
    'Partner research institutes and universities',
  ],
};

export const news = {
  label: 'Event',
  title: 'BlueTechShow, 4th edition',
  text: 'Meet part of the LDgenX team on 20 and 21 October 2026 in Canet-en-Roussillon.',
  short: 'BlueTechShow: meet LDgenX on 20 and 21 October in Canet-en-Roussillon',
  href: 'https://bluetechshow.fr/',
  image: 'bluetechshow',
  until: '2026-10-21',
};

export const booking = {
  title: 'Schedule a meeting',
  text: 'Do you have a project, an idea or a challenge involving genetics, environmental DNA (eDNA), population genomics or genomic selection? Let’s schedule a free, no-obligation 15-minute consultation to discuss it.',
  benefits: [
    'Briefly present your project, needs or ideas',
    'Explore how LDgenX’s innovative genomic solutions can support your objectives',
    'Ask your questions directly to one of LDgenX’s founders and genomics experts',
  ],
  note: 'A simple conversation can be the first step toward a successful collaboration.',
  action: '15-minute free consultation',
  alternate: 'https://axonaut.com/public/booking/b4afed/pageShow/rendez-vous-avec-ldgenx-9b56c1',
};

// Artois-Picardie: translated from the Water Agency's article, final report and restitution
// presentation (French documents). Same values as extra.fr.ts; decimal points in English.
export const artoisPicardie = {
  documents: [
    {
      title: 'Artois-Picardie Water Agency article',
      date: '6 August 2026',
      href: 'https://www.eau-artois-picardie.fr/etude-de-la-biodiversite-de-lichtyofaune-dans-les-estuaires-et-les-ports-avec-ladn-environnemental',
      kind: 'Web page, in French',
    },
    {
      title: 'Final report: presentation of the results',
      date: 'Version 2, 28 May 2026',
      href: 'https://www.eau-artois-picardie.fr/sites/default/files/rapport_final_adne_estuaires_et_ports_aeap_0.pdf',
      kind: 'PDF, 71 pages, in French',
    },
    {
      title: 'Restitution meeting presentation',
      date: 'Douai, 30 June 2026',
      href: 'https://www.eau-artois-picardie.fr/sites/default/files/presentation_reunion_de_restitution_adne_estuaires_et_ports_aeap_30062026_0.pdf',
      kind: 'PDF, 29 slides, in French',
    },
  ],
  credit:
    'Figures: final report and restitution presentation by the Qualyse, LDgenX and Prelevmar consortium for the Artois-Picardie Water Agency (2026), in French.',
  objectives: [
    'Improve knowledge of biodiversity in ports and estuaries.',
    'Compare eDNA with the conventional methods used in estuaries under the Water Framework Directive (WFD).',
  ],
  findings: [
    'The median number of species is fairly similar between estuaries and ports, except for the Slack estuary.',
    'Species are not distributed in the same way between ports and estuaries.',
    'Juvenile marine species dominate the downstream part of the sites; upstream, the estuaries and the port of Boulogne-sur-Mer show a large proportion of diadromous species.',
    'A large share of freshwater species is found at all sites, most likely reflecting rivers carrying DNA from upstream.',
  ],
  keyFigures: [
    { value: '8', label: 'sites, from the ports of Dunkirk to the Somme estuary' },
    { value: '15', label: 'stations (sectors) sampled' },
    { value: '45', label: 'filters: three replicates per station' },
    { value: '2', label: 'genetic markers, Teleo and Elas02' },
  ],
  protocol: [
    {
      title: 'In the field',
      text: 'From 25 November to 3 December 2025, three replicates filtered simultaneously at each station with three pumps in parallel, on sterile 0.45 µm Waterra capsules, then preserved in Longmire buffer. Filtered volumes ranged from 2 to 90 L, averaging about 29 L, because of high turbidity.',
    },
    {
      title: 'In the laboratory',
      text: 'DNA extraction (ZymoBIOMICS kit), amplification of two markers: Teleo (teleost 12S gene) and Elas02 (elasmobranchs), five PCR replicates per sample, Ion Torrent S5 Prime sequencing. The sequenced negative controls contain no sequences.',
    },
    {
      title: 'In bioinformatics',
      text: 'Demultiplexing with scripts developed by LDgenX, SAMBA v4.0 pipeline (QIIME2, DADA2), taxonomic assignment against the MIDORI2 database. Of 356 ASVs detected, 96 were assigned to a fish species: 23 taxa with Teleo, 13 with Elas02.',
    },
  ],
  guilds: [
    {
      code: 'MJ',
      name: 'Marine juveniles',
      text: 'Marine species using the estuary as a nursery.',
    },
    {
      code: 'ER',
      name: 'Estuarine residents',
      text: 'Species completing all or a major part of their life cycle in the estuary.',
    },
    {
      code: 'MA',
      name: 'Marine adventitious',
      text: 'Marine species occasionally visiting the estuary or port areas.',
    },
    {
      code: 'DIA',
      name: 'Diadromous migrants',
      text: 'Species linking marine and freshwater environments, such as salmon or eel.',
    },
    {
      code: 'FW',
      name: 'Freshwater',
      text: 'Species reflecting continental influence and river inputs.',
    },
  ],
  core: {
    estuaries: [
      'Clupea harengus (herring)',
      'Dicentrarchus labrax (sea bass)',
      'Pomatoschistus microps (common goby)',
      'Merlangius merlangus (whiting)',
      'Pollachius virens (saithe)',
    ],
    ports: [
      'Clupea harengus (herring)',
      'Merlangius merlangus (whiting)',
      'Dicentrarchus labrax (sea bass)',
    ],
    portsFrequent: [
      'Sardina pilchardus (sardine)',
      'Pollachius virens (saithe)',
      'Pomatoschistus microps (common goby)',
    ],
  },
  caution:
    'Six species detected with Teleo have never been reported in the area (Asterias amurensis, Macrobrachium nipponense, Oncorhynchus keta, Oncorhynchus tshawytscha, Sardinops sagax, Squalius lepidus), nor has one species detected with Elas02 (Atherina hepsetus). The report attributes them to assignment errors, close sequences, contamination or DNA transport; doubtful taxa are excluded from the guild analysis.',
  comparison: [
    'The comparison with the beam trawl could only be carried out in the Somme estuary, the reference system monitored under the WFD.',
    'Four species are detected by both methods: herring, whiting, common goby and sea bass. The trawl shows 21 exclusive taxa, mostly benthic and demersal; eDNA shows 14, including mobile or freshwater species.',
    'Sampling efforts differ greatly: several years of trawl hauls on one side, a single campaign of water sampling on the other.',
    'The ranking of guilds is preserved between the two approaches; eDNA reveals a higher proportion of freshwater species.',
  ],
  turbidity:
    'Turbidity affects detection: detected richness tends to decrease as turbidity increases (R² = 0.32; p = 0.026).',
  perspectives: [
    'Campaigns over the four seasons in the Somme estuary, to measure the temporal representativeness of the method.',
    'Continuous turbidity monitoring during filtration.',
    'Longer fragments and long-read sequencing (Nanopore) to improve taxonomic resolution.',
  ],
  richnessNote:
    'Species totals per site vary with the marker and filters applied between the presentation and the report. The richness shown here is that of each sector in the final report; validated data tables are needed for an interactive dashboard.',
  sites: [
    {
      id: 'dunkerque-est',
      name: 'Port of Dunkirk East',
      setting: 'port',
      area: 'Nord',
      figure: 'ap-site-dunkerque-est',
      synthesis:
        'A contrast between the Mardyck basin, marked by the unusual detection of freshwater species (bream, roach, perch, zander), and the Évolution basin, dominated by coastal marine and estuarine species. These freshwater detections must be interpreted with caution: continental water inputs, indirect DNA transfer or contamination.',
      sectors: [
        {
          name: 'Mardyck basin',
          date: '25 November 2025',
          mode: 'Support vessel',
          salinity: '32',
          turbidity: '—',
          volume: '13.7',
          richness: 12,
        },
        {
          name: 'Évolution basin',
          date: '25 November 2025',
          mode: 'Support vessel',
          salinity: '36',
          turbidity: '—',
          volume: '55',
          richness: 10,
        },
      ],
    },
    {
      id: 'dunkerque-ouest',
      name: 'Port of Dunkirk West',
      setting: 'port',
      area: 'Nord',
      figure: 'ap-site-dunkerque-ouest',
      synthesis:
        'Strong dominance of coastal marine species (herring, sardine, whiting, gilthead seabream, sea bass). The more diverse open Atlantic basin also holds estuarine resident species; the detection of perch there seems inconsistent with this marine sector.',
      sectors: [
        {
          name: 'Outer harbour',
          date: '26 November 2025',
          mode: 'Support vessel',
          salinity: '35',
          turbidity: '7',
          volume: '58',
          richness: 7,
        },
        {
          name: 'Open Atlantic basin',
          date: '26 November 2025',
          mode: 'Support vessel',
          salinity: '35',
          turbidity: '4.6',
          volume: '74',
          richness: 11,
        },
      ],
    },
    {
      id: 'calais',
      name: 'Port of Calais',
      setting: 'port',
      area: 'Pas-de-Calais',
      figure: 'ap-site-calais',
      synthesis:
        'Without authorisation for boat access, samples were taken from a pontoon and on foot. The data nevertheless find the species of the 2021-2022 trawl campaigns (herring, whiting, common goby, sea bass, sprat); the low-salinity sector shows more freshwater species.',
      sectors: [
        {
          name: 'Pontoon (outer harbour)',
          date: '27 November 2025',
          mode: 'From a pontoon',
          salinity: '34',
          turbidity: '16.7',
          volume: '40.7',
          richness: 13,
        },
        {
          name: 'Sector on foot',
          date: '27 November 2025',
          mode: 'On foot',
          salinity: '5',
          turbidity: '21',
          volume: '12.3',
          richness: 9,
        },
      ],
    },
    {
      id: 'slack',
      name: 'Slack estuary',
      setting: 'estuaire',
      area: 'Pas-de-Calais',
      figure: 'ap-site-slack',
      synthesis:
        'A single station, on foot: the lowest richness of the campaign, linked to a salinity of about 4 PSU and very low filtered volumes. A mixed assemblage (herring, sea bass, common goby, stickleback, roach); the Atlantic salmon detected remains to be confirmed.',
      sectors: [
        {
          name: 'Station on foot',
          date: '27 November 2025',
          mode: 'On foot',
          salinity: '4',
          turbidity: '49',
          volume: '3.3',
          richness: 6,
        },
      ],
    },
    {
      id: 'boulogne',
      name: 'Port of Boulogne-sur-Mer',
      setting: 'port',
      area: 'Pas-de-Calais',
      figure: 'ap-site-boulogne',
      synthesis:
        'Assemblages dominated by juvenile marine and adventitious marine species, with a stronger estuarine and continental influence on the Liane side. Atlantic salmon, detected in both sectors, remains to be confirmed.',
      sectors: [
        {
          name: 'Sector 2',
          date: '28 November 2025',
          mode: 'Support vessel',
          salinity: '38',
          turbidity: '3',
          volume: '54',
          richness: 10,
        },
        {
          name: 'Lower Liane',
          date: '28 November 2025',
          mode: 'Support vessel',
          salinity: '20',
          turbidity: '6',
          volume: '7.9',
          richness: 9,
        },
      ],
    },
    {
      id: 'canche',
      name: 'Canche bay',
      setting: 'baie',
      area: 'Pas-de-Calais',
      figure: 'ap-site-canche',
      synthesis:
        'A compact setting: the two zones share a common core (herring, whiting, saithe, common goby, sea bass) and remain dominated by juvenile marine species. Bream, unexpected downstream, may reflect DNA transported from upstream.',
      sectors: [
        {
          name: 'Blue zone (downstream)',
          date: '1 December 2025',
          mode: 'Support vessel',
          salinity: '37',
          turbidity: '38',
          volume: '32',
          richness: 9,
        },
        {
          name: 'Yellow zone (upstream)',
          date: '1 December 2025',
          mode: 'Support vessel',
          salinity: '37',
          turbidity: '25',
          volume: '35.3',
          richness: 7,
        },
      ],
    },
    {
      id: 'authie',
      name: 'Authie bay',
      setting: 'baie',
      area: 'Pas-de-Calais and Somme',
      figure: 'ap-site-authie',
      synthesis:
        'The outer zone is dominated by juvenile marine species; the upstream zone is more diverse, with freshwater, estuarine resident and migratory species. The richness observed by eDNA in 2025 exceeds the historical beam trawl values in this estuary.',
      sectors: [
        {
          name: 'Green zone (downstream)',
          date: '2 December 2025',
          mode: 'Support vessel',
          salinity: '37',
          turbidity: '96',
          volume: '9',
          richness: 6,
        },
        {
          name: 'Yellow zone (upstream)',
          date: '2 December 2025',
          mode: 'Support vessel',
          salinity: '24',
          turbidity: '36',
          volume: '22.7',
          richness: 13,
          richnessNote: 'after excluding doubtful taxa',
        },
      ],
    },
    {
      id: 'somme',
      name: 'Somme estuary',
      setting: 'estuaire',
      area: 'Somme',
      figure: 'ap-site-somme',
      synthesis:
        'A clear gradient between a downstream zone dominated by juvenile marine and estuarine resident species (herring, sardine, whiting, sea bass, common goby) and an upstream zone enriched in freshwater species (bream, roach, perch, zander); the detection of Atlantic salmon remains to be confirmed. Reference site for the comparison with the trawl.',
      sectors: [
        {
          name: 'Green zone (downstream)',
          date: '3 December 2025',
          mode: 'Support vessel',
          salinity: '35',
          turbidity: '69',
          volume: '9.4',
          richness: 7,
        },
        {
          name: 'Red zone (upstream)',
          date: '3 December 2025',
          mode: 'Support vessel',
          salinity: '2',
          turbidity: '4.1',
          volume: '6.4',
          richness: 11,
        },
      ],
    },
  ] as StudySiteRecord[],
  figures: {
    stations: {
      image: 'ap-carte-stations',
      caption: 'The 15 stations sampled (restitution presentation, slide 5).',
    },
    speciesTeleo: {
      image: 'ap-especes-teleo',
      caption: 'Species detected with the Teleo marker, by site (presentation, slide 9).',
    },
    speciesElas: {
      image: 'ap-especes-elas',
      caption: 'Species detected with the Elas02 marker, by site (presentation, slide 10).',
    },
    richness: {
      image: 'ap-rapport-richesse',
      caption:
        'Figure 12 of the final report: species richness observed by eDNA in autumn 2025, by sampled site.',
    },
    guilds: {
      image: 'ap-rapport-guildes',
      caption:
        'Distribution of the ecological guilds of the species detected by eDNA at the different sites (final report).',
    },
    localDiversity: {
      image: 'ap-diversite-locale',
      caption:
        'Local diversity and Jaccard distance matrix between sites (presentation, slide 14).',
    },
    venn: {
      image: 'ap-adne-chalut',
      caption: 'eDNA and beam trawl compared, Somme estuary 2025 (presentation, slide 26).',
    },
    guildsTrawl: {
      image: 'ap-guildes-chalut',
      caption:
        'Ecological guilds, eDNA 2025 and beam trawl 2019-2025, Somme estuary (presentation, slide 27).',
    },
    turbidity: {
      image: 'ap-rapport-turbidite',
      caption:
        'Figure 17 of the final report: regression between turbidity (NTU) and observed species richness (R² = 0.32; p = 0.026).',
    },
  },
};

// Targeted DNA assays: English version of customAssay in extra.fr.ts.
export const customAssay: CustomAssay = {
  anchor: 'test-sur-mesure',
  eyebrow: 'Specific primers and probes',
  title: 'Your target species,\na custom DNA assay',
  intro:
    'When no suitable assay is available, LDgenX can design primers and a probe specific to your target species, then develop the approach that detects and quantifies its DNA in your samples.',
  steps: [
    {
      title: 'Define the target',
      text: 'Specify the species, the question asked and the related species not to be confused with it, from the available reference sequences.',
    },
    {
      title: 'Design the primers and probe',
      text: 'Choose a short region of DNA unique to the species: two primers frame it, a fluorescent probe recognises it.',
    },
    {
      title: 'Evaluate the assay’s performance',
      text: 'Check that the assay recognises the target’s DNA and not that of related species, then evaluate how it behaves on reference samples.',
    },
    {
      title: 'Detect and quantify the target DNA',
      text: 'In digital PCR, the sample is split into thousands of partitions: those holding the target DNA light up, which allows its quantity to be estimated.',
    },
  ],
  stepsLabel: 'The steps of developing an assay',
  stage: {
    target: 'Region unique to the species',
    related: 'Related species',
    primers: 'Primers',
    probe: 'Probe',
    partitions: 'dPCR partitions',
    yourSpecies: 'Your target species',
  },
  quantNote:
    'dPCR estimates a quantity of target DNA, as a number of copies; it does not directly count the individuals present.',
  illustration: 'Illustration of the principle',
  targetsLabel: 'Examples presented by LDgenX',
  targets: [
    {
      id: 'oursin-violet',
      name: 'Purple sea urchin',
      latin: 'Paracentrotus lividus',
      image: 'cas-oursin',
      source: 'https://www.ldgenx.fr/services/sequencage-dpcr',
    },
    {
      id: 'especes-mediterraneennes',
      name: 'Iconic Mediterranean species',
      group: true,
      image: 'cas-requin',
      source: 'https://www.ldgenx.com/services/sequencing-dpcr',
    },
  ],
  otherTitle: 'Is your species not on the list?',
  otherText:
    'Tell us about the species, your question and your samples: we will look with you at developing a suitable assay.',
  otherAction: 'Discuss your assay',
  play: 'Play the animation',
  pause: 'Pause the animation',
  home: {
    eyebrow: 'Targeted DNA assays',
    title: 'Your target species, a custom DNA assay',
    text: 'Specific primers and probe, then detection and quantification of the species’ DNA by dPCR.',
    link: 'Discover the approach',
  },
};

// The ERC sequence on Environmental studies: English version of erc in extra.fr.ts.
export const erc = {
  eyebrow: 'ERC sequence',
  title: 'Data to inform\nthe ERC sequence',
  intro:
    'The French “Éviter, Réduire, Compenser” sequence (avoid, reduce, compensate) organises how development projects take the environment into account. DNA analyses provide biodiversity data along the way, alongside naturalist surveys and ecological expertise.',
  letters: ['Avoid', 'Reduce', 'Compensate'],
  statesLabel: 'Where the analyses come in',
  states: [
    {
      label: 'Know the baseline',
      moment: 'Before the project',
      text: 'eDNA biodiversity survey and search for protected or invasive species: spotting the issues early helps to avoid, then reduce impacts.',
      deliverable: 'List of the species detected per site, with their interpretation and limits.',
      letters: [0, 1],
    },
    {
      label: 'Monitor change',
      moment: 'During and after the works',
      text: 'The same protocols, at the same sites, in comparable periods: successive campaigns show how biodiversity changes.',
      deliverable: 'Comparison between campaigns, maps and statistical analyses.',
      letters: [1],
    },
    {
      label: 'Document the measures',
      moment: 'During operation',
      text: 'On sites concerned by reduction or compensation measures, eDNA documents the presence of the target species and how communities change.',
      deliverable: 'Decision-support report, for the monitoring of the measures.',
      letters: [1, 2],
    },
  ],
  deliverableLabel: 'What you receive',
  caution:
    'eDNA reveals the presence of a species’ DNA in a sample; on its own it does not replace naturalist surveys and does not directly indicate the size of a population.',
  role: 'LDgenX acts as a scientific contributor: sampling strategy, analyses and interpretation. The regulatory file, the definition of measures and the assessment of their compliance rest with the project owner and its partners.',
  source: {
    label: 'The ERC sequence, French Ministry for the Ecological Transition (in French)',
    url: 'https://www.ecologie.gouv.fr/politiques-publiques/eviter-reduire-compenser-impacts-lenvironnement',
  },
};

export type { Work, Person, EquipmentItem };
