import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import { executeGraphQL } from "@/lib/graphql-server";
import { GALLERY_ITEMS_QUERY } from "@/lib/queries/gallery";
import { EVENT_OPTIONS_QUERY } from "@/lib/queries/events";
import {
  GalleryLightboxProvider,
  ZoomableGalleryItemCard,
} from "@/components/GalleryLightbox";
import {
  GallerySelectionProvider,
  GallerySelectionToolbar,
  SelectableGalleryItem,
} from "@/components/GallerySelection";
import { GalleryFilters } from "@/components/GalleryFilters";
import { PageContainer } from "@/components/PageContainer";
import { BackButton } from "@/components/BackButton";
import { PageTitle } from "@/components/PageTitle";
import { FlashMessage } from "@/components/FlashMessage";

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

type EventsData = { events: { id: string; title: string; date: string }[] };

export default async function ManageGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; eventId?: string; year?: string }>;
}) {
  const { success, eventId, year } = await searchParams;
  const eventsData = await executeGraphQL<EventsData>(EVENT_OPTIONS_QUERY);
  // Rebuild as plain object literals: GraphQL execution results aren't
  // guaranteed to be plain objects (Next.js rejects non-plain-object/
  // null-prototype values passed as props into a Client Component).
  const events = eventsData.events.map((event) => ({
    id: event.id,
    title: event.title,
    year: new Date(event.date).getFullYear(),
  }));
  const years = Array.from(new Set(events.map((event) => event.year))).sort(
    (a, b) => b - a,
  );

  const requestedYear = year ? Number(year) : undefined;
  const selectedYear =
    requestedYear !== undefined && years.includes(requestedYear)
      ? requestedYear
      : undefined;

  const data = await executeGraphQL<GalleryData>(GALLERY_ITEMS_QUERY, {
    eventId: eventId || null,
    year: selectedYear ?? null,
  });

  return (
    <PageContainer maxWidth="md">
      <BackButton href="/manage" />
      <FlashMessage message={success} />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <PageTitle icon={<PhotoLibraryIcon />}>Gerir Galeria</PageTitle>
        <Button href="/manage/gallery/new" variant="contained">
          Adicionar Item
        </Button>
      </Box>

      <GalleryFilters
        events={events}
        years={years}
        selectedYear={selectedYear}
        selectedEventId={eventId}
      />

      {data.galleryItems.length === 0 ? (
        <Typography>
          {eventId
            ? "Não há itens na galeria para este evento."
            : selectedYear
              ? "Não há itens na galeria para este ano."
              : "Ainda não há itens na galeria."}
        </Typography>
      ) : (
        <GallerySelectionProvider
          // Reset the selection whenever the filter changes.
          key={`${eventId ?? ""}-${selectedYear ?? ""}`}
          allIds={data.galleryItems.map((item) => item.id)}
        >
          <GallerySelectionToolbar />
          <GalleryLightboxProvider
            photos={data.galleryItems
              .filter((item) => item.type === "PHOTO")
              .map((item) => ({ id: item.id, url: item.url, caption: item.caption }))}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" },
                gap: 3,
              }}
            >
              {data.galleryItems.map((item) => (
                <Stack key={item.id} spacing={1}>
                  <SelectableGalleryItem id={item.id}>
                    <ZoomableGalleryItemCard
                      item={{
                        id: item.id,
                        type: item.type,
                        url: item.url,
                        thumbnailUrl: item.thumbnailUrl,
                        caption: item.caption,
                      }}
                    />
                  </SelectableGalleryItem>
                  <Typography variant="caption" color="text.secondary">
                    {item.event?.title ?? "Sem evento"}
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button href={`/manage/gallery/${item.id}/edit`} size="small">
                      Editar legenda
                    </Button>
                    <Button
                      href={`/manage/gallery/${item.id}/delete`}
                      size="small"
                      color="error"
                    >
                      Eliminar
                    </Button>
                  </Stack>
                </Stack>
              ))}
            </Box>
          </GalleryLightboxProvider>
        </GallerySelectionProvider>
      )}
    </PageContainer>
  );
}
