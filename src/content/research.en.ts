// English version of research.fr.ts: same references; summaries translated.
import type { ResearchFeatured, ResearchPublication } from './types';

export const research = {
  publications: [
    {
      id: 'bar-resistance-vnn-2023',
      readingTitle: 'Viral resistance and genomics of European sea bass',
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
      readingTitle: 'Spawning habitat and methylation in capelin',
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
      id: 'saumon-coho-elevage-expression-2022',
      readingTitle: 'Hatchery rearing and molecular signatures in coho salmon',
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
      readingTitle: 'How stocking shapes the ancestry of populations',
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
      readingTitle: 'Genomic regions and feed efficiency in pigs',
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
      readingTitle: 'Epigenetic marks that persist until spawning',
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
      readingTitle: 'What haplotypes bring to conservation',
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
      readingTitle: 'Genetic diversity in small brook charr populations',
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
      readingTitle: 'Choosing a reference population for genomic prediction',
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
      readingTitle: 'Recombination and domestic ancestry in brook charr',
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
      readingTitle: 'SNP markers to monitor trout populations',
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
            'Positions on the brown trout linkage map of the 12204 RADs(a ; containing one or two SNPs with MAF ≥ 5% based on all individuals (AT + ME) and positions between the first or last 30 bp of the RAD with no undetermined nucleotides), and of the 245 SNPs(b ; informative for at least the AT and ME lineages, positions between the first or last 50 bp of RADs (primer design zones), and spaced by at least 3.5 cM)',
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
      readingTitle: 'Three ancestries in the genomes of stocked trout',
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
      readingTitle: 'Barriers, migration and conservation of rainbow trout',
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
      readingTitle: 'A genetic map for brown trout',
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
      readingTitle: 'Diversity of hatchery strains and wild trout of the Orb',
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
      chartNote: 'One dot per SNP: their number is the article’s, their layout is illustrative.',
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
      chartNote:
        'Values from the abstract of the published article: susceptible and resistant genotypes for the QTL region.',
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
      chartNote:
        'Values from the abstract of the published article. Of the 45 regions of the global analysis, 13 are shared by at least two analyses and 1 by all three.',
    },
  ] as ResearchFeatured[],
};
