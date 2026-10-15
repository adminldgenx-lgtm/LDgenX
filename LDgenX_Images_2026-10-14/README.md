# LDgenX — Images des sites publics

Collecte vérifiée le 14 octobre 2026. Sources : [ldgenx.fr](https://www.ldgenx.fr/) et [ldgenx.com](https://www.ldgenx.com/).

## Utilisation

Ouvrir `INDEX.html` pour parcourir les aperçus, rechercher une personne ou une page et retrouver les sources. Tous les fichiers réutilisables sont dans `images/`.

- **168 images distinctes** conservées, pour 226 URL de fichiers téléchargées. Les doublons strictement identiques entre les deux langues sont enregistrés une seule fois.
- **65 URL de pages vérifiées**, dont 51 accessibles en HTTP 200; les autres sont listées dans `pages-checked.csv`.
- **2 URL d’image non récupérées** : voir `download-errors.csv`.
- Le nom d’origine est conservé après un préfixe de contrôle qui évite les collisions. Les octets d’origine, formats, transparences et résolutions sont inchangés. Aucun agrandissement ni image générée.

## Fichiers

- `images/` : photographies, portraits, logos, schémas, figures, cartes de prestations et éléments d’interface publiés.
- `INDEX.html` : catalogue visuel local, sans serveur ni dépendance externe.
- `image-index.csv` : un fichier par ligne, avec dimensions et provenance.
- `page-image-map.csv` : correspondance page d’origine → fichier local.
- `source-urls.csv` : toutes les URL de fichiers trouvées et leurs résultats de téléchargement.
- `manifest.json` : index complet pour Claude et les scripts, avec SHA-256, textes alternatifs et pages d’utilisation.
- `pages-checked.csv`, `download-errors.csv` : couverture et erreurs éventuelles.
- `checksums.sha256` : contrôle d’intégrité.

## Périmètre

Pages publiques des deux langues découvertes par les cartes de site courantes, les sitemaps, les liens internes et l’inventaire de migration précédent. Inspection des images HTML, sources responsives, galeries, métadonnées, icônes, styles intégrés et images référencées par les feuilles CSS liées. Les fichiers privés ou non référencés du CMS et les vecteurs dessinés directement dans le HTML ne sont pas une bibliothèque de fichiers publics à télécharger. La résolution disponible est celle des fichiers effectivement publiés; certains anciens visuels sont petits. Des variantes responsives différentes sont conservées lorsqu’elles sont référencées.

## Instruction à Claude

Utilise `manifest.json` et `page-image-map.csv` pour associer les images à leurs contenus. Copie uniquement les fichiers utiles vers le répertoire d’assets du projet et adapte les chemins aux composants existants. Préserve les illustrations et animations déjà validées de la nouvelle plateforme. Utilise les portraits réels et les figures originales avec leurs légendes, auteurs et sources; ne transforme pas un visuel ancien en donnée scientifique ou tarif actualisé sans validation. Les catégories du catalogue servent seulement au repérage.

## Pages indisponibles au contrôle

- https://www.ldgenx.com/a-propos — 404
- https://www.ldgenx.com/about-us/Services — 404
- https://www.ldgenx.com/applications/Services — 404
- https://www.ldgenx.com/equipment — 404
- https://www.ldgenx.com/partenaires-2 — 404
- https://www.ldgenx.com/partners — 404
- https://www.ldgenx.com/services/Services — 404
- https://www.ldgenx.com/team/Services — 404
- https://www.ldgenx.fr/a-propos/Services — 404
- https://www.ldgenx.fr/applications/Services — 404
- https://www.ldgenx.fr/cgvs/Services — 404
- https://www.ldgenx.fr/equipe/Services — 404
- https://www.ldgenx.fr/partenaires-2 — 404
- https://www.ldgenx.fr/services/Services — 404
