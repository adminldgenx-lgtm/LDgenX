# LDgenX — prise en main de l’administration

## Agenda

Les visiteurs et les clients prennent rendez-vous avec **LDgenX**, sans choisir de personne. Ils voient les créneaux libres de l’équipe ; la répartition entre les membres reste interne, dans l’agenda et les demandes.

Les rendez-vous et indisponibilités LDgenX sont transmis à Google avec un intitulé lisible, la personne concernée et un lien vers leur fiche. Cliquez sur un créneau dans LDgenX pour consulter ses détails, son état de synchronisation et le modifier. Les journées entières et périodes de plusieurs jours sont possibles. Un blocage commun utilise un seul événement dans **LDgenX · Équipe** ; cochez cet agenda dans Google pour l’afficher.

Les modifications des événements gérés par LDgenX se font depuis leur fiche LDgenX. Les événements privés Google servent à vérifier les disponibilités ; leurs titres et descriptions ne sont pas importés. Les événements ajoutés dans les agendas de travail dédiés peuvent afficher leur titre dans l’administration. Les préférences de partage se règlent dans **Paramètres → Google Agenda**. Les noms et sujets des clients restent privés par défaut.

## Contenus du site

Allez dans **Contenus** : l’écran montre les rubriques du site. Chacune a sa propre page.

| Rubrique | Ce qu’elle gère |
|---|---|
| **Expertises** | Les pages de services et le menu Expertises |
| **Applications** | Les secteurs d’application |
| **Études de cas** | Les projets, avec leur tableau « En bref » |
| **Publications** | Les articles scientifiques de l’équipe |
| **Ressources** | Les articles et guides |
| **Autres pages** | Accueil, À propos, Équipe, FAQ, Contact… |

Sur la page d’une rubrique, chaque ligne affiche son image, son adresse et son état, avec ses actions à côté :

| État | Signification |
|---|---|
| **En ligne** | Visible sur le site |
| **En ligne · modifications à publier** | Le site montre encore l’ancienne version ; vos changements sont enregistrés |
| **Brouillon** | Jamais publié, visible seulement ici |
| **Hors ligne** | Retiré du site, conservé ici |

### Ajouter un contenu

1. Ouvrez la rubrique, puis cliquez sur **Ajouter…**, en haut à droite.
2. Choisissez la langue avec **Français / English**. Chaque langue a sa propre version.
3. Remplissez les champs : chacun correspond à une partie de la page.
4. **Aperçu de la page** montre la vraie page, avec le design et les animations du site, sans rien publier.
5. Cochez la case de relecture, puis cliquez sur **Publier**.

Le design ne se règle pas : il vient du site. Vous ne vous occupez que du contenu.

À la publication, la page reçoit son adresse, tirée du titre. Elle rejoint sa rubrique, le plan du site et les fichiers lus par Google et les assistants IA, et Bing et les moteurs IndexNow sont prévenus aussitôt. Google la découvre par son sitemap, en général sous quelques jours.

### Modifier un contenu existant

Dans la rubrique, cliquez sur **Modifier**. Le formulaire s’ouvre avec le texte actuel du site. **Enregistrer** garde vos changements en privé ; **Publier** les met en ligne.

Dans **Autres pages**, vous modifiez le titre, l’introduction et l’image, et vous pouvez ajouter du texte, des figures et des vidéos. Leurs sections d’origine restent en place.

### Les images

Importez vos photos telles quelles. Chaque image est automatiquement convertie en WebP et allégée, en quatre tailles, plus une version pour les partages sur LinkedIn et les réseaux. Les données de localisation et d’appareil sont retirées. Cela fonctionne sur tous les navigateurs, y compris Safari sur Mac et iPhone.

### Supprimer, retirer, restaurer

- **Retirer du site** enlève la page du site et des résultats de recherche. La ligne reste, et **Remettre en ligne** la rétablit en un clic.
- **Supprimer** déplace le contenu dans la **Corbeille**, accessible depuis l’écran **Contenus**. **Restaurer** le ramène dans sa rubrique.

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
