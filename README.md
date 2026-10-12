# LDgenX — Génomique appliquée

Site éditorial français : React, TypeScript, Vite, React Router, Lucide et Tailwind CSS. Les animations sont en CSS, sans bibliothèque. Les contenus et les illustrations ont été reconstruits à partir du brief, des assets fournis, de l’audit et des références publiques vérifiées.

## Développement

```sh
npm ci
npm run dev
```

Le site est disponible sur http://127.0.0.1:5173.

## Validation et production

```sh
npm run typecheck
npm run lint
npm run build
npm run check:html
npm run check:typography
npm run preview
```

La version de production est disponible sur http://127.0.0.1:4173.

`npm run build` produit le client Vite, un rendu React serveur temporaire, puis **35 pages HTML complètes** dans `dist`. Chaque page contient son contenu, son titre, sa description, sa canonique et ses données structurées avant l’exécution de JavaScript. Le client hydrate le HTML et assure la navigation. Aucun serveur applicatif n’est requis.

`check:html` contrôle les H1, les métadonnées uniques, les canoniques, les données structurées, les liens locaux, les images et les espaces insécables de la ponctuation française de toutes les pages. Les pages sont listées dans `src/lib/pages.ts`.

## Typographie française

Les textes utilisent une espace fine insécable (U+202F) avant `; ! ?` et une espace insécable (U+00A0) avant `:` et à l’intérieur des guillemets « ». Après l’ajout de contenu, `npm run typography` corrige les chaînes et le texte JSX (jamais le code) ; `npm run check:typography` signale les oublis. Les titres animés ne coupent que sur les espaces sécables.

## Structure

- `src/content/fr.ts`, `pages.fr.ts` et `visuals.fr.ts` : catalogue français des contenus métier, faits clés sourcés, fiches d’études, partenaires, cadrage de projet, FAQ, formulaires et schémas.
- `src/lib/pages.ts` : catalogue des routes, métadonnées, schémas et migrations.
- `src/components` : composants d’interface et gestion des métadonnées.
- `src/sections` : explorateur des services, chaîne scientifique de l’accueil (`Pipeline`), démarche détaillée (`Workflow`, page Expertises), preuves (`Proof` : faits clés et références), cadrage de projet et FAQ (`Practice`), collections éditoriales.
- `src/lib/contact.ts` : mode du formulaire de contact (envoi direct ou préparation d’e-mail).
- `src/pages` : modèles de pages par famille.
- `src/layouts` : navigation et pied de page.
- `src/styles/global.css` : palette, typographie, compositions et adaptations aux écrans.
- `public` : images WebP optimisées, logos d’origine et favicons.
- `scripts` : prérendu, vérification du résultat et typographie française.

## Publication

Publier le contenu de `dist` sur un hébergement statique. Servir les chemins de page depuis leur `index.html`, configurer un statut HTTP **404** pour les chemins inconnus, et appliquer les redirections **301** décrites dans `dist/redirects.json`. `dist/_redirects` est fourni pour les hébergeurs compatibles ; les pages de redirection HTML servent de repli, elles ne remplacent pas la configuration HTTP.

Exemple Nginx, à adapter à la racine du site :

```nginx
location = /equipe { return 301 /a-propos/equipe; }
location = /partenaires { return 301 /a-propos/partenaires; }
location = /a-propos/innovation { return 301 /innovation; }
location = /services/selection { return 301 /services/selection-genomique; }
location = /blog { return 301 /ressources; }
location = /actualites { return 301 /ressources; }
location / { try_files $uri $uri/index.html =404; }
error_page 404 /404.html;
```

Les URLs canoniques utilisent `https://www.ldgenx.fr`. Pour un environnement de préproduction, protéger l’indexation au niveau de l’hébergeur. Ne pas remplacer la version officielle sans validation de l’entreprise.

Les fichiers `robots.txt`, `sitemap.xml`, `llms.txt` et le mapping de redirections sont générés à chaque build. Les pages légales sont en `noindex` jusqu’à validation des informations manquantes.

Avec la prévisualisation de production déjà lancée, `npm run check:http` vérifie les réponses de toutes les pages, les 301 et le 404. `docs/VALIDATION.md` récapitule les vérifications effectuées.

## Langues

Les données françaises sont regroupées dans un catalogue de locale. Le lien « EN » ouvre le site anglais officiel existant. Ajouter un catalogue anglais et vérifier les correspondances de pages avant de publier des `hreflang=en` réciproques. Aucune URL anglaise n’est inventée.

## Parcours de l’accueil

