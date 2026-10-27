# LDgenX — corrections demandées le 27 octobre 2026

Les dix demandes de l’e-mail d’Émilie Delpuech et les corrections des quatre publications de Damien Crestel sont intégrées en français et en anglais. La source éditoriale est le texte de l’e-mail et du document Word transmis intégralement par le propriétaire dans la conversation. Les titres originaux des publications, auteurs, DOI et légendes scientifiques sont conservés.

## Vérification des dix demandes

| Demande | Résultat |
| --- | --- |
| 1. Carte Artois-Picardie | Carte interactive conservée uniquement sur l’étude de cas Artois-Picardie, dans les deux langues. L’accueil comporte une présentation textuelle avec un lien vers l’étude. |
| 2. « Panels SNP » sur le dôme | Libellé retiré de l’aperçu de génomique des populations. L’approche scientifique reste décrite sur la page d’expertise. |
| 3. Génomique des populations | Texte intégré : « Développement de panels SNP sur mesure pour le suivi génétique, l’assignation de parenté et la mise en place de programmes de conservation. » |
| 4. Introduction ADNe | Formulation corrigée en « permet d’identifier les espèces à partir des traces ». |
| 5. Approche ADNe | Intitulé « Barcoding : dPCR ciblée » ; traduction correspondante en anglais. |
| 6. Projet en pratique | Bloc absent de toutes les pages d’expertise et présent sur les six pages Applications de chaque langue. |
| 7. Couleurs ERC | Suppression du surlignage bleu permanent de « Réduire ». Les trois termes ERC ont la même présentation ; le sélecteur des phases du projet garde son propre état actif. Les phases du projet ne sont plus présentées comme équivalentes aux trois étapes réglementaires. |
| 8. Matériel d’échantillonnage | Retiré des listes d’expertises : navigation, vues d’ensemble, recommandations et catalogue structuré. Lien explicite sur la page ADNe et accès conservé en pied de page. Ancienne adresse fonctionnelle, fil d’Ariane rattaché à l’ADNe. |
| 9. Recherche et développement | Contenu regroupé sur l’application Recherche publique & privée : introduction, besoin, quatre approches, prestations, usages, DNA EcoTrace, eDNAClock, CIR et modalités de collaboration. Les trois anciennes adresses R&D redirigent en HTTP 301 vers l’application correspondante. Les quatre publications auparavant classées dans cette expertise restent accessibles dans le contexte de cette application. |
| 10. Ressources et navigation | La rubrique rassemble trois guides pratiques, en complément des publications scientifiques. Elle est nommée « Guides & méthodes » et accessible en pied de page. La navigation principale comporte cinq entrées : Expertises, Applications, Études de cas, Publications et À propos. Connexion/compte, devis et choix de langue restent accessibles. Innovation reste accessible depuis les pages de recherche, À propos et le pied de page. |

## Publications de Damien Crestel

| Publication | Corrections intégrées |
| --- | --- |
| Water-borne cortisol is correlated with acclimatization temperature but not metabolic rate in a teleost fish | Population atlantique, trois ans, trois régimes saisonniers explicitement nommés, mesure en tunnel de nage et cortisol dans l’eau ; limite sur l’unique population étudiée et l’extrapolation aux populations méditerranéennes. |
| Quantitative genetics and GWAS reveal population-specific sex-ratio responses in wild European seabass (Dicentrarchus labrax) under various temperature scenarios | Résultat atlantique, héritabilité d’environ 0,62, sept SNP du chromosome 19 ; conditions expérimentales et rôle du gène non démontré dans cette étude. |
| Larval survival in European seabass (Dicentrarchus labrax) is shaped by the natural thermal regime of their population of origin and the level of introgression of Atlantic and Mediterranean genomes | Résumé fourni repris, quatre régimes, association entre introgression et survie ; recommandation sur les lignées sélectionnées et plage thermique trop faible pour déterminer la température maximale de survie des populations méditerranéennes. Le bloc de résultats a aussi été harmonisé avec cette limite. |
| Do European Seabass Larvae Grow Better in Their Natural Temperature Regime? | Hypothèse de variation à contre-gradient ajoutée à la limite. Le résultat décrit les longueurs larvaires dans les régimes testés ; la conclusion générale antérieure de « robustesse » a été retirée pour ne pas dépasser les observations. |

Les principes appliqués à cette passe sont la distinction entre méthode et application, l’accès aux informations pratiques dans leur contexte, et la distinction entre observation, association et mécanisme démontré. La relecture de cohérence a porté sur les autres résumés, les renvois, les filtres et les libellés du site. Les résultats scientifiques n’ont pas été réinterprétés à partir d’hypothèses nouvelles. Les mentions scientifiques de panels SNP utiles aux autres pages sont conservées.

## Recette

| Contrôle | Résultat |
| --- | --- |
| Build et TypeScript | Réussis : 151 pages publiques et 97 redirections. |
| HTML et liens internes | Réussis : 11 963 liens internes et 1 057 références d’images. |
| SEO | 147 pages indexables ; aucune erreur ni aucun avertissement signalé. |
| ESLint, typographie, contenus, essais ciblés et médias | Réussis ; 28 publications, 22 cibles d’essais et parité quantitative FR/EN conservées. |
| Recette spécifique aux demandes | Réussie dans les deux langues : carte, listes d’expertises, blocs Applications, contenu R&D, textes scientifiques, filtres, aperçus et ERC. |
| Navigation publique dans Chrome | 302 combinaisons page/largeur : les 151 pages à 320 et 1 440 px, sans anomalie détectée par les contrôles de chargement, débordement, images, H1, JavaScript et CSP. |
| Compte et navigation | 138 combinaisons de largeur/langue/session : visiteur, client et administrateur, 23 largeurs, deux langues ; connexions réelles, destinations par rôle, persistance et synchronisation entre onglets vérifiées. Comptes temporaires supprimés après recette. |
| Dernier ajustement scientifique | Huit contrôles supplémentaires : les deux articles concernés, deux langues, deux largeurs, après le dernier build. |
| HTTP | 151 pages, 97 redirections permanentes et vraie page 404 vérifiées sur le serveur de prévisualisation. |
| Relecture visuelle | Accueil, aperçu génomique des populations, ERC, contenu R&D et lien matériel examinés sur les captures de la version construite. |

Les résultats détaillés et les captures se trouvent dans [client-changes-2026-10-27](client-changes-2026-10-27/), notamment [la recette des demandes](client-changes-2026-10-27/acceptance-results.json), [les pages publiques](client-changes-2026-10-27/public-browser-results.json), [la navigation et les sessions](client-changes-2026-10-27/account-navbar-results.json) et [le dernier contrôle scientifique](client-changes-2026-10-27/scientific-followup-results.json). Le test reproductible est `npm run check:client-changes -- http://127.0.0.1:4174`, après le build et avec le serveur de prévisualisation démarré sur ce port.

## Publication

**Ces modifications sont construites et vérifiées dans le projet local ; elles ne sont pas encore publiées sur Cloudflare Pages.** La lecture de `https://ldgenx-12k.pages.dev/` le 27 octobre après cette recette retrouve toujours la carte sur l’accueil et ne retrouve pas le nouveau bloc textuel. La prévisualisation locale est disponible à `http://127.0.0.1:4174` tant que le serveur tourne. Aucun déploiement frontend ni changement de domaine n’a été déclenché pendant cette passe.

Cette recette porte sur les modifications de contenu et de navigation. Les éléments différés relatifs aux e-mails et aux CGV restent décrits dans [l’état de préparation à la production](PRODUCTION-READINESS-2026-10-27.md).
