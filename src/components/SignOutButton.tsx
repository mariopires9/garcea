"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Button, { type ButtonProps } from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

/**
 * "Sair": signs out through Auth.js's /api/auth/signout endpoint and then
 * loads the home page from scratch (window.location), instead of a server
 * action that re-renders the current page in place. Browser extensions that
 * inject elements into the header (password managers, translators...) made
 * that in-place update fail with "This page couldn't load".
 */
export function SignOutButton({
  display = "button",
  ...buttonProps
}: { display?: "button" | "listItem" } & Omit<ButtonProps, "onClick" | "children">) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      await signOut({ redirectTo: "/" });
    } catch (error) {
      console.error("Sign out failed:", error);
      setPending(false);
    }
  }

  if (display === "listItem") {
    return (
      <ListItemButton onClick={handleClick} disabled={pending}>
        <ListItemText primary={pending ? "A sair..." : "Sair"} />
      </ListItemButton>
    );
  }

  return (
    <Button
      {...buttonProps}
      onClick={handleClick}
      disabled={pending || buttonProps.disabled}
      startIcon={pending ? <CircularProgress size={16} color="inherit" /> : buttonProps.startIcon}
    >
      Sair
    </Button>
  );
}
