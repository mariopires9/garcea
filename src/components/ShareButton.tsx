"use client";

import { useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import ShareIcon from "@mui/icons-material/Share";
import CloseIcon from "@mui/icons-material/Close";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import XIcon from "@mui/icons-material/X";
import EmailIcon from "@mui/icons-material/Email";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

type ShareOption = {
  label: string;
  icon: ReactNode;
  background: string;
  href?: string;
  onClick?: () => void;
};

/**
 * "Partilhar" button. On phones (and browsers that support it) it opens the
 * system share sheet, with every app the user has installed. Elsewhere it
 * opens a dialog with WhatsApp, Facebook, Instagram, X, email and
 * copy-link. Plain share URLs, so no third-party scripts; previews come from
 * the Open Graph tags.
 */
export function ShareButton({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  async function share() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        // The user closed the share sheet: nothing more to do.
        if (error instanceof DOMException && error.name === "AbortError") return;
        // Any other failure: fall back to our own dialog.
      }
    }
    setOpen(true);
  }

  async function copyLink(successText = "Link copiado.") {
    setOpen(false);
    try {
      await navigator.clipboard.writeText(url);
      setMessage({ text: successText, ok: true });
      return true;
    } catch {
      setMessage({ text: "Não foi possível copiar o link.", ok: false });
      return false;
    }
  }

  // Instagram has no web "share this link" URL, so copy the link and open
  // Instagram's messages for the user to paste it. (On phones the system
  // share sheet already lists the Instagram app.)
  async function shareToInstagram() {
    // Copy first: once the new tab has focus the clipboard write would fail.
    await copyLink("Link copiado. Cole-o numa mensagem ou story do Instagram.");
    window.open("https://www.instagram.com/direct/inbox/", "_blank", "noopener,noreferrer");
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const options: ShareOption[] = [
    {
      label: "WhatsApp",
      icon: <WhatsAppIcon fontSize="large" />,
      background: "#25D366",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    },
    {
      label: "Facebook",
      icon: <FacebookIcon fontSize="large" />,
      background: "#1877F2",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "Instagram",
      icon: <InstagramIcon fontSize="large" />,
      background: "linear-gradient(45deg, #F58529, #DD2A7B 50%, #8134AF)",
      onClick: shareToInstagram,
    },
    {
      label: "X",
      icon: <XIcon fontSize="large" />,
      background: "#000",
      href: `https://x.com/intent/post?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      label: "Email",
      icon: <EmailIcon fontSize="large" />,
      background: "#6B7280",
      href: `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`${title}\n${url}`)}`,
    },
    {
      label: "Copiar link",
      icon: <ContentCopyIcon fontSize="large" />,
      background: "#374151",
      onClick: () => copyLink(),
    },
  ];

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<ShareIcon />}
        onClick={share}
        sx={{ alignSelf: "flex-start" }}
      >
        Partilhar
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ pr: 6 }}>Partilhar evento</DialogTitle>
        <IconButton
          aria-label="Fechar"
          onClick={() => setOpen(false)}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(5rem, 1fr))",
              gap: 2,
            }}
          >
            {options.map((option) => (
              <ButtonBase
                key={option.label}
                {...(option.href
                  ? {
                      component: "a",
                      href: option.href,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      onClick: () => setOpen(false),
                    }
                  : { onClick: option.onClick })}
                sx={{
                  flexDirection: "column",
                  gap: 1,
                  p: 1,
                  borderRadius: 2,
                  "&:hover, &.Mui-focusVisible": { bgcolor: "action.hover" },
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    background: option.background,
                  }}
                >
                  {option.icon}
                </Box>
                <Typography variant="body2">{option.label}</Typography>
              </ButtonBase>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={Boolean(message)}
        autoHideDuration={3000}
        onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={message?.ok ? "success" : "error"} variant="filled">
          {message?.text}
        </Alert>
      </Snackbar>
    </>
  );
}
