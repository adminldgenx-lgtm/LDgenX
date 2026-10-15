# Sources et décisions éditoriales

Vérification le 5 octobre 2026. Le dossier fourni contenait onze illustrations, trois logos, des favicons et l’audit PDF. Aucun frontend, historique Git, contenu technique ou route réutilisable n’était présent.

## Sources

| Contenu                               | Source officielle                                                                                                                        |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Positionnement et chaîne scientifique | https://www.ldgenx.fr/ et brief fourni                                                                                                   |
| Faits clés de l’accueil               | https://www.ldgenx.fr/ (« notre équipe de plus de 10 ans d’expérience », « Accompagnement de A à Z », « Entreprise DeepTech française ») |
| Label Deep Tech Bpifrance             | https://www.ldgenx.fr/a-propos/partenaires (vignette « Labelised Deep Tech · bpifrance »)                                                |
| ADN environnemental                   | https://www.ldgenx.fr/services/adn-environnemental-adne                                                                                  |
| Génomique des populations             | https://www.ldgenx.fr/services/genomique-des-populations                                                                                 |
| Communautés microbiennes              | https://www.ldgenx.fr/services/analyse-des-communautes-microbiennes                                                                      |
| Sélection génomique                   | https://www.ldgenx.fr/services/selection et /services/selection-genomique                                                                |
| Bioinformatique                       | https://www.ldgenx.fr/services/bioinformatique                                                                                           |
| Séquençage et dPCR                    | https://www.ldgenx.fr/services/sequencage-dpcr                                                                                           |
| Biodiversité                          | https://www.ldgenx.fr/applications/biodiversite-conservation                                                                             |
| Aquaculture                           | https://www.ldgenx.fr/applications/aquaculture-peche                                                                                     |
| Agriculture                           | https://www.ldgenx.fr/applications/agriculture-agroecologie                                                                              |
| Environnement / énergies marines      | https://www.ldgenx.fr/applications/environnement-bureaux-d-etudes                                                                        |
| Innovation / R&D                      | https://www.ldgenx.fr/a-propos/innovation                                                                                                |
| Équipe                                | https://www.ldgenx.fr/a-propos/equipe                                                                                                    |
| Relations et partenaires              | https://www.ldgenx.fr/a-propos/partenaires                                                                                               |
| Contact / adresse / agenda            | https://www.ldgenx.fr/contact et page d’accueil                                                                                          |
| Étude Artois-Picardie                 | https://www.eau-artois-picardie.fr/etude-de-la-biodiversite-de-lichtyofaune-dans-les-estuaires-et-les-ports-avec-ladn-environnemental    |
| Audit SEO                             | `LDgenX-siteweb.pdf`, fourni par le client, 7 pages                                                                                      |

## Exactitude

