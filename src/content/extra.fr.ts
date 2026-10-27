import { assayTargetsFr } from './assay-targets';
// Content migrated from the public LDgenX sites (collected 13 October 2026, see
// ldgenx-migration-2026-10-13/) and from the Artois-Picardie documents published by the Agence
// de l’eau. Texts follow the sources; only spelling slips are corrected (listed in
// docs/MIGRATION.md). Nothing here is a new result or a new claim.
import type {
  CustomAssay,
  EquipmentItem,
  Person,
  StudySiteRecord,
  Work,
  PartnerMember,
} from './types';

// ---------------------------------------------------------------------------------------------
// Scientific write-ups published on ldgenx.fr (/services/conservation, /services/tracabilite,
// /services/selection-genomique). They present the published research of the team members;
// they are not presented as LDgenX contracts.
// ---------------------------------------------------------------------------------------------
export const works: Work[] = [
  {
    id: 'conservation',
    slug: 'conservation',
    title: 'Conservation',
    category: 'Travaux scientifiques · génomique de la conservation',
    summary:
      'Diversité génétique des truites de l’Orb, ancestralité domestique chez l’omble de fontaine et effets de l’introduction d’allèles domestiques.',
    image: 'cas-truites',
    facts: [
      { label: 'Espèces', value: 'Truite commune, omble de fontaine' },
      { label: 'Marqueurs', value: '196 639 SNP (truite) ; environ 33 000 SNP (omble)' },
      { label: 'Publications', value: 'Leitwein et al. 2016, 2019 et 2021' },
    ],
    service: 'genomique-des-populations',
    source: 'https://www.ldgenx.fr/services/conservation',
    sections: [
      {
        title: 'La diversité génétique des truites de l’Orb',
        paragraphs: [
          'L’utilisation de 196K marqueurs SNP a permis d’estimer la diversité génétique et l’indice de consanguinité des populations de truites communes (*Salmo trutta*), sauvages (La Mare, Gravezon et l’Orb) et domestiques (Atlantique et Méditerranéenne) du bassin de l’Orb.',
          'Nous avons pu mettre en évidence que la population sauvage de Gravezon avait une plus faible diversité génétique et un fort taux de consanguinité, comparée aux populations sauvages de la Mare et de l’Orb (Tableau 1 ; [Leitwein et al. 2016](https://pubmed.ncbi.nlm.nih.gov/27666575/)).',
          'De plus, nous avons démontré que la souche domestique Méditerranéenne était très faiblement diversifiée et fortement consanguine contrairement à la souche domestique Atlantique, qui présente une plus forte diversité génétique.',
          'Ces résultats démontrent que la souche domestique Méditerranéenne nécessite une gestion particulière afin d’augmenter la diversité génétique.',
        ],
        figure: {
          image: 'fig-orb-diversite',
          alt: 'Tableau des indices de diversité génétique et de consanguinité des populations de truites du bassin de l’Orb',
          caption:
            'Tableau 1 modifié de [Leitwein et al. 2016](https://pubmed.ncbi.nlm.nih.gov/27666575/), Journal of Fish Biology.',
          legend:
            'Résumé pour chaque rivière sauvage du bassin de l’Orb (La Mare, Gravezon et l’Orb) et pour les deux souches domestiques (Atlantique et Méditerranéenne), du (N) nombre d’individus, (x) nombre moyen de marqueurs SNP, (He) hétérozygotie attendue, (Ho) hétérozygotie observée, (Fis) indice de consanguinité et (π) diversité nucléotidique. *** valeur significative p < 0,0001.',
        },
      },
      {
        title: 'Paysage génomique d’ancestralité domestique chez l’omble de fontaine',
        paragraphs: [
          'L’omble de fontaine (*Salvelinus fontinalis*) fait l’objet de repeuplements destinés à la pêche sportive au Québec. Ces introductions ont entraîné des mélanges entre populations sauvages et souche domestique, étudiés par [Leitwein et al. (2019)](https://doi.org/10.1111/mec.15256).',
          'L’article publié analyse environ 33 000 SNP cartographiés chez 611 individus de 24 populations repeuplées. Les segments d’ascendance permettent de distinguer des hybrides de générations précoces ou plus tardives et d’estimer l’introgression domestique le long du génome. Les régions favorisant ou défavorisant cette ascendance varient selon l’échelle étudiée et le contexte de recombinaison (Figure 1 ; [Leitwein et al. 2019](https://doi.org/10.1111/mec.15256)).',
        ],
        figure: {
          image: 'fig-omble-ancestralite',
          alt: 'Taux d’ancestralité domestique le long des groupes de liaison de l’omble de fontaine',
          caption:
            'Figure 1 extraite de [Leitwein et al. 2019](https://onlinelibrary.wiley.com/doi/10.1111/mec.15256), Molecular Ecology.',
          legend:
            'Taux d’ancestralité domestique le long des 41 groupes de liaison (LG) de l’omble de fontaine pour les individus de la catégorie hybride récent.',
        },
      },
      {
        title: 'Effets de l’introduction d’allèles domestiques',
        paragraphs: [
          'Chez l’omble de fontaine, certains profils sont compatibles avec un effet favorable lié au masquage d’allèles récessifs potentiellement délétères dans les populations sauvages. Les résultats de 2019 et 2021 montrent toutefois des effets variables selon les populations et les régions génomiques ; ils ne permettent pas de considérer tout apport d’allèles domestiques comme bénéfique.',
          'Cependant, au-delà de ces potentiels effets bénéfiques, des effets de purge des allèles domestiques ont également pu être observés. Ces mécanismes reflètent des effets négatifs de l’introduction d’allèles domestiques dans certaines régions du génome ([Leitwein et al. 2019](https://onlinelibrary.wiley.com/doi/10.1111/mec.15256) et [2021](https://pubmed.ncbi.nlm.nih.gov/33916757/)).',
          'Par exemple, sur le groupe de liaison 26 (Figure 2), nous pouvons observer un excès d’ancestralité domestique associé à des allèles récessifs potentiellement délétères.',
        ],
        figure: {
          image: 'fig-omble-lg26',
          alt: 'Excès ou déficit d’ancestralité domestique selon les allèles, groupe de liaison 26',
          caption:
            'Figure 2 modifiée de [Leitwein et al. 2019](https://onlinelibrary.wiley.com/doi/10.1111/mec.15256), Molecular Ecology.',
          legend:
            'Excès ou déficit d’ancestralité domestique en fonction de la présence d’allèles non délétères ou potentiellement délétères pour le groupe de liaison 26 chez les individus hybrides anciens d’omble de fontaine.',
        },
      },
    ],
  },
  {
    id: 'tracabilite',
    slug: 'tracabilite',
    title: 'Traçabilité',
    category: 'Travaux scientifiques · génomique des populations',
    summary:
      'Origine des truites du bassin de l’Orb, âge des introductions domestiques et développement d’une ressource SNP et d’un panel de génotypage.',
    image: 'fig-puce-truite',
    facts: [
      { label: 'Espèce', value: 'Truite commune (Salmo trutta)' },
      { label: 'Marqueurs', value: '75 684 SNP cartographiés ; ressource de 12 204 SNP ; panel de 192 SNP' },
      { label: 'Publications', value: 'Leitwein et al. 2018, Saint-Pé et al. 2019' },
    ],
    service: 'genomique-des-populations',
    source: 'https://www.ldgenx.fr/services/tracabilite',
    sections: [
      {
        title: 'Exemple d’analyses génomiques de traçabilité : les truites de l’Orb',
        paragraphs: [
          'Le bassin méditerranéen de l’Orb (Hérault), cours d’eau du sud de la France, d’une superficie de 1 580 km², est soumis depuis la fin des années 1960 à des repeuplements de truites domestiques (*Salmo trutta*) d’origine atlantique et méditerranéenne. L’objectif est ainsi d’augmenter les populations locales méditerranéennes pour la pêche récréative.',
          'Dans l’étude de [Leitwein et al. (2018)](https://doi.org/10.1111/mec.14816), 75 684 SNP cartographiés issus du ddRAD-seq ont servi à décrire les contributions des souches domestiques atlantique et méditerranéenne dans les populations sauvages du bassin de l’Orb.',
          'Ainsi nous avons pu identifier des individus d’origine domestique Atlantique (c’est-à-dire échappés de pisciculture) dans la rivière de Gravezon, des individus d’origine domestique Méditerranéenne dans la rivière de la Mare, ainsi que des individus hybrides ayant des allèles domestiques Atlantique et Méditerranéen dans les trois rivières sauvages (Figure 1).',
        ],
        figure: {
          image: 'fig-orb-admixture',
          alt: 'Proportions d’ancestralité domestique et sauvage des truites des trois rivières',
          caption:
            'Figure 1 modifiée de [Leitwein et al. 2018](https://pubmed.ncbi.nlm.nih.gov/30054960/), Molecular Ecology.',
          legend:
            'Chaque barre représente la proportion d’ancestralité domestique Atlantique en bleu, domestique Méditerranéenne en rouge et sauvage en vert pour les trois populations de Gravezon (Grav), de la Mare (Mare) et de l’Orb (Orb).',
        },
      },
      {
        title: 'L’âge des introductions',
        paragraphs: [
          'L’étude des haplotypes (segments) domestiques atlantique et méditerranéen nous a également permis d’estimer l’âge des introductions pour chacune des trois rivières.',
          'Ainsi nous avons pu mettre en évidence que les individus domestiques Atlantique avaient été introduits il y a en moyenne 24,01 générations dans la rivière du Gravezon, 22,31 générations dans la rivière de la Mare et 30,9 générations dans la rivière de l’Orb (Figure 2).',
          'De même, l’âge d’introduction de truites domestiques Méditerranéennes a été estimé à 11,51 générations dans la rivière du Gravezon, 25,07 générations dans la Mare et 23,23 dans l’Orb (Figure 2).',
        ],
        figure: {
          image: 'fig-orb-introductions',
          alt: 'Temps en générations depuis l’introduction d’individus domestiques dans les trois populations',
          caption:
            'Figure 2 extraite de [Leitwein et al. 2018](https://pubmed.ncbi.nlm.nih.gov/30054960/), Molecular Ecology.',
          legend:
            'Temps en nombre de générations depuis l’introduction d’individus domestiques Atlantique (bleu) et domestiques Méditerranéens (rouge) dans les trois populations Gravezon, La Mare et l’Orb.',
        },
      },
      {
        title: 'Développement d’outils génomiques : une ressource SNP et un panel ciblé',
        paragraphs: [
          '[Saint-Pé et al. (2019)](https://doi.org/10.1186/s12864-019-5958-9) ont identifié une ressource de 12 204 SNP répartis sur les 40 groupes de liaison de la truite commune (*Salmo trutta*). À partir de cette ressource, ils ont développé un panel de faible densité de 192 SNP (Figure 3).',
          'Le panel a été évalué sur 1 862 individus dans cinq rivières. Il fournit un outil de génotypage reproductible et économique pour les études de génétique des populations.',
          'Dans les populations testées, il distingue les lignées atlantique et méditerranéenne et permet d’étudier le mélange avec les souches domestiques.',
        ],
        figure: {
          image: 'fig-puce-truite',
          alt: 'Positions des 12 204 marqueurs SNP le long des 40 groupes de liaison de la truite commune',
          caption:
            'Figure 3 extraite de [Saint-Pé et al. (2019)](https://bmcgenomics.biomedcentral.com/articles/10.1186/s12864-019-5958-9), BMC Genomics.',
          legend:
            'Positions (en centiMorgan) des 12 204 marqueurs SNP le long des 40 groupes de liaison de la truite commune (*Salmo trutta*).',
        },
      },
    ],
  },
  {
    id: 'selection-genomique',
    slug: 'selection-genomique',
    title: 'Sélection génomique',
    category: 'Travaux scientifiques · sélection génomique',
    summary:
      'Gènes de résistance à la nodavirose chez le bar européen et valeurs génétiques pour la sélection de caractères d’intérêt.',
    image: 'cas-bar',
    facts: [
      { label: 'Espèces', value: 'Bar européen, porc' },
      { label: 'Approches', value: 'Séquençage de génome entier, GWAS, prédiction génomique' },
      {
        label: 'Publications',
        value: 'Delpuech et al. 2023, Aliakbari et al. 2020, Griot et al. 2021',
      },
    ],
    service: 'selection',
    source: 'https://www.ldgenx.fr/services/selection-genomique',
    sections: [
      {
        title: 'Identification de gènes de résistance à la nodavirose chez le bar',
        paragraphs: [
          'Le séquençage de génome entier de près de 400 bars a permis la cartographie fine du phénotype de résistance à la nodavirose chez le bar européen (*Dicentrarchus labrax*).',
          'La combinaison de données de séquençage haut débit avec des données de génotypage de moyenne densité (~57K marqueurs SNP) et des données phénotypiques a mis en évidence une association forte entre un locus de caractère quantitatif (QTL) du groupe de liaison 12 (LG12) et la survie des bars face à une infection à la nodavirose (Figure 1, [Delpuech et al. 2022](https://doi.org/10.1101/2022.05.31.494209)).',
          'À partir de l’annotation du génome du bar, disponible en libre accès sur les bases de données publiques, nous avons pu identifier deux gènes d’intérêt, ZDHHC14 et IFI6. IFI6, qui code une protéine induite par l’interféron, apparaît comme un gène candidat majeur de la résistance à la nodavirose.',
          'Les écloseries peuvent dès lors utiliser ces connaissances pour l’amélioration de la sélection génomique de leurs lignées dans le but de développer des bars plus résistants.',
        ],
        figure: {
          image: 'fig-bar-nodavirose',
          alt: 'Manhattan plot des associations génétiques avec la résistance à la nodavirose chez le bar européen',
          caption:
            'Figure 1 extraite de [Delpuech et al. (2022)](https://doi.org/10.1101/2022.05.31.494209), bioRxiv.',
          legend:
            'Manhattan plot représentant les associations génotypes-phénotypes obtenues à l’issue de l’étude de la résistance à la nodavirose chez le bar européen.',
        },
      },
      {
        title: 'Études des valeurs génétiques pour la sélection de caractères d’intérêt',
        paragraphs: [
          'La sélection génomique utilise des marqueurs répartis dans le génome pour estimer les valeurs génétiques des reproducteurs. En aquaculture, elle peut améliorer la précision des prédictions de résistance à certaines maladies par rapport à une approche fondée uniquement sur le pedigree. Le gain dépend toutefois du caractère, de la population de référence et du programme de sélection ([Griot et al. 2021](https://doi.org/10.3389/fgene.2021.665920)).',
          'D’autre part, dans un article de référence pour la prédiction génomique, [Aliakbari et al. (2020)](https://doi.org/10.1186/s12711-020-00576-0) ont mis en évidence une prédiction génomique similaire en utilisant soit (i) un jeu de données dit d’entraînement comprenant des animaux de lignées génétiquement apparentées, soit (ii) un ensemble d’entraînement provenant de la population ciblée. Combiner des données apparentées et des données de la population cible peut améliorer la précision pour certains caractères (Figure 3).',
          'Ces résultats de génétique quantitative donnent une meilleure connaissance pour la conception des populations de référence, en particulier pour initier la sélection génomique dans des populations où le nombre d’échantillons historiques est faible.',
        ],
        figure: {
          image: 'fig-gebv',
          alt: 'Corrélations entre valeurs génomiques estimées selon les scénarios d’entraînement',
          caption:
            'Figure 3 extraite de [Aliakbari et al. (2020)](https://doi.org/10.1186/s12711-020-00576-0), Genetics Selection Evolution.',
          legend:
            'Corrélations entre GEBVp et GEBVw, et leurs barres d’erreur pour les lignées HRFI (a) et LRFI (b). * = différence significative avec le scénario 1 (contrôle) selon le test t de Williams au seuil de 0,05. RFI = consommation alimentaire résiduelle, ADG = gain moyen quotidien, FCR = indice de consommation, DFI = consommation alimentaire quotidienne, BFT = épaisseur du gras dorsal.',
        },
      },
    ],
  },
];

