# Relais Claude — LDgenX — 30 octobre 2026

Ce document décrit l’état du projet à la fin du travail de Codex. Les dates et états ci-dessous sont un instantané, à comparer au dépôt et au déploiement avant toute nouvelle intervention.

## État final du relais (30 octobre, soir)

**Ce relais est terminé et livré.** Production : commits `1d27576` et `6f147e7`, déploiement Cloudflare `bd50f88b-1f51-45ff-810f-3271fab096d4`. Le bilan à jour, les corrections et les preuves sont dans [RELEASE-CONTENT-MANAGEMENT-2026-10-30.md](RELEASE-CONTENT-MANAGEMENT-2026-10-30.md). Le reste de ce document décrit l’état avant cette livraison : ses « changements locaux » et « à vérifier » sont historiques.

**Reste ouvert :** une vraie publication d’une page ou d’une image n’a pas été exécutée en production. Le test contrôlé a été refusé à l’étape d’autorisation, car il modifie une page publique ; il dépend du propriétaire. Voir la section « Not verified » du bilan.

## Demande à poursuivre

Le propriétaire veut terminer l’administration éditoriale sans casser le site ni les fonctions Supabase/Google Agenda déjà opérationnelles :

1. Navigation publique : afficher **Ressources** en français et **Resources** en anglais, avec le lien vers `/ressources` et `/en/resources`.
2. Rendez-vous : le visiteur/client réserve avec **LDgenX**, sans sélectionner un membre de l’équipe. Garder l’affectation, les disponibilités et les calendriers par personne en interne.
3. Administration : ajouter/changer facilement l’image d’un contenu, voir les miniatures, supprimer depuis la liste avec confirmation et restauration possible.
4. Créer de nouveaux contenus dans Expertises, Applications, Études de cas, Publications et Ressources, en conservant le modèle graphique de chaque rubrique.
5. Permettre la modification simple des pages principales de ces rubriques, et des autres pages publiques appropriées. Le propriétaire a répondu **« do the best option »** à la question sur l’étendue de l’édition.
6. Vérifier complètement le travail, puis terminer sa livraison par le workflow GitHub/Cloudflare existant. Le propriétaire a déjà demandé les changements ; ne pas refaire une longue phase de questions.

## Dépôt et production : distinction essentielle

- Répertoire de travail actuel : `/Users/optimumtech/Desktop/Websites /Clients/LDgenX` — attention à l’espace après `Websites`.
- Dépôt canonique : `https://github.com/adminldgenx-lgtm/LDgenX.git` ; `origin` a été corrigé vers cette adresse. L’ancien `optimum-tech-911/LDgenX` redirige vers le même dépôt, ce n’est pas un deuxième projet.
- Branche actuelle : **main**, dernier commit poussé et déployé connu : **`b2526de` — Expose articles and guides in the main navigation**.
- Site : **https://www.ldgenx.fr**. Cloudflare Pages : projet **ldgenx** ; dernier déploiement frontend connu : **`606db6f5-4fef-41aa-83a8-2cde2dee6fed`**.
- Ce commit déployé ajoute encore le libellé **Articles**. Le changement **Ressources**, les nouveaux contrôles éditoriaux et le changement de réservation sont actuellement **locaux, non commités et non déployés**.
- Il y a un ensemble important de modifications locales et de nouveaux fichiers. **Les conserver et les relire ; ne pas faire reset/clean/reclone par-dessus.** `git diff` et `git status --short` sont la référence pour leur liste exacte.
- Une ancienne divergence locale a été réconciliée sans perdre le commit utilisateur `4fe4761` (« v2 ») : merge `5b90d87a16f681f1f174a7afcdab8f1cbf5606c8`, arbre vérifié identique à v2. Branche de secours : `backup/main-before-sync-20261030-4fe4761`.
- Le checkout racine est désormais celui à utiliser. `/tmp/ldgenx-auth-release` et `/tmp/ldgenx-domain-publish` sont des anciens répertoires de livraison, pas l’état courant à recopier sur le projet.

## Accès et secrets

