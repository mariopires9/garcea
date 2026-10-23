import Container from "@mui/material/Container";
import type { ReactNode } from "react";

export function PageContainer({
  children,
  maxWidth = "sm",
}: {
  children: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg";
}) {
  return (
    <Container
      component="main"
      maxWidth={maxWidth}
      // Less space under the header on phones, where the screen is short.
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        pt: { xs: 3, sm: 5 },
        pb: { xs: 6, sm: 8 },
      }}
    >
      {children}
    </Container>
  );
}
