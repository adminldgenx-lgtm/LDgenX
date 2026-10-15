// Articles co-written by members of the team, from the verified folder
// LDgenX_Recherche_Publications_2026-10-15 (publications.json, figure-index.csv). Titles, authors,
// journals, years and DOIs are those of the published articles; summaries are based on their
// published abstracts. Figures are reproduced only for CC BY articles, unchanged, with credit.
import type { ResearchFeatured, ResearchPublication } from './types';

export const research = {
  publications: [
    {
      id: 'bar-resistance-vnn-2023',
      readingTitle: 'Résistance virale et génomique du bar européen',
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
        'Chez le bar européen, cette étude recherche les régions génomiques associées à la résistance à la nécrose nerveuse virale. Elle identifie une région partagée entre deux populations et des gènes candidats, dont IFI6/IFI27-like. Les résultats ouvrent des perspectives pour la sélection, sans constituer un traitement contre la maladie.',
      question:
        'Quelles régions et quels gènes sont associés à la résistance à la VNN chez le bar européen ?',
      approach:
        'Séquençage génomique, génotypage et imputation, cartographie de QTL dans deux populations et validation de l’effet d’une région dans une population indépendante.',
      finding:
        'Une région sur le groupe de liaison 12 est associée à la résistance et contient notamment ZDHHC14 et IFI6/IFI27-like.',
      limit:
        'Un QTL associé et un gène candidat ne démontrent pas à eux seuls le mécanisme biologique et ne promettent pas une résistance absolue.',
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
      readingTitle: 'Milieu de reproduction et méthylation chez le capelan',
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
        'Cette étude du capelan examine les liens entre méthylation de l’ADN et stratégies de reproduction sur plage ou en profondeur. Deux lignées géographiques présentent des variations épigénétiques associées à ces stratégies, avec une intensité différente. Le travail éclaire les relations entre environnement, variation génétique et épigénétique.',
      question:
        'Comment les différences de stratégies de reproduction sont-elles associées à la méthylation dans deux lignées de capelan ?',
      approach:
        'Comparaison de génomes et méthylomes de capelans d’Amérique du Nord et d’Europe présentant des stratégies de reproduction contrastées.',
      finding:
        'Des différences de méthylation sont observées dans les deux lignées, avec un effet plus marqué dans la lignée européenne.',
      limit:
        'Les liens entre méthylation et stratégie de reproduction ne valident ni une mesure de l’âge ni un outil opérationnel. Le texte intégral consulté est la prépublication, antérieure à l’article publié.',
      figures: [],
      online: '2022-12-08',
      preprint: 'https://doi.org/10.1101/2021.01.28.428603',
    },
    {
      id: 'saumon-coho-elevage-expression-2022',
      readingTitle: 'Élevage et signatures moléculaires du saumon coho',
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
        'Chez des saumons coho adultes issus de deux rivières, les auteurs comparent expression des gènes et méthylation de l’ADN selon une origine en écloserie ou dans le milieu naturel. Des différences d’expression persistent après la phase marine. L’association avec la méthylation reste faible : plusieurs mécanismes peuvent contribuer à ces signatures.',
      question:
        'Les signatures moléculaires associées à l’élevage précoce persistent-elles chez les adultes revenus se reproduire ?',
      approach:
        'Comparaison de saumons coho adultes issus de deux systèmes fluviaux, par RNA-seq et séquençage bisulfite du génome entier.',
      finding:
        'Les différences d’expression entre origines sont parallèles dans les deux rivières; leur lien avec la méthylation est limité.',
      limit:
        'La méthylation n’explique qu’une faible part des différences d’expression observées ; d’autres mécanismes peuvent y contribuer. Ces signatures ne mesurent pas directement la performance des poissons en milieu naturel.',
      figures: [],
    },
    {
      id: 'omble-ascendance-repeuplement-2021',
      readingTitle: 'Effets du repeuplement sur l’ascendance des populations',
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
        'Les auteurs étudient l’ascendance domestique de populations lacustres d’omble de fontaine soumises au repeuplement. Les profils génomiques diffèrent entre populations et dépendent du contexte de diversité et de recombinaison. Le travail souligne l’intérêt d’évaluer les conséquences du repeuplement à l’échelle de chaque population.',
      question:
        'Pourquoi l’ascendance domestique se répartit-elle différemment entre les génomes de populations repeuplées ?',
      approach:
        'Génotypage de 552 poissons provenant de 22 populations lacustres et analyse de marqueurs SNP cartographiés, de la diversité et de la recombinaison.',
      finding:
        'Des mécanismes de sélection et de dérive peuvent contribuer à des profils d’ascendance propres à chaque population.',
      limit:
        'Les mécanismes proposés sont des interprétations du système étudié ; ils ne permettent pas de conclure que tout repeuplement serait bénéfique ou nuisible.',
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
      readingTitle: 'Régions génomiques et efficacité alimentaire chez le porc',
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
        'Cette étude recherche des régions du génome associées à l’efficacité alimentaire et à d’autres caractères de production chez deux lignées porcines sélectionnées de manière divergente. Les résultats varient selon la lignée et la structure des analyses, ce qui souligne l’importance du plan d’étude dans l’interprétation des associations.',
      question:
        'Quelles régions génomiques sont associées aux caractères de production, et comment les résultats varient-ils selon les lignées analysées ?',
      approach:
        'Études d’association pangénomiques sur deux lignées, séparément et ensemble, à partir de génotypes et de caractères de production.',
      finding:
        'Des QTL connus et nouveaux sont identifiés, avec un recouvrement limité entre certains plans d’analyse.',
      limit:
        'Les associations dépendent du jeu de données et du plan d’analyse ; des analyses complémentaires sont nécessaires pour distinguer traces de sélection et dérive génétique.',
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
      readingTitle: 'Des marques épigénétiques persistantes jusqu’à la reproduction',
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
        'Chez le saumon coho, des différences de méthylation associées à l’environnement d’élevage précoce sont retrouvées dans les cellules germinales d’adultes après leur migration océanique. Cette persistance ouvre des questions sur les effets possibles de l’élevage à long terme et sur une éventuelle transmission entre générations.',
      question:
        'Des signatures épigénétiques de l’élevage précoce sont-elles encore présentes dans les cellules germinales des adultes ?',
      approach:
        'Séquençage bisulfite du génome entier dans le sperme de saumons adultes d’origine sauvage ou d’écloserie, dans deux rivières.',
      finding:
        'Des régions différentiellement méthylées sont conservées jusqu’au retour des adultes pour la reproduction.',
      limit:
        'La persistance de ces marques dans les cellules germinales ne démontre pas, à elle seule, leur transmission aux descendants.',
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
      readingTitle: 'Ce que les haplotypes apportent à la conservation',
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
        'Cette revue explique comment les combinaisons de variants portées par les chromosomes renseignent l’histoire démographique, les échanges entre populations, la sélection et l’hybridation. Elle expose l’intérêt et les enjeux techniques des analyses d’haplotypes pour les espèces non modèles et la génomique de la conservation.',
      question:
        'Quelles informations les haplotypes apportent-ils au-delà des fréquences de variants considérés séparément ?',
      approach: 'Revue de la littérature et synthèse méthodologique.',
      finding:
        'Les approches fondées sur les haplotypes complètent les analyses de diversité et d’histoire des populations.',
      limit:
        'Article de revue : il ne présente pas de jeu de données ou de résultat expérimental qui lui soit propre.',
      figures: [],
    },
    {
      id: 'omble-diversite-petites-populations-2020',
      readingTitle: 'Diversité génétique et petites populations d’omble de fontaine',
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
        'Cette étude compare des populations d’omble de fontaine lacustres, riveraines et anadromes pour examiner l’accumulation de variants génétiques potentiellement favorables ou défavorables. Elle met en relation connectivité, diversité et processus évolutifs, sans réduire les conséquences de l’isolement à un indicateur unique.',
      question:
        'Quel rôle jouent les processus démographiques et sélectifs dans les variants présents au sein de populations plus ou moins connectées ?',
      approach:
        'Comparaison de marqueurs SNP chez des poissons de 50 populations et annotation des effets potentiels des variants.',
      finding:
        'La dérive et la sélection contribuent aux patrons observés; une moindre diversité ne se traduit pas simplement par davantage de variants délétères.',
      limit:
        'Les effets des mutations sont en partie prédits par calcul. Le texte intégral consulté est la prépublication, antérieure à l’article publié.',
      figures: [],
      preprint: 'https://doi.org/10.1101/660621',
    },
    {
      id: 'porc-prediction-genomique-2020',
      readingTitle: 'Choisir une population de référence pour la prédiction génomique',
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
        'Les auteurs comparent plusieurs compositions de populations de référence pour prédire des caractères liés à l’efficacité alimentaire chez le porc. Combiner des lignées apparentées produit des effets variables sur la précision et le biais selon les caractères et les scénarios, avec un intérêt pour les programmes disposant de petits effectifs.',
      question:
        'Dans quelles conditions peut-on combiner des lignées apparentées pour construire une population de référence en sélection génomique ?',
      approach:
        'Comparaison de scénarios de prédiction génomique avec différentes compositions de populations d’apprentissage et évaluation de la précision et du biais.',
      finding:
        'La composition de la population de référence et les caractères visés influencent les performances de prédiction.',
      limit:
        'Ajouter des individus d’une lignée apparentée n’améliore pas systématiquement la prédiction : l’effet dépend du caractère et du scénario.',
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
      readingTitle: 'Recombinaison et ascendance domestique chez l’omble de fontaine',
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
        'Les profils d’ascendance locale de populations d’omble de fontaine repeuplées permettent d’examiner l’introgression domestique à plusieurs échelles du génome. Les auteurs montrent l’intérêt des segments d’ascendance pour étudier la dynamique du mélange génétique et ses interactions avec la recombinaison.',
      question:
        'Comment l’ascendance domestique varie-t-elle dans le temps et le long des chromosomes après le repeuplement ?',
      approach:
        'Analyse de marqueurs SNP cartographiés chez 611 individus de 24 populations, avec estimation des segments d’ascendance et de la recombinaison.',
      finding:
        'La répartition des segments d’ascendance révèle des processus évolutifs variables selon les régions génomiques.',
      limit:
        'Les mécanismes évolutifs proposés restent des interprétations, distinctes d’une démonstration causale. Le texte intégral consulté est la prépublication, antérieure à l’article publié.',
      figures: [],
      preprint: 'https://doi.org/10.1101/702696',
    },
    {
      id: 'truite-ressource-snp-2019',
      readingTitle: 'Des marqueurs SNP pour suivre les populations de truite',
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
        'Les auteurs développent une ressource de marqueurs SNP et un panel de faible densité pour la génétique des populations de truite commune. Le dispositif est évalué dans plusieurs rivières et comparé à des marqueurs classiques pour l’étude de la différenciation et du mélange avec des souches domestiques.',
      question:
        'Comment construire des outils de génotypage reproductibles et répartis sur le génome pour la truite commune ?',
      approach:
        'Identification de SNP à partir de séquences RAD, construction d’un panel de 192 marqueurs, puis évaluation sur plusieurs rivières.',
      finding:
        'Le travail fournit une ressource génomique et un outil de génotypage pour des études de populations de truite.',
      limit:
        'Les performances décrites concernent ce panel et les populations testées ; elles ne s’étendent pas d’emblée à d’autres populations ou espèces.',
      figures: [
        {
          image: 'pub-truite-snp-fig1',
          label: 'Fig. 1',
          caption:
            'Positions on the brown trout linkage map of the 12204 RADs(a ; containing one or two SNPs with MAF ≥ 5% based on all individuals (AT + ME) and positions between the first or last 30 bp of the RAD with no undetermined nucleotides), and of the 245 SNPs(b ; informative for at least the AT and ME lineages, positions between the first or last 50 bp of RADs (primer design zones), and spaced by at least 3.5 cM)',
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
      authorNote: 'Saint-Pé K. et Leitwein M. ont contribué à parts égales.',
    },
    {
      id: 'truite-trois-ascendances-2018',
      readingTitle: 'Trois ascendances dans les génomes de truites repeuplées',
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
        'Chez des truites communes du sud de la France, cette étude examine le mélange entre populations sauvages méditerranéennes et deux origines domestiques. Les segments d’ascendance apportent des informations supplémentaires sur les profils d’hybridation et leur histoire par rapport aux approches fondées seulement sur les fréquences de variants.',
      question:
        'Comment distinguer les contributions de plusieurs souches domestiques dans les génomes de populations sauvages ?',
      approach:
        'Marqueurs SNP issus du ddRAD-seq, cartographie et estimation de l’ascendance locale le long des chromosomes.',
      finding:
        'Les mosaïques d’ascendance révèlent une diversité de profils de mélange et des différences de temporalité entre origines domestiques.',
      limit:
        'Synthèse fondée sur le résumé de l’article publié ; le texte intégral n’a pas été consulté. Aucun résultat par site n’en est tiré.',
      figures: [],
      preprint: 'https://doi.org/10.1101/302380',
    },
    {
      id: 'truite-arc-en-ciel-san-francisco-2017',
      readingTitle: 'Obstacles, migration et conservation de la truite arc-en-ciel',
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
        'Dans la baie de San Francisco, les auteurs comparent l’ascendance et la variation adaptative de populations de truite arc-en-ciel vivant de part et d’autre d’obstacles à la migration. Les résultats relient contexte écologique, histoire des populations et traits migratoires, avec des implications pour la restauration des habitats.',
      question:
        'Comment les obstacles et les nouveaux habitats sont-ils associés aux différences génomiques de populations migratrices ou résidentes ?',
      approach:
        'Comparaisons de structure génétique, d’ascendance et de variants associés à des traits migratoires dans plusieurs bassins versants.',
      finding:
        'Des différences adaptatives accompagnent les contextes situés en amont et en aval des barrages; les populations conservent une ascendance côtière native.',
      limit:
        'Les conclusions portent sur les populations étudiées autour de la baie de San Francisco ; elles ne prouvent pas l’effet de chaque aménagement ailleurs.',
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
      readingTitle: 'Une carte génétique pour la truite commune',
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
        'Une carte de liaison génétique à haute densité est construite pour la truite commune et comparée à celle du saumon atlantique. Elle permet d’étudier les réarrangements chromosomiques et les relations entre recombinaison et diversité, et constitue une ressource pour les recherches en conservation et en aquaculture.',
      question:
        'Comment organiser les marqueurs du génome de la truite et comparer l’évolution de ses chromosomes à ceux du saumon ?',
      approach:
        'Construction d’une carte à partir de marqueurs ddRAD de deux croisements et comparaison des régions chromosomiques conservées.',
      finding:
        'La carte permet l’étude de l’organisation chromosomique et des liens entre recombinaison et diversité génétique.',
      limit:
        'Une carte de liaison décrit les relations génétiques entre marqueurs ; ce n’est pas une représentation physique des chromosomes.',
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
      readingTitle: 'Diversité des souches d’élevage et des truites sauvages de l’Orb',
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
        'Cette étude compare la diversité génétique de populations sauvages méditerranéennes de truite commune du bassin de l’Orb à celle de souches d’élevage atlantiques et méditerranéennes. Les analyses génomiques mettent en évidence des différences de diversité pertinentes pour réfléchir aux pratiques de repeuplement et à la conservation.',
      question:
        'Comment la diversité des souches d’élevage se compare-t-elle à celle des populations sauvages méditerranéennes étudiées ?',
      approach:
        'ddRAD-seq et comparaison de stratégies d’obtention des génotypes, complétés par une analyse de la diversité génétique.',
      finding:
        'Dans ce système, les souches d’élevage présentent une diversité plus faible que les populations sauvages comparées.',
      limit:
        'Synthèse fondée sur le résumé de l’article publié ; les résultats détaillés et les figures n’ont pas été consultés.',
      figures: [],
    },
  ] as ResearchPublication[],
  featured: [
    {
      publication: 'truite-ressource-snp-2019',
      theme: 'conservation',
      label: 'Conservation de la biodiversité',
      species: 'Truite commune',
      steps: [
        {
          value: '12 204',
          label:
            'SNP informatifs identifiés par séquençage RAD et positionnés sur la carte de liaison',
        },
        {
          value: '192',
          label: 'SNP retenus pour une puce à faible coût (96 × 2), répartis sur la carte',
        },
        {
          value: '1 862',
          label: 'truites génotypées dans cinq rivières, des lignées atlantique et méditerranéenne',
        },
        {
          value: '< 1 %',
          label: 'de loci non génotypés par individu, dans toutes les rivières',
        },
      ],
      chart: {
        kind: 'panel',
        total: 12204,
        selected: 192,
      },
      chartTitle: 'Du génome à la puce : 12 204 SNP, dont 192 retenus',
      chartNote:
        'Un point par SNP : leur nombre est celui de l’article, leur disposition est illustrative.',
    },
    {
      publication: 'bar-resistance-vnn-2023',
      theme: 'aquaculture',
      label: 'Aquaculture',
      species: 'Bar européen',
      steps: [
        {
          value: '838 451',
          label: 'SNP issus du séquençage du génome entier des parents',
        },
        {
          value: '2 371 · 3 428',
          label:
            'bars de deux populations commerciales, avec leur survie à une infection expérimentale par la VNN',
        },
        {
          value: '127 kb',
          label: 'région QTL du groupe de liaison 12, partagée par les deux populations',
        },
        {
          value: '2 gènes',
          label: 'dans cette région : ZDHHC14 et IFI6/IFI27-like',
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
      chartTitle: 'Taux de survie au challenge VNN selon le génotype',
      chartNote:
        'Valeurs du résumé de l’article publié : génotype sensible et génotype résistant pour la région QTL.',
    },
    {
      publication: 'porc-efficacite-alimentaire-gwas-2021',
      theme: 'selection',
      label: 'Agriculture et sélection',
      species: 'Porc',
      steps: [
        {
          value: '570 447',
          label: 'SNP pour 2 426 porcs, après imputation et prédiction des génotypes',
        },
        {
          value: '24',
          label: 'caractères de production enregistrés',
        },
        {
          value: '9',
          label: 'générations de sélection divergente sur la consommation alimentaire résiduelle',
        },
        {
          value: '3',
          label: 'études d’association : les deux lignées ensemble, puis chacune séparément',
        },
      ],
      chart: {
        kind: 'regions',
        bars: [
          {
            label: 'Deux lignées ensemble',
            value: 45,
          },
          {
            label: 'Lignée LRFI',
            value: 42,
          },
          {
            label: 'Lignée HRFI',
            value: 28,
          },
        ],
        shared: 13,
        common: 1,
      },
      chartTitle: 'Régions chromosomiques détectées selon le plan d’analyse',
      chartNote:
        'Valeurs du résumé de l’article publié. Parmi les 45 régions de l’analyse globale, 13 sont partagées par au moins deux analyses et 1 par les trois.',
    },
  ] as ResearchFeatured[],
};
