import { pageCopy, formCopy } from './pages.fr';
import { visualCopy } from './visuals.fr';

export const company = {
  name: 'LDgenX',
  origin: 'https://www.ldgenx.fr',
  email: 'info@ldgenx.fr',
  address: 'Station Ifremer · 51 route de Maguelone',
  city: '34250 Palavas-les-Flots, France',
  appointment: 'https://cal.com/ldgenx-echange/decouverte',
  english: 'https://www.ldgenx.com/',
  linkedin: 'https://www.linkedin.com/company/ldgenx/',
};

export const copy = {
  navigation: {
    services: 'Expertises',
    applications: 'Applications',
    studies: 'Études de cas',
    innovation: 'Innovation',
    about: 'À propos',
    resources: 'Ressources',
    contact: 'Demander un devis',
  },
  home: {
    eyebrow: 'ADN environnemental · Génomique · Bioinformatique',
    intro:
      'ADN environnemental, génomique des populations, microbiomes et bioinformatique : nous concevons et réalisons vos analyses, du prélèvement à l’interprétation, pour la biodiversité, l’aquaculture, l’agriculture et les études d’impact.',
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
  source: string;
}

export const services: Expertise[] = [
  {
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
        text: 'Inventorier la biodiversité par l’analyse de marqueurs génétiques ciblés, notamment 12S, COI, 18S ou ITS.',
      },
      {
        title: 'Métagénomique',
        text: 'Étudier les communautés biologiques à travers une approche globale des données génétiques.',
      },
      {
        title: 'dPCR ciblée',
        text: 'Mobiliser la PCR digitale pour la détection et la quantification d’une cible définie.',
      },
      {
        title: 'Séquençage longue lecture',
        text: 'Explorer les possibilités des longues lectures dans l’analyse de l’ADN environnemental.',
      },
    ],
    uses: [
      'Inventaires de biodiversité',
      'Suivi d’espèces d’intérêt',
      'Études d’impact',
      'Surveillance des milieux aquatiques',
    ],
    sectors: [
      'biodiversite-conservation',
      'environnement-bureaux-d-etudes',
      'energies-marines-renouvelables',
    ],
    delivery:
      'De l’échantillonnage à la bioinformatique, les analyses sont reliées à votre objectif. La restitution et le niveau d’accompagnement sont définis avec l’équipe scientifique au cadrage du projet.',
    source: 'https://www.ldgenx.fr/services/adn-environnemental-adne',
  },
  {
    slug: 'genomique-des-populations',
    title: 'Génomique des populations',
    short: 'Comprendre la diversité, la connectivité et l’adaptation.',
    scope: 'Caractériser la diversité génétique, la connectivité et l’adaptation des populations.',
    image: 'populations',
    headline: 'Comprendre les populations. Éclairer leur avenir.',
    intro:
      'La génomique des populations apporte un éclairage sur la diversité génétique, la structure, la connectivité et l’adaptation. LDgenX développe des approches adaptées aux enjeux de conservation et de gestion des populations.',
    need: 'Comment les populations se différencient-elles ? Quels échanges les relient ? Comment étudier leur diversité ? Votre question de gestion ou de recherche détermine le choix des outils génomiques.',
    approaches: [
      {
        title: 'Génome partiel · 3D-GBS',
        text: 'Étudier les marqueurs répartis dans le génome pour caractériser la diversité et la structure des populations.',
      },
      {
        title: 'Génome entier · WGS',
        text: 'Mobiliser le séquençage de génomes entiers pour l’étude des variants et de l’adaptation.',
      },
      {
        title: 'Panels SNP',
        text: 'Développer des panels adaptés au suivi génétique, à l’assignation et aux analyses de parenté.',
      },
      {
        title: 'Marqueurs génétiques',
        text: 'Identifier des SNP, des indels et d’autres variants en lien avec les objectifs scientifiques.',
      },
    ],
    uses: [
      'Diversité génétique',
      'Connectivité des populations',
      'Assignation des individus',
      'Conservation et gestion',
    ],
    sectors: ['biodiversite-conservation', 'aquaculture-peche', 'recherche-publique-privee'],
    delivery:
      'L’interprétation associe les données génétiques au contexte des populations étudiées. Les questions biologiques, les échantillons disponibles et les informations de terrain servent de fil conducteur.',
    source: 'https://www.ldgenx.fr/services/genomique-des-populations',
  },
  {
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
    uses: [
      'Microbiomes des sols',
      'Communautés aquatiques',
      'Microbiologie environnementale',
      'Recherche sur les microplastiques',
    ],
    sectors: ['agriculture-agroecologie', 'aquaculture-peche', 'environnement-bureaux-d-etudes'],
    delivery:
      'L’équipe accompagne la préparation du projet, les analyses moléculaires et l’interprétation bioinformatique. La question biologique reste au centre de la lecture des données.',
    source: 'https://www.ldgenx.fr/services/analyse-des-communautes-microbiennes',
  },
  {
    slug: 'selection-genomique',
    title: 'Sélection génomique',
    short: 'Intégrer l’information génétique dans vos programmes.',
    scope: 'Développer des outils d’aide à la sélection pour les filières agricoles et aquacoles.',
    image: 'bar-europeen',
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
      'Programmes aquacoles',
      'Gestion des géniteurs',
      'Sélection assistée par marqueurs',
      'Développement variétal',
    ],
    sectors: ['aquaculture-peche', 'agriculture-agroecologie', 'recherche-publique-privee'],
    delivery:
      'La construction du projet tient compte des données disponibles et des objectifs de la filière. Les outils et les analyses sont discutés avec votre équipe avant leur mise en œuvre.',
    source: 'https://www.ldgenx.fr/services/selection',
  },
  {
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
    uses: [
      'Traitement de données génomiques',
      'Développement de pipelines',
      'Recherche publique et privée',
      'Interprétation biologique',
    ],
    sectors: ['recherche-publique-privee', 'biodiversite-conservation', 'agriculture-agroecologie'],
    delivery:
      'Notre équipe met en relation les analyses informatiques et les questions du vivant. Le périmètre, les données d’entrée et les modalités de restitution sont précisés ensemble.',
    source: 'https://www.ldgenx.fr/services/bioinformatique',
  },
  {
    slug: 'sequencage-dpcr',
    title: 'Séquençage & dPCR',
    short: 'Lire l’ADN. Détecter les cibles qui vous intéressent.',
    scope:
      'Amplicons, courts et longs fragments, génomes entiers ou partiels, détection d’espèces cibles ou de variants.',
    image: 'sequencage',
    headline: 'La technologie adaptée à votre question scientifique.',
    intro:
      'LDgenX accompagne les projets qui mobilisent le séquençage, la PCR digitale et les analyses bioinformatiques. Les approches vont des marqueurs ciblés à l’étude de génomes entiers.',
    need: 'Séquençage d’amplicons, longues lectures ou détection ciblée : le choix de la technologie doit être relié aux échantillons et à l’information que vous cherchez à obtenir.',
    approaches: [
      {
        title: 'Amplicons',
        text: 'Séquençage de 16S, ITS, COI, 12S, 18S et de marqueurs personnalisés.',
      },
      {
        title: 'Longues lectures',
        text: 'Approches de séquençage longue lecture, notamment Oxford Nanopore.',
      },
      {
        title: 'WGS, RADseq et SNP',
        text: 'Séquençage de génomes et analyses de génomique des populations.',
      },
      { title: 'PCR digitale', text: 'Mise au point et analyses de détection de cibles par dPCR.' },
    ],
    uses: [
      'Génomique et métagénomique',
      'Détection d’espèces cibles',
      'Épigénétique',
      'Développement moléculaire',
    ],
    sectors: ['recherche-publique-privee', 'environnement-bureaux-d-etudes', 'aquaculture-peche'],
    delivery:
      'L’accompagnement peut relier la biologie moléculaire, le séquençage et la bioinformatique. L’approche et la restitution sont définies à partir de vos objectifs.',
    source: 'https://www.ldgenx.fr/services/sequencage-dpcr',
  },
  {
    slug: 'recherche-developpement',
    title: 'Recherche & Développement',
    short: 'Construire les approches scientifiques de demain.',
    scope:
      'Réponses aux appels à projets, accompagnement et conseil pour vos projets de recherche.',
    image: 'innovation',
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
    source: 'https://www.ldgenx.fr/a-propos/innovation',
  },
  {
    slug: 'materiel',
    title: 'Matériel d’échantillonnage',
    short: 'Préparer le terrain pour vos analyses.',
    scope: 'Pompe triple, stick pump et torpille tractée pour filtrer l’eau sur le terrain.',
    image: 'materiel-pompe',
    headline: 'Une analyse commence par un échantillon.',
    intro:
      'Le matériel d’échantillonnage fait partie des services proposés par LDgenX. Échangez avec l’équipe pour préciser le besoin de prélèvement associé à votre projet d’analyse.',
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
      'Pour connaître le matériel disponible et sa compatibilité avec votre projet, contactez LDgenX. Les références, disponibilités et conditions sont à préciser directement avec l’équipe.',
    source: 'https://www.ldgenx.fr/',
  },
];

