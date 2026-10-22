import { notFound } from "next/navigation";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { executeGraphQL } from "@/lib/graphql-server";
import { HOME_SECTION_QUERY, GALLERY_ITEMS_FOR_PICKER_QUERY } from "@/lib/queries/homeSections";
import { PageContainer } from "@/components/PageContainer";
import { BackButton } from "@/components/BackButton";
import { GalleryItemCard } from "@/components/GalleryItemCard";
import { SubmitButton } from "@/components/SubmitButton";
import { featureHomeSectionPhotoAction } from "../../actions";

type HomeSectionData = {
  homeSection: { id: string; title: string; featuredPhotos: { id: string }[] } | null;
};

type GalleryItemsData = {
  galleryItems: {
    id: string;
    type: "PHOTO" | "VIDEO";
    url: string;
    thumbnailUrl: string | null;
  }[];
};

export default async function AddHomeSectionPhotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [sectionData, galleryData] = await Promise.all([
    executeGraphQL<HomeSectionData>(HOME_SECTION_QUERY, { id }),
    executeGraphQL<GalleryItemsData>(GALLERY_ITEMS_FOR_PICKER_QUERY),
  ]);

  if (!sectionData.homeSection) notFound();

  const featuredIds = new Set(sectionData.homeSection.featuredPhotos.map((photo) => photo.id));
  const available = galleryData.galleryItems.filter((item) => !featuredIds.has(item.id));

  return (
    <PageContainer maxWidth="md">
      <BackButton href={`/manage/home-sections/${id}`} />
      <Typography variant="h4" component="h1">
        Adicionar Foto à Secção &quot;{sectionData.homeSection.title}&quot;
      </Typography>
      {available.length === 0 ? (
        <Typography>
          Não há itens da galeria disponíveis. Carregue fotos em Gerir Galeria
          primeiro.
        </Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" },
            gap: 3,
          }}
        >
          {available.map((item) => {
            const feature = featureHomeSectionPhotoAction.bind(null, id, item.id);
            return (
              <Stack key={item.id} spacing={1}>
                <GalleryItemCard item={item} />
                <form action={feature}>
                  <SubmitButton size="small" variant="contained">
                    Destacar na Página Inicial
                  </SubmitButton>
                </form>
              </Stack>
            );
          })}
        </Box>
      )}
    </PageContainer>
  );
}
