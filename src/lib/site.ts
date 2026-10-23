import type { Metadata } from "next";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/config";

// NEXT_PUBLIC_SITE_URL wins (e.g. https://associacaogarcea.pt once the domain
// is live); otherwise Vercel's auto-set production domain, then localhost.
// `||` rather than `??` so an empty `NEXT_PUBLIC_SITE_URL=` also falls back.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const DEFAULT_IMAGE = { url: "/logo.png", width: 512, height: 512, alt: SITE_NAME };

/**
 * Metadata for a public page. Next.js merges metadata shallowly, so a page
 * that sets `openGraph` replaces the root layout's whole `openGraph` object -
 * this always rebuilds it in full so site name, locale and image survive.
 */
export function pageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
  image,
}: {
  title?: string;
  description?: string;
  /** Omit only in layouts: a canonical URL there would leak into every child page. */
  path?: string;
  image?: string | null;
}): Metadata {
  return {
    ...(title && { title }),
    description,
    ...(path && { alternates: { canonical: path } }),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "pt_PT",
      title: title ?? SITE_NAME,
      description,
      ...(path && { url: path }),
      images: image ? [{ url: image, alt: title ?? SITE_NAME }] : [DEFAULT_IMAGE],
    },
    twitter: { card: image ? "summary_large_image" : "summary" },
  };
}

/** Collapses whitespace and trims to a preview-friendly length. */
export function toMetaDescription(text: string, maxLength = 160): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length <= maxLength ? flat : `${flat.slice(0, maxLength - 1).trimEnd()}…`;
}
