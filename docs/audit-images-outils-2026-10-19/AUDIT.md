# Audit des images de matériel et d’outils — LDgenX

19 octobre 2026 · Constat initial, avant corrections · FR et EN

> **Mise à jour du 20 octobre 2026 : corrections appliquées localement.** Les huit visuels ci-dessous et l’infrastructure aquacole ne sont plus affectés au site. Voir le [bilan des corrections, preuves et éléments manquants](CORRECTIONS-2026-10-20.md), le [tableau actualisé](remplacements.csv) et les [captures avant/après](../qa-2026-10-20/README.md). Le texte suivant conserve le constat initial du 19 octobre.

**Huit visuels d’équipement générés par IA sont encore utilisés : sept dans le contenu ou les interactions du site, et un uniquement dans les images de partage social.** Leurs 32 variantes WebP se régénèrent à partir de ces huit sources.

La page **Matériel d’échantillonnage utilise déjà les visuels produits publiés par LDgenX** pour la pompe triple, les capsules, la stick pump et la torpille. Elle ne nécessite pas un remplacement général pour répondre à la demande « pas d’images IA pour les outils ».

[Voir les huit images à remplacer](a-remplacer.png) · [Photos réelles déjà disponibles](photos-disponibles.webp) · [Liste exploitable dans un tableur](remplacements.csv) · [Inventaire complet, routes FR/EN et références de code](inventaire.json)

## Ce qui doit changer

Les numéros correspondent à la planche visuelle. Le périmètre couvre les instruments, outils de prélèvement, consommables et installations de laboratoire/recherche montrés sous une forme photographique. L’origine IA des huit sources est **confirmée** par le dossier de génération et par leur empreinte SHA-256 identique au manifeste fourni.

| N° | Visuel et matériel montré | Emplacements à corriger | Remplacement réel à prévoir |
| --- | --- | --- | --- |
| 01 | **`laboratoire`** — pipette, tubes, portoirs et poste PCR | Photo dans **À propos** ; aperçu par défaut du menu **Expertises** ; images de partage de **l’accueil** et d’**À propos**. | Photo du véritable poste de travail et d’une manipulation de pipetage. `equipe-maxime` est déjà disponible pour un remplacement général temporaire. |
| 02 | **`sequencage`** — séquenceur générique et consommables | Étape **Séquençage & dPCR** du parcours ADN de l’accueil ; même étape dans la démarche de la page **Expertises** ; image de partage de **/services**. **Le hero de la prestation Séquençage & dPCR utilise déjà `equipe-maxime`, une photo réelle.** | Photo de la plateforme réellement utilisée, avec cadrage de l’appareil et du chargement. Si la prestation implique un partenaire, garder cette attribution exacte. |
| 03 | **`microbiologie`** — pipette, tubes d’extraction et agitateur vortex | Hero **Communautés microbiennes** ; aperçu du menu ; cartes d’expertise associées, notamment sur Agriculture et Études environnementales ; partage social de cette expertise. | Photo réelle de la préparation/extraction microbienne. `equipe-maxime` peut servir de photo générale, en attendant une vue spécifique. |
| 04 | **`dna-ecotrace`** — séquenceur portable, flow cell, pipette et capsules | Hero **Recherche & Développement** ; hero **DNA EcoTrace** ; cartes, cas et liens associés ; aperçu du menu ; images de partage. | Photo réelle du séquenceur portable et de sa manipulation. Aucun cliché documentaire adapté n’a été identifié dans les sources locales inspectées. |
| 05 | **`conception`** — filtres, tuyaux et tubes d’un kit de terrain | Étape **Conception scientifique** dans le parcours ADN de l’accueil et dans la démarche ; aperçu par défaut du menu **Applications**. | Photo réelle de préparation d’une campagne avec le kit complet. Les photos existantes de pompe et de capsules peuvent déjà fournir un remplacement fidèle. |
| 06 | **`agriculture`** — gouge/carottier de sol et prélèvement | Hero **Agriculture & Agroécologie** ; cartes d’application, cartes associées, aperçu du menu et partage social. | Photo réelle d’un prélèvement de sol avec l’outil utilisé, ou photo agricole réelle sans appareil si aucun reportage adapté n’est disponible. |
| 07 | **`recherche`** — bassins expérimentaux, tuyauterie et installation | Hero **Recherche publique & privée** ; cartes d’application et liens associés ; aperçu du menu ; partage social. | Photo autorisée d’une installation réelle ou d’une scène de recherche. Ne pas attribuer automatiquement une salle à LDgenX ou à Ifremer. |
| 08 | **`innovation`** — ancienne pompe péristaltique fictive | **Uniquement les images Open Graph/Twitter de `/innovation` et `/en/innovation`.** Ce visuel n’apparaît plus dans le contenu photographique de ces pages, mais réapparaît lors du partage du lien. | Corriger la référence dans `src/lib/pages.ts`, avec une photo réelle comme `materiel-pompe` ou `equipe-maxime`. |

