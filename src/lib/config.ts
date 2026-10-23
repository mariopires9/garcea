// Tunable settings. Each one can be overridden with an environment variable
// (see .env.example); when the variable is unset, empty or not a valid value,
// the default below is used. Out-of-range values are clamped to safe limits.
//
// NEXT_PUBLIC_* settings are also needed in the browser: Next.js bakes them
// into the build, so changing one on Vercel only takes effect after a
// redeploy. Each `process.env.NAME` must be written out literally for that
// inlining to work - don't build the names dynamically.

type NumberRange = { min: number; max: number; integer?: boolean };

function numberFromEnv(
  name: string,
  raw: string | undefined,
  fallback: number,
  { min, max, integer = true }: NumberRange,
): number {
  if (raw === undefined || raw.trim() === "") return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || (integer && !Number.isInteger(value))) {
    console.warn(`${name}="${raw}" is not a valid ${integer ? "whole " : ""}number; using ${fallback}.`);
    return fallback;
  }
  if (value < min || value > max) {
    const clamped = Math.min(max, Math.max(min, value));
    console.warn(`${name}=${value} is outside ${min}-${max}; using ${clamped}.`);
    return clamped;
  }
  return value;
}

function stringFromEnv(raw: string | undefined, fallback: string): string {
  return raw?.trim() || fallback;
}

// --- Site ---

/** Shown in the header, footer, page titles and link previews. */
export const SITE_NAME = stringFromEnv(process.env.NEXT_PUBLIC_SITE_NAME, "Associação GARCEA");

/** Default description for search engines and link previews (server only). */
export const SITE_DESCRIPTION = stringFromEnv(
  process.env.SITE_DESCRIPTION,
  "Site oficial da Associação GARCEA e do Rancho Folclórico das Lavradeiras de Gondar: eventos, historial e contactos.",
);

// --- Gallery ---

/** Items per gallery batch; "Ver mais" adds this many (server only). */
export const GALLERY_PAGE_SIZE = numberFromEnv(
  "GALLERY_PAGE_SIZE",
  process.env.GALLERY_PAGE_SIZE,
  24,
  { min: 1, max: 200 },
);

// --- Uploads ---

/**
 * Max size of one upload request, in MB. Vercel rejects function request
 * bodies over 4.5MB before our code runs, so this can be lowered but never
 * raised past 4.4MB (leaves room for the other form fields).
 */
export const MAX_UPLOAD_MB = numberFromEnv(
  "NEXT_PUBLIC_MAX_UPLOAD_MB",
  process.env.NEXT_PUBLIC_MAX_UPLOAD_MB,
  4,
  { min: 0.5, max: 4.4, integer: false },
);
export const MAX_UPLOAD_BYTES = Math.round(MAX_UPLOAD_MB * 1024 * 1024);

/** Photos per gallery upload; ~15 compressed photos normally fit in one request. */
export const MAX_PHOTOS_PER_UPLOAD = numberFromEnv(
  "NEXT_PUBLIC_MAX_PHOTOS_PER_UPLOAD",
  process.env.NEXT_PUBLIC_MAX_PHOTOS_PER_UPLOAD,
  15,
  { min: 1, max: 100 },
);

/** Longest side, in px, gallery photos are resized to before upload. */
export const PHOTO_MAX_DIMENSION = numberFromEnv(
  "NEXT_PUBLIC_PHOTO_MAX_DIMENSION",
  process.env.NEXT_PUBLIC_PHOTO_MAX_DIMENSION,
  1920,
  { min: 320, max: 8000 },
);

/** Longest side, in px, for event posters - bigger, since they carry small text. */
export const POSTER_MAX_DIMENSION = numberFromEnv(
  "NEXT_PUBLIC_POSTER_MAX_DIMENSION",
  process.env.NEXT_PUBLIC_POSTER_MAX_DIMENSION,
  2560,
  { min: 320, max: 8000 },
);

/** WebP/JPEG quality used when compressing uploads (0.1-1). */
export const IMAGE_QUALITY = numberFromEnv(
  "NEXT_PUBLIC_IMAGE_QUALITY",
  process.env.NEXT_PUBLIC_IMAGE_QUALITY,
  0.82,
  { min: 0.1, max: 1, integer: false },
);

// --- Accounts (server only) ---

/** Minimum password length. Can be raised, never lowered below 8. */
export const MIN_PASSWORD_LENGTH = numberFromEnv(
  "MIN_PASSWORD_LENGTH",
  process.env.MIN_PASSWORD_LENGTH,
  8,
  { min: 8, max: 128 },
);

/**
 * bcrypt work factor for password hashes; each +1 doubles the hashing time.
 * Deliberately not an environment variable: it's a security setting that
 * shouldn't change per deployment.
 */
export const BCRYPT_COST = 12;
