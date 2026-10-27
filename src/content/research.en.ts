// English version of research.fr.ts: same references; summaries translated.
import type { ResearchFeatured, ResearchPublication } from './types';

export const research = {
  publications: [
    {
      id: 'levure-replication-adn-polymerase-alpha-2026',
      readingTitle: 'Switch from canonical to recombination-dependent DNA synthesis by M-CDK phosphorylation of DNA Polα',
      seoTitle: 'Yeast: late DNA replication and polymerase α',
      title: 'Switch from canonical to recombination-dependent DNA synthesis by M-CDK phosphorylation of DNA Polα',
      authors: [
        'Barba Tena JD',
        'Montecchi R',
        'Lambert M',
        'Defrance T',
        'Gueydon E',
        'Petit J',
        'Drac M',
        'Legoff N',
        'Galli M',
        'Goiffon I',
        'Gostan T',
        'El Koulali K',
        'Urbach S',
        'Toczyski DP',
        'Talarek N',
        'Schwob E',
      ],
      members: ['maxime-lambert'],
      journal: 'The EMBO Journal',
      year: 2026,
      issue: 'online ahead of print',
      type: 'article',
      doi: '10.1038/s44318-026-00919-5',
      links: [{ label: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov/42859192/' }],
      text: 'abstract',
      licence: 'CC BY 4.0',
      themes: [],
      services: [],
      summary:
        'In yeast, this study examines what happens when a cell enters mitosis before it has finished copying its DNA. The mitotic kinase M-CDK phosphorylates DNA polymerase α: the cell then switches from canonical replication to a recombination-based DNA synthesis that is more error-prone.',
      question:
        'How does a cell finish copying its genome when it enters mitosis with incompletely replicated DNA, and why do late-replicating regions evolve faster?',
      approach:
        'Yeast with reduced licensing of replication origins and a lengthened S phase: the cells progress slowly through S phase without activating a checkpoint, and enter mitosis with under-replicated DNA.',
      finding:
        'At mitotic entry, M-CDK phosphorylates DNA polymerase α, displaces it from replication forks and makes them collapse. The DNA damage response opens a window for mitotic DNA synthesis (MiDAS), which completes replication through error-prone recombination mechanisms resembling break-induced replication (BIR) and FoSTeS.',
      limit:
        'The work was done in yeast; the authors present the mechanism as a potential explanation for the faster evolution of late-replicating genomic regions.',
      figures: [],
      applications: ['recherche-publique-privee'],
    },
    {
      id: 'bar-cortisol-temperature-2026',
      readingTitle:
        'Water-borne cortisol is correlated with acclimatization temperature but not metabolic rate in a teleost fish',
      seoTitle: 'Sea bass: cortisol, temperature and metabolic rate',
      title:
        'Water-borne cortisol is correlated with acclimatization temperature but not metabolic rate in a teleost fish',
      authors: [
        'Sniecinski E',
        'Navarro TP',
        'Bailey T',
        'Crestel D',
        'Allal F',
        'Maire A',
        'Bégout ML',
        'Geffroy B',
        'McKenzie DJ',
      ],
      members: ['damien-crestel'],
      journal: 'Comparative Biochemistry and Physiology Part A: Molecular & Integrative Physiology',
      year: 2026,
      issue: '317, 112004',
      type: 'article',
      doi: '10.1016/j.cbpa.2026.112004',
      links: [{ label: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov/42066891/' }],
      text: 'abstract',
      licence: '',
      themes: ['adaptation', 'aquaculture'],
      services: [],
      summary:
        'In European sea bass, this study examines how seasonal acclimatization temperature affects metabolic rate and the cortisol accumulated in the water. Both rise with temperature, but they show no clear correlation once fish mass is accounted for.',
      question:
        'Does acclimatization temperature change metabolic rate and water-borne cortisol, and are the two measures related?',
      approach:
        'Sea bass from the Atlantic population reared for three years under three thermal regimes following seasonal variations (Atlantic [control], Western Mediterranean [moderately warm] and Eastern Mediterranean [warm]); oxygen uptake measured in a swim tunnel and cortisol accumulated in the water measured at different temperatures throughout the year.',
      finding:
        'Metabolic rate and cortisol both increase with acclimatization temperature, with similar thermal sensitivity across regimes; at a given temperature, cortisol stays higher in the control regime than in the warm one.',
      limit:
        'Only one population was studied: what about the Mediterranean populations? This study is the first exploration of the relationships between acclimatization temperature, metabolic rate and water-borne cortisol in a fish species.',
      figures: [],
      applications: ['recherche-publique-privee'],
    },
    {
      id: 'bar-sex-ratio-temperature-gwas-2026',
      readingTitle:
        'Quantitative genetics and GWAS reveal population-specific sex-ratio responses in wild European seabass (*Dicentrarchus labrax*) under various temperature scenarios',
      seoTitle: 'Sea bass sex ratio, temperature and GWAS',
      title:
        'Quantitative genetics and GWAS reveal population-specific sex-ratio responses in wild European seabass (Dicentrarchus labrax) under various temperature scenarios',
      authors: [
        'Crestel D',
        'Vergnet A',
        'Delpuech E',
        'Sanchez-Baizan N',
        'Clota F',
        'Blanc MO',
        'Navarro T',
        'Lallement S',
        'Moulard F',
        'Ruelle F',
        'McKenzie DJ',
        'Allal F',
        'Vandeputte M',
      ],
      members: ['damien-crestel', 'emilie-delpuech'],
      journal: 'Heredity',
      year: 2026,
      issue: '135(6), 385–396',
      type: 'article',
      doi: '10.1038/s41437-026-00841-w',
      links: [{ label: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov/41957174/' }],
      text: 'abstract',
      licence: '',
      themes: ['adaptation', 'aquaculture', 'selection'],
      services: ['selection', 'genomique-des-populations', 'bioinformatique'],
      summary:
        'European sea bass has polygenic sex determination, strongly influenced by temperature. By rearing offspring of its three populations under four thermal regimes, the study shows population-specific sex ratios and, in the Atlantic population only, a genomic region associated with sex.',
      question:
        'Do sex determination and its sensitivity to temperature differ between European sea bass populations?',
      approach:
        'Offspring of the Atlantic (AT), Western Mediterranean (WM) and Eastern Mediterranean (EM) populations reared under four thermal regimes: three mimicking these seas and a husbandry regime maximising females; quantitative genetics and a genome-wide association study (GWAS).',
      finding:
        'The Atlantic population has a relatively balanced sex ratio with more females than the other two populations; heritability of sex tendency, around 0.62, is stable across populations and regimes; seven SNPs on chromosome 19 are associated with sex in the Atlantic population.',
      limit:
        'Results were obtained under experimental conditions; the QTL region contains a gene involved in sex determination in fish, without its role being demonstrated here.',
      figures: [],
    },
    {
      id: 'bar-survie-larvaire-introgression-2026',
      readingTitle:
        'Larval survival in European seabass (*Dicentrarchus labrax*) is shaped by the natural thermal regime of their population of origin and the level of introgression of Atlantic and Mediterranean genomes',
      seoTitle: 'Sea bass larval survival and introgression',
      title:
        'Larval survival in European seabass (Dicentrarchus labrax) is shaped by the natural thermal regime of their population of origin and the level of introgression of Atlantic and Mediterranean genomes',
      authors: [
        'Crestel D',
        'Vergnet A',
        'Delpuech E',
        'Leitwein M',
        'Clota F',
        'Blanc MO',
        'Navarro T',
        'Lallement S',
        'Moulard F',
        'Ruelle F',
        'McKenzie DJ',
        'Vandeputte M',
        'Allal F',
      ],
      members: ['damien-crestel', 'emilie-delpuech', 'maeva-leitwein'],
      journal: 'Aquaculture',
      year: 2026,
      issue: '615, 743605',
      type: 'article',
      doi: '10.1016/j.aquaculture.2025.743605',
      links: [],
      text: 'abstract',
      licence: 'CC BY 4.0',
      themes: ['adaptation', 'ascendance', 'aquaculture'],
      services: ['genomique-des-populations', 'selection', 'bioinformatique'],
      summary:
        'Larval survival in European sea bass was followed under four thermal regimes: the natural temperatures of its three populations and temperatures typical of a hatchery. The Atlantic and Eastern Mediterranean populations survive better at the temperatures of their home waters, and the higher the introgression between Atlantic and Mediterranean genomes, the lower the survival.',
      question:
        'Do temperature and genetic origin affect the survival of European sea bass larvae?',
      approach:
        "Larvae of the Atlantic (AT), Western Mediterranean (WM) and Eastern Mediterranean (EM) populations reared under four thermal regimes: three reflecting each population's natural temperatures and a typical hatchery regime.",
      finding:
        'Under the experimental regimes, survival of the Atlantic population is highest around 13.6 °C. Introgression between Atlantic and Mediterranean genomes is associated with lower survival. The temperatures tested do not establish the maximum survival temperature of the Mediterranean populations.',
      limit:
        'The study recommends accounting for introgression when establishing selected lineages; the experimental temperatures used were too low to identify the maximum survival temperature of the Mediterranean populations.',
      figures: [],
    },
    {
      id: 'poissons-tolerance-rechauffement-taille-2025',
      readingTitle:
        'Evidence that tolerance of acute warming declines with increasing body mass within fish species',
      seoTitle: 'Fish heat tolerance declines with body mass',
      title:
        'Evidence that tolerance of acute warming declines with increasing body mass within fish species',
      authors: [
        'Navarro TP',
        'Thambithurai D',
        'Duquenne-Delobel E',
        'Crestel D',
        'Allal F',
        'Salou G',
        'Dutto G',
        'Blasco FR',
        'Bourjea J',
        'McKenzie DJ',
      ],
      members: ['damien-crestel'],
      journal: 'Journal of Experimental Biology',
      year: 2025,
      issue: '228(17), jeb250612',
      type: 'article',
      doi: '10.1242/jeb.250612',
      links: [{ label: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov/40948321/' }],
      text: 'abstract',
      licence: '',
      themes: ['adaptation', 'aquaculture'],
      services: [],
      summary:
        'In four populations of farmed and wild fish (European sea bass, Nile tilapia, gilthead seabream), spanning roughly 20 to 800 g, tolerance of acute warming declines with body mass. Heavier individuals appear more sensitive to acute heat stress than lighter ones.',
      question: 'Within a species, do larger fish cope less well with rapid warming?',
      approach:
        'Temperature of fatigue during sustained aerobic exercise (CTSmax protocol) and maximum oxygen uptake measured in farmed sea bass and tilapia and in wild sea bass and seabream.',
      finding:
        'Warming tolerance declines significantly with mass in all populations, and is positively correlated with the maximum oxygen uptake reached before fatigue.',
      limit:
        'The protocol does not reveal a greater size-related cardiorespiratory limitation than at usual temperatures: the mechanisms behind the decline remain to be clarified.',
      figures: [],
      applications: ['recherche-publique-privee'],
    },
    {
      id: 'genomes-becasse-becassine-2025',
      readingTitle:
        'Chromosome-scale genome sequences of two Charadriiformes species: *Scolopax rusticola* and *Lymnocryptes minimus*',
      seoTitle: 'Genomes of the Eurasian woodcock and jack snipe',
      title:
        'Chromosome-scale genome sequences of two Charadriiformes species: Scolopax rusticola and Lymnocryptes minimus',
      authors: [
        'Delpuech E',
        'Leitwein M',
        'Couloux A',
        'Labadie K',
        'Cruaud C',
        'Aury JM',
        'Bodin C',
        'Lapébie P',
      ],
      members: ['emilie-delpuech', 'maeva-leitwein'],
      journal: 'Biodiversity Genomes',
      year: 2025,
      issue: '2025',
      type: 'article',
      doi: '10.56179/001c.143981',
      links: [],
      text: 'abstract',
      licence: '',
      themes: ['ressources', 'conservation'],
      services: ['bioinformatique', 'sequencage-dpcr'],
      summary:
        'The authors present high-quality genome assemblies of two waders, the Eurasian woodcock and the jack snipe. Illumina and Nanopore sequencing of fresh blood samples, followed by Hi-C data, reconstruct the chromosomes; the data are public in GenBank.',
      question:
        'Can complete reference genomes be produced for the Eurasian woodcock and the jack snipe?',
      approach:
        'Illumina and Nanopore sequencing of fresh blood from wild birds, de novo assembly, then integration of Hi-C data to reconstruct chromosome structure.',
      finding:
        'Two high-quality, chromosome-scale assemblies; raw reads and assemblies are available in GenBank.',
      limit:
        'A resource article: it provides reference genomes for future studies, without population analyses at this stage.',
      figures: [],
    },
    {
      id: 'bar-introgression-fitness-2025',
      readingTitle:
        'Reduced fitness associated with introgression within the Western Mediterranean admixed population of European seabass',
      seoTitle: 'Introgression and fitness in European sea bass',
      title:
        'Reduced fitness associated with introgression within the Western Mediterranean admixed population of European seabass',
      authors: ['Leitwein M', 'Ernande B', 'Vandeputte M', 'Clota F', 'Allal F'],
      members: ['maeva-leitwein'],
      journal: 'Evolution',
      year: 2025,
      issue: '79(8), 1681–1689',
      type: 'article',
      doi: '10.1093/evolut/qpaf079',
      links: [{ label: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov/40243218/' }],
      text: 'abstract',
      licence: '',
      themes: ['ascendance', 'adaptation', 'aquaculture'],
      services: ['genomique-des-populations', 'bioinformatique'],
      summary:
        'The Western Mediterranean sea bass population results from hybridisation between the Atlantic and Mediterranean lineages. In 1,488 admixed fish, more Atlantic ancestry goes with a more male-biased sex ratio, more sensitive to temperature, and a lower body weight.',
      question:
        'Does the Atlantic ancestry of admixed Western Mediterranean sea bass affect fitness-related traits?',
      approach:
        "1,488 admixed sea bass genotyped with the Axiom Sea Bass 57k SNP DlabChip array, then each fish's admixture level related to traits measured under three thermal regimes (19, 21 and 23 °C).",
      finding:
        'More Atlantic ancestry goes with a male-biased sex ratio, more sensitive to temperature, and a lower body weight, which is correlated with fecundity in fish.',
      limit:
        'The authors conclude that Atlantic introgression is likely disadvantageous in the Mediterranean, consistent with the purging of Atlantic ancestry tracts observed earlier.',
      figures: [],
    },
    {
      id: 'bar-croissance-larvaire-temperature-2025',
      readingTitle: 'Do European Seabass Larvae Grow Better in Their Natural Temperature Regime?',
      seoTitle: 'Sea bass larval growth and temperature regime',
      title: 'Do European Seabass Larvae Grow Better in Their Natural Temperature Regime?',
      authors: [
        'Crestel D',
        'Vergnet A',
        'Clota F',
        'Blanc MO',
        'Navarro T',
        'Lallement S',
        'Moulard F',
        'McKenzie D',
        'Allal F',
        'Vandeputte M',
      ],
      members: ['damien-crestel'],
      journal: 'Evolutionary Applications',
      year: 2025,
      issue: '18(2), e70083',
      type: 'article',
      doi: '10.1111/eva.70083',
      links: [{ label: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov/40012956/' }],
      text: 'abstract',
      licence: 'CC BY 4.0',
      themes: ['adaptation', 'aquaculture'],
      services: ['genomique-des-populations', 'bioinformatique'],
      summary:
        'Larvae of the three genetically differentiated European sea bass populations were reared together under three thermal regimes representative of the Atlantic and the Western and Eastern Mediterranean. The Atlantic population grows more than the other two in every regime, not only its own.',
      question:
        'Do sea bass larvae grow better in the temperature regime of their population of origin?',
      approach:
        "Common-garden rearing under three seasonal thermal regimes; growth followed from 20 days post-hatch to 1.5 g, with each individual's origin found by parentage assignment using 96 SNPs.",
      finding:
        'Survival is higher in warmer regimes until 23 mm. Larvae from the Atlantic population are longer than those from the Mediterranean populations under each of the regimes tested.',
      limit:
        'Whether this high growth reflects local adaptation to a relatively cold thermal regime remains to be established (countergradient variation hypothesis).',
      figures: [],
    },
    {
      id: 'bar-selection-efficacite-alimentaire-2025',
      readingTitle:
        'Genomic selection for individual feed efficiency in the European seabass: Response to selection on efficiency, commercial traits and sex',
      seoTitle: 'Genomic selection for feed efficiency in sea bass',
      title:
        'Genomic selection for individual feed efficiency in the European seabass: Response to selection on efficiency, commercial traits and sex',
      authors: [
        'Allal F',
        'Besson M',
        'Delpuech E',
        'Barrier-Loiseau C',
        'Vergnet A',
        'Morell F',
        'Blanc MO',
        'Lallement S',
        'Clota F',
        'Ruelle F',
        'Vandeputte M',
      ],
      members: ['emilie-delpuech'],
      journal: 'Aquaculture',
      year: 2025,
      issue: '595, 741682',
      type: 'article',
      doi: '10.1016/j.aquaculture.2024.741682',
      links: [],
      text: 'abstract',
      licence: 'CC BY 4.0',
      themes: ['aquaculture', 'selection'],
      services: ['selection', 'bioinformatique'],
      summary:
        'Feed efficiency is key to sustainable fish farming. Sea bass breeders chosen by genomic selection (GBLUP) on their growth in individual tanks produce more efficient offspring: a group feed conversion ratio of 1.61 versus 1.83 for the least efficient group, with larger fish.',
      question:
        'Does genomic selection on individual feed efficiency improve European sea bass performance?',
      approach:
        'Among 399 sea bass measured in individual tanks and genotyped for 1,110 SNPs, efficient, intermediate and inefficient breeders were selected by GBLUP; their offspring were assessed in individual tanks, in groups and at slaughter.',
      finding:
        'Offspring of efficient breeders are more efficient (group feed conversion ratio 1.61 versus 1.83) and larger (266 g versus 223 g), with no difference in fillet yield; the proportion of females is lower in this group.',
      limit:
        'A slightly higher viscerosomatic index in efficient fish; results come from one cohort and an experimental set-up.',
      figures: [],
    },
    {
      id: 'bar-introgression-teneur-gras-2024',
      readingTitle:
        'The Fate of a Polygenic Phenotype Within the Genomic Landscapes of Introgression in the European Seabass Hybrid Zone',
      seoTitle: 'Introgression and muscle fat in European sea bass',
      title:
        'The Fate of a Polygenic Phenotype Within the Genomic Landscapes of Introgression in the European Seabass Hybrid Zone',
      authors: [
        'Leitwein M',
        'Durif G',
        'Delpuech E',
        'Gagnaire PA',
        'Ernande B',
        'Vandeputte M',
        'Vergnet A',
        'Duranton M',
        'Clota F',
        'Allal F',
      ],
      members: ['maeva-leitwein', 'emilie-delpuech'],
      journal: 'Molecular Biology and Evolution',
      year: 2024,
      issue: '41(9), msae194',
      type: 'article',
      doi: '10.1093/molbev/msae194',
      links: [{ label: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov/39271153/' }],
      text: 'abstract',
      licence: 'CC BY-NC 4.0',
      themes: ['ascendance', 'adaptation', 'aquaculture'],
      services: ['genomique-des-populations', 'bioinformatique', 'selection'],
      summary:
        'In European sea bass, which hybridises naturally, the study examines how selection on a polygenic trait, muscle fat content, shapes introgression between the Atlantic and Mediterranean lineages. Genomic regions associated with this trait carry less Atlantic ancestry in Mediterranean populations.',
      question:
        'How does selection on a phenotype shape the introgression landscape between the Atlantic and Mediterranean sea bass lineages?',
      approach:
        'A high-density SNP array to estimate local ancestry along the genome and map muscle fat content, a polygenic trait that differs between lineages, accounting for variation in recombination rate.',
      finding:
        'Atlantic ancestry is purged in admixed Mediterranean populations; Atlantic fish are fatter, but regions associated with this trait show reduced Atlantic introgression in the Mediterranean.',
      limit:
        'The authors interpret this pattern as selection against maladapted alleles; the study covers one trait and one hybrid zone.',
      figures: [],
    },
    {
      id: 'bar-determinisme-sexe-energie-2024',
      readingTitle:
        'Thermal modulation of energy allocation during sex determination in the European sea bass (*Dicentrarchus labrax*)',
      seoTitle: 'Temperature, energy allocation and sex in sea bass',
      title:
        'Thermal modulation of energy allocation during sex determination in the European sea bass (Dicentrarchus labrax)',
      authors: ['Tovar-Bohórquez O', 'McKenzie D', 'Crestel D', 'Vandeputte M', 'Geffroy B'],
      members: ['damien-crestel'],
      journal: 'Gene',
      year: 2024,
      issue: '927, 148721',
      type: 'article',
      doi: '10.1016/j.gene.2024.148721',
      links: [{ label: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov/38925525/' }],
      text: 'abstract',
      licence: 'CC BY 4.0',
      themes: ['aquaculture', 'adaptation'],
      services: ['bioinformatique', 'sequencage-dpcr'],
      summary:
        'In European sea bass, whose sex depends on several genes and on water temperature, the study follows the expression of genes linked to energy allocation, growth and sex determination under different thermal regimes. It identifies spry1 as a robust marker of masculinisation.',
      question:
        'How does water temperature affect energy allocation and the expression of sex-related genes during sex determination?',
      approach:
        'Two experiments, one at constant temperatures typical of aquaculture and one under natural seasonal regimes; RNA-seq and qPCR analyses focused on eight key genes.',
      finding:
        'The effect of temperature on the proportion of females reverses between the two kinds of regime; nucb1 and pomc1 are higher in future females, egfra and spry1 in future males, and spry1 is higher in males in both experiments.',
      limit:
        'The study covers a limited number of targeted genes; it highlights a complex interplay between feeding, energy, growth and sex determination.',
      figures: [],
    },
    {
      id: 'bar-temperature-femelles-2024',
      readingTitle:
        'Post-larval exposure to warm temperature enhances female ratio, while starvation and photoperiod do not: The case of European seabass, *Dicentrarchus labrax*',
      seoTitle: 'Sea bass: warm temperature raises the female ratio',
      title:
        'Post-larval exposure to warm temperature enhances female ratio, while starvation and photoperiod do not: The case of European seabass, Dicentrarchus labrax',
      authors: [
        'Clota F',
        'Goikoetxea A',
        'Vergnet A',
        'Blanc MO',
        'Lallement S',
        'Ruelle F',
        'Leitwein M',
        'Allal F',
        'Geffroy B',
        'Vandeputte M',
      ],
      members: ['maeva-leitwein'],
      journal: 'Aquaculture',
      year: 2024,
      issue: '586, 740758',
      type: 'article',
      doi: '10.1016/j.aquaculture.2024.740758',
      links: [],
      text: 'abstract',
      licence: '',
      themes: ['aquaculture', 'adaptation'],
      services: [],
      summary:
        'Farmed European sea bass often produce a majority of males, while females grow faster and mature later. Two experiments test photoperiod, temperature and fasting: only a warmer post-larval temperature increases the proportion of females, from 30.4% at 19 °C to 48.7% at 25 °C.',
      question:
        'Do photoperiod, temperature and fasting change the sex ratio of farmed European sea bass?',
      approach:
        'Two experiments: two photoperiods until 90 days post-hatch at 16 °C, then four temperatures (19 to 25 °C) until 160 to 192 days; and fasting applied at four times during the sex-determination window, at 21 °C.',
      finding:
        'Neither photoperiod nor fasting changes the sex ratio; the proportion of females rises with post-larval temperature: 30.4% at 19 °C, 36.3% at 21 °C, 44.1% at 23 °C and 48.7% at 25 °C.',
      limit:
        'Results follow an initial cold treatment at 16 °C until 90 days; they offer a rearing lever to make up for the shortage of females, not full control of sex.',
      figures: [],
      applications: ['recherche-publique-privee'],
    },
    {
      id: 'bar-resistance-vnn-2023',
      readingTitle:
        'Whole-genome sequencing identifies interferon-induced protein IFI6/IFI27-like as a strong candidate gene for VNN resistance in European sea bass',
      seoTitle: 'IFI6 gene and VNN resistance in sea bass',
      title:
        'Whole-genome sequencing identifies interferon-induced protein IFI6/IFI27-like as a strong candidate gene for VNN resistance in European sea bass',
      authors: [
        'Delpuech E',
        'Vandeputte M',
        'Morvezen R',
        'Bestin A',
        'Besson M',
        'Brunier J',
        'Bajek A',
        'Imarazene B',
        'François Y',
        'Bouchez O',
        'Cousin X',
        'Poncet C',
        'Morin T',
        'Bruant JS',
        'Chatain B',
        'Haffray P',
        'Phocas F',
        'Allal F',
      ],
      members: ['emilie-delpuech'],
      journal: 'Genetics Selection Evolution',
      year: 2023,
      issue: '55, 30',
      type: 'article',
      doi: '10.1186/s12711-023-00805-2',
      links: [
        {
          label: 'PubMed',
          url: 'https://pubmed.ncbi.nlm.nih.gov/37143017/',
        },
      ],
      text: 'published',
      licence: 'CC BY 4.0',
      themes: ['aquaculture', 'selection'],
      services: ['selection', 'bioinformatique', 'sequencage-dpcr'],
      summary:
        'In European sea bass, this study looks for genomic regions associated with resistance to viral nervous necrosis. It identifies a region shared by two populations and candidate genes, including IFI6/IFI27-like. The results open prospects for selection, without being a treatment for the disease.',
      question: 'Which regions and genes are associated with VNN resistance in European sea bass?',
      approach:
        'Genome sequencing, genotyping and imputation, QTL mapping in two populations and validation of the effect of a region in an independent population.',
      finding:
        'A region on linkage group 12 is associated with resistance and contains in particular ZDHHC14 and IFI6/IFI27-like.',
      limit:
        'An associated QTL and a candidate gene do not, on their own, demonstrate the biological mechanism, and do not promise absolute resistance.',
      figures: [
        {
          image: 'pub-bar-vnn-fig1',
          label: 'Fig. 1',
          caption:
            'Evolution of the Kaplan–Meier cumulative survival to a VNN infection challenge for each cohort from two commercial populations and a validation population. Results are in purple for pop A (A_1, A_2, A_3), in green for pop B (B_1, B_2, B_3), and in yellow for the validation population',
          credit: 'Delpuech E et al. (2023), Genetics Selection Evolution',
          licence: 'CC BY 4.0',
          width: 708,
          height: 476,
        },
        {
          image: 'pub-bar-vnn-fig2',
          label: 'Fig. 2',
          caption:
            'Manhattan plots of for VNN resistance in European sea bass populations A(a) and B(b). The red dashed line represents the logBF threshold of 10, corresponding to strong evidence for the presence of a QTL',
          credit: 'Delpuech E et al. (2023), Genetics Selection Evolution',
          licence: 'CC BY 4.0',
          width: 597,
          height: 373,
        },
        {
          image: 'pub-bar-vnn-fig4',
          label: 'Fig. 4',
          caption:
            'Results for the LG12_QTL_2 region showing the SNPs with their genomic positions and the identified genes. The graph displays the logBF value on the y-axis and the physical position on the x-axis. Each point represents a variant in the QTL region, colored according to their LD (based on the squared coefficient of correlation, r 2 measure) with the characteristic variant of this QTL (red point). The red dashed lines indicate the logBF = 10 threshold',
          credit: 'Delpuech E et al. (2023), Genetics Selection Evolution',
          licence: 'CC BY 4.0',
          width: 796,
          height: 703,
        },
      ],
    },
    {
      id: 'capelan-methylation-reproduction-2023',
      readingTitle:
        'Genome-wide DNA methylation predicts environmentally driven life history variation in a marine fish',
      seoTitle: 'DNA methylation and life history in capelin',
      title:
        'Genome-wide DNA methylation predicts environmentally driven life history variation in a marine fish',
      authors: [
        'Venney CJ',
        'Cayuela H',
        'Rougeux C',
        'Laporte M',
        'Mérot C',
        'Normandeau E',
        'Leitwein M',
        'Dorant Y',
        'Præbel K',
        'Kenchington E',
        'Clément M',
        'Sirois P',
        'Bernatchez L',
      ],
      members: ['maeva-leitwein'],
      journal: 'Evolution',
      year: 2023,
      issue: '77(1), 186–198',
      type: 'article',
      doi: '10.1093/evolut/qpac028',
      links: [
        {
          label: 'PubMed',
          url: 'https://pubmed.ncbi.nlm.nih.gov/36622671/',
        },
      ],
      text: 'preprint',
      licence: '',
      themes: ['epigenetique', 'adaptation'],
      services: ['genomique-des-populations', 'bioinformatique'],
      summary:
        'This study of capelin examines the links between DNA methylation and spawning on beaches or in deeper water. Two geographic lineages show epigenetic variation associated with these strategies, with different strength. The work sheds light on the relations between environment, genetic and epigenetic variation.',
      question:
        'How are contrasting spawning strategies associated with methylation in two capelin lineages?',
      approach:
        'Comparison of genomes and methylomes of capelin from North America and Europe with contrasting spawning strategies.',
      finding:
        'Methylation differences are observed in both lineages, with a stronger effect in the European lineage.',
      limit:
        'The links between methylation and spawning strategy do not validate an age measure or an operational tool. The full text consulted is the preprint, earlier than the published article.',
      figures: [],
      online: '2022-12-08',
      preprint: 'https://doi.org/10.1101/2021.01.28.428603',
    },
    {
      id: 'truite-pigmentation-gwas-2023',
      readingTitle:
        'Redundancy analysis, genome-wide association studies and the pigmentation of brown trout (*Salmo trutta* L.)',
      seoTitle: 'The genetics of brown trout pigmentation',
      title:
        'Redundancy analysis, genome-wide association studies and the pigmentation of brown trout (Salmo trutta L.)',
      authors: ['Valette T', 'Leitwein M', 'Lascaux JM', 'Desmarais E', 'Berrebi P', 'Guinand B'],
      members: ['maeva-leitwein'],
      journal: 'Journal of Fish Biology',
      year: 2023,
      online: '2022-11-09',
      issue: '102(1), 96–118',
      type: 'article',
      doi: '10.1111/jfb.15243',
      links: [{ label: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov/36218076/' }],
      text: 'abstract',
      licence: '',
      themes: ['conservation', 'ascendance'],
      services: ['genomique-des-populations', 'bioinformatique'],
      summary:
        'Using 75,684 SNPs, the study combines redundancy analysis and genome-wide association studies to explore the molecular basis of pigmentation in wild brown trout affected by hatchery fish. It identifies 337 independent colour-patterning loci spread over 35 of the 40 linkage groups.',
      question: 'What genetic basis explains pigmentation variation in brown trout?',
      approach:
        'Genotyping of 75,684 SNPs, redundancy analysis (RDA) and single- and multi-trait genome-wide association studies, on traits such as the number of red and black spots on the flanks.',
      finding:
        '337 colour-patterning loci over 35 of the 40 linkage groups, pointing to a polygenic architecture; they are associated with 218 candidate genes, including known pigmentation genes (PMEL, SLC45A2, SOX10).',
      limit:
        'Associated loci and candidate genes, without functional demonstration; redundancy analysis is also useful for following pigmentation across generations of hatchery introgression.',
      figures: [],
    },
    {
      id: 'saumon-coho-elevage-expression-2022',
      readingTitle:
        'Strong Parallel Differential Gene Expression Induced by Hatchery Rearing Weakly Associated with Methylation Signals in Adult Coho Salmon (*O. kisutch*)',
      seoTitle: 'Hatchery rearing and gene expression in coho salmon',
      title:
        'Strong Parallel Differential Gene Expression Induced by Hatchery Rearing Weakly Associated with Methylation Signals in Adult Coho Salmon (O. kisutch)',
      authors: [
        'Leitwein M',
        'Wellband K',
        'Cayuela H',
        'Le Luyer J',
        'Mohns K',
        'Withler R',
        'Bernatchez L',
      ],
      members: ['maeva-leitwein'],
      journal: 'Genome Biology and Evolution',
      year: 2022,
      issue: '14(4), evac036',
      type: 'article',
      doi: '10.1093/gbe/evac036',
      links: [
        {
          label: 'PubMed',
          url: 'https://pubmed.ncbi.nlm.nih.gov/35276004/',
        },
      ],
      text: 'published',
      licence: 'CC BY-NC 4.0',
      themes: ['epigenetique', 'aquaculture', 'conservation'],
      services: ['genomique-des-populations', 'bioinformatique', 'sequencage-dpcr'],
      summary:
        'In adult coho salmon from two rivers, the authors compare gene expression and DNA methylation according to a hatchery or wild origin. Expression differences persist after the marine phase. Their association with methylation remains weak: several mechanisms may contribute to these signatures.',
      question:
        'Do the molecular signatures of early hatchery rearing persist in adults returning to spawn?',
      approach:
        'Comparison of adult coho salmon from two river systems, by RNA-seq and whole-genome bisulfite sequencing.',
      finding:
        'Expression differences between origins are parallel in both rivers; their link with methylation is limited.',
      limit:
        'Methylation explains only a small part of the expression differences observed; other mechanisms may contribute. These signatures do not directly measure how fish perform in the wild.',
      figures: [],
    },
    {
      id: 'omble-ascendance-repeuplement-2021',
      readingTitle:
        'Associative Overdominance and Negative Epistasis Shape Genome-Wide Ancestry Landscape in Supplemented Fish Populations',
      seoTitle: 'Stocking and genome-wide ancestry in fish populations',
      title:
        'Associative Overdominance and Negative Epistasis Shape Genome-Wide Ancestry Landscape in Supplemented Fish Populations',
      authors: ['Leitwein M', 'Cayuela H', 'Bernatchez L'],
      members: ['maeva-leitwein'],
      journal: 'Genes',
      year: 2021,
      issue: '12(4), 524',
      type: 'article',
      doi: '10.3390/genes12040524',
      links: [
        {
          label: 'PubMed',
          url: 'https://pubmed.ncbi.nlm.nih.gov/33916757/',
        },
      ],
      text: 'published',
      licence: 'CC BY 4.0',
      themes: ['conservation', 'ascendance'],
      services: ['genomique-des-populations', 'bioinformatique'],
      summary:
        'The authors study domestic ancestry in lake populations of brook charr subject to stocking. Genomic profiles differ between populations and depend on the context of diversity and recombination. The work underlines the value of assessing the consequences of stocking population by population.',
      question:
        'Why is domestic ancestry distributed differently across the genomes of stocked populations?',
      approach:
        'Genotyping of 552 fish from 22 lake populations and analysis of mapped SNP markers, diversity and recombination.',
      finding:
        'Selection and drift may contribute to ancestry profiles specific to each population.',
      limit:
        'The mechanisms proposed are interpretations of the system studied; they do not support the conclusion that all stocking is beneficial or harmful.',
      figures: [
        {
          image: 'pub-omble-ascendance-fig2',
          label: 'Figure 2',
          caption:
            'Heatmap of the proportion of domestic ancestry rate along the 42 Brook Charr linkage groups (LGs) for each lake. Lakes are ordered as a function of stocking intensity (less stocked lakes at the bottom). Labels are detailed in Table 1 .',
          credit: 'Leitwein M, Cayuela H, Bernatchez L (2021), Genes',
          licence: 'CC BY 4.0',
          width: 739,
          height: 229,
        },
      ],
    },
    {
      id: 'porc-efficacite-alimentaire-gwas-2021',
      readingTitle:
        'Identification of genomic regions affecting production traits in pigs divergently selected for feed efficiency',
      seoTitle: 'Genomic regions and feed efficiency in pigs',
      title:
        'Identification of genomic regions affecting production traits in pigs divergently selected for feed efficiency',
      authors: [
        'Delpuech E',
        'Aliakbari A',
        'Labrune Y',
        'Fève K',
        'Billon Y',
        'Gilbert H',
        'Riquet J',
      ],
      members: ['emilie-delpuech'],
      journal: 'Genetics Selection Evolution',
      year: 2021,
      issue: '53, 49',
      type: 'article',
      doi: '10.1186/s12711-021-00642-1',
      links: [
        {
          label: 'PubMed',
          url: 'https://pubmed.ncbi.nlm.nih.gov/34126920/',
        },
      ],
      text: 'published',
      licence: 'CC BY 4.0',
      themes: ['selection'],
      services: ['selection', 'bioinformatique'],
      summary:
        'This study looks for genome regions associated with feed efficiency and other production traits in two pig lines divergently selected. The results vary with the line and the structure of the analyses, which underlines the importance of the study design in interpreting associations.',
      question:
        'Which genomic regions are associated with production traits, and how do the results vary with the lines analysed?',
      approach:
        'Genome-wide association studies on two lines, separately and together, from genotypes and production traits.',
      finding:
        'Known and new QTL are identified, with limited overlap between some analysis designs.',
      limit:
        'Associations depend on the dataset and the analysis design; further analyses are needed to tell traces of selection from genetic drift.',
      figures: [
        {
          image: 'pub-porc-gwas-fig1',
          label: 'Fig. 1',
          caption:
            'The first two axes of the multidimensional scaling (MDS) analysis, based on the 570,447 genotypes. Points represent individuals (corresponding to all sires and dams of the population, N = 1632) and colors are generations',
          credit: 'Delpuech E et al. (2021), Genetics Selection Evolution',
          licence: 'CC BY 4.0',
          width: 599,
          height: 542,
        },
        {
          image: 'pub-porc-gwas-fig2',
          label: 'Fig. 2',
          caption:
            'Location of all SNP-QTL identified on the 18 autosomes from the Global-GWAS, LRFI-GWAS and HRFI-GWAS. The SNP-QTL corresponding to Global-GWAS are represented by horizontal bars, LRFI-GWAS by arrows to the right of the chromosomes and HRFI-GWAS by arrows to the left of the chromosomes. Each color represents one of the 24 traits; LRFI: low RFI line; HRFI: high RFI line; DFI: daily feed intake; ADG: average daily gain; FCR: feed conversion ratio; RFI: residual feed intake; carcBFT: backfat thickness measured on carcass; a*_GM: a* measured on the gluteus medius muscle; a*_GS: a* measured on the gluteus superficialis muscle; b*_GM: b* measured on the gluteus medius muscle; b*_GS: b* measured on the gluteus superficialis muscle; L*_GM: L* measured on the gluteus medius muscle; L*_GS: L* measured on the gluteus superficialis muscle; pH24h_AD: pH 24 h after slaughter measured on the adductor femoris muscle; pH24h_GS: pH 24 h after slaughter measured on the gluteus superficialis muscle; pH24h_LM: pH 24 h after slaughter measured on the longissimus dorsi muscle; pH24h_SM: pH 24 h after slaughter measured on the semimembranosus muscle; WHC: water holding capacity of the gluteus superficialis muscle; MQI: meat quality index; LMCcalc: lean meat content of the carcass; DP: carcass dressing percentage; Belly_W: belly weight; BF_W: backfat weight; Ham_W: ham weight; Loin_W: loin weight; Shoulder_W: shoulder weight',
          credit: 'Delpuech E et al. (2021), Genetics Selection Evolution',
          licence: 'CC BY 4.0',
          width: 784,
          height: 476,
        },
        {
          image: 'pub-porc-gwas-fig3',
          label: 'Fig. 3',
          caption:
            'Comparison of GWAS results obtained from Global-GWAS (Global), HRFI-GWAS (HRFI) and LRFI-GWAS (LRFI). a Comparison of the number of identical regions and b comparison of the number of identical QTL (trait x region)',
          credit: 'Delpuech E et al. (2021), Genetics Selection Evolution',
          licence: 'CC BY 4.0',
          width: 596,
          height: 249,
        },
      ],
    },
    {
      id: 'saumon-coho-epigenome-germinal-2021',
      readingTitle:
        'Epigenomic modifications induced by hatchery rearing persist in germ line cells of adult salmon after their oceanic migration',
      seoTitle: 'Salmon epigenome: lasting effects of hatchery rearing',
      title:
        'Epigenomic modifications induced by hatchery rearing persist in germ line cells of adult salmon after their oceanic migration',
      authors: [
        'Leitwein M',
        'Laporte M',
        'Le Luyer J',
        'Mohns K',
        'Normandeau E',
        'Withler R',
        'Bernatchez L',
      ],
      members: ['maeva-leitwein'],
      journal: 'Evolutionary Applications',
      year: 2021,
      issue: '14(10), 2402–2413',
      type: 'article',
      doi: '10.1111/eva.13235',
      links: [
        {
          label: 'PubMed',
          url: 'https://pubmed.ncbi.nlm.nih.gov/34745334/',
        },
      ],
      text: 'published',
      licence: 'CC BY 4.0',
      themes: ['epigenetique', 'aquaculture', 'conservation'],
      services: ['genomique-des-populations', 'bioinformatique', 'sequencage-dpcr'],
      summary:
        'In coho salmon, methylation differences associated with the early rearing environment are found in the germ cells of adults after their ocean migration. This persistence raises questions about the possible long-term effects of rearing and a possible transmission across generations.',
      question:
        'Are epigenetic signatures of early rearing still present in the germ cells of adults?',
      approach:
        'Whole-genome bisulfite sequencing of the milt of adult salmon of wild or hatchery origin, in two rivers.',
      finding: 'Differentially methylated regions are kept until adults return to spawn.',
      limit:
        'The persistence of these marks in germ cells does not, on its own, demonstrate their transmission to offspring.',
      figures: [
        {
          image: 'pub-coho-epigenome-fig2',
          label: 'Figure 2',
          caption:
            'Circle plot showing the 183 differentially methylated regions (DMRs) between hatchery and wild adult fish in milt tissue Only the chromosomes(n = 30) containing DMRs are represented. Red points indicate hypermethylated and blue points hypomethylated DMRs for the hatchery fish. The overlapping transcripts are represented and details can be found in Table S4 . Chromosomes for which db‐RDA were significant are presented in gray',
          credit: 'Leitwein M et al. (2021), Evolutionary Applications',
          licence: 'CC BY 4.0',
          width: 709,
          height: 712,
        },
      ],
    },
    {
      id: 'haplotypes-genomique-conservation-2020',
      readingTitle: 'Using Haplotype Information for Conservation Genomics',
      seoTitle: 'Haplotype information for conservation genomics',
      title: 'Using Haplotype Information for Conservation Genomics',
      authors: ['Leitwein M', 'Duranton M', 'Rougemont Q', 'Gagnaire PA', 'Bernatchez L'],
      members: ['maeva-leitwein'],
      journal: 'Trends in Ecology & Evolution',
      year: 2020,
      issue: '35(3), 245–258',
      type: 'review',
      doi: '10.1016/j.tree.2019.10.012',
      links: [
        {
          label: 'PubMed',
          url: 'https://pubmed.ncbi.nlm.nih.gov/31810774/',
        },
        {
          label: 'HAL',
          url: 'https://hal.science/hal-02395119v1',
        },
      ],
      text: 'published',
      licence: 'CC BY-NC-ND 4.0',
      themes: ['conservation', 'ascendance', 'ressources'],
      services: ['genomique-des-populations', 'bioinformatique'],
      summary:
        'This review explains how the combinations of variants carried by chromosomes inform demographic history, exchanges between populations, selection and hybridisation. It sets out the value and the technical challenges of haplotype analyses for non-model species and conservation genomics.',
      question:
        'What information do haplotypes provide beyond the frequencies of variants taken one by one?',
      approach: 'Literature review and methodological synthesis.',
      finding:
        'Haplotype-based approaches complement analyses of diversity and population history.',
      limit: 'A review article: it does not present a dataset or experimental result of its own.',
      figures: [],
    },
    {
      id: 'omble-diversite-petites-populations-2020',
      readingTitle:
        'Adaptive and maladaptive genetic diversity in small populations: Insights from the Brook Charr (*Salvelinus fontinalis*) case study',
      seoTitle: 'Genetic diversity in small brook charr populations',
      title:
        'Adaptive and maladaptive genetic diversity in small populations: Insights from the Brook Charr (Salvelinus fontinalis) case study',
      authors: [
        'Ferchaud AL',
        'Leitwein M',
        'Laporte M',
        'Boivin-Delisle D',
        'Bougas B',
        'Hernandez C',
        'Normandeau É',
        'Thibault I',
        'Bernatchez L',
      ],
      members: ['maeva-leitwein'],
      journal: 'Molecular Ecology',
      year: 2020,
      issue: '29(18), 3429–3445',
      type: 'article',
      doi: '10.1111/mec.15566',
      links: [
        {
          label: 'PubMed',
          url: 'https://pubmed.ncbi.nlm.nih.gov/33463857/',
        },
      ],
      text: 'preprint',
      licence: '',
      themes: ['conservation', 'adaptation'],
      services: ['genomique-des-populations', 'bioinformatique'],
      summary:
        'This study compares lake, river and anadromous brook charr populations to examine the accumulation of potentially beneficial or harmful genetic variants. It relates connectivity, diversity and evolutionary processes, without reducing the consequences of isolation to a single indicator.',
      question:
        'What role do demographic and selective processes play in the variants present in more or less connected populations?',
      approach:
        'Comparison of SNP markers in fish from 50 populations and annotation of the potential effects of variants.',
      finding:
        'Drift and selection both contribute to the patterns observed; lower diversity does not simply translate into more deleterious variants.',
      limit:
        'The effects of mutations are partly predicted by computation. The full text consulted is the preprint, earlier than the published article.',
      figures: [],
      preprint: 'https://doi.org/10.1101/660621',
    },
    {
      id: 'porc-prediction-genomique-2020',
      readingTitle:
        'The impact of training on data from genetically-related lines on the accuracy of genomic predictions for feed efficiency traits in pigs',
      seoTitle: 'Genomic prediction of feed efficiency in pigs',
      title:
        'The impact of training on data from genetically-related lines on the accuracy of genomic predictions for feed efficiency traits in pigs',
      authors: ['Aliakbari A', 'Delpuech E', 'Labrune Y', 'Riquet J', 'Gilbert H'],
      members: ['emilie-delpuech'],
      journal: 'Genetics Selection Evolution',
      year: 2020,
      issue: '52, 57',
      type: 'article',
      doi: '10.1186/s12711-020-00576-0',
      links: [
        {
          label: 'PubMed',
          url: 'https://pubmed.ncbi.nlm.nih.gov/33028194/',
        },
      ],
      text: 'published',
      licence: 'CC BY 4.0',
      themes: ['selection'],
      services: ['selection', 'bioinformatique'],
      summary:
        'The authors compare several compositions of reference populations to predict feed-efficiency traits in pigs. Combining related lines has variable effects on accuracy and bias depending on traits and scenarios, of interest for programmes with small populations.',
      question:
        'Under which conditions can related lines be combined to build a reference population for genomic selection?',
      approach:
        'Comparison of genomic prediction scenarios with different training-population compositions, and evaluation of accuracy and bias.',
      finding:
        'The composition of the reference population and the traits targeted influence prediction performance.',
      limit:
        'Adding individuals from another line does not systematically improve prediction: the effect depends on the trait and the scenario.',
      figures: [
        {
          image: 'pub-porc-prediction-fig1',
          label: 'Fig. 1',
          caption: 'Design of scenarios to predict validation animals in HRFI(a) and LRFI(b) lines',
          credit: 'Aliakbari A et al. (2020), Genetics Selection Evolution',
          licence: 'CC BY 4.0',
          width: 797,
          height: 731,
        },
        {
          image: 'pub-porc-prediction-fig2',
          label: 'Fig. 2',
          caption:
            'Correlations between GEBVp and GEBVw, and their SE as error bars for the HRFI(a) and LRFI(b) lines. *Significant difference with scenarios 1 (control) based on the Williams t-test at a 0.05 level. RFI residual feed intake, ADG average daily gain, FCR feed conversion ratio, DFI daily feed intake, BFT backfat thickness',
          credit: 'Aliakbari A et al. (2020), Genetics Selection Evolution',
          licence: 'CC BY 4.0',
          width: 784,
          height: 563,
        },
      ],
    },
    {
      id: 'omble-recombinaison-ascendance-2019',
      readingTitle:
        'The role of recombination on genome-wide patterns of local ancestry exemplified by supplemented brook charr populations',
      seoTitle: 'Recombination and local ancestry in brook charr',
      title:
        'The role of recombination on genome-wide patterns of local ancestry exemplified by supplemented brook charr populations',
      authors: [
        'Leitwein M',
        'Cayuela H',
        'Ferchaud AL',
        'Normandeau É',
        'Gagnaire PA',
        'Bernatchez L',
      ],
      members: ['maeva-leitwein'],
      journal: 'Molecular Ecology',
      year: 2019,
      issue: '28(21), 4755–4769',
      type: 'article',
      doi: '10.1111/mec.15256',
      links: [
        {
          label: 'PubMed',
          url: 'https://pubmed.ncbi.nlm.nih.gov/31579957/',
        },
        {
          label: 'HAL',
          url: 'https://hal.science/hal-02395970v1',
        },
      ],
      text: 'preprint',
      licence: '',
      themes: ['ascendance', 'conservation'],
      services: ['genomique-des-populations', 'bioinformatique'],
      summary:
        'The local ancestry profiles of stocked brook charr populations make it possible to examine domestic introgression at several scales of the genome. The authors show the value of ancestry tracts for studying the dynamics of admixture and its interactions with recombination.',
      question: 'How does domestic ancestry vary over time and along chromosomes after stocking?',
      approach:
        'Analysis of mapped SNP markers in 611 individuals from 24 populations, with estimation of ancestry tracts and recombination.',
      finding:
        'The distribution of ancestry tracts reveals evolutionary processes that vary between genomic regions.',
      limit:
        'The evolutionary mechanisms proposed remain interpretations, distinct from a causal demonstration. The full text consulted is the preprint, earlier than the published article.',
      figures: [],
      preprint: 'https://doi.org/10.1101/702696',
    },
    {
      id: 'truite-ressource-snp-2019',
      readingTitle:
        'Development of a large SNPs resource and a low-density SNP array for brown trout (*Salmo trutta*) population genetics',
      seoTitle: 'A SNP resource and array for brown trout genetics',
      title:
        'Development of a large SNPs resource and a low-density SNP array for brown trout (Salmo trutta) population genetics',
      authors: [
        'Saint-Pé K',
        'Leitwein M',
        'Tissot L',
        'Poulet N',
        'Guinand B',
        'Berrebi P',
        'Marselli G',
        'Lascaux JM',
        'Gagnaire PA',
        'Blanchet S',
      ],
      members: ['maeva-leitwein'],
      journal: 'BMC Genomics',
      year: 2019,
      issue: '20, 582',
      type: 'article',
      doi: '10.1186/s12864-019-5958-9',
      links: [
        {
          label: 'PubMed',
          url: 'https://pubmed.ncbi.nlm.nih.gov/31307373/',
        },
      ],
      text: 'published',
      licence: 'CC BY 4.0',
      themes: ['conservation', 'ressources'],
      services: ['genomique-des-populations', 'sequencage-dpcr', 'bioinformatique'],
      summary:
        'The authors develop a SNP marker resource and a low-density panel for the population genetics of brown trout. The tool is tested in several rivers and compared with classical markers to study differentiation and admixture with domestic strains.',
      question:
        'How can reproducible genotyping tools, spread across the genome, be built for brown trout?',
      approach:
        'Identification of SNPs from RAD sequences, construction of a 192-marker panel, then testing in several rivers.',
      finding:
        'The work provides a genomic resource and a genotyping tool for brown trout population studies.',
      limit:
        'The performance described applies to this panel and the populations tested; it does not automatically extend to other populations or species.',
      figures: [
        {
          image: 'pub-truite-snp-fig1',
          label: 'Fig. 1',
          caption:
            'Positions on the brown trout linkage map of the 12204 RADs (a; containing one or two SNPs with MAF ≥ 5% based on all individuals (AT + ME) and positions between the first or last 30 bp of the RAD with no undetermined nucleotides), and of the 245 SNPs (b; informative for at least the AT and ME lineages, positions between the first or last 50 bp of RADs (primer design zones), and spaced by at least 3.5 cM)',
          credit: 'Saint-Pé K et al. (2019), BMC Genomics',
          licence: 'CC BY 4.0',
          width: 707,
          height: 857,
        },
        {
          image: 'pub-truite-snp-fig4',
          label: 'Fig. 4',
          caption:
            'Plot of informativeness against number of SNPs. 107 SNPs would be equivalent to the 13 microsatellites in terms of informativeness',
          credit: 'Saint-Pé K et al. (2019), BMC Genomics',
          licence: 'CC BY 4.0',
          width: 596,
          height: 541,
        },
        {
          image: 'pub-truite-snp-fig5',
          label: 'Fig. 5',
          caption:
            'Map of the five river basins and and sampling sites (black dots) used to test for genotyping success. The Seuge and Ône Rivers are part of the Atlantic catchment, therefore naturally harboring AT trout, whereas the Aude, Roya and Doron de Bozel Rivers are part of the Mediterranean catchment, naturally populated with ME lineage. Maps were generated by authors on ArcGis and assembled using Inkscape',
          credit: 'Saint-Pé K et al. (2019), BMC Genomics',
          licence: 'CC BY 4.0',
          width: 709,
          height: 627,
        },
      ],
      authorNote: 'Saint-Pé K and Leitwein M contributed equally.',
    },
    {
      id: 'truite-trois-ascendances-2018',
      readingTitle:
        'Genomic consequences of a recent three-way admixture in supplemented wild brown trout populations revealed by local ancestry tracts',
      seoTitle: 'Brown trout: genomics of a three-way admixture',
      title:
        'Genomic consequences of a recent three-way admixture in supplemented wild brown trout populations revealed by local ancestry tracts',
      authors: ['Leitwein M', 'Gagnaire PA', 'Desmarais E', 'Berrebi P', 'Guinand B'],
      members: ['maeva-leitwein'],
      journal: 'Molecular Ecology',
      year: 2018,
      issue: '27(17), 3466–3483',
      type: 'article',
      doi: '10.1111/mec.14816',
      links: [
        {
          label: 'PubMed',
          url: 'https://pubmed.ncbi.nlm.nih.gov/30054960/',
        },
        {
          label: 'HAL',
          url: 'https://hal.science/hal-01922616v1',
        },
      ],
      text: 'abstract',
      licence: '',
      themes: ['ascendance', 'conservation'],
      services: ['genomique-des-populations', 'bioinformatique'],
      summary:
        'In brown trout from southern France, this study examines admixture between wild Mediterranean populations and two domestic origins. Ancestry tracts provide additional information on hybridisation patterns and their history compared with approaches based only on variant frequencies.',
      question:
        'How can the contributions of several domestic strains be told apart in the genomes of wild populations?',
      approach:
        'SNP markers from ddRAD-seq, genetic mapping and estimation of local ancestry along chromosomes.',
      finding:
        'Ancestry mosaics reveal a variety of admixture profiles and differences in timing between domestic origins.',
      limit:
        'A summary based on the abstract of the published article; the full text was not consulted. No site-level result is drawn from it.',
      figures: [],
      preprint: 'https://doi.org/10.1101/302380',
    },
    {
      id: 'truite-arc-en-ciel-san-francisco-2017',
      readingTitle:
        'Ancestry and adaptive evolution of anadromous, resident, and adfluvial rainbow trout (*Oncorhynchus mykiss*) in the San Francisco bay area: application of adaptive genomic variation to conservation in a highly impacted landscape',
      seoTitle: 'Rainbow trout genomics in San Francisco Bay',
      title:
        'Ancestry and adaptive evolution of anadromous, resident, and adfluvial rainbow trout (Oncorhynchus mykiss) in the San Francisco bay area: application of adaptive genomic variation to conservation in a highly impacted landscape',
      authors: ['Leitwein M', 'Garza JC', 'Pearse DE'],
      members: ['maeva-leitwein'],
      journal: 'Evolutionary Applications',
      year: 2017,
      issue: '10(1), 56–67',
      type: 'article',
      doi: '10.1111/eva.12416',
      links: [
        {
          label: 'PubMed',
          url: 'https://pubmed.ncbi.nlm.nih.gov/28035235/',
        },
      ],
      text: 'published',
      licence: 'CC BY 4.0',
      themes: ['conservation', 'adaptation'],
      services: ['genomique-des-populations', 'bioinformatique'],
      summary:
        'Around San Francisco Bay, the authors compare the ancestry and adaptive variation of rainbow trout populations living on either side of migration barriers. The results relate ecological context, population history and migratory traits, with implications for habitat restoration.',
      question:
        'How are barriers and new habitats associated with genomic differences between migratory and resident populations?',
      approach:
        'Comparisons of genetic structure, ancestry and variants associated with migratory traits across several watersheds.',
      finding:
        'Adaptive differences accompany the contexts above and below dams; the populations keep a native coastal ancestry.',
      limit:
        'The conclusions apply to the populations studied around San Francisco Bay; they do not prove the effect of each structure elsewhere.',
      figures: [
        {
          image: 'pub-arc-en-ciel-fig1',
          label: 'Figure 1',
          caption:
            'Map showing locations of population samples around San Francisco Bay. Sample sites are indicated by numbered triangles, and migration barriers are shown by bars, with sites above reservoir‐forming dams indicated by dots with size proportional to reservoir volume.',
          credit: 'Leitwein M, Garza JC, Pearse DE (2017), Evolutionary Applications',
          licence: 'CC BY 4.0',
          width: 709,
          height: 974,
        },
        {
          image: 'pub-arc-en-ciel-fig3',
          label: 'Figure 3',
          caption:
            'Principal component analysis showing relative genetic distances between individuals with coastal, San Francisco(SF) Bay Area, Central Valley, and hatchery trout strain ancestry',
          credit: 'Leitwein M, Garza JC, Pearse DE (2017), Evolutionary Applications',
          licence: 'CC BY 4.0',
          width: 709,
          height: 494,
        },
      ],
      online: '2016-10-27',
    },
    {
      id: 'truite-carte-liaison-2017',
      readingTitle:
        'A Dense Brown Trout (*Salmo trutta*) Linkage Map Reveals Recent Chromosomal Rearrangements in the *Salmo* Genus and the Impact of Selection on Linked Neutral Diversity',
      seoTitle: 'A dense linkage map for brown trout',
      title:
        'A Dense Brown Trout (Salmo trutta) Linkage Map Reveals Recent Chromosomal Rearrangements in the Salmo Genus and the Impact of Selection on Linked Neutral Diversity',
      authors: [
        'Leitwein M',
        'Guinand B',
        'Pouzadoux J',
        'Desmarais E',
        'Berrebi P',
        'Gagnaire PA',
      ],
      members: ['maeva-leitwein'],
      journal: 'G3: Genes|Genomes|Genetics',
      year: 2017,
      issue: '7(4), 1365–1376',
      type: 'article',
      doi: '10.1534/g3.116.038497',
      links: [
        {
          label: 'PubMed',
          url: 'https://pubmed.ncbi.nlm.nih.gov/28235829/',
        },
      ],
      text: 'published',
      licence: 'CC BY 4.0',
      themes: ['ressources'],
      services: ['genomique-des-populations', 'bioinformatique', 'sequencage-dpcr'],
      summary:
        'A high-density genetic linkage map is built for brown trout and compared with that of Atlantic salmon. It makes it possible to study chromosomal rearrangements and the relations between recombination and diversity, and is a resource for conservation and aquaculture research.',
      question:
        'How can the markers of the trout genome be organised, and the evolution of its chromosomes compared with those of salmon?',
      approach:
        'Construction of a map from ddRAD markers in two crosses and comparison of conserved chromosomal regions.',
      finding:
        'The map supports the study of chromosomal organisation and of the links between recombination and genetic diversity.',
      limit:
        'A linkage map describes genetic relations between markers; it is not a physical representation of chromosomes.',
      figures: [
        {
          image: 'pub-truite-carte-fig1',
          label: 'Figure 1',
          caption:
            'The brown trout(Salmo trutta) high-density linkage map. Horizontal black lines within each of the 40 LGs represent mapped RAD markers(n = 3977). The most probable chromosome type determined with the RFm method(Limborg et al. 2015a) is indicated above each LG. Green boxes indicate the approximate position of the centromere for metacentric LGs. Red dots represent the position of 89 additional markers that were transferred from the previous generation linkage map (see Table S2 for details). A, acrocentric; M, metacentric; U, undetermined.',
          credit: 'Leitwein M et al. (2017), G3: Genes|Genomes|Genetics',
          licence: 'CC BY 4.0',
          width: 757,
          height: 345,
        },
        {
          image: 'pub-truite-carte-fig3',
          label: 'Figure 3',
          caption:
            'Dual synteny plot showing conserved syntenic blocks and chromosome rearrangements between Salmo salar(Ssa) and Salmo trutta (BT) LGs. Chromosomes arms (p, q a and q b) are specified for S. salar LGs, and the seven pairs of chromosome arms that still exhibit residual tetrasomy in salmon appear in red(Lien et al. 2016).',
          credit: 'Leitwein M et al. (2017), G3: Genes|Genomes|Genetics',
          licence: 'CC BY 4.0',
          width: 757,
          height: 587,
        },
      ],
    },
    {
      id: 'truite-orb-diversite-2016',
      readingTitle:
        'Genome-wide nucleotide diversity of hatchery-reared Atlantic and Mediterranean strains of brown trout *Salmo trutta* compared to wild Mediterranean populations',
      seoTitle: 'Genomic diversity of Orb brown trout',
      title:
        'Genome-wide nucleotide diversity of hatchery-reared Atlantic and Mediterranean strains of brown trout Salmo trutta compared to wild Mediterranean populations',
      authors: [
        'Leitwein M',
        'Gagnaire PA',
        'Desmarais E',
        'Guendouz S',
        'Rohmer M',
        'Berrebi P',
        'Guinand B',
      ],
      members: ['maeva-leitwein'],
      journal: 'Journal of Fish Biology',
      year: 2016,
      issue: '89(6), 2717–2734',
      type: 'article',
      doi: '10.1111/jfb.13131',
      links: [
        {
          label: 'PubMed',
          url: 'https://pubmed.ncbi.nlm.nih.gov/27666575/',
        },
        {
          label: 'HAL',
          url: 'https://hal.science/hal-01922655v1',
        },
      ],
      text: 'abstract',
      licence: '',
      themes: ['conservation', 'aquaculture'],
      services: ['genomique-des-populations', 'bioinformatique', 'sequencage-dpcr'],
      summary:
        'This study compares the genetic diversity of wild Mediterranean brown trout populations of the Orb basin with that of Atlantic and Mediterranean hatchery strains. The genomic analyses reveal differences in diversity that are relevant to stocking practices and conservation.',
      question:
        'How does the diversity of hatchery strains compare with that of the wild Mediterranean populations studied?',
      approach:
        'ddRAD-seq and comparison of genotyping strategies, followed by an analysis of genetic diversity.',
      finding:
        'In this system, hatchery strains show lower diversity than the wild populations compared.',
      limit:
        'A summary based on the abstract of the published article; the detailed results and figures were not consulted.',
      figures: [],
    },
  ] as ResearchPublication[],
  featured: [
    {
      publication: 'truite-ressource-snp-2019',
      theme: 'conservation',
      label: 'Biodiversity conservation',
      species: 'Brown trout',
      steps: [
        {
          value: '12,204',
          label: 'informative SNPs identified by RAD sequencing and positioned on the linkage map',
        },
        {
          value: '192',
          label: 'SNPs kept for a cost-effective array (96 × 2), spread along the map',
        },
        {
          value: '1,862',
          label: 'trout genotyped in five rivers, from the Atlantic and Mediterranean lineages',
        },
        {
          value: '< 1%',
          label: 'of loci not genotyped per individual, in every river',
        },
      ],
      chart: {
        kind: 'panel',
        total: 12204,
        selected: 192,
      },
      chartTitle: 'From genome to array: 12,204 SNPs, 192 kept',
    },
    {
      publication: 'bar-resistance-vnn-2023',
      theme: 'aquaculture',
      label: 'Aquaculture',
      species: 'European sea bass',
      steps: [
        {
          value: '838,451',
          label: 'SNPs from whole-genome sequencing of the parents',
        },
        {
          value: '2,371 · 3,428',
          label:
            'sea bass from two commercial populations, with their survival to an experimental VNN infection',
        },
        {
          value: '127 kb',
          label: 'QTL region on linkage group 12, shared by both populations',
        },
        {
          value: '2 genes',
          label: 'in this region: ZDHHC14 and IFI6/IFI27-like',
        },
      ],
      chart: {
        kind: 'survival',
        groups: [
          {
            label: 'Population A',
            susceptible: 40.6,
            resistant: 78,
          },
          {
            label: 'Population B',
            susceptible: 45.4,
            resistant: 66.2,
          },
        ],
      },
      chartTitle: 'Survival to the VNN challenge by genotype',
    },
    {
      publication: 'porc-efficacite-alimentaire-gwas-2021',
      theme: 'selection',
      label: 'Agriculture and selection',
      species: 'Pig',
      steps: [
        {
          value: '570,447',
          label: 'SNPs for 2,426 pigs, after imputation and prediction of genotypes',
        },
        {
          value: '24',
          label: 'production traits recorded',
        },
        {
          value: '9',
          label: 'generations of divergent selection on residual feed intake',
        },
        {
          value: '3',
          label: 'association studies: both lines together, then each line separately',
        },
      ],
      chart: {
        kind: 'regions',
        bars: [
          {
            label: 'Both lines together',
            value: 45,
          },
          {
            label: 'LRFI line',
            value: 42,
          },
          {
            label: 'HRFI line',
            value: 28,
          },
        ],
        shared: 13,
        common: 1,
      },
      chartTitle: 'Chromosomal regions detected by analysis design',
    },
  ] as ResearchFeatured[],
};
