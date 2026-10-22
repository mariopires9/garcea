import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import { executeGraphQL } from "@/lib/graphql-server";
import { HISTORIAL_SECTION_QUERY } from "@/lib/queries/historial";
import { PageContainer } from "@/components/PageContainer";
import { BackButton } from "@/components/BackButton";
import { PageTitle } from "@/components/PageTitle";
import { FormCard } from "@/components/FormCard";
import { SubmitButton } from "@/components/SubmitButton";
import { updateHistorySectionAction } from "./actions";

type HistorialSectionData = { historialSection: { description: string } | null };

export default async function ManageHistoryPage() {
  const data = await executeGraphQL<HistorialSectionData>(HISTORIAL_SECTION_QUERY);

  return (
    <PageContainer maxWidth="md">
      <BackButton href="/manage" />
      <PageTitle icon={<AutoStoriesIcon />} color="secondary">
        Gerir Historial
      </PageTitle>

      <FormCard>
        <Stack component="form" action={updateHistorySectionAction} spacing={2}>
          <TextField
            label="Descrição"
            name="description"
            required
            multiline
            rows={10}
            defaultValue={data.historialSection?.description ?? ""}
          />
          <SubmitButton variant="contained" sx={{ alignSelf: "flex-start" }}>
            Guardar
          </SubmitButton>
        </Stack>
      </FormCard>
    </PageContainer>
  );
}
