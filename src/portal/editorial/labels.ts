import { useI18n } from "../i18n";
export function useWords() {
  const { locale } = useI18n();
  return (fr: string, en: string) => (locale === "fr" ? fr : en);
}
export const kindNames = {
  fr: {
    article: "Article",
    study: "Étude de cas",
    publication: "Publication",
    service: "Expertise",
    application: "Application",
    page: "Page du site",
  },
  en: {
    article: "Article",
    study: "Case study",
    publication: "Publication",
    service: "Expertise",
    application: "Application",
    page: "Website page",
  },
};
const errors: Record<string, [string, string]> = {
  trashed: [
    "Ce contenu est dans la corbeille. Restaurez-le pour le modifier.",
    "This content is in trash. Restore it before editing.",
  ],
  conflict: [
    "Ce document a été modifié ailleurs. Votre texte est conservé ici. Exportez votre brouillon, puis rechargez la version actuelle pour comparer.",
    "This document was edited elsewhere. Your text is preserved here. Export your draft, then reload the current version to compare.",
  ],
  unavailable: [
    "Le service est momentanément indisponible. Votre brouillon reste à l’écran ; réessayez.",
    "The service is temporarily unavailable. Your draft remains on screen; please retry.",
  ],
  unauthenticated: [
    "Votre session a expiré. Reconnectez-vous après avoir exporté votre brouillon.",
    "Your session expired. Export your draft, then sign in again.",
  ],
  forbidden: [
    "Cette action est réservée aux administrateurs actifs.",
    "Only active administrators can perform this action.",
  ],
  slug_taken: [
    "Cette adresse est déjà utilisée. Choisissez une autre adresse.",
    "This address is already in use. Choose another one.",
  ],
  media_in_use: [
    "Ce média est utilisé dans un brouillon, une publication ou son historique. Sa suppression est protégée.",
    "This media is used in a draft, publication or revision. It cannot be deleted.",
  ],
  storage_limit: [
    "Le budget de stockage est atteint. Réutilisez un média ou supprimez un média inutilisé.",
    "The storage budget has been reached. Reuse media or remove unused media.",
  ],
  image_source: [
    "Choisissez une image JPEG, PNG, WebP ou AVIF valide. Les SVG et animations ne sont pas acceptés.",
    "Choose a valid JPEG, PNG, WebP or AVIF image. SVG and animation are not supported.",
  ],
  source_too_large: [
    "L’image source doit faire moins de 20 MB.",
    "The source image must be smaller than 20 MB.",
  ],
  image_pixels: [
    "L’image dépasse 40 mégapixels. Réduisez ses dimensions avant l’import.",
    "This image exceeds 40 megapixels. Resize it before uploading.",
  ],
  webp_unavailable: [
    "L’image n’a pas pu être convertie. Réessayez ou utilisez un navigateur récent.",
    "The image could not be converted. Retry or use a recent browser.",
  ],
  file_too_large: [
    "Fichier trop volumineux : images optimisées 4 MB maximum au total, vidéo 20 MB maximum.",
    "File too large: optimised images up to 4 MB total, video up to 20 MB.",
  ],
  video_format: [
    "Choisissez une vidéo MP4 ou WebM lisible par votre navigateur.",
    "Choose an MP4 or WebM video that your browser can play.",
  ],
  video_duration: [
    "Les vidéos importées sont limitées à 3 minutes. Pour les vidéos longues, utilisez un lien YouTube ou Vimeo.",
    "Uploaded videos are limited to 3 minutes. For longer videos, use a YouTube or Vimeo link.",
  ],
  invalid_input: [
    "Vérifiez le format des champs : liens HTTPS, DOI, année et longueur des textes.",
    "Check field formats: HTTPS links, DOI, year and text length.",
  ],
  video_url: [
    "Utilisez un lien YouTube ou Vimeo public valide.",
    "Use a valid public YouTube or Vimeo link.",
  ],
  media_missing: [
    "Un média est indisponible. Rechargez la médiathèque et choisissez un média existant.",
    "A media file is unavailable. Reload the library and select an existing file.",
  ],
  entry_limit: [
    "La limite de 500 documents est atteinte. Contactez le responsable du site.",
    "The 500-document limit has been reached. Contact the website administrator.",
  ],
};
export function cmsError(
  error: unknown,
  l: (fr: string, en: string) => string,
) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "unavailable";
  const p = errors[code] ?? errors.unavailable;
  return l(...p);
}
export const issueLabels: Record<string, [string, string]> = {
  title: ["Un titre", "A title"],
  summary: [
    "Une introduction d’au moins 20 caractères",
    "An introduction of at least 20 characters",
  ],
  body: [
    "Un texte d’au moins 100 caractères",
    "Body text of at least 100 characters",
  ],
  cover: ["Une image principale", "A main image"],
  review: [
    "La confirmation de relecture",
    "The review confirmation",
  ],
  alt: [
    "Une description pour chaque image du texte",
    "A description for every image in the text",
  ],
  video_title: ["Un titre pour chaque vidéo", "A title for every video"],
  publication_reference: [
    "Le DOI, la revue et l’année",
    "The DOI, journal and year",
  ],
  reference_label: [
    "Un libellé pour chaque référence",
    "A label for every reference",
  ],
};
