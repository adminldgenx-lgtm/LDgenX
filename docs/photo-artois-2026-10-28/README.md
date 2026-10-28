# Photographie Artois-Picardie — 28 octobre 2026

## Demande et choix

Remplacer la photographie commune aux vignettes de l’étude Artois-Picardie et de l’étude en eau turbide. La cliente proposait une photographie librement réutilisable de la Slack ou de Boulogne ; le propriétaire a autorisé la recherche et l’intégration en conservant l’authenticité.

Photographie retenue : [La Slack à Ambleteuse](https://commons.wikimedia.org/wiki/File:Ambleteuse_slack.jpg), par [Velvet](https://commons.wikimedia.org/wiki/User:Velvet), datée du 10 mars 2014, sous [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). Elle illustre le milieu étudié ; elle n’est pas présentée comme une photographie de la campagne de prélèvements.

Original conservé dans `images/licensed/estuaire-slack.jpg` (3 500 × 1 386 px). Métadonnées de la source, licence, date de téléchargement et empreinte SHA-256 archivées dans [selected-photo.json](selected-photo.json). Empreinte de l’original : `678e24d7f16c098505b8006170927d04962d4bc5cd5c5823c55b5fbd220e7e25`.

Aucune génération d’image, retouche de scène ou modification des couleurs. Seuls le redimensionnement, l’encodage WebP/JPEG et le cadrage d’affichage des vignettes sont appliqués. Cinq variantes WebP (480, 640, 1 000, 1 536 et 2 048 px) et une carte de partage JPEG (1 200 × 630 px). Attribution, source, licence et adaptations indiquées dans les mentions légales FR/EN ; crédit également présent sous la photographie de la carte de partage. Les versions photographiques restent sous la même licence.

## Portée

- Vignette Artois-Picardie de la page ADNe, fiche de l’étude, liste des études, suggestions associées et aperçus de partage, en français et en anglais.
- Textes alternatifs décrivant la Slack à Ambleteuse.
- Photographie de l’étude en eau turbide conservée. Aucun changement aux résultats, dates scientifiques, cartes, stations ou figures des études.
- Registre des sources et scripts de préparation adaptés ; la génération ciblée de la carte de partage conserve les autres cartes existantes.

## Vérification

- Construction de production sous Node 22.23.4 ; TypeScript, ESLint et `git diff --check` réussis.
- Contrôles HTML : 151 pages, 22 266 liens internes, 1 057 références d’images.
- SEO : 147 pages indexables, aucune erreur ni avertissement. Contrôles de contenu, typographie et médias réussis.
- Recette des demandes clientes FR/EN réussie, avec assertions spécifiques vérifiant que les deux études ont des photos distinctes et que la vignette Artois-Picardie correspond à sa fiche.
- Chrome : 18 pages concernées × 4 largeurs (375, 390, 412, 1 440 px), soit 72 contrôles. Chargement des images, absence de débordement, erreurs d’exécution et violations CSP vérifiés. Résultats : [browser-results.json](browser-results.json).
- Inspection visuelle des vignettes mobiles/ordinateur, du crédit et de la carte de partage. Aperçu local : <http://127.0.0.1:4174/services/adn-environnemental-adne>.

Cette passe modifie le projet local et son build. Aucun déploiement du frontend ni changement du backend n’a été effectué.
