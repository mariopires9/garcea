import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import { executeGraphQL } from "@/lib/graphql-server";
import { OFFICIAL_CONTACTS_QUERY } from "@/lib/queries/officialContacts";
import { PageContainer } from "@/components/PageContainer";
import { BackButton } from "@/components/BackButton";
import { PageTitle } from "@/components/PageTitle";
import { OfficialContactForm } from "@/components/OfficialContactForm";
import { FlashMessage } from "@/components/FlashMessage";
import {
  OfficialContactIcon,
  OFFICIAL_CONTACT_TYPE_LABELS,
} from "@/components/OfficialContactIcon";
import { createOfficialContactAction } from "./actions";

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
        Contactos.
      </Typography>

      <OfficialContactForm action={createOfficialContactAction} error={error} />
      <FlashMessage message={success} />

      {data.officialContacts.length === 0 ? (
        <Typography>Ainda não há contactos oficiais.</Typography>
      ) : (
        <Stack spacing={2}>
          {data.officialContacts.map((contact) => (
            <Card
              key={contact.id}
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
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <OfficialContactIcon type={contact.type} color="primary" />
                <Stack>
                  <Typography variant="caption" color="text.secondary">
                    {OFFICIAL_CONTACT_TYPE_LABELS[contact.type]}
                    {contact.label ? ` · ${contact.label}` : ""}
                  </Typography>
                  <Typography sx={{ fontWeight: 500, wordBreak: "break-all" }}>
                    {contact.value}
                  </Typography>
                </Stack>
              </Stack>
              <Button
                href={`/manage/official-contacts/${contact.id}/delete`}
                color="error"
              >
                Eliminar
              </Button>
            </Card>
          ))}
        </Stack>
      )}
    </PageContainer>
  );
}