// ---------------------------------------------------------------------------------------------
// The team, as presented on ldgenx.fr/a-propos/equipe, with the publication lists of
// ldgenx.fr/equipe/dr-maeva-leitwein and /equipe/dr-emilie-delpuech (lists end in 2022).
// ---------------------------------------------------------------------------------------------
export const people: Person[] = [
  {
    id: 'maeva-leitwein',
    slug: 'dr-maeva-leitwein',
    name: 'Dr Maeva Leitwein',
    role: 'Cofondatrice · Génomique des populations',
    title: 'Cofondatrice de LDgenX',
    initials: 'ML',
    photo: 'portrait-maeva',
    service: 'genomique-des-populations',
    bio: 'Spécialisée en génomique et en épigénomique, Maeva étudie la diversité, l’adaptation et les interactions entre populations naturelles et domestiques. Elle met son expérience de recherche au service des questions de conservation et de gestion.',
    biography: [
      'Issue du milieu académique et originaire de l’archipel de Molène en Bretagne, je suis particulièrement intéressée par l’utilisation des outils génomiques pour la conservation de la biodiversité.',
      'Mes travaux de recherche s’intéressent principalement à la compréhension et à l’évaluation des mécanismes évolutifs qui modulent la biodiversité intra et inter-populationnelle à différentes échelles de temps.',
      'Après un Master en biologie marine, je me suis spécialisée lors de mon doctorat dans l’utilisation de la génomique pour évaluer les conséquences de l’introduction d’individus domestiques dans les populations sauvages. Durant mon post-doctorat au Canada, j’ai utilisé les outils génomiques et épigénomiques afin d’étudier l’impact des piscicultures sur le patrimoine génomique et la valeur sélective des populations sauvages. Ces approches m’ont permis de comprendre les forces évolutives (positives ou négatives) qui modulent le paysage génomique des populations naturelles.',
      'De retour en France depuis 2021, j’étudie à présent les effets de la température, dans le cadre du réchauffement climatique, sur le déterminisme du sexe chez le bar européen. J’étudie également les effets de mélanges entre lignées (ancestralité) sur le phénotype des individus et les conséquences dans l’adaptation des espèces à leur environnement.',
      'Au sein de LDgenX, j’apporte mon expertise en génomique afin de répondre à des questions de conservation pour une meilleure gestion des populations naturelles et domestiques.',
    ],
    source: 'https://www.ldgenx.fr/equipe/dr-maeva-leitwein',
    orcid: '0000-0001-5172-0970',
  },
  {
    id: 'emilie-delpuech',
    slug: 'dr-emilie-delpuech',
    name: 'Dr Emilie Delpuech',
    role: 'Cofondatrice · Bioinformatique',
    title: 'Cofondatrice de LDgenX',
    initials: 'ED',
    photo: 'portrait-emilie',
    service: 'bioinformatique',
    bio: 'À la croisée des sciences du vivant et de l’informatique, Emilie développe des approches d’analyse de données omiques. Son parcours en génétique animale et en sélection génomique nourrit les analyses spécifiques aux projets.',
    biography: [
      'Passionnée par le vivant et par son étude, j’ai consacré une grande partie de mon parcours académique à apprendre les spécificités de la biologie végétale et animale.',
      'Au vu de l’avancée des méthodes d’analyse des données biologiques, je me suis spécialisée en bioinformatique. Aujourd’hui, j’ai donc les connaissances pour analyser différents jeux de données dits omiques.',
      'Grâce à ma double formation en sciences du vivant et en informatique, j’ai la capacité de m’intégrer dans divers projets de biologie, me permettant ainsi de mettre en place la meilleure approche bioinformatique possible pour la question posée. Dans le cadre de mes analyses, j’utilise différents types de langages informatiques pour construire des pipelines d’analyses afin de répondre à des questions biologiques.',
      'Durant ma thèse et mes deux post-doctorats, je me suis impliquée dans des sujets de génétique animale afin d’améliorer la sélection génomique d’espèces d’élevage à partir de données génétiques et phénotypiques.',
      'Je mets donc au service de LDgenX toutes mes connaissances en développement informatique afin de réaliser les analyses les plus spécifiques au sujet d’étude.',
    ],
    source: 'https://www.ldgenx.fr/equipe/dr-emilie-delpuech',
    orcid: '0000-0003-0848-4903',
  },
  {
    id: 'maxime-lambert',
    slug: '',
    name: 'Maxime Lambert',
    role: 'Ingénieur laboratoire · Biologie moléculaire',
    title: 'Ingénieur laboratoire',
    initials: 'ML',
    photo: 'portrait-maxime',
    service: 'sequencage-dpcr',
    bio: 'Maxime apporte son expertise en extraction d’acides nucléiques, préparation de banques et séquençage longue lecture. Il conçoit et adapte les approches expérimentales aux questions scientifiques.',
    biography: [
      'Passionné par les sciences du vivant et les technologies innovantes, j’ai orienté mon parcours académique et professionnel vers la biologie moléculaire et la génomique.',
      'Mes expériences m’ont amené à développer un intérêt particulier pour les approches moléculaires appliquées à l’étude de la biodiversité, notamment lors de mon passage à l’Institut des Sciences de l’Évolution de Montpellier (ISEM, Université de Montpellier, CNRS, IRD, EPHE, CIRAD, INRAE).',
      'J’y ai acquis une solide expertise en biologie moléculaire, de l’extraction d’acides nucléiques sur matrices complexes à la préparation de banques de séquençage.',
      'Spécialisé dans les technologies de séquençage longue lecture, notamment Oxford Nanopore Technologies, je développe et optimise des protocoles adaptés à différentes problématiques, en génomique, métagénomique ou caractérisation d’organismes complexes. Mon expérience inclut également le développement de méthodes et l’optimisation de protocoles expérimentaux.',
      'Au sein de LDgenX, j’apporte mon expertise en biologie moléculaire et en séquençage pour concevoir et mettre en œuvre des approches expérimentales robustes, adaptées aux besoins spécifiques de chaque projet.',
    ],
    source: 'https://www.ldgenx.fr/a-propos/equipe',
  },
  {
    id: 'damien-crestel',
    slug: 'dr-damien-crestel',
    name: 'Dr Damien Crestel',
    role: 'Bioinformaticien · Génétique des populations et quantitative',
    title: 'Bioinformaticien',
    initials: 'DC',
    photo: 'portrait-damien',
    service: 'bioinformatique',
    bio: 'Ingénieur agronome, Damien a consacré son doctorat aux bases génétiques de l’adaptation à la température du bar européen. Il met la biostatistique, la modélisation et la génomique au service des projets, de l’ADNe à l’évolution des populations naturelles.',
    biography: [
      'Ayant grandi dans le milieu agricole en Bretagne, j’ai effectué une formation d’ingénieur agronome, spécialisée en sciences halieutiques et aquacoles. J’ai ensuite réalisé un doctorat portant sur les bases génétiques de l’adaptation à la température du bar européen, espèce aquacole majeure en Europe. Ce parcours témoigne de mon attrait pour la biodiversité et les sciences du vivant, et de mon souhait de renforcer les connaissances sur l’évolution de la biodiversité face au changement global actuel.',
      'Mes expériences ont permis de développer mes compétences depuis la mise en place et la gestion d’expérimentations, la récolte des données, jusqu’à l’analyse de celles-ci en utilisant des outils de biostatistique et de génomique. Grâce à ce parcours, je peux m’adapter à divers projets nécessitant le traitement de données phénotypiques et génomiques. Dans le cadre de mes analyses, j’ai utilisé différents outils et langages bio-informatiques permettant de répondre à des sujets de génétique des populations et de génétique quantitative. J’ai aussi été amené à gérer de gros jeux de données phénotypiques nécessitant des compétences en modélisation afin de mettre en place des modèles plus ou moins complexes.',
      'Au sein de LDgenX, mes connaissances en biologie évolutive et en analyse bio-informatique et statistique permettent de répondre aux différents sujets d’étude, de l’utilisation de l’ADNe à l’évolution des populations naturelles.',
    ],
    source: 'Présentation transmise par LDgenX (octobre 2026)',
    orcid: '0009-0006-6022-9853',
  },
];

