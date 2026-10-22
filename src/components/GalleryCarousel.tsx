"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { GalleryItemCard } from "@/components/GalleryItemCard";
import { PhotoLightbox } from "@/components/PhotoLightbox";

type GalleryItem = {
  id: string;
  type: "PHOTO" | "VIDEO";
  url: string;
  thumbnailUrl?: string | null;
};

export function GalleryCarousel({ items }: { items: GalleryItem[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: items.length > 1 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    // Sync initial state from the embla instance, which only exists post-mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (items.length === 0) return null;

  const photos = items.filter((item) => item.type === "PHOTO");

  return (
    <Box sx={{ position: "relative" }}>
      <Box ref={emblaRef} sx={{ overflow: "hidden" }}>
        <Box
          sx={{
            display: "flex",
            mx: -1,
            height: { xs: "17.5rem", sm: "20rem", md: "22.5rem" },
          }}
        >
          {items.map((item, index) => (
            <Box
              key={item.id}
              sx={{
                flex: "0 0 100%",
                minWidth: 0,
                px: 1,
                "@media (min-width: 600px)": { flex: "0 0 60%" },
                "@media (min-width: 900px)": { flex: "0 0 40%" },
              }}
            >
              <GalleryItemCard
                item={item}
                autoPlay={index === selectedIndex}
                fillHeight
                hoverLift={false}
                onPhotoClick={() => setLightboxIndex(photos.indexOf(item))}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {items.length > 1 && (
        <>
          <IconButton
            aria-label="Anterior"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            sx={{
              position: "absolute",
              top: "50%",
              left: 8,
              transform: "translateY(-50%)",
              bgcolor: "background.paper",
              boxShadow: 2,
              "&:hover": { bgcolor: "background.paper", transform: "translateY(-50%) scale(1.08)" },
            }}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label="Seguinte"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            sx={{
              position: "absolute",
              top: "50%",
              right: 8,
              transform: "translateY(-50%)",
              bgcolor: "background.paper",
              boxShadow: 2,
              "&:hover": { bgcolor: "background.paper", transform: "translateY(-50%) scale(1.08)" },
            }}
          >
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 2 }}>
            {items.map((item, index) => (
              <Box
                key={item.id}
                component="button"
                type="button"
                aria-label={`Ir para o item ${index + 1}`}
                onClick={() => emblaApi?.scrollTo(index)}
                sx={{
                  width: "0.5rem",
                  height: "0.5rem",
                  borderRadius: "50%",
                  border: "none",
                  p: 0,
                  cursor: "pointer",
                  bgcolor: index === selectedIndex ? "primary.main" : "action.disabled",
                  transition: "background-color 0.2s",
                }}
              />
            ))}
          </Box>
        </>
      )}

      <PhotoLightbox
        photos={photos}
        openIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />
    </Box>
  );
}