- Aucune promesse chiffrée, certification, sensibilité, tarif ou délai technique ajouté.
- DNA EcoTrace et eDNAClock sont décrits comme projets de R&D et objectifs de recherche.
- Le projet Artois-Picardie est attribué au groupement Qualyse, LDgenX et Prelevmar, conformément à la source de l’Agence.
- Les sujets offshore et microplastiques sont présentés comme champs d’étude cités, sans résultats inventés. Le bar européen (nodavirose, Delpuech et al. 2022) et le panel de SNP sont deux sujets distincts : le bar renvoie aux travaux scientifiques (/services/selection-genomique), le panel reste un intitulé de cas sans page.
- Les partenaires suivent les trois groupes de la page officielle (instituts de recherche publique, soutiens et accompagnement, « Ils nous font confiance »). La page partenaires affiche les 24 logos publiés, recadrés sans leur cadre (`public/partners/`, aucun logo redessiné) ; l’accueil et l’orbite d’écosystème gardent les noms composés en texte.
- Les faits clés de l’accueil (« +10 ans », « Deep Tech », « De A à Z », « Station Ifremer ») reprennent mot pour mot ou résument des affirmations publiées sur ldgenx.fr. Aucun chiffre de projets, d’échantillons ou d’espèces n’est affiché.
- Étude Artois-Picardie : les résultats sont désormais publiés par l’Agence (article du 6 août 2026, rapport final v2 du 28 mai 2026, présentation de restitution du 30 juin 2026). La page de l’étude en reprend les objectifs, les constats, le protocole, les guildes, la comparaison avec le chalut, l’effet de la turbidité et les pistes, avec les figures officielles légendées. La richesse affichée est celle de chaque secteur dans le rapport ; **aucun total par site n’est cité**, car il varie entre les documents selon le marqueur et les filtres (13/11 sur la diapositive 11, 14 sur les diapositives de site, 15 dans le rapport). Les positions des sites sur la carte sont la moyenne des coordonnées de leurs stations (annexe 2 du rapport ; le tableau 1 répète par erreur les coordonnées de la Canche pour Dunkerque Ouest).
- Les fiches « En bref » des études n’utilisent que des éléments déjà présents dans l’étude ou sa source (commanditaire, groupement, milieux, approche).
- « Votre projet en pratique » et la FAQ reformulent des affirmations publiées : périmètre, restitution, calendrier et devis définis au cadrage ; matériel d’échantillonnage proposé ; accompagnement bioinformatique de données existantes ; implantation à la station Ifremer.
- Les appels à l’action « Demander un devis » et « Prendre rendez-vous » reprennent ceux du site officiel.
- Les biographies complètes et les listes de publications sont reprises de ldgenx.fr (FR) et ldgenx.com (EN) ; les résumés courts de l’équipe en sont tirés. Les portraits de studio sont générés à partir des photos publiées (voir « Portraits de l’équipe ») ; les photos d’origine sont dans `images/official/`.
- Les descriptions d’une ligne des expertises (menu, explorateur) reprennent https://www.ldgenx.fr/services ; celles des secteurs résument les listes « Applications » des pages officielles de chaque secteur. « Recherche publique & privée » et « Énergies marines renouvelables » n’ont pas de page officielle : leurs lignes reprennent la rubrique R&D (/services) et le cas « Biodiversité des parcs éoliens offshore » (/services/adn-environnemental-adne).
- La chaîne « De l’échantillon à la décision » suit les étapes de https://www.ldgenx.fr/a-propos. Les précisions techniques citent /services (graphique « Montage projet, Séquençage ADN, Analyses avancées, Rapport expert »), /services/adn-environnemental-adne (eau, sol, sédiments, biofilms), /services/materiel (pompe triple, stick pump, torpille) et la présentation de Maxime Lambert sur /a-propos/equipe.
- Les ressources sont des synthèses introductives sourcées. Aucun article réglementaire n’a été ajouté sans documentation juridique spécifique.

## Inventaire des images

### Illustrations générées (10 octobre 2026)

Dix-neuf illustrations générées avec ChatGPT à partir de références photographiques réelles (notes et sources : `LDgenX_images_new/LDgenX_reference_notes.md`, prompts : `LDgenX_generation_prompts.md`). Sources 1536 × 1024 conservées dans `images/generated/`, déclinées en WebP de 640, 860, 1100 et 1536 px. Ce sont des illustrations du sujet : elles ne représentent ni l’équipe, ni les locaux, ni le matériel, ni les sites ou résultats d’études de LDgenX. Aucun visage, texte lisible ou logo.

| Fichier         | Usage sur le site                                                      |
| --------------- | ---------------------------------------------------------------------- |
| conception      | Étape « Conception scientifique »                                      |
| sequencage      | Étape « Séquençage & dPCR » ; expertise Séquençage & dPCR              |
| bioinformatique | Étape « Bioinformatique » ; expertise Bioinformatique ; article        |
| interpretation  | Étape « Interprétation »                                               |
| decision        | Étape « Aide à la décision »                                           |
| biodiversite    | Secteur Biodiversité & Conservation ; menu Applications ; article ADNe |
| aquaculture     | Secteur Aquaculture & Pêche ; article filières aquacoles               |
| agriculture     | Secteur Agriculture & Agroécologie                                     |
| environnement   | Secteur Environnement & Bureaux d’études                               |
| recherche       | Secteur Recherche publique & privée                                    |
| eolien-offshore | Secteur Énergies marines renouvelables ; étude éolien offshore         |
| laboratoire     | Menu Expertises ; page À propos ; image de partage de l’accueil        |
| microbiologie   | Expertise Communautés microbiennes                                     |
| populations     | Expertise Génomique des populations                                    |
| bar-europeen    | Expertise Sélection génomique ; étude bar européen                     |
| innovation      | Expertise R&D ; en-tête de la page Innovation                          |
| microplastiques | Étude microplastiques                                                  |
| dna-ecotrace    | Projet DNA EcoTrace                                                    |
| ednaclock       | Projet eDNAClock                                                       |