- Projet Supabase : **`rkkvvqwgxbtnvewyrylj`**, URL `https://rkkvvqwgxbtnvewyrylj.supabase.co`.
- Les accès sont déjà enregistrés localement dans **`.env.supabase.local`**, ignoré par Git : token de gestion, référence du projet, service role et autres secrets de provisionnement. Ne jamais afficher leurs valeurs dans les logs, le chat, la documentation ou un commit.
- `.env.production` et `.env.local` fournissent les variables publiques Vite. Les secrets serveur ne doivent pas devenir des variables VITE.
- Utilitaires existants : `scripts/lib/supabase-management.mjs` (`credentials`, `ref`, `query`, `literal`, `management`, `serviceKey`). Pour les scripts QA Node qui contactent Supabase, utiliser `installQaJsonTransport()` de `scripts/lib/qa-http.mjs` : HTTPS natif Node était intermittent sur cette machine. Le transport curl transmet les secrets via stdin, pas dans les arguments de processus.
- Ne pas réinitialiser les mots de passe, secrets OAuth, paramètres Auth, calendriers ou DNS pour « repartir proprement ».

## Backend déjà modifié en production

Les changements suivants ont été appliqués AVANT ce relais, même si le frontend correspondant est encore local :

- Migration **`20261030110000_editorial_management.sql` appliquée** : corbeille `deleted_at/deleted_by`, index actif, types autorisés étendus à six.
- Migration **`20261030113000_editorial_page_paths.sql` appliquée** : les contenus de type `page` acceptent les chemins imbriqués et le slug vide de l’accueil ; les autres types conservent leur règle de slug stricte.
- **Edge Function `editorial` redéployée avec succès** via `npm run supabase:editorial-deploy`.
- Ces changements sont additifs et compatibles avec l’ancien frontend. Ne pas les supprimer parce qu’ils ne sont pas encore dans GitHub.
- `scripts/setup-editorial.mjs` applique les migrations de façon idempotente et prépare les données locales manquantes. L’import des 74 copies utilise `on conflict(id) do nothing` : il ne doit jamais écraser les brouillons du client ni publier les contenus.

## Travail local réalisé

### Types, routes et publication

`supabase/functions/_shared/editorial.ts` contient maintenant six types : `article`, `study`, `publication`, `service`, `application`, `page`.

- Article/guide → `/ressources/...` ou `/en/resources/...`.
- Étude de cas → `/etudes-de-cas/...` ou `/en/case-studies/...`.
- Publication scientifique → `/recherche/...` ou `/en/research/...`.
- Expertise → `/services/...` ou `/en/services/...`.
- Application → `/applications/...` ou `/en/applications/...`.
- Page du site → chemin existant choisi dans un registre autorisé ; pas de route libre vers l’admin ou les pages privées.

Les nouvelles expertises et applications utilisent le modèle public `PageHero`, le contenu riche et le CTA final, avec cartes dans les pages de rubrique. Les nouveaux éléments ne sont pas encore ajoutés automatiquement à tous les sous-menus statiques des méga-menus ; les listes de rubrique et les liens publics doivent rester accessibles.

Fichiers principaux : `src/editorial/PublicDocument.tsx`, `context.tsx`, `meta.ts`, `PageWriting.tsx`, `editorial.css`, `src/App.tsx`, `src/components/ui.tsx`, `src/pages/Expertise.tsx`, `Home.tsx`, `Knowledge.tsx`, `src/entry-editorial-worker.ts`, `scripts/build-editorial-worker.mjs`.

### Édition simple des pages existantes

- Registre de **64 routes publiques FR/EN**, généré par `scripts/prepare-editorial.mjs` dans `supabase/functions/_shared/editorial-pages.ts` depuis les vrais modèles SSR : accueil, expertises, applications, études, publications, ressources, à propos et plusieurs autres pages publiques.
- Admin : bouton **« Modifier une page du site »** dans `/admin/contenus`, choix de la langue puis de la page. Réouvrir une page déjà préparée réutilise sa copie existante. Le chemin est verrouillé par le marqueur `page:<path>`.
- Modifications prévues : **titre, introduction, image de couverture et blocs de contenu supplémentaires**. Les modules d’origine et interactions sont conservés ; les ajouts riches se placent après le hero.
- **Limite à expliquer honnêtement : tous les paragraphes historiques codés dans les composants ne sont pas éditables individuellement.** Ne pas promettre un éditeur intégral des anciens modules. Si une édition plus complète est nécessaire, l’ajouter proprement au modèle existant sans remplacer les pages par un article générique.
- Retirer/supprimer une personnalisation de page doit restaurer sa présentation d’origine, pas rendre la route existante inaccessible.
- Versions française et anglaise séparées ; pas de traduction automatique ni de publication liée automatique.

