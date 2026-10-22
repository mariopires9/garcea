import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { executeGraphQL } from "@/lib/graphql-server";
import { GALLERY_ITEMS_QUERY } from "@/lib/queries/gallery";
import { PageContainer } from "@/components/PageContainer";
import { GalleryItemCard } from "@/components/GalleryItemCard";
import { SubmitButton } from "@/components/SubmitButton";
import { deleteGalleryItemsAction } from "../actions";

type GalleryData = {
  galleryItems: {
    id: string;
    type: "PHOTO" | "VIDEO";
    url: string;
    thumbnailUrl: string | null;
    caption: string | null;
  }[];
};

export default async function DeleteSelectedGalleryItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const requestedIds = new Set((ids ?? "").split(",").filter(Boolean));
  const data = await executeGraphQL<GalleryData>(GALLERY_ITEMS_QUERY, {
    eventId: null,
    year: null,
  });
  // Only items that still exist (one may have been deleted meanwhile).
  const items = data.galleryItems.filter((item) => requestedIds.has(item.id));

  if (items.length === 0) {
    return (
      <PageContainer maxWidth="sm">
        <Typography variant="h4" component="h1">
          Eliminar Itens da Galeria
        </Typography>
        <Typography>Nenhum dos itens selecionados existe.</Typography>
        <Button href="/manage/gallery" variant="outlined" sx={{ alignSelf: "flex-start" }}>
          Voltar à galeria
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="md">
      <Typography variant="h4" component="h1">
        Eliminar Itens da Galeria
      </Typography>
      <Typography>
        {items.length === 1
          ? "Tem a certeza que deseja eliminar este item?"
          : `Tem a certeza que deseja eliminar estes ${items.length} itens?`}{" "}
        Esta ação não pode ser desfeita.
      </Typography>
      {/* Flex gap rather than Stack spacing: Stack's margins would also land on
          the hidden inputs and push the buttons out of line. */}
      <Box component="form" action={deleteGalleryItemsAction} sx={{ display: "flex", gap: 2 }}>
        {items.map((item) => (
          <input key={item.id} type="hidden" name="id" value={item.id} />
        ))}
        <SubmitButton variant="contained" color="error">
          {items.length === 1 ? "Eliminar" : `Eliminar ${items.length} itens`}
        </SubmitButton>
        <Button href="/manage/gallery" variant="outlined">
          Cancelar
        </Button>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(3, 1fr)", sm: "repeat(5, 1fr)" },
          gap: 1.5,
        }}
      >
        {items.map((item) => (
          <GalleryItemCard key={item.id} item={item} hoverLift={false} />
        ))}
      </Box>
    </PageContainer>
  );
}
