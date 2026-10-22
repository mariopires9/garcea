import { notFound } from "next/navigation";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { executeGraphQL } from "@/lib/graphql-server";
import { GALLERY_ITEM_QUERY } from "@/lib/queries/gallery";
import { EVENT_OPTIONS_QUERY } from "@/lib/queries/events";
import { PageContainer } from "@/components/PageContainer";
import { BackButton } from "@/components/BackButton";
import { FormCard } from "@/components/FormCard";
import { ImageCompressingForm } from "@/components/ImageCompressingForm";
import { SubmitButton } from "@/components/SubmitButton";
import { updateGalleryItemAction } from "../../actions";

type GalleryItemData = {
  galleryItem: {
    id: string;
    type: "PHOTO" | "VIDEO";
    url: string;
    event: { id: string } | null;
  } | null;
};

type EventsData = { events: { id: string; title: string }[] };

export default async function EditGalleryItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const [data, eventsData] = await Promise.all([
    executeGraphQL<GalleryItemData>(GALLERY_ITEM_QUERY, { id }),
    executeGraphQL<EventsData>(EVENT_OPTIONS_QUERY),
  ]);

  if (!data.galleryItem) notFound();

  const item = data.galleryItem;
  const isPhoto = item.type === "PHOTO";
  const updateWithId = updateGalleryItemAction.bind(null, id);

  return (
    <PageContainer maxWidth="sm">
      <BackButton href="/manage/gallery" />
      <Typography variant="h4" component="h1">
        {isPhoto ? "Editar Foto" : "Editar Vídeo"}
      </Typography>
      <FormCard error={error}>
        <ImageCompressingForm action={updateWithId} imageField="photo" maxDimension={1920}>
          {isPhoto ? (
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Foto atual
              </Typography>
              <Box
                component="img"
                src={item.url}
                alt=""
                sx={{ maxWidth: "100%", maxHeight: "20rem", objectFit: "contain", alignSelf: "flex-start", borderRadius: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Substituir por outra foto (opcional)
              </Typography>
              <input type="file" name="photo" accept="image/*" />
            </Stack>
          ) : (
            <Stack spacing={1}>
              <Box
                component="iframe"
                src={item.url}
                title="Vídeo atual"
                loading="lazy"
                allowFullScreen
                sx={{ width: "100%", aspectRatio: "16 / 9", border: 0, borderRadius: 1 }}
              />
              <TextField
                label="Novo link do vídeo (opcional)"
                name="videoUrl"
                type="url"
                placeholder="https://www.youtube.com/watch?v=... ou https://www.facebook.com/.../videos/..."
                helperText="Deixe vazio para manter o vídeo atual"
              />
            </Stack>
          )}

          <FormControl fullWidth>
            <InputLabel id="event-label" shrink>
              Evento
            </InputLabel>
            <Select
              labelId="event-label"
              label="Evento"
              name="eventId"
              defaultValue={item.event?.id ?? ""}
              // Show "Nenhum" instead of an empty box when there's no event.
              displayEmpty
              notched
            >
              <MenuItem value="">Nenhum</MenuItem>
              {eventsData.events.map((event) => (
                <MenuItem key={event.id} value={event.id}>
                  {event.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <SubmitButton variant="contained" sx={{ alignSelf: "flex-start" }}>
            Guardar
          </SubmitButton>
        </ImageCompressingForm>
      </FormCard>
    </PageContainer>
  );
}
