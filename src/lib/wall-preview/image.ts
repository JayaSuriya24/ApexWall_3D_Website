// Upload helpers: validation, EXIF-aware decoding and downscaling.
// Everything stays in the browser; nothing is uploaded.

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ACCEPT_ATTR = ACCEPTED_TYPES.join(",");
export const MAX_FILE_BYTES = 15 * 1024 * 1024;

export interface LoadedImage {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  url: string;
}

type FileLike = Pick<File, "name" | "type" | "size">;

export function validateImageFile(file: FileLike | null | undefined): { ok: true } | { ok: false; error: string } {
  if (!file) return { ok: false, error: "No file selected." };
  const name = (file.name || "").toLowerCase();
  if (/hei[cf]/.test(file.type) || /\.(heic|heif)$/.test(name)) {
    return {
      ok: false,
      error:
        "HEIC photos aren't supported yet. Please export the photo as JPG, or on iPhone choose Settings › Camera › Formats › Most Compatible.",
    };
  }
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { ok: false, error: "Please choose a JPG, PNG or WebP image." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return {
      ok: false,
      error: `This image is ${(file.size / 1048576).toFixed(1)} MB. The limit is ${MAX_FILE_BYTES / 1048576} MB.`,
    };
  }
  return { ok: true };
}

export function fitWithin(width: number, height: number, maxEdge: number) {
  const s = Math.min(1, maxEdge / Math.max(width, height));
  return { width: Math.round(width * s), height: Math.round(height * s) };
}

// createImageBitmap applies EXIF rotation, so phone photos come out upright.
async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // fall through to <img> decoding (older Safari)
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/jpeg", quality = 0.88): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode image."))), type, quality),
  );
}

/** Wraps a canvas in the shape the editor uses for both uploads and built-in images. */
export async function imageFromCanvas(
  canvas: HTMLCanvasElement,
  { type = "image/jpeg", originalWidth, originalHeight }: { type?: string; originalWidth?: number; originalHeight?: number } = {},
): Promise<LoadedImage> {
  const blob = await canvasToBlob(canvas, type, 0.9);
  return {
    canvas,
    width: canvas.width,
    height: canvas.height,
    originalWidth: originalWidth ?? canvas.width,
    originalHeight: originalHeight ?? canvas.height,
    url: URL.createObjectURL(blob),
  };
}

/** Loads one of the site's own images (e.g. a sample room) like an upload. */
export async function loadImageUrl(url: string, maxEdge: number): Promise<LoadedImage> {
  const blob = await (await fetch(url)).blob();
  return loadImageFile(new File([blob], url.split("/").pop() ?? "image", { type: blob.type }), maxEdge);
}

export async function loadImageFile(file: File, maxEdge: number): Promise<LoadedImage> {
  const src = await decode(file);
  const originalWidth = "naturalWidth" in src ? src.naturalWidth : src.width;
  const originalHeight = "naturalHeight" in src ? src.naturalHeight : src.height;
  const { width, height } = fitWithin(originalWidth, originalHeight, maxEdge);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, 0, 0, width, height);
  if ("close" in src) src.close();
  // Keep PNG/WebP transparency (logos); photos become JPEG.
  const type = file.type === "image/jpeg" ? "image/jpeg" : "image/png";
  return imageFromCanvas(canvas, { type, originalWidth, originalHeight });
}
