# Validation du frontend

**Contrôle actuel — 26 octobre 2026 :** [contenus et préproduction](PRE-PROD-REVIEW-2026-10-26.md), [backend Supabase](qa-2026-10-26/README.md). Les sections ci-dessous conservent les résultats et limites des passes antérieures.

6 octobre 2026 — version locale de production, animations et parcours mobile améliorés, nettoyage éditorial demandé, puis refonte lisibilité / preuves / conversion.

## Refonte lisibilité, preuves et conversion

- Audit navigateur des 35 pages à 1440, 1024 et 390 px : aucun texte sous 12 px, aucun débordement horizontal, aucune erreur console.
- `check:html` vérifie en plus les espaces insécables de la ponctuation française sur chaque page ; `check:typography` vérifie les sources.
- Formulaire en mode envoi direct (endpoint fictif intercepté, aucune donnée transmise) : libellés et mention adaptés, huit champs envoyés, confirmation après réponse 2xx et réinitialisation, message d’erreur sur réponse 500, politique de confidentialité adaptée. Mode par défaut : « Préparer mon e-mail ».
- Lien « Voir la démarche en détail » : navigation vers `/services#demarche`, section positionnée sous l’en-tête fixe.
- FAQ : un seul élément ouvert à la fois.
- En-tête desktop vérifié à 1060 px avec le libellé « Demander un devis ».

## Vérifications réussies

- Installation reproductible depuis le lockfile : `npm ci`.
- TypeScript : `npm run typecheck` (également inclus dans le build).
- ESLint : `npm run lint`.
- Production : `npm run build` ; 35 pages HTML générées.
- HTML : `npm run check:html` ; un H1 par page, titres/descriptions uniques, canoniques et schémas JSON-LD valides, 2212 occurrences de liens locaux et 262 occurrences d’images vérifiées.
- HTTP : 35 URLs sans barre oblique finale servent leur propre document et leurs métadonnées ; 6 migrations répondent en 301 ; un chemin inconnu répond en 404.
- Navigateur : hydratation de production et navigation entre les pages ; aucun nouvel avertissement ou erreur dans la passe finale.
- Responsive : 320, 375, 768, 801, 1024, 1440 et 1920 px, sans débordement horizontal de la page d’accueil ni mots coupés dans les titres animés. Les 35 pages ont aussi été vérifiées à 320 px : un H1, aucun débordement horizontal, aucun mot masqué par le composant d’animation.
- Menu mobile : ouverture, dépliage des expertises, navigation et fermeture du dialogue.
- Méga-menu : affichage des huit expertises, navigation vers une prestation et mise à jour de la canonique et du titre.
- Ressources : filtre de catégorie, recherche et absence de résultats.
- Contact : blocage de la soumission vide sur les champs requis ; données de test valides acceptées par la validation native. Aucun message envoyé.
- Parcours scientifique : sélection par nom d’étape, étape active et image associée vérifiées. Le sélecteur mobile reste sous le header. Les anciens boutons numérotés et la ligne à pastilles ont été supprimés.
- Expertises mobile : l’ouverture de Bioinformatique ferme le premier aperçu, affiche la bonne image et donne accès à la page correspondante.
- Schémas : trois étapes terrain/laboratoire/connaissance sur desktop et quatre étapes du projet DNA EcoTrace en disposition verticale sur mobile, sans débordement.
- Animations : introduction, titres et images se stabilisent à leur position finale. Le hero mobile ne reçoit pas le déplacement de l’image réservé au desktop.
- Nettoyage graphique : les 35 pages ont été auditées à 320 px ; aucune ancienne numérotation, pastille de schéma, bulle de flèche, faux avatar ou ponctuation colorée décorative ne subsiste dans le DOM. Aucun débordement horizontal ni mot coupé dans les titres animés. Les informations numériques réelles, comme l’année des droits d’auteur et le code 404, sont conservées.

Les adaptations `prefers-reduced-motion` et les composants Motion utilisant le réglage utilisateur sont présentes dans le code. Aucune préférence système de l’utilisateur n’a été modifiée pour simuler ce réglage.

## Performances et limites

Images responsive WebP, chargement différé hors hero, dimensions explicites et fontes auto-hébergées. Les onze PNG sources totalisent environ 22 Mo ; toutes leurs versions responsive WebP totalisent environ 3 Mo. Les ressources CSS et JavaScript sont minifiées.

Cette validation ne constitue pas une mesure Lighthouse ni une garantie de Core Web Vitals. Les performances réelles dépendent de l’hébergement, de sa compression/cache et des appareils des visiteurs.

