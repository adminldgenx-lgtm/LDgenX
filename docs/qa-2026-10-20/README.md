# Vérifications et captures — 20 octobre 2026

Copie locale, Chrome automatisé sur le build de production servi en HTTP local. Aucun déploiement. Les dimensions sont des fenêtres de navigateur / émulations, pas des essais sur appareils physiques.

## Carte : avant / après

Les captures « avant » ont été faites sur l’état de travail initial, avant modification. Les tailles après correction augmentent d’environ 35 %, avec la même image, les mêmes coordonnées et les mêmes liens. Les six intitulés reçoivent le même traitement ; la présentation compacte conserve le comportement existant qui affiche le libellé actif et permet de choisir les autres secteurs.

| Format | Comparaison directe FR | Capture avant native | Capture après native |
| --- | --- | --- | --- |
| Ordinateur, 1440 × 1000 | [Avant / après](comparatif-atlas-1440.webp) | [Avant](atlas-before-fr-1440.webp) | [Après](atlas-after-fr-1440.webp) |
| Tablette, 768 × 1000 | [Avant / après](comparatif-atlas-768.webp) | [Avant](atlas-before-fr-768.webp) | [Après](atlas-after-fr-768.webp) |
| Téléphone, 390 × 1000 | [Avant / après](comparatif-atlas-390.webp) | [Avant](atlas-before-fr-390.webp) | [Après](atlas-after-fr-390.webp) |

Versions anglaises : [ordinateur avant](atlas-before-en-1440.webp) / [après](atlas-after-en-1440.webp), [tablette avant](atlas-before-en-768.webp) / [après](atlas-after-en-768.webp), [téléphone avant](atlas-before-en-390.webp) / [après](atlas-after-en-390.webp).

Zoom et formats intermédiaires : [1024 FR](atlas-focus-fr-1024-4.webp), [820 FR](atlas-focus-fr-820-4.webp), [390 EN](atlas-focus-en-390-4.webp), [320 EN avec crédit](atlas-focus-en-320-1.webp). Animation normale : [1440 FR](atlas-motion-fr-1440.webp), [1024 FR](atlas-motion-fr-1024.webp), [390 EN](atlas-motion-en-390.webp).

Les fichiers JSON conservent les tailles et résultats : [avant](atlas-before.json), [après](atlas-after.json), [géométrie](atlas-geometry.json), [incidents de placement](atlas-issues.json), [animation normale](atlas-motion-results.json). Le fichier d’incidents final est vide.

## Médias et cadrages

| Emplacement | Ordinateur | Téléphone |
| --- | --- | --- |
| Laboratoire / À propos | [1440](media-lab-1440.webp) | [390](media-lab-390.webp) |
| Communautés microbiennes | [1440](media-microbes-1440.webp) | [390](media-microbes-390.webp) |
| DNA EcoTrace | [1440](media-ecotrace-1440.webp) | [390](media-ecotrace-390.webp) |
| R&D | [1440](media-rd-1440.webp) | [390](media-rd-390.webp) |
| Agriculture | [1440](media-agriculture-1440.webp) | [390](media-agriculture-390.webp) |
| Recherche | [1440](media-research-1440.webp) | [390](media-research-390.webp) |
| Aquaculture | [1440](media-aquaculture-1440.webp) | [390](media-aquaculture-390.webp) |
| Catalogue matériel conservé | [1440](media-equipment-1440.webp) | [390](media-equipment-390.webp) |
| Conception, démarche | [1440](workflow-fr-1440-0.webp) | [390](workflow-fr-390-0.webp) |
| Séquençage, démarche | [1440](workflow-fr-1440-3.webp) | [390](workflow-fr-390-3.webp) |

Menus : [Expertises FR](menu-services-fr.webp), [Applications FR](menu-applications-fr.webp), [Services EN](menu-services-en.webp), [Applications EN](menu-applications-en.webp). Parcours ADN : [FR 1440](dna-fr-1440.webp), [FR 390](dna-fr-390.webp), [EN 1440](dna-en-1440.webp), [EN 390](dna-en-390.webp).

