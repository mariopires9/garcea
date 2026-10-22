"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";

type Selection = {
  allIds: string[];
  selected: Set<string>;
  toggle: (id: string) => void;
  setAll: (selectAll: boolean) => void;
};

const SelectionContext = createContext<Selection | null>(null);

function useSelection() {
  const selection = useContext(SelectionContext);
  if (!selection) throw new Error("Use inside <GallerySelectionProvider>");
  return selection;
}

/** Tracks which gallery items are selected for bulk actions on /manage/gallery. */
export function GallerySelectionProvider({
  allIds,
  children,
}: {
  allIds: string[];
  children: ReactNode;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function setAll(selectAll: boolean) {
    setSelected(selectAll ? new Set(allIds) : new Set());
  }

  return (
    <SelectionContext.Provider value={{ allIds, selected, toggle, setAll }}>
      {children}
    </SelectionContext.Provider>
  );
}

/** "Select all" + counter + bulk delete; sticks below the header while scrolling. */
export function GallerySelectionToolbar() {
  const { allIds, selected, setAll } = useSelection();
  // Only count ids still on the page, never stale ones.
  const ids = allIds.filter((id) => selected.has(id));
  const count = ids.length;
  const allSelected = count > 0 && count === allIds.length;

  return (
    <Paper
      variant="outlined"
      sx={{
        position: "sticky",
        top: { xs: 56, sm: 64 },
        zIndex: 2,
        px: 1,
        py: 0.5,
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 1,
      }}
    >
      <Box component="label" sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
        <Checkbox
          checked={allSelected}
          indeterminate={count > 0 && !allSelected}
          onChange={(event) => setAll(event.target.checked)}
        />
        <Typography variant="body2">Selecionar todos</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
        {count === 0
          ? "Nenhum item selecionado"
          : count === 1
            ? "1 item selecionado"
            : `${count} itens selecionados`}
      </Typography>
      <Button
        color="error"
        variant="contained"
        size="small"
        startIcon={<DeleteIcon />}
        disabled={count === 0}
        href={`/manage/gallery/delete-selected?ids=${ids.join(",")}`}
      >
        Eliminar selecionados
      </Button>
    </Paper>
  );
}

/** Wraps one gallery card with a selection checkbox in its top-left corner. */
export function SelectableGalleryItem({ id, children }: { id: string; children: ReactNode }) {
  const { selected, toggle } = useSelection();
  const isSelected = selected.has(id);

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 1,
        outline: isSelected ? 3 : 0,
        outlineColor: "primary.main",
        outlineOffset: 2,
      }}
    >
      {children}
      <Checkbox
        checked={isSelected}
        onChange={() => toggle(id)}
        slotProps={{ input: { "aria-label": "Selecionar item" } }}
        sx={{
          position: "absolute",
          top: 4,
          left: 4,
          bgcolor: "background.paper",
          borderRadius: 1,
          p: 0.5,
          "&:hover": { bgcolor: "background.paper" },
        }}
      />
    </Box>
  );
}
