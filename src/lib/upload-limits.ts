// Vercel rejects function request bodies over 4.5MB before our code runs
// (next.config.ts's bodySizeLimit doesn't lift that), so uploads are capped
// below it, leaving room for the other form fields and multipart overhead.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Photos per gallery upload; ~15 compressed photos normally fit in one request. */
export const MAX_PHOTOS_PER_UPLOAD = 15;
