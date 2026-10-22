import Typography from "@mui/material/Typography";
import { PageContainer } from "@/components/PageContainer";
import { BackButton } from "@/components/BackButton";
import { EventForm } from "@/components/EventForm";
import { createEventAction } from "../actions";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <PageContainer maxWidth="sm">
      <BackButton href="/manage/events" />
      <Typography variant="h4" component="h1">
        Novo Evento
      </Typography>
      <EventForm action={createEventAction} submitLabel="Criar" error={error} />
    </PageContainer>
  );
}
