// Reference pages (questions fréquentes, glossaire, plan du site), the research tax credit and
// the sampling kits. Answers restate what LDgenX publishes on this site and what the client
// confirmed (CIR approval, kits by environment, October 2026); definitions are general
// scientific knowledge, written for a non-specialist reader. The English version has the same
// shape (knowledge.en.ts).
import type { InternalLink } from './types';

export interface FaqItem {
  question: string;
  answer: string;
  link?: { to: InternalLink; label: string };
}
export interface GlossaryTerm {
  id: string;
  term: string;
  /** Other names or the abbreviation, as readers may search for them. */
  also?: string;
  definition: string;
  link?: { to: InternalLink; label: string };
}

export const knowledge = {
  faq: {
    eyebrow: 'Questions fréquentes',
    title: 'Vos questions sur l’ADN\net la génomique appliquée.',
    intro:
      'ADN environnemental, tests d’espèces, génomique des populations, prélèvements et crédit d’impôt recherche : les réponses aux questions que l’on nous pose le plus souvent.',
    groups: [
      {
        title: 'L’ADN environnemental',
        items: [
          {
            question: 'Qu’est-ce que l’ADN environnemental (ADNe) ?',
            answer:
              'L’ADN environnemental désigne les traces d’ADN que les organismes laissent dans leur milieu : cellules, mucus, excréments ou gamètes. Prélevées dans l’eau, les sols, les sédiments ou les biofilms, ces traces permettent d’identifier les espèces présentes sans les capturer ni les observer directement.',
            link: {
              to: { kind: 'service', id: 'adn-environnemental-adne' },
              label: 'L’expertise ADN environnemental',
            },
          },
          {
            question: 'L’ADNe remplace-t-il les inventaires naturalistes ?',
            answer:
              'Non. L’ADNe révèle la présence d’ADN d’une espèce dans un échantillon ; il complète les inventaires naturalistes et l’expertise écologique sans les remplacer, et n’indique pas directement l’effectif d’une population.',
          },
          {
            question: 'Quelle différence entre métabarcoding et dPCR ?',
            answer:
              'Le métabarcoding inventorie de nombreuses espèces à la fois, à partir de marqueurs génétiques (12S, COI, 18S, ITS…). La PCR digitale (dPCR) cible une seule espèce : elle détecte et quantifie son ADN grâce à des amorces et une sonde qui lui sont propres.',
            link: {
              to: { kind: 'service', id: 'tests-adn-cibles' },
              label: 'Les tests ADN ciblés',
            },
          },
          {
            question: 'La dPCR permet-elle de compter les individus ?',
            answer:
              'Non. La dPCR estime une quantité d’ADN cible, en nombre de copies. Cette mesure aide à comparer des échantillons ou des sites, mais ne compte pas directement les individus présents.',
          },
          {
            question: 'Quels milieux pouvez-vous analyser ?',
            answer:
              'L’eau de mer et l’eau douce, les sols, les sédiments et les biofilms. LDgenX propose des kits d’échantillonnage adaptés à chaque milieu, y compris pour l’air.',
            link: {
              to: { kind: 'service', id: 'materiel' },
              label: 'Le matériel et les kits d’échantillonnage',
            },
          },
        ],
      },
      {
        title: 'Vos projets',
        items: [
          {
            question: 'Faut-il déjà disposer d’échantillons pour vous contacter ?',
            answer:
              'Non. LDgenX intervient sur une étude complète, une étape d’analyse ou un développement spécifique. Le premier échange peut avoir lieu avant la campagne de terrain pour construire ensemble la stratégie d’échantillonnage.',
          },
          {
            question: 'Disposez-vous de tests pour une espèce précise ?',
            answer:
              'LDgenX dispose d’amorces et de sondes pour 21 espèces (mammifères, poissons, reptile et invertébrés) et conçoit des tests sur mesure pour de nouvelles cibles. Les matrices, les conditions d’utilisation et les performances sont évaluées selon le projet.',
            link: {
              to: { kind: 'service', id: 'tests-adn-cibles' },
              label: 'Voir les espèces cibles',
            },
          },
          {
            question: 'Pouvez-vous analyser des données de séquençage déjà produites ?',
            answer:
              'Oui. L’accompagnement bioinformatique couvre le traitement, l’analyse et l’interprétation de données existantes : métabarcoding, métagénomique, WGS, RADseq, RNAseq ou épigénétique.',
            link: {
              to: { kind: 'service', id: 'bioinformatique' },
              label: 'L’expertise bioinformatique',
            },
          },
          {
            question: 'Fournissez-vous le matériel de prélèvement ?',
            answer:
              'Oui. LDgenX prépare des kits d’échantillonnage selon le milieu (eau de mer, eau douce, sol, air) et propose du matériel de filtration de l’eau : pompe triple, stick pump et torpille. Leur composition se précise avec l’équipe selon votre protocole.',
          },
          {
            question: 'Intervenez-vous dans les études d’impact et la séquence ERC ?',
            answer:
              'LDgenX apporte des données ADN aux états initiaux, aux études d’impact et aux suivis, en appui des bureaux d’études et des maîtres d’ouvrage : stratégie d’échantillonnage, analyses et interprétation. Le dossier réglementaire et la définition des mesures relèvent du maître d’ouvrage.',
            link: {
              to: { kind: 'application', id: 'environnement-bureaux-d-etudes' },
              label: 'Les études environnementales',
            },
          },
          {
            question: 'Vos prestations sont-elles éligibles au crédit d’impôt recherche ?',
            answer:
              'Oui. LDgenX est agréée au titre du crédit d’impôt recherche (CIR) : les travaux de R&D que vous lui confiez entrent dans l’assiette de votre CIR, qui permet de récupérer 30 % de leur montant, dans les conditions et plafonds prévus par la réglementation.',
            link: {
              to: { kind: 'application', id: 'recherche-publique-privee' },
              label: 'La recherche publique et privée',
            },
          },
          {
            question: 'Comment le devis est-il établi ?',
            answer:
              'Le périmètre de la prestation, les modalités de restitution, le calendrier et le devis se précisent à partir de votre besoin, au cadrage du projet. Plus votre demande est précise, plus la proposition l’est aussi.',
          },
        ],
      },
      {
        title: 'L’entreprise',
        items: [
          {
            question: 'Où se trouve LDgenX ?',
            answer:
              'L’équipe est implantée à la station Ifremer de Palavas-les-Flots, près de Montpellier (Hérault, Occitanie). Ses études couvrent aussi d’autres régions, comme les ports et estuaires d’Artois-Picardie.',
          },
          {
            question: 'Qui compose l’équipe ?',
            answer:
              'Dr Maeva Leitwein et Dr Emilie Delpuech, cofondatrices, spécialisées en génomique des populations et en bioinformatique ; Maxime Lambert, ingénieur laboratoire en biologie moléculaire ; Dr Damien Crestel, bioinformaticien en génétique des populations et quantitative.',
          },
          {
            question: 'Les membres de l’équipe publient-ils leurs travaux ?',
            answer:
              'Oui. Ils cosignent des articles dans des revues scientifiques à comité de lecture, comme Molecular Ecology, Genetics Selection Evolution, Heredity ou Evolutionary Applications. Chaque article est présenté avec sa synthèse sur la page Recherche.',
          },
        ],
      },
    ] as { title: string; items: FaqItem[] }[],
  },
  glossary: {
    eyebrow: 'Glossaire',
    title: 'Les mots de la génomique,\nexpliqués simplement.',
    intro:
      'ADNe, métabarcoding, dPCR, SNP, GWAS : les termes que nous employons sur ce site, définis en quelques lignes.',
    filterLabel: 'Aller à la lettre',
    terms: [
      {
        id: 'adn-environnemental',
        term: 'ADN environnemental',
        also: 'ADNe, eDNA',
        definition:
          'Traces d’ADN laissées par les organismes dans leur milieu (cellules, mucus, excréments, gamètes). Analysées à partir d’un prélèvement d’eau, de sol, de sédiment ou de biofilm, elles permettent de détecter des espèces sans les capturer.',
        link: {
          to: { kind: 'service', id: 'adn-environnemental-adne' },
          label: 'ADN environnemental',
        },
      },
      {
        id: 'amorce-sonde',
        term: 'Amorces et sonde',
        definition:
          'Courts fragments d’ADN conçus pour une espèce : les deux amorces encadrent une région de son génome que la PCR copie, la sonde fluorescente reconnaît cette région. Leur spécificité évite de confondre la cible avec des espèces proches.',
        link: { to: { kind: 'service', id: 'tests-adn-cibles' }, label: 'Tests ADN ciblés' },
      },
      {
        id: 'asv',
        term: 'ASV',
        also: 'variant de séquence d’amplicon',
        definition:
          'Séquence unique retrouvée dans les données d’un métabarcoding, après correction des erreurs de séquençage. Chaque ASV est ensuite comparé à des bases de référence pour lui attribuer une espèce ou un groupe.',
      },
      {
        id: 'assignation-taxonomique',
        term: 'Assignation taxonomique',
        definition:
          'Étape bioinformatique qui attribue une espèce, un genre ou une famille à une séquence d’ADN, en la comparant à des bases de séquences de référence.',
      },
      {
        id: 'bioinformatique',
        term: 'Bioinformatique',
        definition:
          'Discipline qui traite et analyse les données biologiques, notamment les séquences d’ADN, à l’aide de programmes, de statistiques et de chaînes d’analyse reproductibles.',
        link: { to: { kind: 'service', id: 'bioinformatique' }, label: 'Bioinformatique' },
      },
      {
        id: 'cir',
        term: 'Crédit d’impôt recherche',
        also: 'CIR',
        definition:
          'Dispositif fiscal qui permet aux entreprises de récupérer une part de leurs dépenses de recherche et développement (30 % jusqu’à 100 millions d’euros). Les travaux confiés à un organisme agréé, comme LDgenX, entrent dans son assiette, dans les limites prévues par la loi.',
        link: {
          to: { kind: 'application', id: 'recherche-publique-privee' },
          label: 'Recherche publique & privée',
        },
      },
      {
        id: 'consanguinite',
        term: 'Consanguinité',
        also: 'Fis',
        definition:
          'Reproduction entre individus apparentés, qui réduit la diversité génétique d’une population. L’indice Fis mesure l’écart entre l’hétérozygotie observée et celle attendue : proche de 0, il décrit une population bien mélangée.',
      },
      {
        id: 'dpcr',
        term: 'PCR digitale',
        also: 'dPCR',
        definition:
          'Technique qui répartit un échantillon en milliers de partitions avant l’amplification : celles qui contiennent l’ADN cible émettent un signal, ce qui permet de détecter et de quantifier cet ADN en nombre de copies, sans courbe d’étalonnage.',
        link: { to: { kind: 'service', id: 'tests-adn-cibles' }, label: 'Tests ADN ciblés' },
      },
      {
        id: 'epigenetique',
        term: 'Épigénétique',
        also: 'méthylation de l’ADN',
        definition:
          'Ensemble des marques chimiques, comme la méthylation de l’ADN, qui modulent l’activité des gènes sans modifier leur séquence. Elles peuvent varier avec l’environnement ou l’âge.',
      },
      {
        id: 'genomique-des-populations',
        term: 'Génomique des populations',
        definition:
          'Étude de la variation génétique au sein des populations et entre elles, à l’échelle du génome : diversité, structure, connectivité, consanguinité et adaptation.',
        link: {
          to: { kind: 'service', id: 'genomique-des-populations' },
          label: 'Génomique des populations',
        },
      },
      {
        id: 'gbs',
        term: 'Génotypage par séquençage',
        also: 'GBS, 3D-GBS',
        definition:
          'Méthode qui séquence une fraction réduite du génome, découpée par des enzymes de restriction, pour génotyper des milliers de marqueurs SNP chez de nombreux individus à moindre coût. Le 3D-GBS combine trois enzymes.',
      },
      {
        id: 'gwas',
        term: 'GWAS',
        also: 'étude d’association pangénomique',
        definition:
          'Analyse qui teste, sur l’ensemble du génome, l’association entre des marqueurs génétiques et un caractère (croissance, résistance à une maladie, sexe…), pour repérer les régions qui le contrôlent.',
      },
      {
        id: 'heritabilite',
        term: 'Héritabilité',
        definition:
          'Part de la variation d’un caractère, dans une population, qui s’explique par des différences génétiques entre individus. Plus elle est élevée, plus la sélection peut faire progresser ce caractère.',
      },
      {
        id: 'introgression',
        term: 'Introgression',
        also: 'hybridation',
        definition:
          'Passage durable de gènes d’une population ou d’une espèce à une autre par hybridation, puis croisements en retour. Elle peut être suivie le long du génome grâce aux marqueurs génétiques.',
      },
      {
        id: 'marqueur-genetique',
        term: 'Marqueur génétique',
        also: '12S, COI, 16S, 18S, ITS',
        definition:
          'Région de l’ADN dont la variation permet d’identifier des espèces ou des individus. En métabarcoding, on utilise des gènes marqueurs : 12S pour les poissons, COI pour de nombreux animaux, 16S pour les bactéries, ITS pour les champignons.',
      },
      {
        id: 'metabarcoding',
        term: 'Métabarcoding',
        definition:
          'Inventaire de nombreuses espèces à partir d’un même échantillon : un marqueur génétique est amplifié puis séquencé, et chaque séquence est assignée à une espèce ou à un groupe.',
        link: {
          to: { kind: 'service', id: 'adn-environnemental-adne' },
          label: 'ADN environnemental',
        },
      },
      {
        id: 'metagenomique',
        term: 'Métagénomique',
        definition:
          'Séquençage de l’ensemble de l’ADN d’un échantillon, sans cibler un marqueur, pour décrire la composition et les fonctions potentielles des communautés qu’il contient.',
        link: {
          to: { kind: 'service', id: 'analyse-des-communautes-microbiennes' },
          label: 'Communautés microbiennes',
        },
      },
      {
        id: 'panel-snp',
        term: 'Panel SNP',
        definition:
          'Ensemble de quelques dizaines à quelques milliers de SNP choisis pour répondre à une question : assigner des individus, vérifier des parentés, suivre une population ou un programme de sélection.',
      },
      {
        id: 'qpcr',
        term: 'qPCR',
        also: 'PCR quantitative',
        definition:
          'Amplification d’une région d’ADN suivie en temps réel par fluorescence. Elle détecte une cible et estime sa quantité par comparaison avec une gamme d’étalonnage.',
      },
      {
        id: 'qtl',
        term: 'QTL',
        also: 'locus de caractère quantitatif',
        definition:
          'Région du génome associée à la variation d’un caractère mesurable, comme la résistance à une maladie. Un QTL guide la recherche des gènes candidats et peut être utilisé en sélection.',
      },
      {
        id: 'radseq',
        term: 'RADseq',
        definition:
          'Séquençage des fragments d’ADN situés autour de sites de restriction, répartis dans tout le génome. Il fournit des milliers de SNP pour la génomique des populations, sans séquencer le génome entier.',
      },
      {
        id: 'selection-genomique',
        term: 'Sélection génomique',
        definition:
          'Choix des reproducteurs à partir de valeurs génétiques prédites par des marqueurs couvrant le génome, calibrées sur une population de référence dont les caractères sont mesurés.',
        link: { to: { kind: 'service', id: 'selection' }, label: 'Sélection génomique' },
      },
      {
        id: 'sequence-erc',
        term: 'Séquence ERC',
        also: 'Éviter, Réduire, Compenser',
        definition:
          'Démarche qui organise la prise en compte de l’environnement dans les projets d’aménagement : éviter les impacts, réduire ceux qui ne peuvent l’être, compenser les impacts résiduels.',
        link: {
          to: { kind: 'application', id: 'environnement-bureaux-d-etudes' },
          label: 'Études environnementales',
        },
      },
      {
        id: 'sequencage-longue-lecture',
        term: 'Séquençage longue lecture',
        also: 'Nanopore',
        definition:
          'Séquençage de fragments d’ADN de plusieurs milliers de bases d’un seul tenant. Il améliore la résolution taxonomique et l’assemblage des génomes.',
      },
      {
        id: 'snp',
        term: 'SNP',
        also: 'polymorphisme d’un seul nucléotide',
        definition:
          'Position du génome où une seule base (A, C, G ou T) varie d’un individu à l’autre. Très nombreux, les SNP servent de marqueurs pour mesurer la diversité, la structure ou l’ascendance des populations.',
      },
      {
        id: 'wgs',
        term: 'WGS',
        also: 'séquençage du génome entier',
        definition:
          'Séquençage de la totalité du génome d’un individu, pour découvrir l’ensemble de ses variants et étudier l’adaptation, l’histoire ou l’architecture génétique des caractères.',
      },
    ] as GlossaryTerm[],
  },
  siteMap: {
    eyebrow: 'Plan du site',
    title: 'Toutes les pages\nde LDgenX.',
    intro:
      'Expertises, applications, études de cas, publications et ressources : l’ensemble du site, page par page.',
    groups: {
      main: 'L’essentiel',
      services: 'Expertises',
      applications: 'Applications',
      studies: 'Études de cas et travaux',
      research: 'Publications',
      company: 'L’entreprise',
      resources: 'Ressources',
      legal: 'Informations',
    },
  },
};

