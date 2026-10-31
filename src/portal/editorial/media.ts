import { EDITORIAL_LIMITS as L } from "../../../supabase/functions/_shared/editorial";
import { CmsError, cmsRequest } from "./api";
import type { EditorialMedia } from "../../../supabase/functions/_shared/editorial";

// Sizes kept for each picture: phones, screens, large screens, and the original up to 2400 px.
const WIDTHS = [480, 960, 1600];
// Quality steps: the first that fits the size budget wins. Photographs compress far more than
// PNG figures and diagrams, whose fine lines and lettering must stay sharp.
const PHOTO_QUALITY = [0.82, 0.74, 0.66];
const GRAPHIC_QUALITY = [0.92, 0.84, 0.76];
const BYTES_PER_WIDTH = 420;

const canvasBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

/** WebP from the browser, or from an encoder loaded only where it cannot write it (Safari). */
async function webp(canvas: HTMLCanvasElement, quality: number) {
  const blob = await canvasBlob(canvas, "image/webp", quality);
  if (blob?.type === "image/webp") return blob;
  const { default: encode } = await import("@jsquash/webp/encode");
  const pixels = canvas
    .getContext("2d")
    ?.getImageData(0, 0, canvas.width, canvas.height);
  if (!pixels) throw new CmsError("webp_unavailable");
  const buffer = await encode(pixels, { quality: Math.round(quality * 100) });
  return new Blob([buffer], { type: "image/webp" });
}
/** The 1200 × 630 JPEG social networks read, cropped around the centre. */
async function socialCard(bitmap: ImageBitmap) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new CmsError("image_source");
  const scale = Math.max(1200 / bitmap.width, 630 / bitmap.height);
  const width = bitmap.width * scale,
    height = bitmap.height * scale;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 1200, 630);
  ctx.drawImage(bitmap, (1200 - width) / 2, (630 - height) / 2, width, height);
  const blob = await canvasBlob(canvas, "image/jpeg", 0.85);
  canvas.width = canvas.height = 1;
  if (!blob) throw new CmsError("image_source");
  return new File([blob], "social.jpg", { type: "image/jpeg" });
}
/** Every picture is converted here, before upload: the original never leaves the computer, and
 *  location and camera data go with it. */
export async function optimizeImage(file: File): Promise<File[]> {
  if (
    !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)
  )
    throw new CmsError("image_source");
  if (file.size > L.imageSourceBytes) throw new CmsError("source_too_large");
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new CmsError("image_source");
  });
  try {
    if (
      !bitmap.width ||
      !bitmap.height ||
      bitmap.width * bitmap.height > L.imageSourcePixels
    )
      throw new CmsError("image_pixels");
    const scale = Math.min(
      1,
      L.imageWidth / Math.max(bitmap.width, bitmap.height),
    );
    const large = Math.round(bitmap.width * scale);
    const widths = [
      ...new Set([...WIDTHS.map((width) => Math.min(width, large)), large]),
    ].sort((a, b) => a - b);
    const qualities = file.type === "image/png" ? GRAPHIC_QUALITY : PHOTO_QUALITY;
    const files: File[] = [];
    for (const width of widths) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = Math.max(
        1,
        Math.round((bitmap.height * width) / bitmap.width),
      );
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new CmsError("image_source");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      let blob: Blob | null = null;
      for (const quality of qualities) {
        blob = await webp(canvas, quality);
        if (blob.size <= width * BYTES_PER_WIDTH) break;
      }
      canvas.width = canvas.height = 1;
      if (!blob) throw new CmsError("webp_unavailable");
      if (blob.size > L.imageVariantBytes) throw new CmsError("file_too_large");
      files.push(new File([blob], `${width}.webp`, { type: "image/webp" }));
    }
    files.push(await socialCard(bitmap));
    if (files.reduce((s, f) => s + f.size, 0) > L.imageUploadBytes)
      throw new CmsError("file_too_large");
    return files;
  } finally {
    bitmap.close();
  }
}
export async function validateVideo(file: File) {
  if (!["video/mp4", "video/webm"].includes(file.type))
    throw new CmsError("video_format");
  if (file.size > L.videoBytes) throw new CmsError("file_too_large");
  const src = URL.createObjectURL(file),
    video = document.createElement("video");
  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new CmsError("video_format")),
        10000,
      );
      video.onloadedmetadata = () => {
        clearTimeout(timer);
        resolve();
      };
      video.onerror = () => {
        clearTimeout(timer);
        reject(new CmsError("video_format"));
      };
      video.preload = "metadata";
      video.src = src;
    });
    if (!Number.isFinite(video.duration) || video.duration > L.videoSeconds)
      throw new CmsError("video_duration");
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(src);
  }
}
export async function uploadMedia(file: File, kind: "image" | "video") {
  const files =
    kind === "image"
      ? await optimizeImage(file)
      : (await validateVideo(file), [file]);
  const form = new FormData();
  form.set("kind", kind);
  form.set("name", file.name);
  files.forEach((f) => form.append("files", f));
  const media = await cmsRequest<EditorialMedia>("/media", "POST", form);
  // The size visitors actually download at most.
  const webpFiles = files.filter((f) => f.type !== "image/jpeg");
  return { media, delivered: webpFiles.at(-1)?.size ?? file.size };
}
