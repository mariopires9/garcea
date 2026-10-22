"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

/**
 * "Ver mais" for paged lists: navigates to `href` (the same page with a
 * bigger `limit`) without jumping back to the top, keeping the items already
 * shown on screen while the next batch loads.
 */
export function ShowMoreButton({
  href,
  shown,
  total,
}: {
  href: string;
  shown: number;
  total: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Stack spacing={1} sx={{ alignItems: "center" }}>
      <Typography variant="body2" color="text.secondary">
        A mostrar {shown} de {total}
      </Typography>
      <Button
        variant="outlined"
        disabled={isPending}
        startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
        onClick={() => startTransition(() => router.push(href, { scroll: false }))}
      >
        Ver mais
      </Button>
    </Stack>
  );
}