Hero vidéo (un échantillon d’eau de mer où les particules forment une double hélice ; « Demander un devis » et « Découvrir nos expertises ») → faits clés sourcés → « De l’échantillon à la décision » : les sept étapes officielles le long d’une hélice d’ADN en particules (WebGL, sans bibliothèque), la caméra descendant l’hélice au fil du défilement → expertises en paysage de particules interactif (canvas) → secteurs en atlas illustré interactif (un lieu par secteur : le paysage se rapproche du lieu choisi et sa fiche s’ouvre ; eau et éoliennes animées, glisser pour explorer sur téléphone) → études (Artois-Picardie racontée sur sa carte : trait de côte OpenStreetMap tracé de la Belgique à la Somme, huit sites échantillonnés reliés à leur liste, question, démarche et apports sourcés ; puis trois études illustrées) → R&D → références en trois groupes → équipe avec portraits → appel à l’action (devis et rendez-vous).

Les pages d’expertise et de secteur se terminent par « Votre projet en pratique » : ce qu’il est utile de préparer et ce qui est défini ensemble au cadrage. La page Expertises accueille la démarche détaillée et la FAQ ; la page Contact propose trois entrées (agenda, formulaire, e-mail), une liste de préparation, des champs de qualification (échantillons ou données, calendrier) et la FAQ.

## Animations et parcours mobile

Un seul vocabulaire de mouvement : les titres montent ligne par ligne, les contenus apparaissent une seule fois à l’entrée dans l’écran (jamais ce qui est déjà visible au chargement), les images se posent et se succèdent en fondu, les menus s’ouvrent et se referment en 0,2 s, les pages atteintes par la navigation apparaissent en fondu. Le défilement reste natif et le bouton Retour revient à la position quittée. La vidéo du hero (desktop et mobile, `public/videos/hero-sample-*`, boucles sans raccord ; sources dans `videos/`) démarre une fois la page chargée, à l’image de l’affiche, et se met en pause hors écran. La préférence `prefers-reduced-motion` désactive les animations et la vidéo.

Les polices se limitent à trois fichiers (Manrope 500, Inter 400 et 500). Pendant leur chargement, des polices de repli aux métriques ajustées occupent exactement la même place : le texte ne bouge pas à leur arrivée. La feuille de style est intégrée à chaque page générée.

La démarche détaillée (page Expertises, ancre `#demarche`) possède une image synchronisée et un sélecteur avec les noms des étapes sur desktop. Sur mobile, chaque étape possède sa propre illustration ; le sélecteur reste visible pendant le parcours. Les expertises et la FAQ disposent d’éléments dépliables natifs accessibles au clavier et au toucher. Les schémas reprennent les étapes fournies dans le contenu, avec des liens graphiques discrets entre les concepts.

Sections vivantes de l’accueil : les faits clés se « décodent » à travers les quatre bases (A, C, G, T) puis affichent leur texte exact, et rejouent l’effet au survol ; la carte de l’étude Artois-Picardie anime l’eau (particules d’ADN portées par le courant côtier, `src/lib/study-flow.ts`), suit les trois étapes de la démarche qui s’enchaînent seules (survol : pause ; clic : choix) et affiche, à la demande, courants, turbidité ou marées ; elle reste visible à côté du texte sur desktop. Les autres études, les portraits de l’équipe s’inclinent vers le pointeur ; les projets de R&D ont chacun une illustration animée (lectures longues, horloge) et un pipeline parcouru par un signal. Tout s’arrête hors écran et sous `prefers-reduced-motion`.

Aucun texte n’est rendu sous 12 px ; les textes de lecture font 15 à 17 px.

Le traitement éditorial privilégie les photographies, les titres et des libellés lisibles. Les numérotations décoratives, pastilles, cercles de flèches, faux avatars à initiales, annotations marketing sur les photos et mots géants de fond ont été supprimés. Les seuls pictogrammes d’interface restants servent aux contrôles : menu, fermeture, dépliage et recherche. Les noms des partenaires sont composés typographiquement : les logos publiés sur le site officiel sont des vignettes basse résolution.

Les animations sont concentrées dans `src/components/motion.tsx` et `src/styles/global.css`. Un observateur unique déclenche les entrées ; le suivi de l’étape active ne lit les positions que lorsque le parcours est à proximité de l’écran, au maximum une fois par frame.

## Contact

Par défaut, sans fournisseur d’envoi approuvé, le formulaire **prépare un e-mail** dans la messagerie du visiteur et propose la copie du message.

Pour un envoi direct, définir au build l’adresse d’un service de formulaire acceptant un `POST` de `FormData` avec réponse JSON (par exemple un endpoint Formspree) :

```sh
VITE_CONTACT_ENDPOINT=https://formspree.io/f/xxxxxxx npm run build
```

Le bouton devient « Envoyer ma demande », la mention de consentement et la politique de confidentialité s’adaptent, et la confirmation ne s’affiche qu’après une réponse HTTP 2xx (message d’erreur et copie du message sinon). Le lien de réservation reprend l’agenda publié par LDgenX.

## Avant la mise en ligne

Consulter [docs/CONTENT-SOURCES.md](docs/CONTENT-SOURCES.md) pour les sources, limites factuelles et éléments à confirmer : informations légales, traitement des e-mails, éventuelle livraison anglaise, résultats scientifiques non publiés et catalogue de matériel. La reconstruction locale ne déploie pas le site officiel.
