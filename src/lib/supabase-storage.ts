import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/config";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "gallery-photos";

// A single file can't be bigger than the whole upload request Vercel accepts.
const MAX_FILE_BYTES = MAX_UPLOAD_BYTES;
const MAX_FILE_LABEL = `${String(MAX_UPLOAD_MB).replace(".", ",")}MB`;

async function uploadToStorage(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const extension = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
      "Content-Type": file.type,
    },
    body: arrayBuffer,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to upload file: ${res.status} ${text}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

export async function uploadPhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Só são permitidos ficheiros de imagem como fotos.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`A foto é demasiado grande (máx. ${MAX_FILE_LABEL}).`);
  }
  return uploadToStorage(file);
}

/** Cartaz uploads: images or PDF (many event posters/flyers are designed as PDFs). */
export async function uploadPoster(file: File): Promise<string> {
  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";
  if (!isImage && !isPdf) {
    throw new Error("Só são permitidos ficheiros de imagem ou PDF para o cartaz.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`O ficheiro é demasiado grande (máx. ${MAX_FILE_LABEL}).`);
  }
  return uploadToStorage(file);
}

export function isPdfUrl(url: string): boolean {
  return url.toLowerCase().endsWith(".pdf");
}

export async function deletePhoto(url: string): Promise<void> {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) {
    console.warn(
      `deletePhoto: URL doesn't match current bucket "${BUCKET}", skipping cleanup: ${url}`,
    );
    return;
  }

  const path = url.slice(index + marker.length);
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
    },
  });

  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`Failed to delete file: ${res.status} ${text}`);
  }
}
