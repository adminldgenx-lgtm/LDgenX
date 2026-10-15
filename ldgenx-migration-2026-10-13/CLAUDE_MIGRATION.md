# LDgenX — Migration des contenus vers la nouvelle plateforme

Collecte publique effectuée le 13 octobre 2026 à partir de [ldgenx.fr](https://www.ldgenx.fr/) et de [ldgenx.com](https://www.ldgenx.com/). Ce document distingue les contenus constatés des propositions d’intégration. Les pages HTML originales, les textes, les images et les liens sources sont conservés dans le pack.

## Ce qui est disponible

| Élément | Couverture |
|---|---|
| Pages de contenu distinctes | 49 : 25 FR et 24 EN |
| Adresses de pages contrôlées | 64 : 51 répondent en HTTP 200, dont deux variantes `/Services`; 13 répondent en 404 |
| Images publiées | 194 adresses, correspondant à 147 fichiers distincts; aucun téléchargement manquant |
| Publications scientifiques en français | 15 références, avec auteurs, années et liens tels que publiés |
| Logos de la page Partenaires | 24, répartis dans les trois groupes d’origine |
| Sources Artois-Picardie complémentaires | Article de l’Agence de l’eau, rapport final original et présentation de restitution originale |

Le périmètre couvre les pages publiques découvertes dans les sitemaps, l’index et les liens internes des deux domaines. Les données privées du CMS, les demandes reçues, le CRM, les statistiques et les contenus non accessibles publiquement ne font pas partie de cette collecte. Les scripts et routes génériques de panier de l’ancien CMS sont archivés dans le HTML, mais ne sont pas considérés comme une offre e-commerce à recréer.

## Fichiers à lire en premier

- `INVENTAIRE.md` : liste des pages et problèmes constatés, avec liens sources.
- `inventory-pages.csv` : correspondance de chaque page avec sa famille et son emplacement conseillé.
- `data/content.json` : textes, blocs, liens, images, formulaires et métadonnées source de chaque page distincte.
- `CONTENUS_FR.md` et `CONTENUS_EN.md` : compilations lisibles des contenus; elles conservent le texte source plutôt qu’une réécriture commerciale.
- `data/assets.json` et `inventory-assets.csv` : provenance des images, dimensions, textes alternatifs, pages d’utilisation et chemin local.
- `data/publications.json`, `data/partners.json`, `data/language-pairs.json` : listes prêtes à adapter au modèle de contenu de la plateforme.
- `broken-links.csv` et `redirects-draft.csv` : corrections et redirections proposées, non déployées.
- `source/fr/` et `source/en/` : HTML, Markdown et métadonnées par page. En cas d’ambiguïté d’extraction, l’HTML original fait foi.
- `source/image-text-drafts/` et `data/image-text-drafts.json` : texte détecté automatiquement dans les images, à vérifier avant utilisation.

Traiter le corpus page par page : utiliser les fichiers Markdown et JSON de `source/fr/` et `source/en/`, ou filtrer `data/content.json` par `source_url`. Le JSON agrégé dépasse 1 Mo; les fichiers individuels permettent une migration progressive et évitent de saturer le contexte de l’agent.

## Organisation recommandée

Conserver la mise en scène déjà développée sur l’accueil : ADN, expertise, atlas, étude côtière, R&D, références et équipe. Ces sections servent d’introduction et d’accès aux contenus complets. Les pages existantes contiennent des détails qu’une seule page d’accueil ne doit pas faire disparaître.

| Contenu d’origine | Emplacement dans la nouvelle plateforme |
|---|---|
| Six expertises scientifiques et leurs approches/prestations | Résumé sur l’accueil, page complète par expertise, liens vers applications et études pertinentes |
| Matériel d’échantillonnage | Page dédiée avec pompe triple, Stickpump, torpille, caractéristiques et visuels réels |
| Quatre domaines d’application | Pages complètes accessibles depuis l’atlas : biodiversité/conservation, aquaculture/pêche, agriculture/agroécologie, environnement/bureaux d’études |
| Études longues sur conservation, traçabilité et sélection génomique | Pages détaillées avec figures et références; accès depuis les expertises et les études |
| Artois-Picardie | Présentation courte dans la section côtière, puis page dédiée pour contexte, méthodes et résultats documentés |
| Équipe | Portraits et biographies courtes sur l’accueil, biographies complètes accessibles, liens vers les publications de Maeva et Emilie |
| DNA EcoTrace et eDNAClock | Stage R&D sur l’accueil et détail du projet; conserver leur présentation comme travaux d’innovation |
| Partenaires/références | Conserver les groupes et leur contexte, avec les logos actuellement publiés |
| Contact | Coordonnées et formulaire réels, plus une réservation reliée au prestataire retenu |
| CGV | Page dédiée reliée au pied de page; préserver le texte source sans réécriture automatique |

Préserver les chemins existants par défaut. Si l’arborescence actuelle du nouveau projet utilise d’autres chemins, compléter la correspondance ancienne URL → nouvelle URL pertinente avant toute mise en production. Les chemins indiqués dans l’inventaire sont une base de travail, pas une description d’un déploiement déjà réalisé.

## Points éditoriaux constatés

- L’équipe publiée est **Dr Maeva Leitwein**, **Dr Emilie Delpuech** et **Maxime Lambert**, ingénieur laboratoire. Conserver les portraits réels et les biographies; ne pas générer de nouveaux visages.
- Les listes de publications affichées s’arrêtent à 2022. Certaines références sont présentées comme prépublications ou soumissions. Préserver ces mentions; demander au client les mises à jour souhaitées, sans transformer une prépublication en article validé.
- Les études académiques détaillées citent les travaux des membres de l’équipe. Conserver les auteurs, dates et revues; ne pas présenter automatiquement tous ces travaux comme des contrats commerciaux réalisés par LDgenX.
- Le groupe « Les instituts de recherche publique » explique le parcours de formation et de recherche des fondatrices. Conserver ce contexte; le groupe n’équivaut pas à une liste uniforme de clients.
- Le domaine anglais contient plusieurs anciens titres SEO « GenExpert » et des titres vides. Les archiver comme sources, mais rédiger les nouvelles métadonnées sous la marque LDgenX, adaptées au contenu réel de chaque page.
- L’accueil affiche une actualité BlueTechShow des 20–21 octobre 2026. La placer dans un bloc d’actualité daté plutôt que dans un argument commercial permanent.
- L’accueil renvoie vers `https://cal.com/ldgenx-echange/decouverte`, alors que Contact renvoie vers `https://axonaut.com/public/booking/b4afed/pageShow/rendez-vous-avec-ldgenx-9b56c1`. Garder les deux sources dans les données et identifier le lien actuellement souhaité avant d’unifier les CTA.
- La page Contact publie `info@ldgenx.fr` et « Station Ifremer, 51 rte de Maguelone, 34250 Palavas-les-Flots, FRANCE ». Utiliser cette adresse dans son contexte de contact; ne pas la remplacer automatiquement par une adresse administrative provenant d’une facture.
- Des descriptions de prestations et des tarifs sont intégrés à des PNG. Les fichiers originaux sont disponibles; l’OCR est un brouillon. Six montants lisibles ont été transcrits et vérifiés visuellement dans `data/verified-image-price-transcriptions.json`. Leur actualité commerciale reste à confirmer avec le client. Le bas du visuel tarifaire de la torpille est coupé; aucune ligne manquante n’a été inventée.

## Artois-Picardie : utiliser les sources publiques disponibles

Le site ADNe pointe vers [cet article de l’Agence de l’eau Artois-Picardie](https://www.eau-artois-picardie.fr/etude-de-la-biodiversite-de-lichtyofaune-dans-les-estuaires-et-les-ports-avec-ladn-environnemental), publié le 6 août 2026. Il contient des résultats et renvoie vers :

- [Le rapport final original](https://www.eau-artois-picardie.fr/sites/default/files/rapport_final_adne_estuaires_et_ports_aeap_0.pdf), archivé dans `assets/documents/rapport_final_adne_estuaires_et_ports_aeap_0.pdf`.
- [La présentation de restitution originale](https://www.eau-artois-picardie.fr/sites/default/files/presentation_reunion_de_restitution_adne_estuaires_et_ports_aeap_30062026_0.pdf), archivée dans `assets/documents/presentation_reunion_de_restitution_adne_estuaires_et_ports_aeap_30062026_0.pdf`.

La formulation antérieure « aucun résultat n’est public » ne doit donc pas être conservée. Il existe une base publique pour une page détaillée, en complément du support envoyé directement par le client.

Pour cette page, proposer une carte de la côte reliée à trois vues : « Espèces détectées », « Diversité par site » et « Analyses détaillées ». La sélection d’un lieu met à jour ses informations; les figures restent accompagnées de leur source, légende, protocole et périmètre d’analyse.

L’article distingue huit grands sites portuaires/estuariens. La présentation officielle mentionne aussi quinze stations et quarante-cinq échantillons/filtres, ainsi que deux marqueurs génétiques. Ne pas employer « site », « station » et « échantillon » comme des unités interchangeables. Les figures envoyées par le client présentent des valeurs différentes dans certaines vues; vérifier leurs jeux de données et filtres avant de les réunir dans un tableau de bord.

Ne pas mélanger le protocole scientifique de cette étude avec les scènes illustratives de DNA EcoTrace. Les documents officiels indiquent leur matériel et leurs analyses; les animations génériques restent identifiées comme illustrations du principe.

Pour produire de vrais graphiques interactifs, obtenir les tableaux CSV/Excel validés et leurs définitions. En attendant, les figures et PDF sources peuvent être consultables tels quels, avec une présentation HTML des informations textuelles documentées. Aucun compte d’espèces, pourcentage, résultat ou matrice ne doit être déduit d’une animation ou inventé à partir d’une capture peu lisible.

## Consignes de migration technique

Créer un modèle de contenu adapté au projet existant : services, applications, études, équipe, publications, références, projets R&D, matériel et contact. Chaque entrée doit conserver une provenance : URL d’origine, fichier source, langue et date de collecte. Séparer les contenus de l’animation pour pouvoir les mettre à jour.

Importer les images via `data/assets.json` et les héberger avec le nouveau projet. Conserver la correspondance entre ancienne URL, fichier local et nouvelle URL. Ne pas remplacer les figures scientifiques par des images générées. Les illustrations générées précédemment pour la nouvelle plateforme sont des assets distincts de cette collecte publique.

Recréer les formulaires avec le mécanisme d’envoi réel du nouveau projet. Le HTML public fournit les champs et liens, pas l’accès au backend de l’ancien CMS; ne pas réutiliser aveuglément ses actions POST. Lier les cartes d’expertise, les applications et les études à leurs pages réelles.

Pour les pages dont l’URL change, préparer des redirections permanentes vers la page correspondante, mettre à jour les liens internes, les canoniques et le sitemap. Éviter de renvoyer toutes les anciennes pages vers l’accueil. Pour les langues, conserver la correspondance page par page et définir la stratégie `.fr` / `.com` ou `/en/` selon les domaines réellement retenus. Référence : [Google Search Central — migrations de sites](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes).

Vérifier les textes, noms, unités, liens, images et routes importés; valider le build du projet et la navigation sur mobile. Conserver les animations déjà réalisées, les interactions clavier et les alternatives de mouvement réduit. Les propositions de redirections sont uniquement des fichiers de préparation : aucune configuration externe ni mise en production n’a été effectuée pendant la collecte.

## Instruction à donner à Claude

Tu travailles dans le projet LDgenX déjà développé. Effectue la migration des contenus publics du pack joint vers la nouvelle plateforme, en préservant sa direction visuelle et ses sections animées existantes. Commence par lire `CLAUDE_MIGRATION.md`, `INVENTAIRE.md` et `inventory-pages.csv`, puis inspecte l’arborescence réelle du projet. Consulte ensuite les sources page par page dans `source/fr/` et `source/en/`, ou filtre `data/content.json` par URL selon le contenu à importer.

Utilise les sources pour enrichir les pages et les relier aux résumés de l’accueil. Conserve les détails des expertises, applications, matériel, biographies, publications, études et projets R&D. Utilise les fichiers locaux d’images et leur provenance. Les métadonnées anciennes sont des sources, pas des textes à recopier sans contrôle. Préserve les nuances scientifiques, citations et mentions de prépublication. Aucun fait scientifique ou partenariat ne doit être ajouté sans source.

Implémente les contenus vérifiables, les routes, les liens et la présentation responsive. Prépare la correspondance des anciennes URL avec les nouvelles si elles diffèrent. Signale précisément les points qui nécessitent une décision du client — réservation, tarifs actuels, actualisation des publications et données structurées de l’étude — tout en terminant la migration indépendante de ces réponses. N’invente pas de valeurs pour rendre un graphique interactif. Termine par une liste des pages importées, des liens corrigés, des contrôles exécutés et des données encore nécessaires.
