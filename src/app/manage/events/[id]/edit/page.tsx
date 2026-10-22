import { notFound } from "next/navigation";
import Typography from "@mui/material/Typography";
import { executeGraphQL } from "@/lib/graphql-server";
import { EVENT_QUERY } from "@/lib/queries/events";
import { EventForm } from "@/components/EventForm";
import { PageContainer } from "@/components/PageContainer";
import { BackButton } from "@/components/BackButton";
import { updateEventAction } from "../../actions";

type EventData = {
  event: {
    title: string;
    description: string;
    date: string;
    location: string;
    posterUrl: string | null;
  } | null;
};

export default async function EditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const data = await executeGraphQL<EventData>(EVENT_QUERY, { id });

  if (!data.event) notFound();

  const updateWithId = updateEventAction.bind(null, id);

  return (
    <PageContainer maxWidth="sm">
      <BackButton href="/manage/events" />
      <Typography variant="h4" component="h1">
        Editar Evento
      </Typography>
      <EventForm
        action={updateWithId}
        defaultValues={data.event}
        submitLabel="Guardar"
        error={error}
      />
    </PageContainer>
  );
}
