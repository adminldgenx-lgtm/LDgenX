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

`npm run build` produit le client Vite, un rendu React serveur temporaire, puis **153 pages HTML complètes** dans `dist`. Chaque page contient son contenu, son titre, sa description, sa canonique et ses données structurées avant l’exécution de JavaScript. Le client hydrate le HTML et assure la navigation. Le site public reste statique ; l’espace client et l’administration utilisent le backend Supabase déployé. Voir [docs/PORTAL.md](docs/PORTAL.md).

`check:html` contrôle les H1, les métadonnées uniques, les canoniques, les données structurées, les liens locaux, les images et les espaces insécables de la ponctuation française de toutes les pages. Les pages sont listées dans `src/lib/pages.ts`.

## Typographie française

Les textes utilisent une espace fine insécable (U+202F) avant `; ! ?` et une espace insécable (U+00A0) avant `:` et à l’intérieur des guillemets « ». Après l’ajout de contenu, `npm run typography` corrige les chaînes et le texte JSX (jamais le code) ; `npm run check:typography` signale les oublis. Les titres animés ne coupent que sur les espaces sécables.

## Structure

- `src/content/fr.ts`, `pages.fr.ts` et `visuals.fr.ts` : catalogue français des contenus métier, faits clés sourcés, fiches d’études, partenaires, cadrage de projet, FAQ, formulaires et schémas.
- `src/lib/pages.ts` : catalogue des routes, métadonnées, schémas et migrations.
- `src/components` : composants d’interface et gestion des métadonnées.
- `src/sections` : explorateur des services, chaîne scientifique de l’accueil (`Pipeline`), démarche détaillée (`Workflow`, page Expertises), preuves (`Proof` : faits clés et références), cadrage de projet et FAQ (`Practice`), collections éditoriales.
- `src/lib/contact.ts` : envoi du formulaire dans la boîte de réception de l’administration via Supabase.
- `src/portal` : espace client et administration ; `supabase/functions` : API, authentification vérifiée, fichiers privés et maintenance ; `supabase/migrations` : schéma et permissions.
- `src/pages` : modèles de pages par famille.
- `src/layouts` : navigation et pied de page.
- `src/styles/global.css` : palette, typographie, compositions et adaptations aux écrans.
- `public` : images WebP optimisées, logos d’origine et favicons.
- `scripts` : prérendu, vérification du résultat et typographie française.

## Publication (Cloudflare Pages)

Projet Cloudflare Pages relié au dépôt :

- **Build** : commande `npm run build`, dossier de sortie `dist`, Node 22 (fichier `.node-version`).
- **Supabase** : URL du projet et clé publiable dans `.env.production` (valeurs publiques). Le portail est inclus au build. `LDGENX_PORTAL=0` permet de l’exclure. Les secrets d’administration restent dans `.env.supabase.local`, ignoré par Git. L’envoi d’e-mails sera configuré ultérieurement ; voir [docs/PORTAL.md](docs/PORTAL.md).
- **Domaine** : `www.ldgenx.fr`, l’adresse canonique ; ajouter aussi `ldgenx.fr` et le rediriger vers `www` (règle de redirection Cloudflare).

Chaque page est un fichier `adresse.html`, servi par Cloudflare à son adresse sans barre finale (`/contact`), comme les adresses canoniques. `dist/_redirects` applique les redirections 301 des anciennes adresses (avant les fichiers) ; `dist/_headers` ajoute les en-têtes de sécurité (politique de sécurité du contenu stricte, HSTS, interdiction de l’intégration en iframe, permissions désactivées) et le cache des fichiers. `404.html` répond aux adresses inconnues avec un vrai statut 404.

Ne pas activer dans Cloudflare les options qui injectent des scripts d’autres domaines (Web Analytics, Zaraz, Rocket Loader) : la politique de sécurité les bloquerait. Les options de sécurité du réseau (SSL complet, « Always Use HTTPS », protection contre les robots) sont compatibles.

Les adresses de ldgenx.fr sont conservées telles quelles (`/services/selection` pour l’expertise, `/services/selection-genomique`, `/services/conservation` et `/services/tracabilite` pour les travaux scientifiques, `/equipe/dr-…` pour les biographies, `/cgvs/cgvs`). Les pages anglaises vivent sous `/en` avec les noms de pages de ldgenx.com ; si le domaine ldgenx.com pointe vers ce site, ses anciennes adresses (sans `/en`) redirigent vers elles (voir docs/MIGRATION.md).

