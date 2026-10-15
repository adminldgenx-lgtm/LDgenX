# LDgenX — Dossier recherche et publications

Vérification du 15 octobre 2026. Ce dossier rassemble les **15 références scientifiques présentes sur les pages de Maeva Leitwein et Emilie Delpuech**, les rapproche des versions publiées et prépare leur intégration à la nouvelle plateforme.

## Commencer

1. Ouvrir `INDEX.html` pour parcourir le catalogue local.
2. Donner à Claude le dossier décompressé et le contenu de `CLAUDE_START.md`.
3. Utiliser `INTEGRATION.md` pour l’organisation et la présentation des contenus.

## Couverture réelle

- **15 articles de revue identifiés et vérifiés**, avec titres finaux, auteurs, DOI et dates.
- **9 PDF intégraux d’articles publiés**, accompagnés des textes XML et Markdown disponibles.
- **1 article de revue intégral supplémentaire en HTML/Markdown** : la revue sur les haplotypes.
- **3 textes intégraux de prépublications**, conservés comme versions distinctes des articles finaux.
- **2 notices fondées sur le résumé de l’article final**, sans prétendre disposer de leur texte intégral.
- **46 fichiers de figures originales**, avec légendes, provenance et informations de licence.
- **15 fiches éditoriales en français**, comprenant question, méthode, apport, limite et proposition de représentation.

Les prépublications ne remplacent pas silencieusement la version finale. `data/publications.json` décrit séparément le statut de la publication et la version du texte récupéré. Les synthèses éditoriales des fiches s’appuient sur le résumé de l’article final; les textes intégraux servent à approfondir et à contrôler une rédaction plus détaillée.

## Arborescence

- `fiches/P01.md` à `fiches/P15.md` : fiches brèves à lire une à une.
- `sources/Pxx/` : PDF, XML, textes de consultation et métadonnées, selon disponibilité.
- `figures/Pxx/` : fichiers téléchargés sans modification.
- `data/publications.json` : catalogue structuré pour le site.
- `data/figures.json` et `figure-index.csv` : légendes, tailles, licences et attributions.
- `data/linked-resources.json` : liens de données et de code repérés dans les articles; leur contenu n’est pas téléchargé ni validé ici.
- `publications-index.csv` et `bibliography.bib` : bibliographie réutilisable.
- `corrections.csv` : titres, années et statuts à rectifier ou à préciser.
- `MANQUANTS.md` : textes finaux ou compléments à demander aux auteurs.
- `checksums.sha256` : contrôle d’intégrité.

## Corrections utiles

Le travail sur la méthylation chez le capelan possède un article final dans *Evolution*, volume 77 (2023), avec une première publication en ligne en décembre 2022 : DOI `10.1093/evolut/qpac028`.

Le travail d’Emilie sur la résistance virale du bar européen possède un article final publié en 2023 : DOI `10.1186/s12711-023-00805-2`. Son titre final précise **IFI6/IFI27-like**.

Plusieurs intitulés anciens sont des titres de travail. La revue sur les haplotypes relève du fascicule 2020; la bibliographie conserve séparément les dates de première mise en ligne et de fascicule.

## Utilisation sur le site

Ce dossier est une **source de travail**, à garder hors du répertoire public. Importer seulement les contenus et fichiers sélectionnés.

Huit articles récupérés portent une licence CC BY. Les figures correspondantes peuvent être envisagées avec attribution, lien de licence et contrôle d’éventuelles mentions de droits tiers. D’autres sources portent des restrictions non commerciales ou sans modification : elles sont présentes pour consultation et ne doivent pas être publiées automatiquement sur le site commercial. `figure-index.csv` distingue ces situations; il n’accorde aucune autorisation supplémentaire.

Les propositions de visuels sont pédagogiques. Elles ne fournissent aucune mesure nouvelle. Pour transformer les figures en vrais graphiques interactifs, utiliser des tableaux de données exacts, identifier le protocole et conserver les unités et limites de l’article.

Les références sont des publications **coécrites par des membres de l’équipe**, avec d’autres auteurs et institutions. Ne pas toutes les présenter comme des contrats ou résultats commerciaux de LDgenX. La liste n’est pas une recherche exhaustive de toutes leurs publications récentes, ni une bibliographie de Damien Crestel.

## Sources principales

- https://www.ldgenx.fr/equipe/dr-maeva-leitwein
- https://www.ldgenx.fr/equipe/dr-emilie-delpuech
- Notices d’articles : https://europepmc.org/ et https://pubmed.ncbi.nlm.nih.gov/
- Métadonnées DOI : https://api.crossref.org/works/
- Texte et figures : Europe PMC / PubMed Central, pages d’éditeurs et bioRxiv, indiqués individuellement dans chaque fiche et entrée JSON.

Les recherches d’accès utilisent les sources publiques, sans compte éditeur ni accès institutionnel. Les absences et blocages sont signalés dans `MANQUANTS.md`.
