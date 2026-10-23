import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Stack from "@mui/material/Stack";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import EventIcon from "@mui/icons-material/Event";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import ViewAgendaIcon from "@mui/icons-material/ViewAgenda";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import ShareIcon from "@mui/icons-material/Share";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import InsightsIcon from "@mui/icons-material/Insights";
import type { ReactNode } from "react";
import { PageContainer } from "@/components/PageContainer";
import { PageTitle } from "@/components/PageTitle";
import { SubmitButton } from "@/components/SubmitButton";
import { auth, signOut } from "@/auth";
import { SITE_NAME } from "@/lib/config";

const links: {
  href: string;
  label: string;
  icon: ReactNode;
  color: "primary" | "secondary";
}[] = [
  { href: "/manage/events", label: "Gerir Eventos", icon: <EventIcon />, color: "primary" },
  {
    href: "/manage/gallery",
    label: "Gerir Galeria",
    icon: <PhotoLibraryIcon />,
    color: "primary",
  },
  {
    href: "/manage/home-sections",
    label: "Gerir Secções da Página Inicial",
    icon: <ViewAgendaIcon />,
    color: "secondary",
  },
  {
    href: "/manage/history",
    label: "Gerir Historial",
    icon: <AutoStoriesIcon />,
    color: "secondary",
  },
  {
    href: "/manage/official-contacts",
    label: "Gerir Contactos Oficiais",
    icon: <ContactPhoneIcon />,
    color: "primary",
  },
  {
    href: "/manage/social-links",
    label: "Gerir Redes Sociais",
    icon: <ShareIcon />,
    color: "secondary",
  },
  {
    href: "/manage/accounts",
    label: "Gerir Contas",
    icon: <ManageAccountsIcon />,
    color: "primary",
  },
  {
    href: "/manage/analytics",
    label: "Estatísticas",
    icon: <InsightsIcon />,
    color: "secondary",
  },
];

export default async function ManagePage() {
  const session = await auth();

  return (
    <PageContainer maxWidth="sm">
      <PageTitle icon={<AdminPanelSettingsIcon />}>Gerir {SITE_NAME}</PageTitle>
      <Typography color="text.secondary">
        Sessão iniciada como {session?.user?.email}.
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: 2,
        }}
      >
        {links.map((link) => (
          <Card
            key={link.href}
            variant="outlined"
            sx={{
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
            }}
          >
            <CardActionArea href={link.href} sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "2.25rem",
                    height: "2.25rem",
                    borderRadius: "50%",
                    bgcolor: `${link.color}.main`,
                    color: `${link.color}.contrastText`,
                    flexShrink: 0,
                  }}
                >
                  {link.icon}
                </Box>
                <Typography sx={{ fontWeight: 600 }}>{link.label}</Typography>
              </Stack>
            </CardActionArea>
          </Card>
        ))}
      </Box>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <SubmitButton variant="outlined">Sair</SubmitButton>
      </form>
    </PageContainer>
  );
}
