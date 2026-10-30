# LDgenX — prise en main de l’administration

## Agenda

Les visiteurs et les clients prennent rendez-vous avec **LDgenX**, sans choisir de personne. Ils voient les créneaux libres de l’équipe ; la répartition entre les membres reste interne, dans l’agenda et les demandes.

Les rendez-vous et indisponibilités LDgenX sont transmis à Google avec un intitulé lisible, la personne concernée et un lien vers leur fiche. Cliquez sur un créneau dans LDgenX pour consulter ses détails, son état de synchronisation et le modifier. Les journées entières et périodes de plusieurs jours sont possibles. Un blocage commun utilise un seul événement dans **LDgenX · Équipe** ; cochez cet agenda dans Google pour l’afficher.

Les modifications des événements gérés par LDgenX se font depuis leur fiche LDgenX. Les événements privés Google servent à vérifier les disponibilités ; leurs titres et descriptions ne sont pas importés. Les événements ajoutés dans les agendas de travail dédiés peuvent afficher leur titre dans l’administration. Les préférences de partage se règlent dans **Paramètres → Google Agenda**. Les noms et sujets des clients restent privés par défaut.

## Contenus du site

L’adresse de travail est [www.ldgenx.fr/admin/contenus](https://www.ldgenx.fr/admin/contenus).

1. **Ouvrir un contenu existant ou créer un nouveau contenu.** **Nouveau contenu** enrichit une rubrique : article/guide, étude de cas, résumé de publication scientifique, expertise ou application. Chaque type reprend la présentation de sa rubrique. Les pages existantes disposent de copies de travail ; ouvrez la copie correspondante pour les corriger, afin de conserver leur adresse. La page actuelle reste visible jusqu’à la publication de la nouvelle version.
2. **Rédiger.** Remplissez le titre, le résumé, le thème et les auteurs. Une trame facultative ajoute uniquement des titres de sections dans un document vide. Elle n’invente aucun résultat et ne remplace pas un document contenant déjà du texte ou des médias. Les outils permettent les titres, l’italique des noms latins, indices, exposants, listes, tableaux, figures et vidéos.
3. **Documenter la science.** Distinguez méthodes, résultats, interprétation et limites. Ajoutez les références utilisées. Pour une publication, renseignez les auteurs de l’article original, son DOI, sa revue et son année ; l’année du papier reste distincte de la date de mise à jour du résumé sur le site.
4. **Ajouter les médias.** La médiathèque réutilise les fichiers existants et optimise les nouvelles images en WebP, avec plusieurs tailles pour l’affichage. Renseignez le texte alternatif, la légende scientifique, le crédit et la source/licence. Vérifiez la lisibilité des axes, échelles et annotations ; conservez les originaux scientifiques séparément. Une vidéo courte peut être importée (20 Mo, trois minutes au maximum dans l’interface), ou intégrée depuis YouTube/Vimeo par lien pour éviter de stocker une vidéo longue sur Supabase.
5. **Enregistrer et vérifier l’aperçu.** Enregistrer, ou **⌘/Ctrl+S**, conserve le brouillon privé. La barre de navigation reste accessible dans un long document. Une copie locale de secours peut récupérer une saisie non enregistrée dans le même navigateur ; elle ne remplace pas l’enregistrement sur le serveur.
6. **Relire puis publier.** La liste de préparation indique les champs manquants. Confirmez la relecture scientifique et les droits, vérifiez l’aperçu, puis cliquez sur **Publier**. Le site, ses listes et ses métadonnées se mettent à jour sans reconstruction manuelle, avec un délai de cache pouvant atteindre une trentaine de secondes. Une modification ultérieure reste en brouillon tant qu’elle n’est pas publiée.

### Modifier une page du site

**Modifier une page du site** donne accès à 64 pages en français et en anglais : accueil, expertises, applications, études de cas, publications, ressources, à propos, équipe, partenaires, FAQ, glossaire, contact. Choisissez la langue puis la page.

Vous pouvez changer le **titre**, l’**introduction** et l’**image**, et **ajouter des blocs** de texte, figures ou vidéos, qui s’affichent après l’introduction. Les sections d’origine, leurs animations et leurs cartes restent en place : leurs textes ne se modifient pas depuis cet écran. **Aperçu** montre la vraie page avant publication. **Retirer les modifications** rend à la page sa présentation d’origine, sans la supprimer du site.

### Ajouter une image

Depuis la liste, **Ajouter une image** (ou **Changer l’image**) ouvre directement la médiathèque ; dans l’éditeur, l’image de couverture est tout en haut. Importez une photo ou choisissez-en une, puis renseignez ce qu’elle montre et son crédit. L’image apparaît sur la page et sur sa carte, et la liste des contenus affiche sa miniature. Sur l’accueil, elle remplace la vidéo tant que la modification est publiée. Une image LDgenX sans légende n’affiche aucune mention sous la photo.

### Supprimer et restaurer

**Supprimer**, depuis la liste ou l’éditeur, demande confirmation puis place le contenu dans la **Corbeille** : il quitte le site, mais son texte, ses images et son historique sont conservés. Pour une page du site, seules vos modifications partent à la corbeille ; la page d’origine reste en ligne. **Restaurer** ramène un brouillon à relire : rien n’est remis en ligne automatiquement. Il faut ensuite cliquer sur **Publier**.

### Publier

**Enregistrer** garde un brouillon privé. **Publier** diffuse cette version. Une correction enregistrée ne change pas la version en ligne tant qu’elle n’est pas publiée. Le français et l’anglais se gèrent séparément.

L’historique permet de restaurer une version dans le brouillon, sans la publier automatiquement. **Retirer du site** retire la page publique et conserve la copie de travail. Les versions française et anglaise sont rédigées et validées séparément.

Les contrôles automatiques vérifient la structure, les références requises et les informations des médias. L’exactitude scientifique des conclusions relève de la relecture du laboratoire. Un résumé publié n’est pas une republication automatique du texte intégral de la revue.

Les fichiers clients se déposent dans leur fiche privée, séparément de la médiathèque éditoriale. Les médias d’un article publié sont publics ; retirer un article ne constitue pas une procédure de révocation de documents confidentiels.

## Gestion des clients

Dans **Clients**, les compteurs indiquent les comptes à valider, actifs et désactivés. La recherche accepte le nom complet, l’organisation et l’adresse e-mail, avec ou sans accents. Chaque fiche regroupe les coordonnées, messages, fichiers et rendez-vous.

**Valider le compte** active un compte en attente. **Désactiver** demande confirmation avec le nom du client, ne supprime pas ses données et bloque l’accès côté serveur, y compris pour une session déjà ouverte. Les règles de conservation continuent de s’appliquer. **Réactiver** rétablit l’accès. Le changement de statut n’annule pas les rendez-vous existants.

## Espace client

Le client retrouve sa conversation avec LDgenX, ses rendez-vous et ses fichiers. **Reçus de LDgenX** présente les documents transmis par l’équipe ; **Envoyés à LDgenX** retrouve les pièces jointes envoyées avec ses messages. La recherche porte sur le nom du fichier et son commentaire ; les fichiers sont présentés du plus récent au plus ancien.

Pour transmettre un fichier à LDgenX, le client l’ajoute en pièce jointe dans **Messages**. L’équipe le retrouve dans la conversation et dans la fiche privée du client.

Les téléchargements passent par une autorisation serveur et des liens temporaires. Le client accède à ses propres données ; il ne peut pas consulter la fiche d’un autre client ou l’administration éditoriale. Les erreurs de chargement des fichiers et rendez-vous proposent une reprise explicite.

## Actions qui nécessitent le titulaire des comptes

- **E-mails applicatifs :** le service d’envoi d’e-mails de l’application (SMTP) et la clé d’envoi des notifications ne sont pas configurés. Les invitations par e-mail, vérifications d’adresse, réinitialisations de mot de passe et notifications par e-mail demandent cette configuration puis un contrôle réel de livraison. La messagerie OVH n’a pas été modifiée.
- **Google Cloud :** le statut OAuth **En production** a été confirmé directement dans la console le 30 octobre et le nom **LDgenX** est enregistré. Google demande de vérifier la propriété de `https://www.ldgenx.fr/` dans Search Console avec `admin.ldgenx@gmail.com`, puis d’attendre **24 heures** avant de relancer la validation du branding. Le nom peut rester remplacé par le domaine Supabase sur l’écran Google jusque-là.
- **Agendas de l’équipe :** partager les agendas professionnels réels avec le compte connecté et renseigner leurs identifiants pour chaque personne. `primary` désigne l’agenda principal du compte connecté ; il ne représente pas automatiquement l’agenda personnel de chaque membre. Un agenda non partagé ou non renseigné ne peut pas bloquer les réservations.

Ces actions sont notées pour la suite ; aucune nouvelle boîte mail, aucun abonnement payant et aucune modification du DNS de messagerie n’ont été engagés.

Dans **Google Auth Platform → Branding**, le projet `ldgenx-platform` utilise désormais le nom **LDgenX**, l’adresse d’assistance du laboratoire, la page d’accueil **https://www.ldgenx.fr/** et la politique de confidentialité **https://www.ldgenx.fr/politique-confidentialite**. **Audience → En production** est confirmé. La publication du statut et la validation de la marque par Google sont deux étapes distinctes ; suivez les points signalés par la console sans changer les identifiants OAuth ni les URI de redirection existants. Les nouvelles pages de connexion et d’inscription sont déployées ; leur vérification comprend 16 contrôles sur le domaine public.
