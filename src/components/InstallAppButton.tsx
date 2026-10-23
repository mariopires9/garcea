"use client";

import { useState, useSyncExternalStore } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import InstallMobileIcon from "@mui/icons-material/InstallMobile";
import IosShareIcon from "@mui/icons-material/IosShare";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import { getInstallMode, promptInstall, subscribeInstallMode } from "@/lib/pwa-install";

const IOS_STEPS = [
  {
    icon: <IosShareIcon color="primary" />,
    text: (
      <>
        Toque no botão <strong>Partilhar</strong> do navegador (em baixo no iPhone, em cima no
        iPad).
      </>
    ),
  },
  {
    icon: <AddBoxOutlinedIcon color="primary" />,
    text: (
      <>
        Deslize e escolha <strong>Adicionar ao ecrã principal</strong>.
      </>
    ),
  },
  {
    icon: (
      <Typography component="span" color="primary" sx={{ fontWeight: 700, width: 24, textAlign: "center" }}>
        ✓
      </Typography>
    ),
    text: (
      <>
        Toque em <strong>Adicionar</strong>. A app GARCEA fica no ecrã principal.
      </>
    ),
  },
];

/**
 * "Instalar app": opens the browser's install dialog on Android/desktop
 * Chrome and Edge, and shows the "Adicionar ao ecrã principal" steps on
 * iPhone/iPad. Hidden where installing isn't possible or already done.
 */
export function InstallAppButton({
  variant = "button",
  onDone,
}: {
  variant?: "button" | "listItem";
  /** Called after the button is used (e.g. to close the mobile menu). */
  onDone?: () => void;
}) {
  const mode = useSyncExternalStore(subscribeInstallMode, getInstallMode, () => "hidden" as const);
  const [showIosSteps, setShowIosSteps] = useState(false);

  if (mode === "hidden" && !showIosSteps) return null;

  async function install() {
    if (mode === "ios") {
      setShowIosSteps(true);
      return;
    }
    await promptInstall();
    onDone?.();
  }

  return (
    <>
      {variant === "listItem" ? (
        <ListItemButton onClick={install}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <InstallMobileIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Instalar app" />
        </ListItemButton>
      ) : (
        <Button size="small" variant="outlined" startIcon={<InstallMobileIcon />} onClick={install}>
          Instalar app
        </Button>
      )}

      <Dialog
        open={showIosSteps}
        onClose={() => {
          setShowIosSteps(false);
          onDone?.();
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Adicionar ao ecrã principal</DialogTitle>
        <DialogContent>
          <Box component="ol" sx={{ listStyle: "none", p: 0, m: 0, display: "grid", gap: 2 }}>
            {IOS_STEPS.map((step, index) => (
              <Box component="li" key={index} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                <Box sx={{ display: "flex", pt: 0.25 }}>{step.icon}</Box>
                <Typography variant="body2">
                  {index + 1}. {step.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowIosSteps(false);
              onDone?.();
            }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
