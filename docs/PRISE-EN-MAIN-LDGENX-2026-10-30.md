# LDgenX — prise en main de l’administration

## Agenda

Les rendez-vous et indisponibilités LDgenX sont transmis à Google avec un intitulé lisible, la personne concernée et un lien vers leur fiche. Cliquez sur un créneau dans LDgenX pour consulter ses détails, son état de synchronisation et le modifier. Les journées entières et périodes de plusieurs jours sont possibles. Un blocage commun utilise un seul événement dans **LDgenX · Équipe** ; cochez cet agenda dans Google pour l’afficher.

Les modifications des événements gérés par LDgenX se font depuis leur fiche LDgenX. Les événements privés Google servent à vérifier les disponibilités ; leurs titres et descriptions ne sont pas importés. Les événements ajoutés dans les agendas de travail dédiés peuvent afficher leur titre dans l’administration. Les préférences de partage se règlent dans **Paramètres → Google Agenda**. Les noms et sujets des clients restent privés par défaut.

## Articles, études de cas et résumés de publications

L’adresse de travail est [www.ldgenx.fr/admin/contenus](https://www.ldgenx.fr/admin/contenus).

1. **Ouvrir un contenu existant ou créer un nouveau contenu.** Trois types sont disponibles : article/guide, étude de cas, résumé de publication scientifique. Les pages existantes disposent de copies de travail ; ouvrez la copie correspondante pour les corriger, afin de conserver leur adresse. La page actuelle reste visible jusqu’à la publication de la nouvelle version.
2. **Rédiger.** Remplissez le titre, le résumé, le thème et les auteurs. Une trame facultative ajoute uniquement des titres de sections dans un document vide. Elle n’invente aucun résultat et ne remplace pas un document contenant déjà du texte ou des médias. Les outils permettent les titres, l’italique des noms latins, indices, exposants, listes, tableaux, figures et vidéos.
3. **Documenter la science.** Distinguez méthodes, résultats, interprétation et limites. Ajoutez les références utilisées. Pour une publication, renseignez les auteurs de l’article original, son DOI, sa revue et son année ; l’année du papier reste distincte de la date de mise à jour du résumé sur le site.
4. **Ajouter les médias.** La médiathèque réutilise les fichiers existants et optimise les nouvelles images en WebP, avec plusieurs tailles pour l’affichage. Renseignez le texte alternatif, la légende scientifique, le crédit et la source/licence. Vérifiez la lisibilité des axes, échelles et annotations ; conservez les originaux scientifiques séparément. Une vidéo courte peut être importée (20 Mo, trois minutes au maximum dans l’interface), ou intégrée depuis YouTube/Vimeo par lien pour éviter de stocker une vidéo longue sur Supabase.
5. **Enregistrer et vérifier l’aperçu.** Enregistrer, ou **⌘/Ctrl+S**, conserve le brouillon privé. La barre de navigation reste accessible dans un long document. Une copie locale de secours peut récupérer une saisie non enregistrée dans le même navigateur ; elle ne remplace pas l’enregistrement sur le serveur.
6. **Relire puis publier.** La liste de préparation indique les champs manquants. Confirmez la relecture scientifique et les droits, vérifiez l’aperçu, puis cliquez sur **Publier**. Le site, ses listes et ses métadonnées se mettent à jour sans reconstruction manuelle, avec un délai de cache pouvant atteindre une trentaine de secondes. Une modification ultérieure reste en brouillon tant qu’elle n’est pas publiée.

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
- **Google Cloud :** vérifier que l’application OAuth est bien **En production** après avoir complété les informations de marque. Le statut n’est pas déductible d’une connexion Google active. Google décrit une durée limitée des autorisations Calendar en mode Test dans sa [documentation OAuth](https://developers.google.com/identity/protocols/oauth2#expiration).
- **Agendas de l’équipe :** partager les agendas professionnels réels avec le compte connecté et renseigner leurs identifiants pour chaque personne. `primary` désigne l’agenda principal du compte connecté ; il ne représente pas automatiquement l’agenda personnel de chaque membre. Un agenda non partagé ou non renseigné ne peut pas bloquer les réservations.

Ces actions sont notées pour la suite ; aucune nouvelle boîte mail, aucun abonnement payant et aucune modification du DNS de messagerie n’ont été engagés.
