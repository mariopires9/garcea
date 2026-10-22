"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import { GalleryItemCard } from "@/components/GalleryItemCard";
import { PhotoLightbox } from "@/components/PhotoLightbox";

type GalleryItem = {
  id: string;
  type: "PHOTO" | "VIDEO";
  url: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
};

/** Public gallery grid; clicking a photo opens it full-screen. */
export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const photos = items.filter((item) => item.type === "PHOTO");

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        {items.map((item) => (
          <GalleryItemCard
            key={item.id}
            item={item}
            onPhotoClick={() => setOpenIndex(photos.indexOf(item))}
          />
        ))}
      </Box>
      <PhotoLightbox photos={photos} openIndex={openIndex} onClose={() => setOpenIndex(null)} />
    </>
  );
}
