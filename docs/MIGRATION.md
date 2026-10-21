# Migration des contenus de ldgenx.fr et ldgenx.com

Source : collecte publique du 13 octobre 2026 (`ldgenx-migration-2026-10-13/` : pages FR et EN, images, documents, inventaire) et documents publiés par l’Agence de l’eau Artois-Picardie. Les animations et la direction artistique existantes (hélice d’ADN, paysage d’expertises, atlas, parcours Artois-Picardie, laboratoire R&D) sont inchangées : seuls leurs textes passent par les catalogues de langue.

## Contenus intégrés

| Contenu                                                                                                                                                                             | Où                                                                           | Source                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Prestations de chaque expertise (tuiles publiées)                                                                                                                                   | section « Nos prestations » des pages expertise                              | /services/* (FR), /services/* (EN)                              |
| Cas d’études de chaque expertise, reliés à l’étude, aux travaux ou à la publication                                                                                                 | section « Cas d’études »                                                     | idem                                                            |
| Matériel : pompe triple, stick pump, torpille (« Yellow Submarine » en anglais), caractéristiques, photos, prix HT publiés                                                          | /services/materiel                                                           | /services/materiel, /services/equipment                         |
| Applications et exemples de projets de chaque secteur                                                                                                                               | pages applications                                                           | /applications/*                                                 |
| Travaux scientifiques : conservation, traçabilité, sélection génomique, avec figures, légendes et références                                                                        | /services/conservation, /services/tracabilite, /services/selection-genomique | pages du même nom                                               |
| Biographies complètes et listes de publications (Maeva Leitwein, Emilie Delpuech)                                                                                                   | /equipe/dr-maeva-leitwein, /equipe/dr-emilie-delpuech                        | pages du même nom                                               |
| Toutes les publications, filtrables par autrice                                                                                                                                     | /publications (nouvelle)                                                     | pages équipe                                                    |
| Conditions générales de vente, texte inchangé, sommaire                                                                                                                             | /cgvs/cgvs (français seulement)                                              | /cgvs/cgvs                                                      |
| Mission, ambition, statut JEI, soutiens DeepTech                                                                                                                                    | /a-propos, /innovation                                                       | /a-propos, /a-propos/innovation, /about-us                      |
| Logos des partenaires (24, recadrés), texte et trois groupes                                                                                                                        | /a-propos/partenaires                                                        | /a-propos/partenaires                                           |
| Rendez-vous express : texte, trois bénéfices                                                                                                                                        | /contact                                                                     | /contact                                                        |
| Actualité BlueTechShow (20-21 octobre 2026), affichée jusqu’au 21 octobre puis remplacée par DNA EcoTrace                                                                           | accueil                                                                      | accueil ldgenx.fr                                               |
| Résultats Artois-Picardie : chiffres clés, objectifs, constats, espèces, diversité par site et par secteur, protocole, guildes, comparaison au chalut, turbidité, pistes, documents | page de l’étude, après le parcours                                           | article, rapport final, présentation de restitution de l’Agence |
| Site anglais complet sous /en                                                                                                                                                       | toutes les pages sauf les CGV                                                | ldgenx.com, traductions de ldgenx.fr là où .com n’a pas de page |

L’accueil reste synthétique : chaque section renvoie aux pages complètes. Les panneaux d’études de l’accueil présentent les deux études citées et les travaux sur le bar européen.

## Adresses

Toutes les adresses de ldgenx.fr répondent à la même adresse. Les pages de ldgenx.com sont sous `/en`, avec leurs noms de pages ; si le domaine ldgenx.com est dirigé vers ce site, ses anciennes adresses redirigent (301) vers ces pages, sauf là où une page française répond déjà (`/`, `/services`, `/applications`, `/contact`, `/services/conservation`). La liste complète des redirections est générée dans `dist/_redirects` et `dist/redirects.json`.

| Ancienne adresse                                        | Nouvelle adresse                               |
| ------------------------------------------------------- | ---------------------------------------------- |
| ldgenx.com/                                             | /en                                            |
| ldgenx.com/about-us                                     | /en/about-us                                   |
| ldgenx.com/about-us/innovation                          | /en/innovation                                 |
| ldgenx.com/about-us/partners                            | /en/about-us/partners                          |
| ldgenx.com/about-us/team                                | /en/about-us/team                              |
| ldgenx.com/applications                                 | /en/applications                               |
| ldgenx.com/applications/agriculture-agroecology         | /en/applications/agriculture-agroecology       |
| ldgenx.com/applications/aquaculture-fisheries           | /en/applications/aquaculture-fisheries         |
| ldgenx.com/applications/biodiversity-conservation       | /en/applications/biodiversity-conservation     |
| ldgenx.com/applications/environment-consultancies       | /en/applications/environment-consultancies     |
| ldgenx.com/contact                                      | /en/contact                                    |
| ldgenx.com/services                                     | /en/services                                   |
| ldgenx.com/services/bioinformatics                      | /en/services/bioinformatics                    |
| ldgenx.com/services/conservation                        | /en/services/conservation                      |
| ldgenx.com/services/environmental-dna-edna              | /en/services/environmental-dna-edna            |
| ldgenx.com/services/equipment                           | /en/services/equipment                         |
| ldgenx.com/services/genomic-selection                   | /en/services/genomic-selection                 |
| ldgenx.com/services/genomic-selection-page              | /en/services/genomic-selection-page            |
| ldgenx.com/services/microbial-community-analysis        | /en/services/microbial-community-analysis      |
| ldgenx.com/services/population-genomics                 | /en/services/population-genomics               |
| ldgenx.com/services/sequencing-dpcr                     | /en/services/sequencing-dpcr                   |
| ldgenx.com/services/traceability                        | /en/services/traceability                      |
| ldgenx.com/team/dr-emilie-delpuech                      | /en/team/dr-emilie-delpuech                    |
| ldgenx.com/team/dr-maeva-leitwein                       | /en/team/dr-maeva-leitwein                     |
| ldgenx.fr/                                              | /                                              |
| ldgenx.fr/a-propos                                      | /a-propos                                      |
| ldgenx.fr/a-propos/equipe                               | /a-propos/equipe                               |
| ldgenx.fr/a-propos/innovation                           | /innovation                                    |
| ldgenx.fr/a-propos/partenaires                          | /a-propos/partenaires                          |
| ldgenx.fr/applications                                  | /applications                                  |
| ldgenx.fr/applications/agriculture-agroecologie         | /applications/agriculture-agroecologie         |
| ldgenx.fr/applications/aquaculture-peche                | /applications/aquaculture-peche                |
| ldgenx.fr/applications/biodiversite-conservation        | /applications/biodiversite-conservation        |
| ldgenx.fr/applications/environnement-bureaux-d-etudes   | /applications/environnement-bureaux-d-etudes   |
| ldgenx.fr/cgvs/cgvs                                     | /cgvs/cgvs                                     |
| ldgenx.fr/contact                                       | /contact                                       |
| ldgenx.fr/equipe/dr-emilie-delpuech                     | /equipe/dr-emilie-delpuech                     |
| ldgenx.fr/equipe/dr-maeva-leitwein                      | /equipe/dr-maeva-leitwein                      |
| ldgenx.fr/services                                      | /services                                      |
| ldgenx.fr/services/adn-environnemental-adne             | /services/adn-environnemental-adne             |
| ldgenx.fr/services/analyse-des-communautes-microbiennes | /services/analyse-des-communautes-microbiennes |
| ldgenx.fr/services/bioinformatique                      | /services/bioinformatique                      |
| ldgenx.fr/services/conservation                         | /services/conservation                         |
| ldgenx.fr/services/genomique-des-populations            | /services/genomique-des-populations            |
| ldgenx.fr/services/materiel                             | /services/materiel                             |
| ldgenx.fr/services/selection                            | /services/selection                            |
| ldgenx.fr/services/selection-genomique                  | /services/selection-genomique                  |
| ldgenx.fr/services/sequencage-dpcr                      | /services/sequencage-dpcr                      |
| ldgenx.fr/services/tracabilite                          | /services/tracabilite                          |

Autres redirections : `/equipe`, `/partenaires`, `/partenaires-2` → équipe et partenaires ; `/cgvs` → `/cgvs/cgvs` ; `/blog`, `/actualites` → `/ressources` ; les variantes `/Services` (et `/…/Services`, observées sur les deux sites) → `/services` ou `/en/services`. Les variantes qui ne diffèrent d’une page que par les majuscules ne sont servies que par les règles d’hébergement (`_redirects`), pour ne pas écraser la page sur un disque insensible à la casse.

Nouvelles pages : `/publications` et `/en/publications`, et les pages anglaises sans équivalent sur ldgenx.com (études de cas, innovation, ressources, mentions légales, confidentialité, deux secteurs).

## Corrections faites à la reprise

Fautes de frappe corrigées dans les textes repris (le sens n’est pas modifié) :

- « Banchet » → « Blanchet » (auteur, Saint-Pé et al. 2019) ;
- « Brouwn » → « brown », « andromous » → « anadromous » (titres de publications, ldgenx.com) ;
- « intéret », « pèche », « a put », « variablilité », « ancients », « hératibilité », « Méditérénenen », « Dicentrachus » → formes correctes ;
- « ****f****acturer » → « facturer » (CGV, seule modification de ce texte).

À valider par l’autrice (voir ci-dessous) : « allèles récessifs potentiellement domestique » a été lu « potentiellement délétères », cohérent avec la légende de la figure 2.

## Décisions attendues de LDgenX

1. **Lien de rendez-vous** : l’accueil de ldgenx.fr utilise cal.com, la page contact et ldgenx.com utilisent Axonaut. Le site utilise cal.com partout ; l’autre lien est conservé dans `booking.alternate`. Choisir lequel garder.
2. **Prix du matériel** : les prix HT sont ceux des vignettes publiées sur ldgenx.fr (la vignette de la torpille est lisible en entier : 1 400 € HT, filtres 18 € HT). ldgenx.com n’affiche aucun prix. Confirmer qu’ils sont à jour, ou retirer l’affichage.
3. **Publications** : les listes publiées s’arrêtent en 2022 (avec deux mentions « soumis » et « prépublication »). Fournir les publications plus récentes et le statut définitif de ces deux articles. Le lien « Aliakbari et al. 2021 » de la page travaux mène à l’article de 2020 : l’année est retirée du texte, à confirmer.
4. **Correction scientifique** : valider « allèles récessifs potentiellement délétères » (travaux conservation, groupe de liaison 26).
5. **Données Artois-Picardie** : les totaux d’espèces par site diffèrent entre la présentation et le rapport ; seuls les chiffres par secteur du rapport sont affichés. Pour un tableau de bord interactif (espèces par site, abondances), fournir les tableaux de données validés. Signaler à l’Agence : la diapositive de synthèse de Boulogne reprend le texte d’un autre site ; le tableau 1 du rapport répète les coordonnées de la Canche pour Dunkerque Ouest (le site utilise l’annexe 2).
6. **Droits des figures** : les figures du rapport et de la présentation sont reproduites avec leur légende et leur source ; confirmer l’accord de l’Agence de l’eau Artois-Picardie et du groupement (Qualyse, Prelevmar).
7. **Portraits** : l’accueil et l’équipe utilisent les portraits de studio générés, validés pour la maquette. Les photos d’origine (1000 px) sont dans `images/official/equipe-*.jpg` : chaque personne choisit.
8. **Domaine ldgenx.com** : décider s’il pointe vers ce site (les redirections sont prêtes) ou vers `/en`.
9. **CGV** : il n’existe pas de version anglaise ; le pied de page anglais renvoie à la version française, signalée comme telle.
10. **Actualité** : prévoir le remplacement de l’encart BlueTechShow après le 21 octobre (il bascule seul sur DNA EcoTrace).

## Vérifications

- `npm run lint`, `typecheck`, `check:typography`, `build`, `check:html` (81 pages FR et EN : métadonnées uniques, un H1, titres ordonnés, JSON-LD, espaces insécables, liens et images locaux), `check:http` (81 pages, 55 redirections 301, 404 réelle).
- Comportements : navigation mobile et clavier, menus, paysage d’expertises, atlas, laboratoire, panneaux, faits clés ; pages migrées en FR et EN sur ordinateur et téléphone (aucun débordement horizontal, aucune image cassée, langue du document), onglets des résultats au clavier (flèches, Début, Fin), choix d’un site, changement de marqueur, filtre des publications, prix du matériel, changement de langue vers la page équivalente, mouvement réduit (tout le contenu visible).
- Lighthouse (simulation mobile / ordinateur) : accessibilité et bonnes pratiques 100 partout ; performance 100 sur ordinateur, 87 à 89 sur mobile (93 avant la migration : le contenu publié a presque doublé ; chaque langue est chargée séparément pour limiter l’effet).

## Recherche & publications (15 octobre 2026)

Source : dossier `LDgenX_Recherche_Publications_2026-10-15` (références vérifiées, fiches, figures et licences). Le dossier reste une source de travail ; seuls les contenus et figures retenus sont copiés.

- **Page** `/recherche` (EN `/en/research`), dans le menu principal. L’ancienne adresse `/publications` (et `/en/publications`) redirige vers elle. Trois sujets mis en avant (truite et marqueurs SNP, résistance du bar à la VNN, efficacité alimentaire du porc), puis le catalogue des 15 références avec recherche et filtres (thème, membre, année, expertise) gardés dans l’adresse ; chaque publication s’ouvre dans un panneau partageable (`?publication=`), refermé par Échap, Retour ou le bouton, filtres conservés.
- **Données** : `src/content/research.fr.ts` et `research.en.ts`, générés depuis `data/publications.json` : titres, auteurs, revues, années de fascicule, DOI, prépublications et dépôts HAL/PubMed des articles publiés. Les corrections du dossier sont appliquées (P02 _Evolution_ 2023, P13 titre final IFI6/IFI27-like 2023, titres finaux de P04, P11, P12, P06 fascicule 2020). Les codes P01–P15 restent internes. Les anciens facteurs d’impact ne sont pas repris.
- **Synthèses** : question, approche, apport et limites, fondées sur le résumé de l’article publié (les « limites » des fiches, écrites comme consignes de rédaction, sont reformulées pour les visiteurs, sans en changer le sens). Chaque panneau indique la version du texte consulté : article publié, prépublication (P02, P05, P07) ou résumé seul (P09, P12).
- **Graphiques** : uniquement des valeurs écrites dans les résumés publiés (P08 : 12 204 SNP, 192 retenus, 1 862 truites, cinq rivières ; P13 : survie 40,6 / 45,4 % contre 78 / 66,2 % selon le génotype ; P14 : 45, 42 et 28 régions, 13 partagées, 1 commune). La disposition des points du graphique P08 est illustrative et le dit.
- **Figures** : 17 figures d’articles CC BY 4.0 (P03, P04, P08, P10, P11, P13, P14, P15), reproduites sans modification, avec légende originale, auteurs, revue et licence ; chargées seulement à l’ouverture d’une publication. Aucune figure de P01 (CC BY-NC), P06 (CC BY-NC-ND), des prépublications ni des articles non consultés.
- **Liens** : « Voir ses publications » (pages de Maeva Leitwein et Emilie Delpuech, scène de l’équipe) avec filtre présélectionné ; publications liées sur les pages d’expertise (filtre par expertise) et sur les trois pages de travaux scientifiques ; bandeau d’accès sur l’accueil après l’équipe. Les pages des personnes utilisent désormais ce catalogue vérifié au lieu des listes recopiées de l’ancien site.
- **Données structurées** : `ScholarlyArticle` pour chaque référence affichée.

À fournir pour aller plus loin : textes finaux de P02, P05, P07, P09 et P12 ; tableaux de données validés pour des graphiques interactifs au-delà des valeurs des résumés ; publications plus récentes et éventuel ORCID de Damien Crestel ; autorisations si des figures sous licence restrictive doivent apparaître.

## Retours de la cliente (15 octobre 2026)

- **Accueil** : titre « Éclairer vos décisions avec l’ADN », introduction « Des analyses ADN à l’interprétation des résultats, nous accompagnons vos projets environnementaux. » (FR et EN), même animation d’entrée. Un accès court vers le module de tests ADN ciblés suit la section des expertises.
- **Applications** : les cartes affichent toujours leur description courte (plus seulement au survol), qui distingue Biodiversité & Conservation (comprendre les populations, conservation) et Études environnementales (état initial, impact, suivi). Liens contextuels réciproques entre les deux pages.
- **Études environnementales** (ancien libellé « Environnement & Bureaux d’études », adresse conservée `/applications/environnement-bureaux-d-etudes`) : questions, approches (ADNe, métabarcoding, tests ciblés dPCR, communautés microbiennes), section « Des données pour éclairer la séquence ERC » (« Éviter, Réduire, Compenser », trois moments du projet, lien vers ecologie.gouv.fr), livrables et accompagnement repris des prestations documentées. LDgenX y est présentée comme contributeur scientifique, sans réalisation du dossier réglementaire ni garantie de conformité.
- **Énergies renouvelables** (ancien libellé « Énergies marines renouvelables ») : éolien terrestre, éolien en mer, photovoltaïque. Nouvelle adresse `/applications/energies-renouvelables` (EN `/en/applications/renewable-energy`), redirections 301 depuis les anciennes. L’atlas montre deux éoliennes terrestres en plus des éoliennes en mer ; la vignette de la page est composée à partir de l’illustration de l’atlas et des mêmes éoliennes (`energies-renouvelables`, illustration).
- **Séquençage & dPCR** : module « Votre espèce cible, un test ADN sur mesure » (quatre étapes, scène « Illustration du principe », note sur la dPCR qui quantifie l’ADN cible et ne compte pas les individus, accès « Votre espèce n’est pas dans la liste ? » vers le contact). Les organismes affichés sont ceux publiés sur ldgenx.fr (oursin violet _Paracentrotus lividus_, espèces méditerranéennes emblématiques), sans statut de validation. Le modèle `customAssay.targets` accepte les entrées vérifiées (nom, nom latin, visuel, statut documenté, source).
- **Référencement** : titres et descriptions propres pour Études environnementales, Biodiversité & Conservation, Énergies renouvelables et Séquençage & dPCR (50 à 60 caractères, recommandation de l’audit), sans volumes de recherche : aucune donnée Search Console ou Keyword Planner n’est présente dans le projet.
- **Visuels** : Sélection génomique → crevettes (photo de ldgenx.fr/services/selection) ; Génomique des populations → vanneau huppé (photo de la page génomique des populations) ; Séquençage & dPCR → laboratoire LDgenX (photo réelle) ; R&D → illustration DNA EcoTrace. Conception scientifique, Bioinformatique, Interprétation et Aide à la décision gardent leurs illustrations validées : aucun visuel client adapté n’a été trouvé dans les dossiers fournis.

À fournir : la liste des espèces et des tests (documents Canva cités par la cliente : dauphins, tortues, thons, oursins, vison d’Amérique, putois d’Europe…), avec pour chacune le nom exact, un visuel et le statut documenté du test ; des photos réelles pour la conception scientifique, la bioinformatique, l’interprétation, l’aide à la décision et une plateforme de séquençage ; un visuel photovoltaïque ou éolien terrestre réel si la cliente en dispose.

## Intégration Canva (17 octobre 2026)

Cette reprise **remplace les attentes du 15 octobre** concernant les photos populations, bioinformatique, aide à la décision, sélection génomique et la liste dPCR. Le compte rendu détaillé est dans [CANVA-2026-10-17.md](CANVA-2026-10-17.md).

- Photos réelles extraites du PPTX Canva et conservées avec leurs empreintes dans `images/client-2026-10-17/` et `data/client-photos.json`. Huîtriers pies pour l’expertise populations ; écran et mains pour la bioinformatique ; amphithéâtre pour l’aide à la décision ; crevette dans les mains pour la sélection, avec crédit HTML `@UNIMA`. Le vanneau des cas d’études reste en place.
- Module dPCR existant enrichi en FR/EN : 22 entrées de source, 21 publiables, recherche, filtres, sélection native mobile, fiche typographique et contact. Le vison reste une illustration générale séparée des fiches, sans identification d’espèce.
- Seule confirmation nécessaire : cible réelle du test historiquement nommé **Neomys anomalus — Musaraigne de Miller** ; ne pas le remplacer automatiquement par *Neomys milleri*. Entrée conservée en interne, exclue de la publication jusqu’à clarification.
- Kayak, crapaud, salamandre et bateau conservés comme sources, non ajoutés pour remplir la page ; la photo du bateau mesure seulement 382 × 510 px.
- Hero, ADN, atlas, Artois-Picardie, publications et routes conservés. Correction du recadrage d’entrée de l’atlas en mouvement réduit, sans modification de son animation normale.
- Contrôles et limites consignés dans `docs/VALIDATION.md` et captures dans `docs/qa-2026-10-17/`. Aucun déploiement.

## Retours cliente et base SEO/GEO (21 octobre 2026)

- **Retours cliente appliqués** :
  - **Accueil** : titre « De l’ADN aux décisions », « +15 ans d’expérience scientifique », PacBio retiré, nouvelle photo pour l’étape séquençage, accès aux tests ADN ciblés mis en avant (photo, nombre d’espèces, liste défilante).
  - **Images renouvelées** : communautés microbiennes, bioinformatique, R&D et énergies renouvelables (éoliennes).
  - **Pages** :
    - une page « Tests ADN ciblés » avec les 21 espèces visibles d’un coup ;
    - Matériel sans prix et avec les kits par milieu ;
    - bloc CIR sur Recherche publique & privée et R&D ;
    - étude des vanneaux huppés ;
    - 12 publications ajoutées, titres français fidèles ;
    - profil du Dr Damien Crestel.
  - **Corrections** : redondance « cas d’études / éclairage concret » supprimée ; aucun lien vers l’ancien site.
- **En réflexion côté cliente** : remonter la carte des applications au-dessus de l’hélice ADN. Non fait, faisable en quelques minutes si elle confirme.
- **SEO/GEO** : voir [SEO-GEO.md](SEO-GEO.md). Nouvelles commandes :
  - `npm run check:seo` ;
  - `node scripts/indexnow.mjs [--changed]` ;
  - `node scripts/check-publications.mjs` ;
  - `scripts/make-social-images.mjs` et `scripts/prepare-licensed-photos.mjs` (avec `LDGENX_PLAYWRIGHT_MODULE`).
