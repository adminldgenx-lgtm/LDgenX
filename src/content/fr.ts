import type { CaseRef } from './types';
import { people } from './extra.fr';

export { company } from './site';

export const copy = {
  navigation: {
    services: 'Expertises',
    applications: 'Applications',
    studies: 'Études de cas',
    innovation: 'Innovation',
    research: 'Recherche',
    about: 'À propos',
    resources: 'Ressources',
    contact: 'Demander un devis',
  },
  home: {
    eyebrow: 'ADN environnemental · Génomique · Bioinformatique',
    intro:
      'Des analyses ADN à l’interprétation des résultats, nous accompagnons vos projets environnementaux.',
    primary: 'Demander un devis',
    secondary: 'Découvrir nos expertises',
    // Each fact is published by LDgenX: ldgenx.fr (accueil, partenaires, contact).
    facts: [
      { value: '+10 ans', label: 'd’expérience pour notre équipe scientifique' },
      { value: 'Deep Tech', label: 'entreprise labellisée par Bpifrance' },
      { value: 'De A à Z', label: 'du prélèvement à l’aide à la décision' },
      { value: 'Station Ifremer', label: 'une équipe implantée à Palavas-les-Flots' },
    ],
    introductionTitle: 'De l’échantillon\nà la décision.',
    introduction:
      'Un échantillon contient bien plus que de l’ADN. Il porte une information sur les espèces, les populations et les écosystèmes. Notre rôle : vous aider à la comprendre et à l’utiliser.',
    introductionBody:
      'LDgenX accompagne les acteurs publics et privés sur toute la chaîne scientifique. Nous associons biologie moléculaire, séquençage et bioinformatique autour d’une même question : la vôtre.',
    workflowTitle: 'Une chaîne scientifique.\nUne vision d’ensemble.',
    workflowIntro:
      'Chaque étape compte. Nous construisons avec vous une approche cohérente, de la première question à l’interprétation des données.',
    servicesTitle: 'Comprendre le vivant,\nà toutes ses échelles.',
    servicesIntro:
      'Des expertises complémentaires, mobilisées selon votre question scientifique et les spécificités de votre projet.',
    applicationsTitle: 'La science prend tout son sens\nsur le terrain.',
    applicationsIntro:
      'Des écosystèmes naturels aux filières de production, la génomique apporte un nouvel éclairage à vos enjeux.',
    studiesTitle: 'Des questions concrètes.\nDes approches scientifiques.',
    innovationTitle: 'Explorer aujourd’hui.\nÉclairer demain.',
    innovationIntro:
      'À la croisée de l’ADN environnemental, du séquençage et de la bioinformatique, nous développons les outils de connaissance de la biodiversité de demain.',
    teamTitle: 'La science est aussi\nune histoire humaine.',
    teamIntro:
      'Des parcours en recherche, des expertises complémentaires et une même envie : mettre la génomique au service du vivant.',
    trustTitle: 'Ils travaillent\navec nous.',
    trustIntro:
      'Agences publiques, bureaux d’études, entreprises, universités et instituts de recherche : les organisations présentées par LDgenX.',
  },
  cta: {
    eyebrow: 'Parlons de votre projet',
    title: 'Votre question.\nNotre prochain point de départ.',
    body: 'Un projet en biodiversité, génomique ou bioinformatique ? Décrivez votre besoin pour recevoir une proposition, ou réservez un premier échange avec notre équipe scientifique.',
    button: 'Demander un devis',
    appointment: 'Prendre rendez-vous',
  },
  labels: {
    allServices: 'Toutes nos expertises',
    allApplications: 'Tous les secteurs',
    allStudies: 'Explorer les études',
    team: 'Rencontrer l’équipe',
    innovation: 'Découvrir notre R&D',
    source: 'Consulter la source',
    learn: 'Découvrir cette expertise',
    related: 'Les expertises à mobiliser',
    back: 'Retour',
    approach: 'Notre approche',
    applications: 'Champs d’application',
    deliverables: 'De l’analyse à l’interprétation',
    contact: 'Échanger avec un scientifique',
    quote: 'Demander un devis',
    appointment: 'Prendre rendez-vous',
    faq: 'Questions fréquentes',
  },
};

// Steps follow https://www.ldgenx.fr/a-propos and the value-chain graphic on /services.
// Details quote the official pages (services, ADNe, matériel, équipe).
export const workflow = [
  {
    title: 'Conception scientifique',
    text: 'Votre question définit le point de départ. Ensemble, nous précisons les objectifs et les approches à mobiliser.',
    detail: 'Appui bibliographique, définition des objectifs et des indicateurs.',
    image: 'conception',
  },
  {
    title: 'Stratégie d’échantillonnage',
    text: 'L’information commence sur le terrain. Le choix des matrices et la stratégie de prélèvement sont pensés pour votre problématique.',
    detail:
      'Eau, sol, sédiments ou biofilms. Pompe triple, stick pump et torpille tractée pour la filtration sur le terrain.',
    image: 'terrain-prelevement',
  },
  {
    title: 'Analyses moléculaires',
    text: 'La biologie moléculaire fait le lien entre vos échantillons et les données.',
    detail:
      'De l’extraction d’acides nucléiques sur matrices complexes à la préparation de banques de séquençage.',
    image: 'equipe-maxime',
  },
  {
    title: 'Séquençage & dPCR',
    text: 'Amplicons, génomes ou détection ciblée : les technologies sont choisies en fonction des objectifs scientifiques.',
    detail:
      'Longs fragments (Nanopore, PacBio) et courts fragments (Illumina, AVITI), séquençage ciblé et microsatellites (qPCR, Sanger, KASP), PCR digitale.',
    image: 'sequencage',
  },
  {
    title: 'Bioinformatique',
    text: 'Les données sont traitées et analysées au moyen d’approches bioinformatiques adaptées à votre question biologique.',
    detail:
      'Bioinformatique et biostatistique : métabarcoding, métagénomique, RADseq, RNAseq, WGS, épigénétique, GWAS.',
    image: 'bioinformatique',
  },
  {
    title: 'Interprétation',
    text: 'Nous replaçons les analyses dans leur contexte biologique pour vous accompagner dans la compréhension des résultats.',
    detail: 'Interprétation et valorisation des résultats dans un rapport expert.',
    image: 'interpretation',
  },
  {
    title: 'Aide à la décision',
    text: 'La connaissance scientifique devient une information exploitable pour vos projets de gestion, de conservation ou d’innovation.',
    detail: 'Des résultats actionnables pour la prise de décision.',
    image: 'decision',
  },
];

export interface Expertise {
  /** Same in every language: the French slug. */
  id: string;
  slug: string;
  title: string;
  short: string;
  /** One line from https://www.ldgenx.fr/services. */
  scope: string;
  image: string;
  headline: string;
  intro: string;
  need: string;
  approaches: { title: string; text: string }[];
  uses: string[];
  sectors: string[];
  delivery: string;
  /** What the service covers, as listed in the published service tiles (ldgenx.fr). */
  prestations: string[];
  /** Case studies and subjects shown on the published expertise page. */
  cases: CaseRef[];
  source: string;
  /** Title and description for search engines, when the page has its own. */
  seo?: { title: string; description: string };
}

