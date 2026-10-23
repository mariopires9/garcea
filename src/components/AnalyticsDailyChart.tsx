"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import type { DailyRow } from "@/lib/vercel-analytics";
import { analyticsBarSx } from "@/lib/analytics-style";

const CHART_HEIGHT = 160;

const numberFormat = new Intl.NumberFormat("pt-PT");

function formatDay(day: string, options: Intl.DateTimeFormatOptions) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("pt-PT", { timeZone: "UTC", ...options });
}

/** Page views per day: one bar per day, hover/focus a bar for the numbers. */
export function AnalyticsDailyChart({ rows }: { rows: DailyRow[] }) {
  const [showTable, setShowTable] = useState(false);
  const max = Math.max(1, ...rows.map((row) => row.pageviews));
  const labelEvery = rows.length > 10 ? 7 : 1;

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        {/* Y axis: just the top value and zero, so the grid stays quiet. */}
        <Box
          aria-hidden
          sx={{
            height: CHART_HEIGHT,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            color: "text.secondary",
            fontSize: "0.75rem",
            textAlign: "right",
            minWidth: "2ch",
          }}
        >
          <span>{numberFormat.format(max)}</span>
          <span>0</span>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            role="img"
            aria-label={`Visualizações por dia, máximo ${numberFormat.format(max)}`}
            sx={{
              height: CHART_HEIGHT,
              display: "flex",
              alignItems: "flex-end",
              gap: "2px",
              borderBottom: 1,
              borderColor: "divider",
              backgroundImage: (theme) =>
                `linear-gradient(to bottom, ${(theme.vars ?? theme).palette.divider} 1px, transparent 1px)`,
              backgroundSize: "100% 50%",
            }}
          >
            {rows.map((row) => (
              <Tooltip
                key={row.day}
                arrow
                title={
                  <>
                    <strong>{formatDay(row.day, { weekday: "short", day: "numeric", month: "short" })}</strong>
                    <br />
                    {numberFormat.format(row.pageviews)} visualizações
                    <br />
                    {numberFormat.format(row.visitors)} visitantes
                  </>
                }
              >
                {/* Full-height column = bigger hover target than the bar itself. */}
                <Box
                  tabIndex={0}
                  sx={{
                    flex: 1,
                    height: "100%",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    cursor: "default",
                    borderRadius: "4px 4px 0 0",
                    "&:hover, &:focus-visible": { bgcolor: "action.hover", outline: "none" },
                  }}
                >
                  <Box
                    sx={{
                      ...analyticsBarSx,
                      // Thin bars: fill narrow columns, but never wider than 40px.
                      width: "100%",
                      maxWidth: 40,
                      height: `${(row.pageviews / max) * 100}%`,
                      minHeight: row.pageviews > 0 ? 3 : 0,
                      borderRadius: "4px 4px 0 0",
                    }}
                  />
                </Box>
              </Tooltip>
            ))}
          </Box>

          <Box
            aria-hidden
            sx={{ display: "flex", gap: "2px", mt: 0.5, color: "text.secondary", fontSize: "0.75rem" }}
          >
            {rows.map((row, index) => (
              <Box key={row.day} sx={{ flex: 1, textAlign: "center", whiteSpace: "nowrap", overflow: "visible" }}>
                {/* Every Nth day, plus the last one unless it would touch the previous label. */}
                {index % labelEvery === 0 ||
                (index === rows.length - 1 && index % labelEvery >= Math.min(3, labelEvery))
                  ? formatDay(row.day, { day: "2-digit", month: "2-digit" })
                  : ""}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Button size="small" onClick={() => setShowTable((value) => !value)} sx={{ mt: 1 }}>
        {showTable ? "Esconder tabela" : "Ver em tabela"}
      </Button>
      {showTable && (
        <Table size="small" sx={{ mt: 1 }}>
          <TableHead>
            <TableRow>
              <TableCell>Dia</TableCell>
              <TableCell align="right">Visualizações</TableCell>
              <TableCell align="right">Visitantes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.day}>
                <TableCell>
                  <Typography variant="body2">
                    {formatDay(row.day, { weekday: "short", day: "numeric", month: "short" })}
                  </Typography>
                </TableCell>
                <TableCell align="right">{numberFormat.format(row.pageviews)}</TableCell>
                <TableCell align="right">{numberFormat.format(row.visitors)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}
