import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import EventIcon from "@mui/icons-material/Event";
import { executeGraphQL } from "@/lib/graphql-server";
import { EVENTS_QUERY } from "@/lib/queries/events";
import { PageContainer } from "@/components/PageContainer";
import { ManageListCard } from "@/components/ManageListCard";
import { BackButton } from "@/components/BackButton";
import { PageTitle } from "@/components/PageTitle";
import { FlashMessage } from "@/components/FlashMessage";
import { isPdfUrl } from "@/lib/supabase-storage";
import { EVENT_TYPE_LABELS } from "@/lib/eventTypes";

type EventsData = {
  events: {
    id: string;
    title: string;
    date: string;
    location: string;
    posterUrl: string | null;
    type: "FOLCLORE" | "OUTROS";
  }[];
};

export default async function ManageEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success } = await searchParams;
  const data = await executeGraphQL<EventsData>(EVENTS_QUERY);

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
        <PageTitle icon={<EventIcon />}>Gerir Eventos</PageTitle>
        <Button href="/manage/events/new" variant="contained">
          Novo Evento
        </Button>
      </Box>
      {data.events.length === 0 ? (
        <Typography>Ainda não há eventos.</Typography>
      ) : (
        <Stack spacing={2}>
          {data.events.map((event) => (
            <ManageListCard
              key={event.id}
              leading={
                event.posterUrl && !isPdfUrl(event.posterUrl) ? (
                  <Box
                    component="img"
                    src={event.posterUrl}
                    alt=""
                    sx={{ width: "3.5rem", height: "3.5rem", objectFit: "cover", borderRadius: 1 }}
                  />
                ) : undefined
              }
              actions={
                <>
                  <Button href={`/manage/events/${event.id}/edit`}>Editar</Button>
                  <Button href={`/manage/events/${event.id}/delete`} color="error">
                    Eliminar
                  </Button>
                </>
              }
            >
              <Typography sx={{ fontWeight: 500 }}>{event.title}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                <Chip
                  size="small"
                  color="secondary"
                  label={new Date(event.date).toLocaleDateString("pt-PT")}
                  sx={{ flexShrink: 0 }}
                />
                <Chip
                  size="small"
                  variant="outlined"
                  label={EVENT_TYPE_LABELS[event.type]}
                  sx={{ flexShrink: 0 }}
                />
                {/* Same line as the chips; cut with "..." when it doesn't fit. */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  noWrap
                  title={event.location}
                  sx={{ minWidth: 0 }}
                >
                  {event.location}
                </Typography>
              </Box>
            </ManageListCard>
          ))}
        </Stack>
      )}
    </PageContainer>
  );
}
