import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { isFacebookEmbedUrl } from "@/lib/video";

type GalleryItem = {
  id: string;
  type: "PHOTO" | "VIDEO";
  url: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
};

function withAutoplay(url: string): string {
  try {
    const parsed = new URL(url);
    if (isFacebookEmbedUrl(url)) {
      // Facebook's video plugin expects string booleans, not 1/0.
      parsed.searchParams.set("autoplay", "true");
      parsed.searchParams.set("mute", "true");
    } else {
      parsed.searchParams.set("autoplay", "1");
      parsed.searchParams.set("mute", "1");
      parsed.searchParams.set("muted", "1");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function GalleryItemCard({
  item,
  autoPlay = false,
  fillHeight = false,
  hoverLift = true,
  onPhotoClick,
}: {
  item: GalleryItem;
  autoPlay?: boolean;
  fillHeight?: boolean;
  hoverLift?: boolean;
  /** When set, photos become clickable (e.g. to open a lightbox). */
  onPhotoClick?: () => void;
}) {
  const photo = (
    <CardMedia
      component="img"
      image={item.thumbnailUrl ?? item.url}
      alt={item.caption ?? ""}
      // Only download photos as they scroll into view.
      loading="lazy"
      decoding="async"
      sx={
        fillHeight
          ? { flex: 1, minHeight: 0, width: "100%", objectFit: "cover" }
          : { aspectRatio: "1 / 1", objectFit: "cover" }
      }
    />
  );

  return (
    <Card
      variant="outlined"
      sx={{
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        ...(hoverLift && { "&:hover": { transform: "translateY(-4px)", boxShadow: 4 } }),
        ...(fillHeight && {
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }),
      }}
    >
      {item.type === "PHOTO" ? (
        onPhotoClick ? (
          <CardActionArea
            onClick={onPhotoClick}
            aria-label={item.caption ? `Ampliar: ${item.caption}` : "Ampliar foto"}
            sx={{
              cursor: "zoom-in",
              ...(fillHeight && { flex: 1, minHeight: 0, display: "flex" }),
            }}
          >
            {photo}
          </CardActionArea>
        ) : (
          photo
        )
      ) : (
        <Box
          component="iframe"
          src={autoPlay ? withAutoplay(item.url) : item.url}
          title={item.caption ?? "Vídeo"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
          allowFullScreen
          sx={
            fillHeight
              ? { flex: 1, minHeight: 0, width: "100%", border: 0, display: "block" }
              : { aspectRatio: "16 / 9", width: "100%", border: 0, display: "block" }
          }
        />
      )}
      {item.caption && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ px: 1, py: 0.5, display: "block" }}
        >
          {item.caption}
        </Typography>
      )}
    </Card>
  );
}