La publication du domaine officiel, la configuration de l’hébergeur et la validation des informations légales ne sont pas effectuées. Consulter `CONTENT-SOURCES.md` pour les contenus à confirmer.

## Aperçus

- `preview-desktop.png` : accueil à 1440 px (hero et faits clés).
- `preview-expertises.png` : explorateur des expertises.
- `preview-mobile.png` : accueil à 390 px.
- `preview-workflow.png` : démarche détaillée de la page Expertises.
- `preview-diagram.png` : chaîne scientifique de l’accueil, du terrain à la connaissance.
- `preview-mobile-workflow.png` : démarche détaillée et sélecteur mobile.
- `preview-mobile-diagram.png` : chaîne scientifique sur mobile.

## Reprise Canva — 17 octobre 2026

- Installation propre `npm ci --offline` depuis le lockfile dans `/tmp/ldgenx-clean-install`, puis build complet dans cette copie isolée avec les sources finales : réussis. Node 25.8.0, npm 11.11.0, Vite 7.3.6 ; aucune dépendance ajoutée et lockfile inchangé.
- `npm run lint`, `typecheck`, `check:typography`, `check:assays`, `build`, `check:html` : réussis. Le contrôle HTML couvre 81 pages, 5 820 liens locaux et 757 occurrences d’images ; H1, titres ordonnés, métadonnées, JSON-LD et typographie contrôlés.
- `node scripts/check-http.mjs http://127.0.0.1:4174` : 81 pages directes, 60 redirections HTTP 301 et une véritable réponse 404, réussis.
- `scripts/check-assays-browser.mjs` exécuté sur la production locale en FR et EN à 1440, 768, 390 et 320 px : noms comparés aux sources, 21 entrées, quatre filtres et leurs effectifs, recherche scientifique et française/anglaise sans accents, état vide, exclusion de l’entrée incertaine, sélection au clavier et par sélecteur mobile, liens contact, flèches/Début/Fin, animation réduite, dimensions du module : réussis. Aucun message d’erreur JavaScript.
- Crédit `@UNIMA` vérifié sur la nouvelle photo de sélection, dans le hero et dans l’expertise de l’accueil. Les photographies ont été contrôlées à 1440, 768 et 390 px. Les neuf sources extraites ont conservé leurs SHA-256 ; les variantes sont limitées à leur résolution exportée.
- Clavier : focus visible de 3 px, couleur `rgb(42, 116, 22)`, observé sur les filtres aux trois dimensions principales. La fiche est lisible sans animation.
- Régression en mouvement normal : vidéo du hero chargée, navigation jusqu’à la dernière étape ADN, sélection/clavier des expertises, photos associées et crédit, sélection des énergies renouvelables dans l’atlas (périmètre terrestre présent), navigation Artois-Picardie, pause et clavier dPCR : réussis. Catalogue de recherche toujours à 15 publications ; ouverture et fermeture par Échap vérifiées.
- Référence originale reproduite dans une copie isolée depuis Git pour comparaison aux captures prises au début. Hero, atlas et étude capturés sur desktop/mobile ; aucun changement de leurs données ou de leur composition normale. La correction locale du mode réduit de l’atlas supprime son recadrage d’entrée persistant après hydratation.
- Limite préexistante reproduite : à 320 px, l’en-tête peut porter la largeur du document à 349 px, avec les polices chargées. Les sections modifiées restent à 320 px ; pas de débordement à 390, 768 et 1440 px. Aucune correction globale de l’en-tête n’a été incluse.
- Aucun nouvel audit Lighthouse et aucun déploiement. Captures et rapports : [qa-2026-10-17/README.md](qa-2026-10-17/README.md). Sources et confirmation taxonomique restante : [CANVA-2026-10-17.md](CANVA-2026-10-17.md).

## Authenticité des équipements et carte Applications — 20 octobre 2026

Huit visuels d’équipement générés et l’infrastructure aquacole ne sont plus affectés aux pages, menus, cartes ou images de partage FR/EN. Photos documentées réutilisées ; cinq schémas neutres lorsque le dispositif exact n’est pas photographié. Catalogue conservé, variante de pompe non déduite. Carte : intitulés +35 % environ, graisse 500, contraste local et placement lié aux repères.

Build, lint, typographie, catalogue dPCR, contrôles HTML/HTTP et contrôle des neuf anciens médias passent. Chrome : 156 états de carte, zoom et déplacement tactile, parcours ADN/démarche, menus, dPCR, crédits et hero vérifiés. [Captures avant/après, résultats, commandes et limites](qa-2026-10-20/README.md) ; [bilan des remplacements, preuves et clichés manquants](audit-images-outils-2026-10-19/CORRECTIONS-2026-10-20.md). Aucun déploiement.
