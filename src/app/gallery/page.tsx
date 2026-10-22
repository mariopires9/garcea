import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import { executeGraphQL } from "@/lib/graphql-server";
import { GALLERY_ITEMS_QUERY } from "@/lib/queries/gallery";
import { GalleryGrid } from "@/components/GalleryGrid";
import { PageContainer } from "@/components/PageContainer";
import { PageTitle } from "@/components/PageTitle";
import { ScrollReveal } from "@/components/ScrollReveal";

type GalleryData = {
  galleryItems: {
    id: string;
    type: "PHOTO" | "VIDEO";
    url: string;
    thumbnailUrl: string | null;
    caption: string | null;
    event: { id: string; title: string } | null;
  }[];
};

export default async function GalleryPage() {
  const data = await executeGraphQL<GalleryData>(GALLERY_ITEMS_QUERY);

  if (data.galleryItems.length === 0) {
    return (
      <PageContainer maxWidth="md">
        <PageTitle icon={<PhotoLibraryIcon />}>Galeria</PageTitle>
        <Typography>Ainda não há fotos ou vídeos.</Typography>
      </PageContainer>
    );
  }

  const groups = new Map<
    string,
    { title: string; items: GalleryData["galleryItems"] }
  >();
  for (const item of data.galleryItems) {
    const key = item.event?.id ?? "none";
    const title = item.event?.title ?? "Outros";
    if (!groups.has(key)) groups.set(key, { title, items: [] });
    groups.get(key)!.items.push(item);
  }

  return (
    <PageContainer maxWidth="md">
      <PageTitle icon={<PhotoLibraryIcon />}>Galeria</PageTitle>
      {Array.from(groups.values()).map((group) => (
        <ScrollReveal key={group.title}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography variant="h5" component="h2">
                {group.title}
              </Typography>
              <Chip size="small" color="primary" label={group.items.length} />
            </Stack>
            <GalleryGrid
              items={group.items.map((item) => ({
                id: item.id,
                type: item.type,
                url: item.url,
                thumbnailUrl: item.thumbnailUrl,
                caption: item.caption,
              }))}
            />
          </Stack>
        </ScrollReveal>
      ))}
    </PageContainer>
  );
}
