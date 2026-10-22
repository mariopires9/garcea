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
import { ShowMoreButton } from "@/components/ShowMoreButton";
import { GALLERY_PAGE_SIZE, parseGalleryLimit } from "@/lib/gallery-paging";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

type GalleryData = {
  galleryItemsCount: number;
  galleryItems: {
    id: string;
    type: "PHOTO" | "VIDEO";
    url: string;
    thumbnailUrl: string | null;
    event: { id: string; title: string } | null;
  }[];
};

export const metadata: Metadata = pageMetadata({
  title: "Galeria",
  description:
    "Fotos e vídeos das atuações do Rancho Folclórico das Lavradeiras de Gondar.",
  path: "/gallery",
});

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string }>;
}) {
  const limit = parseGalleryLimit((await searchParams).limit);
  const data = await executeGraphQL<GalleryData>(GALLERY_ITEMS_QUERY, { limit });

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
              }))}
            />
          </Stack>
        </ScrollReveal>
      ))}
      {data.galleryItemsCount > data.galleryItems.length && (
        <ShowMoreButton
          href={`/gallery?limit=${limit + GALLERY_PAGE_SIZE}`}
          shown={data.galleryItems.length}
          total={data.galleryItemsCount}
        />
      )}
    </PageContainer>
  );
}
