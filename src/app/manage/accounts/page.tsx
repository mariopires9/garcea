import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { executeGraphQL } from "@/lib/graphql-server";
import { ACCOUNTS_QUERY, type Account } from "@/lib/queries/users";
import { PageContainer } from "@/components/PageContainer";
import { BackButton } from "@/components/BackButton";
import { PageTitle } from "@/components/PageTitle";
import { FlashMessage } from "@/components/FlashMessage";

type AccountsData = { me: Account; users: Account[] };

export default async function ManageAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success } = await searchParams;
  const { me, users } = await executeGraphQL<AccountsData>(ACCOUNTS_QUERY);

  return (
    <PageContainer maxWidth="sm">
      <BackButton href="/manage" />
      <FlashMessage message={success} />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <PageTitle icon={<ManageAccountsIcon />}>Gerir Contas</PageTitle>
        {me.isOwner && (
          <Button href="/manage/accounts/new" variant="contained">
            Adicionar Conta
          </Button>
        )}
      </Box>
      <Typography color="text.secondary">
        {me.isOwner
          ? "Como proprietário, pode adicionar e eliminar contas e alterar os dados e a palavra-passe de qualquer conta."
          : "Pode alterar os dados e a palavra-passe da sua conta. Só o proprietário pode adicionar, eliminar ou alterar outras contas."}
      </Typography>

      <Stack spacing={2}>
        {users.map((user) => {
          const isMe = user.id === me.id;
          const canEdit = isMe || me.isOwner;
          const canDelete = me.isOwner && !user.isOwner;
          return (
            <Card
              key={user.id}
              variant="outlined"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
                p: 2,
              }}
            >
              <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                  <Typography sx={{ fontWeight: 500 }}>{user.name}</Typography>
                  {user.isOwner && <Chip size="small" color="primary" label="Proprietário" />}
                  {isMe && <Chip size="small" variant="outlined" label="Você" />}
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-all" }}>
                  {user.email}
                </Typography>
              </Stack>
              {(canEdit || canDelete) && (
                <Stack direction="row" spacing={1}>
                  {canEdit && (
                    <Button href={`/manage/accounts/${user.id}/edit`} size="small">
                      Editar
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      href={`/manage/accounts/${user.id}/delete`}
                      size="small"
                      color="error"
                    >
                      Eliminar
                    </Button>
                  )}
                </Stack>
              )}
            </Card>
          );
        })}
      </Stack>
    </PageContainer>
  );
}