export interface Sector {
  slug: string;
  title: string;
  /** Uses listed on the official application pages. */
  scope: string;
  image: string;
  headline: string;
  intro: string;
  needs: { title: string; text: string }[];
  services: string[];
  source: string;
}
export const applications: Sector[] = [
  {
    slug: 'biodiversite-conservation',
    title: 'Biodiversité & Conservation',
    scope: 'Espèces protégées et invasives, diversité génétique, connectivité, réintroductions.',
    image: 'biodiversite',
    headline: 'Mieux connaître le vivant pour mieux le préserver.',
    intro:
      'Suivre les espèces, comprendre les populations, orienter les actions de conservation : les gestionnaires d’espaces naturels, collectivités et associations ont besoin d’informations sur le vivant.',
    needs: [
      {
        title: 'Suivre les espèces',
        text: 'Détection et suivi d’espèces protégées, menacées ou invasives, en lien avec les objectifs de conservation.',
      },
      {
        title: 'Comprendre les populations',
        text: 'Étude de la diversité génétique, de la consanguinité, de l’hybridation et de la connectivité.',
      },
      {
        title: 'Accompagner la gestion',
        text: 'Informations génomiques pour les projets de réintroduction, de restauration écologique et les plans d’action.',
      },
    ],
    services: ['adn-environnemental-adne', 'genomique-des-populations', 'bioinformatique'],
    source: 'https://www.ldgenx.fr/applications/biodiversite-conservation',
  },
  {
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
    services: ['selection-genomique', 'genomique-des-populations', 'sequencage-dpcr'],
    source: 'https://www.ldgenx.fr/applications/aquaculture-peche',
  },
  {
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
      'analyse-des-communautes-microbiennes',
      'selection-genomique',
      'adn-environnemental-adne',
    ],
    source: 'https://www.ldgenx.fr/applications/agriculture-agroecologie',
  },
  {
    slug: 'environnement-bureaux-d-etudes',
    title: 'Environnement & Bureaux d’études',
    scope: 'Études d’impact, état initial des sites, détection d’espèces protégées ou invasives.',
    image: 'environnement',
    headline: 'Des données pour éclairer vos études d’impact.',
    intro:
      'État initial, inventaires, suivi de la biodiversité, espèces protégées, compensation écologique : vos projets d’aménagement nécessitent une connaissance des milieux.',
    needs: [
      {
        title: 'Documenter l’état initial',
        text: 'Inventaires de biodiversité et caractérisation des écosystèmes dans le cadre des études d’impact.',
      },
      {
        title: 'Construire le suivi',
        text: 'Surveillance environnementale et suivi des espèces d’intérêt dans le temps.',
      },
      {
        title: 'Éclairer l’aménagement',
        text: 'Accompagnement des collectivités, aménageurs et bureaux d’études, y compris pour les énergies renouvelables.',
      },
    ],
    services: ['adn-environnemental-adne', 'sequencage-dpcr', 'bioinformatique', 'materiel'],
    source: 'https://www.ldgenx.fr/applications/environnement-bureaux-d-etudes',
  },
  {
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
    source: 'https://www.ldgenx.fr/a-propos/innovation',
  },
  {
    slug: 'energies-marines-renouvelables',
    title: 'Énergies marines renouvelables',
    scope: 'Biodiversité des parcs éoliens offshore, par ADN environnemental.',
    image: 'eolien-offshore',
    headline: 'Connaître la biodiversité qui accompagne vos projets.',
    intro:
      'Les projets marins et l’éolien offshore soulèvent des questions sur l’état initial et le suivi des écosystèmes. Les approches par ADN environnemental constituent un axe de travail présenté par LDgenX.',
    needs: [
      {
        title: 'Établir la connaissance',
        text: 'Étudier la biodiversité marine autour des sites concernés par les projets.',
      },
      {
        title: 'Organiser la surveillance',
        text: 'Définir une question de suivi et une approche d’échantillonnage cohérente.',
      },
      {
        title: 'Interpréter dans le contexte',
        text: 'Relier les analyses aux enjeux environnementaux du site et à vos études.',
      },
    ],
    services: ['adn-environnemental-adne', 'bioinformatique', 'materiel'],
    source: 'https://www.ldgenx.fr/applications/environnement-bureaux-d-etudes',
  },
];

