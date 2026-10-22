import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import { PageContainer } from "@/components/PageContainer";
import { PageTitle } from "@/components/PageTitle";

export default function Loading() {
  return (
    <PageContainer maxWidth="md">
      <PageTitle icon={<AutoStoriesIcon />} color="secondary">
        Historial
      </PageTitle>
      <Paper
        variant="outlined"
        component="section"
        sx={{ p: { xs: 3, sm: 5 }, borderTop: 3, borderTopColor: "secondary.main" }}
      >
        <Stack spacing={1}>
          <Skeleton variant="text" />
          <Skeleton variant="text" />
          <Skeleton variant="text" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
        </Stack>
      </Paper>
    </PageContainer>
  );
}