// ---------------------------------------------------------------------------------------------
// Sampling equipment, as published on ldgenx.fr/services/materiel. Prices are no longer
// published (client's request, October 2026): a quote states them.
// ---------------------------------------------------------------------------------------------
export const equipment: EquipmentItem[] = [
  {
    id: 'pompe-triple',
    name: 'Pompe triple',
    summary: 'Trois filtrations séparées en parallèle avec capsules Waterra.',
    specs: [
      'Taille des tuyaux d’entrée : 12 mm ou 4 mm de diamètre',
      'Hauteur maximale entre la surface de l’eau et la pompe : 1,5 m avec tuyaux de 12 mm et 5 m avec tuyau de 4 mm (modèle 1) ; 3 m avec tuyaux de 12 mm et 15 m avec tuyau de 6 mm (modèle 2)',
      'Vitesse de pompage effective : 3 L/min (modèle 1) ou 10 L/min (modèle 2)',
      'Trois débitmètres intégrés',
      'Autonomie de 8 h (modèle 1) ou 10 h (modèle 2), batterie lithium-ion Opti Battery incluse',
      'Taille de pores : 0,1 µm, 0,22 µm, 0,45 µm, 1,2 µm et 5 µm',
    ],
    images: [
      { name: 'materiel-pompe', alt: 'Pompe triple ADNe fermée, avec ses trois débitmètres' },
      { name: 'materiel-pompe-interieur', alt: 'Pompe triple ADNe, panneau de commande' },
      {
        name: 'materiel-capsules',
        alt: 'Capsules de filtration Waterra de différentes tailles de pores',
      },
    ],
  },
  {
    id: 'stick-pump',
    name: 'Stick pump',
    summary: 'Quatre filtres en parallèle.',
    specs: [
      'Vitesse de pompage : 40 L/min',
      'Un débitmètre intégré',
      'Batterie Makita 18 V non incluse',
      'Filtre en nylon de 20 µm ou 5 µm et 47 mm de diamètre',
    ],
    images: [{ name: 'materiel-stickpump', alt: 'Stick pump de filtration ADNe' }],
  },
  {
    id: 'torpille',
    name: 'Torpille',
    summary: 'Trois filtrations en parallèle, tractée derrière un bateau.',
    specs: [
      'Volume filtré par dépression, dépendant de la vitesse (environ 50 L par filtre en 10 min à 6 nœuds)',
      'Filtre en nylon de 20 µm ou 5 µm et 47 mm de diamètre',
      'Tractée derrière un bateau',
    ],
    images: [
      { name: 'materiel-torpille', alt: 'Torpille d’échantillonnage ADNe' },
      {
        name: 'materiel-torpille-terrain',
        alt: 'Torpille tractée derrière un bateau lors d’un prélèvement',
      },
    ],
  },
];

