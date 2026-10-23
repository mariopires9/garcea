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
                alignItems: "flex-start",
                gap: 2,
                p: 2,
                transition: "box-shadow 0.2s ease",
                "&:hover": { boxShadow: 3 },
              }}
            >
              {event.posterUrl && !isPdfUrl(event.posterUrl) && (
                <Box
                  component="img"
                  src={event.posterUrl}
                  alt=""
                  sx={{
                    width: "3.5rem",
                    height: "3.5rem",
                    objectFit: "cover",
                    borderRadius: 1,
                    flexShrink: 0,
                  }}
                />
              )}
              {/* Phone: details with the buttons underneath, all in one column so
                  they line up. Wider screens: buttons on the right. */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "stretch", sm: "center" },
                  justifyContent: "space-between",
                  gap: { xs: 1, sm: 2 },
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 500 }}>{event.title}</Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
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
                </Box>
                {/* Negative margin on phones: the text buttons' own padding would
                    otherwise push "Editar" right of the title. */}
                <Box sx={{ display: "flex", gap: 1, flexShrink: 0, ml: { xs: -1, sm: 0 } }}>
                  <Button href={`/manage/events/${event.id}/edit`}>Editar</Button>
                  <Button href={`/manage/events/${event.id}/delete`} color="error">
                    Eliminar
                  </Button>
                </Box>
              </Box>
            </Card>
          ))}
        </Stack>
      )}
    </PageContainer>
  );
}
