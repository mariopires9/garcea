"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export type LightboxPhoto = {
  id: string;
  url: string;
  caption?: string | null;
};

const overlayButtonSx = {
  position: "absolute",
  color: "common.white",
  bgcolor: "rgba(0, 0, 0, 0.4)",
  "&:hover": { bgcolor: "rgba(0, 0, 0, 0.6)" },
} as const;

const navButtonSx = {
  ...overlayButtonSx,
  top: "50%",
  transform: "translateY(-50%)",
  // The theme's IconButton hover sets `transform: scale(...)`, which would
  // otherwise drop the vertical centering and make the button jump down.
  "&:hover": { ...overlayButtonSx["&:hover"], transform: "translateY(-50%) scale(1.08)" },
  display: { xs: "none", sm: "inline-flex" },
} as const;

/** Full-screen photo viewer; swipe, arrow keys or buttons move between photos. */
export function PhotoLightbox({
  photos,
  openIndex,
  onClose,
}: {
  photos: LightboxPhoto[];
  openIndex: number | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      fullScreen
      open={openIndex !== null}
      onClose={onClose}
      aria-label="Visualizador de fotos"
      slotProps={{ paper: { sx: { bgcolor: "rgba(0, 0, 0, 0.95)" } } }}
    >
      {openIndex !== null && (
        <LightboxContent photos={photos} startIndex={openIndex} onClose={onClose} />
      )}
    </Dialog>
  );
}

function LightboxContent({
  photos,
  startIndex,
  onClose,
}: {
  photos: LightboxPhoto[];
  startIndex: number;
  onClose: () => void;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ startIndex, loop: photos.length > 1 });
  const [selectedIndex, setSelectedIndex] = useState(startIndex);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") emblaApi?.scrollPrev();
      if (event.key === "ArrowRight") emblaApi?.scrollNext();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [emblaApi]);

  const caption = photos[selectedIndex]?.caption;

  return (
    <Box sx={{ position: "relative", height: "100%", display: "flex", flexDirection: "column" }}>
      <Box ref={emblaRef} sx={{ overflow: "hidden", flex: 1, minHeight: 0 }}>
        <Box sx={{ display: "flex", height: "100%" }}>
          {photos.map((photo) => (
            <Box
              key={photo.id}
              sx={{
                flex: "0 0 100%",
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: { xs: 1, sm: 4 },
              }}
            >
              <Box
                component="img"
                src={photo.url}
                alt={photo.caption ?? ""}
                sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", userSelect: "none" }}
                draggable={false}
              />
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ textAlign: "center", color: "common.white", px: 2, pb: 2, minHeight: "3rem" }}>
        {caption && <Typography>{caption}</Typography>}
        {photos.length > 1 && (
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {selectedIndex + 1} / {photos.length}
          </Typography>
        )}
      </Box>

      <IconButton
        aria-label="Fechar"
        onClick={onClose}
        sx={{ ...overlayButtonSx, top: 12, right: 12 }}
      >
        <CloseIcon />
      </IconButton>

      {photos.length > 1 && (
        <>
          <IconButton
            aria-label="Anterior"
            onClick={() => emblaApi?.scrollPrev()}
            sx={{ ...navButtonSx, left: 12 }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>
          <IconButton
            aria-label="Seguinte"
            onClick={() => emblaApi?.scrollNext()}
            sx={{ ...navButtonSx, right: 12 }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </>
      )}
    </Box>
  );
}
