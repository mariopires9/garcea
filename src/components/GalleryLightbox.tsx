"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { GalleryItemCard } from "@/components/GalleryItemCard";
import { PhotoLightbox, type LightboxPhoto } from "@/components/PhotoLightbox";

type GalleryItem = {
  id: string;
  type: "PHOTO" | "VIDEO";
  url: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
};

const OpenPhotoContext = createContext<((id: string) => void) | null>(null);

/**
 * Lets a Server Component keep its own grid layout (extra labels, buttons…)
 * while any `ZoomableGalleryItemCard` inside opens the shared photo viewer.
 */
export function GalleryLightboxProvider({
  photos,
  children,
}: {
  photos: LightboxPhoto[];
  children: ReactNode;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function openPhoto(id: string) {
    const index = photos.findIndex((photo) => photo.id === id);
    if (index !== -1) setOpenIndex(index);
  }

  return (
    <OpenPhotoContext.Provider value={openPhoto}>
      {children}
      <PhotoLightbox photos={photos} openIndex={openIndex} onClose={() => setOpenIndex(null)} />
    </OpenPhotoContext.Provider>
  );
}

export function ZoomableGalleryItemCard({ item }: { item: GalleryItem }) {
  const openPhoto = useContext(OpenPhotoContext);
  return (
    <GalleryItemCard
      item={item}
      onPhotoClick={openPhoto ? () => openPhoto(item.id) : undefined}
    />
  );
}
