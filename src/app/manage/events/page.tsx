import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import EventIcon from "@mui/icons-material/Event";
import { executeGraphQL } from "@/lib/graphql-server";
import { EVENTS_QUERY } from "@/lib/queries/events";
import { PageContainer } from "@/components/PageContainer";
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
            <Card
              key={event.id}
              variant="outlined"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
                p: 2,
                transition: "box-shadow 0.2s ease",
                "&:hover": { boxShadow: 3 },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {event.posterUrl && !isPdfUrl(event.posterUrl) && (
                  <Box
                    component="img"
                    src={event.posterUrl}
                    alt=""
                    sx={{ width: "3rem", height: "3rem", objectFit: "cover", borderRadius: 1 }}
                  />
                )}
                <Box>
                  <Typography sx={{ fontWeight: 500 }}>{event.title}</Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", mt: 0.5 }}>
                    <Chip
                      size="small"
                      color="secondary"
                      label={new Date(event.date).toLocaleDateString("pt-PT")}
                    />
                    <Chip size="small" variant="outlined" label={EVENT_TYPE_LABELS[event.type]} />
                    <Typography variant="body2" color="text.secondary">
                      {event.location}
                    </Typography>
                  </Stack>
                </Box>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button href={`/manage/events/${event.id}/edit`}>Editar</Button>
                <Button
                  href={`/manage/events/${event.id}/delete`}
                  color="error"
                >
                  Eliminar
                </Button>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </PageContainer>
  );
}
