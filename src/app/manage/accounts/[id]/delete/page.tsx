import { notFound } from "next/navigation";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import { executeGraphQL } from "@/lib/graphql-server";
import { ACCOUNT_QUERY, type Account } from "@/lib/queries/users";
import { PageContainer } from "@/components/PageContainer";
import { SubmitButton } from "@/components/SubmitButton";
import { deleteUserAction } from "../../actions";

type AccountData = { me: Account; user: Account | null };

export default async function DeleteAccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const { me, user } = await executeGraphQL<AccountData>(ACCOUNT_QUERY, { id });

  // Only the owner removes accounts, and never the owner account itself.
  if (!user || !me.isOwner || user.isOwner) notFound();

  const deleteWithId = deleteUserAction.bind(null, id);

  return (
    <PageContainer maxWidth="sm">
      <Typography variant="h4" component="h1">
        Eliminar Conta
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Typography>
        Tem a certeza que deseja eliminar a conta de &ldquo;{user.name}&rdquo; ({user.email})?
        Esta pessoa deixa de poder entrar. Os eventos e itens da galeria criados por esta
        conta passam para a sua conta. Esta ação não pode ser desfeita.
      </Typography>
      <Stack component="form" action={deleteWithId} direction="row" spacing={2}>
        <SubmitButton variant="contained" color="error">
          Eliminar
        </SubmitButton>
        <Button href="/manage/accounts" variant="outlined">
          Cancelar
        </Button>
      </Stack>
    </PageContainer>
  );
}