Aperçus sociaux : [laboratoire / Innovation](../../public/images/social-equipe-maxime.jpg), [aquaculture avec @UNIMA](../../public/images/social-selection-unima.jpg). La photo entière reste visible ; les pixels du matériel ne sont ni inventés ni agrandis.

Les [résultats de chargement des parcours](journey-results.json) complètent [l’inventaire initial des captures de pages](media-results.json). Les premiers relevés de pages entières contiennent des images différées non encore téléchargées : le contrôle ciblé suivant a parcouru les sept étapes et vérifié leur décodage. Ce sont des chargements différés attendus, pas des fichiers manquants.

## Contrôles exécutés

- `npm run build` : TypeScript, bundle client/serveur et pré-rendu des **81 routes**, **60 redirections** et d’une page 404.
- `npm run lint`, `npm run check:typography`, `npm run check:assays` et `git diff --check` : passent. Le catalogue conserve **22 entrées sources, 21 publiables**, une entrée en attente de confirmation taxonomique.
- `npm run check:html` : 81 documents, métadonnées uniques, titres, hiérarchie, JSON-LD, ponctuation, **5820 liens locaux** et **757 balises image** contrôlés.
- `node scripts/check-http.mjs http://127.0.0.1:4175` : 81 chargements directs, 60 réponses HTTP 301 et une vraie HTTP 404.
- `node scripts/check-equipment-media.mjs --report` : neuf anciens identifiants sans affectation active dans le HTML, les métadonnées et les bundles différés ; **136 balises sociales** contrôlées ; crédit UNIMA présent à chaque occurrence. [Routes et médias](active-media-routes.json).
- `scripts/check-atlas-browser.mjs` : **156 états FR/EN** (vue générale, six zooms et six retours), à **1440, 1024, 820, 768, 390 et 320 px**, mouvement réduit ; aucun libellé visible coupé ou superposé.
- `scripts/check-atlas-motion-browser.mjs` : six secteurs FR/EN à **1440, 1024 et 390 px** en animation normale ; boutons suivant/précédent, retour Échap, liaisons repère/libellé, animation des turbines et glissement tactile vérifiés. Aucun `pageerror`.
- `scripts/check-equipment-browser.mjs` : sept étapes de démarche et sept étapes ADN FR/EN à **1440 et 390 px**, sélecteur de démarche, décodage des images et tous les aperçus des menus desktop ; aucune requête vers les neuf anciens visuels ni `pageerror`.
- `scripts/check-assays-browser.mjs` : catalogue dPCR FR/EN à **1440, 768, 390 et 320 px** ; catégories, recherche, état vide, sélection, liens de contact, clavier et mouvement réduit passent.
- Vérification finale des crédits, de la console et du hero à 1440, 768 et 390 px en FR/EN : [résultats](final-visual-results.json). Le hero conserve son affiche en mouvement réduit et charge son film en animation normale.

Le comportement du site a été contrôlé dans Chrome local. Aucun test Safari/Firefox, appareil physique ou audit Lighthouse supplémentaire n’a été exécuté. Le débordement d’en-tête préexistant à 320 px, documenté le 17 octobre, reste hors de cette correction ; la carte et ses libellés restent dans leur largeur.

## Reproduire

Les scripts navigateur utilisent une installation existante de Playwright, sans dépendance ajoutée au site :

```sh
LDGENX_PLAYWRIGHT_MODULE=/chemin/vers/playwright/index.mjs node scripts/check-atlas-browser.mjs http://127.0.0.1:4175
LDGENX_PLAYWRIGHT_MODULE=/chemin/vers/playwright/index.mjs node scripts/check-atlas-motion-browser.mjs http://127.0.0.1:4175
LDGENX_PLAYWRIGHT_MODULE=/chemin/vers/playwright/index.mjs node scripts/check-equipment-browser.mjs http://127.0.0.1:4175
LDGENX_PLAYWRIGHT_MODULE=/chemin/vers/playwright/index.mjs node scripts/check-assays-browser.mjs http://127.0.0.1:4175
```

Les scripts produisent des PNG. Les captures livrées ici sont leurs versions WebP, sans changement de dimensions ; les trois planches comparatives sont réduites uniquement pour faciliter la comparaison côte à côte. Les PNG originaux ont été conservés dans le répertoire temporaire de travail.