Les URLs canoniques utilisent `https://www.ldgenx.fr`. Pour un environnement de préproduction, protéger l’indexation au niveau de l’hébergeur. Ne pas remplacer la version officielle sans validation de l’entreprise.

Les fichiers `robots.txt`, `sitemap.xml`, `llms.txt` et le mapping de redirections sont générés à chaque build. Les mentions légales et la page de confidentialité sont en `noindex`, sans intérêt dans les résultats de recherche.

Avec la prévisualisation de production déjà lancée, `npm run check:http` vérifie les réponses de toutes les pages, les 301 et le 404. `docs/VALIDATION.md` récapitule les vérifications effectuées.

## Langues

Le site est bilingue. Chaque langue a son catalogue (`src/content/catalog.fr.ts`, `catalog.en.ts`, même forme), chargé à part : une page ne télécharge que sa langue, l’autre arrive au changement de langue. `src/content/site.ts` garde les adresses de chaque entité dans les deux langues (le build vérifie qu’il correspond aux catalogues). Chaque page déclare ses `hreflang` réciproques et `x-default` ; le plan du site les reprend. Les CGV n’existent qu’en français.

## Parcours de l’accueil

Hero vidéo (un échantillon d’eau de mer où les particules forment une double hélice ; « Demander un devis » et « Découvrir nos expertises ») → faits clés sourcés → « De l’échantillon à la décision » : les sept étapes officielles le long d’une hélice d’ADN en particules (WebGL, sans bibliothèque), la caméra descendant l’hélice au fil du défilement → expertises en tracé de séquençage interactif (un pic par expertise, qui s’élève au choix et ouvre sa fiche ; le paysage de particules complet reste sur la page Expertises) → secteurs en atlas illustré interactif (un lieu par secteur : le paysage se rapproche du lieu choisi et sa fiche s’ouvre ; eau et éoliennes animées, glisser pour explorer sur téléphone) → études (Artois-Picardie en parcours le long de la côte, puis les trois autres études en panneaux) → R&D → références en trois groupes → équipe avec portraits → appel à l’action (devis et rendez-vous).

Les pages d’expertise et de secteur se terminent par « Votre projet en pratique » : ce qu’il est utile de préparer et ce qui est défini ensemble au cadrage. La page Expertises accueille la démarche détaillée et la FAQ ; la page Contact propose trois entrées (agenda, formulaire, e-mail), une liste de préparation, des champs de qualification (échantillons ou données, calendrier) et la FAQ.

## Animations et parcours mobile

Un seul vocabulaire de mouvement : les titres montent ligne par ligne, les contenus apparaissent une seule fois à l’entrée dans l’écran (jamais ce qui est déjà visible au chargement), les images se posent et se succèdent en fondu, les menus s’ouvrent et se referment en 0,2 s, les pages atteintes par la navigation apparaissent en fondu. Le défilement reste natif et le bouton Retour revient à la position quittée. La vidéo du hero (desktop et mobile, `public/videos/hero-sample-*`, boucles sans raccord ; sources dans `videos/`) démarre une fois la page chargée, à l’image de l’affiche, et se met en pause hors écran. La préférence `prefers-reduced-motion` désactive les animations et la vidéo.

Les polices se limitent à trois fichiers (Manrope 500, Inter 400 et 500). Pendant leur chargement, des polices de repli aux métriques ajustées occupent exactement la même place : le texte ne bouge pas à leur arrivée. La feuille de style est intégrée à chaque page générée.

La démarche détaillée (page Expertises, ancre `#demarche`) possède une image synchronisée et un sélecteur avec les noms des étapes sur desktop. Sur mobile, chaque étape possède sa propre illustration ; le sélecteur reste visible pendant le parcours. Les expertises et la FAQ disposent d’éléments dépliables natifs accessibles au clavier et au toucher. Les schémas reprennent les étapes fournies dans le contenu, avec des liens graphiques discrets entre les concepts.