Ces corrections concernent les versions françaises **et** anglaises. La liste exhaustive des routes déjà présentes dans le rendu initial et des routes de partage figure dans le CSV/JSON. Les occurrences supplémentaires déclenchées par les étapes ADN ou les aperçus de menus sont indiquées dans ce tableau : le rendu initial seul ne permet pas de les compter toutes.

## Points à arbitrer séparément

### Installations aquacoles

**`aquaculture` est également une image IA confirmée** : cages d’élevage et embarcation. Elle apparaît sur la page Aquaculture & Pêche, la ressource sur les filières aquacoles, leurs cartes associées, le menu Applications et les images de partage.

Elle montre une infrastructure de production, plutôt que le matériel de prélèvement vendu ou utilisé par LDgenX. **Si la règle cliente inclut toutes les installations techniques, ajouter cette neuvième source à la liste de remplacement.** Prévoir une photo réelle de ferme aquacole autorisée. La photo réelle de crevette @UNIMA ne documente pas une installation aquacole.

L’atlas contient lui aussi un paysage illustré, des éoliennes et des infrastructures imaginaires. Il mérite un arbitrage si la cliente étend sa règle aux paysages illustratifs ; il ne constitue pas une photographie de matériel LDgenX. Aucune refonte de l’atlas n’est proposée automatiquement dans cet audit.

### Vidéo du hero et ses affiches

Le hero montre un tube tenu par un gant, avec une hélice d’ADN animée dans le liquide. Il s’agit clairement d’une représentation de principe. **L’origine IA de sa fabrication n’est pas suffisamment documentée dans les fichiers locaux pour être classée comme confirmée dans cet audit.** La métadonnée `encoder: Google` de `videos/dna for desk.mp4` ne suffit pas à prouver une génération IA.

Faire confirmer sa provenance et si la règle vise également les tubes/gants des animations conceptuelles. Si le hero doit changer, traiter ensemble :

- `public/videos/hero-sample-desktop-poster.webp` ;
- `public/videos/hero-sample-mobile-poster.webp` ;
- `public/videos/hero-sample-desktop.webm` ;
- `public/videos/hero-sample-desktop.mp4` ;
- `public/videos/hero-sample-mobile.mp4`.

Changer seulement la vidéo laisserait son ancienne affiche visible au chargement et en mouvement réduit. Ce point reste séparé des huit images dont l’origine IA est établie.

### Images et animations hors de ce périmètre

`interpretation` montre des documents, une carte, un crayon et un stylo. Elle est générée, mais ne présente pas d’instrument technique ou d’appareil de laboratoire ; elle n’est donc pas comptée dans les huit remplacements matériels. Si la cliente demande ensuite un site entièrement photographique, elle devra aussi être revue.

Les schémas dPCR, les scènes explicatives des projets R&D, les courbes d’expertise et les hélices sont des illustrations pédagogiques ou décoratives. Ils ne sont pas des photos d’appareils et ne nécessitent pas le même remplacement. Les portraits, les animaux et les paysages sans outil sortent du présent audit.

## Images existantes à conserver

Les fichiers suivants proviennent des visuels publiés par LDgenX ou des photographies fournies par la cliente ; le projet ne les identifie pas comme des générations IA. Les capsules et la torpille sur le terrain comportent des montages éditoriaux issus des sources : ce ne sont pas des inventions de matériel.