### Images, liste et corbeille

- Éditeur : section couverture remontée en haut de la colonne principale avec bouton visible, texte alternatif, légende, crédit et licence/source.
- Liste : miniatures privées signées, actions Modifier / ajouter ou changer l’image / Supprimer. Les boutons ne sont pas imbriqués dans un lien englobant toute la carte.
- Suppression avec confirmation = **corbeille récupérable**, conservation des brouillons/historiques/médias. Les contenus publiés deviennent retirés. Restaurer recrée un brouillon privé, remet la relecture scientifique à faire et **ne republie jamais automatiquement**.
- API POST `/entries/:id/trash` et `/untrash` : administrateur actif, contrôle de version et blocage des modifications/publications d’un contenu à la corbeille. L’ancienne suppression définitive de brouillons jamais publiés reste pour des usages strictement contrôlés, notamment les fixtures QA.
- Fichiers : `src/portal/editorial/pages.tsx`, `labels.ts`, `writing.ts`, `admin.css`, `supabase/functions/editorial/index.ts`.

### Aperçu privé

- `src/portal/editorial/PagePreview.tsx` utilise un iframe et un portail React pour afficher le vrai modèle public sans que sa CSS modifie l’administration.
- `EditorialProvider preview` affiche le snapshot privé et désactive le rafraîchissement depuis les données publiques.
- Les navigations et soumissions de formulaires dans l’aperçu sont interceptées.
- La CSS publique de production est intégrée dans des balises `<style>` par le prérendu. Un bug qui ne copiait que les liens CSS a été corrigé localement : l’aperçu récupère désormais les styles intégrés et les liens locaux autorisés.
- CSP : `scripts/prerender.mjs` ajoute `'self'` à `frame-src`. **L’iframe et sa CSP doivent encore être validés dans le navigateur réel après le correctif.**

### Derniers ajustements demandés

- `src/content/fr.ts` : libellé navigation **Ressources** ; `en.ts` : **Resources**. Les URLs restent les mêmes, y compris en mobile.
- `src/portal/booking.tsx` : retrait du sélecteur d’interlocuteur, de son état et du `hostId` envoyé par le parcours public/client. Affichage **avec LDgenX** et export calendrier client au nom de LDgenX.
- `src/portal/pages/client.tsx` : les rendez-vous confirmés affichent **LDgenX**, pas le nom du membre affecté.
- Le backend savait déjà agréger les créneaux et choisir une personne disponible quand `hostId` est omis. Ne pas retirer les hôtes de la base ni les mappings Google : ils sont nécessaires à l’admin, aux verrous et à la disponibilité.
- Références : `_shared/availability.ts` (`computeSlots`) ; `_shared/service.ts` (`availableSlots`, `requestAppointment`, `requestChange`). La sélection automatique et les vérifications Google restent en place.

## Données réelles à préserver

- 74 copies de travail importées : par langue, 3 guides + 6 études de cas + 28 résumés scientifiques. Ce sont des copies privées du site existant.
- Le propriétaire a publié **« test test »** : `/ressources/test-test`, ID `3dd53371-9fa9-49db-a692-dbf8942172f5`. C’est du contenu utilisateur, **pas une fixture à supprimer**.
- Dernier compte connu : 75 contenus avant tests jetables. Des copies de pages créées ensuite par le propriétaire peuvent légitimement augmenter ce nombre ; ne jamais « corriger » le total en supprimant des entrées.
- Aucun rendez-vous, message client ou publication QA n’a été créé pendant les derniers tests de gestion de contenu.

## Vérifications : réussi / restant

Dernière exécution locale, après les changements Ressources/rendez-vous et le correctif CSS d’aperçu :

