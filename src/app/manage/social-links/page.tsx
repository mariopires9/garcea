import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import ShareIcon from "@mui/icons-material/Share";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { executeGraphQL } from "@/lib/graphql-server";
import { SOCIAL_LINKS_QUERY } from "@/lib/queries/socialLinks";
import { PageContainer } from "@/components/PageContainer";
import { BackButton } from "@/components/BackButton";
import { PageTitle } from "@/components/PageTitle";
import { SocialLinkForm } from "@/components/SocialLinkForm";
import { SubmitIconButton } from "@/components/SubmitIconButton";
import { FlashMessage } from "@/components/FlashMessage";
import { SocialIcon, SOCIAL_PLATFORM_LABELS } from "@/components/SocialIcon";
import { createSocialLinkAction, moveSocialLinkAction } from "./actions";

type SocialLinksData = {
  socialLinks: { id: string; platform: string; url: string }[];
};

export default async function ManageSocialLinksPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const data = await executeGraphQL<SocialLinksData>(SOCIAL_LINKS_QUERY);
  const links = data.socialLinks;

  return (
    <PageContainer maxWidth="sm">
      <BackButton href="/manage" />
      <PageTitle icon={<ShareIcon />}>Gerir Redes Sociais</PageTitle>
      <Typography color="text.secondary">
        Estes links são mostrados no rodapé de todas as páginas, pela ordem
        apresentada abaixo.
      </Typography>

      <SocialLinkForm action={createSocialLinkAction} error={error} />
      <FlashMessage message={success} />

      {links.length === 0 ? (
        <Typography>Ainda não há links de redes sociais.</Typography>
      ) : (
        <Stack spacing={2}>
          {links.map((link, index) => {
            const moveUp = moveSocialLinkAction.bind(null, link.id, "UP");
            const moveDown = moveSocialLinkAction.bind(null, link.id, "DOWN");
            return (
              <Card
                key={link.id}
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
                  <Stack>
                    <form action={moveUp}>
                      <SubmitIconButton size="small" disabled={index === 0}>
                        <ArrowUpwardIcon fontSize="small" />
                      </SubmitIconButton>
                    </form>
                    <form action={moveDown}>
                      <SubmitIconButton
                        size="small"
                        disabled={index === links.length - 1}
                      >
                        <ArrowDownwardIcon fontSize="small" />
                      </SubmitIconButton>
                    </form>
                  </Stack>
                  <SocialIcon platform={link.platform} color="primary" />
                  <Stack>
                    <Typography variant="caption" color="text.secondary">
                      {SOCIAL_PLATFORM_LABELS[
                        link.platform as keyof typeof SOCIAL_PLATFORM_LABELS
                      ] ?? link.platform}
                    </Typography>
                    <Typography sx={{ fontWeight: 500, wordBreak: "break-all" }}>
                      {link.url}
                    </Typography>
                  </Stack>
                </Stack>
                <Button href={`/manage/social-links/${link.id}/delete`} color="error">
                  Eliminar
                </Button>
              </Card>
            );
          })}
        </Stack>
      )}
    </PageContainer>
  );
}
