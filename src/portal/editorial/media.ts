import { EDITORIAL_LIMITS as L } from "../../../supabase/functions/_shared/editorial";
import { CmsError, cmsRequest } from "./api";
import type { EditorialMedia } from "../../../supabase/functions/_shared/editorial";

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
      ...new Set([Math.min(480, large), Math.min(960, large), large]),
    ].sort((a, b) => a - b);
    const files: File[] = [];
    for (const width of widths) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = Math.max(
        1,
        Math.round((bitmap.height * width) / bitmap.width),
      );
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new CmsError("image_source");
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      let blob: Blob | null = null;
      for (const quality of [0.9, 0.82, 0.74, 0.65]) {
        blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/webp", quality),
        );
        if (blob && blob.size <= L.imageVariantBytes) break;
      }
      canvas.width = canvas.height = 1;
      if (!blob || blob.type !== "image/webp")
        throw new CmsError("webp_unavailable");
      if (blob.size > L.imageVariantBytes) throw new CmsError("file_too_large");
      files.push(new File([blob], `${width}.webp`, { type: "image/webp" }));
    }
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
  return cmsRequest<EditorialMedia>("/media", "POST", form);
}
