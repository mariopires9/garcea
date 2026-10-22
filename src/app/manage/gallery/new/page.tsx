import Typography from "@mui/material/Typography";
import { executeGraphQL } from "@/lib/graphql-server";
import { EVENT_OPTIONS_QUERY } from "@/lib/queries/events";
import { GalleryItemForm } from "@/components/GalleryItemForm";
import { PageContainer } from "@/components/PageContainer";
import { BackButton } from "@/components/BackButton";
import { createGalleryItemAction } from "../actions";

type EventsData = { events: { id: string; title: string }[] };

export default async function NewGalleryItemPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const data = await executeGraphQL<EventsData>(EVENT_OPTIONS_QUERY);
  // Rebuild as plain object literals: GraphQL execution results aren't
  // guaranteed to be plain objects (Next.js rejects non-plain-object/
  // null-prototype values passed as props into a Client Component).
  const events = data.events.map((event) => ({ id: event.id, title: event.title }));

  return (
    <PageContainer maxWidth="sm">
      <BackButton href="/manage/gallery" />
      <Typography variant="h4" component="h1">
        Adicionar Item à Galeria
      </Typography>
      <GalleryItemForm action={createGalleryItemAction} events={events} error={error} />
    </PageContainer>
  );
}