// ---------------------------------------------------------------------------------------------
// Partner logos as published on ldgenx.fr/a-propos/partenaires (frames removed). Same three
// groups, same order as `partners` in fr.ts.
// ---------------------------------------------------------------------------------------------
export const partnerIntro = {
  text: 'LDgenX collabore avec des organismes de recherche, des universités, des bureaux d’études et des entreprises afin de développer des solutions scientifiques innovantes. Ces collaborations permettent de mobiliser des expertises complémentaires et de répondre à des problématiques complexes dans les domaines de la biodiversité, de l’agriculture et de l’aquaculture.',
  groups: [
    {
      title: 'Ils nous font confiance',
      text: '',
      members: [
        { name: 'Fédération Nationale des Chasseurs', logo: 'federation-nationale-des-chasseurs' },
        { name: 'Plastic at Sea', logo: 'plastic-at-sea' },
        { name: 'Qualyse', logo: 'qualyse' },
        { name: 'Université de Corse', logo: 'universite-de-corse' },
        { name: 'Pays de l’Ours – ADET', logo: 'pays-de-l-ours-adet' },
        { name: 'Agence de l’eau Artois-Picardie', logo: 'agence-eau-artois-picardie' },
        { name: 'Groupe Barba', logo: 'groupe-barba' },
        { name: 'EPHE', logo: 'ephe' },
        { name: 'Biotope', logo: 'biotope' },
        { name: 'Line Up Ocean', logo: 'line-up-ocean' },
      ] as PartnerMember[],
    },
    {
      title: 'Les instituts de recherche publique',
      text: 'Nous tirons notre expertise de parcours au sein de grands instituts de recherche, où l’équipe s’est formée et a mené ses premiers projets.',
      members: [
        { name: 'MARBEC', logo: 'marbec' },
        { name: 'Ifremer', logo: 'ifremer' },
        { name: 'INRAE', logo: 'inrae' },
        { name: 'CNRS', logo: 'cnrs' },
        { name: 'Université de Montpellier', logo: 'universite-montpellier' },
      ] as PartnerMember[],
    },
    {
      title: 'Ils nous soutiennent et nous accompagnent',
      text: '',
      members: [
        { name: 'INRAE Start and Grow', logo: 'inrae-start-and-grow' },
        { name: 'Créalia Occitanie', logo: 'crealia' },
        { name: 'Montpellier Business School', logo: 'montpellier-business-school' },
        { name: 'Pôle Mer Méditerranée', logo: 'pole-mer' },
        { name: 'Agrovallée et Incubateur Initium', logo: 'agrovallee-initium' },
        { name: 'Incubateur 1.618', logo: 'incubateur-1618' },
        { name: 'Celimer', logo: 'celimer' },
        { name: 'Bpifrance · Label Deep Tech', logo: 'bpifrance-deeptech' },
        { name: 'Pépite Deeptech', logo: 'pepite-deeptech' },
      ] as PartnerMember[],
    },
  ],
};

