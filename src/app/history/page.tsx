import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import { PageContainer } from "@/components/PageContainer";
import { PageTitle } from "@/components/PageTitle";
import { executeGraphQL } from "@/lib/graphql-server";
import { HISTORIAL_SECTION_QUERY } from "@/lib/queries/historial";
import { ScrollReveal } from "@/components/ScrollReveal";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

type HistorialSectionData = { historialSection: { description: string } | null };

export const metadata: Metadata = pageMetadata({
  title: "Historial",
  description:
    "A história da Associação GARCEA e do Rancho Folclórico das Lavradeiras de Gondar.",
  path: "/history",
});

export default async function HistoryPage() {
  const data = await executeGraphQL<HistorialSectionData>(HISTORIAL_SECTION_QUERY);

  return (
    <PageContainer maxWidth="md">
      <PageTitle icon={<AutoStoriesIcon />} color="secondary">
        Historial
      </PageTitle>
      <ScrollReveal>
        <Paper
          variant="outlined"
          component="section"
          sx={{ p: { xs: 3, sm: 5 }, borderTop: 3, borderTopColor: "secondary.main" }}
        >
          {data.historialSection ? (
            <Typography sx={{ whiteSpace: "pre-wrap" }}>
              {data.historialSection.description}
            </Typography>
          ) : (
            <Typography color="text.secondary">Sem conteúdo por enquanto.</Typography>
          )}
        </Paper>
      </ScrollReveal>
    </PageContainer>
  );
}