Sections vivantes de l’accueil : les faits clés se « décodent » à travers les quatre bases (A, C, G, T) puis affichent leur texte exact ; l’étude Artois-Picardie est un parcours le long de la côte tenu à l’écran pendant le défilement (`src/sections/StudyJourney.tsx`, `src/lib/study-journey.ts`) : la caméra plonge de la France à la Côte d’Opale, longe les huit sites, puis la carte montre courants, turbidité ou marées ; les autres études s’ouvrent en panneaux ; le laboratoire R&D joue les quatre étapes de chaque projet sur un même canevas (`src/lib/lab-scenes.ts`) ; les références tournent en orbite autour de LDgenX ; l’équipe se tient sur une scène où une personne à la fois passe dans la lumière.

Pages intérieures : un même kit (`src/components/AmbientField.tsx`, `Decode.tsx`, `Steps.tsx`, `TiltLink` dans `ui.tsx`) — fil de lecture sous l’en-tête, hélice de points derrière les titres sans image, photo d’en-tête qui s’ouvre et dérive, étapes qui s’allument à la lecture, listes qui arrivent une à une, cartes qui s’inclinent vers le pointeur, faits qui se décodent, sommaire d’article qui suit la lecture. Les grandes sections de l’accueil sont reprises là où le contenu est le même : paysage des expertises (Expertises), atlas (Applications), parcours de l’étude (sa page), laboratoire (Innovation et projets), orbite (À propos, Partenaires), scène de l’équipe (À propos, Équipe). Tout s’arrête hors écran et sous `prefers-reduced-motion`.

Aucun texte n’est rendu sous 12 px ; les textes de lecture font 15 à 17 px.

Le traitement éditorial privilégie les photographies, les titres et des libellés lisibles. Les numérotations décoratives, pastilles, cercles de flèches, faux avatars à initiales, annotations marketing sur les photos et mots géants de fond ont été supprimés. Les seuls pictogrammes d’interface restants servent aux contrôles : menu, fermeture, dépliage et recherche. Les noms des partenaires sont composés typographiquement sur l’accueil ; la page partenaires montre les logos publiés, recadrés.

Deux niveaux de mouvement (`src/lib/motion-preference.ts`, appliqués avant l’affichage par `public/motion.js`) : complet par défaut, réduit quand le système le demande ou quand le visiteur le choisit en pied de page. Le niveau réduit garde la vidéo, les scènes, la carte et les compteurs, avec des entrées en fondu, sans glissement, zoom, inclinaison ni défilement animé ; les règles CSS s’écrivent `:root[data-motion='reduced'] …`.

Les animations sont concentrées dans `src/components/motion.tsx` et `src/styles/global.css`. Un observateur unique déclenche les entrées ; le suivi de l’étape active ne lit les positions que lorsque le parcours est à proximité de l’écran, au maximum une fois par frame.

## Contact et espace client

Le formulaire de contact envoie les demandes au backend Supabase : elles apparaissent dans l’onglet « Formulaire du site » de l’administration. Les boutons de rendez-vous ouvrent `/espace/reserver`. L’espace client est accessible via le pied de page du site ; l’administration est à `/admin`.

Le compte administrateur est `admin.ldgenx@gmail.com` ; son mot de passe a été défini à la demande du propriétaire et vérifié sur le backend réel le 26 octobre. Aucun mot de passe n’est conservé dans les fichiers du projet. Si une récupération locale devient nécessaire, `npm run supabase:admin-link` génère un lien privé temporaire. Le bouton de compte de la barre de navigation affiche « Connexion » ou « Mon compte » selon la session Supabase ; il conduit les administrateurs et les clients vers leur espace respectif.

**Différé à la demande du propriétaire** : fournisseur d’e-mails (validation des inscriptions, invitations, réinitialisation et notifications), puis connexion Google. Le backend est déployé sur Supabase ; le nouveau build du site reste à publier sur Cloudflare Pages. Les instructions et les contrôles sont dans [docs/PORTAL.md](docs/PORTAL.md).

## Avant la mise en ligne

Consulter le [rapport préproduction du 26 octobre](docs/PRE-PROD-REVIEW-2026-10-26.md) pour les corrections, les contrôles réussis et les points restant à finaliser (CGV et e-mails). Les sources et l’historique éditorial sont dans [docs/CONTENT-SOURCES.md](docs/CONTENT-SOURCES.md). La migration des contenus de ldgenx.fr et ldgenx.com, la table des adresses et les décisions attendues du client sont dans [docs/MIGRATION.md](docs/MIGRATION.md). La reconstruction locale ne déploie pas le site officiel.