Les onze anciennes illustrations (`images/Image ChatGPT…`) ne sont plus utilisées ; leurs fichiers sources sont préservés.

### Photographies publiées par LDgenX

Relevé du 10 octobre 2026 sur ldgenx.fr, conservées dans `images/official/` et servies à leur taille d’origine, sans agrandissement :

| Fichier               | Source officielle                                                    | Usage sur le site                                                     |
| --------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| terrain-prelevement   | /services/adn-environnemental-adne (« prélèvement en eaux turbide ») | Expertise ADN environnemental ; étape « Stratégie d’échantillonnage » |
| equipe-maxime         | /a-propos/equipe (Maxime Lambert au poste de travail)                | Étape « Analyses moléculaires »                                       |
| carte-artois-picardie | /services/adn-environnemental-adne (« carte d’échantillonnage »)     | Étude Artois-Picardie                                                 |
| materiel-pompe        | /services/materiel (« Pompe triple ADNe »)                           | Expertise Matériel d’échantillonnage                                  |

Mise à jour du 15 octobre 2026 (dossier `LDgenX_Images_2026-10-14`) : les fichiers d’origine du CMS (« default », 1000 px au plus) remplacent les vignettes pour le matériel (pompe ouverte 1000 px, torpille en mer 732 × 994, stick pump 405 px, capsules 1000 px), les photos des cas d’études (1000 px), la rivière (1000 px), la photo offshore (799 px) et les figures scientifiques (679 à 1000 px). Originaux dans `images/official/`.

Les illustrations générées qui montraient un matériel ou des installations qui ne sont pas ceux de LDgenX ont été remplacées par des photos publiées par LDgenX, à la demande de la cliente (un client ne doit pas recevoir un matériel différent de celui montré) :

| Emplacement                                                   | Avant (généré)                     | Maintenant (réel)                                                                             |
| ------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| Secteur Biodiversité & Conservation                           | opérateur en cuissardes avec pompe | `riviere` (photo de ldgenx.fr/a-propos)                                                       |
| Secteur Environnement & Bureaux d’études                      | perche de prélèvement dans un port | `terrain-palavas`                                                                             |
| Secteur Énergies marines renouvelables, étude éolien offshore | cylindre de prélèvement gris       | `cas-eolien-offshore` (prélèvements en mer, crédit « @biotope » visible ; droits à confirmer) |
| Expertise R&D, en-tête Innovation                             | pompe péristaltique sur table      | `equipe-maxime` (laboratoire LDgenX)                                                          |
| Étude microplastiques                                         | microscope et boîte de Petri       | `cas-microplastiques` (visuel publié pour ce cas)                                             |
| Ressource « ADN environnemental »                             | opérateur en cuissardes avec pompe | `terrain-prelevement`                                                                         |

Les fichiers à améliorer (netteté, définition) et les consignes pour ChatGPT sont dans `images/to-enhance/` (`BRIEF-GPT.md`) : amélioration seulement, sans modifier le matériel, les personnes ni les textes. Les figures scientifiques, portraits et logos en sont exclus. Les photos d’espèces des cas sont des photos tierces publiées par LDgenX (droits à confirmer).

### Atlas des applications

