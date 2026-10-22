import { notFound } from "next/navigation";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { executeGraphQL } from "@/lib/graphql-server";
import { HOME_SECTION_QUERY } from "@/lib/queries/homeSections";
import { PageContainer } from "@/components/PageContainer";
import { BackButton } from "@/components/BackButton";
import { HomeSectionForm } from "@/components/HomeSectionForm";
import { GalleryItemCard } from "@/components/GalleryItemCard";
import { SubmitButton } from "@/components/SubmitButton";
import { updateHomeSectionAction, unfeatureHomeSectionPhotoAction } from "../actions";

type HomeSectionData = {
  homeSection: {
    id: string;
    title: string;
    description: string;
    featuredPhotos: {
      id: string;
      type: "PHOTO" | "VIDEO";
      url: string;
      thumbnailUrl: string | null;
    }[];
  } | null;
};

export default async function EditHomeSectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await executeGraphQL<HomeSectionData>(HOME_SECTION_QUERY, { id });

  if (!data.homeSection) notFound();

  const updateWithId = updateHomeSectionAction.bind(null, id);

  return (
    <PageContainer maxWidth="md">
      <BackButton href="/manage/home-sections" />
      <Typography variant="h4" component="h1">
        Editar Secção
      </Typography>

      <HomeSectionForm
        action={updateWithId}
        defaultValues={data.homeSection}
        submitLabel="Guardar"
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h5" component="h2">
          Fotos em Destaque
        </Typography>
        <Button href={`/manage/home-sections/${id}/add-photo`} variant="contained">
          Adicionar Foto
        </Button>
      </Box>

      {data.homeSection.featuredPhotos.length === 0 ? (
        <Typography>Ainda não há fotos em destaque.</Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" },
            gap: 3,
          }}
        >
          {data.homeSection.featuredPhotos.map((photo) => {
            const unfeature = unfeatureHomeSectionPhotoAction.bind(null, id, photo.id);
            return (
              <Stack key={photo.id} spacing={1}>
                <GalleryItemCard item={photo} />
                <form action={unfeature}>
                  <SubmitButton size="small" color="error">
                    Remover da Página Inicial
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
