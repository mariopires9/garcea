"use client";

import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import MenuIcon from "@mui/icons-material/Menu";
import { SignOutButton } from "@/components/SignOutButton";

type NavLink = { href: string; label: string };

export function NavMobileMenu({
  links,
  isLoggedIn,
}: {
  links: NavLink[];
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        aria-label="Abrir menu"
        color="inherit"
        onClick={() => setOpen(true)}
        sx={{ display: { xs: "inline-flex", md: "none" } }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        {/* Just wide enough for the longest label ("Contactos"). */}
        <Box sx={{ width: 200 }} role="presentation">
          <List>
            {links.map((link) => (
              <ListItemButton
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
              >
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <List>
            {isLoggedIn ? (
              <>
                <ListItemButton href="/manage" onClick={() => setOpen(false)}>
                  <ListItemText primary="Gestão" />
                </ListItemButton>
                <SignOutButton display="listItem" />
              </>
            ) : (
              <ListItemButton href="/login" onClick={() => setOpen(false)}>
                <ListItemText primary="Entrar" />
              </ListItemButton>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