Section « Vos terrains d’application » (accueil et page Applications) : paysage illustratif généré avec ChatGPT le 14 octobre 2026, de la forêt à la mer (forêt et zone humide, cultures et vignes, station de recherche, port, élevage en mer, mer ouverte), à la demande de la cliente pour un rendu moins maritime. Maître 3840 × 2160 (agrandi depuis une génération 1672 × 941) dans `ldgenx-atlas-2d/mainland/`, fichiers web `public/atlas/mainland-3840.webp` et `mainland-2400.webp`. Le masque d’eau `public/atlas/mainland-water.png` est calculé sur les pixels de l’image (eau reliée à la mer ouverte, plus rivière et étangs). Les deux éléments d’éolienne détourés viennent de la version précédente (`ldgenx-atlas-2d/assets/`), placés dans la mer ouverte en haut à droite. La géographie est imaginaire : aucun lieu, site client ou projet réel n’y est représenté. Les textes des fiches (titre, accroche, champ d’application, besoins, expertises mobilisées) reprennent le contenu des pages secteurs. Le fichier de 4000 px est un agrandissement d’un original de 1672 px : le zoom est limité à 1,45× ; un original de meilleure définition, au même cadrage, peut le remplacer sans autre changement.

### Carte de l’étude Artois-Picardie

Section « La génomique en pratique » (accueil et page de l’étude) : une carte marine parcourue au défilement, générée par `scripts/build-study-geo.py` dans `src/lib/study-geo.ts` et chargée à l’approche de la section. Trait de côte de la Seine-Maritime à la Belgique et côte du Kent : ways `natural=coastline` d’OpenStreetMap (`data/geo/osm-coastline-opale.json`). Rivières : `waterway=river` par nom (`data/geo/osm-rivers-opale.json`). Frontières et limites départementales : `boundary=administrative` niveaux 2 et 6, terre seule (`data/geo/osm-borders-opale.json`). Tous © contributeurs OpenStreetMap, licence **ODbL** ; crédit et lien affichés sur la carte. Vue de la France et des pays voisins : Natural Earth 1:50m (domaine public, `data/geo/natural-earth-europe.json`). Les huit sites sont ceux de la légende de la carte d’échantillonnage publiée (`carte-artois-picardie`), placés à leur ville, port ou embouchure : la carte le signale (« Emplacements indicatifs »). Les villes sont placées à leurs coordonnées usuelles. Le type de milieu (port, baie, estuaire) découle du nom du site ; les départements sont géographiques. La carte ne figure aucun résultat : l’eau animée (particules portées vers la mer du Nord le long des côtes, panaches turbides aux embouchures, marée) est une illustration, signalée sur la carte. Les phrases sur courants, turbidité et marées décrivent les phénomènes en termes généraux, sans mesure. Le texte (question, trois étapes, apports) reformule la publication de l’Agence de l’eau (`featuredStudy` dans `src/content/fr.ts`).

### Autres illustrations animées

- Laboratoire R&D (accueil, page Innovation, pages des projets ; `src/lib/lab-scenes.ts`) : quatre scènes par projet, calées sur les quatre étapes publiées (fragments d’ADN dans l’eau, lectures longues, regroupements, restitution ; marques sur l’ADN, signal, horloge et structure par âge). Ce sont des images du principe, légendées « Illustration du principe du projet » ; les groupes, barres et colonnes ne représentent aucune donnée.
- Écosystème en orbite (accueil, À propos, Partenaires) : les trois groupes et les noms publiés sur /a-propos/partenaires, sans logo ni relation ajoutée. La liste complète reste dans la page pour les lecteurs d’écran.
- Hélice de points (en-têtes des pages, appels à l’action) : décor, sans signification.
- Équipe : chaque personne renvoie à l’expertise la plus proche de son rôle publié (Génomique des populations, Bioinformatique, Séquençage & dPCR).

### Modèle 3D de l’ADN

