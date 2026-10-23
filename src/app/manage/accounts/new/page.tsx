import { redirect } from "next/navigation";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { executeGraphQL } from "@/lib/graphql-server";
import { ACCOUNTS_QUERY, type Account } from "@/lib/queries/users";
import { PageContainer } from "@/components/PageContainer";
import { BackButton } from "@/components/BackButton";
import { FormCard } from "@/components/FormCard";
import { SubmitButton } from "@/components/SubmitButton";
import { MIN_PASSWORD_LENGTH } from "@/lib/config";
import { createUserAction } from "../actions";

export default async function NewAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { me } = await executeGraphQL<{ me: Account }>(ACCOUNTS_QUERY);
  // Only the owner can add accounts (also enforced by the createUser mutation).
  if (!me.isOwner) redirect("/manage/accounts");

  return (
    <PageContainer maxWidth="sm">
      <BackButton href="/manage/accounts" />
      <Typography variant="h4" component="h1">
        Nova Conta
      </Typography>
      <FormCard error={error}>
        <Stack component="form" action={createUserAction} spacing={2}>
          <TextField label="Nome" name="name" required />
          <TextField label="Email" name="email" type="email" required autoComplete="off" />
          <TextField
            label="Palavra-passe"
            name="newPassword"
            type="password"
            required
            autoComplete="new-password"
            helperText={`Pelo menos ${MIN_PASSWORD_LENGTH} caracteres`}
          />
          <TextField
            label="Confirmar palavra-passe"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
          />
          <SubmitButton variant="contained" sx={{ alignSelf: "flex-start" }}>
            Criar Conta
          </SubmitButton>
        </Stack>
      </FormCard>
    </PageContainer>
  );
}
