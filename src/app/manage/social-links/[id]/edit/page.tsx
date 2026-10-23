import { notFound } from "next/navigation";
import Typography from "@mui/material/Typography";
import { executeGraphQL } from "@/lib/graphql-server";
import { SOCIAL_LINK_QUERY } from "@/lib/queries/socialLinks";
import { SocialLinkForm } from "@/components/SocialLinkForm";
import { SOCIAL_PLATFORM_LABELS } from "@/components/SocialIcon";
import { PageContainer } from "@/components/PageContainer";
import { BackButton } from "@/components/BackButton";
import { updateSocialLinkAction } from "../../actions";

type SocialLinkData = {
  socialLink: { platform: keyof typeof SOCIAL_PLATFORM_LABELS; url: string } | null;
};

export default async function EditSocialLinkPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const data = await executeGraphQL<SocialLinkData>(SOCIAL_LINK_QUERY, { id });

  if (!data.socialLink) notFound();

  const updateWithId = updateSocialLinkAction.bind(null, id);

  return (
    <PageContainer maxWidth="sm">
      <BackButton href="/manage/social-links" />
      <Typography variant="h4" component="h1">
        Editar Rede Social
      </Typography>
      <SocialLinkForm
        action={updateWithId}
        defaultValues={{ platform: data.socialLink.platform, url: data.socialLink.url }}
        submitLabel="Guardar"
        error={error}
      />
    </PageContainer>
  );
}