Section « De l’échantillon à la décision » : modèle « DNA » de LucasPresoto (https://sketchfab.com/3d-models/dna-547d42f6c0184232a945051b6952a39e), licence **CC BY 4.0**, recoloré pour LDgenX (fichier source : `models/dna-ldgenx-particles.glb`). Le site n’en garde que les 17 000 centres de particules (`public/models/dna-particles.bin`, généré par `scripts/extract-dna-particles.py`). Le crédit est affiché dans la section, comme l’exige la licence. Les positions le long de l’hélice sont des repères d’illustration : elles ne correspondent à aucune région de la molécule.

### Portraits de l’équipe

`portrait-maeva`, `portrait-emilie`, `portrait-maxime` (sources 1122 × 1402 dans `images/team/`, WebP 480 et 900 px) : portraits de studio générés avec ChatGPT à partir des photos publiées sur /a-propos/equipe. **À faire valider par chaque personne avant publication** ; à défaut, les photos d’origine restent dans `images/official/`.

`portrait-damien` (Damien Crestel, bioinformaticien, ajouté le 15 octobre 2026) : photo réelle transmise par LDgenX avec sa présentation, recadrée en 4:5 (source `images/team/photo-damien.png`, WebP 480 et 659 px). Ce n’est pas un portrait de studio : pour un rendu homogène, soit générer un portrait de studio à partir de cette photo comme pour les trois autres (à faire valider par Damien), soit passer toute l’équipe sur des photos réelles. Sa biographie reprend son texte mot pour mot ; il n’a pas de page de publications.

Le wordmark est utilisé en en-tête, le logo complet en pied de page, le symbole reste disponible dans `public/brand`. Les favicons fournis sont conservés. Seules les marges de canvas ont été recadrées ; le dessin n’est pas modifié.

Palette issue des variantes du logo : navy `#03254B`, vert accent `#73B50F`, vert texte `#2A7416`, complétée par blanc, ivoire `#F7F8F4` et navy sombre `#082F42`. Manrope et Inter sont auto-hébergées.

## À confirmer par LDgenX avant publication

1. **Mentions légales** : responsable de publication et hébergeur effectif. Les informations disponibles de la société sont intégrées ; ces deux identités restent explicitement à compléter.
2. **Confidentialité** : modalités de conservation et de traitement des e-mails reçus. Le texte décrit exactement le fonctionnement technique du site ; la politique définitive de l’entreprise nécessite sa validation.
3. **Contact** : choisir un service d’envoi de formulaire et définir `VITE_CONTACT_ENDPOINT` au build (voir README) ; à défaut, le formulaire prépare un e-mail. Confirmer la durée et le format de l’échange proposé sur l’agenda.
4. **Matériel** : références, disponibilités et conditions de vente n’étaient pas accessibles depuis la source. Le service conduit à un échange, sans catalogue fictif.
5. **Études** : fournir les résultats et livrables détaillés pouvant être publiés pour les sujets seulement cités. Les études restent sourcées et limitées aux faits publics.
6. **Portraits et photographies** : faire valider par Maeva, Emilie et Maxime leurs portraits de studio générés à partir de leurs photos. Les photos reprises de ldgenx.fr sont en résolution web (470 à 1000 px) : fournir les originaux haute définition et confirmer l’autorisation pour la photo créditée « @biotope ».
7. **Anglais** : traductions validées et mapping des URLs sur le domaine anglais avant `hreflang` réciproque.
8. **Images** : les dix-neuf illustrations sont générées. Un reportage réel (laboratoire de la station Ifremer, campagnes de terrain) reste la priorité visuelle et peut les remplacer emplacement par emplacement.
9. **Logos partenaires** : fournir des fichiers vectoriels (SVG) ou haute résolution sans cadre et l’accord d’affichage, pour remplacer les noms composés.
10. **Faits clés et références** : valider la formulation des quatre faits de l’accueil, le regroupement des organisations (EPHE figure parmi « Ils nous font confiance » sur la page officielle) et, si possible, fournir des chiffres publiables (projets, échantillons, publications).

## Réponse à l’audit

Titres corrigés et courts, H1 unique, canoniques, métadonnées sociales, schémas Organization/WebSite/WebPage/Service/Person/Article/BreadcrumbList, regroupement de la sélection génomique avec redirection, bibliothèque de ressources et enrichissement des pages par besoin/approche/accompagnement/relations. Les délais, prix et exemples anonymisés demandés dans l’audit ne sont pas inventés pour atteindre une longueur arbitraire.
