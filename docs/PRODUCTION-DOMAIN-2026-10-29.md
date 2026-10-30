# LDgenX — configuration du domaine de production

Vérification commencée le 28 octobre et terminée le 29 octobre 2026. Domaine principal conservé : **https://www.ldgenx.fr/**, conformément aux canoniques existantes et à la demande du propriétaire. Les corrections du site ont été publiées dans le dépôt effectivement déployé par Cloudflare, `adminldgenx-lgtm/LDgenX`, commit [06b5893](https://github.com/adminldgenx-lgtm/LDgenX/commit/06b5893f29497fccf0249519107020c1727a86e0). Le remote du workspace reste `optimum-tech-911/LDgenX` ; la publication a utilisé un checkout isolé du dépôt client, sans remplacer les fichiers ou l’état Git du workspace.

Le complément de documentation, de diagnostics et de récupération administrateur est publié dans [bf84e15](https://github.com/adminldgenx-lgtm/LDgenX/commit/bf84e159154f53f07226f6eddee782b00569c55d). Cloudflare Pages signale ce déploiement comme réussi ; le contrôle HTTP final est conservé dans [final-deployment.json](production-domain-2026-10-28/final-deployment.json).

## Résultat HTTP réellement observé

Contrôles finaux avec le DNS normal de ce poste, le 29 octobre. Le cache DNS du poste atteignait encore l’ancien hébergeur le 28 octobre ; il rejoint maintenant Cloudflare. La validation TLS est restée active pendant tous les contrôles.

| Adresse HTTPS | Réponse initiale | Destination finale | Réponse finale |
| --- | --- | --- | --- |
| `https://www.ldgenx.fr/` | 200 | `https://www.ldgenx.fr/` | 200 |
| `https://ldgenx.fr/` | 301 | `https://www.ldgenx.fr/` | 200 |
| `https://ldgenx.com/` | 301 | `https://www.ldgenx.fr/` | 200 |
| `https://www.ldgenx.com/` | 301 | `https://www.ldgenx.fr/` | 200 |

Les quatre variantes HTTP arrivent directement sur le domaine principal HTTPS par une seule 301. Les chemins actuels FR/EN et les paramètres testés sont conservés, sans boucle. Neuf essais supplémentaires d’anciennes adresses de publication, d’expertise et de R&D rejoignent leur fiche correspondante : une normalisation de domaine peut être suivie de la migration historique du chemin, sans rabattre les visiteurs sur l’accueil.

Preuves : [résultats publics complets](production-domain-2026-10-28/public-domain-results.json), [anciens liens via les alias](production-domain-2026-10-28/legacy-domain-samples.json), [règles Cloudflare](production-domain-2026-10-28/cloudflare-redirects.json).

## Corrections appliquées

- **Domaines** : deux règles Cloudflare 301 activées, pour `ldgenx.fr`/HTTP sur `www.ldgenx.fr` et pour les deux variantes `.com`. Destination dynamique conservant le chemin ; option de conservation des paramètres activée. Aucune modification des enregistrements DNS de messagerie. Les redirections par hôte sont gérées dans Cloudflare : le fichier Pages `_redirects` ne prend pas en charge les redirections de domaine. [Documentation Cloudflare](https://developers.cloudflare.com/pages/configuration/redirects/).
- **Routes privées** : le déploiement précédent transformait la réécriture vers `/portal.html` en 308 visible vers `/portal`, perdant l’adresse `/admin` ou `/espace/...`. La destination interne est désormais `/portal`, sans extension. Les accès directs, liens de récupération, rendez-vous et rechargements conservent leur URL. Le nouveau bundle du portail et la réponse 200 directe ont été constatés publiquement dans [deployment.json](production-domain-2026-10-28/deployment.json).
- **URL communes** : `supabase/functions/_shared/site.ts` centralise le domaine principal, ses alias et les origines explicites de développement/preview. `src/content/site.ts`, `src/portal/api/http.ts`, le backend et les scripts administratifs l’utilisent. Le lien de version anglaise pointe vers `/en` sur le domaine principal. Les liens externes de sources scientifiques et les configurations locales utiles sont conservés.
- **Indexation** : règles `X-Robots-Tag: noindex` propres aux hôtes Pages, et `noindex, nofollow` pour les routes privées. `robots.txt` exclut les préfixes `/espace`, `/admin` et `/portal`. Les pages publiques restent explorables. Ces règles suivent la syntaxe de [Cloudflare Pages Headers](https://developers.cloudflare.com/pages/configuration/headers/).
- **Supabase** : Site URL Auth et secret Edge `PORTAL_SITE_URL` alignés sur `https://www.ldgenx.fr` ; retours de connexion/récupération exacts en production ; origines CORS explicites, sans joker. Les callbacks locaux nécessaires sont conservés. Les réglages SMTP, confirmation e-mail et Google sont restés identiques. [Référence Supabase sur les URL de retour](https://supabase.com/docs/guides/auth/redirect-urls).
- **Récupération administrateur** : le script `scripts/admin-link.mjs` génère seulement son lien privé. Il ne relance plus toute la configuration du backend pour créer ce lien ; il conserve donc les réglages e-mail/Auth existants. Le lien retourne sur le domaine configuré. Aucun nouveau lien pour le véritable administrateur n’a été généré pendant cette vérification.

Fichiers concernés : `scripts/prerender.mjs`, `scripts/crawler-files.mjs`, `src/content/site.ts`, `src/portal/api/http.ts`, `supabase/functions/_shared/{site,origins,service}.ts`, `supabase/functions/portal/{jobs,repository}.ts`, `scripts/{setup-supabase,configure-production-domain,admin-link,check-production-config,check-production-domain,check-portal-origins,check-portal-browser,check-seo}.mjs`, `scripts/lib/public-http.mjs`, `.env.supabase.example`, `package.json`, `README.md` et cette documentation. Aucun secret n’a été publié ; `.env.supabase.local` reste ignoré et protégé.

## Recette locale et distante

Installation reproductible et build sous **Node 22.23.4 / npm 11.11.0**. Le poste utilise aussi Node 25.8.0 pour les scripts de diagnostic. Aucune dépendance ni lockfile modifié ; `npm ci` a signalé zéro vulnérabilité. La version majeure de production reste fixée à 22 par `.node-version`.

| Vérification | Résultat |
| --- | --- |
| `npm ci`, `typecheck`, `lint`, `build` | Réussis ; 151 pages prérendues et 97 redirections |
| `check:html`, `check:seo`, `check:content`, `check:typography`, `check:media` | Réussis ; 22 266 liens locaux et 1 057 occurrences d’images contrôlés dans le build ; 147 pages indexables, zéro erreur/avertissement SEO |
| `check:production-config` | Réussi : réécritures internes, exclusions privées/previews et destinations Auth |
| Développement sur `127.0.0.1:5174` | Accueil, page profonde, portail et sitemap répondent 200 |
| `check:http` sur le preview `127.0.0.1:4174` | 151 pages, 97 redirections 301 et vrai 404 réussis |
| `check:backend`, `test:portal` | Type-check Edge et huit tests métier/sécurité réussis |
| `check:supabase` après configuration du domaine, le 28 octobre | 76 assertions réelles API/RLS/Storage, fichiers privés, rétention, messages et concurrence de réservation réussies |
| `check:portal-origins`, contrôle final le 29 octobre | 36 requêtes : 13 origines approuvées, cinq origines non autorisées rejetées, callbacks Auth présents |
| `check:production-domain` sur le site publié | 151 pages, 147 entrées indexables dans cinq sous-sitemaps XML valides, 225 liens internes distincts, 237 ressources et 97 anciens chemins ; zéro erreur/avertissement |
| `check:portal-browser` sur `https://www.ldgenx.fr` | Connexions réelles client/admin, sessions, fichiers privés, messages dans les deux sens, récupération/changement de mot de passe d’un compte de test, demandes invitées et formulaire de contact persistés ; ordinateur/mobile |
| `check:account-browser` sur le domaine réel | 150 contrôles de barre FR/EN visiteur/client/admin, destinations selon rôle, persistance et connexion/déconnexion entre onglets ; aucune erreur JavaScript/CSP |
| `check:final-review` sur le domaine réel, 390 et 1 440 px | Quatre parcours FR/EN réussis : menus et boutons « toutes… », annuaire de pied de page, carte scientifique, changement de langue, agenda invité et erreurs/reprise sans fausse confirmation |

Canoniques absolues, `hreflang` FR/EN et `x-default`, Open Graph/Twitter et JSON-LD ont été rapprochés du catalogue complet ; les images et pages des sitemaps répondent sur le domaine principal. `robots.txt`, le plan HTML et les deux fichiers `llms` utilisent les bonnes adresses. Les espaces privés sont exclus des sitemaps. Trois adresses publiques inconnues, dont une anglaise et une avec extension `.html`, répondent réellement 404 avec `noindex`. L’hôte `ldgenx-12k.pages.dev` répond 200 avec `X-Robots-Tag: noindex`.

Le premier essai navigateur a dépassé une attente de 15 secondes lors d’une mise à jour de message, sans erreur API/JavaScript. Une seconde exécution des mêmes assertions, avec diagnostics, a entièrement réussi : 201 réponses API enregistrées, maximum observé de 1 968 ms, mises à jour de conversation reçues dans les deux sens. Ce résultat ne constitue pas une garantie de latence pour toute connexion ; le mécanisme de reprise/polling existant est conservé. Les preuves initiales et finales restent séparées.

Preuves finales : [portail réel](production-domain-2026-10-28/portal-live-diagnostic/browser-results.json), [timings sans identifiants de connexion](production-domain-2026-10-28/portal-live-diagnostic/request-timing.json), [barre de navigation](production-domain-2026-10-28/account-live/account-navbar-results.json), [interactions publiques](production-domain-2026-10-28/public-live/interactive-results.json), [configuration Supabase finale](production-domain-2026-10-28/supabase-final.json). Les comptes et demandes de test ont été retirés : [contrôle de nettoyage](production-domain-2026-10-28/test-cleanup.json).

## Messagerie et limites conservées

Conformément à la réponse du propriétaire du 29 octobre, **la messagerie OVH et ses enregistrements MX/SPF/DKIM n’ont pas été modifiés**. La protection d’obfuscation des e-mails Cloudflare reste activée. L’automatisme d’approbation a refusé sa désactivation ; aucune tentative de contournement n’a suivi. La vérification dans le navigateur retrouve les vrais liens `mailto:info@ldgenx.fr`, utilisables et sans erreur ; la destination HTML encodée Cloudflare est donc traitée comme un mécanisme de décodage, pas comme une page éditoriale manquante.

L’injection Analytics était visible dans un relevé initial ; le contrôle final de réponses directes et du navigateur n’en retrouve pas, et le tableau Cloudflare Pages indique Analytics désactivé. Aucun réglage Analytics n’a été changé.

Les **e-mails automatiques du portail** (vérification d’adresse, invitations, réinitialisation et notifications) restent différés à la demande du propriétaire : aucun SMTP personnalisé, aucune promesse de livraison. Le test de récupération a utilisé un vrai lien créé administrativement pour un compte jetable, sans envoi d’e-mail. La connexion Google et la synchronisation Google Agenda restent également non configurées. Ces points ne sont pas présentés comme terminés. Aucun abonnement payant ni nouvelle intégration n’a été activé.