// ---------------------------------------------------------------------------------------------
// About and innovation details published on ldgenx.fr/a-propos and /a-propos/innovation.
// ---------------------------------------------------------------------------------------------
export const companyStory = {
  mission:
    'Nous sommes convaincus que les outils génomiques constituent un levier majeur pour améliorer la connaissance, la gestion et la préservation du vivant. Notre mission est d’accompagner les gestionnaires, chercheurs, collectivités, bureaux d’études et entreprises dans l’utilisation de ces technologies afin de produire des données fiables pour éclairer leurs décisions.',
  ambition:
    'Notre ambition est de rendre les technologies génomiques accessibles et utiles à la prise de décision pour répondre aux défis environnementaux d’aujourd’hui et de demain.',
  deeptech:
    'L’innovation est au cœur du développement de LDgenX. Nous menons des activités de recherche et développement visant à concevoir les outils génomiques de demain pour la surveillance de la biodiversité et la gestion durable des ressources naturelles.',
  status:
    'LDgenX est une jeune entreprise innovante (JEI) spécialisée dans la génomique appliquée.',
  supports: [
    'Label Deep Tech',
    'Bourse French Tech Emergence',
    'Créalia',
    'Bpifrance',
    'Pôle Universitaire d’Innovation',
    'Instituts de recherche et universités partenaires',
  ],
};

// ---------------------------------------------------------------------------------------------
// Dated news, from the ldgenx.fr homepage (13 October 2026). Shown until the end of the event.
// ---------------------------------------------------------------------------------------------
export const news = {
  label: 'Salon',
  title: 'BlueTechShow, 4e édition',
  text: 'Retrouvez une partie de l’équipe LDgenX les 20 et 21 octobre 2026 à Canet-en-Roussillon.',
  short: 'BlueTechShow : retrouvez LDgenX les 20 et 21 octobre à Canet-en-Roussillon',
  href: 'https://bluetechshow.fr/',
  image: 'bluetechshow',
  until: '2026-10-21',
};

// ---------------------------------------------------------------------------------------------
// Booking, as published on ldgenx.fr/contact. Two booking links coexist on the current sites:
// cal.com (homepage) and Axonaut (contact). LDgenX must say which one to keep.
// ---------------------------------------------------------------------------------------------
export const booking = {
  title: 'Réserver un échange',
  text: 'Vous avez un projet, une intuition ou une problématique liée à la génétique, à l’ADN environnemental, à la génomique des populations ou à la sélection génomique ? Prenons 15 minutes pour en discuter, gratuitement et sans engagement.',
  benefits: [
    'présenter brièvement vos besoins ou vos réflexions',
    'découvrir ce que LDgenX peut vous apporter comme approche innovante',
    'poser vos questions à l’une des fondatrices de LDgenX',
  ],
  note: 'La demande de premier échange est accessible sans compte. Elle permet de voir ensemble comment nous pouvons vous aider.',
  action: '15 minutes gratuites',
  alternate: 'https://axonaut.com/public/booking/b4afed/pageShow/rendez-vous-avec-ldgenx-9b56c1',
};

