import { notFound } from "next/navigation";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import { executeGraphQL } from "@/lib/graphql-server";
import { ACCOUNT_QUERY, type Account } from "@/lib/queries/users";
import { PageContainer } from "@/components/PageContainer";
import { BackButton } from "@/components/BackButton";
import { FormCard } from "@/components/FormCard";
import { SubmitButton } from "@/components/SubmitButton";
import { updateUserAction, changePasswordAction } from "../../actions";

type AccountData = { me: Account; user: Account | null };

export default async function EditAccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const { me, user } = await executeGraphQL<AccountData>(ACCOUNT_QUERY, { id });

  const isMe = user?.id === me.id;
  // Other accounts are only editable by the owner (also enforced server-side).
  if (!user || (!isMe && !me.isOwner)) notFound();

  const updateWithId = updateUserAction.bind(null, id);
  const changePasswordWithId = changePasswordAction.bind(null, id);

  return (
    <PageContainer maxWidth="sm">
      <BackButton href="/manage/accounts" />
      <Typography variant="h4" component="h1">
        {isMe ? "A Minha Conta" : `Editar Conta: ${user.name}`}
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}

      <FormCard>
        <Typography variant="h6" component="h2">
          Dados da conta
        </Typography>
        <Stack component="form" action={updateWithId} spacing={2}>
          <TextField label="Nome" name="name" required defaultValue={user.name} />
          <TextField
            label="Email"
            name="email"
            type="email"
            required
            defaultValue={user.email}
            helperText={isMe ? "É o email que usa para entrar." : undefined}
          />
          <SubmitButton variant="contained" sx={{ alignSelf: "flex-start" }}>
            Guardar
          </SubmitButton>
        </Stack>
      </FormCard>

      <FormCard>
        <Typography variant="h6" component="h2">
          Alterar palavra-passe
        </Typography>
        <Stack component="form" action={changePasswordWithId} spacing={2}>
          {isMe && (
            <TextField
              label="Palavra-passe atual"
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
            />
          )}
          <TextField
            label="Nova palavra-passe"
            name="newPassword"
            type="password"
            required
            autoComplete="new-password"
            helperText="Pelo menos 8 caracteres"
          />
          <TextField
            label="Confirmar nova palavra-passe"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
          />
          <SubmitButton variant="contained" sx={{ alignSelf: "flex-start" }}>
            Alterar Palavra-passe
          </SubmitButton>
        </Stack>
      </FormCard>
    </PageContainer>
  );
}
