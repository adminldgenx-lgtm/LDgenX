import { EditorialError, EDITORIAL_LIMITS } from "./editorial.ts";

const ascii = (b: Uint8Array, start: number, end: number) =>
  String.fromCharCode(...b.slice(start, end));
export function webpSize(b: Uint8Array): { width: number; height: number } {
  if (b.length < 30 || ascii(b, 0, 4) !== "RIFF" || ascii(b, 8, 12) !== "WEBP")
    throw new EditorialError("image_format");
  const chunk = ascii(b, 12, 16);
  let width = 0,
    height = 0;
  if (chunk === "VP8X") {
    if (b[20] & 2) throw new EditorialError("animated_image");
    width = 1 + b[24] + (b[25] << 8) + (b[26] << 16);
    height = 1 + b[27] + (b[28] << 8) + (b[29] << 16);
  } else if (chunk === "VP8L" && b[20] === 0x2f) {
    width = 1 + b[21] + ((b[22] & 0x3f) << 8);
    height = 1 + (b[22] >> 6) + (b[23] << 2) + ((b[24] & 0xf) << 10);
  } else if (
    chunk === "VP8 " &&
    b[23] === 0x9d &&
    b[24] === 1 &&
    b[25] === 0x2a
  ) {
    width = (b[26] | (b[27] << 8)) & 0x3fff;
    height = (b[28] | (b[29] << 8)) & 0x3fff;
  }
  if (
    !width ||
    !height ||
    width > EDITORIAL_LIMITS.imageWidth ||
    height > EDITORIAL_LIMITS.imageWidth ||
    width * height > 6_000_000
  )
    throw new EditorialError("image_dimensions");
  return { width, height };
}
export function videoMime(b: Uint8Array): "video/mp4" | "video/webm" {
  if (b.length > 12 && ascii(b, 4, 8) === "ftyp") return "video/mp4";
  if (b.length > 12 && [0x1a, 0x45, 0xdf, 0xa3].every((v, i) => b[i] === v))
    return "video/webm";
  throw new EditorialError("video_format");
}