- `npm run build` : **réussi**, typecheck, client, SSR, prérendu et worker Cloudflare. Avertissements de taille de bundle déjà présents ; ne pas les transformer en chantier de refonte.
- `npm run check:html` : **151 pages valides**, métadonnées uniques, un H1, titres ordonnés, JSON-LD valide, liens locaux et images contrôlés.
- `npm run check:editorial` : **réussi**, génération 74 copies/64 modèles, Deno check backend et **13 tests** éditoriaux.
- `node scripts/check-page-rendering.mjs` : **réussi**, les 64 pages gardent leurs sections et acceptent les ajouts ; le retrait restitue exactement le HTML d’origine ; quatre nouvelles pages expertise/application FR/EN utilisent le bon modèle.
- `deno test --allow-env --allow-read tests/calendar.test.ts tests/portal.test.ts` : **28 tests réussis**.
- `npm run lint` et `git diff --check` : **réussis**. Deux variables inutilisées dans le nouveau script QA ont été corrigées avant la relance.
- Contrôle du build produit : **82 règles include Cloudflare**, CSS publique intégrée présente et CSP autorisant l’iframe de même origine. Cela ne remplace pas le test navigateur de l’aperçu.

**Ce qui n’est PAS encore validé complètement :**

- `scripts/check-content-management.mjs` a validé l’accès admin/isolement client, les routes interdites, le contrôle de version de la corbeille et la restauration privée.
- Il s’est ensuite arrêté avec 503 lors de la création d’une page imbriquée, à cause de l’ancienne contrainte SQL. La migration `20261030113000` a corrigé cette contrainte et a été appliquée, mais la relance complète n’a pas pu s’exécuter.
- Les fixtures de cet essai ont été nettoyées. `docs/content-management-qa/local/results.json` contient **deux contrôles réussis seulement** ; `fixturesCleaned: true` n’est PAS un résultat complet de la suite.
- Restent à vérifier de bout en bout : création de page après migration, import d’image réel, sélection de couverture et miniature, corbeille depuis la liste/annulation/restauration, aperçu iframe sous CSP, mobile FR/EN, éditions enregistrées puis publiées sur les vrais modèles, et comportement final en production.
- Vérifier aussi dans le navigateur le parcours de réservation sans choix de membre, le regroupement des créneaux et le libellé Ressources sur desktop/mobile. Les unités calendrier passent, mais ce dernier changement visuel n’a pas eu son contrôle navigateur.

La dernière tentative de QA connectée a été **bloquée avant exécution par la revue automatique d’approbation**, quota du compte Codex épuisé. Ce n’est pas un jugement d’insécurité de l’action. Aucune permission n’a été contournée ; les modifications et vérifications locales autorisées ont été terminées. Les écritures Git/push et opérations réseau nécessitant cette revue n’ont pas été relancées.

## Reprendre les tests et la livraison

Utiliser Node 22 pour les commandes de production. Installation existante connue sur cette machine :

```sh
export PATH="/Users/optimumtech/.npm/_npx/52027bd8fc0022aa/node_modules/node/bin:$PATH"
npm run lint
npm run build
npm run check:html
npm run check:editorial
node scripts/check-page-rendering.mjs
npm run check:calendar
```