// ---------------------------------------------------------------------------------------------
// Artois-Picardie: results published by the Agence de l’eau (article of 6 August 2026), the
// final report (Qualyse, LDgenX, Prelevmar, version 2 of 28 May 2026) and the restitution
// presentation (30 June 2026). Sector values come from the field spreadsheet (report, annex 2)
// and the richness of each sector from the report text. Totals per site differ between the
// documents depending on the marker and filters, so none is quoted.
// ---------------------------------------------------------------------------------------------
export const artoisPicardie = {
  documents: [
    {
      title: 'Article de l’Agence de l’eau Artois-Picardie',
      date: '6 août 2026',
      href: 'https://www.eau-artois-picardie.fr/etude-de-la-biodiversite-de-lichtyofaune-dans-les-estuaires-et-les-ports-avec-ladn-environnemental',
      kind: 'Page web',
    },
    {
      title: 'Rapport final : restitution des résultats',
      date: 'Version 2, 28 mai 2026',
      href: 'https://www.eau-artois-picardie.fr/sites/default/files/rapport_final_adne_estuaires_et_ports_aeap_0.pdf',
      kind: 'PDF, 71 pages',
    },
    {
      title: 'Présentation de la réunion de restitution',
      date: 'Douai, 30 juin 2026',
      href: 'https://www.eau-artois-picardie.fr/sites/default/files/presentation_reunion_de_restitution_adne_estuaires_et_ports_aeap_30062026_0.pdf',
      kind: 'PDF, 29 diapositives',
    },
  ],
  credit:
    'Figures : rapport final et présentation de restitution du groupement Qualyse, LDgenX et Prelevmar pour l’Agence de l’eau Artois-Picardie (2026).',
  objectives: [
    'Améliorer les connaissances de la biodiversité dans les ports et les estuaires.',
    'Comparer l’ADNe avec les méthodes d’acquisition classiques utilisées dans les estuaires dans le cadre de la DCE.',
  ],
  findings: [
    'Le nombre médian d’espèces est relativement similaire entre les estuaires et les ports, à part pour l’estuaire de la Slack.',
    'Les espèces ne se répartissent pas de la même façon entre les ports et les estuaires.',
    'Les espèces marines juvéniles sont majoritaires dans la partie aval des sites ; les estuaires et le port de Boulogne-sur-Mer montrent en amont une proportion importante d’espèces amphihalines.',
    'Un pourcentage important d’espèces d’eau douce est trouvé sur l’ensemble des sites, reflétant certainement l’influence des cours d’eau transportant de l’ADN depuis l’amont.',
  ],
  keyFigures: [
    { value: '8', label: 'sites, des ports de Dunkerque à l’estuaire de la Somme' },
    { value: '15', label: 'stations (secteurs) échantillonnées' },
    { value: '45', label: 'filtres : trois réplicats par station' },
    { value: '2', label: 'marqueurs génétiques, Teleo et Elas02' },
  ],
  protocol: [
    {
      title: 'Sur le terrain',
      text: 'Du 25 novembre au 3 décembre 2025, trois réplicats filtrés simultanément par station avec trois pompes en parallèle, sur capsules stériles Waterra de 0,45 µm, puis conservés dans un tampon Longmire. Les volumes filtrés ont varié de 2 à 90 L, avec une moyenne d’environ 29 L, en raison des fortes turbidités.',
    },
    {
      title: 'Au laboratoire',
      text: 'Extraction de l’ADN (kit ZymoBIOMICS), amplification de deux marqueurs : Teleo (gène 12S des téléostéens) et Elas02 (élasmobranches), cinq réplicats de PCR par échantillon, séquençage Ion Torrent S5 Prime. Les contrôles négatifs séquencés ne présentent aucune séquence.',
    },
    {
      title: 'En bioinformatique',
      text: 'Démultiplexage par des scripts développés par LDgenX, pipeline SAMBA v4.0 (QIIME2, DADA2), assignation taxonomique sur la base MIDORI2. Sur 356 ASV détectés, 96 ont été assignés à une espèce de l’ichtyofaune : 23 taxons avec Teleo, 13 avec Elas02.',
    },
  ],
  guilds: [
    {
      code: 'MJ',
      name: 'Marines juvéniles',
      text: 'Espèces marines utilisant l’estuaire comme zone de nourricerie.',
    },
    {
      code: 'ER',
      name: 'Résidentes estuariennes',
      text: 'Espèces accomplissant tout ou partie majeure de leur cycle de vie dans l’estuaire.',
    },
    {
      code: 'MA',
      name: 'Marines adventices',
      text: 'Espèces marines fréquentant occasionnellement l’estuaire ou les zones portuaires.',
    },
    {
      code: 'DIA',
      name: 'Migratrices amphihalines',
      text: 'Espèces reliant les milieux marins et continentaux, comme le saumon ou l’anguille.',
    },
    {
      code: 'FW',
      name: 'Eau douce',
      text: 'Espèces témoignant de l’influence continentale et des apports fluviaux.',
    },
  ],
  core: {
    estuaries: [
      'Clupea harengus (hareng)',
      'Dicentrarchus labrax (bar)',
      'Pomatoschistus microps (gobie tacheté)',
      'Merlangius merlangus (merlan)',
      'Pollachius virens (lieu noir)',
    ],
    ports: [
      'Clupea harengus (hareng)',
      'Merlangius merlangus (merlan)',
      'Dicentrarchus labrax (bar)',
    ],
    portsFrequent: [
      'Sardina pilchardus (sardine)',
      'Pollachius virens (lieu noir)',
      'Pomatoschistus microps (gobie tacheté)',
    ],
  },
  caution:
    'Six espèces détectées avec Teleo n’ont jamais été signalées dans la zone (Asterias amurensis, Macrobrachium nipponense, Oncorhynchus keta, Oncorhynchus tshawytscha, Sardinops sagax, Squalius lepidus), de même qu’une espèce détectée avec Elas02 (Atherina hepsetus). Le rapport les attribue à des erreurs d’assignation, des séquences proches, des contaminations ou un transport d’ADN ; les taxons douteux sont exclus de l’analyse des guildes.',
  comparison: [
    'La comparaison avec le chalut à perche n’a pu être conduite que sur l’estuaire de la Somme, système de référence suivi au titre de la DCE.',
    'Quatre espèces sont détectées par les deux méthodes : hareng, merlan, gobie tacheté et bar. Le chalut met en évidence 21 taxons exclusifs, surtout benthiques et démersaux ; l’ADNe 14, dont des espèces mobiles ou d’eau douce.',
    'Les efforts d’échantillonnage diffèrent fortement : plusieurs années de traits de chalut d’un côté, une campagne unique de prélèvements d’eau de l’autre.',
    'La hiérarchie des guildes est conservée entre les deux approches ; l’ADNe révèle une proportion plus élevée d’espèces d’eau douce.',
  ],
  turbidity:
    'La turbidité influence la détection : la richesse détectée tend à diminuer quand la turbidité augmente (R² = 0,32 ; p = 0,026).',
  perspectives: [
    'Des campagnes sur les quatre saisons dans l’estuaire de la Somme, pour mesurer la représentativité temporelle de la méthode.',
    'Un suivi continu de la turbidité pendant la filtration.',
    'Des fragments plus longs et le séquençage longue lecture (Nanopore) pour améliorer la résolution taxonomique.',
  ],
  richnessNote:
    'Les totaux d’espèces par site varient selon le marqueur et les filtres appliqués entre la présentation et le rapport. La richesse indiquée ici est celle de chaque secteur dans le rapport final ; les tableaux de données validés sont nécessaires pour un tableau de bord interactif.',
  sites: [
    {
      id: 'dunkerque-est',
      name: 'Port de Dunkerque Est',
      setting: 'port',
      area: 'Nord',
      figure: 'ap-site-dunkerque-est',
      synthesis:
        'Opposition entre un bassin de Mardyck marqué par la détection atypique d’espèces continentales (brème, gardon, perche, sandre) et un bassin d’Évolution dominé par les espèces marines et estuariennes côtières. Ces détections d’eau douce doivent être interprétées avec prudence : apports hydrauliques continentaux, transferts indirects d’ADN ou contaminations.',
      sectors: [
        {
          name: 'Bassin de Mardyck',
          date: '25 novembre 2025',
          mode: 'Navire support',
          salinity: '32',
          turbidity: '—',
          volume: '13,7',
          richness: 12,
        },
        {
          name: 'Bassin d’Évolution',
          date: '25 novembre 2025',
          mode: 'Navire support',
          salinity: '36',
          turbidity: '—',
          volume: '55',
          richness: 10,
        },
      ],
    },
    {
      id: 'dunkerque-ouest',
      name: 'Port de Dunkerque Ouest',
      setting: 'port',
      area: 'Nord',
      figure: 'ap-site-dunkerque-ouest',
      synthesis:
        'Forte dominance des espèces marines côtières (hareng, sardine, merlan, dorade royale, bar). Le bassin Atlantique ouvert, plus diversifié, compte aussi des espèces estuariennes résidentes ; la détection de la perche y apparaît peu cohérente avec ce secteur marin.',
      sectors: [
        {
          name: 'Avant-port',
          date: '26 novembre 2025',
          mode: 'Navire support',
          salinity: '35',
          turbidity: '7',
          volume: '58',
          richness: 7,
        },
        {
          name: 'Bassin Atlantique ouvert',
          date: '26 novembre 2025',
          mode: 'Navire support',
          salinity: '35',
          turbidity: '4,6',
          volume: '74',
          richness: 11,
        },
      ],
    },
    {
      id: 'calais',
      name: 'Port de Calais',
      setting: 'port',
      area: 'Pas-de-Calais',
      figure: 'ap-site-calais',
      synthesis:
        'Faute d’autorisation d’accès en bateau, les prélèvements ont été faits depuis un ponton et à pied. Les données retrouvent pourtant les espèces des campagnes au chalut de 2021-2022 (hareng, merlan, gobie tacheté, bar, sprat) ; le secteur faiblement salé montre davantage d’espèces d’eau douce.',
      sectors: [
        {
          name: 'Ponton (avant-port)',
          date: '27 novembre 2025',
          mode: 'Depuis un ponton',
          salinity: '34',
          turbidity: '16,7',
          volume: '40,7',
          richness: 13,
        },
        {
          name: 'Secteur à pied',
          date: '27 novembre 2025',
          mode: 'À pied',
          salinity: '5',
          turbidity: '21',
          volume: '12,3',
          richness: 9,
        },
      ],
    },
    {
      id: 'slack',
      name: 'Estuaire de la Slack',
      setting: 'estuaire',
      area: 'Pas-de-Calais',
      figure: 'ap-site-slack',
      synthesis:
        'Une seule station, à pied : la richesse la plus faible de la campagne, liée à une salinité d’environ 4 PSU et à des volumes filtrés très faibles. Assemblage mixte (hareng, bar, gobie tacheté, épinoche, gardon) ; le saumon atlantique détecté reste à confirmer.',
      sectors: [
        {
          name: 'Station à pied',
          date: '27 novembre 2025',
          mode: 'À pied',
          salinity: '4',
          turbidity: '49',
          volume: '3,3',
          richness: 6,
        },
      ],
    },
    {
      id: 'boulogne',
      name: 'Port de Boulogne-sur-Mer',
      setting: 'port',
      area: 'Pas-de-Calais',
      figure: 'ap-site-boulogne',
      synthesis:
        'Assemblages dominés par les espèces marines juvéniles et marines accessoires, avec une influence estuarienne et continentale plus marquée côté Liane. Le saumon atlantique, détecté dans les deux secteurs, reste à confirmer.',
      sectors: [
        {
          name: 'Secteur 2',
          date: '28 novembre 2025',
          mode: 'Navire support',
          salinity: '38',
          turbidity: '3',
          volume: '54',
          richness: 10,
        },
        {
          name: 'Aval Liane',
          date: '28 novembre 2025',
          mode: 'Navire support',
          salinity: '20',
          turbidity: '6',
          volume: '7,9',
          richness: 9,
        },
      ],
    },
    {
      id: 'canche',
      name: 'Baie de la Canche',
      setting: 'baie',
      area: 'Pas-de-Calais',
      figure: 'ap-site-canche',
      synthesis:
        'Configuration resserrée : les deux zones partagent un noyau commun (hareng, merlan, lieu noir, gobie tacheté, bar) et restent dominées par les espèces marines juvéniles. La brème, peu attendue en aval, pourrait traduire un transport d’ADN depuis l’amont.',
      sectors: [
        {
          name: 'Zone bleue (aval)',
          date: '1er décembre 2025',
          mode: 'Navire support',
          salinity: '37',
          turbidity: '38',
          volume: '32',
          richness: 9,
        },
        {
          name: 'Zone jaune (amont)',
          date: '1er décembre 2025',
          mode: 'Navire support',
          salinity: '37',
          turbidity: '25',
          volume: '35,3',
          richness: 7,
        },
      ],
    },
    {
      id: 'authie',
      name: 'Baie de l’Authie',
      setting: 'baie',
      area: 'Pas-de-Calais et Somme',
      figure: 'ap-site-authie',
      synthesis:
        'Zone externe dominée par les espèces marines juvéniles ; zone amont plus diversifiée, avec des espèces d’eau douce, estuariennes résidentes et migratrices. La richesse observée par ADNe en 2025 dépasse les valeurs historiques du chalut à perche dans cet estuaire.',
      sectors: [
        {
          name: 'Zone verte (aval)',
          date: '2 décembre 2025',
          mode: 'Navire support',
          salinity: '37',
          turbidity: '96',
          volume: '9',
          richness: 6,
        },
        {
          name: 'Zone jaune (amont)',
          date: '2 décembre 2025',
          mode: 'Navire support',
          salinity: '24',
          turbidity: '36',
          volume: '22,7',
          richness: 13,
          richnessNote: 'après exclusion des taxons douteux',
        },
      ],
    },
    {
      id: 'somme',
      name: 'Estuaire de la Somme',
      setting: 'estuaire',
      area: 'Somme',
      figure: 'ap-site-somme',
      synthesis:
        'Gradient net entre une zone aval dominée par les espèces marines juvéniles et estuariennes résidentes (hareng, sardine, merlan, bar, gobie tacheté) et une zone amont enrichie en espèces d’eau douce (brème, gardon, perche, sandre) ; la détection du saumon atlantique reste à confirmer. Site de référence pour la comparaison avec le chalut.',
      sectors: [
        {
          name: 'Zone verte (aval)',
          date: '3 décembre 2025',
          mode: 'Navire support',
          salinity: '35',
          turbidity: '69',
          volume: '9,4',
          richness: 7,
        },
        {
          name: 'Zone rouge (amont)',
          date: '3 décembre 2025',
          mode: 'Navire support',
          salinity: '2',
          turbidity: '4,1',
          volume: '6,4',
          richness: 11,
        },
      ],
    },
  ] as StudySiteRecord[],
  figures: {
    stations: {
      image: 'ap-carte-stations',
      caption: 'Les 15 stations échantillonnées (présentation de restitution, diapositive 5).',
    },
    speciesTeleo: {
      image: 'ap-especes-teleo',
      caption: 'Espèces détectées avec le marqueur Teleo, par site (présentation, diapositive 9).',
    },
    speciesElas: {
      image: 'ap-especes-elas',
      caption:
        'Espèces détectées avec le marqueur Elas02, par site (présentation, diapositive 10).',
    },
    richness: {
      image: 'ap-rapport-richesse',
      caption:
        'Figure 12 du rapport final : richesses spécifiques observées par ADNe à l’automne 2025, par site échantillonné.',
    },
    guilds: {
      image: 'ap-rapport-guildes',
      caption:
        'Répartition des guildes écologiques des espèces détectées par ADNe dans les différents sites (rapport final).',
    },
    localDiversity: {
      image: 'ap-diversite-locale',
      caption:
        'Diversité locale et matrice de distance de Jaccard entre sites (présentation, diapositive 14).',
    },
    venn: {
      image: 'ap-adne-chalut',
      caption:
        'Comparaison ADNe et chalut à perche, estuaire de la Somme 2025 (présentation, diapositive 26).',
    },
    guildsTrawl: {
      image: 'ap-guildes-chalut',
      caption:
        'Guildes écologiques, ADNe 2025 et chalut à perche 2019-2025, estuaire de la Somme (présentation, diapositive 27).',
    },
    turbidity: {
      image: 'ap-rapport-turbidite',
      caption:
        'Figure 17 du rapport final : régression entre la turbidité (NTU) et la richesse spécifique observée (R² = 0,32 ; p = 0,026).',
    },
  },
};