| Fichier source dans `images/official/` | Sujet | Résolution disponible | Décision |
| --- | --- | --- | --- |
| `materiel-pompe.jpg` | Pompe triple, mallette fermée et débitmètres | 1000 × 750 | Conserver ; réutilisable pour remplacer le prototype fictif d’Innovation. |
| `materiel-pompe-interieur.jpg` | Pompe triple, panneau de commande | 1000 × 750 | Conserver. |
| `materiel-capsules.png` | Capsules de filtration | 1000 × 176 | Conserver ; version plus grande souhaitable pour un usage autre que bandeau. |
| `materiel-stickpump.png` | Stick pump | 405 × 579 | Conserver ; demander une source plus définie si la présentation doit être agrandie. |
| `materiel-torpille.jpg` | Torpille d’échantillonnage | 1000 × 522 | Conserver. |
| `materiel-torpille-terrain.png` | Torpille en campagne, montage avec annotation | 732 × 994 | Conserver ; une photo de terrain sans annotation améliorerait la présentation. |
| `equipe-maxime.jpg` | Travail réel au laboratoire | 473 × 821 | Conserver ; demander l’original pour des grands cadrages. |
| `terrain-prelevement.png` | Matériel et prélèvement sur le terrain | 829 × 755 | Conserver. |
| `cas-eolien-offshore.png` | Matériel de prélèvement en mer | 799 × 560 | Conserver le crédit visible **@biotope**. |

La photo **`bioinformatique-client.jpeg`**, 922 × 1224, provenant du Canva et conservée dans `images/client-2026-10-17/`, est déjà une photo réelle d’écran et de clavier. Aucun remplacement IA n’est nécessaire pour cet emplacement.

La photo cliente **`terrain-bateau.png`**, 382 × 510, est réelle mais trop petite pour un grand hero. Elle ne démontre ni un protocole ni un lien avec Artois-Picardie : son utilisation éventuelle doit rester fidèle au contexte établi.

## Précautions sur les anciennes sources

- `environnement`, `biodiversite`, `eolien-offshore` et `microplastiques` contiennent aussi du matériel généré dans les anciens packs. **Aucune référence active à ces quatre identifiants n’a été trouvée dans les catalogues, le code d’affichage ou les images de partage actuels.** Leurs fichiers restent dans les sources et dans `public/images/` : ne pas les réintroduire lors d’un remplacement.
- `innovation` semblait également retirée, mais sa référence de partage social est encore active : c’est précisément le point 08.
- Le fichier d’archive `LDgenX_Images_2026-10-14/images/0da8ba8a5e04__320-6a4d0303af0ae-chatgpt-image-1-juil-2026-11-30-50.png` représente un séquenceur sous forme de dessin ; son nom indique une provenance ChatGPT. **Le fait qu’un fichier provienne de l’ancien site ne garantit pas qu’il s’agit d’une photographie réelle.** Ce dessin n’est pas une alternative documentaire au séquenceur généré.
- Ne pas utiliser une retouche générative pour inventer un appareil ou une partie manquante. Les remplacements attendus sont des photos fidèles du matériel réel, avec un cadrage et une optimisation web classiques.

## Lot de photos à demander à la cliente

1. **Laboratoire** : poste réel de préparation PCR, manipulation à la pipette et extraction microbienne, avec plusieurs cadrages.
2. **Séquençage** : appareil(s) réellement mobilisé(s), vue générale et chargement.
3. **DNA EcoTrace** : dispositif portable réellement utilisé et contexte de manipulation.
4. **Préparation terrain** : kit complet réel avec capsules, tubes, tuyaux et pompe.
5. **Agriculture** : prélèvement de sol avec l’outil effectivement utilisé, ou un visuel agricole réel autorisé.
6. **Recherche** : installation ou scène de recherche réelle autorisée, avec attribution exacte.

La pompe d’Innovation peut être remplacée avec une photo déjà présente. La photo de Maxime peut fournir une solution temporaire pour certaines scènes de laboratoire ; les nouveaux cadrages évitent de répéter le même petit portrait sur plusieurs pages.

## Méthode et limites

Audit du **code actuel de la copie locale**, avec ses modifications en cours conservées. Le rendu serveur des **81 routes FR/EN** a été reconstruit dans un répertoire temporaire pour contrôler les images initiales et les métadonnées. Les menus, données d’étapes, médias du hero et références directes ont été lus dans le code. Les visuels générés et les photos candidates ont été examinés. L’origine IA des huit sources correspond exactement aux empreintes de `LDgenX_images_new/manifest.json` et aux notes/prompts du même dossier.

Cet audit ne constitue pas une visite du domaine public ni une inspection de chaque état interactif dans un navigateur. Il couvre la version locale sur laquelle nous travaillons. **Aucune image, route, dépendance ou interaction du site n’a été modifiée.** Seuls les fichiers de ce dossier d’audit ont été ajoutés.
