import { notFound } from "next/navigation";
import Typography from "@mui/material/Typography";
import { executeGraphQL } from "@/lib/graphql-server";
import { OFFICIAL_CONTACT_QUERY } from "@/lib/queries/officialContacts";
import { OfficialContactForm } from "@/components/OfficialContactForm";
import { OFFICIAL_CONTACT_TYPE_LABELS } from "@/components/OfficialContactIcon";
import { PageContainer } from "@/components/PageContainer";
import { BackButton } from "@/components/BackButton";
import { updateOfficialContactAction } from "../../actions";

type OfficialContactData = {
  officialContact: {
    type: keyof typeof OFFICIAL_CONTACT_TYPE_LABELS;
    label: string | null;
    value: string;
  } | null;
};

export default async function EditOfficialContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const data = await executeGraphQL<OfficialContactData>(OFFICIAL_CONTACT_QUERY, { id });

  if (!data.officialContact) notFound();

  const updateWithId = updateOfficialContactAction.bind(null, id);
  const { type, label, value } = data.officialContact;

  return (
    <PageContainer maxWidth="sm">
      <BackButton href="/manage/official-contacts" />
      <Typography variant="h4" component="h1">
        Editar Contacto
      </Typography>
      <OfficialContactForm
        action={updateWithId}
        defaultValues={{ type, label, value }}
        submitLabel="Guardar"
        error={error}
      />
    </PageContainer>
  );
}
