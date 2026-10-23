import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ViewAgendaIcon from "@mui/icons-material/ViewAgenda";
import { executeGraphQL } from "@/lib/graphql-server";
import { HOME_SECTIONS_QUERY } from "@/lib/queries/homeSections";
import { PageContainer } from "@/components/PageContainer";
import { ManageListCard } from "@/components/ManageListCard";
import { BackButton } from "@/components/BackButton";
import { PageTitle } from "@/components/PageTitle";
import { HomeSectionForm } from "@/components/HomeSectionForm";
import { SubmitIconButton } from "@/components/SubmitIconButton";
import { FlashMessage } from "@/components/FlashMessage";
import { createHomeSectionAction, moveHomeSectionAction } from "./actions";

type HomeSectionsData = {
  homeSections: {
    id: string;
    title: string;
    description: string;
    featuredPhotos: { id: string }[];
  }[];
};

export default async function ManageHomeSectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success } = await searchParams;
  const data = await executeGraphQL<HomeSectionsData>(HOME_SECTIONS_QUERY);
  const sections = data.homeSections;

  return (
    <PageContainer maxWidth="md">
      <BackButton href="/manage" />
      <PageTitle icon={<ViewAgendaIcon />} color="secondary">
        Gerir Secções da Página Inicial
      </PageTitle>
      <Typography color="text.secondary">
        Estas secções são mostradas na página inicial, pela ordem apresentada
        abaixo.
      </Typography>

      <HomeSectionForm action={createHomeSectionAction} submitLabel="Adicionar Secção" />
      <FlashMessage message={success} />

      {sections.length === 0 ? (
        <Typography>Ainda não há secções.</Typography>
      ) : (
        <Stack spacing={2}>
          {sections.map((section, index) => {
            const moveUp = moveHomeSectionAction.bind(null, section.id, "UP");
            const moveDown = moveHomeSectionAction.bind(null, section.id, "DOWN");
            return (
              <ManageListCard
                key={section.id}
                leading={
                  <Stack>
                    <form action={moveUp}>
                      <SubmitIconButton size="small" disabled={index === 0} aria-label="Subir">
                        <ArrowUpwardIcon fontSize="small" />
                      </SubmitIconButton>
                    </form>
                    <form action={moveDown}>
                      <SubmitIconButton
                        size="small"
                        disabled={index === sections.length - 1}
                        aria-label="Descer"
                      >
                        <ArrowDownwardIcon fontSize="small" />
                      </SubmitIconButton>
                    </form>
                  </Stack>
                }
                actions={
                  <>
                    <Button href={`/manage/home-sections/${section.id}`}>Editar</Button>
                    <Button href={`/manage/home-sections/${section.id}/delete`} color="error">
                      Eliminar
                    </Button>
                  </>
                }
              >
                <Typography sx={{ fontWeight: 500 }}>{section.title}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {section.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {section.featuredPhotos.length} foto(s) em destaque
                </Typography>
              </ManageListCard>
            );
          })}
        </Stack>
      )}
    </PageContainer>
  );
}
