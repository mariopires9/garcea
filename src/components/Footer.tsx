import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { executeGraphQL } from "@/lib/graphql-server";
import { SOCIAL_LINKS_QUERY } from "@/lib/queries/socialLinks";
import { SocialIcon, SOCIAL_PLATFORM_LABELS } from "@/components/SocialIcon";
import { SITE_NAME } from "@/lib/config";
import { InstallAppButton } from "@/components/InstallAppButton";

type SocialLinksData = {
  socialLinks: { id: string; platform: string; url: string }[];
};

export async function Footer() {
  const data = await executeGraphQL<SocialLinksData>(SOCIAL_LINKS_QUERY);
  const year = new Date().getFullYear();

  return (
    <Box component="footer" sx={{ borderTop: 1, borderColor: "divider", mt: "auto" }}>
      <Container
        maxWidth="lg"
        sx={{
          py: 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {year} {SITE_NAME}. Todos os direitos reservados.
        </Typography>
        <InstallAppButton />
        {data.socialLinks.length > 0 && (
          <Stack direction="row" spacing={1}>
            {data.socialLinks.map((link) => (
              <IconButton
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                aria-label={
                  SOCIAL_PLATFORM_LABELS[
                    link.platform as keyof typeof SOCIAL_PLATFORM_LABELS
                  ] ?? link.platform
                }
                color="primary"
                size="small"
              >
                <SocialIcon platform={link.platform} fontSize="small" />
              </IconButton>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
