import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { executeGraphQL } from "@/lib/graphql-server";
import { OFFICIAL_CONTACTS_QUERY } from "@/lib/queries/officialContacts";
import { PageContainer } from "@/components/PageContainer";
import { ManageListCard } from "@/components/ManageListCard";
import { BackButton } from "@/components/BackButton";
import { PageTitle } from "@/components/PageTitle";
import { OfficialContactForm } from "@/components/OfficialContactForm";
import { SubmitIconButton } from "@/components/SubmitIconButton";
import { FlashMessage } from "@/components/FlashMessage";
import {
  OfficialContactIcon,
  OFFICIAL_CONTACT_TYPE_LABELS,
} from "@/components/OfficialContactIcon";
import { createOfficialContactAction, moveOfficialContactAction } from "./actions";

type OfficialContactsData = {
  officialContacts: {
    id: string;
    type: "EMAIL" | "PHONE" | "FACEBOOK";
    label: string | null;
    value: string;
  }[];
};

export default async function ManageOfficialContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const data = await executeGraphQL<OfficialContactsData>(OFFICIAL_CONTACTS_QUERY);

  return (
    <PageContainer maxWidth="sm">
      <BackButton href="/manage" />
      <PageTitle icon={<ContactPhoneIcon />}>Gerir Contactos Oficiais</PageTitle>
      <Typography color="text.secondary">
        Estes emails e números de telefone são mostrados na página pública de
        Contactos, pela ordem apresentada abaixo.
      </Typography>

      <OfficialContactForm action={createOfficialContactAction} error={error} />
      <FlashMessage message={success} />

      {data.officialContacts.length === 0 ? (
        <Typography>Ainda não há contactos oficiais.</Typography>
      ) : (
        <Stack spacing={2}>
          {data.officialContacts.map((contact, index) => (
            <ManageListCard
              key={contact.id}
              leading={
                <>
                  <Stack>
                    <form action={moveOfficialContactAction.bind(null, contact.id, "UP")}>
                      <SubmitIconButton size="small" disabled={index === 0} aria-label="Subir">
                        <ArrowUpwardIcon fontSize="small" />
                      </SubmitIconButton>
                    </form>
                    <form action={moveOfficialContactAction.bind(null, contact.id, "DOWN")}>
                      <SubmitIconButton
                        size="small"
                        disabled={index === data.officialContacts.length - 1}
                        aria-label="Descer"
                      >
                        <ArrowDownwardIcon fontSize="small" />
                      </SubmitIconButton>
                    </form>
                  </Stack>
                  <OfficialContactIcon type={contact.type} color="primary" />
                </>
              }
              actions={
                <>
                  <Button href={`/manage/official-contacts/${contact.id}/edit`}>Editar</Button>
                  <Button href={`/manage/official-contacts/${contact.id}/delete`} color="error">
                    Eliminar
                  </Button>
                </>
              }
            >
              <Typography variant="caption" color="text.secondary">
                {OFFICIAL_CONTACT_TYPE_LABELS[contact.type]}
                {contact.label ? ` · ${contact.label}` : ""}
              </Typography>
              <Typography noWrap title={contact.value} sx={{ fontWeight: 500 }}>
                {contact.value}
              </Typography>
            </ManageListCard>
          ))}
        </Stack>
      )}
    </PageContainer>
  );
}