- Dépendances déjà installées ; pas besoin de les remplacer.
- `npm run build` efface `.prerender`, donc `editorial-seed.json` doit être régénéré ensuite par `node scripts/prepare-editorial.mjs` / `npm run check:editorial` avant les scripts qui l’utilisent.
- **Ne pas lancer `scripts/prerender.mjs` seul après un build complet** : il attend le template Vite contenant les placeholders. Sinon « Prerender placeholders are missing ». Relancer le build complet.
- Un preview existant répondait sur `http://127.0.0.1:4174`, servant le `dist` racine. Vérifier le processus avant d’en lancer un autre ; ne pas tuer les serveurs du propriétaire à l’aveugle.
- CORS local accepte les ports 5173, 5174, 4173 et 4174 sur localhost/127.0.0.1. Éviter un port arbitraire.
- Suite QA privée à reprendre : `node scripts/check-content-management.mjs http://127.0.0.1:4174`. Elle nécessite l’accès réseau et un navigateur Playwright autorisés.
- Cette suite crée des comptes admin/client jetables confirmés (sans envoyer d’e-mail), brouillons privés et une image de test `public/images/equipe-maxime-473.webp`. Elle ne publie rien, ne réserve rien et ne contacte aucun client. Son `finally` nettoie uniquement les entrées/médias appartenant aux utilisateurs jetables, puis les utilisateurs. Vérifier la sortie, le code de retour ET le nettoyage si elle échoue.
- **Ne pas lancer aveuglément `scripts/check-editorial-api.mjs`** : c’est un ancien scénario avec hypothèses obsolètes sur le nombre de contenus et publications QA. Ne jamais faire un nettoyage global sur la base du titre « test ».
- Un test de publication doit utiliser un environnement approprié ou un scénario jetable explicite et contrôlé ; ne pas publier le brouillon réel du propriétaire pour tester.
- Vérifier `dist/_routes.json` (règles Cloudflare et nombre de routes), les pages statiques, erreurs de chargement, retrait des personnalisation de pages, sitemap et cache public avant livraison.
- Si des corrections backend sont nécessaires, reprendre les scripts `supabase:editorial-setup` / `supabase:editorial-deploy` existants avec des migrations additives. Ne pas changer les identifiants OAuth ou les flux Agenda.
- Après QA satisfaisante : relire tous les changements, inclure les nouveaux fichiers/migrations/tests/docs dans le commit, exclure secrets et données confidentielles, commiter sur le main réconcilié, push sans force, puis vérifier le déploiement Cloudflare et les parcours sur `https://www.ldgenx.fr`. Ne pas annoncer « en ligne » avant de l’avoir vérifié.

Logs locaux : `/tmp/ldgenx-content-management-build.log`, `...-setup.log`, `...-deploy.log`, `...-qa.log`. Le dernier QA log est celui de l’essai incomplet, pas une preuve de réussite après migration.

## Fonctions existantes à préserver et points externes connus

- Le calendrier possède synchronisation Google, outboxes durables, contrôle des indisponibilités Google, protections contre les conflits, blocages journée entière/multijours et liens vers fiches LDgenX. Ne pas simplifier le backend calendrier pour masquer le choix de personne.
- Auth Google et nouvelles pages connexion/inscription sont déjà déployées. Commit auth historique `434b144`, 16 contrôles live réussis. Ne pas les remplacer ni modifier les scopes/redirects existants.
- Google Cloud : Audience **En production** confirmée ; nom d’application **LDgenX** enregistré. Il reste la propriété de la homepage à vérifier dans Search Console avec `admin.ldgenx@gmail.com`, puis attente de 24 h et relance de la validation du branding. Le branding n’est pas encore approuvé.
- SMTP/envoi des notifications applicatives non configurés. Livraison d’invitations, vérification d’adresse, reset et notifications e-mail non garantie avant configuration et test réel. Messagerie OVH inchangée.
- Les vrais agendas professionnels doivent encore être partagés/mappés par le propriétaire. `primary` représente le compte Google connecté, pas automatiquement l’agenda de chaque membre.
- Ne pas effectuer d’envoi d’e-mails/messages, achats, modifications DNS/mail ou suppressions de données réelles dans le cadre de cette reprise.
- Documents existants utiles : `docs/EDITORIAL.md`, `PORTAL.md`, `GOOGLE.md`, `PRISE-EN-MAIN-LDGENX-2026-10-30.md`, `RELEASE-AUTH-2026-10-30.md`, `RELEASE-CALENDAR-DETAILS-2026-10-29.md`, `RELEASE-WORKSPACE-2026-10-30.md`. Ils décrivent des états historiques : ce relais prévaut pour les changements locaux récents. La prise en main doit être mise à jour après validation/déploiement des six types, pages et corbeille.

## Explication finale attendue pour le propriétaire

Une fois réellement livré, expliquer simplement : **Contenus → nouveau contenu** pour enrichir une rubrique ; **Modifier une page du site** pour son titre/intro/image/blocs ; **Enregistrer** garde le brouillon privé ; **Aperçu** vérifie le rendu ; **Publier** diffuse explicitement cette version. Une correction enregistrée ne change pas automatiquement la version en ligne. **Supprimer** met à la corbeille ; **Restaurer** ramène un brouillon à relire puis republier. FR et EN se gèrent séparément. Les visiteurs prennent rendez-vous avec LDgenX ; l’équipe affecte les personnes en interne.
