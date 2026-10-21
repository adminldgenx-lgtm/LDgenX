# Captures de contrôle — 17 octobre 2026

Captures lossless WebP issues de Chromium, au format ordinateur (1440 px) et téléphone (390 px). Les vérifications ont aussi couvert 768 et 320 px. Certaines captures de section masquent temporairement l’en-tête fixe et la barre de lecture pour faciliter l’examen ; le site n’est pas modifié par ces styles de capture.

- `before-*` : captures prises avant les changements des zones concernées.
- `reference-*` : vues complémentaires du code Git d’origine, reproduit dans une copie isolée après la capture initiale.
- `final-*` : version finale ; le catalogue, les photos principales, le crédit et les contrôles conservés.
- `regression.json` : mesures comparées des largeurs et erreurs de page.
- `live-results.json` : contrôles du hero, ADN, expertises, atlas, Artois-Picardie et dPCR en mouvement normal.
- `final-results.json` : erreurs, focus visible et adresse de développement vérifiée.

Vues principales :

- [Catalogue sur ordinateur](final-catalog-1440.webp) et [sur téléphone](final-catalog-390.webp).
- [Module dPCR complet](final-assay-1440.webp) et [version téléphone](final-assay-390.webp).
- [Génomique des populations](final-population-1440.webp).
- [Bioinformatique](final-bioinformatics-1440.webp).
- [Sélection génomique avec crédit](final-selection-390.webp).
- [Aide à la décision](final-decision-1440.webp).

La différence de l’atlas en mouvement réduit est intentionnelle : l’état d’entrée en attente était conservé après hydratation et laissait le paysage recadré. Le correctif libère ce recadrage ; les données, la géométrie et l’animation normale restent inchangées. Le débordement de l’en-tête à 320 px est préexistant et ne vient pas du catalogue.

Compte rendu : [CANVA-2026-10-17.md](../CANVA-2026-10-17.md).

`pixel-comparison.json` consigne aussi la comparaison brute de quelques captures : elles ne sont pas identiques pixel à pixel entre la référence de développement et la production. Le contrôle porte sur la composition, les dimensions et le comportement, pas sur une promesse d’identité du rendu raster.
