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
      'Biodiversité, aquaculture, agriculture : nous concevons l’étude, analysons vos échantillons et vous aidons à interpréter les résultats.',
    primary: 'Demander un devis',
    secondary: 'Découvrir nos expertises',
    // Each fact is published by LDgenX: ldgenx.fr (accueil, partenaires, contact).
    facts: [
      { value: '+15 ans', label: 'd’expérience scientifique' },
      { value: 'Deep Tech', label: 'label attribué par Bpifrance' },
      { value: 'Toute la chaîne', label: 'du prélèvement à l’aide à la décision' },
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
      'Agences publiques, bureaux d’études, entreprises, universités et instituts de recherche : ils nous font confiance ou accompagnent notre développement.',
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
    image: 'schema-protocole',
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
      'Longs fragments (Nanopore) et courts fragments (Illumina, AVITI), séquençage ciblé et microsatellites (qPCR, Sanger, KASP), PCR digitale.',
    image: 'dpcr-chargement',
  },
  {
    title: 'Bioinformatique',
    text: 'Les données sont traitées et analysées au moyen d’approches bioinformatiques adaptées à votre question biologique.',
    detail:
      'Bioinformatique et biostatistique : métabarcoding, métagénomique, RADseq, RNAseq, WGS, épigénétique, GWAS.',
    image: 'bioinformatique-client',
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
    image: 'decision-amphitheatre',
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
  /** Shows the research tax credit (CIR) block. */
  cir?: boolean;
  /** Section headings of this page, where they differ from the shared ones. */
  headings?: {
    need?: string;
    methods?: string;
    methodsText?: string;
    prestations?: string;
    uses?: string;
    cases?: string;
  };
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
        text: 'Détection et quantification de l’ADN d’espèces ou de pathogènes ciblés grâce à la PCR digitale.',
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
      'Conception d’amorces (si nécessaire)',
      'Extraction d’ADN',
      'Séquençage',
      'Analyses bioinformatiques',
      'Analyses statistiques',
      'Analyses de diversité',
      'Rapport d’aide à la décision',
      'PCR digitale (dPCR)',
      'Cartographie et visualisation',
    ],
    cases: [
      {
        title: 'Analyse ichtyologique pour l’Agence de l’eau Artois-Picardie',
        image: 'carte-artois-picardie',
        link: { kind: 'study', id: 'ichtyofaune-artois-picardie' },
      },
      {
        title: 'Recherche de l’ichtyofaune en milieu turbide',
        image: 'terrain-prelevement',
        link: { kind: 'study', id: 'adne-estuaire-milieu-turbide' },
      },
      {
        title: 'État des lieux de la biodiversité marine sur le site pilote',
        image: 'terrain-palavas',
      },
      {
        title: 'Biodiversité des parcs éoliens offshore (étude en cours)',
        image: 'cas-eolien-offshore',
        link: { kind: 'study', id: 'biodiversite-eolien-offshore' },
      },
    ],
    headings: {
      need: 'Une question, un milieu,\ndes espèces à connaître.',
      methods: 'Quatre façons de lire\nles traces d’ADN.',
      prestations: 'Du protocole\nau rapport d’aide à la décision.',
      uses: 'Là où l’ADNe\napporte une réponse.',
      cases: 'Des milieux\ndéjà explorés.',
    },
    source: 'https://www.ldgenx.fr/services/adn-environnemental-adne',
  },
  {
    id: 'genomique-des-populations',
    slug: 'genomique-des-populations',
    title: 'Génomique des populations',
    short: 'Comprendre la diversité, la connectivité et l’adaptation.',
    scope: 'Caractériser la diversité génétique, la connectivité et l’adaptation des populations.',
    image: 'populations-huitriers',
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
        text: 'Séquençage à l’échelle du génome pour rechercher des variants et étudier l’adaptation et l’histoire évolutive.',
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
      'Préparation des banques de séquençage',
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
        link: { kind: 'study', id: 'genomique-vanneau-huppe' },
      },
      {
        title: 'L’ours brun des Pyrénées',
        image: 'ours-brun',
        link: { kind: 'study', id: 'demogenetique-ours-pyrenees' },
      },
    ],
    headings: {
      need: 'Diversité, structure,\nconnectivité.',
      methods: 'Du panel SNP\nau génome entier.',
      prestations: 'De l’échantillon\naux marqueurs génétiques.',
      uses: 'Des données génétiques\npour gérer les populations.',
      cases: 'Des populations\ndéjà étudiées.',
    },
    source: 'https://www.ldgenx.fr/services/genomique-des-populations',
  },
  {
    id: 'analyse-des-communautes-microbiennes',
    slug: 'analyse-des-communautes-microbiennes',
    title: 'Communautés microbiennes',
    short: 'Explorer la diversité que l’on ne voit pas.',
    scope:
      'Étudier les communautés bactériennes, fongiques et microbiennes grâce au séquençage haut débit.',
    image: 'biofilm-microbien',
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
      'Préparation des banques de séquençage',
      'Séquençage',
      'Analyses bioinformatiques',
      'Analyses statistiques',
      'Rapport d’aide à la décision',
    ],
    cases: [
      {
        title: 'Séquençage de communautés microbiennes sur microplastiques',
        image: 'cas-microplastiques',
        link: { kind: 'study', id: 'communautes-microplastiques' },
      },
    ],
    headings: {
      need: 'Qui compose\nla communauté ?',
      methods: 'Bactéries, champignons,\nfonctions.',
      prestations: 'De l’extraction\nà l’interprétation.',
      uses: 'Des eaux aux sols,\ndes élevages à la recherche.',
      cases: 'Un sujet\ndéjà exploré.',
    },
    source: 'https://www.ldgenx.fr/services/analyse-des-communautes-microbiennes',
  },
  {
    id: 'selection',
    slug: 'selection',
    title: 'Sélection génomique',
    short: 'Intégrer l’information génétique dans vos programmes.',
    scope: 'Développer des outils d’aide à la sélection pour les filières agricoles et aquacoles.',
    image: 'selection-unima',
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
    headings: {
      need: 'Un caractère, un programme,\ndes données.',
      methods: 'Des marqueurs\naux modèles de sélection.',
      prestations: 'Des outils\npour vos programmes.',
      uses: 'Les caractères\nqui comptent pour vos filières.',
      cases: 'Des travaux\ndéjà menés.',
    },
    source: 'https://www.ldgenx.fr/services/selection',
  },
  {
    id: 'bioinformatique',
    slug: 'bioinformatique',
    title: 'Bioinformatique',
    short: 'Faire émerger le sens de vos données génomiques.',
    scope: 'Transformer vos données de séquençage en résultats exploitables.',
    image: 'bioinformatique-alignement',
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
      'Analyses de diversité',
      'Cartographie et visualisation',
      'Reproductibilité des analyses',
      'Bancarisation des données',
      'Accompagnement scientifique',
    ],
    cases: [],
    headings: {
      need: 'Des données brutes\nà la réponse biologique.',
      methods: 'À chaque type de données,\nson analyse.',
      prestations: 'De la qualité des données\nà leur restitution.',
      uses: 'Les données\nque nous analysons.',
    },
    source: 'https://www.ldgenx.fr/services/bioinformatique',
  },
  {
    id: 'sequencage-dpcr',
    slug: 'sequencage-dpcr',
    title: 'Séquençage & dPCR',
    short: 'Lire l’ADN. Détecter les cibles qui vous intéressent.',
    scope:
      'Amplicons, courts et longs fragments, génomes entiers ou partiels, détection d’espèces cibles ou de variants.',
    image: 'dpcr-instrument',
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
        text: 'Séquençage visant l’ensemble du génome, avec une couverture adaptée au projet.',
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
      'Préparation des banques de séquençage',
      'Séquençage',
      'Conception d’amorces (si nécessaire)',
      'PCR digitale (dPCR)',
      'Accompagnement scientifique',
    ],
    cases: [
      { title: 'Épigénétique du sar', image: 'cas-sar' },
      { title: 'Détection d’espèces méditerranéennes emblématiques par dPCR', image: 'cas-requin' },
      { title: 'Détection de l’oursin violet (*Paracentrotus lividus*)', image: 'cas-oursin' },
    ],
    headings: {
      need: 'Lire des génomes\nou détecter une espèce ?',
      methods: 'Des amplicons\naux génomes entiers.',
      prestations: 'De l’extraction\nà la PCR digitale.',
      uses: 'Ce que nous séquençons\net détectons.',
      cases: 'Des cibles\ndéjà étudiées.',
    },
    source: 'https://www.ldgenx.fr/services/sequencage-dpcr',
    seo: {
      title: 'Séquençage et détection d’espèces par dPCR | LDgenX',
      description:
        'Séquençage d’amplicons, longues lectures et génomes entiers, détection d’espèces par dPCR : des technologies choisies pour votre question scientifique.',
    },
  },
  {
    id: 'tests-adn-cibles',
    slug: 'tests-adn-cibles',
    title: 'Tests ADN ciblés',
    short: 'Détecter et quantifier l’ADN d’une espèce précise.',
    scope:
      'Amorces et sondes pour 22 espèces et tests sur mesure : détection et quantification par PCR digitale.',
    image: 'dpcr-operateur',
    headline: 'Votre espèce cible, un test ADN sur mesure.',
    intro:
      'Vison d’Europe, thon rouge, requins, tortue caouanne : LDgenX dispose d’amorces et de sondes pour 22 espèces et conçoit des tests pour de nouvelles cibles. La PCR digitale (dPCR) détecte et quantifie l’ADN de l’espèce recherchée dans l’eau, les sols ou les sédiments.',
    need: 'Une espèce protégée à confirmer, une espèce invasive à détecter tôt, un pathogène à surveiller ? Quand la question porte sur une espèce précise, un test ciblé y répond plus directement qu’un inventaire.',
    approaches: [
      {
        title: 'Détecter une espèce',
        text: 'Savoir si l’ADN d’une espèce précise est présent dans un échantillon d’eau, de sol ou de sédiment.',
      },
      {
        title: 'Quantifier son ADN',
        text: 'Estimer la quantité d’ADN cible, en nombre de copies, pour comparer des échantillons ou des sites.',
      },
      {
        title: 'Espèces rares ou invasives',
        text: 'Rechercher une espèce protégée, menacée ou invasive, lorsque la question porte sur une cible précise.',
      },
      {
        title: 'Pathogènes',
        text: 'Surveiller un pathogène par dPCR, par exemple dans les filières aquacoles.',
      },
    ],
    uses: ['Espèces protégées', 'Espèces invasives', 'Espèces d’intérêt halieutique', 'Pathogènes'],
    sectors: ['environnement-bureaux-d-etudes', 'biodiversite-conservation', 'aquaculture-peche'],
    delivery:
      'Chaque test se définit avec vous : l’espèce, les espèces proches à ne pas confondre, les matrices et le plan d’échantillonnage. Les performances du test sont évaluées selon le projet.',
    prestations: [
      'Conception d’amorces et de sondes',
      'Évaluation de la spécificité',
      'Extraction d’ADN',
      'PCR digitale (dPCR)',
      'Interprétation des résultats',
      'Rapport d’aide à la décision',
    ],
    cases: [
      { title: 'Détection d’espèces méditerranéennes emblématiques par dPCR', image: 'cas-requin' },
      { title: 'Détection de l’oursin violet (*Paracentrotus lividus*)', image: 'cas-oursin' },
    ],
    source: 'https://www.ldgenx.fr/services/sequencage-dpcr',
    seo: {
      title: 'Tests ADN ciblés par dPCR : détecter une espèce | LDgenX',
      description:
        'Amorces et sondes pour 22 espèces (vison d’Europe, thon rouge, requins, tortue caouanne…) et tests sur mesure : détection et quantification de l’ADN par PCR digitale.',
    },
    headings: {
      need: 'Une question,\nune espèce.',
      methods: 'Détecter, quantifier,\nsurveiller.',
      prestations: 'De la conception\nau rapport.',
      uses: 'Les cibles\nles plus fréquentes.',
      cases: 'Des cibles\ndéjà étudiées.',
    },
  },
  {
    id: 'recherche-developpement',
    slug: 'recherche-developpement',
    title: 'Recherche & Développement',
    short: 'Construire les approches scientifiques de demain.',
    scope:
      'Réponses aux appels à projets, accompagnement et conseil pour vos projets de recherche.',
    image: 'terrain-kayak',
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
    cir: true,
    prestations: ['Réponses aux appels à projets', 'Accompagnement', 'Conseils'],
    cases: [
      {
        title: 'DNA EcoTrace',
        image: 'schema-ecotrace',
        link: { kind: 'innovation', id: 'dna-ecotrace' },
      },
      { title: 'eDNAClock', image: 'ednaclock', link: { kind: 'innovation', id: 'edna-clock' } },
    ],
    headings: {
      need: 'Une question ouverte ?\nConstruisons la méthode.',
      methods: 'Concevoir, développer,\ncollaborer.',
      prestations: 'Un appui\nà chaque étape du projet.',
      uses: 'Des domaines\nà explorer ensemble.',
      cases: 'Nos projets\nde recherche.',
    },
    source: 'https://www.ldgenx.fr/a-propos/innovation',
  },
  {
    id: 'materiel',
    slug: 'materiel',
    title: 'Matériel d’échantillonnage',
    short: 'Préparer le terrain pour vos analyses.',
    scope:
      'Kits d’échantillonnage par milieu (eau de mer, eau douce, sol, air) et matériel de filtration de l’eau.',
    image: 'materiel-pompe',
    headline: 'Une analyse commence par un échantillon.',
    intro:
      'Kits d’échantillonnage pour l’eau de mer, l’eau douce, le sol et l’air, matériel de filtration de l’eau (pompe triple, stick pump, torpille) : LDgenX vous équipe pour vos campagnes d’ADN environnemental.',
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
      'Le choix du matériel dépend du milieu, des volumes à filtrer et des analyses prévues : l’équipe vous aide à préparer la campagne avant le terrain.',
    prestations: [],
    cases: [],
    headings: {
      methods: 'Préparer\nvotre campagne.',
      methodsText:
        'Le matériel se choisit selon le milieu, la question posée et l’organisation des prélèvements.',
      uses: 'Pour quels\nprojets ?',
    },
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
  /** The case study shown on the page, when one belongs to the field. */
  study?: string;
  /** Shows the research tax credit (CIR) block. */
  cir?: boolean;
  /** Section headings of this page, where they differ from the shared ones. */
  headings?: { fieldEyebrow?: string; field?: string; related?: string };
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
    study: 'genomique-vanneau-huppe',
    headings: {
      field: 'Suivre, comprendre,\naccompagner la gestion.',
      related: 'De l’ADNe\nà la génomique des populations.',
    },
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
    image: 'selection-unima',
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
    headings: {
      fieldEyebrow: 'Vos questions de filière',
      field: 'De l’écloserie\nau suivi des stocks.',
      related: 'Sélection, populations,\ndétection ciblée.',
    },
    source: 'https://www.ldgenx.fr/applications/aquaculture-peche',
  },
  {
    id: 'agriculture-agroecologie',
    slug: 'agriculture-agroecologie',
    title: 'Agriculture & Agroécologie',
    scope: 'Microbiomes des sols, marqueurs moléculaires, sélection assistée par marqueurs.',
    image: 'schema-agroecologie',
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
    headings: {
      field: 'Des sols\naux programmes de sélection.',
      related: 'Microbiomes, marqueurs\net détection ciblée.',
    },
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
    study: 'ichtyofaune-artois-picardie',
    headings: {
      field: 'Trois questions\nau cœur de vos projets.',
      related: 'ADNe, dPCR, microbiologie\net matériel de terrain.',
    },
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
    image: 'schema-recherche',
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
    cir: true,
    uses: [],
    examples: [],
    headings: {
      fieldEyebrow: 'Vos questions de recherche',
      field: 'De la conception\nà l’analyse des données.',
      related: 'Biologie moléculaire,\nséquençage, bioinformatique.',
    },
    source: 'https://www.ldgenx.fr/a-propos/innovation',
  },
  {
    id: 'energies-marines-renouvelables',
    slug: 'energies-renouvelables',
    title: 'Énergies renouvelables',
    scope:
      'Éolien terrestre, éolien en mer et photovoltaïque : documenter la biodiversité autour de vos projets.',
    image: 'eolien-en-mer',
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
    study: 'biodiversite-eolien-offshore',
    headings: {
      field: 'De l’état initial\nau suivi d’exploitation.',
      related: 'ADNe, détection ciblée\net matériel de terrain.',
    },
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

/** Figures and documents of a case study page, when published. */
export interface StudyDetails {
  regionsTitle?: string;
  regionsNote?: string;
  regions?: { name: string; value: number }[];
  /** Shown after each bar value (e.g. '%'). */
  regionsUnit?: string;
  /** Figures of the report, shown whole and opened at full size. */
  figuresTitle?: string;
  /** A picture cut from the report, or a figure redrawn from its numbers as bars. */
  figures?: (
    | { image: string; caption: string; size?: 'medium' }
    | { bars: { name: string; value: number }[]; caption: string }
  )[];
  funnelTitle: string;
  funnel: { value: string; label: string }[];
  findingsTitle: string;
  findings: string[];
  perspectiveTitle: string;
  perspective: string;
  rolesTitle: string;
  roles: string[];
  documentsTitle?: string;
  documents?: { label: string; meta: string; url: string }[];
}

export interface Study {
  id: string;
  slug: string;
  title: string;
  /** A shorter title for the page title, when the title is too long for search results. */
  seoTitle?: string;
  category: string;
  image: string;
  imageAlt?: string;
  subtitle: string;
  facts: { label: string; value: string }[];
  context: string;
  question: string;
  approach: string;
  result: string;
  service: string;
  /** The published source, when there is one (empty for a client report). */
  source: string;
  /** A study still running: its page says so, with no results yet. */
  status?: 'ongoing';
  details?: StudyDetails;
}

export const studies: Study[] = [
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
    id: 'genomique-vanneau-huppe',
    slug: 'genomique-vanneau-huppe',
    title: 'D’où viennent les vanneaux huppés qui hivernent en France ?',
    seoTitle: 'Génomique des vanneaux huppés hivernant en France',
    category: 'Génomique des populations',
    image: 'cas-vanneau',
    imageAlt: 'Vanneau huppé',
    subtitle:
      'Une étude génomique de 438 vanneaux huppés pour la Fédération nationale des chasseurs, dans le cadre du projet VanConnect.',
    facts: [
      { label: 'Commanditaire', value: 'Fédération nationale des chasseurs' },
      { label: 'Projet', value: 'VanConnect, Écocontribution n° 1274, action 1' },
      { label: 'Espèce', value: 'Vanneau huppé, Vanellus vanellus' },
      { label: 'Approche', value: 'Génotypage par séquençage (3D-GBS), 40 746 SNP' },
      { label: 'Période', value: '2024-2025' },
    ],
    context:
      'Espèce migratrice chassable inscrite à l’annexe II de la directive Oiseaux, le vanneau huppé est en déclin, notamment du fait d’une faible productivité. Les oiseaux qui hivernent en France viendraient du Royaume-Uni, de Scandinavie ou d’Europe de l’Est, mais leur provenance et la structure de leurs populations restaient mal connues.',
    question:
      'D’où viennent les vanneaux huppés qui hivernent en France, et leurs populations sont-elles génétiquement structurées ?',
    approach:
      'Analyse de 479 échantillons de muscle prélevés de 2018 à 2023 dans neuf régions françaises, génotypés par 3D-GBS. Après contrôle qualité, 438 oiseaux et 40 746 SNP ont été analysés : diversité génétique, ADMIXTURE, analyse en composantes principales, identité par état et par descendance.',
    result:
      'Les analyses ne révèlent pas de structuration génétique marquée parmi les oiseaux échantillonnés en France et montrent une diversité génétique élevée. Ces résultats sont compatibles avec une population faiblement structurée ; ils ne permettent pas d’attribuer à chaque oiseau une région de nidification.',
    service: 'genomique-des-populations',
    source: 'https://hal.science/hal-05490664',
    details: {
      regionsTitle: 'Les oiseaux analysés, par région',
      regionsNote:
        'Nombre d’échantillons par région (tableau 1 du rapport). Trois oiseaux n’ont pas de région renseignée. La répartition reflète la densité des oiseaux en hiver et l’effort d’échantillonnage.',
      regions: [
        { name: 'Normandie', value: 149 },
        { name: 'Hauts-de-France', value: 109 },
        { name: 'Pays de la Loire', value: 91 },
        { name: 'Nouvelle-Aquitaine', value: 56 },
        { name: 'Bretagne', value: 30 },
        { name: 'Centre-Val de Loire', value: 21 },
        { name: 'Grand Est', value: 10 },
        { name: 'Corse', value: 5 },
        { name: 'Occitanie', value: 5 },
      ],
      funnelTitle: 'Des échantillons aux données',
      funnel: [
        { value: '479', label: 'échantillons de muscle, prélevés de 2018 à 2023' },
        { value: '471', label: 'oiseaux séquencés avec assez de lectures' },
        { value: '930 912', label: 'SNP détectés sur le génome de référence du vanneau' },
        { value: '438', label: 'oiseaux retenus après filtrage des données manquantes' },
        { value: '40 746', label: 'SNP indépendants pour les analyses de structure' },
      ],
      findingsTitle: 'Ce que montrent les analyses',
      findings: [
        'ADMIXTURE : le nombre de groupes génétiques le plus probable est K = 1.',
        'Indice Fis proche de 0 dans toutes les régions : pas de déficit marqué d’hétérozygotes dans les groupes analysés.',
        'Analyse en composantes principales : aucun regroupement selon la région, le sexe, l’âge, l’année ou le mois de prélèvement ; trois groupes se distinguent très subtilement sur le premier axe.',
        'Identité par état : la plupart des paires d’oiseaux entre 0,75 et 0,85, ce qui est attendu dans une population naturelle faiblement structurée.',
        'Identité par descendance : seules cinq paires d’oiseaux semblent apparentées.',
      ],
      perspectiveTitle: 'Pour aller plus loin',
      perspective:
        'Ajouter des oiseaux prélevés sur leurs sites de nidification, au Royaume-Uni, en Scandinavie et en Europe de l’Est, permettrait d’identifier l’origine des vanneaux qui hivernent en France.',
      rolesTitle: 'Qui a fait quoi',
      roles: [
        'Rapport : Maeva Leitwein et Emilie Delpuech (LDgenX), Carole Bodin et Pascal Lapébie (Fédération nationale des chasseurs).',
        'Échantillons : carcasses collectées par la Fédération départementale des chasseurs des Ardennes, grâce à la participation volontaire de chasseurs.',
        'Extraction de l’ADN, préparation des banques et séquençage : plateforme IBIS, Université Laval (Québec), sur séquenceur AVITI.',
      ],
      documentsTitle: 'Les documents sources',
      documents: [
        {
          label:
            'Rapport d’analyses génomiques des populations de vanneaux huppés hivernant en France',
          meta: 'HAL, 3 février 2026 · PDF, 24 pages',
          url: 'https://hal.science/hal-05490664',
        },
        {
          label: 'Données brutes : fichiers BAM individuels et VCF',
          meta: 'European Nucleotide Archive, PRJEB88728',
          url: 'https://www.ebi.ac.uk/ena/browser/view/PRJEB88728',
        },
      ],
    },
  },
  {
    id: 'demogenetique-ours-pyrenees',
    slug: 'demogenetique-ours-pyrenees',
    title: 'Quel avenir génétique pour l’ours des Pyrénées ?',
    category: 'Génomique des populations',
    image: 'ours-brun',
    imageAlt: 'Ours brun traversant une clairière en forêt',
    subtitle:
      'Une étude démo-génétique de la population d’ours brun pour l’association Pays de l’Ours – ADET.',
    facts: [
      { label: 'Commanditaire', value: 'Association Pays de l’Ours – ADET' },
      { label: 'Partenaire scientifique', value: 'UMR BIOGECO (INRAE, Université de Bordeaux)' },
      { label: 'Espèce', value: 'Ours brun, Ursus arctos' },
      { label: 'Données', value: 'Suivi de la population, de 1975 à 2024' },
      { label: 'Approche', value: 'Modélisation démo-génétique, projections jusqu’en 2050' },
      { label: 'Année', value: '2025' },
    ],
    context:
      'Proche de l’extinction dans les Pyrénées au milieu des années 1990, l’ours brun y a été renforcé à partir de 1996 par des lâchers d’ours venus de Slovénie. La population est estimée à 104 individus en 2024. Issue d’un petit nombre de fondateurs, elle reste génétiquement fragile : sa consanguinité augmente depuis le début des années 2000, alors même que ses effectifs croissent.',
    question:
      'Quel est l’état génétique de la population, et quels apports d’ours limiteraient la consanguinité d’ici 2050 ?',
    approach:
      'Synthèse des données du suivi de la population : un pedigree établi à partir de treize marqueurs microsatellites, sur des poils et des fèces, de 1975 à 2024. Après estimation des paramètres démographiques, la population est simulée de 2024 à 2050 : de 0 à 200 ours introduits entre 2030 et 2040, avec de 0 à 100 % de mâles, soit 2 475 généalogies simulées.',
    result:
      'Sans nouvel apport, la consanguinité continue d’augmenter jusqu’en 2050. Un renforcement modéré mais structuré est la mesure la plus efficace : 30 ours introduits sur dix ans, dont environ 70 % de femelles, freinent la hausse de la consanguinité et augmentent la taille efficace de la population. Maintenir la connectivité entre les deux noyaux de population et coordonner la gestion entre la France, l’Espagne et l’Andorre complètent ces mesures.',
    service: 'genomique-des-populations',
    source: '',
    details: {
      regionsTitle: 'Délai entre deux portées',
      regionsNote:
        'Part des reproductions des ourses selon le nombre d’années écoulées depuis leur dernière mise bas, d’après les données de suivi jusqu’en 2024 (figure 3 du rapport) ; 1,86 an en moyenne. « 0 an » : portées de plusieurs pères, comptées comme deux reproductions.',
      regionsUnit: ' %',
      regions: [
        { name: '0 an', value: 7.5 },
        { name: '1 an', value: 11.3 },
        { name: '2 ans', value: 64.2 },
        { name: '3 ans', value: 11.3 },
        { name: '4 ans', value: 5.7 },
      ],
      figuresTitle: 'Les figures du rapport',
      figures: [
        {
          image: 'fig-ours-consanguinite',
          caption:
            'Figure 6 du rapport : consanguinité moyenne simulée, sans introduction (a) et avec 30 ours introduits sur dix ans (b) ; médiane de 50 simulations.',
        },
        {
          image: 'fig-ours-effectifs',
          caption:
            'Figure 4 du rapport : effectifs de la population, observés de 2000 à 2024 puis simulés jusqu’en 2050.',
          size: 'medium',
        },
      ],
      funnelTitle: 'Des données de suivi aux projections',
      funnel: [
        { value: '1975-2024', label: 'années de suivi de la population analysées' },
        {
          value: '13',
          label: 'marqueurs microsatellites pour identifier chaque ours et établir le pedigree',
        },
        { value: '104', label: 'ours estimés en 2024, dans un intervalle de 97 à 123' },
        { value: '2 475', label: 'généalogies simulées jusqu’en 2050' },
        { value: '0 à 200', label: 'ours introduits selon les scénarios, de 0 à 100 % de mâles' },
      ],
      findingsTitle: 'Ce que montrent les simulations',
      findings: [
        'Sans intervention, l’érosion génétique se poursuit lentement mais inexorablement : la consanguinité moyenne continue d’augmenter jusqu’en 2050.',
        'Dans le modèle, les effectifs atteignent la capacité de charge fixée vers 2035, avec plus de 400 ours.',
        'Plus les ours introduits sont nombreux, plus la taille efficace et la diversité génétique augmentent : la richesse allélique passe de 5,6 à plus de 7 allèles par locus.',
        'À nombre égal, des introductions majoritairement féminines peuvent doubler la taille efficace génétique. La consanguinité varie de 0,40, pour des apports limités et surtout masculins, à 0,14 pour des apports importants et surtout féminins.',
        'Le scénario recommandé, 30 ours sur dix ans dont environ 70 % de femelles, freine la hausse de la consanguinité par rapport à l’absence d’apport.',
      ],
      perspectiveTitle: 'Pour aller plus loin',
      perspective:
        'Les projections gagnent à être actualisées avec les nouvelles données de suivi. LDgenX propose de partager et de codévelopper ses modèles de simulation avec l’Office français de la biodiversité, pour affiner les stratégies de gestion de la population.',
      rolesTitle: 'Qui a fait quoi',
      roles: [
        'Commanditaire : Alain Reynes, association Pays de l’Ours – ADET.',
        'Rapport : Maeva Leitwein et Emilie Delpuech (LDgenX). Coordination scientifique : Maeva Leitwein.',
        'Outils de modélisation et statistiques : Emilie Delpuech et Virgil Fivet (UMR BIOGECO), dans le cadre du stage d’Anouk Glazmann d’Hont, étudiante en Master 2 à l’École pratique des hautes études (EPHE), recrutée pour le projet.',
        'Partenaire scientifique : UMR BIOGECO (INRAE, Université de Bordeaux).',
        'Données de suivi : réseau Ours brun, piloté par l’Office français de la biodiversité avec les services espagnols et andorrans.',
      ],
    },
  },
  {
    id: 'adne-estuaire-milieu-turbide',
    slug: 'adne-estuaire-milieu-turbide',
    title: 'Lire l’ADN des poissons dans les eaux turbides.',
    category: 'ADN environnemental',
    image: 'estuaire-gironde',
    imageAlt: 'L’embouchure de l’estuaire de la Gironde vue de l’espace, aux eaux chargées de sédiments',
    subtitle:
      'Un projet pilote en Gironde pour comparer des méthodes de filtration de l’eau dans des estuaires turbides.',
    facts: [
      { label: 'Commanditaire', value: 'Thibault Dindart' },
      { label: 'Projet', value: 'ADNe Estuaire, projet pilote' },
      { label: 'Sites', value: 'Bègles, Cadillac et Le Verdon (Gironde)' },
      { label: 'Turbidité', value: 'De 14 à plus de 800 NTU' },
      { label: 'Échantillons', value: '43, analysés en double' },
      { label: 'Approche', value: 'Métabarcoding ADNe, marqueur 12S des poissons' },
      { label: 'Période', value: 'Campagne d’octobre' },
    ],
    context:
      'Dans les estuaires, l’eau chargée en particules complique l’ADN environnemental : les filtres colmatent vite et les particules peuvent gêner les analyses. Ce projet pilote visait à optimiser les protocoles d’ADNe en milieu turbide.',
    question:
      'Quels dispositifs et quelles tailles de filtre conviennent selon la turbidité, et quels poissons détecte-t-on ?',
    approach:
      'Lors d’une campagne d’octobre, l’eau de trois sites aux turbidités contrastées a été filtrée avec deux systèmes : une pompe triple avec capsules Waterra (pores de 0,45, 1,2 et 5 µm) et une Stick Pump à fort débit (filtre de 20 µm), de 2 à 30 litres selon le colmatage. Les 43 échantillons ont été analysés en métabarcoding sur le marqueur 12S des poissons (Teleo, lectures courtes Illumina), en double ; 12 d’entre eux l’ont aussi été en fragment long (Oxford Nanopore).',
    result:
      'La richesse détectée est la plus faible à Bègles (740 à 800 NTU) et la plus élevée au Verdon (14 NTU). La réanalyse des lectures courtes identifie 26 taxons sur l’ensemble des sites et campagnes. Les filtres de 5 µm concentrent les signaux les plus forts, les filtres plus fins un signal plus diffus mais plus diversifié. Le projet recommande de répéter les prélèvements et de comparer les outils bioinformatiques ; ces observations ne permettent pas d’isoler à elles seules l’effet de la turbidité.',
    service: 'adn-environnemental-adne',
    source: '',
    details: {
      regionsTitle: 'Espèces détectées par site',
      regionsNote:
        'Richesse spécifique par site, toutes campagnes confondues, en lecture courte (table 5 du rapport), du site le plus turbide au plus clair : Bègles, Cadillac, Le Verdon.',
      regions: [
        { name: 'Bègles', value: 6 },
        { name: 'Cadillac', value: 11 },
        { name: 'Le Verdon', value: 17 },
      ],
      figuresTitle: 'Les figures du rapport',
      figures: [
        {
          image: 'fig-estuaire-taxons',
          caption:
            'Figure 2 du rapport : espèces détectées en lecture courte, par site, turbidité et taille de filtre ; la taille des cercles suit l’abondance relative des séquences.',
        },
        {
          bars: [
            { name: 'Lecture courte seule', value: 14 },
            { name: 'Les deux lectures', value: 12 },
            { name: 'Lecture longue seule', value: 2 },
          ],
          caption:
            'D’après la figure supplémentaire 3 du rapport : nombre d’espèces détectées par la lecture courte seule, par la lecture longue seule ou par les deux.',
        },
      ],
      funnelTitle: 'Du terrain aux espèces',
      funnel: [
        { value: '3', label: 'sites, de 14 à plus de 800 NTU' },
        { value: '43', label: 'échantillons filtrés, extraits et analysés en double' },
        { value: '36 730 010', label: 'séquences brutes en lecture courte' },
        { value: '12', label: 'échantillons séquencés aussi en fragment long (12S complet)' },
        { value: '26', label: 'taxons identifiés en lecture courte, sur l’ensemble des sites' },
      ],
      findingsTitle: 'Ce que montrent les analyses',
      findings: [
        'Bègles, le site le plus turbide (740 à 800 NTU), présente la richesse la plus faible : six taxons en lecture courte, toutes campagnes confondues (table 5 du rapport).',
        'Le Verdon, en eau claire (14 NTU) : la richesse la plus élevée, avec des espèces marines côtières, de la zone intertidale et d’eau douce.',
        'Entre deux passages sur un même site, une baisse de la turbidité s’accompagne d’un signal du bar plus fort. Cette association doit être interprétée avec les autres facteurs biologiques et techniques de détection.',
        'Les filtres de 5 µm concentrent les signaux les plus forts ; ceux de 0,45 et 1,2 µm captent un signal plus diffus mais plus diversifié.',
        'Lectures courtes et longues se recoupent : 12 espèces communes, soit 86 % des taxons du fragment long, qui en révèle deux autres, le rouquié et la grémille.',
        'Réanalysées avec un second outil bioinformatique, les lectures courtes livrent 26 taxons, contre 2 espèces en première analyse : croiser les outils d’analyse fait partie des recommandations.',
      ],
      perspectiveTitle: 'Pour aller plus loin',
      perspective:
        'Répéter les prélèvements dans le temps sur chaque site et combiner des marqueurs de longueurs différentes : ce sont les deux pistes retenues pour consolider le protocole, avant toute diffusion publique des occurrences.',
      rolesTitle: 'Qui a fait quoi',
      roles: [
        'Commanditaire cité dans le rapport : Thibault Dindart.',
        'Rapport : Maeva Leitwein et Emilie Delpuech (LDgenX).',
        'Extraction de l’ADN, séquençage en fragment long (MinION) et analyses bioinformatiques : LDgenX.',
        'Amplifications et séquençage en lecture courte : plateforme PGTB (Bordeaux), sur Illumina MiSeq i100.',
      ],
    },
  },
  {
    id: 'biodiversite-eolien-offshore',
    slug: 'biodiversite-eolien-offshore',
    title: 'Explorer la biodiversité des parcs éoliens offshore.',
    category: 'Biodiversité marine',
    image: 'cas-eolien-offshore',
    subtitle:
      'L’ADN environnemental au service du suivi des milieux marins autour des parcs éoliens.',
    status: 'ongoing',
    facts: [
      { label: 'Statut', value: 'Étude en cours' },
      { label: 'Contexte', value: 'Parcs éoliens offshore' },
      { label: 'Milieu', value: 'Biodiversité marine' },
      { label: 'Approche', value: 'ADN environnemental' },
    ],
    context:
      'Les projets d’éolien en mer s’accompagnent d’un état initial et d’un suivi des milieux marins, de la construction à l’exploitation.',
    question:
      'Comment documenter la biodiversité marine dans le contexte des projets d’énergies renouvelables ?',
    approach:
      'L’ADN environnemental permet d’inventorier la biodiversité à partir de prélèvements d’eau, sans capturer les espèces. Le protocole, les groupes ciblés et la fréquence des prélèvements se définissent selon le site et la question posée.',
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
    subtitle: 'Le séquençage des communautés microbiennes qui colonisent les microplastiques.',
    facts: [
      { label: 'Rôle de LDgenX', value: 'Séquençage' },
      { label: 'Supports', value: 'Microplastiques' },
      { label: 'Domaine', value: 'Microbiologie environnementale' },
    ],
    context:
      'Dans l’eau, les microplastiques sont colonisés par des communautés de micro-organismes. Les caractériser aide à mieux comprendre ces supports et leur place dans les milieux.',
    question: 'Quelles communautés microbiennes caractériser sur ces supports ?',
    approach: 'Notre intervention s’est limitée au séquençage des échantillons du projet.',
    result: '',
    service: 'sequencage-dpcr',
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
  sourceLabel: 'La publication de l’Agence de l’eau',
};

export const innovations = [
  {
    id: 'dna-ecotrace',
    slug: 'dna-ecotrace',
    title: 'DNA EcoTrace',
    image: 'schema-ecotrace',
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
    description: 'Agences, bureaux d’études, entreprises et organismes de recherche.',
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
        text: 'L’ADN environnemental désigne l’ADN étudié à partir d’échantillons prélevés dans un milieu. Nous l’étudions dans l’eau, les sols, les sédiments et les biofilms pour identifier les espèces et répondre aux questions de suivi.',
      },
      {
        title: 'La question détermine l’approche',
        text: 'Inventorier une communauté et rechercher une espèce précise ne conduisent pas au même choix d’analyse. Métabarcoding, métagénomique, dPCR ou longues lectures : chaque approche répond à un type de question.',
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
    image: 'bioinformatique-client',
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
    image: 'selection-unima',
    intro:
      'Diversité, sélection et suivi : des questions complémentaires autour des ressources aquatiques.',
    sections: [
      {
        title: 'Connaître les populations',
        text: 'Diversité génétique, gestion des géniteurs, consanguinité : ces questions relient les données génétiques à la gestion des cheptels.',
      },
      {
        title: 'Construire les outils de sélection',
        text: 'Panels SNP, recherche de marqueurs associés à des caractères d’intérêt : les données génétiques sont étudiées au regard des objectifs du programme de sélection.',
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