export const studies = [
  {
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
      'L’Agence de l’eau Artois-Picardie a commandé une étude de la biodiversité des poissons dans les ports et les estuaires de sa façade maritime.',
    question:
      'Comment améliorer la connaissance de l’ichtyofaune et comparer l’ADNe aux méthodes classiques d’acquisition de données ?',
    approach:
      'L’étude a été réalisée par le groupement Qualyse, LDgenX et Prelevmar. Des échantillons d’eau prélevés sur le terrain ont été analysés par ADN environnemental.',
    result:
      'L’étude apporte des données sur la répartition des espèces et nourrit la réflexion sur l’usage de l’ADNe pour la surveillance des milieux aquatiques. La publication souligne aussi les contraintes des environnements marins et estuariens : courants, turbidité et marées.',
    service: 'adn-environnemental-adne',
    source:
      'https://www.eau-artois-picardie.fr/etude-de-la-biodiversite-de-lichtyofaune-dans-les-estuaires-et-les-ports-avec-ladn-environnemental',
  },
  {
    slug: 'bar-europeen-panel-snp',
    title: 'Des outils génétiques pour le bar européen.',
    category: 'Sélection génomique',
    image: 'bar-europeen',
    subtitle:
      'Développement d’un panel SNP : un sujet présenté dans les références scientifiques de LDgenX.',
    facts: [
      { label: 'Espèce', value: 'Bar européen' },
      { label: 'Filière', value: 'Aquaculture' },
      { label: 'Approche', value: 'Développement d’un panel SNP' },
    ],
    context: 'Le bar européen figure parmi les sujets de sélection génomique présentés par LDgenX.',
    question:
      'Comment intégrer les marqueurs génétiques aux questions de sélection dans les filières aquacoles ?',
    approach:
      'La page officielle de sélection présente le développement de panels SNP. Les travaux scientifiques associés abordent les relations entre les données génétiques et les caractères d’intérêt.',
    result: '',
    service: 'selection-genomique',
    source: 'https://www.ldgenx.fr/services/selection',
  },
  {
    slug: 'biodiversite-eolien-offshore',
    title: 'Explorer la biodiversité des parcs éoliens offshore.',
    category: 'Biodiversité marine',
    image: 'eolien-offshore',
    subtitle: 'Un champ d’application de l’ADN environnemental présenté par LDgenX.',
    facts: [
      { label: 'Contexte', value: 'Parcs éoliens offshore' },
      { label: 'Milieu', value: 'Biodiversité marine' },
      { label: 'Approche', value: 'ADN environnemental' },
    ],
    context:
      'La biodiversité des parcs éoliens offshore est citée dans les cas d’étude de la page officielle consacrée à l’ADNe.',
    question:
      'Comment documenter la biodiversité marine dans le contexte des projets d’énergies renouvelables ?',
    approach:
      'LDgenX présente l’ADN environnemental comme une approche de connaissance et de suivi des milieux. Le périmètre d’une étude se définit selon la question et le site.',
    result: '',
    service: 'adn-environnemental-adne',
    source: 'https://www.ldgenx.fr/services/adn-environnemental-adne',
  },
  {
    slug: 'communautes-microplastiques',
    title: 'Les communautés microbiennes des microplastiques.',
    category: 'Microbiologie',
    image: 'microplastiques',
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
// publication (see `studies[0].source`); the steps follow its own wording.
export const featuredStudy = {
  slug: 'ichtyofaune-artois-picardie',
  client: 'Agence de l’eau Artois-Picardie',
  team: 'Groupement Qualyse, LDgenX et Prelevmar',
  steps: [
    {
      title: 'Prélever',
      text: 'Des échantillons d’eau sont prélevés sur le terrain, dans les ports et les estuaires de la façade maritime.',
    },
    {
      title: 'Analyser',
      text: 'Les échantillons sont analysés par ADN environnemental, pour améliorer la connaissance de l’ichtyofaune.',
    },
    {
      title: 'Comparer',
      text: 'L’étude met l’ADNe en regard des méthodes classiques d’acquisition de données.',
    },
  ],
  outcome:
    'Des données sur la répartition des espèces, et une réflexion nourrie sur l’usage de l’ADNe pour la surveillance des milieux aquatiques.',
  constraintsLabel: 'Contraintes du milieu soulignées par la publication',
  constraints: ['Courants', 'Turbidité', 'Marées'],
  sourceLabel: 'La publication de l’Agence de l’eau',
};

export const innovations = [
  {
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

export const team = [
  {
    name: 'Dr Maeva Leitwein',
    role: 'Cofondatrice · Génomique des populations',
    initials: 'ML',
    photo: 'portrait-maeva',
    bio: 'Spécialisée en génomique et en épigénomique, Maeva étudie la diversité, l’adaptation et les interactions entre populations naturelles et domestiques. Elle met son expérience de recherche au service des questions de conservation et de gestion.',
  },
  {
    name: 'Dr Emilie Delpuech',
    role: 'Cofondatrice · Bioinformatique',
    initials: 'ED',
    photo: 'portrait-emilie',
    bio: 'À la croisée des sciences du vivant et de l’informatique, Emilie développe des approches d’analyse de données omiques. Son parcours en génétique animale et en sélection génomique nourrit les analyses spécifiques aux projets.',
  },
  {
    name: 'Maxime Lambert',
    role: 'Ingénieur laboratoire · Biologie moléculaire',
    initials: 'ML',
    photo: 'portrait-maxime',
    bio: 'Maxime apporte son expertise en extraction d’acides nucléiques, préparation de banques et séquençage longue lecture. Il conçoit et adapte les approches expérimentales aux questions scientifiques.',
  },
];

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
    slug: 'comprendre-adn-environnemental',
    title: 'L’ADN environnemental : lire les traces du vivant.',
    category: 'ADN environnemental',
    image: 'biodiversite',
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
    service: 'selection-genomique',
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

// The locale is an explicit content boundary. Add an English catalog and verified
// reciprocal page mappings before enabling local English routes or hreflang=en.
export const catalogs = {
  fr: {
    copy,
    pageCopy,
    formCopy,
    visualCopy,
    services,
    applications,
    resources,
    studies,
    team,
    innovations,
    partners,
    workflow,
    projectPractice,
    faq,
  },
};
export type Locale = keyof typeof catalogs;
