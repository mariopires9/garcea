import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import EventIcon from "@mui/icons-material/Event";
import { executeGraphQL } from "@/lib/graphql-server";
import { EVENT_QUERY } from "@/lib/queries/events";
import { GalleryCarousel } from "@/components/GalleryCarousel";
import { PageContainer } from "@/components/PageContainer";
import { BackButton } from "@/components/BackButton";
import { PageTitle } from "@/components/PageTitle";
import { isPdfUrl } from "@/lib/supabase-storage";
import { EVENT_TYPE_LABELS } from "@/lib/eventTypes";
import { ShareButton } from "@/components/ShareButton";
import { SITE_URL, pageMetadata, toMetaDescription } from "@/lib/site";

type EventData = {
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    posterUrl: string | null;
    type: "FOLCLORE" | "OUTROS";
    createdBy: { name: string };
    galleryItems: {
      id: string;
      type: "PHOTO" | "VIDEO";
      url: string;
      thumbnailUrl: string | null;
    }[];
  } | null;
};

// Shared by generateMetadata and the page so the event is fetched once per request.
const getEvent = cache((id: string) => executeGraphQL<EventData>(EVENT_QUERY, { id }));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { event } = await getEvent(id);
  if (!event) return {};

  const date = new Date(event.date).toLocaleDateString("pt-PT");
  return pageMetadata({
    title: event.title,
    description: toMetaDescription(`${date} · ${event.location}. ${event.description}`),
    path: `/events/${event.id}`,
    // PDF posters can't be used as a link preview image; fall back to the logo.
    image: event.posterUrl && !isPdfUrl(event.posterUrl) ? event.posterUrl : null,
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getEvent(id);

  if (!data.event) notFound();

  const event = data.event;

  return (
    <PageContainer maxWidth="md">
      <BackButton href="/events" />
      <PageTitle icon={<EventIcon />}>{event.title}</PageTitle>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
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
      <ShareButton url={`${SITE_URL}/events/${event.id}`} title={event.title} />
      {event.posterUrl &&
        (isPdfUrl(event.posterUrl) ? (
          <Button
            href={event.posterUrl}
            target="_blank"
            rel="noreferrer"
            variant="outlined"
            sx={{ alignSelf: "flex-start" }}
          >
            Ver cartaz (PDF)
          </Button>
        ) : (
          <Box
            component="img"
            src={event.posterUrl}
            alt={`Cartaz: ${event.title}`}
            sx={{ maxWidth: "25rem", width: "100%", borderRadius: 1 }}
          />
        ))}
      <Typography>{event.description}</Typography>

      {event.galleryItems.length > 0 && (
        <GalleryCarousel
          items={event.galleryItems.map((item) => ({
            id: item.id,
            type: item.type,
            url: item.url,
            thumbnailUrl: item.thumbnailUrl,
          }))}
        />
      )}
    </PageContainer>
  );
}