export const services: Expertise[] = [
  {
    id: 'adn-environnemental-adne',
    slug: 'adn-environnemental-adne',
    title: 'ADN environnemental',
    short: 'Les traces du vivant deviennent une source de connaissance.',
    scope:
      'Détecter et suivre les espèces d’un milieu à partir des traces d’ADN présentes dans l’environnement.',
    image: 'terrain-prelevement',
    headline: 'Révéler la biodiversité, à partir de ses traces.',
    intro:
      'L’ADN environnemental (ADNe) permet d’étudier les espèces à partir des traces d’ADN présentes dans l’eau, les sols, les sédiments ou les biofilms. LDgenX accompagne vos projets de surveillance, de conservation et d’étude d’impact.',
    need: 'Vous cherchez à inventorier un milieu, suivre une espèce ou éclairer une décision de gestion ? L’approche se construit à partir de votre question, du milieu étudié et des groupes biologiques qui vous intéressent.',
    approaches: [
      {
        title: 'Métabarcoding',
        text: 'Inventaire de la biodiversité à partir de marqueurs génétiques ciblés (12S, COI, 18S, ITS…).',
      },
      {
        title: 'Métagénomique',
        text: 'Analyse globale des communautés biologiques.',
      },
      {
        title: 'dPCR ciblée',
        text: 'Détection et quantification ultra-sensibles d’espèces ou de pathogènes ciblés grâce à la PCR digitale.',
      },
      {
        title: 'Séquençage longue lecture',
        text: 'Résolution taxonomique améliorée et nouvelles perspectives d’analyse.',
      },
    ],

    uses: [
      'Inventaires de biodiversité',
      'Études d’impact',
      'Espèces invasives',
      'Espèces protégées',
    ],
    sectors: [
      'biodiversite-conservation',
      'environnement-bureaux-d-etudes',
      'energies-marines-renouvelables',
    ],
    delivery:
      'De l’échantillonnage à la bioinformatique, les analyses sont reliées à votre objectif. La restitution et le niveau d’accompagnement sont définis avec l’équipe scientifique au cadrage du projet.',
    prestations: [
      'Conception du projet',
      'Design d’amorces (si non disponibles)',
      'Extraction d’ADN',
      'Séquençage',
      'Analyses bioinformatiques',
      'Analyses statistiques',
      'Analyses de diversités',
      'Rapport d’aide à la décision',
      'Digital PCR',
      'Cartographie et visualisation',
    ],
    cases: [
      {
        title: 'Analyse ichtyologique pour l’Agence de l’eau Artois-Picardie',
        image: 'carte-artois-picardie',
        link: { kind: 'study', id: 'ichtyofaune-artois-picardie' },
      },
      { title: 'Recherche de l’ichtyofaune en milieu turbide', image: 'terrain-prelevement' },
      {
        title: 'État des lieux de la biodiversité marine sur le site pilote',
        image: 'terrain-palavas',
      },
      {
        title: 'Biodiversité des parcs éoliens offshore',
        image: 'cas-eolien-offshore',
        link: { kind: 'study', id: 'biodiversite-eolien-offshore' },
      },
    ],
    source: 'https://www.ldgenx.fr/services/adn-environnemental-adne',
  },
  {
    id: 'genomique-des-populations',
    slug: 'genomique-des-populations',
    title: 'Génomique des populations',
    short: 'Comprendre la diversité, la connectivité et l’adaptation.',
    scope: 'Caractériser la diversité génétique, la connectivité et l’adaptation des populations.',
    image: 'cas-vanneau',
    headline: 'Comprendre les populations. Éclairer leur avenir.',
    intro:
      'La génomique des populations apporte un éclairage sur la diversité génétique, la structure, la connectivité et l’adaptation. LDgenX développe des approches adaptées aux enjeux de conservation et de gestion des populations.',
    need: 'Comment les populations se différencient-elles ? Quels échanges les relient ? Comment étudier leur diversité ? Votre question de gestion ou de recherche détermine le choix des outils génomiques.',
    approaches: [
      {
        title: 'Génome partiel · 3D-GBS',
        text: 'Génotypage de milliers de marqueurs répartis sur l’ensemble du génome pour étudier la diversité génétique, la structure des populations et la connectivité.',
      },
      {
        title: 'Génome entier · WGS',
        text: 'Analyse exhaustive du génome pour la découverte de variants, les études d’adaptation et les analyses évolutives.',
      },
      {
        title: 'Panels SNP',
        text: 'Développement de panels SNP sur mesure pour le suivi génétique, l’assignation d’individus, les tests de parenté et les programmes de conservation.',
      },
      {
        title: 'Marqueurs génétiques',
        text: 'Identification de SNP, d’indels et d’autres variants génétiques adaptés aux objectifs de votre projet.',
      },
    ],

    uses: [
      'Conservation',
      'Gestion des populations',
      'Plans nationaux d’action',
      'Consanguinité, hybridation, origine des individus',
    ],
    sectors: ['biodiversite-conservation', 'aquaculture-peche', 'recherche-publique-privee'],
    delivery:
      'L’interprétation associe les données génétiques au contexte des populations étudiées. Les questions biologiques, les échantillons disponibles et les informations de terrain servent de fil conducteur.',
    prestations: [
      'Extraction d’ADN',
      'Préparation des librairies',
      'Séquençage',
      'Analyses bioinformatiques',
      'Découverte de marqueurs génétiques (SNP, indel)',
      'Rapport d’aide à la décision',
      'Analyses génétiques (GWAS)',
      'Accompagnement scientifique',
      'Conception du projet',
    ],
    cases: [
      {
        title: 'Diversité génétique',
        image: 'cas-truites',
        link: { kind: 'work', id: 'conservation' },
      },
      {
        title: 'Carte génétique',
        image: 'fig-puce-truite',
        link: { kind: 'work', id: 'tracabilite' },
      },
      {
        title: 'Le vanneau huppé',
        image: 'cas-vanneau',
        link: { kind: 'external', href: 'https://hal.science/hal-05490664' },
      },
    ],
    source: 'https://www.ldgenx.fr/services/genomique-des-populations',
  },
  {
    id: 'analyse-des-communautes-microbiennes',
    slug: 'analyse-des-communautes-microbiennes',
    title: 'Communautés microbiennes',
    short: 'Explorer la diversité que l’on ne voit pas.',
    scope:
      'Étudier les communautés bactériennes, fongiques et microbiennes grâce au séquençage haut débit.',
    image: 'microbiologie',
    headline: 'Un monde invisible. Une diversité à comprendre.',
    intro:
      'LDgenX accompagne l’étude des communautés bactériennes, fongiques et microbiennes. Le séquençage et la bioinformatique permettent de caractériser ces communautés dans vos échantillons.',
    need: 'La composition d’un microbiome constitue une question scientifique à part entière. Le choix de l’approche dépend des organismes étudiés, de la matrice et du niveau de caractérisation recherché.',
    approaches: [
      { title: 'Séquençage 16S', text: 'Caractériser les communautés bactériennes.' },
      { title: 'Séquençage ITS', text: 'Étudier les communautés fongiques.' },
      {
        title: 'Métabarcoding microbien',
        text: 'Explorer la diversité microbienne au moyen de marqueurs ciblés.',
      },
      {
        title: 'Métagénomique',
        text: 'Approfondir la caractérisation taxonomique et fonctionnelle des communautés.',
      },
    ],
    uses: ['Qualité des eaux', 'Sols agricoles', 'Aquaculture', 'Recherche'],
    sectors: ['agriculture-agroecologie', 'aquaculture-peche', 'environnement-bureaux-d-etudes'],
    delivery:
      'L’équipe accompagne la préparation du projet, les analyses moléculaires et l’interprétation bioinformatique. La question biologique reste au centre de la lecture des données.',
    prestations: [
      'Extraction d’ADN',
      'Préparation des librairies',
      'Séquençage',
      'Analyses bioinformatiques',
      'Analyses statistiques',
      'Rapport d’aide à la décision',
    ],
    cases: [
      {
        title: 'Inventaire des communautés microbiennes sur les microplastiques',
        image: 'cas-microplastiques',
        link: { kind: 'study', id: 'communautes-microplastiques' },
      },
    ],
    source: 'https://www.ldgenx.fr/services/analyse-des-communautes-microbiennes',
  },
  {
    id: 'selection',
    slug: 'selection',
    title: 'Sélection génomique',
    short: 'Intégrer l’information génétique dans vos programmes.',
    scope: 'Développer des outils d’aide à la sélection pour les filières agricoles et aquacoles.',
    image: 'cas-crevettes',
    headline: 'L’information génétique au service de la sélection.',
    intro:
      'LDgenX développe des outils pour intégrer les données génétiques dans les programmes de sélection. L’accompagnement concerne notamment les filières aquacoles et agricoles.',
    need: 'Vous souhaitez étudier un caractère d’intérêt, concevoir un panel de marqueurs ou structurer un programme de sélection ? La démarche doit articuler la question biologique, les données génétiques et les données phénotypiques disponibles.',
    approaches: [
      {
        title: 'Panels SNP',
        text: 'Développer des outils de génotypage en lien avec les objectifs de sélection.',
      },
      { title: 'WGS', text: 'Mobiliser le séquençage de génome entier pour l’étude des variants.' },
      {
        title: 'GWAS',
        text: 'Étudier les associations entre marqueurs génétiques et caractères d’intérêt.',
      },
      {
        title: 'Modèles de sélection',
        text: 'Analyser les données génétiques et phénotypiques dans le cadre de programmes de sélection.',
      },
    ],
    uses: [
      'Croissance',
      'Résistance aux maladies',
      'Robustesse',
      'Sélection assistée par marqueurs',
      'Développement variétal',
    ],
    sectors: ['aquaculture-peche', 'agriculture-agroecologie', 'recherche-publique-privee'],
    delivery:
      'La construction du projet tient compte des données disponibles et des objectifs de la filière. Les outils et les analyses sont discutés avec votre équipe avant leur mise en œuvre.',
    prestations: [
      'Découverte de marqueurs génétiques (SNP, indel)',
      'Développement de panels SNP',
      'Analyses génétiques (GWAS)',
      'Modèles de prédiction génomique (BLUP)',
    ],
    cases: [
      {
        title: 'Le bar européen',
        image: 'cas-bar',
        link: { kind: 'work', id: 'selection-genomique' },
      },
      { title: 'Développement d’un panel de SNP', image: 'cas-crevettes' },
    ],
    source: 'https://www.ldgenx.fr/services/selection',
  },
  {
    id: 'bioinformatique',
    slug: 'bioinformatique',
    title: 'Bioinformatique',
    short: 'Faire émerger le sens de vos données génomiques.',
    scope: 'Transformer vos données de séquençage en résultats exploitables.',
    image: 'bioinformatique',
    headline: 'Des données complexes. Une question qui guide l’analyse.',
    intro:
      'LDgenX propose un accompagnement bioinformatique pour les projets de recherche, de biodiversité et d’innovation. Le traitement, l’analyse et l’interprétation sont construits autour de votre problématique biologique.',
    need: 'Des données de séquençage ne répondent pas seules à une question scientifique. Le choix des analyses et la compréhension du contexte sont essentiels pour en tirer une information exploitable.',
    approaches: [
      {
        title: 'Diversité et communautés',
        text: 'Analyse de données de métabarcoding et de métagénomique.',
      },
      { title: 'Génomique', text: 'Analyse de données WGS, RADseq et séquençage longue lecture.' },
      {
        title: 'Expression et épigénétique',
        text: 'Accompagnement des analyses RNAseq et épigénétiques.',
      },
      {
        title: 'Pipelines et GWAS',
        text: 'Développement de pipelines spécifiques et analyses d’associations génétiques.',
      },
    ],
    uses: ['Métabarcoding et métagénomique', 'RADseq, RNAseq', 'WGS', 'Épigénétique', 'GWAS'],
    sectors: ['recherche-publique-privee', 'biodiversite-conservation', 'agriculture-agroecologie'],
    delivery:
      'Notre équipe met en relation les analyses informatiques et les questions du vivant. Le périmètre, les données d’entrée et les modalités de restitution sont précisés ensemble.',
    prestations: [
      'Contrôle qualité',
      'Développement de pipelines',
      'Analyses statistiques',
      'Analyses de diversités',
      'Cartographie et visualisation',
      'Reproductibilité des analyses',
      'Bancarisation des données',
      'Accompagnement scientifique',
    ],
    cases: [],
    source: 'https://www.ldgenx.fr/services/bioinformatique',
  },
  {
    id: 'sequencage-dpcr',
    slug: 'sequencage-dpcr',
    title: 'Séquençage & dPCR',
    short: 'Lire l’ADN. Détecter les cibles qui vous intéressent.',
    scope:
      'Amplicons, courts et longs fragments, génomes entiers ou partiels, détection d’espèces cibles ou de variants.',
    image: 'equipe-maxime',
    headline: 'La technologie adaptée à votre question scientifique.',
    intro:
      'Séquençage d’amplicons, longues lectures, génomes entiers ou détection d’espèces par dPCR : LDgenX accompagne vos projets, de la conception d’amorces et de sondes spécifiques à l’interprétation des résultats, y compris la quantification d’ADN environnemental d’une espèce cible.',
    need: 'Séquençage d’amplicons, longues lectures ou détection ciblée : le choix de la technologie doit être relié aux échantillons et à l’information que vous cherchez à obtenir.',
    approaches: [
      {
        title: 'Séquençage d’amplicons',
        text: '16S, ITS, COI, 12S, 18S et marqueurs personnalisés.',
      },
      {
        title: 'Métagénomique',
        text: 'Analyse taxonomique et fonctionnelle des communautés biologiques.',
      },
      {
        title: 'Génome complet · WGS',
        text: 'Étude exhaustive du génome.',
      },
      {
        title: 'RADseq et panels SNP',
        text: 'Analyses de génomique des populations.',
      },
      {
        title: 'Séquençage longue lecture',
        text: 'Oxford Nanopore.',
      },
      {
        title: 'dPCR',
        text: 'Détection et quantification de l’ADN d’une espèce cible, avec des amorces et une sonde spécifiques.',
      },
    ],

    uses: [
      'Séquençage d’amplicons',
      'Séquençage courts et longs fragments',
      'Génomes entiers et partiels',
      'Détection d’espèces cibles ou de variants',
    ],
    sectors: ['recherche-publique-privee', 'environnement-bureaux-d-etudes', 'aquaculture-peche'],
    delivery:
      'L’accompagnement peut relier la biologie moléculaire, le séquençage et la bioinformatique. L’approche et la restitution sont définies à partir de vos objectifs.',
    prestations: [
      'Extraction d’ADN',
      'Préparation des librairies',
      'Séquençage',
      'Design d’amorces (si non disponibles)',
      'Digital PCR',
      'Accompagnement scientifique',
    ],
    cases: [
      { title: 'Épigénétique du sar', image: 'cas-sar' },
      { title: 'Détection d’espèces méditerranéennes emblématiques par dPCR', image: 'cas-requin' },
      { title: 'Détection des oursins *Paracentrotus lividus*', image: 'cas-oursin' },
    ],
    source: 'https://www.ldgenx.fr/services/sequencage-dpcr',
    seo: {
      title: 'Séquençage et détection d’espèces par dPCR | LDgenX',
      description:
        'Séquençage d’amplicons et longues lectures, détection d’espèces par dPCR, quantification d’ADN environnemental, amorces et sondes spécifiques : des tests ADN ciblés sur mesure.',
    },
  },
  {
    id: 'recherche-developpement',
    slug: 'recherche-developpement',
    title: 'Recherche & Développement',
    short: 'Construire les approches scientifiques de demain.',
    scope:
      'Réponses aux appels à projets, accompagnement et conseil pour vos projets de recherche.',
    image: 'dna-ecotrace',
    headline: 'Votre problématique peut ouvrir une nouvelle voie.',
    intro:
      'LDgenX est ouverte aux collaborations scientifiques, techniques et industrielles. L’équipe développe de nouvelles approches qui associent ADN environnemental, séquençage et bioinformatique.',
    need: 'Un besoin de développement moléculaire, une question encore ouverte ou un projet collaboratif ? Le premier échange permet de préciser la problématique et les expertises à réunir.',
    approaches: [
      {
        title: 'Conception scientifique',
        text: 'Définir les objectifs et explorer les approches pertinentes.',
      },
      {
        title: 'Développement moléculaire',
        text: 'Concevoir des outils adaptés à une question biologique.',
      },
      {
        title: 'Bioinformatique',
        text: 'Développer les approches d’analyse spécifiques au projet.',
      },
      {
        title: 'Collaboration',
        text: 'Mobiliser des expertises scientifiques et techniques complémentaires.',
      },
    ],
    uses: [
      'Projets collaboratifs',
      'Développement d’outils',
      'ADN environnemental',
      'Innovation génomique',
    ],
    sectors: [
      'recherche-publique-privee',
      'biodiversite-conservation',
      'energies-marines-renouvelables',
    ],
    delivery:
      'Chaque projet de R&D commence par un cadrage commun. Les objectifs de développement, les étapes et les modalités de collaboration se définissent avec les partenaires du projet.',
    prestations: ['Réponses aux appels à projets', 'Accompagnement', 'Conseils'],
    cases: [
      {
        title: 'DNA EcoTrace',
        image: 'dna-ecotrace',
        link: { kind: 'innovation', id: 'dna-ecotrace' },
      },
      { title: 'eDNAClock', image: 'ednaclock', link: { kind: 'innovation', id: 'edna-clock' } },
    ],
    source: 'https://www.ldgenx.fr/a-propos/innovation',
  },
  {
    id: 'materiel',
    slug: 'materiel',
    title: 'Matériel d’échantillonnage',
    short: 'Préparer le terrain pour vos analyses.',
    scope: 'Pompe triple, stick pump et torpille tractée pour filtrer l’eau sur le terrain.',
    image: 'materiel-pompe',
    headline: 'Une analyse commence par un échantillon.',
    intro:
      'Pompe triple, stick pump et torpille : LDgenX propose le matériel de filtration de l’eau utilisé pour l’ADN environnemental, avec ses capsules et ses filtres.',
    need: 'Avant une campagne, partagez le milieu étudié, les objectifs et les contraintes du terrain. Ces informations permettent de discuter du matériel et de la stratégie d’échantillonnage.',
    approaches: [
      { title: 'Votre milieu', text: 'Préciser les matrices et les conditions de prélèvement.' },
      { title: 'Votre question', text: 'Relier la campagne de terrain aux analyses envisagées.' },
      {
        title: 'Votre campagne',
        text: 'Discuter de l’organisation des prélèvements avec l’équipe scientifique.',
      },
    ],
    uses: ['Projets d’ADN environnemental', 'Prélèvements de terrain', 'Suivi environnemental'],
    sectors: ['environnement-bureaux-d-etudes', 'biodiversite-conservation'],
    delivery:
      'Les prix publiés sont indiqués hors taxes. Un devis précise le matériel adapté à votre milieu, sa disponibilité et les conditions de vente.',
    prestations: ['Pompe triple', 'Stick pump', 'Torpille', 'Capsules et filtres'],
    cases: [],
    source: 'https://www.ldgenx.fr/services/materiel',
  },
];

