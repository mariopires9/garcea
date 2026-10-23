import { GALLERY_PAGE_SIZE } from "@/lib/config";

// Gallery pages show items in batches: the URL's `limit` grows by one page
// each time "Ver mais" is clicked (24 -> 48 -> 72 ... with the default size).
export { GALLERY_PAGE_SIZE };

/** Turns `?limit=` into a whole number of pages, at least one page. */
export function parseGalleryLimit(limit: string | undefined): number {
  const pages = Math.ceil(Number(limit) / GALLERY_PAGE_SIZE);
  return Number.isFinite(pages) && pages > 1 ? pages * GALLERY_PAGE_SIZE : GALLERY_PAGE_SIZE;
}
