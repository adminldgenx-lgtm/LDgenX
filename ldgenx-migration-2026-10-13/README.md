# LDgenX — Pack de migration des contenus

Sources publiques collectées le 13 octobre 2026 : [site français](https://www.ldgenx.fr/) et [site anglais](https://www.ldgenx.com/).

Le pack contient 49 pages distinctes, leurs HTML et textes sources, les métadonnées, les liens, 147 images publiées, deux PDF Artois-Picardie originaux, les références scientifiques et les inventaires de migration.

Commencer par `CLAUDE_MIGRATION.md`, puis `INVENTAIRE.md` et `data/content.json`.

Les compilations `CONTENUS_FR.md` et `CONTENUS_EN.md` sont pratiques pour lire les textes. Les copies HTML originales restent la référence pour vérifier la structure ou corriger une ambiguïté d’extraction. Les fichiers de données conservent les URL sources, la langue et les chemins des images téléchargées.

`source/image-text-drafts/` contient de l’OCR non validé. Les prix vérifiés visuellement sont séparés dans `data/verified-image-price-transcriptions.json`; il faut confirmer leur actualité avant toute modification commerciale. Les graphiques scientifiques en images ne fournissent pas à eux seuls des tableaux de données fiables.

Les 13 liens de pages cassés sont listés dans `broken-links.csv`; les redirections proposées restent à vérifier et à implémenter dans le nouveau projet. Aucun site, domaine, compte, formulaire ou hébergement n’a été modifié par cette collecte.

Les scripts Python de collecte sont inclus pour rendre la méthode lisible et reproductible. Ils utilisent Python, lxml et Pillow; l’OCR utilise Tesseract et l’extraction des PDF utilise Poppler. Leur exécution n’est pas nécessaire pour importer les fichiers déjà collectés. Le fichier `checksums.sha256` permet de contrôler l’intégrité des fichiers du pack.
