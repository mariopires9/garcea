import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import FacebookIcon from "@mui/icons-material/Facebook";
import { PageContainer } from "@/components/PageContainer";
import { PageTitle } from "@/components/PageTitle";
import { executeGraphQL } from "@/lib/graphql-server";
import { OFFICIAL_CONTACTS_QUERY } from "@/lib/queries/officialContacts";
import { ScrollReveal } from "@/components/ScrollReveal";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

type OfficialContactsData = {
  officialContacts: {
    id: string;
    type: "EMAIL" | "PHONE" | "FACEBOOK";
    label: string | null;
    value: string;
  }[];
};

export const metadata: Metadata = pageMetadata({
  title: "Contactos",
  description:
    "Gostaria de ver o Rancho Folclórico das Lavradeiras de Gondar no seu evento? Contacte a Associação GARCEA.",
  path: "/contacts",
});

export default async function ContactsPage() {
  const contactsData =
    await executeGraphQL<OfficialContactsData>(OFFICIAL_CONTACTS_QUERY);
  const emails = contactsData.officialContacts.filter((c) => c.type === "EMAIL");
  const phones = contactsData.officialContacts.filter((c) => c.type === "PHONE");
  const facebooks = contactsData.officialContacts.filter((c) => c.type === "FACEBOOK");

  return (
    <PageContainer maxWidth="sm">
      <PageTitle icon={<EmailIcon />} color="secondary">
        Contactos
      </PageTitle>
      <Typography color="text.secondary">
        Gostaria de ver o Rancho Folclórico das Lavradeiras de Gondar no seu evento? Pode contactar-nos
      </Typography>

      {emails.length > 0 || phones.length > 0 || facebooks.length > 0 ? (
        <ScrollReveal>
          <Paper
            variant="outlined"
            sx={{ p: { xs: 3, sm: 4 }, borderTop: 3, borderTopColor: "secondary.main" }}
          >
            <Stack spacing={1.5}>
              {facebooks.map((facebook) => (
                <Stack
                  key={facebook.id}
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: "center" }}
                >
                  <FacebookIcon color="primary" fontSize="small" />
                  <Typography
                    component="a"
                    href={facebook.value}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ color: "inherit" }}
                  >
                    {facebook.label || facebook.value}
                  </Typography>
                </Stack>
              ))}
              {phones.map((phone) => (
                <Stack
                  key={phone.id}
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: "center" }}
                >
                  <PhoneIcon color="primary" fontSize="small" />
                  <Typography component="a" href={`tel:${phone.value}`} sx={{ color: "inherit" }}>
                    {phone.value}
                  </Typography>
                </Stack>
              ))}
              {emails.map((email) => (
                <Stack
                  key={email.id}
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: "center" }}
                >
                  <EmailIcon color="primary" fontSize="small" />
                  <Typography component="a" href={`mailto:${email.value}`} sx={{ color: "inherit" }}>
                    {email.value}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </ScrollReveal>
      ) : (
        <Typography color="text.secondary">
          Ainda não há contactos disponíveis.
        </Typography>
      )}
    </PageContainer>
  );
}
