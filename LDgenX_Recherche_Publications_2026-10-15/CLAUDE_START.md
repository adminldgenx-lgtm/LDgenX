# Instruction à donner à Claude

Tu travailles dans notre plateforme LDgenX déjà développée. Le dossier `LDgenX_Recherche_Publications_2026-10-15` contient 15 publications scientifiques vérifiées, les sources accessibles, leurs figures et des fiches pour préparer une présentation claire et fidèle.

Lis d’abord `README.md`, `INTEGRATION.md`, `MANQUANTS.md` et `publications-index.csv`. Inspecte ensuite les instructions du dépôt et le code existant. Traite les publications une à une dans `fiches/`; ouvre leurs textes intégraux lorsque la rédaction ou l’interprétation l’exige. N’ingère pas tous les PDF et XML dans ton contexte en une fois.

Crée une page dédiée « Recherche & publications », accessible depuis le menu et les fiches de l’équipe. Conserve notre direction artistique, les animations et les pages existantes. Le catalogue doit afficher titre final, auteurs, revue, année, lien DOI et filtres par auteur et thème. Utilise les noms, dates et statuts vérifiés dans `data/publications.json`.

Présente trois entrées particulièrement lisibles pour les visiteurs : conservation et marqueurs de populations (P08), aquaculture et résistance virale (P13), sélection agricole (P14). Les autres publications restent entièrement accessibles dans le catalogue. Pour les développements détaillés, explique la question, l’approche, l’apport et les limites; garde les références scientifiques complètes.

Utilise les idées de représentation des fiches pour proposer des schémas pédagogiques sobres ou des interactions utiles. Une illustration doit être identifiée comme telle. Les véritables graphiques de résultats doivent conserver les données, unités, axes, légendes et périmètres d’origine. Aucun point, pourcentage, score, carte de prélèvements ou relation causale ne doit être inventé pour enrichir l’animation.

Pour les figures, utilise `data/figures.json` et `figure-index.csv`. Conserve la provenance et l’attribution. Les sources en consultation seule ou à licence restrictive ne doivent pas être copiées automatiquement vers les assets publics. Les articles dont seul un préprint est récupéré conservent une référence à l’article final et un lien distinct vers la version de prépublication.

Relie les publications aux pages d’expertise pertinentes. Présente-les comme des travaux coécrits par les membres de l’équipe avec leurs coauteurs et institutions. Ne les transforme pas en liste de contrats clients LDgenX. Distingue la bibliographie scientifique, les projets R&D et les études de cas appliquées, dont Artois-Picardie. Ces publications ne valident pas automatiquement DNA EcoTrace, eDNAClock ou une prestation ERC.

Préserve les changements de vocabulaire demandés pour le reste du site : « Études environnementales » et « Énergies renouvelables », incluant l’éolien terrestre, l’éolien en mer et le photovoltaïque. Ils ne changent pas les conclusions des articles.

Implémente les contenus et interactions vérifiables dans la version de développement, avec navigation clavier, mobile et mouvement réduit. Utilise l’architecture et les dépendances déjà présentes. Pour un projet Node, respecte le lockfile et les versions prévues, vérifie une installation propre et le build de production. Signale les sources ou décisions manquantes tout en terminant le travail indépendant de ces réponses.

Termine par un bilan : publications intégrées, corrections bibliographiques appliquées, liens vers les expertises, figures retenues avec leur attribution, contrôles exécutés et données encore nécessaires pour d’éventuels graphiques interactifs. Ne déploie pas la plateforme dans le cadre de cette migration locale.