// ---------------------------------------------------------------------------------------------
// Targeted DNA assays (Séquençage & dPCR). Steps describe the service; the organisms are those
// LDgenX presents on ldgenx.fr/services/sequencage-dpcr. Add verified entries to `targets` only.
// ---------------------------------------------------------------------------------------------
export const customAssay: CustomAssay = {
  anchor: 'test-sur-mesure',
  eyebrow: 'Amorces et sondes spécifiques',
  title: 'Votre espèce cible,\nun test ADN sur mesure',
  intro:
    'LDgenX dispose d’amorces et de sondes pour plusieurs espèces et peut concevoir des outils spécifiques pour de nouvelles cibles, selon les besoins de votre projet.',
  steps: [
    {
      title: 'Définir la cible',
      text: 'Préciser l’espèce, la question posée et les espèces proches à ne pas confondre, à partir des séquences de référence disponibles.',
    },
    {
      title: 'Concevoir les amorces et la sonde',
      text: 'Choisir une courte région de l’ADN propre à l’espèce : deux amorces l’encadrent, une sonde fluorescente la reconnaît.',
    },
    {
      title: 'Évaluer les performances du test',
      text: 'Vérifier que le test reconnaît l’ADN de la cible et non celui des espèces proches, puis évaluer son comportement sur des échantillons de référence.',
    },
    {
      title: 'Détecter et quantifier l’ADN cible',
      text: 'En PCR digitale, l’échantillon est réparti en milliers de partitions : celles qui contiennent l’ADN cible s’allument, ce qui permet d’estimer sa quantité.',
    },
  ],
  stepsLabel: 'Les étapes du développement d’un test',
  stage: {
    target: 'Région propre à l’espèce',
    related: 'Espèce proche',
    primers: 'Amorces',
    probe: 'Sonde',
    partitions: 'Partitions de la dPCR',
    yourSpecies: 'Votre espèce cible',
  },
  quantNote:
    'La dPCR estime une quantité d’ADN cible, en nombre de copies ; elle ne compte pas directement les individus présents.',
  contextImage: {
    name: 'vison-europe',
    alt: 'Vison d’Europe au pelage mouillé, au sol',
    caption: 'La biodiversité, au cœur des analyses ADN ciblées.',
  },
  targetsLabel: 'Nos espèces cibles',
  targets: assayTargetsFr,
  catalog: {
    search: 'Rechercher une espèce',
    searchPlaceholder: 'Nom français ou scientifique',
    filterLabel: 'Filtrer les espèces',
    all: 'Toutes',
    groups: {
      mammals: 'Mammifères',
      fish: 'Poissons',
      reptiles: 'Reptiles',
      invertebrates: 'Invertébrés',
    },
    reset: 'Réinitialiser',
    resultLabel: 'espèces affichées',
    empty:
      'Aucune espèce ne correspond à votre recherche. Essayez un autre nom ou réinitialisez les filtres.',
    select: 'Choisir une espèce',
    inventory: 'Amorces et sondes en interne',
    detail:
      'LDgenX dispose d’amorces et de sondes pour cette espèce. Décrivez-nous votre projet pour définir ensemble l’approche adaptée.',
    scope:
      'Les matrices, les conditions d’utilisation et les performances du test sont évaluées selon le projet.',
    contact: 'Parler de cette cible',
  },
  otherTitle: 'Votre espèce n’est pas dans la liste ?',
  otherText:
    'Présentez-nous l’espèce, votre question et vos échantillons : nous étudions avec vous le développement d’un test adapté.',
  otherAction: 'Discuter de votre test',
  play: 'Lire l’animation',
  pause: 'Mettre l’animation en pause',
  home: {
    eyebrow: 'Tests ADN ciblés',
    title: 'Votre espèce cible, un test ADN sur mesure',
    text: 'Des amorces et sondes déjà en interne, et des outils à façon pour de nouvelles cibles.',
    link: 'Explorer les espèces cibles',
    count: 'espèces pour lesquelles nous disposons d’amorces et de sondes',
  },
  wall: {
    eyebrow: 'Amorces et sondes en interne',
    title: '22 espèces,\nprêtes à être recherchées.',
    intro:
      'Mammifères, poissons, reptile et invertébrés : LDgenX dispose d’amorces et de sondes pour chacune de ces espèces. Choisissez-en une pour voir le détail.',
    otherTitle: 'Votre espèce n’y figure pas ?',
    otherText: 'Nous concevons des tests pour de nouvelles cibles.',
  },
};

