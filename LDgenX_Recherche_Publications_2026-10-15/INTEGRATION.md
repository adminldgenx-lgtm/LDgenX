# Intégration dans la plateforme LDgenX

## Rôle de la nouvelle page

La page « Recherche & publications » rend visibles les travaux scientifiques de l’équipe et donne un accès fiable aux articles. Elle soutient les expertises, avec leurs preuves et leurs limites. Les études de cas commerciales et les projets R&D gardent leurs propres contenus et leur statut.

Le chemin `/recherche` est une proposition. L’adapter à l’arborescence réelle, aux routes déjà créées et à la stratégie FR/EN du projet. Conserver les pages et accès individuels de l’équipe; une ancienne URL de publications ne doit pas être redirigée vers une page générique sans accès clair aux références de la personne.

## Organisation visuelle proposée

### Introduction

Un titre typographique affirmé, un texte court sur la recherche de l’équipe et des accès vers les thèmes. Réutiliser les couleurs, les composants, les transitions et la grille du nouveau site. La page privilégie la lecture et la recherche; elle peut vivre sans nouvelle scène 3D.

Ne pas afficher un chiffre de « publications de LDgenX » à partir de ce pack. La collecte porte sur 15 références déjà présentes sur le site et ne prouve pas une bibliographie exhaustive ou une attribution à la société seule.

### Trois entrées thématiques

| Entrée | Publication conseillée | Représentation possible |
|---|---|---|
| Conservation de la biodiversité | P08 — Ressource SNP de la truite | Du génome au panel de marqueurs, avec une figure originale autorisée et sa légende |
| Aquaculture | P13 — Résistance à la VNN du bar européen | Espèce, recherche de régions associées, gènes candidats, portée et limites pour la sélection |
| Agriculture et sélection | P14 — Efficacité alimentaire du porc | Comprendre une association génomique et l’influence de la structure des populations |

Les représentations qualitatives sont des illustrations. La sélection d’un thème peut mettre en évidence les articles associés et leurs liens vers les expertises. Une carte ne doit contenir que les lieux effectivement documentés par l’article choisi.

### Catalogue scientifique

Recherche par titre, espèce ou auteur; filtres par membre de l’équipe, thème et année. Une carte contient : titre final original, titre de lecture français facultatif, auteurs, revue, année du fascicule et bouton vers le DOI. Une mention distincte explique si le texte local est un préprint.

Le titre de lecture français n’est pas le titre bibliographique de la revue. Ne pas lui substituer le titre officiel dans une citation.

### Développement d’un article

Pour les contenus réellement développés, utiliser une page ou un panneau accessible avec : la question, le système étudié, la méthode, les résultats documentés, ce que cela apporte et les limites. Les fiches sont une base concise; toute extension doit être vérifiée dans les sources indiquées. Éviter quinze pages répétitives qui n’ajoutent que quelques phrases identiques.

Les figures peuvent être agrandies et leurs légendes consultées. Les interactions utiles incluent un sélecteur de figure ou d’échelle et un lien vers l’expertise correspondante. Les fichiers raster ne deviennent pas des jeux de données simplement parce qu’ils sont animés.

## Modèle de contenu

`data/publications.json` est la source structurée préparée pour l’import. Chaque entrée possède notamment :

- Identifiant stable `P01` à `P15`, titre et auteurs de la version publiée.
- DOI, PMID/PMCID, revue, année et dates de publication séparées.
- Membre de l’équipe, thèmes et expertises associées.
- Résumé français, question, méthode, apport, limite et idée de représentation.
- Statut de l’article et version du document récupéré, séparés.
- Fichiers sources locaux et provenance, figures et licences.

La base de preuve de la synthèse est explicitée : le résumé de l’article final. Les textes intégraux disponibles permettent d’étendre l’analyse, sans prétendre que toutes les annexes et tous les jeux de données ont déjà été examinés.

## Figures et données

Les 46 fichiers de figures sont des originaux téléchargés; ils ne sont ni agrandis, ni recolorisés, ni redessinés. Les légendes originales et les attributions sont dans `data/figures.json` et `figure-index.csv`.

Le statut `cc_by_with_attribution_check_credit_line` indique qu’une licence CC BY est présente dans l’article : conserver les auteurs, la source et la licence, et vérifier une éventuelle exclusion de contenu tiers. `reference_only_permission_or_credit_review` impose de conserver le fichier comme source de consultation tant qu’une autorisation adaptée n’est pas établie.

La publication P01 est sous CC BY-NC. La revue P06 et les trois préprints récupérés portent également des restrictions de réutilisation. Ne pas employer leurs figures comme visuels commerciaux automatiques; une nouvelle illustration originale peut expliquer des faits ou principes sans copier leur composition graphique.

Pour un vrai graphique interactif, identifier le fichier numérique, les variables, unités, populations, cohortes, normalisations et incertitudes. Les liens de dépôts et de code repérés dans `data/linked-resources.json` constituent des pistes à vérifier; aucun jeu de données complet n’a été téléchargé ici. Les compléter avec les tableaux validés des auteurs si nécessaire.

## Corrections et attribution

- P02 est un article publié dans *Evolution*, fascicule 2023, mis en ligne en 2022; le préprint récupéré reste une version antérieure.
- P13 possède un article final de 2023; utiliser le titre final avec IFI6/IFI27-like et son DOI final.
- P04, P11 et P12 ont des titres finaux différents des formulations de l’ancien site.
- P06 est une revue de littérature dans un fascicule de 2020; conserver séparément la mise en ligne antérieure.
- P08 conserve l’ordre des auteurs et la contribution égale de Saint-Pé et Leitwein indiquée dans la source.
- Ne pas reprendre les facteurs d’impact anciens comme des mesures actuelles.
- Une signature d’un membre de l’équipe ne prouve pas que le projet a été conduit commercialement par LDgenX.

## Liens dans le site

Relier les pages d’expertise aux publications appropriées, puis chaque article à l’expertise : génomique des populations, bioinformatique, sélection, séquençage. Le lien vers une rubrique « Séquençage & dPCR » n’implique pas que l’article a utilisé la dPCR; toujours conserver son protocole réel.

La page d’équipe peut proposer « Voir ses publications » avec un filtre présélectionné. Les projets DNA EcoTrace et eDNAClock restent présentés comme R&D tant que les sources ne fournissent pas leur validation propre. L’étude Artois-Picardie reste une étude de cas distincte avec ses rapports, méthodes et résultats.

Le membre ajouté, Damien Crestel, peut être intégré à l’équipe à partir des éléments fournis par le client; ce pack ne contient pas sa bibliographie et ne lui attribue aucun de ces articles par défaut.

## Mise en œuvre et vérification

Adapter les données au modèle existant, sans réécrire le site ni ajouter de CMS par défaut. Les sources volumineuses restent hors du bundle et du répertoire public; copier uniquement les figures sélectionnées et les documents dont la diffusion convient.

Prévoir des titres SEO descriptifs, des liens DOI fonctionnels, des métadonnées exactes, des URL canoniques et une version linguistique cohérente avec le projet. Si des données structurées `ScholarlyArticle` sont ajoutées, elles doivent correspondre au contenu visible et aux vrais auteurs, dates et identifiants; ne promettre aucun enrichissement garanti dans Google.

Vérifier installation propre et build si le projet est Node, routes et liens internes, clavier, responsive, contrastes et mouvement réduit. Les animations doivent faciliter la compréhension et rester légères; le contenu bibliographique demeure lisible sans animation.
