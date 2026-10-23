import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import type { ReactNode } from "react";

/**
 * One row of a /manage list: optional `leading` (poster, reorder arrows,
 * icon), the item's details, and its action buttons.
 *
 * Phones: the buttons go under the details, in the same column, so they
 * line up with the text. Wider screens: one row with the buttons on the
 * right.
 */
export function ManageListCard({
  leading,
  children,
  actions,
}: {
  leading?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 2,
        p: 2,
        transition: "box-shadow 0.2s ease",
        "&:hover": { boxShadow: 3 },
      }}
    >
      {leading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
          {leading}
        </Box>
      )}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: { xs: 1, sm: 2 },
        }}
      >
        <Box sx={{ minWidth: 0 }}>{children}</Box>
        {/* Negative margin on phones: text buttons' own padding would otherwise
            push the first button right of the text above it. */}
        {actions && (
          <Box sx={{ display: "flex", gap: 1, flexShrink: 0, ml: { xs: -1, sm: 0 } }}>
            {actions}
          </Box>
        )}
      </Box>
    </Card>
  );
}