// ---------------------------------------------------------------------------------------------
// The "Éviter, Réduire, Compenser" sequence on Études environnementales. Official reference:
// ecologie.gouv.fr. LDgenX is presented as a scientific contributor, not as the author of the
// regulatory file or of the measures.
// ---------------------------------------------------------------------------------------------
export const erc = {
  eyebrow: 'Séquence ERC',
  title: 'Des données pour éclairer\nla séquence ERC',
  intro:
    'La séquence « Éviter, Réduire, Compenser » organise la prise en compte de l’environnement dans les projets d’aménagement. Les analyses ADN y apportent des données sur la biodiversité, en complément des inventaires naturalistes et de l’expertise écologique.',
  letters: ['Éviter', 'Réduire', 'Compenser'],
  statesLabel: 'Où les analyses interviennent',
  states: [
    {
      label: 'Connaître l’état initial',
      moment: 'Avant le projet',
      text: 'Inventaire de biodiversité par ADNe et recherche d’espèces protégées ou invasives : repérer les enjeux tôt aide à éviter, puis à réduire les impacts.',
      deliverable:
        'Liste des espèces détectées par site, avec leur interprétation et leurs limites.',
    },
    {
      label: 'Suivre les évolutions',
      moment: 'Pendant et après les travaux',
      text: 'Les mêmes protocoles, aux mêmes sites, à des périodes comparables : les campagnes successives montrent comment la biodiversité évolue.',
      deliverable: 'Comparaison entre campagnes, cartes et analyses statistiques.',
    },
    {
      label: 'Documenter les mesures',
      moment: 'Pendant l’exploitation',
      text: 'Sur les sites concernés par des mesures de réduction ou de compensation, l’ADNe renseigne la présence des espèces visées et l’évolution des communautés.',
      deliverable: 'Rapport d’aide à la décision, à verser au suivi des mesures.',
    },
  ],
  deliverableLabel: 'Ce que vous recevez',
  caution:
    'L’ADNe révèle la présence d’ADN d’une espèce dans un échantillon ; il ne remplace pas à lui seul les inventaires naturalistes et n’indique pas directement l’effectif d’une population.',
  role: 'LDgenX intervient comme contributeur scientifique : stratégie d’échantillonnage, analyses et interprétation. Le dossier réglementaire, la définition des mesures et l’appréciation de leur conformité relèvent du maître d’ouvrage et de ses partenaires.',
  source: {
    label: 'La séquence ERC, ministère de la Transition écologique',
    url: 'https://www.ecologie.gouv.fr/politiques-publiques/eviter-reduire-compenser-impacts-lenvironnement',
  },
};

export type { Work, Person, EquipmentItem };