export interface Sector {
  id: string;
  slug: string;
  title: string;
  /** Uses listed on the official application pages. */
  scope: string;
  image: string;
  headline: string;
  intro: string;
  needs: { title: string; text: string }[];
  services: string[];
  /** Uses and example projects listed on the published application page. */
  uses: string[];
  examples: string[];
  source: string;
  /** Title and description for search engines, when the page has its own. */
  seo?: { title: string; description: string };
  /** The approaches offered for this field, as documented in the services. */
  approaches?: { title: string; text: string }[];
  /** What the team delivers and the support it provides. */
  deliverables?: string[];
  /** The module on the "Éviter, Réduire, Compenser" sequence. */
  erc?: boolean;
  /** A contextual link to the neighbouring application. */
  related?: { id: string; text: string };
}
export const applications: Sector[] = [
  {
    id: 'biodiversite-conservation',
    slug: 'biodiversite-conservation',
    title: 'Biodiversité & Conservation',
    scope:
      'Comprendre les populations et éclairer les actions de conservation grâce aux outils génomiques.',
    image: 'riviere',
    headline: 'Mieux connaître le vivant pour mieux le préserver.',
    intro:
      'Génomique de la conservation, diversité génétique, connectivité des populations, suivi d’espèces : LDgenX apporte aux gestionnaires d’espaces naturels, collectivités, associations et équipes de recherche des données génétiques pour comprendre les populations et éclairer leurs actions de conservation.',
    needs: [
      {
        title: 'Suivre les espèces',
        text: 'Détection et suivi d’espèces protégées, menacées ou invasives, en lien avec les objectifs de conservation.',
      },
      {
        title: 'Comprendre les populations',
        text: 'Génétique des populations : diversité génétique, consanguinité, hybridation et connectivité entre populations.',
      },
      {
        title: 'Accompagner la gestion',
        text: 'Informations génomiques pour les projets de réintroduction, de restauration écologique et les plans nationaux d’actions.',
      },
    ],
    services: [
      'adn-environnemental-adne',
      'genomique-des-populations',
      'bioinformatique',
      'sequencage-dpcr',
    ],
    uses: [
      'Suivi d’espèces menacées et protégées',
      'Plans nationaux d’actions (PNA)',
      'Évaluation de la diversité génétique',
      'Détection de phénomènes de consanguinité',
      'Études d’hybridation',
      'Analyse de la connectivité écologique',
      'Identification de l’origine des individus',
      'Détection et suivi d’espèces invasives',
      'Programmes de réintroduction et restauration écologique',
    ],
    examples: [
      'Étude de la diversité génétique et de la structure des populations',
      'Détection d’hybridation entre espèces',
      'Suivi d’espèces menacées',
    ],
    source: 'https://www.ldgenx.fr/applications/biodiversite-conservation',
    seo: {
      title: 'Génomique de la conservation et suivi d’espèces | LDgenX',
      description:
        'Diversité génétique, génétique des populations, connectivité et suivi d’espèces : des outils génomiques pour comprendre les populations et guider la conservation.',
    },
    related: {
      id: 'environnement-bureaux-d-etudes',
      text: 'Votre besoin porte sur l’état initial, l’étude d’impact ou le suivi environnemental d’un projet ?',
    },
  },
  {
    id: 'aquaculture-peche',
    slug: 'aquaculture-peche',
    title: 'Aquaculture & Pêche',
    scope:
      'Sélection génomique, gestion des stocks, traçabilité des produits, surveillance sanitaire.',
    image: 'aquaculture',
    headline: 'Éclairer la gestion des ressources aquatiques.',
    intro:
      'Gestion des géniteurs, sélection, suivi des stocks et surveillance sanitaire : vos enjeux appellent une compréhension des populations et de leur environnement.',
    needs: [
      {
        title: 'Structurer la sélection',
        text: 'Développement de panels SNP et recherche de marqueurs associés aux caractères d’intérêt.',
      },
      {
        title: 'Gérer les populations',
        text: 'Diversité génétique des cheptels, gestion des géniteurs et contrôle de la consanguinité.',
      },
      {
        title: 'Étudier les milieux',
        text: 'Microbiome aquatique, surveillance de pathogènes et gestion des ressources halieutiques.',
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
      'Sélection génomique',
      'Gestion des géniteurs',
      'Contrôle de la consanguinité',
      'Amélioration des performances zootechniques',
      'Résistance aux maladies',
      'Gestion des stocks halieutiques',
      'Traçabilité des produits',
      'Surveillance sanitaire',
      'Étude du microbiome aquatique',
    ],
    examples: [
      'Développement de panels SNP pour la sélection',
      'Étude de la diversité génétique des cheptels',
      'Recherche de marqueurs associés à des caractères d’intérêt',
      'Surveillance de pathogènes par dPCR',
    ],
    source: 'https://www.ldgenx.fr/applications/aquaculture-peche',
  },
  {
    id: 'agriculture-agroecologie',
    slug: 'agriculture-agroecologie',
    title: 'Agriculture & Agroécologie',
    scope: 'Microbiomes des sols, marqueurs moléculaires, sélection assistée par marqueurs.',
    image: 'agriculture',
    headline: 'Comprendre vos sols. Accompagner vos filières.',
    intro:
      'La transition agroécologique pose des questions sur la biodiversité agricole, les microbiomes des sols et les outils de sélection. LDgenX accompagne les acteurs publics et privés dans ces projets.',
    needs: [
      {
        title: 'Explorer les sols',
        text: 'Analyse des microbiomes et métagénomique environnementale pour étudier les écosystèmes agricoles.',
      },
      {
        title: 'Développer la sélection',
        text: 'Marqueurs moléculaires, sélection variétale et programmes de sélection assistée par marqueurs.',
      },
      {
        title: 'Suivre la biodiversité',
        text: 'Approches génomiques pour la connaissance des milieux et le suivi de la biodiversité agricole.',
      },
    ],
    services: [
      'adn-environnemental-adne',
      'sequencage-dpcr',
      'analyse-des-communautes-microbiennes',
      'bioinformatique',
    ],
    uses: [
      'Sélection variétale et amélioration génétique',
      'Développement de marqueurs moléculaires',
      'Étude des microbiomes des sols',
      'Suivi de la biodiversité agricole',
      'Évaluation de la santé des sols',
      'Métagénomique environnementale',
      'Recherche de gènes d’intérêt agronomique',
      'Programmes de sélection assistée par marqueurs',
    ],
    examples: [
      'Analyse de microbiomes de sols agricoles',
      'Développement d’outils de détection ciblée par dPCR',
      'Développement de marqueurs génétiques pour la sélection',
    ],
    source: 'https://www.ldgenx.fr/applications/agriculture-agroecologie',
  },
  {
    id: 'environnement-bureaux-d-etudes',
    slug: 'environnement-bureaux-d-etudes',
    title: 'Études environnementales',
    scope:
      'Documenter la biodiversité et accompagner le suivi environnemental de vos projets grâce aux analyses ADN.',
    image: 'terrain-palavas',
    headline: 'Documenter la biodiversité de vos projets, de l’état initial au suivi.',
    intro:
      'Collectivités, aménageurs, bureaux d’études et porteurs de projets : l’ADN environnemental apporte des données non invasives pour vos inventaires de biodiversité, l’état initial écologique, les études d’impact et le suivi de biodiversité. LDgenX réalise les analyses et vous aide à les interpréter dans votre démarche.',
    needs: [
      {
        title: 'Quelles espèces fréquentent le site ?',
        text: 'Inventaire de biodiversité par ADNe dans l’eau, les sols ou les sédiments, pour compléter les relevés de terrain lors d’un état initial.',
      },
      {
        title: 'Une espèce protégée ou invasive est-elle présente ?',
        text: 'Détection d’espèces d’intérêt, par métabarcoding ou par un test ADN ciblé lorsque la question porte sur une espèce précise.',
      },
      {
        title: 'Comment le milieu évolue-t-il ?',
        text: 'Prélèvements répétés selon un même protocole, pour suivre la biodiversité dans le temps, pendant et après les travaux.',
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
      'Études d’impact environnemental',
      'Évaluation de l’état initial des sites',
      'Suivi de la biodiversité',
      'Surveillance environnementale à long terme',
      'Détection d’espèces protégées',
      'Détection d’espèces invasives',
      'Compensation écologique',
      'Projets d’aménagement du territoire',
      'Énergies renouvelables terrestres et marines',
    ],
    examples: [
      'Inventaires de biodiversité par ADNe',
      'Détection précoce d’espèces invasives',
      'Surveillance environnementale',
      'Développement de tests dPCR ciblés pour le suivi d’espèces d’intérêt',
    ],
    source: 'https://www.ldgenx.fr/applications/environnement-bureaux-d-etudes',
    seo: {
      title: 'ADNe pour l’état initial et les études d’impact | LDgenX',
      description:
        'Inventaire de biodiversité par ADNe, état initial écologique, études d’impact et suivi de biodiversité : des analyses ADN pour documenter la séquence ERC de vos projets.',
    },
    approaches: [
      {
        title: 'ADN environnemental',
        text: 'Des traces d’ADN prélevées dans l’eau, les sols, les sédiments ou les biofilms, sans capturer ni déranger les espèces.',
      },
      {
        title: 'Métabarcoding',
        text: 'Un inventaire de nombreuses espèces à la fois, à partir de marqueurs génétiques ciblés (12S, COI, 18S, ITS…).',
      },
      {
        title: 'Tests ciblés par dPCR',
        text: 'La détection et la quantification de l’ADN d’une espèce précise, avec des amorces et une sonde spécifiques conçues si nécessaire.',
      },
      {
        title: 'Communautés microbiennes',
        text: 'Le séquençage 16S ou ITS pour caractériser les communautés bactériennes et fongiques d’un milieu.',
      },
    ],
    deliverables: [
      'Conception du protocole et de la stratégie d’échantillonnage',
      'Matériel de filtration et appui aux prélèvements',
      'Analyses moléculaires, séquençage ou dPCR',
      'Analyses bioinformatiques et statistiques',
      'Cartographie et visualisation des résultats',
      'Rapport d’aide à la décision, avec l’interprétation des résultats',
    ],
    erc: true,
    related: {
      id: 'biodiversite-conservation',
      text: 'Votre question porte sur la génétique d’une espèce : diversité, connectivité, hybridation ou gestion d’une population ?',
    },
  },
  {
    id: 'recherche-publique-privee',
    slug: 'recherche-publique-privee',
    title: 'Recherche publique & privée',
    scope: 'Conception scientifique, réponses aux appels à projets, accompagnement.',
    image: 'recherche',
    headline: 'Une question scientifique. Des expertises à réunir.',
    intro:
      'Votre projet mobilise la biologie moléculaire, le séquençage ou l’analyse de données génomiques ? LDgenX accompagne la conception et la mise en œuvre d’approches adaptées.',
    needs: [
      {
        title: 'Concevoir une approche',
        text: 'Relier vos objectifs scientifiques aux analyses et aux données disponibles.',
      },
      {
        title: 'Analyser les données',
        text: 'Bioinformatique pour les données WGS, RADseq, RNAseq, de métagénomique et d’épigénétique.',
      },
      {
        title: 'Développer ensemble',
        text: 'Collaborations scientifiques et techniques autour de nouvelles applications de la génomique.',
      },
    ],
    services: ['recherche-developpement', 'bioinformatique', 'sequencage-dpcr'],
    uses: [],
    examples: [],
    source: 'https://www.ldgenx.fr/a-propos/innovation',
  },
  {
    id: 'energies-marines-renouvelables',
    slug: 'energies-renouvelables',
    title: 'Énergies renouvelables',
    scope:
      'Éolien terrestre, éolien en mer et photovoltaïque : documenter la biodiversité autour de vos projets.',
    image: 'energies-renouvelables',
    headline: 'Connaître la biodiversité qui entoure vos projets d’énergie.',
    intro:
      'Éolien terrestre, éolien en mer, photovoltaïque : ces projets s’accompagnent d’un état initial et d’un suivi des milieux. Les analyses ADN de LDgenX contribuent aux inventaires de biodiversité et à leur suivi, sur terre comme en mer, en appui des études environnementales.',
    needs: [
      {
        title: 'Établir la connaissance',
        text: 'Inventorier par ADNe la biodiversité des milieux terrestres, aquatiques ou marins concernés par le projet.',
      },
      {
        title: 'Organiser le suivi',
        text: 'Définir une question de suivi et une stratégie d’échantillonnage reproductible, de la construction à l’exploitation.',
      },
      {
        title: 'Interpréter dans le contexte',
        text: 'Relier les analyses aux enjeux environnementaux du site et à vos études.',
      },
    ],
    services: ['adn-environnemental-adne', 'sequencage-dpcr', 'bioinformatique', 'materiel'],
    uses: ['Éolien terrestre', 'Éolien en mer', 'Photovoltaïque'],
    examples: ['Biodiversité des parcs éoliens offshore'],
    source: 'https://www.ldgenx.fr/applications/environnement-bureaux-d-etudes',
    seo: {
      title: 'ADN environnemental et énergies renouvelables | LDgenX',
      description:
        'Éolien terrestre, éolien en mer, photovoltaïque : des inventaires et un suivi de biodiversité par ADN environnemental, sur terre comme en mer.',
    },
    related: {
      id: 'environnement-bureaux-d-etudes',
      text: 'L’état initial, les études d’impact et la séquence « Éviter, Réduire, Compenser » sont détaillés dans Études environnementales.',
    },
  },
];

export const studies = [
  {
    id: 'ichtyofaune-artois-picardie',
    slug: 'ichtyofaune-artois-picardie',
    title: 'Lire la biodiversité des ports et des estuaires.',
    category: 'ADN environnemental',
    image: 'carte-artois-picardie',
    imageAlt:
      'Carte des sites échantillonnés sur la façade maritime, de Dunkerque à l’estuaire de la Somme',
    subtitle: 'Une étude de l’ichtyofaune pour l’Agence de l’eau Artois-Picardie.',
    facts: [
      { label: 'Commanditaire', value: 'Agence de l’eau Artois-Picardie' },
      { label: 'Réalisation', value: 'Groupement Qualyse, LDgenX et Prelevmar' },
      { label: 'Milieux', value: 'Ports et estuaires de la façade maritime' },
      { label: 'Approche', value: 'ADN environnemental sur prélèvements d’eau' },
    ],
    context:
      'L’Agence de l’eau Artois-Picardie a commandé en 2025 une étude de la biodiversité des poissons dans les ports et les estuaires de sa façade maritime.',
    question:
      'Comment améliorer la connaissance de l’ichtyofaune et comparer l’ADNe aux méthodes classiques d’acquisition de données ?',
    approach:
      'L’étude a été réalisée par le groupement Qualyse, LDgenX et Prelevmar. Des échantillons d’eau prélevés à la fin de l’automne 2025 sur huit sites ont été analysés par ADN environnemental.',
    result:
      'Le nombre médian d’espèces est relativement similaire entre les estuaires et les ports, à part pour l’estuaire de la Slack, mais les espèces ne s’y répartissent pas de la même façon. L’étude nourrit la réflexion sur l’usage de l’ADNe pour la surveillance des milieux aquatiques et identifie les contraintes des milieux marins et estuariens : courants, turbidité et marées.',
    service: 'adn-environnemental-adne',
    source:
      'https://www.eau-artois-picardie.fr/etude-de-la-biodiversite-de-lichtyofaune-dans-les-estuaires-et-les-ports-avec-ladn-environnemental',
  },
  {
    id: 'biodiversite-eolien-offshore',
    slug: 'biodiversite-eolien-offshore',
    title: 'Explorer la biodiversité des parcs éoliens offshore.',
    category: 'Biodiversité marine',
    image: 'cas-eolien-offshore',
    subtitle: 'Un cas d’étude de l’ADN environnemental présenté par LDgenX.',
    facts: [
      { label: 'Contexte', value: 'Parcs éoliens offshore' },
      { label: 'Milieu', value: 'Biodiversité marine' },
      { label: 'Approche', value: 'ADN environnemental' },
    ],
    context:
      'La biodiversité des parcs éoliens offshore est citée parmi les cas d’étude de la page officielle consacrée à l’ADNe.',
    question:
      'Comment documenter la biodiversité marine dans le contexte des projets d’énergies renouvelables ?',
    approach:
      'LDgenX présente l’ADN environnemental comme une approche de connaissance et de suivi des milieux. Le périmètre d’une étude se définit selon la question et le site.',
    result: '',
    service: 'adn-environnemental-adne',
    source: 'https://www.ldgenx.fr/services/adn-environnemental-adne',
  },
  {
    id: 'communautes-microplastiques',
    slug: 'communautes-microplastiques',
    title: 'Les communautés microbiennes des microplastiques.',
    category: 'Microbiologie',
    image: 'cas-microplastiques',
    subtitle: 'Un sujet d’étude à l’interface de la microbiologie et de l’environnement.',
    facts: [
      { label: 'Supports', value: 'Microplastiques' },
      { label: 'Domaine', value: 'Microbiologie environnementale' },
      { label: 'Objet', value: 'Inventaire des communautés microbiennes' },
    ],
    context:
      'LDgenX présente un inventaire des communautés microbiennes sur les microplastiques parmi ses cas d’étude.',
    question: 'Quelles communautés microbiennes caractériser sur ces supports ?',
    approach:
      'Les expertises présentées par LDgenX comprennent le séquençage 16S, ITS, le métabarcoding microbien et la métagénomique. Le choix de l’analyse se rattache à l’objectif du projet.',
    result: '',
    service: 'analyse-des-communautes-microbiennes',
    source: 'https://www.ldgenx.fr/services/analyse-des-communautes-microbiennes',
  },
];

// The homepage tells the Artois-Picardie study in full. Every line restates the Agency's
// publication, the final report or the restitution presentation (see extra.fr.ts).
export const featuredStudy = {
  slug: 'ichtyofaune-artois-picardie',
  client: 'Agence de l’eau Artois-Picardie',
  team: 'Groupement Qualyse, LDgenX et Prelevmar',
  steps: [
    {
      title: 'Prélever',
      text: 'Fin novembre et début décembre 2025, trois réplicats d’eau filtrés simultanément sur 15 stations, réparties sur huit ports et estuaires.',
    },
    {
      title: 'Analyser',
      text: 'Deux marqueurs génétiques, Teleo pour les poissons osseux et Elas02 pour les élasmobranches : 23 et 13 taxons identifiés.',
    },
    {
      title: 'Comparer',
      text: 'Dans l’estuaire de la Somme, l’ADNe retrouve les quatre espèces structurantes du suivi au chalut à perche (hareng, merlan, gobie tacheté, bar) et détecte des espèces non capturées.',
    },
  ],
  outcome:
    'Des richesses médianes proches entre ports et estuaires, sauf pour la Slack, mais une répartition des espèces différente ; des assemblages cohérents avec les guildes écologiques attendues. L’étude nourrit la réflexion sur l’ADNe pour la surveillance des milieux aquatiques.',
  constraintsLabel: 'Contraintes du milieu soulignées par la publication',
  constraintsHint: 'Choisissez-en une pour la voir agir sur la carte.',
  // Each line explains the phenomenon in general terms; none describes a measurement.
  constraints: [
    {
      id: 'courants',
      label: 'Courants',
      text: 'Les courants déplacent l’eau, et avec elle les traces d’ADN qu’elle contient.',
    },
    {
      id: 'turbidite',
      label: 'Turbidité',
      text: 'Abondantes dans les estuaires, les particules en suspension troublent l’eau.',
    },
    {
      id: 'marees',
      label: 'Marées',
      text: 'La marée fait varier le niveau et le mélange des eaux au fil de la journée.',
    },
  ],
  mapNote:
    'Animation illustrative : les particules et leurs mouvements ne représentent aucune mesure de l’étude.',
  sourceLabel: 'La publication de l’Agence de l’eau',
};

export const innovations = [
  {
    id: 'dna-ecotrace',
    slug: 'dna-ecotrace',
    title: 'DNA EcoTrace',
    image: 'dna-ecotrace',
    label: 'ADN environnemental · biodiversité',
    headline: 'Rendre la connaissance de la biodiversité plus accessible.',
    intro:
      'DNA EcoTrace est un projet de recherche et développement de LDgenX qui vise à automatiser et simplifier le suivi de la biodiversité par ADN environnemental.',
    body: 'Le projet associe échantillonnage non invasif, séquençage longue lecture, intelligence artificielle et analyse automatisée des données. Il vise une restitution simplifiée pour les gestionnaires, collectivités et bureaux d’études.',
    steps: [
      'ADN environnemental',
      'Séquençage longue lecture',
      'Bioinformatique & IA',
      'Restitution des informations',
    ],
  },
  {
    id: 'edna-clock',
    slug: 'edna-clock',
    title: 'eDNAClock',
    image: 'ednaclock',
    label: 'ADN environnemental · épigénétique',
    headline: 'Explorer les traces du temps dans l’ADN.',
    intro:
      'eDNAClock explore l’estimation de l’âge des poissons à partir des traces d’ADN présentes dans l’environnement.',
    body: 'Le projet combine ADN environnemental, épigénétique et séquençage pour étudier le potentiel des horloges épigénétiques dans la compréhension de la structure démographique des populations aquatiques. Il s’agit d’un axe de recherche et développement.',
    steps: ['Traces d’ADN', 'Épigénétique', 'Séquençage', 'Compréhension démographique'],
  },
];

// The team: see extra.fr.ts for the full biographies and publication lists.
export const team = people;

// Grouping and names follow https://www.ldgenx.fr/a-propos/partenaires.
export const partners = [
  {
    title: 'Organisations qui nous font confiance',
    description: 'Des organisations présentées dans les références publiques de LDgenX.',
    names: [
      'Agence de l’eau Artois-Picardie',
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
    title: 'Écosystème scientifique',
    description:
      'Les instituts de recherche publique où l’équipe s’est formée et a mené ses premiers projets.',
    names: ['Ifremer', 'INRAE', 'CNRS', 'Université de Montpellier', 'MARBEC'],
  },
  {
    title: 'Soutiens & accompagnement',
    description: 'Des acteurs qui soutiennent et accompagnent le développement de LDgenX.',
    names: [
      'Bpifrance · Label Deep Tech',
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
    slug: 'comprendre-adn-environnemental',
    title: 'L’ADN environnemental : lire les traces du vivant.',
    category: 'ADN environnemental',
    image: 'terrain-prelevement',
    intro:
      'Un premier repère pour comprendre comment l’analyse des traces d’ADN accompagne l’étude de la biodiversité.',
    sections: [
      {
        title: 'Une information présente dans le milieu',
        text: 'L’ADN environnemental désigne l’ADN étudié à partir d’échantillons prélevés dans un milieu. LDgenX présente des approches sur l’eau, le sol, les sédiments et les biofilms pour identifier les espèces et accompagner les questions de suivi.',
      },
      {
        title: 'La question détermine l’approche',
        text: 'Inventorier une communauté et rechercher une cible ne conduisent pas nécessairement au même choix d’analyse. Le métabarcoding, la métagénomique, la dPCR et les longues lectures font partie des approches présentées par LDgenX.',
      },
      {
        title: 'Penser toute la chaîne',
        text: 'La conception, l’échantillonnage, les analyses moléculaires, le séquençage et la bioinformatique sont liés. L’interprétation doit revenir à la question initiale et au contexte du milieu étudié.',
      },
    ],
    source: 'https://www.ldgenx.fr/services/adn-environnemental-adne',
    service: 'adn-environnemental-adne',
  },
  {
    id: 'bioinformatique-question-biologique',
    slug: 'bioinformatique-question-biologique',
    title: 'Bioinformatique : partir de la question biologique.',
    category: 'Méthodologies',
    image: 'bioinformatique',
    intro:
      'Pourquoi le contexte biologique guide le traitement et l’interprétation des données génomiques.',
    sections: [
      {
        title: 'Relier la donnée au besoin',
        text: 'Le séquençage produit des données dont l’analyse doit être construite autour d’un objectif scientifique. LDgenX accompagne le traitement, l’analyse et l’interprétation pour les projets de biodiversité, de recherche et d’innovation.',
      },
      {
        title: 'Des jeux de données différents',
        text: 'Métabarcoding, métagénomique, WGS, RADseq, RNAseq et épigénétique ne se résument pas à une analyse unique. Le type de données et la question posée orientent l’approche bioinformatique.',
      },
      {
        title: 'Préparer l’échange scientifique',
        text: 'Pour un premier échange, partagez votre objectif, les données disponibles et les informations associées aux échantillons. Ce contexte aide à discuter du périmètre de l’analyse et des besoins d’interprétation.',
      },
    ],
    source: 'https://www.ldgenx.fr/services/bioinformatique',
    service: 'bioinformatique',
  },
  {
    id: 'genomique-filiere-aquacole',
    slug: 'genomique-filiere-aquacole',
    title: 'La génomique dans les filières aquacoles.',
    category: 'Aquaculture',
    image: 'aquaculture',
    intro:
      'Diversité, sélection et suivi : des questions complémentaires autour des ressources aquatiques.',
    sections: [
      {
        title: 'Connaître les populations',
        text: 'La diversité génétique, la gestion des géniteurs et la consanguinité sont des sujets présentés par LDgenX pour les filières aquacoles. Ils relient les données génétiques aux enjeux de gestion des cheptels.',
      },
      {
        title: 'Construire les outils de sélection',
        text: 'Le développement de panels SNP et la recherche de marqueurs associés à des caractères d’intérêt font partie des approches présentées. Les données génétiques sont étudiées en lien avec les objectifs des programmes.',
      },
      {
        title: 'Considérer l’environnement aquatique',
        text: 'L’étude du microbiome, la surveillance sanitaire et la gestion des stocks constituent d’autres champs d’application. Une discussion scientifique permet d’identifier les expertises utiles à chaque question.',
      },
    ],
    source: 'https://www.ldgenx.fr/applications/aquaculture-peche',
    service: 'selection',
  },
];

// How a project is scoped. Every line restates what LDgenX publishes: the perimeter,
// protocol, restitution, calendar and quote are defined with the client at scoping.
export const projectPractice = {
  eyebrow: 'Votre projet en pratique',
  title: 'Un cadrage partagé.\nUne proposition adaptée.',
  prepareTitle: 'Pour préparer le premier échange',
  prepare: [
    'Votre objectif et la décision qu’il doit éclairer',
    'Le contexte : site, milieu, espèces ou population étudiée',
    'Les échantillons ou les données déjà disponibles',
    'Votre calendrier et vos contraintes de terrain',
  ],
  defineTitle: 'Ce que nous définissons ensemble',
  define: [
    'Le périmètre de la prestation',
    'La stratégie d’échantillonnage et les analyses',
    'Les modalités de restitution',
    'Le calendrier et le devis',
  ],
};

export const faq = [
  {
    question: 'Faut-il déjà disposer d’échantillons pour vous contacter ?',
    answer:
      'Non. LDgenX intervient sur une étude complète, une étape d’analyse ou un développement spécifique. Le premier échange peut avoir lieu avant la campagne de terrain pour construire ensemble la stratégie d’échantillonnage.',
  },
  {
    question: 'Pouvez-vous analyser des données de séquençage déjà produites ?',
    answer:
      'Oui. L’accompagnement bioinformatique couvre le traitement, l’analyse et l’interprétation de données existantes : métabarcoding, métagénomique, WGS, RADseq, RNAseq ou épigénétique. Partagez votre objectif et les données disponibles.',
  },
  {
    question: 'Fournissez-vous le matériel de prélèvement ?',
    answer:
      'Le matériel d’échantillonnage fait partie des services proposés par LDgenX. Les références, disponibilités et conditions se précisent avec l’équipe selon votre milieu et vos analyses.',
  },
  {
    question: 'Comment le devis est-il établi ?',
    answer:
      'Le périmètre de la prestation, les modalités de restitution, le calendrier et le devis se précisent à partir de votre besoin, au cadrage du projet. Plus votre demande est précise, plus la proposition l’est aussi.',
  },
  {
    question: 'Où se trouve l’équipe ?',
    answer:
      'L’équipe LDgenX est implantée à la station Ifremer de Palavas-les-Flots, près de Montpellier. Pour un premier échange, réservez un créneau sur l’agenda de l’équipe ou écrivez à info@ldgenx.fr.',
  },
];