// The research tax credit: LDgenX holds the CIR approval (confirmed by the client, October 2026).
export const cir = {
  eyebrow: 'Crédit d’impôt recherche',
  value: '30 %',
  valueLabel: 'de vos travaux de R&D récupérés en crédit d’impôt',
  title: 'LDgenX est agréée CIR.',
  text: 'Les travaux de recherche et développement que vous nous confiez entrent dans l’assiette de votre crédit d’impôt recherche : vous récupérez 30 % de leur montant.',
  note: 'Dans les conditions et plafonds prévus par l’article 244 quater B du code général des impôts, pour les entreprises éligibles au CIR.',
  action: 'Parler de votre projet de R&D',
};

// Sampling kits by environment (confirmed by the client, October 2026). Their contents are agreed
// with the team for each protocol; no list of accessories is published.
export const samplingKits = {
  eyebrow: 'Kits d’échantillonnage',
  title: 'Un kit pour chaque milieu.',
  intro:
    'LDgenX prépare des kits d’échantillonnage adaptés au milieu étudié. Leur composition se précise avec l’équipe selon votre protocole et les analyses prévues.',
  kits: [
    {
      id: 'eau-de-mer',
      name: 'Eau de mer',
      text: 'Pour les prélèvements en mer, dans les ports et les estuaires.',
    },
    {
      id: 'eau-douce',
      name: 'Eau douce',
      text: 'Pour les rivières, les lacs, les étangs et les zones humides.',
    },
    { id: 'sol', name: 'Sol', text: 'Pour les sols agricoles, forestiers ou naturels.' },
    { id: 'air', name: 'Air', text: 'Pour capter l’ADN présent dans l’air ambiant.' },
  ],
  action: 'Demander un kit',
};
