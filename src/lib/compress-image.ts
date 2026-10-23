// Browser-only: shrinks photos before they're uploaded, so they take far less
// of the Supabase free-tier storage/egress (a 4-6MB phone photo typically ends
// up at ~200-400KB) and stay well under the request body limits.

import { IMAGE_QUALITY } from "@/lib/config";

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function compressImage(
  file: File,
  { maxDimension, quality = IMAGE_QUALITY }: { maxDimension: number; quality?: number },
): Promise<File> {
  // GIFs may be animated and SVGs are vectors: re-encoding would break them.
  if (
    !file.type.startsWith("image/") ||
    file.type === "image/gif" ||
    file.type === "image/svg+xml"
  ) {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // Format the browser can't decode (e.g. HEIC outside Safari): upload as-is
    // and let the server-side size check decide.
    return file;
  }

  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return file;
  }
  // White background so transparent PNGs don't turn black if we fall back to JPEG.
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let blob = await canvasToBlob(canvas, "image/webp", quality);
  // Safari can't encode WebP and silently returns a PNG instead.
  if (!blob || blob.type !== "image/webp") {
    blob = await canvasToBlob(canvas, "image/jpeg", quality);
  }
  if (!blob || blob.size >= file.size) return file;

  const extension = blob.type === "image/webp" ? "webp" : "jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "") || "foto";
  return new File([blob], `${baseName}.${extension}`, { type: blob.type });
}

/** Replaces every image in `formData[field]` with its compressed version. */
export async function compressImagesInFormData(
  formData: FormData,
  field: string,
  options: { maxDimension: number; quality?: number },
) {
  const entries = formData.getAll(field);
  const compressed: (File | string)[] = [];
  // Sequential to keep memory low on phones when many photos are selected.
  for (const entry of entries) {
    compressed.push(
      entry instanceof File && entry.size > 0 ? await compressImage(entry, options) : entry,
    );
  }
  formData.delete(field);
  for (const entry of compressed) formData.append(field, entry);
}
